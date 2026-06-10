import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { translateTitle, translateGenre } from '@/utils/songTranslations';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { allVideos } from '@/data/videosData';
import { allSongs as allLyricsSongs } from '@/data/lyricsSongs';
import { allSongs as allSongsPageSongs } from '@/pages/SongsPage';
import { allSongs as allMelodiesSongs } from '@/pages/MelodiesPage';
import { Video, Music, FileText, Disc, Layers } from 'lucide-react';

// ─── Floating Notes (Background) ─────────────────────────────────────────────
const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♮', '♯', '𝄡', '♬', '♪', '♫', '♩'];

const FloatingNotes = () => {
  const items = Array.from({ length: 24 }, (_, i) => ({
    note: NOTES[i % NOTES.length],
    left: (i * 11 + 5) % 96,
    size: 30 + ((i * 9) % 36),
    duration: 8 + ((i * 3) % 9),
    delay: (i * 1.1) % 7,
  }));
  return (
    <div aria-hidden="true" className="floating-notes-layer">
      {items.map(({ note, left, size, duration, delay }, i) => (
        <span
          key={i}
          className="floating-note"
          style={{
            left: `${left}%`,
            top: '110%',
            fontSize: `${size}px`,
            animationDuration: `${duration}s`,
            animationDelay: `${delay}s`,
          }}
        >
          {note}
        </span>
      ))}
    </div>
  );
};

// ─── Predefined Categories & Matchers (Sequential Matching) ─────────────────
const SONG_CATEGORIES = [
  { key: 'islamic', ar: 'إسلامي', en: 'Islamic', match: (c: string) => /islamic|إسلامي/i.test(c), order: 1 },
  { key: 'patriotic', ar: 'وطني', en: 'Patriotic', match: (c: string) => /patriotic|وطني/i.test(c), order: 2 },
  { key: 'social', ar: 'إجتماعي & عائلي', en: 'Social & Family', match: (c: string) => /social|family|اجتماعي|عائلي/i.test(c), order: 3 },
  { key: 'occasion', ar: 'مناسبات و أعياد', en: 'Occasion & Holiday', match: (c: string) => /occasion|holiday|مناسبات|أعياد/i.test(c), order: 4 },
  { key: 'motivational', ar: 'تحفيزية', en: 'Motivational', match: (c: string) => /motivational|تحفيزية|تحفيز/i.test(c), order: 5 },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c: string) => /poems|قصائد|قصيدة/i.test(c), order: 6 },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c: string) => /classic|كلاسيك/i.test(c), order: 7 },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c: string) => /drama|دراما/i.test(c), order: 8 },
  { key: 'slow', ar: 'سلو', en: 'Slow', match: (c: string) => /slow|سلو/i.test(c), order: 9 },
  { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c: string) => /romantic|رومانسي/i.test(c) && !/maqsum|مقسوم/i.test(c), order: 10 },
  { key: 'romantic_maqsum', ar: 'رومانسي & مقسوم', en: 'Romantic & Maqsum', match: (c: string) => /romantic.*maqsum|رومانسي.*مقسوم/i.test(c), order: 11 },
  { key: 'pop', ar: 'بوب', en: 'Pop', match: (c: string) => /pop|بوب/i.test(c), order: 12 },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c: string) => /rock|روك/i.test(c), order: 13 },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c: string) => /maqsum|مقسوم/i.test(c) && !/romantic|رومانسي/i.test(c), order: 14 },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c: string) => /tarab|طرب/i.test(c), order: 15 },
  { key: 'shaabi', ar: 'شعبي', en: 'Shaabi', match: (c: string) => /shaabi|شعبي/i.test(c), order: 16 },
  { key: 'saidi', ar: 'صعيدي', en: "Sa'idi", match: (c: string) => /sa'idi|saidi|صعيدي/i.test(c), order: 17 },
  { key: 'rap', ar: 'راب', en: 'Rap', match: (c: string) => /rap|راب/i.test(c) && !/trap|تراب/i.test(c), order: 18 },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c: string) => /trap|تراب/i.test(c), order: 19 },
];

const getSongCategory = (genre: string): { key: string; ar: string; en: string } => {
  const clean = (genre || '').trim();
  const matched = SONG_CATEGORIES.find((c) => c.match(clean));
  return matched || { key: 'romantic_maqsum', ar: 'رومانسي & مقسوم', en: 'Romantic & Maqsum' };
};

const AboutContentPage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [activeGenreFilter, setActiveGenreFilter] = useState('all');

  // 1. Gather all items from the 4 modules dynamically
  const mergedItems = useMemo(() => {
    const list: any[] = [];

    // Videos module
    allVideos.forEach((v) => {
      list.push({
        id: v.id,
        title: v.title,
        genre: (v.category || '').trim(),
        module: 'videos',
        moduleAr: 'فيديوهات',
        moduleEn: 'Videos',
        icon: Video,
        route: `/videos?id=${v.id}`,
      });
    });

    // Songs module
    allSongsPageSongs.forEach((s) => {
      list.push({
        id: s.id,
        title: s.title,
        genre: (s.type || '').trim(),
        module: 'songs',
        moduleAr: 'أغاني',
        moduleEn: 'Songs',
        icon: Music,
        route: `/songs?id=${s.id}`,
      });
    });

    // Melodies module
    allMelodiesSongs.forEach((m) => {
      list.push({
        id: m.id,
        title: m.title,
        genre: (m.type || '').trim(),
        module: 'melodies',
        moduleAr: 'ألحان',
        moduleEn: 'Melodies',
        icon: Disc,
        route: `/melodies?id=${m.id}`,
      });
    });

    // Lyrics module
    allLyricsSongs.forEach((l) => {
      list.push({
        id: l.id,
        title: l.title,
        genre: (l.type || '').trim(),
        module: 'lyrics',
        moduleAr: 'كلمات',
        moduleEn: 'Lyrics',
        icon: FileText,
        route: `/lyrics?id=${l.id}`,
      });
    });

    return list;
  }, []);

  // 2. Filter & Normalize matching for search query
  const filteredItems = useMemo(() => {
    const q = normalizeArabic(search);
    return mergedItems.filter((item) => {
      if (!q) return true;
      const translatedTitleStr = translateTitle(item.title, lang);
      const categoryObj = getSongCategory(item.genre);
      const translatedGenreStr = lang === 'en' ? categoryObj.en : categoryObj.ar;
      const hay = [
        item.title,
        translatedTitleStr,
        item.genre,
        translatedGenreStr,
        item.moduleAr,
        item.moduleEn,
      ].join(' ');
      return normalizeArabic(hay).includes(q);
    });
  }, [mergedItems, search, lang]);

  // Group filtered items uniquely by target categories
  const groupedData = useMemo(() => {
    const groupsMap = new Map<string, { key: string; ar: string; en: string; items: any[] }>();

    // Initialize groups in strict order
    SONG_CATEGORIES.forEach((cat) => {
      groupsMap.set(cat.key, { key: cat.key, ar: cat.ar, en: cat.en, items: [] });
    });

    // Distribute items uniquely
    filteredItems.forEach((item) => {
      const cat = getSongCategory(item.genre);
      groupsMap.get(cat.key)?.items.push(item);
    });

    // Filter out groups with 0 items
    return Array.from(groupsMap.values()).filter((g) => g.items.length > 0);
  }, [filteredItems]);

  // Determine active category options dynamically based on present data
  const availableCategories = useMemo(() => {
    const activeKeys = new Set<string>();
    mergedItems.forEach((item) => {
      const cat = getSongCategory(item.genre);
      activeKeys.add(cat.key);
    });

    return SONG_CATEGORIES.filter((c) => activeKeys.has(c.key));
  }, [mergedItems]);

  // Finally filter by selected genre button
  const displayedGroups = useMemo(() => {
    if (activeGenreFilter === 'all') return groupedData;
    return groupedData.filter((g) => g.key === activeGenreFilter);
  }, [groupedData, activeGenreFilter]);

  const handleRowClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className={`min-h-screen pb-24 relative ${isDark ? 'bg-[#1a0508]' : 'bg-[#fff5f5]'} transition-colors duration-500`}>
      <style>{`
        .floating-notes-layer {
          position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
        }
        .floating-note {
          position: absolute; user-select: none;
          color: rgba(201, 168, 76, 0.22);
          font-family: 'Aref Ruqaa Ink', serif;
          animation-name: floatNote;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes floatNote {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.6; }
          85%  { opacity: 0.45; }
          100% { transform: translateY(-125vh) rotate(25deg); opacity: 0; }
        }

        .unified-header-box {
          background: #000000;
          border: 1px solid rgba(201, 168, 76, 0.35);
          border-radius: 20px;
          padding: 30px 40px;
          max-width: 800px;
          margin: 40px auto 30px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(201, 168, 76, 0.08);
          position: relative;
          z-index: 10;
        }
        .unified-header-title {
          font-family: 'Aref Ruqaa Ink', 'Cinzel', serif !important;
          font-size: clamp(28px, 5vw, 42px) !important;
          font-weight: 800;
          color: #c9a84c;
          margin-bottom: 12px;
          text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.9);
        }
        .unified-header-subtitle {
          font-family: 'DG Rafah', sans-serif !important;
          font-size: clamp(14px, 3vw, 17px) !important;
          color: #e8d5b0;
          opacity: 0.9;
          line-height: 1.6;
        }

        .content-layer {
          position: relative;
          z-index: 10;
        }

        .song-title-cell {
          font-family: 'Aref Ruqaa Ink', 'Cinzel', serif !important;
          font-weight: bold !important;
          color: ${isDark ? '#ff4d4d' : '#c0272d'} !important;
          font-size: 1.3rem;
        }

        .table-card {
          background: ${isDark ? 'rgba(26, 5, 8, 0.65)' : 'rgba(255, 255, 255, 0.9)'};
          border: 1px solid ${isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(192, 39, 45, 0.15)'};
          backdrop-blur: 12px;
          border-radius: 16px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
          overflow: hidden;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }

        .table-card:hover {
          border-color: ${isDark ? 'rgba(201, 168, 76, 0.4)' : 'rgba(192, 39, 45, 0.3)'};
        }

        .custom-table {
          width: 100%;
          border-collapse: collapse;
          text-align: right;
        }

        .lang-en .custom-table {
          text-align: left;
        }

        .custom-table th {
          background: ${isDark ? 'rgba(201, 168, 76, 0.08)' : 'rgba(192, 39, 45, 0.05)'};
          color: ${isDark ? '#c9a84c' : '#c0272d'};
          padding: 14px 18px;
          font-weight: 700;
          border-bottom: 2px solid ${isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(192, 39, 45, 0.15)'};
          font-size: 0.95rem;
        }

        .custom-table td {
          padding: 12px 18px;
          border-bottom: 1px solid ${isDark ? 'rgba(201, 168, 76, 0.1)' : 'rgba(192, 39, 45, 0.08)'};
          color: ${isDark ? '#e0cc96' : '#2b1a1c'};
          font-size: 0.95rem;
        }

        .custom-table tr:last-child td {
          border-bottom: none;
        }

        .custom-table tr {
          transition: background-color 0.2s ease, transform 0.2s ease;
          cursor: pointer;
        }

        .custom-table tr:hover {
          background: ${isDark ? 'rgba(201, 168, 76, 0.04)' : 'rgba(192, 39, 45, 0.03)'};
        }

        .source-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .badge-videos {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #ef4444;
        }

        .badge-songs {
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
        }

        .badge-melodies {
          background: rgba(168, 85, 247, 0.12);
          border: 1px solid rgba(168, 85, 247, 0.3);
          color: #a855f7;
        }

        .badge-lyrics {
          background: rgba(16, 185, 129, 0.12);
          border: 1px solid rgba(16, 185, 129, 0.3);
          color: #10b981;
        }

        .badge-genre {
          display: inline-block;
          padding: 3px 8px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 500;
          background: ${isDark ? 'rgba(201, 168, 76, 0.1)' : 'rgba(192, 39, 45, 0.05)'};
          color: ${isDark ? '#c9a84c' : '#c0272d'};
          border: 1px solid ${isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(192, 39, 45, 0.1)'};
        }

        .genre-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid ${isDark ? 'rgba(201, 168, 76, 0.15)' : 'rgba(192, 39, 45, 0.1)'};
        }

        .genre-title {
          font-size: 1.25rem;
          font-weight: bold;
          color: ${isDark ? '#c9a84c' : '#c0272d'};
          font-family: 'DG Rafah', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .genre-count {
          font-size: 0.85rem;
          color: ${isDark ? 'rgba(201, 168, 76, 0.6)' : 'rgba(0, 0, 0, 0.5)'};
        }

        .click-action-text {
          font-size: 0.8rem;
          color: ${isDark ? '#c9a84c' : '#c0272d'};
          opacity: 0.7;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }

        .custom-table tr:hover .click-action-text {
          opacity: 1;
          text-decoration: underline;
        }
      `}</style>

      {/* Floating Notes background animation */}
      <FloatingNotes />

      <div className={`content-layer ${lang === 'en' ? 'lang-en' : ''}`}>
        {/* Styled Container Header Section matching Lyrics/Melodies pages */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-4">
          <div className="unified-header-box animate-fade-in-up">
            <h1 className="unified-header-title">
              {t('ABOUT CONTENT', 'عن المحتوى')}
            </h1>
            <p className="unified-header-subtitle">
              {t(
                'A centralized index of all artistic work sorted and classified by musical style and genre',
                'فهرس مركزي لجميع الأعمال الفنية مرتبة ومصنفة حسب الطابع الموسيقي والنوع'
              )}
            </p>
          </div>
        </div>

        {/* Filters and Search Bar Container */}
        <div className="container mx-auto px-4 max-w-5xl mt-6 mb-12">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('Search by song title or genre...', 'ابحث عن أغنية أو نوع موسيقي...')}
            className="mb-5"
          />

          {/* Genre Filters list */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }} className="mb-4">
            <button
              type="button"
              className={`filter-chip ${activeGenreFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveGenreFilter('all')}
            >
              {t('All Styles', 'كل الأنواع')}
            </button>
            {availableCategories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                className={`filter-chip ${activeGenreFilter === cat.key ? 'active' : ''}`}
                onClick={() => setActiveGenreFilter(cat.key)}
              >
                {lang === 'en' ? cat.en : cat.ar}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', color: '#c9a84c', fontSize: 13 }}>
            {t('Found', 'تم العثور على')}: {filteredItems.length} {t('items', 'أعمال')}
          </div>
        </div>

        {/* Dynamic Tables Grouped by Genre */}
        <div className="container mx-auto px-4 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {displayedGroups.length > 0 ? (
            displayedGroups.map((group) => {
              const IconComponent = Layers;
              return (
                <div key={group.key} className="mb-10">
                  <div className="genre-header">
                    <div className="genre-title">
                      <IconComponent className="w-5 h-5 text-[#c9a84c]" />
                      <span>{lang === 'en' ? group.en : group.ar}</span>
                    </div>
                    <div className="genre-count">
                      {group.items.length} {t('tracks', 'أعمال')}
                    </div>
                  </div>

                  <div className="table-card">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>#</th>
                          <th>{t('Title', 'العنوان')}</th>
                          <th style={{ width: '180px' }}>{t('Category', 'القسم الفني')}</th>
                          <th style={{ width: '150px' }} className="hidden sm:table-cell">
                            {t('Genre', 'الطابع الموسيقي')}
                          </th>
                          <th style={{ width: '160px', textAlign: lang === 'en' ? 'right' : 'left' }}>
                            {t('Action', 'الإجراء')}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.items.map((item, idx) => {
                          const SourceIcon = item.icon;
                          return (
                            <tr key={`${item.module}-${item.id}`} onClick={() => handleRowClick(item.route)}>
                              <td style={{ fontWeight: 'bold' }}>{idx + 1}</td>
                              <td className="song-title-cell">{translateTitle(item.title, lang)}</td>
                              <td>
                                <span className={`source-badge badge-${item.module}`}>
                                  <SourceIcon className="w-3.5 h-3.5" />
                                  <span>{lang === 'en' ? item.moduleEn : item.moduleAr}</span>
                                </span>
                              </td>
                              <td className="hidden sm:table-cell">
                                <span className="badge-genre">
                                  {lang === 'en' ? group.en : group.ar}
                                </span>
                              </td>
                              <td style={{ textAlign: lang === 'en' ? 'right' : 'left' }}>
                                <span className="click-action-text">
                                  {t('View details', 'عرض التفاصيل')} &rarr;
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16" style={{ color: isDark ? '#c9a84c' : '#c0272d', opacity: 0.7 }}>
              {t('No matching content found.', 'لا توجد نتائج مطابقة للبحث.')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutContentPage;
