import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '@/contexts/LangContext';
import { LogIn, UserCircle, Mail, Lock, KeyRound } from 'lucide-react';

const AUTHORIZED_EMAILS = [
  'mylaricsmohamedramzi@gmail.com',
  'eng.mohamedramzi@gmail.com',
  'musichosic@gmail.com',
];

const LoginPage = () => {
  const { t } = useLang();
  const navigate = useNavigate();
  const [step, setStep] = useState<'initial' | 'email' | 'password'>('initial');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

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
    // TODO: integrate with Supabase auth
    setError(t('Invalid credentials.', 'بيانات الاعتماد غير صحيحة.'));
  };

  return (
    <div className="min-h-screen py-16 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto px-4">
        <div className="text-center mb-10 animate-fade-in-up">
          <UserCircle className="w-16 h-16 mx-auto text-primary/60 mb-4" />
          <h1 className="text-3xl font-heading text-gold-gradient font-bold mb-2">
            {t('Welcome Back', 'مرحباً بعودتك')}
          </h1>
          <p className="text-muted-foreground font-body">
            {t('Sign in to manage your content', 'سجل الدخول لإدارة المحتوى')}
          </p>
        </div>

        {step === 'initial' && (
          <div className="space-y-4 animate-fade-in-up animate-fade-in-up-1">
            <button
              onClick={() => setStep('email')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-lg"
            >
              <LogIn className="w-5 h-5" />
              {t('Log In', 'تسجيل الدخول')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-all font-semibold text-lg"
            >
              <UserCircle className="w-5 h-5" />
              {t('Visit as Guest', 'زيارة كضيف')}
            </button>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 animate-fade-in-up animate-fade-in-up-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('Enter your email', 'أدخل بريدك الإلكتروني')}
                className="w-full pl-11 pr-4 py-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-lg"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm font-body text-center bg-destructive/10 rounded-lg p-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-lg"
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
          <form onSubmit={handleLogin} className="space-y-4 animate-fade-in-up animate-fade-in-up-1">
            <p className="text-sm text-muted-foreground text-center mb-2">{email}</p>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('Enter password', 'أدخل كلمة المرور')}
                className="w-full pl-11 pr-4 py-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-lg"
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder={t('6-digit verification code', 'رمز التحقق المكون من 6 أرقام')}
                className="w-full pl-11 pr-4 py-4 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-lg tracking-[0.3em] text-center"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm font-body text-center bg-destructive/10 rounded-lg p-3">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full px-6 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-lg"
            >
              {t('Log In', 'تسجيل الدخول')}
            </button>
            <button
              type="button"
              onClick={() => { setStep('email'); setError(''); setPassword(''); setCode(''); }}
              className="w-full px-6 py-3 rounded-lg text-muted-foreground hover:text-foreground transition-all text-sm"
            >
              {t('← Back', '→ رجوع')}
            </button>
          </form>
        )}

        <p className="text-center text-xs text-muted-foreground mt-8">
          {t(
            'Admin access requires authorized credentials.',
            'يتطلب الوصول للمسؤول بيانات اعتماد مصرح بها.'
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
