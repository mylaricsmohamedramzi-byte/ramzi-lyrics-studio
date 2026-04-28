import { useState, useRef, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';

// 1. ترتيب الفئات كما طلبت (القصائد أولاً ثم الترتيب السابق)
const VIDEO_CATEGORIES: { key: string; ar: string; en: string; match: (c: string) => boolean }[] = [
  { key: 'all', ar: 'الكل', en: 'All', match: () => true },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /poems|قصائد|قصيدة/i.test(c) },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /classic|كلاسيك/i.test(c) },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /tarab|طرب/i.test(c) },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /drama|دراما/i.test(c) },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /maqsum|مقسوم/i.test(c) },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /trap|تراب/i.test(c) },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /rock|روك/i.test(c) },
];

const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢'];

// مكون النوتات الطائرة للكارد
const CardFloatingNotes = ({ seed }: { seed: number }) => {
  const cardItems = Array.from({ length: 10 }, (_, i) => ({
    note: NOTES[(i + seed) % NOTES.length],
    left: (i * 15 + seed * 7) % 95,
    size: 15 + ((i * 5 + seed) % 15),
    duration: 5 + ((i * 2 + seed) % 5),
    delay: ((i * 0.5) + seed * 0.2) % 4,
  }));

  return (
    <div aria-hidden="true" className="card-floating-notes">
      {cardItems.map(({ note, left, size, duration, delay }, i) => (
        <span
          key={`${seed}-${i}`}
          className="card-floating-note"
          style={{
            left: `${left}%`,
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

// ... (دوال getYouTubeVideoId و getVideoSourceType تبقي كما هي)

const allVideos = [ /* بيانات الفيديوهات الخاصة بك */ ];

const VideosPage = () => {
  const { lang } = useLang();
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  // استخراج الأنواع الموجودة فعلياً في الفيديوهات الحالية فقط
  const availableCategories = useMemo(() => {
    const currentCats = new Set(allVideos.map(v => v.category.trim()));
    return VIDEO_CATEGORIES.filter(cat => 
      cat.key === 'all' || Array.from(currentCats).some(c => cat.match(c))
    );
  }, []);

  // ترتيب الفيديوهات بناءً على ترتيب مصفوفة VIDEO_CATEGORIES
  const filteredVideos = useMemo(() => {
    const q = normalizeArabic(search);
    const catObj = VIDEO_CATEGORIES.find((c) => c.key === activeCat) || VIDEO_CATEGORIES[0];
    
    let filtered = allVideos.filter((v) => {
      if (!catObj.match(v.category || '')) return false;
      if (!q) return true;
      const hay = [v.title, v.category, ...(v.lyrics?.map((l) => l.text) || [])].join(' ');
      return normalizeArabic(hay).includes(q);
    });

    return filtered.sort((a, b) => {
      const indexA = VIDEO_CATEGORIES.findIndex(c => c.match(a.category));
      const indexB = VIDEO_CATEGORIES.findIndex(c => c.match(b.category));
      return indexA - indexB;
    });
  }, [search, activeCat]);

  return (
    <div dir="rtl" className="page-container">
      <style>{`
        .page-container { 
          background: #020617; /* لون الخلفية الغامق */
          min-height: 100vh; 
          padding: 40px 20px; 
          position: relative;
          overflow-x: hidden;
        }

        /* تصميم الكارد الجديد */
        .main-card { 
          max-width: 1100px; 
          margin: 0 auto 80px; 
          background-image: url('https://www.transparenttextures.com/patterns/leather.png');
          background-color: rgb(103, 6, 6);
          background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, #000000 100%);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 40px; 
          overflow: hidden; 
          position: relative; 
          box-shadow: 0 30px 60px rgba(0,0,0,0.7); 
        }

        /* منطقة الكلمات بلون مختلف (بني داكن محروق) لتبرز الكلمات الحمراء */
        .lyrics-section-bg {
          background: rgba(20, 10, 10, 0.7); 
          padding: 20px;
          border-radius: 25px;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .line { color: #e2e8f0; font-size: 1.2rem; margin-bottom: 8px; }
        .line.red { color: #ff3333; font-weight: bold; text-shadow: 0 0 10px rgba(255,0,0,0.3); }

        /* النوتات الموسيقية الطائرة داخل الكارد */
        .card-floating-notes { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; overflow: hidden; }
        .card-floating-note { position: absolute; bottom: -50px; color: rgba(201, 168, 76, 0.2); animation: floatUp linear infinite; }
        
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          20% { opacity: 0.4; }
          100% { transform: translateY(-600px) rotate(360deg); opacity: 0; }
        }

        .filter-chip {
          background: rgba(255,255,255,0.05);
          color: #94a3b8;
          border: 1px solid rgba(255,255,255,0.1);
          padding: 8px 20px;
          border-radius: 15px;
          cursor: pointer;
          transition: 0.3s;
        }
        .filter-chip.active { background: #c9a84c; color: #000; font-weight: bold; }
        
        .video-container { position: relative; z-index: 1; }
        .card-content { position: relative; z-index: 1; }
      `}</style>

      {/* شريط البحث والفلاتر الذكية */}
      <div style={{ maxWidth: 1100, margin: '0 auto 30px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث في الفيديوهات..." className="mb-5" />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: '15px' }}>
          {availableCategories.map((c) => (
            <button key={c.key} className={`filter-chip ${activeCat === c.key ? 'active' : ''}`} onClick={() => setActiveCat(c.key)}>
              {lang === 'ar' ? c.ar : c.en}
            </button>
          ))}
        </div>
      </div>

      {filteredVideos.map((video) => (
        <div key={video.id} className="main-card">
          <CardFloatingNotes seed={video.id} />
          
          <div className="card-header" style={{ padding: '25px 40px' }}>
            <span className="song-label" style={{ color: '#aaa' }}>Video Showcase</span>
            <div className="category-badge">{video.category}</div>
          </div>

          <div className="video-container" style={{ padding: '0 40px' }}>
             {/* رندر الفيديو هنا كما في كودك السابق */}
          </div>

          <div className="card-content" style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '30px', padding: '40px' }}>
            <div className="lyrics-section-bg">
              <h2 className="video-title" style={{ color: '#fff', marginBottom: '15px' }}>{video.title}</h2>
              <div className="lyrics-scroll-container" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {video.lyrics?.map((lyric, i) => (
                  <div key={i} className={`line ${lyric.red ? 'red' : ''}`}>{lyric.text}</div>
                ))}
              </div>
            </div>

            <div className="rating-section">
               {/* قسم التقييمات كما هو */}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosPage;
