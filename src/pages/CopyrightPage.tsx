import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Scale, Globe, Shield, Monitor } from 'lucide-react';
import copyrightEnglish from '@/assets/copyright-english.png';
import copyrightArabic from '@/assets/copyright-arabic.png';

const legalCards = [
  {
    icon: Scale,
    titleEn: 'Egyptian Intellectual Property Law No. 82 of 2002',
    titleAr: 'قانون حماية حقوق الملكية الفكرية المصري رقم 82 لسنة 2002',
    descEn: 'Article 181: Unauthorized use of a protected work is punishable by imprisonment of no less than one month and a fine of no less than 5,000 Egyptian pounds, with the possibility of both penalties combined.',
    descAr: 'المادة 181: يُعاقب على استخدام العمل المحمي دون إذن بالسجن مدة لا تقل عن شهر وغرامة لا تقل عن 5000 جنيه مصري، مع إمكانية الجمع بين العقوبتين.',
  },
  {
    icon: Globe,
    titleEn: 'The Berne Convention for the Protection of Literary and Artistic Works',
    titleAr: 'اتفاقية برن لحماية المصنفات الأدبية والفنية',
    descEn: "Signed by 181 countries: Authors automatically hold copyright from the moment of creation without requiring registration. Protection extends for a minimum of 50 years after the author's death.",
    descAr: 'موقّعة من 181 دولة: يتمتع المؤلفون تلقائيًا بحقوق النشر من لحظة الإبداع دون الحاجة إلى تسجيل. تمتد الحماية لمدة لا تقل عن 50 عامًا بعد وفاة المؤلف.',
  },
  {
    icon: Shield,
    titleEn: 'TRIPS Agreement — World Trade Organization',
    titleAr: 'اتفاقية تريبس — منظمة التجارة العالمية',
    descEn: 'Obligates all member states (164 countries) to enforce intellectual property rights. Violations may result in civil damages, criminal prosecution, and seizure of infringing materials.',
    descAr: 'تُلزم جميع الدول الأعضاء (164 دولة) بتطبيق حقوق الملكية الفكرية. قد تترتب على الانتهاكات تعويضات مدنية وملاحقة جنائية ومصادرة المواد المنتهِكة.',
  },
  {
    icon: Monitor,
    titleEn: 'Digital Millennium Copyright Act (DMCA) & Content ID',
    titleAr: 'قانون الألفية للملكية الرقمية (DMCA) ونظام Content ID',
    descEn: "Any unauthorized publication of Mohamed Ramzi's works on digital platforms — including YouTube, Facebook, Instagram, TikTok, or Spotify — will result in immediate content removal, channel strikes, and potential account termination.",
    descAr: 'أي نشر غير مصرح به لأعمال محمد رمزي على المنصات الرقمية — بما فيها يوتيوب وفيسبوك وإنستغرام وتيك توك وسبوتيفاي — سيؤدي إلى إزالة فورية للمحتوى وتحذيرات للقناة وإمكانية إيقاف الحساب.',
  },
];

const CopyrightPage = () => {
  const { t, lang } = useLang();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen relative">
      {/* MR watermark */}
      <div
        className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center"
        style={{ opacity: 0.04 }}
      >
        <img
          src={isDark ? copyrightEnglish : copyrightEnglish}
          alt=""
          className="w-[500px] h-[500px] object-contain"
          style={{ filter: 'grayscale(1)' }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-5xl py-16 relative z-10">
        {/* Stamp */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div
            className="animate-stamp-pulse relative"
            style={{ transform: 'rotate(-5deg)' }}
          >
            {/* CSS-only 3-layer rotating flame ring */}
            <div className="photo-flame-outer" />
            <div className="photo-flame-mid" />
            <div className="photo-flame-rim" />

            <img
              src={lang === 'ar' ? copyrightArabic : copyrightEnglish}
              alt={t('Copyright Owner - Mohamed Ramzi', 'حقوق ملكية - محمد رمزي')}
              className="w-52 h-52 sm:w-64 sm:h-64 object-contain relative rounded-full bg-black/10"
              style={{
                zIndex: 2,
                filter: isDark
                  ? 'drop-shadow(0 0 24px rgba(192,39,45,0.5)) saturate(1.3)'
                  : 'drop-shadow(0 4px 16px rgba(0,0,0,0.18))',
              }}
            />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-heading font-bold text-center mb-10 animate-fade-in-up"
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animationDelay: '0.1s',
          }}
        >
          {t('COPYRIGHT & INTELLECTUAL PROPERTY', 'حقوق الملكية الفكرية')}
        </h1>

        {/* Official Statement */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <div
            className="rounded-lg p-6 sm:p-8 mb-12 border-l-4"
            style={{
              borderLeftColor: '#c0272d',
              background: isDark
                ? 'rgba(20, 5, 8, 0.85)'
                : 'rgba(245, 240, 235, 0.9)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <p className="text-foreground/80 leading-loose font-body text-lg">
              {t(
                "All lyrics, melodies, songs, videos, and written works published on this website are the exclusive intellectual property of Mohamed Ramzi. All rights are fully reserved.\n\nIt is strictly prohibited to copy, reproduce, distribute, publish, or use any content from this website — in whole or in part — without obtaining prior written permission directly from Mohamed Ramzi.\n\nAny unauthorized use constitutes a violation of intellectual property law and will be subject to legal action.",
                "جميع الكلمات والألحان والأغاني والفيديوهات والأعمال المكتوبة المنشورة على هذا الموقع هي الملكية الفكرية الحصرية لمحمد رمزي. جميع الحقوق محفوظة بالكامل.\n\nيُحظر تمامًا نسخ أي محتوى من هذا الموقع أو إعادة إنتاجه أو توزيعه أو نشره أو استخدامه — كليًا أو جزئيًا — دون الحصول على إذن كتابي مسبق مباشرةً من محمد رمزي.\n\nأي استخدام غير مصرح به يُعدّ انتهاكًا لقوانين الملكية الفكرية وسيُعرّض صاحبه للمساءلة القانونية."
              ).split('\n\n').map((p, i) => (
                <span key={i} className="block mb-4 last:mb-0">{p}</span>
              ))}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center my-10">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="mx-4 text-primary/50 text-2xl">⚜</div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Legal Cards Title */}
        <h2
          className="text-2xl sm:text-3xl font-heading text-center mb-8 animate-fade-in-up"
          style={{
            background: 'linear-gradient(135deg, #c9a84c 0%, #c0272d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animationDelay: '0.3s',
          }}
        >
          {t('Applicable Laws & Penalties', 'القوانين المعمول بها والعقوبات')}
        </h2>

        {/* 2x2 Legal Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          {legalCards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg p-6 border border-border/30 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group"
              style={{
                background: isDark
                  ? 'rgba(20, 5, 8, 0.85)'
                  : 'rgba(245, 240, 235, 0.9)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-[#c9a84c]/15 text-[#c9a84c] group-hover:bg-[#c9a84c]/25 transition-colors shrink-0">
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-subheading font-bold text-foreground mb-2 text-sm sm:text-base">
                    {t(card.titleEn, card.titleAr)}
                  </h3>
                  <p className="text-foreground/55 leading-relaxed font-body text-sm">
                    {t(card.descEn, card.descAr)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default CopyrightPage;
