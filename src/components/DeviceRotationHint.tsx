import { useEffect, useState } from 'react';
import { useLang } from '@/contexts/LangContext';

/**
 * DeviceRotationHint
 * A glowing Charcoal/Gold neon phone that rotates from portrait to landscape,
 * nudging mobile users to rotate their device for a better experience.
 * Visible ONLY on mobile portrait orientation.
 */
export default function DeviceRotationHint() {
  const { t, dir } = useLang();
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)');
    const update = () => setIsPortrait(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!isPortrait) return null;

  return (
    <div
      dir={dir}
      className="block md:hidden fixed bottom-24 left-1/2 -translate-x-1/2 z-[55] pointer-events-none flex flex-col items-center gap-3"
    >
      {/* Rotating neon phone */}
      <div className="animate-rotate-phone">
        <div
          className="animate-gold-pulse w-12 h-20 rounded-[10px] border-2 flex items-center justify-center"
          style={{
            borderColor: 'hsl(var(--gold))',
            background: 'rgba(20, 5, 8, 0.85)',
            boxShadow: '0 0 18px hsl(var(--gold) / 0.6)',
          }}
        >
          {/* Phone speaker notch */}
          <span
            className="absolute -mt-14 w-5 h-1 rounded-full"
            style={{ background: 'hsl(var(--gold))' }}
          />
          {/* Screen */}
          <span
            className="w-8 h-14 rounded-sm"
            style={{ background: 'hsl(var(--gold) / 0.15)', border: '1px solid hsl(var(--gold) / 0.4)' }}
          />
        </div>
      </div>

      {/* Glowing bilingual tooltip */}
      <div
        className="px-4 py-2 rounded-full text-center text-xs font-bold font-cairo whitespace-nowrap animate-gold-pulse"
        style={{
          color: 'hsl(var(--gold))',
          background: 'rgba(20, 5, 8, 0.92)',
          border: '1px solid hsl(var(--gold) / 0.5)',
          textShadow: '0 0 8px hsl(var(--gold) / 0.7)',
        }}
      >
        {t('Rotate for a better experience 📱', 'قم بتدوير الهاتف للاستمتاع بتجربة أفضل 📱')}
      </div>
    </div>
  );
}
