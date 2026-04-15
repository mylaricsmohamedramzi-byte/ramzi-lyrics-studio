import { useLang } from '@/contexts/LangContext';
import { Search, Music, Filter } from 'lucide-react';
import { useState } from 'react';

const genres = [
  { en: 'All', ar: 'الكل' },
  { en: 'Pop', ar: 'بوب' },
  { en: 'Classical', ar: 'كلاسيك' },
  { en: 'Romantic', ar: 'رومانسي' },
  { en: 'Patriotic', ar: 'وطني' },
];

const SongsPage = () => {
  const { t } = useLang();
  const [search, setSearch] = useState('');
  const [activeGenre, setActiveGenre] = useState('All');

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Music className="w-14 h-14 mx-auto mb-4 text-[#c9a84c] opacity-80" />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('SONGS', 'أغاني')}
          </h1>
          <p className="text-muted-foreground text-lg font-body">
            {t("Listen to Mohamed Ramzi's original songs", 'استمع إلى أغاني محمد رمزي الأصلية')}
          </p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="container mx-auto px-4 max-w-5xl -mt-4 mb-8">
        <div className="max-w-md mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('Search songs...', 'بحث في الأغاني...')}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-black/30 backdrop-blur-md border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c0272d]/50 focus:border-[#c0272d]/50 transition-all"
            />
          </div>
        </div>

        {/* Genre filters */}
        <div className="flex flex-wrap justify-center gap-2">
          {genres.map((g) => (
            <button
              key={g.en}
              onClick={() => setActiveGenre(g.en)}
              className={`px-4 py-1.5 rounded-full text-sm font-body transition-all ${
                activeGenre === g.en
                  ? 'bg-[#c0272d] text-white shadow-lg shadow-[#c0272d]/30'
                  : 'bg-black/20 text-muted-foreground hover:bg-black/30 border border-border/20'
              }`}
            >
              {t(g.en, g.ar)}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="container mx-auto px-4 max-w-5xl pb-20">
        {/* Empty state */}
        <div className="text-center py-24">
          <p className="text-2xl font-heading text-muted-foreground/60 mb-2">
            ♪ {t('No songs yet — check back soon', 'لا توجد أغاني بعد — تابعنا قريباً')}
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#c0272d]/40 to-transparent mx-auto mt-6" />
        </div>
      </div>
    </div>
  );
};

export default SongsPage;
