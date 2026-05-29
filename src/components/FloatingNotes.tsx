import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const SYMBOLS = [
  '♩','♪','♫','♬','𝄞','𝄢','♭','♮','♯','𝄡',
  '♬','♪','♫','♩','♫','♬','♩','𝄞',
];

// Deterministic layout — no re-render shuffle, no Math.random()
const ITEMS = SYMBOLS.map((sym, i) => ({
  sym,
  left: ((i * 23 + 7) % 97) + 1.5,
  size: 22 + ((i * 11) % 30),
  duration: 14 + ((i * 5) % 12),
  delay: -(((i * 4.3) % 18)),
}));

/**
 * FireyBackground (upgraded from FloatingNotes)
 * Global ambient musical symbols layer — rendered fixed behind ALL pages.
 * 
 * Performance contracts:
 *   Desktop : 18 symbols, opacity ~0.55 dark / ~0.35 light
 *   Mobile  : first 10 only visible (CSS nth-child), opacity reduced
 *   Reduced-motion: all hidden via CSS media query
 */
const FloatingNotes = () => {
  const { isDark } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Defer mount so it never blocks LCP
  useEffect(() => {
    const id = requestIdleCallback
      ? requestIdleCallback(() => setMounted(true), { timeout: 2000 })
      : setTimeout(() => setMounted(true), 500) as unknown as number;
    return () => {
      if (requestIdleCallback) cancelIdleCallback(id as number);
      else clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
    };
  }, []);

  if (!mounted) return null;

  const color = isDark ? 'rgba(255,60,0,0.55)' : 'rgba(180,110,0,0.38)';
  const glow  = isDark
    ? 'drop-shadow(0 0 6px rgba(255,80,0,0.35))'
    : 'drop-shadow(0 0 4px rgba(200,130,0,0.25))';

  return (
    <>
      <div
        aria-hidden="true"
        className="firey-bg-layer"
        style={{
          pointerEvents: 'none',
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          overflow: 'hidden',
        }}
      >
        {ITEMS.map(({ sym, left, size, duration, delay }, i) => (
          <span
            key={i}
            className={i >= 10 ? 'firey-note firey-note-lg' : 'firey-note'}
            style={{
              position: 'absolute',
              left: `${left}%`,
              top: '108%',
              fontSize: `${size}px`,
              color,
              filter: glow,
              animationName: 'fireyFloat',
              animationDuration: `${duration}s`,
              animationDelay: `${delay}s`,
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationFillMode: 'both',
              willChange: 'transform, opacity',
              userSelect: 'none',
            }}
          >
            {sym}
          </span>
        ))}
      </div>

      <style>{`
        @keyframes fireyFloat {
          0%   { transform: translateY(0) rotate(0deg);    opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(-115vh) rotate(360deg); opacity: 0; }
        }

        /* Mobile: hide extra notes and reduce opacity */
        @media (max-width: 639px) {
          .firey-note-lg   { display: none !important; }
          .firey-note      { opacity: 0.6 !important; }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .firey-note, .firey-note-lg { display: none !important; }
        }
      `}</style>
    </>
  );
};

export default FloatingNotes;
