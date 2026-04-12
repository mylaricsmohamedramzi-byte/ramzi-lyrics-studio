import { useLang } from '@/contexts/LangContext';
import { MessageCircle } from 'lucide-react';

const Footer = () => {
  const { t } = useLang();

  return (
    <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm py-6 transition-colors duration-400">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <a
          href="https://wa.me/201100562469"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{t('Chat on WhatsApp', 'تواصل عبر واتساب')}</span>
        </a>
        <p className="text-sm text-muted-foreground text-center">
          {t(
            'All Rights Reserved © Mohamed Ramzi',
            'جميع الحقوق محفوظة © محمد رمزي'
          )}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
