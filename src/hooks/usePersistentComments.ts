import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { toast } from 'sonner';

export type PersistentComment = {
  id: string;
  user_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

type CommentMap = Record<string, PersistentComment[]>;

export function usePersistentComments(section: string) {
  const [comments, setComments] = useState<CommentMap>({});
  const [loading, setLoading] = useState(false);
  const { user, profile } = useGuestAuth();

  const refresh = useCallback(async (itemId?: string | number) => {
    setLoading(true);
    let query = supabase.from('comments').select('id,item_id,user_id,author_name,content,created_at').eq('section', section).order('created_at', { ascending: true });
    if (itemId !== undefined) query = query.eq('item_id', String(itemId));
    const { data, error } = await query;
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setComments((previous) => {
      if (itemId !== undefined) return { ...previous, [String(itemId)]: data ?? [] };
      const grouped: CommentMap = {};
      (data ?? []).forEach((comment) => {
        (grouped[comment.item_id] ??= []).push(comment);
      });
      return grouped;
    });
  }, [section]);

  useEffect(() => {
    void refresh();
    const channel = supabase.channel(`comments-${section}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments', filter: `section=eq.${section}` }, (payload) => {
        const row = (payload.new ?? payload.old) as { item_id?: string } | undefined;
        if (row?.item_id) void refresh(row.item_id);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [refresh, section]);

  const addComment = useCallback(async (itemId: string | number, content: string) => {
    const trimmed = content.trim();
    if (!trimmed || trimmed.length > 2000) {
      toast.error('Comments must be 1–2000 characters.');
      return false;
    }
    if (!user || !profile) {
      toast.error('Choose a guest name before commenting.');
      return false;
    }
    const { error } = await supabase.from('comments').insert({ section, item_id: String(itemId), user_id: user.id, author_name: profile.display_name, content: trimmed });
    if (error) {
      toast.error(error.message);
      return false;
    }
    await refresh(itemId);
    return true;
  }, [profile, refresh, section, user]);

  const editComment = useCallback(async (commentId: string, content: string) => {
    const trimmed = content.trim();
    if (!user || !trimmed || trimmed.length > 2000) return false;
    const { error } = await supabase.from('comments').update({ content: trimmed }).eq('id', commentId).eq('user_id', user.id);
    if (error) { toast.error(error.message); return false; }
    await refresh();
    return true;
  }, [refresh, user]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!user) return false;
    const { error } = await supabase.from('comments').delete().eq('id', commentId).eq('user_id', user.id);
    if (error) { toast.error(error.message); return false; }
    await refresh();
    return true;
  }, [refresh, user]);

  return { comments, loading, refresh, addComment, editComment, deleteComment, userId: user?.id ?? null };
}