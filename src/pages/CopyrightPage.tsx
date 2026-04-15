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
            className="animate-stamp-pulse"
            style={{ transform: 'rotate(-5deg)' }}
          >
            <img
              src={lang === 'ar' ? copyrightArabic : copyrightEnglish}
              alt={t('Copyright Owner - Mohamed Ramzi', 'حقوق ملكية - محمد رمزي')}
              className="w-52 h-52 sm:w-64 sm:h-64 object-contain"
              style={{
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

        {/* Bottom stamp + CTA */}
        <div className="text-center mt-16 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <img
            src={lang === 'ar' ? copyrightArabic : copyrightEnglish}
            alt="MR Stamp"
            className="w-36 h-36 mx-auto mb-4 object-contain"
            style={{
              filter: isDark
                ? 'drop-shadow(0 0 20px rgba(192,39,45,0.4)) saturate(1.5) hue-rotate(-5deg)'
                : 'sepia(1) saturate(3) hue-rotate(310deg) brightness(0.7)',
              transform: 'rotate(-8deg)',
            }}
          />
          <p className="text-lg font-bold text-primary tracking-wide uppercase mb-6">
            {t('© Mohamed Ramzi — All Rights Reserved', '© محمد رمزي — جميع الحقوق محفوظة')}
          </p>
          <a
            href="https://wa.me/201100562469"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all duration-200 hover:scale-105"
            style={{
              background: '#25D366',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(37,211,102,0.3)',
            }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {t('Contact for Permissions', 'تواصل للحصول على إذن')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default CopyrightPage;
