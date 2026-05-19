import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import darkPhoto from '@/assets/dark-photo.png';
import whitePhoto from '@/assets/white-photo.png';
import homeLogoDark from '@/assets/home-logo-dark.png';
import homeLogoLight from '@/assets/home-logo-light.png';
import nameEnglish from '@/assets/name-english.png';
import nameArabic from '@/assets/name-arabic.png';

const WelcomePage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen">
      {/* Hero gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? 'radial-gradient(ellipse at 50% 0%, rgba(192,39,45,0.15) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at 50% 0%, rgba(139,26,42,0.06) 0%, transparent 70%)',
        }}
      />

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Photo - circular */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div className="w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden">
            <img
              src={isDark ? darkPhoto : whitePhoto}
              alt="Mohamed Ramzi"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Name as image */}
        <div className="text-center mb-4 animate-fade-in-up animate-fade-in-up-1">
          <div className="flex justify-center mb-2">
            <img
              src={lang === 'ar' ? nameArabic : nameEnglish}
              alt={t('Mohamed Ramzi', 'محمد رمزي')}
              className="h-16 sm:h-20 md:h-24 w-auto object-contain"
            />
          </div>
          <p className="text-lg sm:text-xl text-muted-foreground tracking-[0.3em] uppercase mt-2 font-subheading">
            {t('Song Writer', 'كاتب أغاني')}
          </p>
        </div>

        {/* Home Logo with floating animation */}
        <div className="flex justify-center my-12 animate-fade-in-up animate-fade-in-up-2">
          <div className="animate-float">
            <img
              src={isDark ? homeLogoDark : homeLogoLight}
              alt="MR Logo"
              className="w-48 h-auto sm:w-56 md:w-64 object-contain drop-shadow-2xl"
            />
          </div>
        </div>

        {/* Welcome text */}
        <div className="max-w-2xl mx-auto text-center mb-12 animate-fade-in-up animate-fade-in-up-3">
          <p className="text-lg sm:text-xl leading-relaxed text-foreground/80 font-body italic">
            {t(
              "Welcome to the only official website that contains all of Mohamed Ramzi's works and lyrics.",
              'مرحباً بكم في الموقع الرسمي الوحيد الذي يحتوي على جميع أعمال وكلمات محمد رمزي.'
            )}
          </p>
        </div>

        {/* Important note card */}
        <div className="max-w-3xl mx-auto animate-fade-in-up animate-fade-in-up-4">
          <div
            className="rounded-lg p-6 sm:p-8 border border-accent/20 relative overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, hsl(340 25% 6%), hsl(340 20% 8%))'
                : 'linear-gradient(135deg, hsl(30 30% 97%), hsl(30 25% 95%))',
              backgroundImage: isDark
                ? `repeating-linear-gradient(transparent, transparent 28px, rgba(201,168,76,0.06) 28px, rgba(201,168,76,0.06) 29px)`
                : `repeating-linear-gradient(transparent, transparent 28px, rgba(154,107,26,0.08) 28px, rgba(154,107,26,0.08) 29px)`,
            }}
          >
            <div className="absolute top-3 right-4 text-accent/20 text-3xl">♪</div>
            <div className="absolute bottom-3 left-4 text-accent/20 text-2xl">♫</div>

            <h3 className="text-lg font-subheading font-bold text-primary mb-4 text-center">
              {t('Important Clarification', 'توضيح هام')}
            </h3>
            <p className="text-foreground/70 leading-relaxed text-center font-body">
              {t(
                "The difference between the talented and the exceptional is that the talented person is content with their talent and does not make the extra effort to significantly improve upon it, whereas when talent is combined with study, self-improvement, and the ability to keep up with the times, the result is an exceptional person — Mohamed Ramzi.",
                'الفرق بين الموهوب والمُميز، هو أن الموهوب يكتفي بموهبته ولا يبذل جهد أكثر في عمل تغيير ملحوظ على الموهبة، بينما عندما تجتمع الموهبة مع الدراسة والتطوير من المستوى والقدرة على المواكبة، ينتج شخص مُتميز — محمد رمزي.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
