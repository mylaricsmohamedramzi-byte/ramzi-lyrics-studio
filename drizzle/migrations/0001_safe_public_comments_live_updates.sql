REVOKE SELECT ON public.comments FROM anon, authenticated;
GRANT SELECT ON public.comments TO authenticated;
DROP POLICY IF EXISTS "Public can read comments" ON public.comments;
CREATE POLICY "Guests read own comments" ON public.comments FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE VIEW public.comments_public
WITH (security_invoker = false) AS
SELECT id, section, item_id, author_name, content, created_at
FROM public.comments;
GRANT SELECT ON public.comments_public TO anon, authenticated;
GRANT ALL ON public.comments_public TO service_role;

CREATE OR REPLACE FUNCTION public.get_my_comment_ids(p_section text)
RETURNS TABLE (comment_id uuid, item_id text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, auth
AS $function$
BEGIN
  IF auth.uid() IS NULL OR p_section NOT IN ('lyrics', 'songs', 'melodies', 'videos') THEN
    RAISE EXCEPTION 'unauthorized or unsupported content section';
  END IF;
  RETURN QUERY SELECT c.id, c.item_id FROM public.comments c
  WHERE c.section = p_section AND c.user_id = auth.uid();
END;
$function$;
REVOKE ALL ON FUNCTION public.get_my_comment_ids(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_my_comment_ids(text) TO authenticated;

CREATE POLICY "Authenticated guests can receive public interaction notices"
ON realtime.messages FOR SELECT TO authenticated
USING (realtime.topic() LIKE 'public-interactions-%');

CREATE OR REPLACE FUNCTION public.broadcast_interaction_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, realtime
AS $function$
DECLARE
  changed_row record;
BEGIN
  IF TG_OP = 'DELETE' THEN
    changed_row := OLD;
  ELSE
    changed_row := NEW;
  END IF;
  PERFORM realtime.send(
    jsonb_build_object('section', changed_row.section, 'item_id', changed_row.item_id),
    'interaction_changed',
    'public-interactions-' || changed_row.section,
    true
  );
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END;
$function$;
REVOKE ALL ON FUNCTION public.broadcast_interaction_change() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER comments_broadcast_change
AFTER INSERT OR UPDATE OR DELETE ON public.comments
FOR EACH ROW EXECUTE FUNCTION public.broadcast_interaction_change();
CREATE TRIGGER reactions_broadcast_change
AFTER INSERT OR DELETE ON public.item_reactions
FOR EACH ROW EXECUTE FUNCTION public.broadcast_interaction_change();
CREATE TRIGGER ratings_broadcast_change
AFTER INSERT OR UPDATE OR DELETE ON public.item_ratings
FOR EACH ROW EXECUTE FUNCTION public.broadcast_interaction_change();
CREATE TRIGGER views_broadcast_change
AFTER INSERT OR UPDATE OR DELETE ON public.item_views
FOR EACH ROW EXECUTE FUNCTION public.broadcast_interaction_change();