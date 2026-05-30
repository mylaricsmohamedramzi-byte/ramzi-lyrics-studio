import { useState, useRef, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import nameArabic from '@/assets/name-arabic.png';
import nameEnglish from '@/assets/name-english.png';
import { translateTitle } from '@/utils/songTranslations';

// ─── ملاحظات موسيقية عائمة (خلفية الصفحة) ───────────────────────────────────
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
          style={{ left: `${left}%`, top: '110%', fontSize: `${size}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        >
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
        <span
          key={`${seed}-${i}`}
          className="card-floating-note"
          style={{ left: `${left}%`, top: '112%', fontSize: `${size}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
        >
          {note}
        </span>
      ))}
    </div>
  );
};

// ─── ترتيب الأولوية للفئات ───────────────────────────────────────────────────
const VIDEO_CATEGORIES: { key: string; ar: string; en: string; match: (c: string) => boolean; order: number }[] = [
  { key: 'all', ar: 'الكل', en: 'All', match: () => true, order: 0 },
  { key: 'islamic', ar: 'إسلامي', en: 'Islamic', match: (c) => /islamic|إسلامي/i.test(c), order: 1 },
  { key: 'patriotic', ar: 'وطني', en: 'Patriotic', match: (c) => /patriotic|وطني/i.test(c), order: 2 },
  { key: 'social', ar: 'اجتماعي وعائلي', en: 'Social & Family', match: (c) => /social|family|اجتماعي|عائلي/i.test(c), order: 3 },
  { key: 'occasion', ar: 'مناسبات وأعياد', en: 'Occasion & Holiday', match: (c) => /occasion|holiday|مناسبات|أعياد/i.test(c), order: 4 },
  { key: 'motivational', ar: 'تحفيزية', en: 'Motivational', match: (c) => /motivational|تحفيزية|تحفيز/i.test(c), order: 5 },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /poems|قصائد|قصيدة/i.test(c), order: 6 },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /classic|كلاسيك/i.test(c), order: 7 },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /drama|دراما/i.test(c), order: 8 },
  { key: 'slow', ar: 'سلو', en: 'Slow', match: (c) => /slow|سلو/i.test(c), order: 9 },
  { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c) => /romantic|رومانسي/i.test(c) && !/maqsum|مقسوم/i.test(c), order: 10 },
  { key: 'romantic_maqsum', ar: 'رومانسي مقسوم', en: 'Romantic Maqsum', match: (c) => /romantic maqsum|رومانسي مقسوم/i.test(c), order: 11 },
  { key: 'pop', ar: 'بوب', en: 'Pop', match: (c) => /pop|بوب/i.test(c), order: 12 },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /rock|روك/i.test(c), order: 13 },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /maqsum|مقسوم/i.test(c) && !/romantic|رومانسي/i.test(c), order: 14 },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /tarab|طرب/i.test(c), order: 15 },
  { key: 'shaabi', ar: 'شعبي', en: 'Shaabi', match: (c) => /shaabi|شعبي/i.test(c), order: 16 },
  { key: 'saidi', ar: 'صعيدي', en: "Sa'idi", match: (c) => /sa'idi|saidi|صعيدي/i.test(c), order: 17 },
  { key: 'rap', ar: 'راب', en: 'Rap', match: (c) => /rap|راب/i.test(c) && !/trap|تراب/i.test(c), order: 18 },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /trap|تراب/i.test(c), order: 19 },
];

/** ترتيب رقمي للفئة بحسب قائمة الأولويات */
function getCategoryOrder(category: string): number {
  const match = VIDEO_CATEGORIES.find((c) => c.key !== 'all' && c.match(category || ''));
  return match ? match.order : 99;
}

// ─── دالة استخراج ID يوتيوب ──────────────────────────────────────────────────
function getYouTubeVideoId(url: string): string | null {
  try {
    const t = url.trim();
    if (t.includes('youtu.be/')) return t.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)?.[1] ?? null;
    if (t.includes('youtube.com')) return new URL(t).searchParams.get('v');
    if (t.length === 11 && /^[a-zA-Z0-9_-]+$/.test(t)) return t;
  } catch { return null; }
  return null;
}

function getVideoSourceType(url: string): 'youtube' | 'cloudinary' | 'gdrive' | 'direct' {
  const l = url.toLowerCase();
  if (l.includes('youtube.com') || l.includes('youtu.be')) return 'youtube';
  if (l.includes('cloudinary.com')) return 'cloudinary';
  if (l.includes('drive.google.com')) return 'gdrive';
  return 'direct';
}

import { allVideos } from '@/data/videosData';


interface Comment {
  id: string;
  text: string;
  timestamp: number;
}

import { Edit, Trash2, Eye } from 'lucide-react';

const VideosPage = () => {
  const { lang } = useLang();
  const { isDark } = useTheme();
  const location = useLocation();
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});

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

  const [starRatings, setStarRatings] = useState<Record<number, number>>(() => {
    const saved = localStorage.getItem('videos_ratings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  const saveRating = (songId: number, rating: number) => {
    const updated = { ...starRatings, [songId]: rating };
    setStarRatings(updated);
    localStorage.setItem('videos_ratings', JSON.stringify(updated));
  };

  const [hoverStar, setHoverStar] = useState<Record<number, number>>({});

  // Comments State
  const [comments, setComments] = useState<Record<number, Comment[]>>(() => {
    const saved = localStorage.getItem('videos_comments');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  const [activeInputSongId, setActiveInputSongId] = useState<number | null>(null);
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
  const commentsEndRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    localStorage.setItem('videos_comments', JSON.stringify(comments));
  }, [comments]);

  const scrollToBottom = (songId: number) => {
    setTimeout(() => {
      commentsEndRefs.current[songId]?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  

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

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  // ─── الفئات الموجودة فعلاً في الفيديوهات ─────────────────────────────────
  const presentCategoryKeys = useMemo(() => {
    const keys = new Set<string>();
    allVideos.forEach((v) => {
      const match = VIDEO_CATEGORIES.find((c) => c.key !== 'all' && c.match(v.category || ''));
      if (match) keys.add(match.key);
    });
    return keys;
  }, []);

  // فئات السرش بار: all + الفئات الموجودة فقط بنفس الترتيب
  const visibleCategories = useMemo(
    () => VIDEO_CATEGORIES.filter((c) => c.key === 'all' || presentCategoryKeys.has(c.key)),
    [presentCategoryKeys]
  );

  // ─── تصفية + ترتيب ────────────────────────────────────────────────────────
  const filteredVideos = useMemo(() => {
    const q = normalizeArabic(search);
    const cat = VIDEO_CATEGORIES.find((c) => c.key === activeCat) || VIDEO_CATEGORIES[0];
    return allVideos
      .filter((v) => {
        if (!cat.match(v.category || '')) return false;
        if (!q) return true;
        const hay = [v.title, v.category, ...(v.lyrics?.map((l) => l.text) || [])].join(' ');
        return normalizeArabic(hay).includes(q);
      })
      .slice()
      .sort((a, b) => getCategoryOrder(a.category) - getCategoryOrder(b.category));
  }, [search, activeCat]);

  const handleCriticClick = (videoId: number, idx: number) => {
    const key = `${videoId}-${idx}`;
    if (!selectedCritics[key]) {
      setSelectedCritics((prev) => ({ ...prev, [key]: Math.floor(Math.random() * 31) + 65 }));
    }
  };

  const renderVideo = (url: string, idx: number, videoId: number) => {
    const sourceType = getVideoSourceType(url);
    const key = `${videoId}-${idx}`;

    if (sourceType === 'youtube') {
      const vid = getYouTubeVideoId(url);
      if (!vid) return null;
      return (
        <div key={idx} className="video-wrapper">
          <iframe
            className="video-frame"
            src={`https://www.youtube.com/embed/${vid}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (sourceType === 'gdrive') {
      return (
        <div key={idx} className="video-wrapper">
          <iframe
            className="video-frame"
            src={url.replace('/open', '/preview').replace('/view', '/preview')}
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video key={idx} ref={(el) => { videoRefs.current[key] = el; }} className="video-player" controls>
        <source src={url} type="video/mp4" />
      </video>
    );
  };

  return (
    <div dir="rtl" className="page-wrapper">
      {/* ملاحظات عائمة خلفية الصفحة */}
      <FloatingNotes />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');

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

        @font-face {
          font-family: 'DG Forsha';
          src: url('/fonts/DG-Forsha.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        /* ─── متغيرات ─── */
        :root { --leather-black: #0a0205; }

        /* ─── خلفية الصفحة (مثل LyricsPage) ─── */
        .page-wrapper {
          position: relative;
          background: transparent;
          min-height: 100vh;
          padding: 40px 20px;
          color: inherit;
          font-family: 'Almarai', sans-serif;
        }

        /* ─── طبقة الملاحظات العائمة ─── */
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

        /* ─── طبقة المحتوى ─── */
        .content-layer { position: relative; z-index: 1; }

        /* ─── الكارد (جلد أحمر) ─── */
        .main-card {
          position: relative;
          max-width: 1100px;
          margin: 0 auto 80px;
          border: 1px solid var(--primary);
          border-radius: 40px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.7);
          /* خلفية الجلد الأحمر */
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

        /* ─── محتوى الكارد فوق الطبقات ─── */
        .card-inner { position: relative; z-index: 1; }

        .card-header {
          padding: 20px 40px;
          display: flex; justify-content: space-between; align-items: center;
        }
        .song-label { color: #d4a0a0; font-size: 14px; }
        .category-badge {
          background: #c9a84c; color: #000;
          padding: 6px 25px; border-radius: 20px;
          font-weight: bold; font-size: 14px;
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
          font-family: 'Tajawal', 'Almarai', 'Outfit', sans-serif !important;
          font-size: clamp(14px, 3vw, 17px) !important;
          color: #e8d5b0;
          opacity: 0.9;
          line-height: 1.6;
        }

        .video-container { padding: 0 40px; margin-bottom: 30px; }
        .video-wrapper {
          position: relative; padding-bottom: 50.25%; height: 0;
          border-radius: 60px; overflow: hidden;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
        }
        .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .video-player { width: 100%; border-radius: 60px; background: #000; }

        /* ─── قسم الكلمات: خلفية داكنة حمراء ─── */
        .card-content {
          display: grid; grid-template-columns: 1.2fr 0.8fr;
          gap: 0; padding: 0;
        }
        @media (max-width: 900px) {
          .card-content {
            grid-template-columns: 1fr;
          }
          .rating-section {
            border-right: none !important;
            border-top: 1px solid rgba(201, 168, 76, 0.2);
          }
        }
        .lyrics-section {
          display: flex; flex-direction: column;
          padding: 30px 40px;
          background: radial-gradient(circle at center, rgb(80, 5, 5) 0%, var(--leather-black) 100%);
        }
        .video-title {
          color: #ff4d4d; font-family: 'Aref Ruqaa Ink', serif;
          font-size: 2.5rem; margin: 10px 0;
        }

        .lyrics-scroll-container {
          margin-top: 20px;
          border-right: 3px solid #c9a84c;
          padding-right: 20px;
          max-height: 300px;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #c9a84c transparent;
        }
        .lyrics-scroll-container::-webkit-scrollbar { width: 5px; }
        .lyrics-scroll-container::-webkit-scrollbar-track { background: transparent; }
        .lyrics-scroll-container::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }

        .line {
          font-family: 'DG Forsha', 'Almarai', sans-serif;
          font-size: 1.3rem; color: #e8d5b0;
          margin-bottom: 12px; line-height: 1.8; opacity: 0.9;
        }
        .line.red { color: #ff4d4d; font-weight: bold; }

        /* ─── قسم التقييم ─── */
        .rating-section {
          padding: 30px 40px;
          background: rgba(0, 0, 0, 0.35);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-right: 1px solid rgba(201, 168, 76, 0.2);
        }
        .rating-title {
          color: #d4a0a0; font-size: 14px;
          margin-bottom: 15px; display: block; text-align: center;
        }
        .critic-item {
          background: rgba(0, 0, 0, 0.4);
          padding: 12px 20px; border-radius: 10px; margin-bottom: 10px;
          border: 1px solid rgba(201, 168, 76, 0.25);
          display: flex; justify-content: space-between;
          cursor: pointer; color: #e8d5b0 !important;
          transition: background 0.2s;
        }
        .critic-item:hover { background: rgba(0,0,0,0.6); }
        .critic-percent { color: #c9a84c; font-weight: bold; }

        .ok-badge {
          background: #f0fdf4; color: #1a2e44;
          padding: 8px 30px; border-radius: 30px;
          font-weight: bold;
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

        .views-stars-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-top: 20px;
        }

        .star-rating { display: flex; gap: 4px; }
        .star {
          font-size: 22px; cursor: pointer;
          color: rgba(201,168,76,0.25);
          transition: color 0.2s, text-shadow 0.2s;
          user-select: none;
        }
        .star.active {
          color: #c9a84c;
          text-shadow: 0 0 8px rgba(201,168,76,0.7);
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

        @media (max-width: 900px) {
          .card-content { grid-template-columns: 1fr; }
          .lyrics-section { border-left: none; border-top: 1px solid rgba(201,168,76,0.2); }
          .video-container { padding: 0 15px; }
          .main-card { border-radius: 20px; }
        }
      `}</style>

      <div className="content-layer">
        {/* Unified Black Header Box */}
        <div className="unified-header-box animate-fade-in-up">
          <h1 className="unified-header-title">
            {lang === 'ar' ? 'الفيديوهات' : 'VIDEOS'}
          </h1>
          <p className="unified-header-subtitle">
            {lang === 'ar' ? 'شاهد أعمالي وفيديوهاتي الموسيقية' : 'Watch my works and music videos'}
          </p>
        </div>

        {/* ─── سرش + فلتر ─── */}
        <div style={{ maxWidth: 1100, margin: '0 auto 30px' }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="ابحث عن فيديو..."
            className="mb-5"
          />

          <div className="max-w-3xl mx-auto" style={{ margin: '0 auto 24px', maxWidth: 760 }}>
            <div
              style={{
                borderRadius: '12px',
                padding: '24px 28px',
                border: isDark ? '1px solid rgba(201,168,76,0.25)' : '1px solid rgba(139,26,42,0.2)',
                background: isDark
                  ? 'linear-gradient(135deg, hsl(340 25% 6%), hsl(340 20% 8%))'
                  : 'linear-gradient(135deg, hsl(30 30% 97%), hsl(30 25% 95%))',
                backgroundImage: isDark
                  ? `repeating-linear-gradient(transparent, transparent 28px, rgba(201,168,76,0.06) 28px, rgba(201,168,76,0.06) 29px)`
                  : `repeating-linear-gradient(transparent, transparent 28px, rgba(154,107,26,0.08) 28px, rgba(154,107,26,0.08) 29px)`,
                position: 'relative',
                overflow: 'hidden',
              }}>
              {/* ملاحظات زخرفية */}
              <div style={{ position: 'absolute', top: 10, right: 16, color: isDark ? 'rgba(201,168,76,0.2)' : 'rgba(139,26,42,0.15)', fontSize: 28, fontFamily: "'Aref Ruqaa Ink', serif", pointerEvents: 'none' }}>♪</div>
              <div style={{ position: 'absolute', bottom: 10, left: 16, color: isDark ? 'rgba(201,168,76,0.2)' : 'rgba(139,26,42,0.15)', fontSize: 22, fontFamily: "'Aref Ruqaa Ink', serif", pointerEvents: 'none' }}>♫</div>

              <h3 style={{
                color: isDark ? '#c9a84c' : '#8b1a2a',
                fontFamily: "'Aref Ruqaa Ink', serif",
                fontSize: '1.15rem',
                fontWeight: 'bold',
                textAlign: 'center',
                marginBottom: 14,
              }}>
                {lang === 'ar' ? 'توضيح هام' : 'Important Clarification'}
              </h3>

              <p style={{
                color: isDark ? 'rgba(232, 213, 176, 0.78)' : '#1a1a1a',
                lineHeight: '1.85',
                textAlign: 'center',
                fontFamily: "'Almarai', sans-serif",
                fontSize: '0.95rem',
                margin: 0,
                whiteSpace: 'pre-line'
              }}>
                {lang === 'ar'
                  ? `لقد استخدمت أدوات الذكاء الاصطناعي لمساعدتي في ربط أقرب شكل موسيقي بالأفكار والألحان التي ابتكرتها. لذلك ستجد في بعض الأغاني أن هناك أجزاء من الكلمات لا تُنطق بشكل صحيح تمامًا. أما الفيديوهات فهي جهدي لمساعدتك على فهم معنى الكلمات.`

                  : `I used AI tools to help match the melodies and ideas I created with the right musical style. Because of this, the pronunciation of some lyrics might sound a bit off in certain songs. As for the videos, they are my way of helping you catch the true meaning behind the words.`}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
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
          <div style={{ textAlign: 'center', marginTop: 12, color: '#c9a84c', fontSize: 13 }}>
            {filteredVideos.length} / {allVideos.length}
          </div>
        </div>

        {/* ─── الكاردات ─── */}
        {filteredVideos.map((video) => (
          <div key={video.id} id={`card-${video.id}`} className="main-card relative group">
            {/* ملاحظات عائمة داخل الكارد */}
            <CardFloatingNotes seed={video.id} />

            {isAdmin && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 flex gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/60 p-2 rounded-2xl backdrop-blur-md border border-white/10 shadow-2xl scale-95 group-hover:scale-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const evt = new CustomEvent('open-admin-edit', { detail: video });
                    window.dispatchEvent(evt);
                  }}
                  className="p-2 bg-blue-500/20 text-blue-400 rounded-lg backdrop-blur-md border border-blue-500/30 hover:bg-blue-500/40 transition-colors shadow-lg"
                  title="تعديل"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (window.confirm('هل أنت متأكد من حذف هذا الفيديو؟')) {
                      const evt = new CustomEvent('admin-delete-item', { detail: { id: video.id, section: 'videos' } });
                      window.dispatchEvent(evt);
                      const card = document.getElementById(`card-${video.id}`);
                      if (card) card.style.display = 'none';
                    }
                  }}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg backdrop-blur-md border border-red-500/30 hover:bg-red-500/40 transition-colors shadow-lg"
                  title="حذف"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )}

            <div className="card-inner">
              <div className="card-header">
                <span className="song-label">Song lyrics</span>
                <div className="category-badge">
                  {(() => {
                    const matched = VIDEO_CATEGORIES.find((c) => c.key !== 'all' && c.match(video.category || ''));
                    if (matched) return lang === 'ar' ? matched.ar : matched.en;
                    return video.category || (lang === 'ar' ? 'عام' : 'General');
                  })()}
                </div>
              </div>

              <div className="video-container">
                {video.videoUrls?.map((url, idx) => renderVideo(url, idx, video.id))}
              </div>

              <div className="card-content">
                {/* قسم الكلمات – خلفية داكنة حمراء */}
                <div className="lyrics-section">
                  <span className="song-label">{lang === 'ar' ? 'كلمات الأغنية' : 'Song lyrics'}</span>
                  <h2 className="video-title">{translateTitle(video.title, lang)}</h2>
                  <div className="lyrics-scroll-container">
                    {video.lyrics?.map((lyric, i) => (
                      <div key={i} className={`line ${lyric.red ? 'red' : ''}`}>{lyric.text}</div>
                    ))}
                  </div>
                </div>

                {/* قسم التقييم والتعليقات والنجوم */}
                <div className="rating-section">
                  <div>
                    <div className="comments-header">
                      <span className="label-gold">{lang === 'ar' ? 'التعليقات' : 'Comments'}</span>
                      {activeInputSongId !== video.id && (
                        <button
                          className="add-comment-btn"
                          onClick={() => handleAddComment(video.id)}
                        >
                          {lang === 'ar' ? 'أضف تعليق +' : '+ Add comment'}
                        </button>
                      )}
                    </div>

                    {/* Comment Input Area */}
                    {activeInputSongId === video.id && (
                      <div className="comment-input-area" style={{ marginBottom: '15px' }}>
                        <textarea
                          className="comment-textarea"
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            color: isDark ? '#ffffff' : '#000000',
                            borderColor: 'rgba(201, 168, 76, 0.2)',
                          }}
                          value={newCommentText[video.id] || ''}
                          onChange={(e) => setNewCommentText(prev => ({ ...prev, [video.id]: e.target.value }))}
                          placeholder={lang === 'ar' ? 'اكتب تعليقك...' : 'Write your comment...'}
                          autoFocus
                        />

                        <div className="emoji-row">
                          {['😍', '🔥', '❤️', '👏', '🎵', '💯', '😢'].map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="emoji-btn"
                              onClick={() => handleEmojiClick(video.id, emoji)}
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
                              background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                            }}
                            onClick={() => handleCancelComment(video.id)}
                          >
                            {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            className="btn-done"
                            onClick={() => handleSubmitComment(video.id)}
                          >
                            {lang === 'ar' ? 'تم ✓' : 'Done ✓'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Comments Scroll List */}
                    <div className="comments-scroll-list" style={{ maxHeight: '180px' }}>
                      {(comments[video.id] || []).map((comment) => (
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
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  const newText = window.prompt(lang === 'ar' ? 'تعديل التعليق' : 'Edit comment', comment.text);
                                  if (newText && newText.trim() !== '') {
                                    setComments(prev => ({
                                      ...prev,
                                      [video.id]: prev[video.id].map(c => String(c.id) === String(comment.id) ? { ...c, text: newText.trim() } : c)
                                    }));
                                  }
                                }}
                                className="text-blue-400 hover:text-blue-300 p-1"
                                title={lang === 'ar' ? 'تعديل' : 'Edit'}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onMouseDown={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  if (window.confirm(lang === 'ar' ? 'حذف التعليق؟' : 'Delete comment?')) {
                                    setComments(prev => ({
                                      ...prev,
                                      [video.id]: prev[video.id].filter(c => String(c.id) !== String(comment.id))
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
                      <div ref={(el) => { commentsEndRefs.current[video.id] = el; }} />
                    </div>
                  </div>

                  <div className="views-stars-row" style={{ marginTop: '20px' }}>
                    <div className="views-badge">
                      <Eye className="w-4 h-4 shrink-0" />
                      <span>{lang === 'ar' ? `مشاهدة ${video.views ?? "0"}` : `Views ${video.views ?? "0"}`}</span>
                    </div>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span
                          key={num}
                          className={`star ${num <= (hoverStar[video.id] ?? starRatings[video.id] ?? 0) ? 'active' : ''}`}
                          onClick={() => saveRating(video.id, num)}
                          onMouseEnter={() => setHoverStar((prev) => ({ ...prev, [video.id]: num }))}
                          onMouseLeave={() => setHoverStar((prev) => { const n = { ...prev }; delete n[video.id]; return n; })}
                        >★</span>
                      ))}
                    </div>
                  </div>
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
