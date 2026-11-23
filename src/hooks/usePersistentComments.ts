import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGuestAuth } from '@/hooks/useGuestAuth';
import { subscribeToInteractionChanges } from '@/lib/interactionEvents';
import { toast } from 'sonner';

export type PersistentComment = {
  id: string;
  item_id: string;
  author_name: string;
  content: string;
  created_at: string;
};

type CommentMap = Record<string, PersistentComment[]>;

export function usePersistentComments(section: string) {
  const [comments, setComments] = useState<CommentMap>({});
  const [ownedCommentIds, setOwnedCommentIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(false);
  const { user, profile } = useGuestAuth();

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [commentsResult, ownedResult] = await Promise.all([
        supabase.from('comments_public').select('id,section,item_id,author_name,content,created_at').eq('section', section).order('created_at', { ascending: true }),
        user ? supabase.rpc('get_my_comment_ids', { p_section: section }) : Promise.resolve({ data: [], error: null }),
      ]);
      if (commentsResult.error) throw commentsResult.error;
      if (ownedResult.error) throw ownedResult.error;
      const rows: PersistentComment[] = (commentsResult.data ?? []).flatMap((row) => {
        if (!row.id || !row.item_id || !row.author_name || !row.content || !row.created_at) return [];
        return [{ id: row.id, item_id: row.item_id, author_name: row.author_name, content: row.content, created_at: row.created_at }];
      });
      const grouped: CommentMap = {};
      rows.forEach((comment) => {
        (grouped[comment.item_id] ??= []).push(comment);
      });
      setComments(grouped);
      setOwnedCommentIds(new Set((ownedResult.data ?? []).map((row) => row.comment_id)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to load comments.');
    } finally {
      setLoading(false);
    }
  }, [section, user]);

  useEffect(() => {
    void refresh();
    return subscribeToInteractionChanges(section, () => void refresh());
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
    await refresh();
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

  return { comments, ownedCommentIds, loading, refresh, addComment, editComment, deleteComment, userId: user?.id ?? null };
}