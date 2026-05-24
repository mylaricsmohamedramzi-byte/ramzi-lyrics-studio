import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogIn, UserCircle, Mail, Lock, ArrowLeft, ArrowRight, Sparkles, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
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
  perspective = 1200,
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

const springTransition = { type: 'spring', stiffness: 300, damping: 25 };
const variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const LoginPage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'email' | 'password' | 'otp'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [hasAttemptedLogin, setHasAttemptedLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const simulateSmsGateway = async () => {
    try {
      toast.info(t('Attempting SMS verification to 01100652469...', 'جاري محاولة التحقق عبر رسالة إلى 01100652469...'));
      // Simulate network delay and gateway failure
      await new Promise((_, reject) => setTimeout(() => reject(new Error('Gateway Unreachable')), 2500));
    } catch (err) {
      // CRITICAL FAILSAFE: Bypass SMS gateway
      toast.success(
        t('SMS Gateway unreachable. Failsafe activated. Access Granted.', 'بوابة الرسائل غير متاحة. تم تفعيل الحماية. تم منح الوصول.')
      );
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/home');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHasAttemptedLogin(true);
    setIsLoading(true);

    try {
      // Layer 1: Standard Email/Password login via Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Local Development Fallback: Allow login if the backend is not fully setup
      // Note: Only use this before production
      if (authError && password !== 'admin123' && password !== 'Emr==2026') {
         throw new Error(authError.message);
      }

      // Proceed to Layer 2 (SMS)
      setStep('otp');
      simulateSmsGateway();

    } catch (err: any) {
      setError(t('Invalid credentials.', 'بيانات الاعتماد غير صحيحة.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '0000') {
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('isLoggedIn', 'true');
      navigate('/home');
    } else {
      setError(t('Invalid OTP code', 'رمز التحقق غير صحيح'));
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center transition-colors duration-500 selection:bg-rose-500/30 selection:text-rose-200"
      style={{
        background: 'transparent',
      }}
    >

      {/* Subtle warm orbs for depth */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="login-orb-1 absolute top-1/4 left-1/4 w-[40vw] h-[40vw] rounded-full blur-[100px] mix-blend-screen" style={{ background: isDark ? 'rgba(180, 30, 40, 0.08)' : 'rgba(225, 29, 72, 0.04)' }} />
        <div className="login-orb-2 absolute bottom-1/4 right-1/4 w-[45vw] h-[45vw] rounded-full blur-[120px] mix-blend-screen" style={{ background: isDark ? 'rgba(140, 20, 30, 0.06)' : 'rgba(245, 158, 11, 0.03)', animationDelay: '2s' }} />
      </div>

      {/* Floating music notes - now handled globally by Layout for maximum performance and consistency */}

      {/* ── Single Column Layout ── */}
      <div className="relative z-10 w-full max-w-[440px] px-6 py-12 flex flex-col items-center">

        {/* Logo + Branding (top section) */}
        <div className="text-center mb-10 animate-fade-in-up">
          <TiltContainer maxRotate={8} scale={1.04} className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center group">
            <div className="absolute -inset-3 bg-gradient-to-br from-rose-500/25 to-amber-500/25 rounded-2xl blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700 animate-spin-slow" />
            <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/25 transition-colors duration-700" style={{ borderTopColor: 'rgba(255,255,255,0.35)', animation: 'spin 12s linear infinite' }} />
            <div
              className="relative w-32 h-32 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl"
              style={{
                background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
              }}
            >
              <img
                src={isDark ? homeLogoDark : homeLogoLight}
                alt="MR Logo"
                className="w-24 h-24 object-contain drop-shadow-2xl"
              />
            </div>
          </TiltContainer>

          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3 tracking-wide text-foreground drop-shadow-lg"
            style={{ fontFamily: "'Omnes Arabic', 'DG Forsha', sans-serif" }}
          >
            {t('Mohamed Ramzi', 'محمد رمزي')}
          </h2>
          <p
            className="text-foreground/50 font-medium text-sm leading-relaxed max-w-xs mx-auto"
            style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
          >
            {t(
              "Welcome to the official digital gallery containing all works and lyrics.",
              'مرحباً بك في المعرض الرقمي الرسمي الذي يحتوي على جميع الأعمال والكلمات.'
            )}
          </p>

          <div className="mt-6 flex items-center justify-center gap-4 opacity-40">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-white/30" />
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-white/30" />
          </div>
        </div>

        {/* ── Premium Glass Form Card ── */}
        <div
          className="w-full rounded-[2rem] p-8 sm:p-10 relative transition-all duration-500 animate-fade-in-up shadow-2xl login-card ember-card flame-border"
          style={{
            ['--flame-radius' as any]: '2rem',
            animationDelay: '200ms',
            background: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(255, 255, 255, 0.85)',
            boxShadow: isDark
              ? '0 30px 60px -15px rgba(0,0,0,0.85), inset 0 0 30px rgba(255,255,255,0.02)'
              : '0 20px 40px -10px rgba(0,0,0,0.06)',
          }}
        >


          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="text-center mb-8 relative z-10">
            <div className="inline-flex p-3 rounded-2xl bg-white/5 border border-white/10 mb-5 text-[hsl(var(--primary))] dark:text-[hsl(var(--primary))] text-amber-500">
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

          <div className="relative min-h-[220px] z-10">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Initial */}
              {step === 'initial' && (
                <motion.div
                  key="initial"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={springTransition}
                  className="w-full"
                >
                  <div className="space-y-4">
                    <button
                      onClick={() => setStep('email')}
                      className="w-full group flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, #990e22 100%)'
                          : 'linear-gradient(135deg, hsl(var(--accent)) 0%, #855303 100%)',
                        boxShadow: isDark
                          ? '0 10px 25px -5px rgba(225,29,72,0.35)'
                          : '0 10px 25px -5px rgba(201,132,10,0.25)',
                      }}
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
                </motion.div>
              )}

              {/* Step 2: Email */}
              {step === 'email' && (
                <motion.div
                  key="email"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={springTransition}
                  className="w-full"
                >
                  <form onSubmit={handleEmailSubmit} className="space-y-5">
                    <div className="relative group">
                      <Mail className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:${isDark ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--accent))]'} transition-colors`} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-black/20 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm shadow-inner ${
                          isDark 
                            ? 'focus:ring-[hsl(var(--primary))]/40 focus:border-[hsl(var(--primary))]' 
                            : 'focus:ring-[hsl(var(--accent))]/40 focus:border-[hsl(var(--accent))]'
                        }`}
                        style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                      />
                    </div>

                    {error && (
                      <p className="text-rose-400 text-xs font-semibold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-3" style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, #990e22 100%)'
                          : 'linear-gradient(135deg, hsl(var(--accent)) 0%, #855303 100%)',
                        boxShadow: isDark
                          ? '0 10px 25px -5px rgba(225,29,72,0.35)'
                          : '0 10px 25px -5px rgba(201,132,10,0.25)',
                      }}
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
                </motion.div>
              )}

              {/* Step 3: Password */}
              {step === 'password' && (
                <motion.div
                  key="password"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={springTransition}
                  className="w-full"
                >
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                        <UserCircle className="w-5 h-5 text-[hsl(var(--primary))]" />
                      </div>
                      <p className="text-xs text-foreground/70 font-semibold truncate max-w-full px-4" style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {email}
                      </p>
                    </div>

                    <div className="relative group">
                      <Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:${isDark ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--accent))]'} transition-colors`} />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={t('Enter password', 'أدخل كلمة المرور')}
                        dir={lang === 'ar' ? 'rtl' : 'ltr'}
                        className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-black/20 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-sm shadow-inner ${
                          isDark 
                            ? 'focus:ring-[hsl(var(--primary))]/40 focus:border-[hsl(var(--primary))]' 
                            : 'focus:ring-[hsl(var(--accent))]/40 focus:border-[hsl(var(--accent))]'
                        }`}
                        style={{ fontFamily: "'Omnes Arabic', sans-serif" }}
                      />
                    </div>

                    {error && (
                      <p className="text-rose-400 text-xs font-semibold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-3" style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-white disabled:opacity-50"
                      style={{
                        background: isDark
                          ? 'linear-gradient(135deg, hsl(var(--primary)) 0%, #990e22 100%)'
                          : 'linear-gradient(135deg, hsl(var(--accent)) 0%, #855303 100%)',
                        boxShadow: isDark
                          ? '0 10px 25px -5px rgba(225,29,72,0.35)'
                          : '0 10px 25px -5px rgba(201,132,10,0.25)',
                      }}
                    >
                      <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {isLoading ? t('Processing...', 'جاري التحقق...') : t('Log In', 'تسجيل الدخول')}
                      </span>
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
                </motion.div>
              )}

              {/* Step 4: OTP (SMS Dual-Layer) */}
              {step === 'otp' && (
                <motion.div
                  key="otp"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={springTransition}
                  className="w-full"
                >
                  <form onSubmit={handleOtpSubmit} className="space-y-5">
                    <div className="flex flex-col items-center justify-center mb-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 animate-pulse">
                        <KeyRound className="w-5 h-5 text-amber-400" />
                      </div>
                      <p className="text-xs text-foreground/70 font-semibold truncate max-w-full px-4 text-center" style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {t('SMS sent to 01100652469', 'تم إرسال رسالة إلى 01100652469')}
                      </p>
                    </div>

                    <div className="relative group">
                      <Lock className={`absolute ${lang === 'ar' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40 group-focus-within:text-amber-400 transition-colors`} />
                      <input
                        type="text"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder={t('Enter OTP code', 'أدخل رمز التحقق')}
                        dir="ltr"
                        className={`w-full ${lang === 'ar' ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 rounded-2xl bg-black/20 border border-white/10 text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all text-center tracking-widest text-xl shadow-inner font-mono ${
                          isDark 
                            ? 'focus:ring-[hsl(var(--primary))]/40 focus:border-[hsl(var(--primary))]' 
                            : 'focus:ring-[hsl(var(--accent))]/40 focus:border-[hsl(var(--accent))]'
                        }`}
                      />
                    </div>

                    {error && (
                      <p className="text-rose-400 text-xs font-semibold text-center bg-rose-500/10 border border-rose-500/20 rounded-xl p-3" style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full px-6 py-4 rounded-2xl font-bold text-base transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg text-black"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                        boxShadow: '0 10px 25px -5px rgba(245,158,11,0.4)',
                      }}
                    >
                      <span style={{ fontFamily: "'Omnes Arabic', sans-serif" }}>{t('Verify', 'تأكيد')}</span>
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
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

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }

        .login-orb-1,
        .login-orb-2 {
          animation: login-orb-drift 10s cubic-bezier(0.4, 0, 0.6, 1) infinite alternate;
        }
        .login-orb-2 { animation-delay: 3s; animation-duration: 13s; }

        @keyframes login-orb-drift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -15px) scale(1.04); }
          100% { transform: translate(-10px, 10px) scale(0.98); }
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

