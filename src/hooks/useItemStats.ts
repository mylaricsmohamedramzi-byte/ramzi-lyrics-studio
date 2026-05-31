import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';

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

function getRaterId(): string {
  try {
    let id = localStorage.getItem('rater_id');
    if (!id) {
      id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `r_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem('rater_id', id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

export function useItemStats(section: string) {
  const [views, setViews] = useState<NumMap>({});
  const [avgRatings, setAvgRatings] = useState<NumMap>({});
  const [ratings, setRatings] = useState<NumMap>(() => {
    try {
      return JSON.parse(localStorage.getItem(`${section}_ratings`) || '{}');
    } catch {
      return {};
    }
  });

  const viewedRef = useRef<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    try {
      const [viewsRes, avgRes] = await Promise.all([
        supabase.from('item_views').select('item_id, views_count').eq('section', section),
        supabase.from('item_rating_avg').select('item_id, avg_rating').eq('section', section),
      ]);
      if (viewsRes.data) {
        setViews(
          Object.fromEntries(viewsRes.data.map((r: any) => [String(r.item_id), Number(r.views_count) || 0])),
        );
      }
      if (avgRes.data) {
        setAvgRatings(
          Object.fromEntries(avgRes.data.map((r: any) => [String(r.item_id), Number(r.avg_rating) || 0])),
        );
      }
    } catch {
      /* Fallback: keep current (LocalStorage / static) values — UI never breaks. */
    }
  }, [section]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Realtime: keep every visitor's counters in sync live.
  useEffect(() => {
    const channel = supabase
      .channel(`stats-${section}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_views', filter: `section=eq.${section}` },
        () => refresh(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'item_ratings', filter: `section=eq.${section}` },
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
      } catch {
        /* Fallback (offline): leave count as-is. */
      }
    },
    [section],
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
      const updated = { ...ratings, [key]: value };
      setRatings(updated);
      try {
        localStorage.setItem(`${section}_ratings`, JSON.stringify(updated));
      } catch {
        /* ignore */
      }
      try {
        const { data, error } = await supabase.rpc('set_item_rating', {
          p_section: section,
          p_item_id: key,
          p_rater: getRaterId(),
          p_rating: value,
        });
        if (!error && data != null) {
          setAvgRatings((prev) => ({ ...prev, [key]: Number(data) }));
        }
      } catch {
        /* Fallback: device rating already saved locally. */
      }
    },
    [ratings, section],
  );

  return { views, avgRatings, ratings, saveRating, registerView, registerViews, refresh };
}
