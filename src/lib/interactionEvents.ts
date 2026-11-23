import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type Subscription = {
  channel: RealtimeChannel;
  listeners: Set<() => void>;
};

const subscriptions = new Map<string, Subscription>();

export function subscribeToInteractionChanges(section: string, listener: () => void) {
  const topic = `public-interactions-${section}`;
  let subscription = subscriptions.get(topic);

  if (!subscription) {
    const listeners = new Set<() => void>();
    const channel = supabase
      .channel(topic, { config: { private: true } })
      .on('broadcast', { event: 'interaction_changed' }, () => {
        listeners.forEach((notify) => notify());
      })
      .subscribe();
    subscription = { channel, listeners };
    subscriptions.set(topic, subscription);
  }

  subscription.listeners.add(listener);
  return () => {
    const current = subscriptions.get(topic);
    if (!current) return;
    current.listeners.delete(listener);
    if (current.listeners.size === 0) {
      subscriptions.delete(topic);
      void supabase.removeChannel(current.channel);
    }
  };
}