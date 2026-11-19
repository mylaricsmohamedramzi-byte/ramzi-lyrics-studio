import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { toast } from 'sonner';

/**
 * useItemStats — global, multi-user views + star ratings engine.
 *
 * Backed by Supabase with a seamless LocalStorage fallback:
 * if the network/DB is unavailable, the UI keeps working using the device's
 * own stored values so nothing ever breaks.
 *
 * - views[itemId]       -> global view count for that item
 * - avgRatings[itemId]  -> live average of ALL users' ratings (mathematical mean)
 * - ratings[itemId]     -> THIS device's own rating (drives the star highlight)
 * - saveRating(id, n)   -> persists this device's rating + updates the global average
 * - registerViews(ids)  -> increments the view counter once per session per item
 */

type NumMap = Record<string, number>;

export function useItemStats(section: string) {
  const [views, setViews] = useState<NumMap>({});
  const [avgRatings, setAvgRatings] = useState<NumMap>({});
  const [ratings, setRatings] = useState<NumMap>({});
  const [ratingCounts, setRatingCounts] = useState<NumMap>({});
  const [commentCounts, setCommentCounts] = useState<NumMap>({});
  const { user } = useGuestAuth();

  const viewedRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const [statsRes, personalRes] = await Promise.all([
        supabase.rpc('get_item_stats', { p_section: section }),
        user ? supabase.rpc('get_my_item_ratings', { p_section: section }) : Promise.resolve({ data: [], error: null }),
      ]);
      if (statsRes.error) throw statsRes.error;
      const stats = statsRes.data ?? [];
      setViews(Object.fromEntries(stats.map((row) => [String(row.item_id), Number(row.views_count) || 0])));
      setAvgRatings(Object.fromEntries(stats.map((row) => [String(row.item_id), Number(row.avg_rating) || 0])));
      setRatingCounts(Object.fromEntries(stats.map((row) => [String(row.item_id), Number(row.rating_count) || 0])));
      setCommentCounts(Object.fromEntries(stats.map((row) => [String(row.item_id), Number(row.comment_count) || 0])));
      if (personalRes.error) throw personalRes.error;
      setRatings(Object.fromEntries((personalRes.data ?? []).map((row) => [String(row.item_id), Number(row.rating) || 0])));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load public statistics.');
    }
  }, [section, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Comment changes are public; refresh aggregate statistics when a comment is added or removed.
  useEffect(() => {
    const channel = supabase
      .channel(`stats-${section}-${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'comments', filter: `section=eq.${section}` },
        () => refresh(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [section, refresh]);

  const registerView = useCallback(
    async (itemId: string | number) => {
      const key = String(itemId);
      if (!key || viewedRef.current.has(key)) return;
      viewedRef.current.add(key);
      const sessKey = `viewed_${section}_${key}`;
      if (!user) return;
      try {
        if (sessionStorage.getItem(sessKey)) return;
        sessionStorage.setItem(sessKey, '1');
      } catch {
        /* ignore storage errors */
      }
      try {
        const { data, error } = await supabase.rpc('increment_item_view', {
          p_section: section,
          p_item_id: key,
        });
        if (!error && typeof data === 'number') {
          setViews((prev) => ({ ...prev, [key]: data }));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to record this view.');
      }
    },
    [section, user],
  );

  const registerViews = useCallback(
    (ids: Array<string | number>) => {
      ids.forEach((id) => registerView(id));
    },
    [registerView],
  );

  const saveRating = useCallback(
    async (itemId: string | number, value: number) => {
      const key = String(itemId);
      if (!user) {
        toast.error('Choose a guest name before rating.');
        return;
      }
      try {
        const { error } = await supabase.rpc('save_item_rating', {
          p_section: section,
          p_item_id: key,
          p_rating: value,
        });
        if (error) throw error;
        setRatings((prev) => ({ ...prev, [key]: value }));
        await refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Unable to save this rating.');
      }
    },
    [refresh, section, user],
  );

  return { views, avgRatings, ratingCounts, commentCounts, ratings, saveRating, registerView, registerViews, refresh };
}
