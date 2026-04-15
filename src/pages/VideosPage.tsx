import { useLang } from '@/contexts/LangContext';
import { Search, Film } from 'lucide-react';
import { useState } from 'react';

const VideosPage = () => {
  const { t } = useLang();
  const [search, setSearch] = useState('');

  return (
    <div className="min-h-screen">
      {/* Cinematic Hero */}
      <div className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <Film className="w-14 h-14 mx-auto mb-4 text-[#c9a84c] opacity-80" />
          <h1
            className="text-4xl sm:text-5xl md:text-6xl font-heading font-bold mb-3"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('VIDEOS', 'فيديوهات')}
          </h1>
          <p className="text-muted-foreground text-lg font-body">
            {t("Watch Mohamed Ramzi's music videos", 'شاهد فيديوهات محمد رمزي الموسيقية')}
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
              placeholder={t('Search videos...', 'بحث في الفيديوهات...')}
              className="w-full pl-11 pr-4 py-3 rounded-full bg-black/30 backdrop-blur-md border border-border/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#c0272d]/50 focus:border-[#c0272d]/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="container mx-auto px-4 max-w-5xl pb-20">
        {/* Empty state */}
        <div className="text-center py-24">
          <p className="text-2xl font-heading text-muted-foreground/60 mb-2">
            ♪ {t('No videos yet — content coming soon', 'لا توجد فيديوهات بعد — المحتوى قادم قريباً')}
          </p>
          <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#c0272d]/40 to-transparent mx-auto mt-6" />
        </div>
      </div>
    </div>
  );
};

export default VideosPage;
