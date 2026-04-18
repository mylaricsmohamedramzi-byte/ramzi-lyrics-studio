import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { LogIn, UserCircle, Mail, Lock } from 'lucide-react';
import homeLogoDark from '@/assets/home-logo-dark.png';
import homeLogoLight from '@/assets/home-logo-light.png';

const AUTHORIZED_EMAILS = [
  'mylaricsmohamedramzi@gmail.com',
  'eng.mohamedramzi@gmail.com',
  'musichosic@gmail.com',
];

const MUSIC_NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢'];

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
          'You does not have permission, try to log with Visit as Guest',
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
    <div className="min-h-screen relative overflow-hidden flex">
      {/* Floating music notes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {MUSIC_NOTES.map((note, i) => (
          <span
            key={i}
            className="absolute text-primary/10 select-none"
            style={{
              fontSize: `${20 + Math.random() * 30}px`,
              left: `${10 + i * 15}%`,
              animation: `floatNote ${6 + i * 2}s ease-in-out infinite`,
              animationDelay: `${i * 0.8}s`,
              top: '100%',
            }}
          >
            {note}
          </span>
        ))}
      </div>

      {/* Left decorative panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5" />
        <div className="relative z-10 text-center max-w-md">
          <img
            src={isDark ? homeLogoDark : homeLogoLight}
            alt="MR Logo"
            className="w-32 h-32 mx-auto mb-8 object-contain"
            style={{
              animation: 'float 4s ease-in-out infinite',
              filter: isDark ? 'drop-shadow(0 0 20px rgba(192,39,45,0.3))' : 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))',
            }}
          />
          <h2
            className="text-3xl font-heading font-bold mb-6"
            style={{
              background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {t('Mohamed Ramzi', 'محمد رمزي')}
          </h2>
          <p className="text-foreground/60 font-body text-lg leading-relaxed">
            {t(
              "Welcome to the only official website that contains all of Mohamed Ramzi's works and lyrics",
              'مرحباً بك في الموقع الرسمي الوحيد الذي يحتوي على جميع أعمال وكلمات محمد رمزي'
            )}
          </p>
          {/* Decorative line */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="text-primary/40 text-xl">♪</span>
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-up">
            <img
              src={isDark ? homeLogoDark : homeLogoLight}
              alt="MR Logo"
              className="w-20 h-20 mx-auto mb-4 object-contain"
            />
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-8 border border-border/30 animate-fade-in-up"
            style={{
              background: isDark
                ? 'rgba(20, 5, 8, 0.85)'
                : 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="text-center mb-8">
              <UserCircle className="w-14 h-14 mx-auto text-primary/60 mb-3" />
              <h1
                className="text-2xl sm:text-3xl font-heading font-bold mb-2"
                style={{
                  background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {t('Welcome Back', 'مرحباً بعودتك')}
              </h1>
              <p className="text-muted-foreground font-body text-sm">
                {t('Sign in to manage your content', 'سجل الدخول لإدارة المحتوى')}
              </p>
            </div>

            {step === 'initial' && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep('email')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #3d0a12 0%, #c0272d 100%)',
                    color: '#f0e8e0',
                  }}
                >
                  <LogIn className="w-5 h-5" />
                  {t('Log In', 'تسجيل الدخول')}
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl border border-border/50 bg-card/50 text-foreground hover:bg-muted/50 transition-all font-semibold text-lg"
                >
                  <UserCircle className="w-5 h-5" />
                  {t('Visit as Guest', 'زيارة كضيف')}
                </button>
              </div>
            )}

            {step === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                    className="w-full pl-11 pr-4 py-4 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-base"
                  />
                </div>
                {error && (
                  <p className="text-destructive text-sm font-body text-center bg-destructive/10 rounded-lg p-3">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #3d0a12 0%, #c0272d 100%)',
                    color: '#f0e8e0',
                  }}
                >
                  {t('Continue', 'متابعة')}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('initial'); setError(''); }}
                  className="w-full px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-all text-sm"
                >
                  {t('← Back', '→ رجوع')}
                </button>
              </form>
            )}

            {step === 'password' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-2">{email}</p>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('Enter password', 'أدخل كلمة المرور')}
                    className="w-full pl-11 pr-4 py-4 rounded-xl bg-background/50 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-base"
                  />
                </div>
                {error && (
                  <p className="text-destructive text-sm font-body text-center bg-destructive/10 rounded-lg p-3">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: 'linear-gradient(135deg, #3d0a12 0%, #c0272d 100%)',
                    color: '#f0e8e0',
                  }}
                >
                  {t('Log In', 'تسجيل الدخول')}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); setPassword(''); }}
                  className="w-full px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-all text-sm"
                >
                  {t('← Back', '→ رجوع')}
                </button>
              </form>
            )}
          </div>

          {/* Admin note - only after failed attempt */}
          {hasAttemptedLogin && (
            <p className="text-center text-xs text-muted-foreground mt-6 animate-fade-in">
              {t(
                'Admin access requires authorized credentials.',
                'يتطلب الوصول للمسؤول بيانات اعتماد مصرح بها.'
              )}
            </p>
          )}
        </div>
      </div>

      {/* CSS for floating notes */}
      <style>{`
        @keyframes floatNote {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
