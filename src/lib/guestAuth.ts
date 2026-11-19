import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type GuestProfile = {
  id: string;
  display_name: string;
};

export async function getCurrentGuestSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function loadGuestProfile(userId: string): Promise<GuestProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveGuestProfile(userId: string, displayName: string): Promise<GuestProfile> {
  const name = displayName.trim();
  if (!name || name.length > 60) throw new Error('Display name must be 1–60 characters.');
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, display_name: name }, { onConflict: 'id' })
    .select('id, display_name')
    .single();
  if (error) throw error;
  return data;
}