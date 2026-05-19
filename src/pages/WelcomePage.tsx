import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Play, Music, FileText, Layers, ArrowUpRight, Sparkles } from 'lucide-react';
import darkPhoto from '@/assets/dark-photo.png';
import whitePhoto from '@/assets/white-photo.png';
import homeLogoDark from '@/assets/home-logo-dark.png';
import homeLogoLight from '@/assets/home-logo-light.png';
import nameEnglish from '@/assets/name-english.png';
import nameArabic from '@/assets/name-arabic.png';

import { allSongs as lyricsList } from '@/data/lyricsSongs';
import { allSongs as songsList } from '@/pages/SongsPage';
import { allSongs as melodiesList } from '@/pages/MelodiesPage';
import { allVideos as videosList } from '@/data/videosData';

// --- 3D Depth Tilt Container ---
interface TiltContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxRotate?: number;
  perspective?: number;
  scale?: number;
  easing?: number;
  children: React.ReactNode;
}

const TiltContainer: React.FC<TiltContainerProps> = ({
  maxRotate = 8,
  perspective = 1200,
  scale = 1.02,
  easing = 0.08,
  children,
  className,
  style,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const current = useRef({ rx: 0, ry: 0 });
  const target = useRef({ rx: 0, ry: 0 });
  const rafId = useRef<number>(0);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const animate = () => {
      current.current.rx = lerp(current.current.rx, target.current.rx, easing);
      current.current.ry = lerp(current.current.ry, target.current.ry, easing);
      const { rx, ry } = current.current;
      el.style.transform = `perspective(${perspective}px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${scale},${scale},${scale})`;
      rafId.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = (e.clientX - cx) / (rect.width / 2);
      const ny = (e.clientY - cy) / (rect.height / 2);
      target.current.rx = -ny * maxRotate;
      target.current.ry = nx * maxRotate;
    };

    const handleMouseEnter = () => {
      rafId.current = requestAnimationFrame(animate);
    };

    const handleMouseLeave = () => {
      target.current = { rx: 0, ry: 0 };
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = 0;
      }
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`;
    };

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseenter', handleMouseEnter);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseenter', handleMouseEnter);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [maxRotate, perspective, scale, easing]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        transition: 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease',
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
};

// --- SVG Film Grain Overlay ---
const NoiseOverlay = ({ opacity = 0.04 }: { opacity?: number }) => (
  <div
    aria-hidden="true"
    className="fixed inset-0 pointer-events-none z-50 mix-blend-overlay"
    style={{
      opacity,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
    }}
  />
);

// --- Cover Images ---
const COVER_IMAGES = {
  sultana: 'https://res.cloudinary.com/dq3orhpdj/image/upload/v1777268589/%D8%AA%D9%84%D9%83_%D8%A7%D9%84%D8%B3%D9%8F%D9%84%D8%B7%D8%A7%D9%86%D9%87_cnzxvg_poster.jpg',
  sirr: 'https://res.cloudinary.com/dq3orhpdj/image/upload/v1776510465/%D8%B3%D8%B1_%D9%91%D8%A5%D8%AE%D8%AA%D9%84%D8%A7%D9%81%D9%8A_otkvhz.png',
  layl: 'https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002997/%D9%88%D8%B9%D8%AF%D9%8A_%D8%A7%D9%84%D9%84%D9%8A%D9%84_uxgnfs.png',
};

const WelcomePage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen relative overflow-hidden pb-24 selection:bg-rose-500/30 selection:text-rose-200"
      style={{
        background: isDark
          ? 'radial-gradient(ellipse at 50% 50%, #3d0a12 0%, #1a0509 40%, #0a0205 100%)'
          : 'radial-gradient(ellipse at 50% 50%, #fdfbf7 0%, #f7f3eb 100%)',
      }}
    >
      <NoiseOverlay opacity={isDark ? 0.04 : 0.03} />

      {/* Subtle warm orbs for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] mix-blend-screen welcome-orb-1" style={{ background: isDark ? 'rgba(180, 30, 40, 0.1)' : 'rgba(225, 29, 72, 0.04)' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[140px] mix-blend-screen welcome-orb-2" style={{ background: isDark ? 'rgba(140, 20, 30, 0.08)' : 'rgba(245, 158, 11, 0.03)', animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[30%] w-[25vw] h-[25vw] rounded-full blur-[100px] mix-blend-screen welcome-orb-3" style={{ background: isDark ? 'rgba(160, 30, 25, 0.06)' : 'rgba(220, 38, 38, 0.03)', animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-16 relative z-10">

        {/* ── Photo Container ── */}
        <div className="flex justify-center mb-10 animate-fade-in-up">
          <TiltContainer maxRotate={12} scale={1.03} className="relative group">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 animate-spin-slow" />
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)]">
              <img
                src={isDark ? darkPhoto : whitePhoto}
                alt="Mohamed Ramzi"
                className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
              />
            </div>
          </TiltContainer>
        </div>

        {/* ── Brand Name & Title ── */}
        <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex justify-center mb-4">
            <img
              src={lang === 'ar' ? nameArabic : nameEnglish}
              alt={t('Mohamed Ramzi', 'محمد رمزي')}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-2xl"
            />
          </div>
          <p
            className="text-sm sm:text-base text-foreground/60 tracking-[0.4em] uppercase font-bold"
            style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
          >
            {t('Song Writer & Composer', 'كاتب وملحن أغاني')}
          </p>
        </div>

        {/* ── Central Logo ── */}
        <div className="flex justify-center my-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="animate-float">
            <img
              src={isDark ? homeLogoDark : homeLogoLight}
              alt="MR Logo"
              className="w-48 h-auto sm:w-56 object-contain"
              style={{
                filter: isDark
                  ? 'drop-shadow(0 20px 40px rgba(0,0,0,0.8)) drop-shadow(0 0 20px rgba(225,29,72,0.3))'
                  : 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
              }}
            />
          </div>
        </div>

        {/* ── Welcome Tag ── */}
        <div className="max-w-3xl mx-auto text-center mb-16 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 backdrop-blur-2xl shadow-xl">
            <Sparkles className="w-5 h-5 text-rose-400 animate-pulse" />
            <p
              className="text-lg sm:text-xl text-foreground font-bold tracking-wide"
              style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
            >
              {t(
                "Welcome to the official digital gallery of Mohamed Ramzi's works.",
                'مرحباً بكم في المعرض الرقمي الرسمي لأعمال محمد رمزي.'
              )}
            </p>
            <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
        </div>

        {/* ── Premium Liquid Glass Quote Card ── */}
        <div className="max-w-4xl mx-auto mb-20 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <TiltContainer
            maxRotate={5}
            scale={1.01}
            className="group relative rounded-[2rem] p-8 sm:p-14 text-center overflow-hidden"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.4)',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: isDark
                ? '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 0 40px rgba(255,255,255,0.02)'
                : '0 20px 50px -10px rgba(0,0,0,0.1), inset 0 0 40px rgba(255,255,255,0.3)',
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />

            <p
              className="text-xl sm:text-2xl lg:text-3xl leading-[1.8] text-foreground font-bold relative z-10 max-w-3xl mx-auto"
              style={{
                fontFamily: "'Omnes Arabic', 'DG Forsha', sans-serif",
                textShadow: isDark ? '0 4px 12px rgba(0,0,0,0.9)' : 'none'
              }}
            >
              {t(
                "The difference between the talented and the exceptional is that the talented person is content with their talent and does not make the extra effort to significantly improve upon it, whereas when talent is combined with study, self-improvement, and the ability to keep up with the times, the result is an exceptional person.",
                "الفرق بين الموهوب والمُميز، هو أن الموهوب يكتفي بموهبته ولا يبذل جهد أكثر في عمل تغيير ملحوظ على الموهبة، بينما عندما تجتمع الموهبة مع الدراسة والتطوير من المستوى والقدرة على المواكبة، ينتج شخص مُتميز"
              )}
            </p>
            <div
              className="mt-10 text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 font-extrabold text-xl sm:text-2xl font-subheading flex items-center justify-center gap-3"
              style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
            >
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-rose-400/50" />
              {t("Mohamed Ramzi", "محمد رمزي")}
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-amber-400/50" />
            </div>
          </TiltContainer>
        </div>

        {/* ── Stat Cards ── */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-24 animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          {[
            { count: videosList.length, label: t('Videos', 'فيديوهات'), icon: <Play className="w-6 h-6 text-rose-400" />, glow: 'group-hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] group-hover:border-rose-500/30' },
            { count: songsList.length, label: t('Songs', 'أغاني'), icon: <Music className="w-6 h-6 text-amber-400" />, glow: 'group-hover:shadow-[0_0_30px_rgba(245,158,11,0.3)] group-hover:border-amber-500/30' },
            { count: melodiesList.length, label: t('Melodies', 'ألحان'), icon: <Layers className="w-6 h-6 text-orange-400" />, glow: 'group-hover:shadow-[0_0_30px_rgba(251,146,60,0.3)] group-hover:border-orange-500/30' },
            { count: lyricsList.length, label: t('Lyrics', 'كلمات أغاني'), icon: <FileText className="w-6 h-6 text-teal-400" />, glow: 'group-hover:shadow-[0_0_30px_rgba(20,184,166,0.3)] group-hover:border-teal-500/30' },
          ].map((stat, idx) => (
            <TiltContainer
              key={idx}
              maxRotate={15}
              scale={1.06}
              className={`group flex flex-col items-center justify-center p-6 sm:p-8 rounded-[2rem] transition-all duration-500 cursor-default ${stat.glow}`}
              style={{
                background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.6)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(255, 255, 255, 0.3)',
                borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid rgba(255, 255, 255, 0.6)',
              }}
            >
              <div className="mb-4 p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
                {stat.icon}
              </div>
              <span className="text-4xl sm:text-5xl font-bold text-foreground drop-shadow-lg" style={{ fontFamily: 'VLAX, Cinzel, serif' }}>
                {stat.count}
              </span>
              <span className="text-sm text-foreground/60 mt-2 font-medium tracking-wide uppercase">
                {stat.label}
              </span>
            </TiltContainer>
          ))}
        </div>

        {/* ── Featured Works — Cinema Poster Cards ── */}
        <div className="max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="text-center mb-12">
            <h3
              className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center justify-center gap-3 drop-shadow-lg"
              style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
            >
              <span>{t('Most Popular Works', 'الأكثر شهرة')}</span>
            </h3>
            <p className="text-foreground/50 mt-3 text-sm tracking-wide uppercase font-bold" style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
              {t('Explore the top creations', 'استكشف أهم إبداعات محمد رمزي')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                id: 5,
                title: { ar: 'تِلْكَ السُّلطَانَهْ', en: 'Tilka Al-Sultana' },
                category: { ar: 'فيديو', en: 'Video' },
                path: '/videos?id=5',
                coverImg: COVER_IMAGES.sultana,
                accentColor: 'rgba(225, 29, 72, 0.5)',
                iconOverlay: <Play className="w-10 h-10 text-white drop-shadow-lg" />,
              },
              {
                id: 3,
                title: { ar: 'سرّ إختلافي', en: 'Secret of my Difference' },
                category: { ar: 'أغنية', en: 'Song' },
                path: '/songs?id=3',
                coverImg: COVER_IMAGES.sirr,
                accentColor: 'rgba(245, 158, 11, 0.5)',
                iconOverlay: <Music className="w-10 h-10 text-white drop-shadow-lg" />,
              },
              {
                id: 6,
                title: { ar: 'وعدّي الليل', en: "Wa'addi Al-Layl" },
                category: { ar: 'لحن', en: 'Melody' },
                path: '/melodies?id=6',
                coverImg: COVER_IMAGES.layl,
                accentColor: 'rgba(251, 146, 60, 0.5)',
                iconOverlay: <Layers className="w-10 h-10 text-white drop-shadow-lg" />,
              },
              {
                id: 32,
                title: { ar: 'عندي مناعة', en: 'I Have Immunity' },
                category: { ar: 'كلمات', en: 'Lyrics' },
                path: '/lyrics?id=32',
                coverImg: 'https://res.cloudinary.com/dq3orhpdj/image/upload/v1779197645/%D8%B9%D9%86%D8%AF%D9%8A_%D9%85%D9%86%D8%A7%D8%B9%D9%87_vze40i.png',
                accentColor: 'rgba(20, 184, 166, 0.5)',
                iconOverlay: <FileText className="w-10 h-10 text-white drop-shadow-lg" />,
              },
            ].map((item) => (
              <TiltContainer
                key={item.id}
                maxRotate={10}
                scale={1.04}
                onClick={() => navigate(item.path)}
                className="group cursor-pointer rounded-[1.5rem] overflow-hidden transition-all duration-500 relative"
                style={{
                  boxShadow: isDark
                    ? '0 20px 50px -10px rgba(0,0,0,0.7)'
                    : '0 15px 40px -10px rgba(0,0,0,0.15)',
                }}
              >
                {/* Cover Image */}
                <div className="relative aspect-[3/4] overflow-hidden">
                  {item.coverImg ? (
                    <img
                      src={item.coverImg}
                      alt={lang === 'ar' ? item.title.ar : item.title.en}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: isDark ? 'rgba(15, 8, 10, 0.95)' : 'rgba(240, 235, 230, 0.95)' }}>
                      <div className="transform group-hover:scale-110 transition-transform duration-500 opacity-30">
                        <FileText className="w-24 h-24 text-teal-400" />
                      </div>
                    </div>
                  )}

                  {/* Cinematic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                  {/* Top accent glow on hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${item.accentColor}, transparent 70%)` }}
                  />

                  {/* Play/Icon overlay center */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500">
                      {item.iconOverlay}
                    </div>
                  </div>

                  {/* Bottom content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.25em] text-rose-300/80 mb-2">
                      {lang === 'ar' ? item.category.ar : item.category.en}
                    </span>
                    <h4
                      className="font-bold text-xl sm:text-2xl text-white drop-shadow-lg"
                      style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                    >
                      {lang === 'ar' ? item.title.ar : item.title.en}
                    </h4>

                    <div className="mt-3 flex items-center gap-2 text-xs text-white/60 opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-500 font-bold">
                      <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {lang === 'ar' ? 'استكشاف' : 'Explore'}
                      </span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </TiltContainer>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }

        .welcome-orb-1,
        .welcome-orb-2,
        .welcome-orb-3 {
          animation: welcome-orb-drift 10s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
        }
        .welcome-orb-2 { animation-delay: 3s; animation-duration: 14s; }
        .welcome-orb-3 { animation-delay: 6s; animation-duration: 12s; }

        @keyframes welcome-orb-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(30px, -20px) scale(1.05); }
          100% { transform: translate(-15px, 15px) scale(0.97); }
        }

        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px) scale(0.98); filter: blur(10px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
};

export default WelcomePage;
