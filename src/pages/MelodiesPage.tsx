import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Search, Music2 } from 'lucide-react';
import { useState } from 'react';

const MelodiesPage = () => {
  const { t } = useLang();
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <Music2 className="w-14 h-14 mx-auto mb-4 text-[#c9a84c] opacity-80" />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('MELODIES', 'ألحان')}
          </h1>
          <p className="text-muted-foreground text-lg font-body">
            {t('Explore original melodies and compositions', 'استكشف الألحان والتأليفات الأصلية')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 max-w-5xl -mt-4 mb-12">
        <div className="max-w-md mx-auto">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search melodies...', 'ابحث عن الألحان...')}
              className="w-full pl-11 pr-4 py-3 rounded-full border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-body"
              style={{
                background: isDark ? 'rgba(20,5,8,0.7)' : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Empty State */}
      <div className="container mx-auto px-4 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <div
          className="text-center py-20 rounded-2xl border border-border/20"
          style={{
            background: isDark ? 'rgba(20,5,8,0.6)' : 'rgba(245,240,235,0.6)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span className="text-5xl mb-4 block">🎶</span>
          <p className="text-xl font-body text-muted-foreground italic">
            {t('♪ No melodies yet — check back soon', '♪ لا ألحان بعد — تابعنا قريباً')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MelodiesPage;
