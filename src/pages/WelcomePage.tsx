import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import homeLogoDark from '@/assets/home-logo-dark.png';
import homeLogoLight from '@/assets/home-logo-light.png';
import darkPhoto from '@/assets/dark-photo.png';
import whitePhoto from '@/assets/white-photo.png';
import nameArabic from '@/assets/name-arabic.png';
import nameEnglish from '@/assets/name-english.png';

const WelcomePage = () => {
  const { lang, t } = useLang();
  const { isDark } = useTheme();

  const ownerPhoto = isDark ? darkPhoto : whitePhoto;
  const homeLogo = isDark ? homeLogoDark : homeLogoLight;
  const nameImage = lang === 'ar' ? nameArabic : nameEnglish;

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="welcome-wrapper content-layer"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&family=Cairo:wght@400;700;900&family=Cinzel:wght@600;800&display=swap');

        .welcome-wrapper {
          min-height: 100vh;
          padding: 60px 20px 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 36px;
          position: relative;
          overflow: hidden;
        }

        /* Centralized 3D metal shield logo medallion */
        .welcome-logo-shield {
          width: clamp(120px, 22vw, 180px);
          filter: drop-shadow(0 12px 30px rgba(0,0,0,0.6));
          animation: shieldFloat 6s ease-in-out infinite;
        }
        @keyframes shieldFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }

        /* Double metallic gold-beveled glowing medallion frame */
        .owner-medallion {
          width: clamp(200px, 42vw, 320px);
          aspect-ratio: 1;
          border-radius: 50%;
          padding: 8px;
          background: linear-gradient(145deg, #f3d98a, #c9a84c 40%, #8a6d2f 60%, #f3d98a);
          box-shadow: 0 0 40px rgba(201, 168, 76, 0.45), inset 0 0 18px rgba(0,0,0,0.4);
          position: relative;
        }
        .owner-medallion::after {
          content: '';
          position: absolute;
          inset: -10px;
          border-radius: 50%;
          border: 2px solid rgba(201, 168, 76, 0.35);
          pointer-events: none;
          animation: medallionGlow 4s ease-in-out infinite;
        }
        @keyframes medallionGlow {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.02); }
        }
        .owner-medallion-inner {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          overflow: hidden;
          border: 4px solid #0a0205;
          background: ${isDark ? '#1a0508' : '#fff5f5'};
        }
        .owner-medallion-inner img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .welcome-name-image {
          width: clamp(220px, 48vw, 420px);
          filter: drop-shadow(0 6px 18px rgba(0,0,0,0.5));
        }

        /* AI clarification — styled like sheet-music parchment */
        .sheet-card {
          max-width: 820px;
          width: 100%;
          margin: 10px auto 0;
          border-radius: 22px;
          padding: 34px 38px;
          position: relative;
          color: ${isDark ? '#f3e9d2' : '#3a2410'};
          background-color: ${isDark ? '#241008' : '#fbf3e2'};
          background-image: repeating-linear-gradient(
            ${isDark ? 'rgba(201,168,76,0.16)' : 'rgba(120,80,30,0.18)'} 0px,
            ${isDark ? 'rgba(201,168,76,0.16)' : 'rgba(120,80,30,0.18)'} 1px,
            transparent 1px,
            transparent 16px
          );
          border: 1px solid rgba(201, 168, 76, 0.4);
          box-shadow: 0 18px 50px rgba(0,0,0,0.45), inset 0 0 30px rgba(201,168,76,0.08);
        }
        .sheet-card .clef {
          position: absolute;
          font-size: 60px;
          color: rgba(201, 168, 76, 0.35);
          font-family: 'Aref Ruqaa Ink', serif;
          line-height: 1;
        }
        .sheet-card .clef.treble { top: 10px; ${lang === 'ar' ? 'left' : 'right'}: 18px; }
        .sheet-card .clef.bass { bottom: 8px; ${lang === 'ar' ? 'right' : 'left'}: 18px; }

        .sheet-title {
          font-family: 'Aref Ruqaa Ink', 'Cinzel', serif;
          color: #c9a84c;
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 800;
          margin-bottom: 16px;
          text-align: center;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .sheet-text {
          font-family: ${lang === 'ar' ? "'Cairo', 'Almarai', sans-serif" : "'Outfit', 'Almarai', sans-serif"};
          font-size: clamp(15px, 2.6vw, 18px);
          line-height: 2;
          text-align: ${lang === 'ar' ? 'right' : 'left'};
          position: relative;
          z-index: 2;
        }
      `}</style>

      <img src={homeLogo} alt={t('Mohamed Ramzi shield logo', 'شعار درع محمد رمزي')} className="welcome-logo-shield" />

      <div className="owner-medallion">
        <div className="owner-medallion-inner">
          <img src={ownerPhoto} alt={t('Mohamed Ramzi portrait', 'صورة محمد رمزي')} />
        </div>
      </div>

      <img src={nameImage} alt={t('Mohamed Ramzi', 'محمد رمزي')} className="welcome-name-image" />

      <div className="sheet-card">
        <span className="clef treble" aria-hidden="true">𝄞</span>
        <span className="clef bass" aria-hidden="true">𝄢</span>
        <h2 className="sheet-title">
          {t('Important clarification', 'توضيح هام')}
        </h2>
        <p className="sheet-text">
          {t(
            'I have used artificial intelligence tools to help me connect the closest musical form to the ideas and melodies I have created. Therefore, you will find in some songs that there are parts of the words that are not pronounced completely correctly. As for the videos, they are my effort to help in understanding the meaning of the words.',
            'لقد استعنت بأدوات الذكاء الاصطناعي لتساعدني في توصيل أقرب شكل موسيقي للأفكار والألحان التي قمت بتأليفها ولذلك ستجد في بعض الأغاني أجزاء من الكلمات لا تنطق بشكل صحيح تماماً أما الفيديوهات فهي اجتهاد مني للمساعدة في فهم معنى الكلمات.'
          )}
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
