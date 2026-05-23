import { useState, useRef, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PenLine, Edit, Trash2, Eye } from 'lucide-react';
import { allSongs } from '@/data/lyricsSongs';
import nameArabic from '@/assets/name-arabic.png';
import nameEnglish from '@/assets/name-english.png';

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
        <span key={i} className="floating-note"
          style={{ left: `${left}%`, top: '110%', fontSize: `${size}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
          {note}
        </span>
      ))}
    </div>
  );
};

const CardFloatingNotes = ({ seed }: { seed: number }) => {
  const items = Array.from({ length: 12 }, (_, i) => ({
    note: NOTES[(i + seed) % NOTES.length],
    left: (i * 17 + seed * 9) % 96,
    size: 20 + ((i * 5 + seed) % 20),
    duration: 7 + ((i * 2 + seed) % 7),
    delay: (i * 0.9 + seed * 0.3) % 6,
  }));
  return (
    <div aria-hidden="true" className="card-floating-notes">
      {items.map(({ note, left, size, duration, delay }, i) => (
        <span key={`${seed}-${i}`} className="card-floating-note"
          style={{ left: `${left}%`, top: '112%', fontSize: `${size}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
          {note}
        </span>
      ))}
    </div>
  );
};

const SONG_CATEGORIES: { key: string; ar: string; en: string; match: (c: string) => boolean; order: number }[] = [
  { key: 'all',             ar: 'الكل',             en: 'All',             match: () => true,                                                        order: 0  },
  { key: 'islamic',         ar: 'إسلامي',           en: 'Islamic',         match: (c) => /islamic|إسلامي/i.test(c),                                 order: 1  },
  { key: 'patriotic',       ar: 'وطني',             en: 'Patriotic',       match: (c) => /patriotic|وطني/i.test(c),                                  order: 2  },
  { key: 'social',          ar: 'اجتماعي وعائلي',   en: 'Social & Family', match: (c) => /social|family|اجتماعي|عائلي/i.test(c),                   order: 3  },
  { key: 'occasion',        ar: 'مناسبات وأعياد',   en: 'Occasion & Holiday', match: (c) => /occasion|holiday|مناسبات|أعياد/i.test(c),             order: 4  },
  { key: 'motivational',    ar: 'تحفيزية',          en: 'Motivational',    match: (c) => /motivational|تحفيزية|تحفيز/i.test(c),                     order: 5  },
  { key: 'poems',           ar: 'قصائد',            en: 'Poems',           match: (c) => /poems|قصائد|قصيدة/i.test(c),                               order: 6  },
  { key: 'classic',         ar: 'كلاسيك',           en: 'Classic',         match: (c) => /classic|كلاسيك/i.test(c),                                  order: 7  },
  { key: 'drama',           ar: 'دراما',            en: 'Drama',           match: (c) => /drama|دراما/i.test(c),                                     order: 8  },
  { key: 'slow',            ar: 'سلو',              en: 'Slow',            match: (c) => /slow|سلو/i.test(c),                                        order: 9  },
  { key: 'romantic',        ar: 'رومانسي',          en: 'Romantic',        match: (c) => /romantic|رومانسي/i.test(c) && !/maqsum|مقسوم/i.test(c),    order: 10 },
  { key: 'romantic_maqsum', ar: 'رومانسي مقسوم',   en: 'Romantic Maqsum', match: (c) => /romantic maqsum|رومانسي مقسوم/i.test(c),                  order: 11 },
  { key: 'pop',             ar: 'بوب',              en: 'Pop',             match: (c) => /pop|بوب/i.test(c),                                         order: 12 },
  { key: 'rock',            ar: 'روك',              en: 'Rock',            match: (c) => /rock|روك/i.test(c),                                        order: 13 },
  { key: 'maqsum',          ar: 'مقسوم',            en: 'Maqsum',          match: (c) => /maqsum|مقسوم/i.test(c) && !/romantic|رومانسي/i.test(c),    order: 14 },
  { key: 'tarab',           ar: 'طرب',              en: 'Tarab',           match: (c) => /tarab|طرب/i.test(c),                                       order: 15 },
  { key: 'shaabi',          ar: 'شعبي',             en: 'Shaabi',          match: (c) => /shaabi|شعبي/i.test(c),                                     order: 16 },
  { key: 'saidi',           ar: 'صعيدي',            en: "Sa'idi",          match: (c) => /sa'idi|saidi|صعيدي/i.test(c),                              order: 17 },
  { key: 'rap',             ar: 'راب',              en: 'Rap',             match: (c) => /rap|راب/i.test(c) && !/trap|تراب/i.test(c),                order: 18 },
  { key: 'trap',            ar: 'تراب',             en: 'Trap',            match: (c) => /trap|تراب/i.test(c),                                       order: 19 },
];

function getCategoryOrder(type: string): number {
  const match = SONG_CATEGORIES.find((c) => c.key !== 'all' && c.match(type || ''));
  return match ? match.order : 99;
}

interface Comment {
  id: string;
  text: string;
  timestamp: number;
}

const LyricsPage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();
  const location = useLocation();

  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (id) {
      setTimeout(() => {
        const element = document.getElementById(`card-${id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.outline = '2px solid #c9a84c';
          element.style.borderRadius = '16px';
          setTimeout(() => {
            element.style.outline = 'none';
          }, 3000);
        }
      }, 500);
    }
  }, [location.search]);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  // Comments and Ratings State
  const [comments, setComments] = useState<Record<number, Comment[]>>(() => {
    const saved = localStorage.getItem('lyrics_comments');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  const [ratings, setRatings] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('lyrics_ratings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  const [hoverStar, setHoverStar] = useState<Record<number, number>>({});
  
  // Active comment text inputs
  const [activeInputSongId, setActiveInputSongId] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});

  useEffect(() => {
    localStorage.setItem('lyrics_comments', JSON.stringify(comments));
  }, [comments]);

  const saveRating = (songId: number, rating: number) => {
    const updated = { ...ratings, [songId]: rating };
    setRatings(updated);
    localStorage.setItem('lyrics_ratings', JSON.stringify(updated));
  };

  const commentsEndRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const scrollToBottom = (songId: number) => {
    setTimeout(() => {
      commentsEndRefs.current[songId]?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  // Categories Filtering
  const presentCategoryKeys = useMemo(() => {
    const keys = new Set<string>();
    allSongs.forEach((s) => {
      const match = SONG_CATEGORIES.find((c) => c.key !== 'all' && c.match(s.type || ''));
      if (match) keys.add(match.key);
    });
    return keys;
  }, []);

  const visibleCategories = useMemo(
    () => SONG_CATEGORIES.filter((c) => c.key === 'all' || presentCategoryKeys.has(c.key)),
    [presentCategoryKeys]
  );

  const filteredSongs = useMemo(() => {
    const q = normalizeArabic(search);
    const cat = SONG_CATEGORIES.find((c) => c.key === activeCat) || SONG_CATEGORIES[0];
    return allSongs
      .filter((s) => {
        if (!cat.match(s.type || '')) return false;
        if (!q) return true;
        const hay = [s.title, s.type].join(' ');
        return normalizeArabic(hay).includes(q);
      })
      .slice()
      .sort((a, b) => getCategoryOrder(a.type) - getCategoryOrder(b.type));
  }, [search, activeCat]);

  const getCategoryLabel = (type: string) => {
    const matched = SONG_CATEGORIES.find((c) => c.key !== 'all' && c.match(type || ''));
    if (matched) return lang === 'ar' ? matched.ar : matched.en;
    return type || (lang === 'ar' ? 'عام' : 'General');
  };

  // Handle comment actions
  const handleEmojiClick = (songId: number, emoji: string) => {
    setNewCommentText(prev => ({
      ...prev,
      [songId]: (prev[songId] || '') + emoji
    }));
  };

  const handleAddComment = (songId: number) => {
    setActiveInputSongId(songId);
    scrollToBottom(songId);
  };

  const handleCancelComment = (songId: number) => {
    setNewCommentText(prev => ({ ...prev, [songId]: '' }));
    setActiveInputSongId(null);
  };

  const handleSubmitComment = (songId: number) => {
    const text = newCommentText[songId]?.trim();
    if (!text) return;

    const newComment = {
      id: `comment-${songId}-${Date.now()}`,
      text: text,
      timestamp: Date.now()
    };

    setComments(prev => ({
      ...prev,
      [songId]: [...(prev[songId] || []), newComment]
    }));

    setNewCommentText(prev => ({ ...prev, [songId]: '' }));
    setActiveInputSongId(null);
    scrollToBottom(songId);
  };

  // Split lyric line logic
  const renderLyricLine = (line: { text: string; red?: boolean }, lineIndex: number) => {
    const text = line.text;
    const isRed = line.red;
    
    if (text === '\u00A0' || text.trim() === '') {
      return <div key={lineIndex} className="h-4" />;
    }

    if (!text.includes('...')) {
      return (
        <div key={lineIndex} className={`line ${isRed ? 'red' : ''}`}>
          {text}
        </div>
      );
    }

    const parts = text.split(/\s*\.\.\.\s*/);
    if (parts.length === 2) {
      return (
        <div key={lineIndex} className="mb-4">
          <div className={`line sub-line-1 ${isRed ? 'red' : ''}`} style={{ marginBottom: '12px' }}>
            {parts[0]}
          </div>
          <div className={`line sub-line-3 ${isRed ? 'red' : ''}`}>
            {parts[1]}
          </div>
        </div>
      );
    }

    return (
      <div key={lineIndex} className="mb-4">
        <div className={`line sub-line-1 ${isRed ? 'red' : ''}`} style={{ marginBottom: '12px' }}>
          {parts[0]}
        </div>
        <div className={`line sub-line-2 ${isRed ? 'red' : ''}`} style={{ marginBottom: '4px' }}>
          {parts.slice(1, parts.length - 1).join(' ... ')}
        </div>
        <div className={`line sub-line-3 ${isRed ? 'red' : ''}`}>
          {parts[parts.length - 1]}
        </div>
      </div>
    );
  };

  return (
    <div dir="rtl" className="lyrics-page-wrapper min-h-screen">
      <FloatingNotes />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');

        :root { --leather-black: #0a0205; }

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
          font-family: 'Tajawal', 'Almarai', 'Outfit', sans-serif !important;
          font-size: clamp(14px, 3vw, 17px) !important;
          color: #e8d5b0;
          opacity: 0.9;
          line-height: 1.6;
        }

        .lyrics-page-wrapper {
          position: relative;
          background: transparent;
          min-height: 100vh;
          color: inherit;
          font-family: 'Almarai', sans-serif;
        }

        .floating-notes-layer {
          position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
        }
        .floating-note {
          position: absolute; user-select: none;
          color: rgba(201, 168, 76, 0.32);
          font-family: 'Aref Ruqaa Ink', serif;
          animation-name: floatNote;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes floatNote {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.72; }
          85%  { opacity: 0.56; }
          100% { transform: translateY(-125vh) rotate(22deg); opacity: 0; }
        }

        .content-layer { position: relative; z-index: 1; }

        /* ─── الكارد (جلد أحمر) ─── */
        .lyrics-card {
          position: relative;
          max-width: 900px;
          margin: 0 auto 50px;
          border: 2px solid #c9a84c;
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.7);
          background-image: url('https://www.transparenttextures.com/patterns/leather.png');
          background-color: transparent;
          background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, var(--leather-black) 100%);
        }

        /* ─── ملاحظات عائمة داخل الكارد ─── */
        .card-floating-notes {
          position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0;
        }
        .card-floating-note {
          position: absolute; user-select: none;
          color: rgba(201, 168, 76, 0.18);
          font-family: 'Aref Ruqaa Ink', serif;
          animation-name: floatNoteCard;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes floatNoteCard {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          12%  { opacity: 0.5; }
          82%  { opacity: 0.36; }
          100% { transform: translateY(-900px) rotate(16deg); opacity: 0; }
        }

        .card-inner { position: relative; z-index: 1; }

        /* ─── النصف العلوي ─── */
        .lyrics-top-half {
          padding: 30px 40px;
          background: rgba(20, 5, 8, 0.82);
          border-bottom: 1px solid rgba(201, 168, 76, 0.2);
        }

        .header-row {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 50px;
          margin-bottom: 15px;
        }

        .category-badge {
          position: absolute;
          left: 0;
          background: #c9a84c; color: #000;
          padding: 6px 20px; border-radius: 20px;
          font-weight: bold; font-size: 14px;
        }

        .song-title-red {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          color: #ff4d4d;
          font-family: 'Aref Ruqaa Ink', serif;
          font-size: 2.5rem;
          margin: 0;
          white-space: nowrap;
        }

        .label-gold-center {
          color: #c9a84c;
          font-size: 13px;
          margin-bottom: 15px;
          display: block;
          text-align: center;
        }

        .lyrics-scroll-area {
          max-height: 250px;
          overflow-y: auto;
          text-align: center;
          padding: 0 10px;
          scrollbar-width: thin;
          scrollbar-color: #c9a84c transparent;
        }
        .lyrics-scroll-area::-webkit-scrollbar { width: 5px; }
        .lyrics-scroll-area::-webkit-scrollbar-track { background: transparent; }
        .lyrics-scroll-area::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }

        .line {
          font-size: 1.3rem;
          color: #e8d5b0;
          margin-bottom: 10px;
          line-height: 1.8;
          opacity: 0.9;
        }
        .line.red { color: #ff4d4d; font-weight: bold; }

        /* ─── النصف السفلي ─── */
        .lyrics-bottom-half {
          display: flex;
          background: rgba(0,0,0,0.35);
        }

        .right-col {
          flex: 1.2;
          padding: 30px;
        }

        .left-col {
          flex: 1;
          padding: 30px;
          background: rgba(103, 6, 6, 0.15);
          border-right: 1px solid rgba(201,168,76,0.2);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        /* ─── التعليقات ─── */
        .comments-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .label-gold {
          color: #c9a84c;
          font-size: 14px;
          font-weight: bold;
        }

        .add-comment-btn {
          background: rgba(201, 168, 76, 0.15);
          color: #c9a84c;
          border: 1px solid rgba(201, 168, 76, 0.3);
          padding: 4px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-comment-btn:hover {
          background: rgba(201, 168, 76, 0.3);
        }

        .comment-input-area {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;
          background: rgba(0, 0, 0, 0.2);
          padding: 15px;
          border-radius: 15px;
          border: 1px solid rgba(201, 168, 76, 0.15);
        }

        .comment-textarea {
          width: 100%;
          min-height: 80px;
          border-radius: 10px;
          padding: 10px;
          font-size: 14px;
          resize: none;
          outline: none;
          direction: rtl;
        }

        .emoji-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-start;
        }
        .emoji-btn {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          transition: transform 0.1s;
        }
        .emoji-btn:hover {
          transform: scale(1.2);
        }

        .action-buttons {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .btn-done {
          background: #c9a84c;
          color: #0a0205;
          border: none;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .btn-done:hover { background: #d4b563; }

        .btn-cancel {
          border: none;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .comments-scroll-list {
          max-height: 180px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-right: 5px;
          scrollbar-width: thin;
          scrollbar-color: #c9a84c transparent;
        }
        .comments-scroll-list::-webkit-scrollbar { width: 4px; }
        .comments-scroll-list::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }

        .comment-bubble {
          border-radius: 15px;
          padding: 10px 14px;
          font-size: 13px;
          animation: slideUpFade 0.3s ease-out forwards;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ─── أزرار الفلتر ─── */
        .filter-chip {
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3);
          color: #c9a84c; padding: 6px 18px; border-radius: 20px;
          cursor: pointer; font-family: 'Almarai', sans-serif; font-size: 13px;
          transition: all 0.2s;
        }
        .filter-chip:hover { background: rgba(201,168,76,0.2); }
        .filter-chip.active { background: #c9a84c; color: #000; border-color: #c9a84c; font-weight: bold; }

        /* ─── تقييمك ─── */
        .rating-title {
          color: #c9a84c;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 12px;
          text-align: center;
        }

        .star-rating {
          display: flex;
          gap: 6px;
          margin-bottom: 15px;
        }
        .star {
          font-size: 26px;
          cursor: pointer;
          color: rgba(201,168,76,0.25);
          transition: color 0.2s, text-shadow 0.2s;
          user-select: none;
        }
        .star.active {
          color: #c9a84c;
          text-shadow: 0 0 8px rgba(201,168,76,0.7);
        }

        .views-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(201, 168, 76, 0.12);
          border: 1px solid rgba(201, 168, 76, 0.35);
          color: #c9a84c;
          padding: 6px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 13px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          flex-shrink: 0;
          font-family: 'Almarai', 'Outfit', sans-serif;
        }
        .views-badge:hover {
          background: rgba(201, 168, 76, 0.25);
          border-color: #c9a84c;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .lyrics-bottom-half {
            flex-direction: column-reverse;
          }
          .left-col {
            border-right: none;
            border-bottom: 1px solid rgba(201,168,76,0.2);
            padding: 20px;
          }
          .song-title-red {
            font-size: 1.8rem;
          }
          .header-row {
            flex-direction: column-reverse;
            gap: 10px;
            align-items: center;
            min-height: auto;
          }
          .category-badge, .song-title-red {
            position: static;
            transform: none;
          }
        }
      `}</style>

      <div className="content-layer">
        {/* Unified Black Header Box */}
        <div className="unified-header-box animate-fade-in-up">
          <h1 className="unified-header-title">
            {t('LYRICS', 'كلمات')}
          </h1>
          <p className="unified-header-subtitle">
            {t('Read the complete lyrics of all songs', 'اقرأ كلمات جميع الأغاني')}
          </p>
        </div>

        {/* Search & Categories Filter */}
        <div className="container mx-auto px-4 max-w-5xl -mt-4 mb-12">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={t('Search lyrics...', 'ابحث عن الكلمات...')}
            className="mb-5"
          />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }} className="mb-4">
            {visibleCategories.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`filter-chip ${activeCat === c.key ? 'active' : ''}`}
                onClick={() => setActiveCat(c.key)}
              >
                {lang === 'ar' ? c.ar : c.en}
              </button>
            ))}
          </div>

          <div style={{ textAlign: 'center', color: '#c9a84c', fontSize: 13 }}>
            {filteredSongs.length} / {allSongs.length}
          </div>
        </div>

        {/* Lyrics Cards List */}
        <div className="container mx-auto px-4 max-w-5xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          {filteredSongs.length > 0 ? (
            filteredSongs.map((song) => (
              <div key={song.id} id={`card-${song.id}`} className="lyrics-card relative group">
                <CardFloatingNotes seed={song.id} />
                {isAdmin && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl scale-95 group-hover:scale-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const evt = new CustomEvent('open-admin-edit', { detail: song });
                        window.dispatchEvent(evt);
                      }}
                      className="p-2 bg-blue-500/20 text-blue-400 rounded-lg backdrop-blur-md border border-blue-500/30 hover:bg-blue-500/40 transition-colors shadow-lg"
                      title={lang === 'ar' ? 'تعديل' : 'Edit'}
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if(window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذه الأغنية؟' : 'Are you sure you want to delete this song?')) {
                           const evt = new CustomEvent('admin-delete-item', { detail: { id: song.id, section: 'lyrics' } });
                           window.dispatchEvent(evt);
                           const card = document.getElementById(`card-${song.id}`);
                           if(card) card.style.display = 'none';
                        }
                      }}
                      className="p-2 bg-red-500/20 text-red-400 rounded-lg backdrop-blur-md border border-red-500/30 hover:bg-red-500/40 transition-colors shadow-lg"
                      title={lang === 'ar' ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div className="card-inner">
                  {/* TOP HALF — Lyrics Area */}
                  <div className="lyrics-top-half">
                    <div className="header-row">
                      <span className="category-badge">{getCategoryLabel(song.type)}</span>
                      <h2 className="song-title-red">{song.title}</h2>
                    </div>

                    <span className="label-gold-center">
                      {t('Song Lyrics', 'كلمات الأغنية')}
                    </span>

                    <div className="lyrics-scroll-area">
                      {song.lyrics.map((l: any, i: number) => renderLyricLine(l, i))}
                    </div>
                  </div>

                  {/* BOTTOM HALF — Two Columns */}
                  <div className="lyrics-bottom-half">
                    {/* RIGHT COLUMN — Comments System */}
                    <div className="right-col">
                      <div className="comments-header">
                        <span className="label-gold">{t('Comments', 'التعليقات')}</span>
                        {activeInputSongId !== song.id && (
                          <button
                            className="add-comment-btn"
                            onClick={() => handleAddComment(song.id)}
                          >
                            {t('+ Add comment', 'أضف تعليق +')}
                          </button>
                        )}
                      </div>

                      {/* Comment Input Area */}
                      {activeInputSongId === song.id && (
                        <div className="comment-input-area">
                          <textarea
                            className="comment-textarea"
                            style={{
                              background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                              color: isDark ? '#ffffff' : '#000000',
                              borderColor: isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(201, 168, 76, 0.4)',
                            }}
                            value={newCommentText[song.id] || ''}
                            onChange={(e) => setNewCommentText(prev => ({ ...prev, [song.id]: e.target.value }))}
                            placeholder={t('Write your comment...', 'اكتب تعليقك...')}
                            autoFocus
                          />

                          <div className="emoji-row">
                            {['😍', '🔥', '❤️', '👏', '🎵', '💯', '😢'].map((emoji) => (
                              <button
                                key={emoji}
                                type="button"
                                className="emoji-btn"
                                onClick={() => handleEmojiClick(song.id, emoji)}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>

                          <div className="action-buttons">
                            <button
                              type="button"
                              className="btn-cancel"
                              style={{
                                color: isDark ? '#ffffff' : '#000000',
                                background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f3f3',
                              }}
                              onClick={() => handleCancelComment(song.id)}
                            >
                              {t('Cancel', 'إلغاء')}
                            </button>
                            <button
                              type="button"
                              className="btn-done"
                              onClick={() => handleSubmitComment(song.id)}
                            >
                              {t('Done ✓', 'تم ✓')}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Comments Scroll List */}
                      <div className="comments-scroll-list">
                        {(comments[song.id] || []).map((comment) => (
                          <div
                            key={comment.id}
                            className="comment-bubble group/comment relative"
                            style={{
                              background: 'rgba(255, 255, 255, 0.07)',
                              color: '#ffffff',
                              borderColor: isDark ? 'rgba(201, 168, 76, 0.15)' : 'rgba(201, 168, 76, 0.3)',
                              borderWidth: '1px',
                              borderStyle: 'solid'
                            }}
                          >
                            {comment.text}
                            {isAdmin && (
                              <div className="absolute left-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity bg-black/75 p-1 rounded backdrop-blur-sm border border-white/10">
                                <button
                                  onClick={() => {
                                    const newText = window.prompt(lang === 'ar' ? 'تعديل التعليق' : 'Edit comment', comment.text);
                                    if (newText && newText.trim() !== '') {
                                      setComments(prev => ({
                                        ...prev,
                                        [song.id]: prev[song.id].map(c => c.id === comment.id ? { ...c, text: newText.trim() } : c)
                                      }));
                                    }
                                  }}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title={lang === 'ar' ? 'تعديل' : 'Edit'}
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (window.confirm(lang === 'ar' ? 'حذف التعليق؟' : 'Delete comment?')) {
                                      setComments(prev => ({
                                        ...prev,
                                        [song.id]: prev[song.id].filter(c => c.id !== comment.id)
                                      }));
                                    }
                                  }}
                                  className="text-red-400 hover:text-red-300 p-1"
                                  title={lang === 'ar' ? 'حذف' : 'Delete'}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                        <div ref={(el) => { commentsEndRefs.current[song.id] = el; }} />
                      </div>
                    </div>

                    {/* LEFT COLUMN — Stars + Views */}
                    <div className="left-col">
                      <span className="rating-title">{t('Your Rating', 'تقييمك')}</span>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <span
                            key={num}
                            className={`star ${num <= (hoverStar[song.id] ?? ratings[song.id] ?? 0) ? 'active' : ''}`}
                            onClick={() => saveRating(song.id, num)}
                            onMouseEnter={() => setHoverStar((prev) => ({ ...prev, [song.id]: num }))}
                            onMouseLeave={() => setHoverStar((prev) => { const n = { ...prev }; delete n[song.id]; return n; })}
                          >
                            ★
                          </span>
                        ))}
                      </div>

                      <div className="views-badge">
                        <Eye className="w-4 h-4 shrink-0" />
                        <span>{lang === 'ar' ? `مشاهدة ${song.views ?? '0'}` : `Views ${song.views ?? '0'}`}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State */
            <div
              className="text-center py-20 rounded-2xl border border-border/20"
              style={{
                background: isDark ? 'rgba(20,5,8,0.6)' : 'rgba(245,240,235,0.6)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="text-5xl mb-4 block">📝</span>
              <p className="text-xl font-body text-muted-foreground italic">
                {t('♪ No lyrics found — try another search', '♪ لا توجد كلمات — جرب كلمة بحث أخرى')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LyricsPage;
