import { Laptop } from 'lucide-react';
import { useLang } from '@/contexts/LangContext';

/**
 * ExperienceBanner
 * A sleek, persistent Charcoal/Gold cyber banner shown on all pages,
 * inviting users to browse from a PC/Laptop for the best experience.
 */
export default function ExperienceBanner() {
  const { t, dir } = useLang();

  return (
    <div
      dir={dir}
      className="fixed bottom-0 left-0 right-0 w-full z-[45] overflow-hidden border-t"
      style={{
        borderColor: 'hsl(var(--gold) / 0.35)',
        background: 'linear-gradient(90deg, rgba(20,5,8,0.96), rgba(40,12,16,0.96), rgba(20,5,8,0.96))',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Shimmer overlay */}
      <div
        className="absolute inset-0 animate-banner-shimmer pointer-events-none"
        style={{
          background:
            'linear-gradient(90deg, transparent, hsl(var(--gold) / 0.12), transparent)',
          backgroundSize: '200% 100%',
        }}
      />
      <div className="relative flex items-center justify-center gap-2 py-2 px-4">
        <Laptop
          className="w-4 h-4 shrink-0 animate-gold-pulse"
          style={{ color: 'hsl(var(--gold))' }}
        />
        <p
          className="text-center text-xs sm:text-sm font-bold font-cairo tracking-wide"
          style={{
            color: 'hsl(var(--gold))',
            textShadow: '0 0 8px hsl(var(--gold) / 0.5)',
          }}
        >
          {t(
            'Browse from PC or Laptop 💻 for the best experience',
            'قم بتصفح الموقع من PC أو Laptop 💻 للاستمتاع بتجربة أفضل'
          )}
        </p>
      </div>
    </div>
  );
}
