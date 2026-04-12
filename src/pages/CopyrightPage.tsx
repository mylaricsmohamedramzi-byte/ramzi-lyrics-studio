import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import { MessageCircle, Scale, Globe, Shield, Monitor } from 'lucide-react';
import logoLight from '@/assets/logo-light.png';

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
    descEn: 'Signed by 181 countries: Authors automatically hold copyright from the moment of creation without requiring registration. Protection extends for a minimum of 50 years after the author\'s death.',
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
    descEn: 'Any unauthorized publication of Mohamed Ramzi\'s works on digital platforms — including YouTube, Facebook, Instagram, TikTok, or Spotify — will result in immediate content removal, channel strikes, and potential account termination.',
    descAr: 'أي نشر غير مصرح به لأعمال محمد رمزي على المنصات الرقمية — بما فيها يوتيوب وفيسبوك وإنستغرام وتيك توك وسبوتيفاي — سيؤدي إلى إزالة فورية للمحتوى وتحذيرات للقناة وإمكانية إيقاف الحساب.',
  },
];

const CopyrightPage = () => {
  const { t } = useLang();
  const { isDark } = useTheme();

  return (
    <div className="min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Stamp Logo */}
        <div className="flex justify-center mb-12 animate-fade-in-up">
          <div className="relative animate-stamp-pulse">
            <div className="w-52 h-52 relative">
              {/* Outer grunge ring */}
              <div
                className="absolute inset-[-12px] rounded-full"
                style={{
                  border: '5px solid rgba(160,30,40,0.8)',
                  boxShadow: '0 0 0 3px rgba(160,30,40,0.2), inset 0 0 0 3px rgba(160,30,40,0.2), 0 0 30px rgba(160,30,40,0.3)',
                }}
              />
              {/* Inner dashed ring */}
              <div
                className="absolute inset-2 rounded-full"
                style={{
                  border: '2px dashed rgba(160,30,40,0.45)',
                }}
              />
              {/* Logo stamp */}
              <img
                src={logoLight}
                alt="MR Stamp"
                className="w-full h-full object-contain relative z-10"
                style={{
                  filter: 'sepia(1) saturate(3) hue-rotate(310deg) brightness(0.7) contrast(1.4) opacity(0.82)',
                  transform: 'rotate(-8deg)',
                }}
              />
              {/* Grunge overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(160,30,40,0.04) 4px, rgba(160,30,40,0.04) 5px)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Official Statement */}
        <div className="animate-fade-in-up animate-fade-in-up-1">
          <div
            className="rounded-lg p-6 sm:p-8 border border-accent/20 mb-8"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, hsl(340 25% 6%), hsl(340 20% 8%))'
                : 'linear-gradient(135deg, hsl(30 30% 97%), hsl(30 25% 95%))',
            }}
          >
            <p className="text-foreground/80 leading-loose text-center font-body text-lg">
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
        <div className="flex items-center justify-center my-10 animate-fade-in-up animate-fade-in-up-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
          <div className="mx-4 text-primary/50 text-2xl">⚜</div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>

        {/* Legal Cards */}
        <h2 className="text-2xl sm:text-3xl font-heading text-center text-gold-gradient mb-8 animate-fade-in-up animate-fade-in-up-2">
          {t('Applicable Laws & Penalties', 'القوانين المعمول بها والعقوبات')}
        </h2>

        <div className="grid gap-6 animate-fade-in-up animate-fade-in-up-3">
          {legalCards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg group"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, hsl(340 25% 7%), hsl(340 20% 9%))'
                  : 'linear-gradient(135deg, hsl(30 30% 98%), hsl(30 25% 96%))',
              }}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <card.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-subheading font-bold text-foreground mb-2">
                    {t(card.titleEn, card.titleAr)}
                  </h3>
                  <p className="text-foreground/60 leading-relaxed font-body">
                    {t(card.descEn, card.descAr)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom stamp + CTA */}
        <div className="text-center mt-16 animate-fade-in-up animate-fade-in-up-4">
          <p className="text-lg font-bold text-primary tracking-wide uppercase mb-6">
            {t('© Mohamed Ramzi — All Rights Reserved', '© محمد رمزي — جميع الحقوق محفوظة')}
          </p>
          <a
            href="https://wa.me/201100562469"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold"
          >
            <MessageCircle className="w-5 h-5" />
            {t('Contact for Permissions', 'تواصل للحصول على إذن')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default CopyrightPage;
