import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { toast } from 'sonner';

export const REACTION_OPTIONS = ['😍', '🔥', '❤️', '👏', '🎵', '💯', '😢'] as const;
type ReactionSummary = { item_id: string; reaction_type: string; reaction_count: number; user_reacted: boolean };

export function useItemReactions(section: string) {
  const [summary, setSummary] = useState<ReactionSummary[]>([]);
  const { user } = useGuestAuth();

  const refresh = useCallback(async () => {
    const { data, error } = await supabase.rpc('get_item_reaction_stats', { p_section: section });
    if (error) { toast.error(error.message); return; }
    setSummary((data ?? []) as ReactionSummary[]);
  }, [section]);

  useEffect(() => {
    void refresh();
    const channel = supabase.channel(`reactions-${section}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'item_reactions', filter: `section=eq.${section}` }, () => void refresh())
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh, section]);

  const toggleReaction = useCallback(async (itemId: string | number, reaction: string) => {
    if (!user) { toast.error('Choose a guest name to react.'); return; }
    const { data: existing, error: readError } = await supabase.from('item_reactions')
      .select('id').eq('section', section).eq('item_id', String(itemId)).eq('user_id', user.id).eq('reaction_type', reaction).maybeSingle();
    if (readError) { toast.error(readError.message); return; }
    const result = existing
      ? await supabase.from('item_reactions').delete().eq('id', existing.id).eq('user_id', user.id)
      : await supabase.from('item_reactions').insert({ section, item_id: String(itemId), user_id: user.id, reaction_type: reaction });
    if (result.error) { toast.error(result.error.message); return; }
    await refresh();
  }, [refresh, section, user]);

  const getItemReactions = useCallback((itemId: string | number) => summary.filter((row) => row.item_id === String(itemId)), [summary]);

  return { summary, getItemReactions, toggleReaction, refresh };
}