import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogIn, UserCircle, Mail, Lock, ArrowLeft, ArrowRight } from 'lucide-react';
import homeLogoDark from '@/assets/home-logo-dark.png';
import homeLogoLight from '@/assets/home-logo-light.png';

const AUTHORIZED_EMAILS = [
  'mylaricsmohamedramzi@gmail.com',
  'eng.mohamedramzi@gmail.com',
  'musichosic@gmail.com',
];

const MUSIC_NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♯', '♪', '♫'];

// --- 3D Depth Tilt Container ---
interface TiltContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxRotate?: number;
  perspective?: number;
  scale?: number;
  easing?: number;
  children: React.ReactNode;
}

const TiltContainer: React.FC<TiltContainerProps> = ({
  maxRotate = 5,
  perspective = 1000,
  scale = 1.01,
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
        transition: 'transform 0.15s ease-out', 
        ...style 
      }} 
      {...props}
    >
      {children}
    </div>
  );
};

const LoginPage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'email' | 'password'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const normalized = email.trim().toLowerCase();
    if (AUTHORIZED_EMAILS.includes(normalized)) {
      setStep('password');
    } else {
      setError(
        t(
          'You do not have permission, try to log with Visit as Guest',
          'ليس لديك إذن، حاول تسجيل الدخول كزائر'
        )
      );
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHasAttemptedLogin(true);
    setError(t('Invalid credentials.', 'بيانات الاعتماد غير صحيحة.'));
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex transition-colors duration-500 login-mesh-bg selection:bg-rose-500/30 selection:text-rose-200">
      
      {/* Draftly.ai Style Background Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
        <div className="absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full bg-rose-600/10 blur-[100px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px] mix-blend-screen animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Floating music notes - Highly subtle */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-30">
        {MUSIC_NOTES.map((note, i) => (
          <span
            key={i}
            className="absolute text-white/10 select-none animate-float-login-note"
            style={{
              fontSize: `${18 + (i * 4) % 16}px`,
              left: `${8 + i * 9.5}%`,
              animationDuration: `${12 + (i * 3) % 8}s`,
              animationDelay: `${i * 0.9}s`,
              top: '110%',
            }}
          >
            {note}
          </span>
        ))}
      </div>

      {/* Left decorative panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden border-r border-white/[0.03]">
        <div className="relative z-10 text-center max-w-md animate-fade-in-up">
          
          {/* Animated Halo Logo Container */}
          <TiltContainer maxRotate={8} scale={1.04} className="relative w-56 h-56 mx-auto mb-10 flex items-center justify-center group">
            {/* Soft inner glow */}
            <div className="absolute -inset-4 bg-gradient-to-br from-rose-500/30 to-violet-500/30 rounded-full blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-700 animate-spin-slow" />
            
            {/* Spinning Glass Ring */}
            <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-white/30 transition-colors duration-700" style={{ borderTopColor: 'rgba(255,255,255,0.4)', animation: 'spin 10s linear infinite' }} />
            
            {/* Static Inner Glass Circle */}
            <div 
              className="relative w-44 h-44 rounded-full flex items-center justify-center overflow-hidden shadow-2xl transition-transform duration-500"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <img
                src={isDark ? homeLogoDark : homeLogoLight}
                alt="MR Logo"
                className="w-32 h-32 object-contain drop-shadow-2xl"
              />
            </div>
          </TiltContainer>

          <h2
            className="text-3xl font-extrabold mb-4 tracking-wide text-foreground drop-shadow-lg"
            style={{ fontFamily: "'Omnes Arabic', 'DG Forsha', sans-serif" }}
          >
            {t('Mohamed Ramzi', 'محمد رمزي')}
          </h2>
          
          <p 
            className="text-foreground/50 font-medium text-sm sm:text-base leading-relaxed max-w-sm mx-auto"
            style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
          >
            {t(
              "Welcome to the official digital gallery containing all works and lyrics.",
              'مرحباً بك في المعرض الرقمي الرسمي الذي يحتوي على جميع الأعمال والكلمات.'
            )}
          </p>

          {/* Decorative Minimal Divider */}
          <div className="mt-10 flex items-center justify-center gap-4 opacity-50">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
            <Sparkles className="w-4 h-4 text-white" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-[420px]">
          
          {/* Mobile logo header */}
          <div className="lg:hidden text-center mb-10 animate-fade-in-up">
            <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500/20 to-violet-500/20 blur-xl animate-pulse-slow" />
              <img
                src={isDark ? homeLogoDark : homeLogoLight}
                alt="MR Logo"
                className="w-24 h-24 object-contain drop-shadow-2xl relative z-10"
              />
            </div>
          </div>

          {/* Premium Liquid Glass Form Card */}
          <div
            className="rounded-[2rem] p-8 sm:p-12 relative overflow-hidden transition-all duration-500 animate-fade-in-up shadow-2xl"
            style={{
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.4)',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.8)',
              boxShadow: isDark 
                ? '0 30px 60px -15px rgba(0,0,0,0.8), inset 0 0 30px rgba(255,255,255,0.01)'
                : '0 20px 40px -10px rgba(0,0,0,0.08)',
            }}
          >
            <div className="text-center mb-10 relative z-10">
              <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-5 text-rose-400">
                <LogIn className="w-6 h-6" />
              </div>
              <h1
                className="text-2xl sm:text-3xl font-extrabold mb-2 text-foreground drop-shadow-md"
                style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
              >
                {t('Welcome Back', 'مرحباً بعودتك')}
              </h1>
              <p 
                className="text-foreground/50 text-xs sm:text-sm font-semibold tracking-wide"
                style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
              >
                {t('Sign in to manage your content', 'سجل الدخول لإدارة المحتوى')}
              </p>
            </div>

            <div className="relative min-h-[220px]">
              {/* Step 1: Initial buttons */}
              <div className={`absolute inset-0 transition-all duration-500 ${step === 'initial' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-8 pointer-events-none'}`}>
                <div className="space-y-4">
                  <button
                    onClick={() => setStep('email')}
                    className="w-full group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
                  >
                    <LogIn className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                    <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>{t('Log In', 'تسجيل الدخول')}</span>
                  </button>
                  
                  <button
                    onClick={() => navigate('/home')}
                    className="w-full group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border border-white/10 bg-white/5 text-foreground hover:bg-white/10 transition-all duration-300 font-bold text-base hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <UserCircle className="w-5 h-5 text-foreground/60 group-hover:text-foreground transition-colors" />
                    <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>{t('Visit as Guest', 'زيارة كضيف')}</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Email entry */}
              <div className={`absolute inset-0 transition-all duration-500 ${step === 'email' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div className="relative group">
                    <Mail className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-rose-400 transition-colors`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-black/20 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all text-sm shadow-inner`}
                      style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                    />
                  </div>
                  
                  {error && step === 'email' && (
                    <p 
                      className="text-rose-400 text-xs font-semibold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 animate-fade-in-up"
                      style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
                  >
                    <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>{t('Continue', 'متابعة')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('initial'); setError(''); }}
                    className="w-full py-2 flex items-center justify-center gap-2 text-foreground/50 hover:text-foreground transition-colors font-semibold text-xs uppercase tracking-wider"
                    style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                  >
                    {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('Back', 'رجوع')}
                  </button>
                </form>
              </div>

              {/* Step 3: Password entry */}
              <div className={`absolute inset-0 transition-all duration-500 ${step === 'password' ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-8 pointer-events-none'}`}>
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="flex flex-col items-center justify-center mb-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                      <UserCircle className="w-5 h-5 text-rose-400" />
                    </div>
                    <p 
                      className="text-xs text-foreground/70 font-semibold truncate max-w-full px-4"
                      style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                    >
                      {email}
                    </p>
                  </div>
                  
                  <div className="relative group">
                    <Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-rose-400 transition-colors`} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Enter password', 'أدخل كلمة المرور')}
                      dir={lang === 'ar' ? 'rtl' : 'ltr'}
                      className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-black/20 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-1 focus:ring-rose-500/50 focus:border-rose-500/50 transition-all text-sm shadow-inner`}
                      style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                    />
                  </div>

                  {error && step === 'password' && (
                    <p 
                      className="text-rose-400 text-xs font-semibold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 animate-fade-in-up"
                      style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                    >
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                    style={{ background: 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)' }}
                  >
                    <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>{t('Log In', 'تسجيل الدخول')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('email'); setError(''); setPassword(''); }}
                    className="w-full py-2 flex items-center justify-center gap-2 text-foreground/50 hover:text-foreground transition-colors font-semibold text-xs uppercase tracking-wider"
                    style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                  >
                    {lang === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {t('Back', 'رجوع')}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {hasAttemptedLogin && (
            <p 
              className="text-center text-[11px] text-foreground/40 mt-8 animate-fade-in uppercase tracking-widest font-bold"
              style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
            >
              {t(
                'Admin access requires authorized credentials.',
                'يتطلب الوصول للمسؤول بيانات اعتماد مصرح بها.'
              )}
            </p>
          )}
        </div>
      </div>

      <style>{`
        /* Next-Gen Obsidian Background */
        .login-mesh-bg {
          background-color: #030305;
        }
        .light .login-mesh-bg {
          background-color: #f8fafc;
        }

        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes floatLoginNote {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-120vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-login-note {
          animation: floatLoginNote 15s linear infinite;
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px) scale(0.98); filter: blur(5px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
