import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { loadGuestProfile, type GuestProfile } from '@/lib/guestAuth';

type GuestAuthState = {
  user: User | null;
  profile: GuestProfile | null;
  loading: boolean;
};

export function useGuestAuth() {
  const [state, setState] = useState<GuestAuthState>({ user: null, profile: null, loading: true });

  useEffect(() => {
    let active = true;
    let revision = 0;
    const syncSession = async (user: User | null) => {
      const currentRevision = ++revision;
      try {
        const profile = user ? await loadGuestProfile(user.id) : null;
        if (active && revision === currentRevision) {
          setState({ user, profile, loading: false });
        }
      } catch {
        if (active && revision === currentRevision) {
          setState({ user, profile: null, loading: false });
        }
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session?.user ?? null);
    });
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!error) void syncSession(data.session?.user ?? null);
      else if (active) setState({ user: null, profile: null, loading: false });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return state;
}