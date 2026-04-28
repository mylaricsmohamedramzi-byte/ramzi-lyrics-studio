import { useState, useRef, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';

// مكون النوتات الموسيقية الطائرة خلف الصفحة
const FloatingNotes = () => {
  const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '♭', '♯'];
  const floatingItems = Array.from({ length: 20 }, (_, i) => ({
    note: NOTES[i % NOTES.length],
    left: (i * 15 + 5) % 95,
    size: 20 + (i % 30),
    duration: 10 + (i % 10),
    delay: i * 0.5,
  }));

  return (
    <div className="floating-notes-container">
      {floatingItems.map((item, i) => (
        <span
          key={i}
          className="floating-note"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.note}
        </span>
      ))}
    </div>
  );
};

// تعريف التصنيفات والترتيب المطلوب
const CATEGORY_ORDER = [
  'poems',       // قصائد
  'classic',     // كلاسيك
  'drama',       // دراما
  'romantic',    // رومانسي
  'maqsum',      // مقسوم
  'pop',         // بوب
  'rock',        // روك
  'tarab',       // طرب
  'trap',        // تراب
  'shaabi'       // شعبي
];

const ALL_CATEGORIES_CONFIG = [
  { key: 'all', ar: 'الكل', en: 'All', match: () => true },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /قصائد|poems/i.test(c) },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /كلاسيك|classic/i.test(c) },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /دراما|drama/i.test(c) },
  { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c) => /رومانسي|romantic/i.test(c) },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /مقسوم|maqsum/i.test(c) },
  { key: 'pop', ar: 'بوب', en: 'Pop', match: (c) => /بوب|pop/i.test(c) },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /روك|rock/i.test(c) },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /طرب|tarab/i.test(c) },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /تراب|trap/i.test(c) },
];

const allVideos = [
  {
    id: 1,
    title: "عداد الرقان",
    category: "مقسوم",
    videoUrls: ["https://youtu.be/kEgSPLkl0oQ?si=ITml38SiSzPgmF2T"],
    views: "88",
    critics: ["كلمات مُبتكره", "لحن مميز", "أداء قوي", "توزيع ضعيف"],
    lyrics: [
      { text: "أنا هبعت كلمة مهمة من قلبي لقلب حبيبي", red: false },
      { text: "يـ مـقَـفِل عداد الروقان", red: true },
      { text: "اه ي واخد أوسكار فالجمدان", red: true },
      { text: "وبراحتّك خَطي وماتسميش", red: true },
    ],
  },
  {
    id: 2,
    title: "كَيْفَ حَالُكِ؟",
    category: "قصائد",
    videoUrls: ["https://drive.google.com/file/d/1t3l9R8m8oWxm4C31MZQbZKn-iv_F06y2/view?usp=sharing"],
    views: "156",
    critics: ["الكلمات عميقه وقويه", "الفيديو ممتاز"],
    lyrics: [
      { text: "حَبِيبَتِي قَدْ أَتَتْنِي اَلْرِّيِحُ بِمَا لَا أَشْتَهِي", red: false },
      { text: "قَدْ سَأَلْتُ نُجُومَ اَلْلَيلِ عنكِي", red: true },
    ],
  },
  {
    id: 3,
    title: "نبره حزينه",
    category: "دراما",
    videoUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1777259384/%D9%86%D8%A8%D8%B1%D8%A9_%D8%AD%D8%B2%D9%8A%D9%86%D8%A9_gzmks7.mp4"],
    views: "0",
    critics: ["الكلمات دقيقة", "مناسبة لصوت تامر عاشور"],
    lyrics: [
      { text: "جمعتنا صُدفة ف مكان", red: false },
      { text: "وقالت لي بنبرة حزينة إنها ندمانه", red: true },
    ],
  },
  {
    id: 4,
    title: "كلامي واضح",
    category: "تراب",
    videoUrls: ["https://drive.google.com/file/d/1LmDxEar_OOyBdgNOfoW23q6l8kvwrKmK/view?usp=sharing"],
    views: "0",
    critics: ["كلمات قوية", "إيقاع حماسي"],
    lyrics: [
      { text: "الكلمة سيف وكلامي واضح", red: true },
      { text: "أنا عندي طلاقه ف اللسان", red: true },
    ],
  },
  {
    id: 5,
    title: "تِلْكَ السُّلطَانَهْ",
    category: "روك",
    videoUrls: ["https://drive.google.com/file/d/12TWS402XYp6SEZXr5Kn9PdnZW4Y-0Va_/view?usp=sharing"],
    views: "0",
    critics: ["مزج رومانسي وروك", "كلمات فصحى"],
    lyrics: [
      { text: "تِلْكَ الَّتِي شَغَلَتْ أَفْكاَرِي", red: true },
      { text: "طِيلَةَ لَيْلِي وَنَهاري", red: true },
    ],
  },
];

// دالة استخراج ID اليوتيوب
function getYouTubeVideoId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|\/embed\/|v\/))([^?&"'>]+)/);
  return match ? match[1] : null;
}

const VideosPage = () => {
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});

  // 1. استخراج الأنواع الموجودة فقط وترتيبها
  const availableCategories = useMemo(() => {
    const presentKeys = new Set(allVideos.map(v => {
      const found = ALL_CATEGORIES_CONFIG.find(c => c.key !== 'all' && c.match(v.category));
      return found ? found.key : null;
    }));
    
    return ALL_CATEGORIES_CONFIG.filter(c => c.key === 'all' || presentKeys.has(c.key));
  }, []);

  // 2. فلترة وترتيب الفيديوهات
  const filteredVideos = useMemo(() => {
    const q = normalizeArabic(search);
    const catConfig = ALL_CATEGORIES_CONFIG.find(c => c.key === activeCat);

    let result = allVideos.filter(v => {
      const matchesCat = catConfig ? catConfig.match(v.category) : true;
      if (!matchesCat) return false;
      if (!q) return true;
      const hay = [v.title, v.category, ...(v.lyrics?.map(l => l.text) || [])].join(' ');
      return normalizeArabic(hay).includes(q);
    });

    // الترتيب بناءً على CATEGORY_ORDER
    return result.sort((a, b) => {
      const orderA = CATEGORY_ORDER.indexOf(ALL_CATEGORIES_CONFIG.find(c => c.match(a.category))?.key || '');
      const orderB = CATEGORY_ORDER.indexOf(ALL_CATEGORIES_CONFIG.find(c => c.match(b.category))?.key || '');
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });
  }, [search, activeCat]);

  const handleCriticClick = (videoId: number, idx: number) => {
    const key = `${videoId}-${idx}`;
    if (!selectedCritics[key]) {
      setSelectedCritics(prev => ({ ...prev, [key]: Math.floor(Math.random() * 31) + 65 }));
    }
  };

  return (
    <div dir="rtl" className="page-wrapper">
      <FloatingNotes />
      
      <style>{`
        .page-wrapper { 
          background: radial-gradient(circle at center, #0a0f2b 0%, #010416 100%);
          min-height: 100vh; padding: 40px 20px; position: relative; overflow-x: hidden;
        }

        /* النوتات الطائرة */
        .floating-notes-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .floating-note { position: absolute; bottom: -50px; color: rgba(201, 168, 76, 0.2); animation: floatUp linear infinite; }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.5; }
          90% { opacity: 0.5; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        .main-card { 
          max-width: 1000px; margin: 0 auto 60px; 
          background-image: url('https://www.transparenttextures.com/patterns/leather.png');
          background-color: rgb(103, 6, 6);
          background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, #000 100%);
          border-radius: 30px; overflow: hidden; position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8); border: 1px solid rgba(255,255,255,0.1);
        }

        .card-content { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 20px; padding: 30px; }
        
        /* صندوق الكلمات بلون مختلف */
        .lyrics-section { 
          background: rgba(0, 0, 0, 0.4); 
          padding: 25px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(5px);
        }

        .video-title { color: #fff; font-size: 2rem; margin-bottom: 15px; font-family: 'Aref Ruqaa Ink', serif; }
        .line { color: #ddd; font-size: 1.1rem; margin-bottom: 8px; }
        .line.red { color: #ff4d4d; font-weight: bold; text-shadow: 0 0 10px rgba(255,0,0,0.3); }

        .filter-chip {
          padding: 8px 20px; border-radius: 20px; background: rgba(255,255,255,0.05);
          color: #fff; border: 1px solid rgba(255,255,255,0.1); cursor: pointer; transition: 0.3s;
        }
        .filter-chip.active { background: #c9a84c; color: #000; font-weight: bold; }

        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; border-radius: 20px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        
        .critic-item { background: rgba(255,255,255,0.05); padding: 12px; border-radius: 10px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; color: #fff; }
        .critic-percent { color: #c9a84c; font-weight: bold; }
      `}</style>

      {/* البحث والفلترة */}
      <div style={{ maxWidth: 1000, margin: '0 auto 40px', position: 'relative', zIndex: 10 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث في الفيديوهات..." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginTop: 20 }}>
          {availableCategories.map((c) => (
            <button
              key={c.key}
              className={`filter-chip ${activeCat === c.key ? 'active' : ''}`}
              onClick={() => setActiveCat(c.key)}
            >
              {lang === 'ar' ? c.ar : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* قائمة الفيديوهات */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {filteredVideos.map((video) => (
          <div key={video.id} className="main-card">
            <div className="card-content">
              {/* القسم الأيمن: الفيديو والكلمات */}
              <div className="right-col">
                <div className="video-wrapper">
                  {video.videoUrls[0].includes('youtube') ? (
                    <iframe className="video-frame" src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.videoUrls[0])}`} allowFullScreen />
                  ) : (
                    <video className="video-frame" controls src={video.videoUrls[0]} />
                  )}
                </div>
                
                <div className="lyrics-section">
                  <h2 className="video-title">{video.title}</h2>
                  <div style={{ maxHeight: '250px', overflowY: 'auto', paddingLeft: '10px' }}>
                    {video.lyrics?.map((lyric, i) => (
                      <div key={i} className={`line ${lyric.red ? 'red' : ''}`}>{lyric.text}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* القسم الأيسر: التقييمات */}
              <div className="rating-section">
                <h4 style={{ color: '#c9a84c', marginBottom: '15px' }}>آراء النقاد</h4>
                {video.critics?.map((critic, idx) => (
                  <div key={idx} className="critic-item" onClick={() => handleCriticClick(video.id, idx)}>
                    <span>{critic}</span>
                    {selectedCritics[`${video.id}-${idx}`] && (
                      <span className="critic-percent">{selectedCritics[`${video.id}-${idx}`]}%</span>
                    )}
                  </div>
                ))}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                  <span style={{ background: '#fff', color: '#000', padding: '5px 15px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {video.views} K VIEWS
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosPage;
