import { useLang } from '@/contexts/LangContext';
import { Search } from 'lucide-react';

interface ContentPageShellProps {
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  icon: string;
}

const ContentPageShell = ({ titleEn, titleAr, descEn, descAr, icon }: ContentPageShellProps) => {
  const { t } = useLang();

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="text-5xl mb-4">{icon}</div>
          <h1 className="text-3xl sm:text-4xl font-heading text-gold-gradient font-bold mb-3">
            {t(titleEn, titleAr)}
          </h1>
          <p className="text-muted-foreground font-body">
            {t(descEn, descAr)}
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12 animate-fade-in-up animate-fade-in-up-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('Search...', 'بحث...')}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
            />
          </div>
        </div>

        {/* Empty state */}
        <div className="text-center py-20 text-muted-foreground animate-fade-in-up animate-fade-in-up-2">
          <p className="text-lg font-body italic">
            {t('Content coming soon...', 'المحتوى قادم قريباً...')}
          </p>
          <p className="text-sm mt-2">
            {t('Connect the backend to start adding content.', 'قم بتوصيل قاعدة البيانات لبدء إضافة المحتوى.')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentPageShell;
