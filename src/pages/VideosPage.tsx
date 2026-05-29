import { useState, useRef, useMemo, useEffect, type MouseEvent } from 'react';
import { useLocation } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { translateTitle } from '@/utils/songTranslations';
import { allVideos } from '@/data/videosData';

interface CommentItem {
  id: string;
  text: string;
}

const VID_CATEGORIES: { key: string; ar: string; en: string; match: (c: string) => boolean; order: number }[] = [
  { key: 'all', ar: 'الكل', en: 'All', match: () => true, order: 0 },
  { key: 'islamic', ar: 'إسلامي', en: 'Islamic', match: (c) => /islamic|إسلامي/i.test(c), order: 1 },
  { key: 'patriotic', ar: 'وطني', en: 'Patriotic', match: (c) => /patriotic|وطني/i.test(c), order: 2 },
  { key: 'social', ar: 'اجتماعي وعائلي', en: 'Social & Family', match: (c) => /social|family|اجتماعي|عائلي/i.test(c), order: 3 },
  { key: 'occasion', ar: 'مناسبات و أعياد', en: 'Occasion & Holiday', match: (c) => /occasion|holiday|مناسبات|أعياد/i.test(c), order: 4 },
  { key: 'motivational', ar: 'تحفيزية', en: 'Motivational', match: (c) => /motivational|تحفيزية|تحفيز/i.test(c), order: 5 },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /poems|قصائد|قصيدة/i.test(c), order: 6 },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /classic|كلاسيك/i.test(c), order: 7 },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /drama|دراما/i.test(c), order: 8 },
  { key: 'slow', ar: 'سلو', en: 'Slow', match: (c) => /slow|سلو/i.test(c), order: 9 },
  { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c) => /romantic|رومانسي/i.test(c) && !/maqsum|مقسوم/i.test(c), order: 10 },
  { key: 'romantic_maqsum', ar: 'رومانسي & مقسوم', en: 'Romantic & Maqsum', match: (c) => /رومانسي\s*&\s*مقسوم/i.test(c) || (/romantic/i.test(c) && /maqsum/i.test(c)), order: 11 },
  { key: 'pop', ar: 'بوب', en: 'Pop', match: (c) => /pop|بوب/i.test(c), order: 12 },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /rock|روك/i.test(c), order: 13 },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /maqsum|مقسوم/i.test(c) && !/romantic|رومانسي/i.test(c), order: 14 },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /tarab|طرب/i.test(c), order: 15 },
  { key: 'shaabi', ar: 'شعبي', en: 'Shaabi', match: (c) => /shaabi|شعبي/i.test(c), order: 16 },
  { key: 'saidi', ar: 'صعيدي', en: "Sa'idi", match: (c) => /sa'idi|saidi|صعيدي/i.test(c), order: 17 },
  { key: 'rap', ar: 'راب', en: 'Rap', match: (c) => /rap|راب/i.test(c) && !/trap|تراب/i.test(c), order: 18 },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /trap|تراب/i.test(c), order: 19 },
];

function getCategoryOrder(category: string): number {
  const match = VID_CATEGORIES.find((c) => c.key !== 'all' && c.match(category || ''));
  return match ? match.order : 99;
}

/** Resolves any video URL (YouTube, Google Drive, direct mp4) into a playable embed descriptor. */
function resolveVideoSource(url: string): { type: 'iframe' | 'video'; src: string } {
  const trimmed = (url || '').trim();
  if (!trimmed) return { type: 'iframe', src: '' };

  // YouTube
  const ytMatch =
    trimmed.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) ||
    trimmed.match(/youtube\.com\/(?:watch\?v=|embed\/)([A-Za-z0-9_-]{6,})/);
  if (ytMatch) {
    return { type: 'iframe', src: `https://www.youtube.com/embed/${ytMatch[1]}` };
  }

  // Google Drive
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return { type: 'iframe', src: `https://drive.google.com/file/d/${driveMatch[1]}/preview` };
  }

  // Direct video files (mp4, webm, mov) or Cloudinary video delivery
  if (/\.(mp4|webm|mov)(\?|$)/i.test(trimmed) || /\/video\/upload\//.test(trimmed)) {
    return { type: 'video', src: trimmed };
  }

  return { type: 'iframe', src: trimmed };
}

const VideosPage = () => {
  const { lang, t } = useLang();
  const { isDark } = useTheme();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  useEffect(() => {
    setIsAdmin(localStorage.getItem('isAdmin') === 'true');
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
    const saved = localStorage.getItem('videos_star_ratings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });
  const [hoverStar, setHoverStar] = useState<Record<number, number>>({});

  const [comments, setComments] = useState<Record<number, CommentItem[]>>(() => {
    const saved = localStorage.getItem('videos_comments');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
  const [activeInputSongId, setActiveInputSongId] = useState<number | null>(null);
  const commentsEndRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    localStorage.setItem('videos_star_ratings', JSON.stringify(starRatings));
  }, [starRatings]);

  useEffect(() => {
    localStorage.setItem('videos_comments', JSON.stringify(comments));
  }, [comments]);

  const presentCategoryKeys = useMemo(() => {
    const keys = new Set<string>();
    allVideos.forEach((v) => {
      const match = VID_CATEGORIES.find((c) => c.key !== 'all' && c.match(v.category || ''));
      if (match) keys.add(match.key);
    });
    return keys;
  }, []);

  const visibleCategories = useMemo(
    () => VID_CATEGORIES.filter((c) => c.key === 'all' || presentCategoryKeys.has(c.key)),
    [presentCategoryKeys]
  );

  const filteredVideos = useMemo(() => {
    const q = normalizeArabic(search);
    const cat = VID_CATEGORIES.find((c) => c.key === activeCat) || VID_CATEGORIES[0];
    return allVideos
      .filter((v) => {
        if (!cat.match(v.category || '')) return false;
        if (!q) return true;
        const hay = [v.title, v.category].join(' ');
        return normalizeArabic(hay).includes(q);
      })
      .slice()
      .sort((a, b) => getCategoryOrder(a.category) - getCategoryOrder(b.category));
  }, [search, activeCat]);

  const getCategoryLabel = (category: string) => {
    const matched = VID_CATEGORIES.find((c) => c.key !== 'all' && c.match(category || ''));
    if (matched) return lang === 'ar' ? matched.ar : matched.en;
    return category || (lang === 'ar' ? 'عام' : 'General');
  };

  const handleAddComment = (videoId: number) => {
    setActiveInputSongId(videoId);
  };

  const handleCancelComment = (videoId: number) => {
    setActiveInputSongId(null);
    setNewCommentText(prev => ({ ...prev, [videoId]: '' }));
  };

  const handleSubmitComment = (videoId: number) => {
    const txt = newCommentText[videoId]?.trim();
    if (!txt) {
      setActiveInputSongId(null);
      return;
    }
    const newComment: CommentItem = { id: `comment-${videoId}-${Date.now()}`, text: txt };
    setComments(prev => ({
      ...prev,
      [videoId]: [...(prev[videoId] || []), newComment]
    }));
    setNewCommentText(prev => ({ ...prev, [videoId]: '' }));
    setActiveInputSongId(null);

    setTimeout(() => {
      const el = commentsEndRefs.current[videoId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleEmojiClick = (videoId: number, emoji: string) => {
    setNewCommentText(prev => ({
      ...prev,
      [videoId]: (prev[videoId] || '') + emoji
    }));
  };

  const handleEditComment = (
    e: MouseEvent<HTMLButtonElement>,
    videoId: number,
    commentId: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    const newText = window.prompt(lang === 'ar' ? 'تعديل التعليق' : 'Edit comment');
    if (newText && newText.trim() !== '') {
      setComments(prev => ({
        ...prev,
        [videoId]: (prev[videoId] || []).map(c =>
          String(c.id) === String(commentId) ? { ...c, text: newText.trim() } : c
        )
      }));
    }
  };

  const handleDeleteComment = (
    e: MouseEvent<HTMLButtonElement>,
    videoId: number,
    commentId: string
  ) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(lang === 'ar' ? 'حذف التعليق؟' : 'Delete comment?')) {
      setComments(prev => ({
        ...prev,
        [videoId]: (prev[videoId] || []).filter(c => String(c.id) !== String(commentId))
      }));
    }
  };

  const saveRating = (videoId: number, val: number) => {
    setStarRatings(prev => ({ ...prev, [videoId]: val }));
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="page-wrapper content-layer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');

        :root { --leather-black: #0a0205; }
        .page-wrapper { min-height: 100vh; padding: 40px 20px; font-family: 'Outfit', 'Almarai', sans-serif; position: relative; overflow: hidden; }
        .main-card { max-width: 1100px; margin: 0 auto 60px; background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, var(--leather-black) 100%); border: 1px solid var(--primary); border-radius: 40px; display: flex; flex-direction: ${lang === 'ar' ? 'row-reverse' : 'row'}; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8); position: relative; }

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

        .comments-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .label-gold { color: #c9a84c; font-size: 14px; font-weight: bold; }
        .add-comment-btn { background: rgba(201, 168, 76, 0.15); color: #c9a84c; border: 1px solid rgba(201, 168, 76, 0.3); padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s; }
        .add-comment-btn:hover { background: rgba(201, 168, 76, 0.3); }
        .comment-input-area { display: flex; flex-direction: column; gap: 10px; margin-bottom: 15px; background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 15px; border: 1px solid rgba(201, 168, 76, 0.15); }
        .comment-textarea { width: 100%; min-height: 80px; border-radius: 10px; padding: 10px; font-size: 14px; resize: none; outline: none; direction: rtl; }
        .emoji-row { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-start; }
        .emoji-btn { background: none; border: none; font-size: 20px; cursor: pointer; transition: transform 0.1s; }
        .emoji-btn:hover { transform: scale(1.2); }
        .action-buttons { display: flex; gap: 10px; justify-content: flex-end; }
        .btn-done { background: #c9a84c; color: #0a0205; border: none; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .btn-done:hover { background: #d4b563; }
        .btn-cancel { border: none; padding: 6px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; transition: background 0.2s; }
        .comments-scroll-list { max-height: 180px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; padding-right: 5px; scrollbar-width: thin; scrollbar-color: #c9a84c transparent; }
        .comments-scroll-list::-webkit-scrollbar { width: 4px; }
        .comments-scroll-list::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }
        .comment-bubble { border-radius: 15px; padding: 10px 14px; font-size: 13px; animation: slideUpFade 0.3s ease-out forwards; }
        @keyframes slideUpFade { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }

        .player-side { flex: 1; padding: 30px; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; }
        .song-tag { background: #c9a84c; color: #000; padding: 4px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
        .video-frame-box { width: 100%; aspect-ratio: 16 / 9; border-radius: 20px; overflow: hidden; border: 1px solid rgba(201, 168, 76, 0.3); background: #000; }
        .video-frame-box iframe, .video-frame-box video { width: 100%; height: 100%; border: 0; display: block; }
        .multi-video-stack { display: flex; flex-direction: column; gap: 14px; width: 100%; }

        .views-stars-row { display: flex; align-items: center; justify-content: space-between; width: 100%; margin-top: 15px; gap: 10px; }
        .views-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(201, 168, 76, 0.12); border: 1px solid rgba(201, 168, 76, 0.35); color: #c9a84c; padding: 6px 16px; border-radius: 20px; font-weight: bold; font-size: 13px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.3); flex-shrink: 0; font-family: 'Almarai', 'Outfit', sans-serif; }
        .views-badge:hover { background: rgba(201, 168, 76, 0.25); border-color: #c9a84c; transform: translateY(-1px); }

        .star-rating { display: flex; justify-content: center; gap: 4px; margin: 10px 0; }
        .star { font-size: 24px; cursor: pointer; color: rgba(201,168,76,0.25); transition: color 0.2s, text-shadow 0.2s; user-select: none; }
        .star.active { color: #c9a84c; text-shadow: 0 0 8px rgba(201,168,76,0.7); }

        .lyrics-side { flex: 1.3; padding: 40px; background: rgba(20, 5, 8, 0.82); border-left: 1px solid rgba(201,168,76,0.2); position: relative; z-index: 1; }
        .title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .song-title-red { color: #ff4d4d; font-family: 'Aref Ruqaa Ink', serif; font-size: 2.8rem; margin-bottom: 0; }
        .lyrics-scroll { height: 250px; overflow-y: auto; margin-bottom: 30px; }
        .lyrics-scroll::-webkit-scrollbar { width: 6px; }
        .lyrics-scroll::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }
        .line { font-size: 1.2rem; margin-bottom: 10px; border-right: 3px solid #c9a84c; padding-right: 15px; }
        .line.red { color: #ff4d4d; border-right-color: #ff4d4d; font-weight: bold; }

        .critic-item { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; margin-bottom: 8px; display: flex; gap: 8px; border: 1px solid rgba(201,168,76,0.1); color: #fff; font-size: 0.95rem; }
        .critic-dot { color: #c9a84c; flex-shrink: 0; }
      `}</style>

      <div className="unified-header-box animate-fade-in-up">
        <h1 className="unified-header-title">{t('VIDEOS', 'الفيديوهات')}</h1>
        <p className="unified-header-subtitle">
          {t(
            'Visual interpretations crafted to bring the meaning of the lyrics to life',
            'رؤى بصرية صُممت لإيصال معنى الكلمات وإحيائها'
          )}
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto 30px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder={lang === 'ar' ? 'ابحث عن فيديو...' : 'Search for a video...'}
          className="mb-5"
        />
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

      {filteredVideos.map((video) => (
        <div key={video.id} id={`card-${video.id}`} className="main-card relative group">

          {isAdmin && (
            <div className="absolute top-4 left-4 z-50 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                onClick={(e) => {
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

          <div className="player-side">
            <div className="song-tag">{getCategoryLabel(video.category)}</div>

            <div className="multi-video-stack">
              {(video.videoUrls || []).map((url, idx) => {
                const resolved = resolveVideoSource(url);
                return (
                  <div key={idx} className="video-frame-box">
                    {resolved.type === 'video' ? (
                      <video src={resolved.src} controls preload="metadata" />
                    ) : (
                      <iframe
                        src={resolved.src}
                        title={`${video.title} - ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="views-stars-row">
              <div className="views-badge">
                <Eye className="w-4 h-4 shrink-0" />
                <span>{lang === 'ar' ? `مشاهدة ${video.views ?? '0'}` : `Views ${video.views ?? '0'}`}</span>
              </div>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}
                    className={`star ${num <= (hoverStar[video.id] ?? starRatings[video.id] ?? 0) ? 'active' : ''}`}
                    onClick={() => saveRating(video.id, num)}
                    onMouseEnter={() => setHoverStar((prev) => ({ ...prev, [video.id]: num }))}
                    onMouseLeave={() => setHoverStar((prev) => { const n = { ...prev }; delete n[video.id]; return n; })}
                  >★</span>
                ))}
              </div>
            </div>

            {Array.isArray(video.critics) && video.critics.length > 0 && (
              <div style={{ width: '100%', marginTop: 18 }}>
                <span className="label-gold">{lang === 'ar' ? 'ملاحظات نقدية' : 'Critique notes'}</span>
                <div style={{ marginTop: 10 }}>
                  {video.critics.map((c, i) => (
                    <div key={i} className="critic-item">
                      <span className="critic-dot">◆</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lyrics-side">
            <span className="label-gold">{lang === 'ar' ? 'كلمات الأغنية' : 'Lyrics'}</span>
            <div className="title-row">
              <h2 className="song-title-red">{translateTitle(video.title, lang)}</h2>
            </div>
            <div className="lyrics-scroll">
              {(video.lyrics || []).map((l, i) => (
                <div key={i} className={`line ${l.red ? 'red' : ''}`}>{l.text}</div>
              ))}
            </div>

            {/* Comments block */}
            <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(201, 168, 76, 0.2)' }}>
              <div className="comments-header" style={{ marginTop: '15px' }}>
                <span className="label-gold">{lang === 'ar' ? 'التعليقات' : 'Comments'}</span>
                {isAdmin && activeInputSongId !== video.id && (
                  <button
                    className="add-comment-btn"
                    onClick={() => handleAddComment(video.id)}
                  >
                    {lang === 'ar' ? 'أضف تعليق +' : '+ Add comment'}
                  </button>
                )}
              </div>

              {/* Comment Input Area (admin only) */}
              {isAdmin && activeInputSongId === video.id && (
                <div className="comment-input-area">
                  <textarea
                    className="comment-textarea"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      borderColor: isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(201, 168, 76, 0.4)',
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
                        background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f3f3',
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
              <div className="comments-scroll-list" style={{ maxHeight: '140px' }}>
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
                          type="button"
                          onClick={(e) => handleEditComment(e, video.id, comment.id)}
                          className="text-blue-400 hover:text-blue-300 p-1"
                          title={lang === 'ar' ? 'تعديل' : 'Edit'}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteComment(e, video.id, comment.id)}
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
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosPage;
