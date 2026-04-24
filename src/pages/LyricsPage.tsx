import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PenLine } from 'lucide-react';
import { useState } from 'react';
import SearchBar from '@/components/SearchBar';

const LyricsPage = () => {
  const { t } = useLang();
  const { isDark } = useTheme();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center animate-fade-in-up">
          <PenLine className="w-14 h-14 mx-auto mb-4 text-[#c9a84c] opacity-80" />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('LYRICS', 'كلمات')}
          </h1>
          <p className="text-muted-foreground text-lg font-body">
            {t('Read the complete lyrics of all songs', 'اقرأ كلمات جميع الأغاني')}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="container mx-auto px-4 max-w-5xl -mt-4 mb-12">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={t('Search lyrics...', 'ابحث عن الكلمات...')}
        />
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
          <span className="text-5xl mb-4 block">📝</span>
          <p className="text-xl font-body text-muted-foreground italic">
            {t('♪ No lyrics yet — check back soon', '♪ لا كلمات بعد — تابعنا قريباً')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LyricsPage;
