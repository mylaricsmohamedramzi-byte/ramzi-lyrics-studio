CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL CHECK (char_length(btrim(display_name)) BETWEEN 1 AND 60),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests read own profile" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "Guests create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Guests update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('lyrics', 'songs', 'melodies', 'videos')),
  item_id text NOT NULL CHECK (char_length(item_id) BETWEEN 1 AND 100),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name text NOT NULL,
  content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.comments TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read comments" ON public.comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Guests create own comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Guests update own comments" ON public.comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Guests delete own comments" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS comments_section_item_created_idx ON public.comments (section, item_id, created_at);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments (user_id);

CREATE OR REPLACE FUNCTION public.set_comment_author()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, auth
AS $function$
DECLARE
  saved_name text;
BEGIN
  IF auth.uid() IS NULL OR NEW.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'comment owner must be the authenticated user';
  END IF;
  SELECT display_name INTO saved_name FROM public.profiles WHERE id = NEW.user_id;
  IF saved_name IS NULL THEN
    RAISE EXCEPTION 'save a guest display name before commenting';
  END IF;
  NEW.author_name := saved_name;
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.set_comment_author() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER comments_set_author_before_write
BEFORE INSERT OR UPDATE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.set_comment_author();

CREATE TABLE IF NOT EXISTS public.item_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section text NOT NULL CHECK (section IN ('lyrics', 'songs', 'melodies', 'videos')),
  item_id text NOT NULL CHECK (char_length(item_id) BETWEEN 1 AND 100),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('😍', '🔥', '❤️', '👏', '🎵', '💯', '😢')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section, item_id, user_id, reaction_type)
);
GRANT SELECT, INSERT, DELETE ON public.item_reactions TO authenticated;
GRANT ALL ON public.item_reactions TO service_role;
ALTER TABLE public.item_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Guests read own reactions" ON public.item_reactions FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Guests create own reactions" ON public.item_reactions FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Guests delete own reactions" ON public.item_reactions FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS item_reactions_section_item_idx ON public.item_reactions (section, item_id);

REVOKE ALL ON public.item_views FROM anon, authenticated;
GRANT ALL ON public.item_views TO service_role;
DROP POLICY IF EXISTS "Public can read views" ON public.item_views;
REVOKE ALL ON public.item_ratings FROM anon, authenticated;
GRANT ALL ON public.item_ratings TO service_role;
DROP POLICY IF EXISTS "Public can read ratings" ON public.item_ratings;
REVOKE ALL ON public.item_rating_avg FROM anon, authenticated;
GRANT ALL ON public.item_rating_avg TO service_role;

CREATE OR REPLACE FUNCTION public.get_item_stats(p_section text)
RETURNS TABLE (item_id text, views_count integer, avg_rating numeric, rating_count bigint, comment_count bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  IF p_section NOT IN ('lyrics', 'songs', 'melodies', 'videos') THEN
    RAISE EXCEPTION 'unsupported content section';
  END IF;
  RETURN QUERY
  WITH ids AS (
    SELECT v.item_id FROM public.item_views v WHERE v.section = p_section
    UNION SELECT r.item_id FROM public.item_ratings r WHERE r.section = p_section
    UNION SELECT c.item_id FROM public.comments c WHERE c.section = p_section
  )
  SELECT ids.item_id,
         COALESCE(v.views_count, 0)::integer,
         COALESCE(a.avg_rating, 0)::numeric,
         COALESCE(a.rating_count, 0)::bigint,
         COALESCE(c.comment_count, 0)::bigint
  FROM ids
  LEFT JOIN public.item_views v ON v.section = p_section AND v.item_id = ids.item_id
  LEFT JOIN public.item_rating_avg a ON a.section = p_section AND a.item_id = ids.item_id
  LEFT JOIN LATERAL (
    SELECT count(*)::bigint AS comment_count FROM public.comments cm
    WHERE cm.section = p_section AND cm.item_id = ids.item_id
  ) c ON true;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_item_stats(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_item_stats(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_item_view(p_section text, p_item_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  new_count integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'sign in as a guest to record a view'; END IF;
  IF p_section NOT IN ('lyrics', 'songs', 'melodies', 'videos') OR char_length(p_item_id) NOT BETWEEN 1 AND 100 THEN
    RAISE EXCEPTION 'invalid content reference';
  END IF;
  INSERT INTO public.item_views (section, item_id, views_count, updated_at)
  VALUES (p_section, p_item_id, 1, now())
  ON CONFLICT (section, item_id)
  DO UPDATE SET views_count = public.item_views.views_count + 1, updated_at = now()
  RETURNING views_count INTO new_count;
  RETURN new_count;
END;
$function$;
REVOKE ALL ON FUNCTION public.increment_item_view(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_item_view(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.save_item_rating(p_section text, p_item_id text, p_rating integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'sign in as a guest to rate'; END IF;
  IF p_section NOT IN ('lyrics', 'songs', 'melodies', 'videos') OR char_length(p_item_id) NOT BETWEEN 1 AND 100 OR p_rating NOT BETWEEN 1 AND 5 THEN
    RAISE EXCEPTION 'invalid rating';
  END IF;
  INSERT INTO public.item_ratings (section, item_id, rater, rating)
  VALUES (p_section, p_item_id, auth.uid()::text, p_rating)
  ON CONFLICT (section, item_id, rater)
  DO UPDATE SET rating = EXCLUDED.rating, created_at = now();
END;
$function$;
REVOKE ALL ON FUNCTION public.save_item_rating(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.save_item_rating(text, text, integer) TO authenticated;
REVOKE ALL ON FUNCTION public.set_item_rating(text, text, text, integer) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_my_item_ratings(p_section text)
RETURNS TABLE (item_id text, rating integer)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  IF auth.uid() IS NULL OR p_section NOT IN ('lyrics', 'songs', 'melodies', 'videos') THEN
    RAISE EXCEPTION 'unauthorized or unsupported content section';
  END IF;
  RETURN QUERY SELECT r.item_id, r.rating FROM public.item_ratings r
  WHERE r.section = p_section AND r.rater = auth.uid()::text;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_my_item_ratings(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_item_ratings(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_item_reaction_stats(p_section text)
RETURNS TABLE (item_id text, reaction_type text, reaction_count bigint, user_reacted boolean)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  IF p_section NOT IN ('lyrics', 'songs', 'melodies', 'videos') THEN
    RAISE EXCEPTION 'unsupported content section';
  END IF;
  RETURN QUERY
  SELECT r.item_id, r.reaction_type, count(*)::bigint,
         COALESCE(bool_or(r.user_id = auth.uid()), false)
  FROM public.item_reactions r
  WHERE r.section = p_section
  GROUP BY r.item_id, r.reaction_type;
END;
$function$;
REVOKE ALL ON FUNCTION public.get_item_reaction_stats(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_item_reaction_stats(text) TO anon, authenticated;

DO $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
  END IF;
END;
$function$;