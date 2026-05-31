-- Global views + ratings engine (public, no auth required)

CREATE TABLE public.item_views (
  section text NOT NULL,
  item_id text NOT NULL,
  views_count integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (section, item_id)
);

CREATE TABLE public.item_ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section text NOT NULL,
  item_id text NOT NULL,
  rater text NOT NULL,
  rating integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (section, item_id, rater)
);

-- Public read-only view of aggregated rating averages
CREATE VIEW public.item_rating_avg
WITH (security_invoker = on) AS
  SELECT section, item_id,
         ROUND(AVG(rating)::numeric, 2) AS avg_rating,
         COUNT(*)::int AS rating_count
  FROM public.item_ratings
  GROUP BY section, item_id;

-- Grants: fully public site, anon may read everything; writes happen via RPC
GRANT SELECT ON public.item_views TO anon, authenticated;
GRANT ALL ON public.item_views TO service_role;
GRANT SELECT ON public.item_ratings TO anon, authenticated;
GRANT ALL ON public.item_ratings TO service_role;
GRANT SELECT ON public.item_rating_avg TO anon, authenticated;

ALTER TABLE public.item_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.item_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read views" ON public.item_views FOR SELECT USING (true);
CREATE POLICY "Public can read ratings" ON public.item_ratings FOR SELECT USING (true);

-- RPC: increment a single item's view counter, returns new total
CREATE OR REPLACE FUNCTION public.increment_item_view(p_section text, p_item_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.item_views (section, item_id, views_count, updated_at)
  VALUES (p_section, p_item_id, 1, now())
  ON CONFLICT (section, item_id)
  DO UPDATE SET views_count = public.item_views.views_count + 1, updated_at = now()
  RETURNING views_count INTO new_count;
  RETURN new_count;
END;
$$;

-- RPC: upsert a rater's rating, returns the new average for the item
CREATE OR REPLACE FUNCTION public.set_item_rating(p_section text, p_item_id text, p_rater text, p_rating integer)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_avg numeric;
BEGIN
  IF p_rating < 1 OR p_rating > 5 THEN
    RAISE EXCEPTION 'rating must be between 1 and 5';
  END IF;
  INSERT INTO public.item_ratings (section, item_id, rater, rating)
  VALUES (p_section, p_item_id, p_rater, p_rating)
  ON CONFLICT (section, item_id, rater)
  DO UPDATE SET rating = EXCLUDED.rating, created_at = now();
  SELECT ROUND(AVG(rating)::numeric, 2) INTO new_avg
  FROM public.item_ratings WHERE section = p_section AND item_id = p_item_id;
  RETURN new_avg;
END;
$$;

GRANT EXECUTE ON FUNCTION public.increment_item_view(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_item_rating(text, text, text, integer) TO anon, authenticated;

-- Enable realtime for live multi-user updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_views;
ALTER PUBLICATION supabase_realtime ADD TABLE public.item_ratings;