import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import darkPhoto from '@/assets/dark-photo.png';
import whitePhoto from '@/assets/white-photo.png';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

const WelcomePage = () => {
  const { t } = useLang();
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
        {/* Photo */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <img
            src={isDark ? darkPhoto : whitePhoto}
            alt="Mohamed Ramzi"
            className="w-64 h-64 sm:w-80 sm:h-80 object-contain rounded-full"
          />
        </div>

        {/* Name */}
        <div className="text-center mb-4 animate-fade-in-up animate-fade-in-up-1">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-heading text-gold-gradient font-bold tracking-wide">
            {t('Mohamed Ramzi', 'محمد رمزي')}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground tracking-[0.3em] uppercase mt-2 font-subheading">
            {t('Song Writer', 'كاتب أغاني')}
          </p>
        </div>

        {/* Logo Shield */}
        <div className="flex justify-center my-12 animate-fade-in-up animate-fade-in-up-2">
          <div className="relative animate-float">
            <div className="w-40 h-48 sm:w-48 sm:h-56 flex items-center justify-center relative">
              {/* Shield background */}
              <div
                className="absolute inset-0 rounded-b-[40%] border-2 border-accent/30"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, hsl(340 25% 8%), hsl(340 20% 12%))'
                    : 'linear-gradient(135deg, hsl(30 30% 95%), hsl(30 20% 90%))',
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
                  boxShadow: isDark
                    ? '0 0 40px rgba(192,39,45,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 4px 20px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5)',
                }}
              />
              {/* Inner border */}
              <div
                className="absolute inset-2"
                style={{
                  border: `1px solid ${isDark ? 'rgba(201,168,76,0.3)' : 'rgba(154,107,26,0.2)'}`,
                  clipPath: 'polygon(0 0, 100% 0, 100% 70%, 50% 100%, 0 70%)',
                }}
              />
              <img
                src={isDark ? logoDark : logoLight}
                alt="MR Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 object-contain relative z-10"
              />
            </div>
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
            {/* Musical note decoration */}
            <div className="absolute top-3 right-4 text-accent/20 text-3xl">♪</div>
            <div className="absolute bottom-3 left-4 text-accent/20 text-2xl">♫</div>

            <h3 className="text-lg font-subheading font-bold text-primary mb-4 text-center">
              {t('Important Clarification', 'توضيح مهم')}
            </h3>
            <p className="text-foreground/70 leading-relaxed text-center font-body">
              {t(
                "I have used artificial intelligence tools to help me connect the closest musical form to the ideas and melodies I have created. Therefore, you will find in some songs that there are parts of the words that are not pronounced completely correctly. As for the videos, they are my effort to help in understanding the meaning of the words.",
                'لقد استخدمت أدوات الذكاء الاصطناعي لمساعدتي في ربط أقرب شكل موسيقي بالأفكار والألحان التي ابتكرتها. لذلك ستجد في بعض الأغاني أن هناك أجزاء من الكلمات لا تُنطق بشكل صحيح تمامًا. أما الفيديوهات فهي جهدي لمساعدتك على فهم معنى الكلمات.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
