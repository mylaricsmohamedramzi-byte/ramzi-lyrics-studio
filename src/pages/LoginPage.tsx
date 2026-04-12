import { useLang } from '@/contexts/LangContext';
import { LogIn, UserCircle } from 'lucide-react';

const LoginPage = () => {
  const { t } = useLang();

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

        <div className="space-y-4 animate-fade-in-up animate-fade-in-up-1">
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold text-lg">
            <LogIn className="w-5 h-5" />
            {t('Log In', 'تسجيل الدخول')}
          </button>
          <button className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-all font-semibold text-lg">
            <UserCircle className="w-5 h-5" />
            {t('Visit as Guest', 'زيارة كضيف')}
          </button>
        </div>

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
