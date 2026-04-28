import { useState, useRef, useMemo } from 'react'; import SearchBar from '@/components/SearchBar'; import { normalizeArabic } from '@/lib/arabic'; const MEL_CATEGORIES: { key: string; label: string; match: (t: string) => boolean }[] = [ { key: 'all', label: 'الكل', match: () => true

pasted


1777349847856_image.png

دلوقتي الكود المرفق بتاع صفحة الالحان  و كمان في صور  عباره عن جدول في اسم كل اغنية في الصفحة و النوع بتاعها   انت هتحدث البيانات دي من الجدول دا و بعدها بنائاً علي البيانات دي                                                                                                                                                                          const VIDEO_CATEGORIES: { key: string; ar: string; en: string; match: (c: string) => boolean }[] = [   { key: 'all', ar: 'الكل', en: 'All', match: () => true },   { key: 'islamic', ar: 'إسلامي', en: 'Islamic', match: (c) => /islamic|إسلامي/i.test(c) },   { key: 'patriotic', ar: 'وطني', en: 'Patriotic', match: (c) => /patriotic|وطني/i.test(c) },   { key: 'social', ar: 'اجتماعي وعائلي', en: 'Social & Family', match: (c) => /social|family|اجتماعي|عائلي/i.test(c) },   { key: 'occasion', ar: 'مناسبات وأعياد', en: 'Occasion & Holiday', match: (c) => /occasion|holiday|مناسبات|أعياد/i.test(c) },   { key: 'motivational', ar: 'تحفيزية', en: 'Motivational', match: (c) => /motivational|تحفيزية|تحفيز/i.test(c) },   { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /poems|قصائد|قصيدة/i.test(c) },   { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /classic|كلاسيك/i.test(c) },   { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /drama|دراما/i.test(c) },   { key: 'slow', ar: 'سلو', en: 'Slow', match: (c) => /slow|سلو/i.test(c) },   { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c) => /romantic|رومانسي/i.test(c) },   { key: 'romantic_maqsum', ar: 'رومانسي مقسوم', en: 'Romantic Maqsum', match: (c) => /romantic maqsum|رومانسي مقسوم/i.test(c) },   { key: 'pop', ar: 'بوب', en: 'Pop', match: (c) => /pop|بوب/i.test(c) },   { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /rock|روك/i.test(c) },   { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /maqsum|مقسوم/i.test(c) },   { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /tarab|طرب/i.test(c) },   { key: 'shaabi', ar: 'شعبي', en: 'Shaabi', match: (c) => /shaabi|شعبي/i.test(c) },   { key: 'saidi', ar: 'صعيدي', en: 'Sa\'idi', match: (c) => /sa'idi|saidi|صعيدي/i.test(c) },   { key: 'rap', ar: 'راب', en: 'Rap', match: (c) => /rap|راب/i.test(c) },   { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /trap|تراب/i.test(c) }, ];                                                                                                                                                                                      ... | # | التعديل | التفاصيل |

|---|---------|----------|

| 1 | **فلتر السرش بار** | بيعرض بس الفئات الموجودة فعلاً في الفيديوهات (قصائد، دراما، روك، مقسوم، تراب) + الكل — بدل ما كان بيعرض كل الفئات الـ 20 |

| 2 | **ترتيب الفيديوهات** | الفيديوهات بتتترتب تلقائياً حسب أولوية الفئة: قصائد ← دراما ← روك ← مقسوم ← تراب |

| 3 | **خلفية الصفحة** | اتغيرت من `#010416` الساكنة لـ `radial-gradient` أحمر داكن زي LyricsPage |

| 4 | **FloatingNotes (الصفحة)** | أُضيف مكوّن الملاحظات الموسيقية العائمة في خلفية الصفحة كلها |

| 5 | **CardFloatingNotes (الكارد)** | أُضيف مكوّن ملاحظات عائمة داخل كل كارد بـ seed مختلف لكل فيديو |

| 6 | **خلفية الكارد** | اتغيرت لجلد أحمر: `radial-gradient(circle at center, rgb(103,6,6) 0%, #0a0205 100%)` + texture الجلد من transparenttextures |

| 7 | **خلفية قسم الكلمات** | خلفية داكنة `rgba(4,4,20,0.82)` عشان الكلمات الحمراء تظهر واضحة على الكارد الأحمر |

| 8 | **لون الكلمات العادية** | اتغير من أبيض `#fff` لذهبي فاتح `#e8d5b0` يناسب ثيم الجلد |

| 9 | **نجوم التقييم** | أُضيفت 5 نجوم ذهبية بجانب نسبة المشاهدات، بتدعم hover وتثبيت الاختيار |

| 10 | **صف المشاهدات + النجوم** | الـ ok-badge والنجوم اتحطوا في صف flex واحد جنب بعض بدل ما الـ badge يكون float |                                                                                                                                                          هتعمل حوار فلترت السرش بار و كمان هتعمل التعديلات اللي هيا من 3    الي 10 بحيث ان الموقع يكون الصفاحات بتعته موحده و كمان هتضيف النص دا  بعد السرش بار   <div className="max-w-3xl mx-auto animate-fade-in-up animate-fade-in-up-4">

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

              {t('Important Clarification', 'توضيح مهم')}

            </h3>

            <p className="text-foreground/70 leading-relaxed text-center font-body">

              {t(

                "I have used artificial intelligence tools to help me connect the closest musical form to the ideas and melodies I have created. Therefore, you will find in some songs that there are parts of the words that are not pronounced completely correctly. As for the videos, they are my effort to help in understanding the meaning of the words.",

                'لقد استخدمت أدوات الذكاء الاصطناعي لمساعدتي في ربط أقرب شكل موسيقي بالأفكار والألحان التي ابتكرتها. لذلك ستجد في بعض الأغاني أن هناك أجزاء من الكلمات لا تُنطق بشكل صحيح تمامًا. أما الفيديوهات فهي جهدي لمساعدتك على فهم معنى الكلمات.'

              )}

            </p>

          </div>

        </div>   :                                                                                                                                                                 دا كود الصفحة يله اشتغل :



Explain

Pasted content
30.14 KB •578 lines
•
Formatting may be inconsistent from source

import { useState, useRef, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';

const MEL_CATEGORIES: { key: string; label: string; match: (t: string) => boolean }[] = [
  { key: 'all',      label: 'الكل',     match: () => true },
  { key: 'romantic', label: 'رومانسي', match: (t) => /رومانسي|رمانسي|سلو/.test(t) },
  { key: 'pop',      label: 'بوب',      match: (t) => /بوب/.test(t) },
  { key: 'maqsum',   label: 'مقسوم',    match: (t) => /مقسوم/.test(t) },
  { key: 'shaabi',   label: 'شعبي',     match: (t) => /شعبي/.test(t) },
  { key: 'social',   label: 'اجتماعي', match: (t) => /اجتماعي|إجتماعي/.test(t) },
];

/** Converts Google Drive sharing / open links to direct download URLs. Leaves other URLs unchanged. */
function toDriveDirectDownloadUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || !trimmed.includes('drive.google.com')) return trimmed;
  try {
    const u = new URL(trimmed);
    const fromPath = u.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
    if (fromPath) {
      return `https://drive.google.com/uc?export=download&id=${fromPath}`;
    }
    if (u.pathname === '/open' || u.pathname.endsWith('/open')) {
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
    if (u.pathname === '/uc' && u.searchParams.get('export') === 'download') {
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

const allSongs = [
  {
    id: 1,
    title: "حلّ إيجابي",
    type: "مقسوم رومانسي",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776497771/La7n_7all_Egaby_tedj3g.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002508/%D8%AD%D9%84_%D8%A7%D9%8A%D8%AC%D8%A7%D8%A8%D9%8A_avn3ul.png",
    views: "0 ",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
          { text: "وعاوزني أنساك ومفكّر .. أن النسيان سهل وعادي", red: false },
          { text: "طب دا أنت كمان شايف أن .. بُعدنا هيكون حل إيجابي", red: false },
          { text: "\u00A0", red: false },
        
          { text: "وكأنك ولا مره هويت .. ولا قلبك دق وحبيت", red: false },
          { text: "و كأن اللي ما بينا دا كان .. حبت كلام وحواديت", red: false },
          { text: "\u00A0", red: false },
        
          { text: "وهتيجي مين بقا رحتي", red: true },
          { text: "طول ما أنت سايبني لوحدي", red: true },
          { text: "والعمر علينا بيعدي ", red: true },
          { text: " وأحنا لسه متفارقين", red: true },
          { text: "\u00A0", red: false },
        
          { text: "نفسي أعرف أيه سبب بُعدك", red: true },
          { text: "وإن كنت أنا اللي زعلتك", red: true },
          { text: "أرجع يا حبيبي وأنا أصالحك", red: true },
          { text: "وإعتب علي قلبي براحتك ", red: true },
          { text: " لكن متسبنيش بين البنين", red: true },
          { text: "\u00A0", red: false },
        
          { text: "رغم المسافات بفتكرك .. دا أحنا ما بينا أحلي ليالي", red: false },
          { text: "أعمل أيه عشان أثبتلك .. أن أنت دائماً علي بالي", red: false },
          { text: "\u00A0", red: false },
        
          { text: "علي بالي ولا مره بتغيب .. ولُقانا كان أحلي نصيب", red: false },
          { text: "مكنتش بحس بأمان .. غير وأنا واياك بالتحديد", red: false },
         ],
          critics: ["الكلمات مبهره واللحن متناغم", " الأغنية مناسبة لصوت عمرو دياب",]
  },
  {
    id: 2,
    title:"بلاش تضيّع وقت",
    type: "مقسوم شعبي",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776499405/La7n_Balash_Teday3_Wa2t_v2g8he.mp3" ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002445/%D8%A8%D9%84%D8%A7%D8%B4_%D8%AA%D8%B6%D9%8A%D8%B9_%D9%88%D9%82%D8%AA_c025nn.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "قال يعني بقى فارق لك بعدي.. وبقيت مهتم", red: false },
      { text: "وفاكرني هفوت وهعدي.. وجرحي دا هيلم", red: false },
      { text: "وانا اللي جابرني ارجع تاني.. بدل ما حرقت دم", red: false },
      { text: "مبقاش في حاجة ما بينا.. خلاص وكفاية بقا غم", red: false },
      { text: "\u00A0", red: false },
    
      { text: "فبلاش يعني تضيع وقت.. في كلام مالوش عازة", red: true },
      { text: "بصراحة كدا انا مصدقت.. من الهم اخد اجازة", red: true },
      { text: "لو انا عندك كنت فرقت.. مكنش القلب قاسي", red: true },
      { text: "معرفش ايه بس الذنب.. اللي عليه بتجازة", red: true },
      { text: "\u00A0", red: false },
    
      { text: "العيب عندك لا مش عندي.. انا مش غلطان", red: false },
      { text: "انتي اللي وافقت انك تدخل.. في سباق خسران", red: false },
      { text: "انا مرتاح من يوم ما فارقتك.. لا مش زعلان", red: false },
      { text: "مدخلش عليا خالص.. موضوع انك ندمان", red: false },
      { text: "\u00A0", red: false },
    
      { text: "فبلاش يعني تضيع وقت.. في كلام مالوش عازة", red: true },
      { text: "بصراحة كدا انا مصدقت.. من الهم اخد اجازة", red: true },
      { text: "لو انا عندك كنت فرقت.. مكنش القلب قاسي", red: true },
      { text: "معرفش ايه بس الذنب.. اللي عليه بتجازة", red: true },
    ],
    critics: ["كلمات خفيفة وبسيطة","الاغنية مناسبة لصوت حمزه نميره "]
  },
  {
    id: 3,
    title: "لو سمحتي",
    duet: false,
    type: "رومانسي ",
    audioUrls: [ "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776497771/La7n_Law_Sama7ty_e2v44y.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002460/%D9%84%D9%88_%D8%B3%D9%85%D8%AD%D8%AA%D9%8A_le90qa.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "لو سمحتي فيه سؤال", red: false },
      { text: "نفسي اني اسأله ليكي", red: false },
      { text: "ليه تملي ببقا حابب", red: false },
      { text: "اني اطمن عليكي", red: false },
      { text: "ليه دخلتي جوا قلبي", red: false },
      { text: "وخلتيني اتعلق بيكي", red: false },
      { text: "\u00A0", red: false },
    
      { text: "هو ليه كل اما اشوفك", red: false },
      { text: "ببقا نفسي المس ايديكي", red: false },
      { text: "طب ليه بقا بيبان كسوفك", red: false},
      { text: "لما عيني تشوف عيناكي", red: false },
      { text: "\u00A0", red: false },
    
      { text: "جوبيني ارجوكي جوبيني", red: true },
      { text: "رسيني علي بر رسيني", red: true},
      { text: "يا احلي ما رأت عيني", red: true},
      { text: "اه يا فرحة عمري وسنيني", red: true },
      { text: "\u00A0", red: false },
    
      { text: "وريني الحب وريني", red: true },
      { text: "علي بحر العشق عديني", red: true },
      { text: "نسيني الحزن نسيني", red: true },
      { text: "وبلاش ولا لحظه نسيبيني", red: true },
      { text: "\u00A0", red: false },
    
      { text: "البرئه والجرائه", red: false },
      { text: "من الحاجات الحلوه فيكي", red: false },
      { text: "عوزه رأيي وبصراحه", red: false },
      { text: "بالغالي انا مشتريكي", red: false },
      { text: "\u00A0", red: false },
    
      { text: "خدتي قلبي وبجداره", red: false },
      { text: "ايوه انا لازم اهنيكي", red: false},
      { text: "ياللي كل لما اشوفك", red: false },
      { text: "بدعي ربي انه يخليكي", red: false },
    ],
    critics: ["كلمات مُبهجة", "مناسبة لصوت رامي صبري "]
  },
  {
    id: 4,
    title: "كاريزما",
    duet: false,
    type: "رمانسي  بوب",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776497772/La7n_Karisma_xy6kom.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002492/%D9%83%D8%A7%D8%B1%D9%8A%D8%B2%D9%85%D8%A7_naciz8.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "دي كاريزما.. وعليها كام لازمة؟", red: false },
      { text: "احلاهم.. بصراحة الغمزة.. اللي تملي تسحرني", red: false },
      { text: "\u00A0", red: false },
    
      { text: "اه يا عيني.. عيني على الضحكة", red: false },
      { text: "عسولة اوي ومفيش منها", red: false },
      { text: " طب دا انا كل ما ابص لها.. على طول بتدخل قلبي", red: false },
      { text: "\u00A0", red: false },
    
      { text: "انا بعترف.. اني حبيتها", red: false },
      { text: "وخلاص روحي بقت بيتها.. شغلاني ولا لحظة نسيتها", red: false },
      { text: " ازاي هنساها انا يعني؟", red: false },
      { text: "\u00A0", red: false },
      
      { text: "انا نفسي طويل ومستني", red: true },
      { text: "حبيبي الغالي يسمح لي", red: true },
      { text: "اكون في حياته", red: true },
      { text: " واعيش باقي وقتي معاه", red: true },
      { text: "\u00A0", red: false },
      { text: "بشتاق له ونفسي يشتاق لي", red: true },
      { text: "واشغل باله زي ما شغلني", red: true },
      { text: "ياما سنين فاتوا من قبله", red: true },
      { text: "كان فيهم ماساه", red: true },
      { text: "\u00A0", red: false },
    
      { text: "براحتها.. تتقل براحتها", red: false },
      { text: "اصل انتو مشفتوش براءتها.. ولا لون شعرها ولا قصتها", red: false },
      { text: " كل المقاييس دي قفلتها", red: false },
      { text: "\u00A0", red: false },
    
      { text: "كعبها.. عليه رنت خلخال", red: false },
      { text: "وملفوف في الايد انسيال.. لا مفيش بعد دا جمال!", red: false },
      { text: " كدا فل وعال", red: false },
      { text: "\u00A0", red: false },
    
      { text: "دي شخصية.. مش طبيعية", red: false },
      { text: "عفوية وكمان حنية.. معدية وردة مصرية", red: false },
      { text: " وبنسبة 100x100", red: false },
    ],
    critics: ["كلمات مُعبرة", "مناسبة لصوت محمد حماقي "]
  },
  {
    id: 5,
    title: "حبيبي الغالي",
    type: "سلو رومانسي",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776984263/%D8%AD%D8%A8%D9%8A%D8%A8%D9%8A_%D8%A7%D9%84%D8%BA%D8%A7%D9%84%D9%8A_fxttez.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002417/%D8%AD%D8%A8%D9%8A%D8%A8%D9%8A_%D8%A7%D9%84%D8%BA%D8%A7%D9%84%D9%8A_rygq4p.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "علي طول جوايا كلام", red: false },
      { text: "معرفش ازاي اداريه", red: false },
      { text: "\u00A0", red: false },
      { text: "انا عمري في يوم ما انساه", red: false },
      { text: "لو حتي هيحصل ايه", red: false },
      { text: "\u00A0", red: false },
      { text: "ومعذب فكري", red: false },
      { text: "الخوف من اني مبقاش ليه", red: false },
      { text: "\u00A0", red: false },
      { text: "وانا مهما يعيد ويقول", red: false },
      { text: "هفضل برضه ابقي عليه", red: false },
      { text: "\u00A0", red: false },
      
      { text: "دا حبيبي", red: true },
      { text: "وغالي عندي وكل يوم بحبه اكثر", red: true },
      { text: "\u00A0", red: false },
      { text: "لو ليله بعد عني", red: true },
      { text: "مقدرش اني في غيره افكر", red: true },
      { text: "\u00A0", red: false },
      { text: "بيزيد وصفي وكلامي عنه", red: true },
      { text: "وبيزيد اكير في تفاصيله", red: true },
      { text: "\u00A0", red: false },
      { text: "دا انا قلبي بيطمن يادوب لما", red: true },
      { text: "لما بس بشوف عينه", red: true },
      { text: "\u00A0", red: false },
    
      { text: "دا حبيبي الغالي", red: true },
      { text: "حبيبي الغالي حبيبي وروحي كمان", red: true },
      { text: "دا في كل دقيقه", red: true },
      { text: "في كل ثواني بشوفه في كل مكان", red: true},
      { text: "\u00A0", red: false }, 
      
      { text: "وبحس اني", red: false },
      { text: "بطير واسرح بخيالي في وسط سماه", red: false},
      { text: "\u00A0", red: false }, 
      { text: "سحرتني عيناه", red: false},
      { text: "وارتاحت انا لي وكأن وجوده حياه", red: false },
      { text: "\u00A0", red: false }, 
      { text: "سلمت اليه", red: false },
      { text: "روحي دابت فيه ضحكت لي الدنيا معاه", red: false },
      { text: "\u00A0", red: false }, 
      { text: "والايام بيه", red: false },
      { text: "بقت تحلي والعين عشقاه وبقيت مغرم بهواه", red: false},
    ],
    critics: ["الكلمات مُعبرة","اللحن مختلف ","مناسبة لصوت تامر عاشور"]
  },
  {
    id: 6,
    title: "وعدّي الليل ",
    type: "رومانسي كلاسي",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776984263/%D8%B1%D9%88%D8%AD%D9%8A_%D9%85%D8%B4%D8%AA%D8%A7%D9%82%D9%87_umhqr8.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002997/%D9%88%D8%B9%D8%AF%D9%8A_%D8%A7%D9%84%D9%84%D9%8A%D9%84_uxgnfs.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "مقطع من أغنية و عدّي الليل", red: true},
      { text: "\u00A0", red: false },
      { text: "دا روحي مشتاقه له", red: false },
      { text: "وهوا مش في باله", red: false },
      { text: "\u00A0", red: false },
      { text: "وبستلهف وصوله", red: false },
      { text: "وبيقلل وصاله", red: false },
      { text: "\u00A0", red: false },
      { text: "وحشاني عيونه", red: false },
      { text: "وبتغني بجماله", red: false },
      { text: "\u00A0", red: false },
      { text: "وغيرني بجنونه", red: false },
      { text: "وحيرني بدلاله", red: false },
      { text: "\u00A0", red: false },
      { text: "وكل اما بشوفه", red: true },
      { text: "وايدي تنول سلامه", red: true },
      { text: "\u00A0", red: false },
      { text: "الاقي الناس يقولوه", red: true },
      { text: "حبيبك له مقامه", red: true },
    ],
    critics: ["الكلمات دقيقة في التعبير"]
  },
  {
    id: 7,
    title: "عرض خاص",
    duet: false,
    type: "شعبي",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776497772/La7n_3ard_Khas_abovr4.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777002531/%D8%B9%D8%B1%D8%B6_%D8%AE%D8%A7%D8%B5_g1a33j.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "مش دا اللي كان عامل بيحبنا", red: false },
      { text: "وبدون مبرر راح وفارق قلبنا", red: false },
      { text: "\u00A0", red: false },
      { text: "دلوقتي جاي يقول انه مشتاق لنا", red: false },
      { text: "مع ان الغلطة عنده ومش عندنا", red: false },
      { text: "\u00A0", red: false },
      { text: "مغرور اوي وغروره دا اللي وقعه", red: false },
      { text: "حذرته وكلامي مرضيش يسمعه", red: false },
      { text: "\u00A0", red: false },
      { text: "بيقول اعذار مش مقنعين ولا ينفعه", red: false },
      { text: "انا قلبي كان معاه واختار يضيعه", red: false },
      { text: "\u00A0", red: false },
    
      { text: "بطلنا خلاص نشتري في الرخاص", red: true },
      { text: "قررنا نبيعهم وعملنا عرض خاص", red: true },
      { text: "اشتري بياع ووحيد مالوش عزاز", red: true },
      { text: "هتاخد عليهم واحد معدوم الاحساس", red: true },
      { text: "\u00A0", red: false },
    
      { text: "كان بيقول حاجة وبيعمل عكسها", red: false },
      { text: "كان فيه شروط ماعملهاش كلها", red: false },
      { text: "\u00A0", red: false },
      { text: "كان عامل طيب وفاكرني هصدقه", red: false }, 
      { text: " واهو برضه طمعه كشفه وغرقه", red: false },
      { text: "\u00A0", red: false },
      { text: "رغم انه عارف اني بعشقه", red: false },
      { text: "دلوقتي اسمه مبقتش بنطقه", red: false },
      { text: "\u00A0", red: false },
    
      { text: "لا مستحيل قلبنا يضعف ويميل", red: true },
      { text: "عدينا كتير واهو مطلعش اصيل", red: true },
      { text: "من اجل جنابه ياما داخل في مواويل", red: true },
      { text: "بقا دي اخرها بقا دا رد الجميل", red: true },
    ],
    critics: ["الكلمات سهلة الحفظ","مناسبة لصوت حوده بندق"]
  },
    
];

const MelodiesPage  = () => {
  const [starRatings, setStarRatings] = useState<Record<number, number>>({});
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [audioTimes, setAudioTimes] = useState<Record<string, { current: number; duration: number }>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  const filteredSongs = useMemo(() => {
    const q = normalizeArabic(search);
    const cat = MEL_CATEGORIES.find((c) => c.key === activeCat) || MEL_CATEGORIES[0];
    return allSongs.filter((s) => {
      if (!cat.match(s.type || '')) return false;
      if (!q) return true;
      const hay = [s.title, s.type, ...(s.lyrics?.map((l) => l.text) || [])].join(' ');
      return normalizeArabic(hay).includes(q);
    });
  }, [search, activeCat]);


  const normalizeAudioUrls = (audioUrls: string[] | string | undefined): string[] => {
    if (Array.isArray(audioUrls)) return audioUrls.filter((url) => typeof url === 'string' && url.trim() !== '');
    if (typeof audioUrls === 'string' && audioUrls.trim() !== '') return [audioUrls];
    return [];
  };

  const formatTime = (timeInSeconds: number): string => {
    if (!Number.isFinite(timeInSeconds) || timeInSeconds < 0) return "00:00";
    const totalSeconds = Math.floor(timeInSeconds);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const togglePlay = (songId: number, audioIdx: number) => {
    const key = `${songId}-${audioIdx}`;
    if (playingKey === key) {
      audioRefs.current[key]?.pause();
      setPlayingKey(null);
    } else {
      if (playingKey !== null) audioRefs.current[playingKey]?.pause();
      audioRefs.current[key]?.play();
      setPlayingKey(key);
    }
  };

  const handleCriticClick = (songId: number, idx: number) => {
    const key = `${songId}-${idx}`;
    if (!selectedCritics[key]) {
      setSelectedCritics(prev => ({ ...prev, [key]: Math.floor(Math.random() * 31) + 65 }));
    }
  };

  return (
    <div dir="rtl" className="page-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');
        
        .page-wrapper { background: linear-gradient(180deg, #1a051a 0%, #000 100%); min-height: 100vh; padding: 40px 20px; color: white; font-family: 'Almarai', sans-serif; }
        .main-card { max-width: 1100px; margin: 0 auto 60px; background: #040828; border: 2px solid #c9a84c; border-radius: 40px; display: flex; flex-direction: row-reverse; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8); }
        .player-side { flex: 1; padding: 30px; background: rgba(0,0,0,0.3); display: flex; flex-direction: column; align-items: center; }
        
        .song-tag { background: #c9a84c; color: #000; padding: 4px 20px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
        .cover-box { width: 100%; aspect-ratio: 1; background-size: cover; background-position: center; border-radius: 20px; border: 1px solid rgba(201, 168, 76, 0.3); }

        .views-badge {
          background-color: #f0fdf4;
          color: #1a2e44;
          padding: 8px 30px;
          border-radius: 50px;
          font-weight: bold;
          font-size: 1.4rem;
          margin-top: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-block;
          border: none;
        }

        .views-badge:hover {
          background-color: #c9a84c;
          color: #000;
          transform: scale(1.05);
        }

        .custom-player-wrapper { width: 100%; background: #4a1d4d; border-radius: 50px; padding: 8px 15px; display: flex; align-items: center; gap: 12px; margin-top: 15px; }
        .play-btn { background: #c9a84c; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; color: #040828; display: flex; align-items: center; justify-content: center; }
        .player-time { min-width: 92px; font-size: 0.85rem; color: #f3d98a; text-align: center; letter-spacing: 0.5px; }
        .wave-container { display: flex; align-items: center; gap: 3px; height: 24px; flex: 1; }
        .wave-bar { width: 3px; height: 8px; background: rgba(201, 168, 76, 0.35); border-radius: 2px; }
        .wave-bar.active { background: #ff0000; animation: wave-anim 1s infinite; }
        .audio-index-badge {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 1px solid #c9a84c;
          background: rgba(4, 8, 40, 0.95);
          color: #f3d98a;
          font-size: 0.9rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @keyframes wave-anim { 0%, 100% { height: 8px; } 50% { height: 24px; } }

        .star-rating { display: flex; justify-content: center; gap: 8px; margin: 10px 0; }
        .star { font-size: 28px; cursor: pointer; color: #2a102a; transition: 0.3s; }
        .star.active { color: #8b008b; text-shadow: 0 0 10px #ff0055; }

        .lyrics-side { flex: 1.3; padding: 40px; border-left: 1px solid rgba(201, 168, 76, 0.2); }
        .label-gold { color: #c9a84c; font-size: 13px; margin-bottom: 10px; display: block; }
        .title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .song-title-red { color: #ff4d4d; font-family: 'Aref Ruqaa Ink', serif; font-size: 2.8rem; margin-bottom: 0; }
        .duet-badge { border: 1px solid #c9a84c; color: #c9a84c; border-radius: 8px; padding: 4px 12px; font-size: 0.95rem; font-weight: 700; }
        .lyrics-scroll { height: 250px; overflow-y: auto; margin-bottom: 30px; }
        .lyrics-scroll::-webkit-scrollbar { width: 6px; }
        .lyrics-scroll::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }
        .line { font-size: 1.2rem; margin-bottom: 10px; border-right: 3px solid #c9a84c; padding-right: 15px; }
        .line.red { color: #ff4d4d; border-right-color: #ff4d4d; font-weight: bold; }

        .critic-item { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between; border: 1px solid rgba(201,168,76,0.1); }

        @media (max-width: 900px) { .main-card { flex-direction: column; } .lyrics-side { border-left: none; border-top: 1px solid rgba(201,168,76,0.2); } }
      `}</style>

      {/* Search + Filter */}
      <div style={{ maxWidth: 1100, margin: '0 auto 30px' }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="ابحث عن لحن..."
          className="mb-5"
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {MEL_CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`filter-chip ${activeCat === c.key ? 'active' : ''}`}
              onClick={() => setActiveCat(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 12, color: '#c9a84c', fontSize: 13 }}>
          {filteredSongs.length} / {allSongs.length}
        </div>
      </div>

      {filteredSongs.map((song) => (
        <div key={song.id} className="main-card">
          <div className="player-side">
            <div className="song-tag">{song.type}</div>
            <div className="cover-box" style={{ backgroundImage: `url(${toDriveDirectDownloadUrl(song.coverImg)})` }} />
            
            <div className="views-badge">{song.views}</div>

            {normalizeAudioUrls(song.audioUrls).map((url, idx) => {
              const key = `${song.id}-${idx}`;
              const time = audioTimes[key] || { current: 0, duration: 0 };
              return (
                <div key={idx} className="custom-player-wrapper">
                  <button className="play-btn" onClick={() => togglePlay(song.id, idx)}>
                    {playingKey === key ? '⏸' : '▶'}
                  </button>
                  <span className="player-time">{formatTime(time.current)} / {formatTime(time.duration)}</span>
                  <div className="wave-container">
                    {[...Array(15)].map((_, i) => (
                      <div key={i} className={`wave-bar ${playingKey === key ? 'active' : ''}`} style={{ animationDelay: `${i * 0.05}s` }} />
                    ))}
                  </div>
                  <span className="audio-index-badge">{idx + 1}</span>
                  <audio
                    ref={(el) => { audioRefs.current[key] = el; }}
                    src={toDriveDirectDownloadUrl(url)}
                    onLoadedMetadata={(e) => {
                      const duration = e.currentTarget.duration || 0;
                      setAudioTimes(prev => ({ ...prev, [key]: { current: prev[key]?.current || 0, duration } }));
                    }}
                    onTimeUpdate={(e) => {
                      const current = e.currentTarget.currentTime || 0;
                      const duration = e.currentTarget.duration || 0;
                      setAudioTimes(prev => ({ ...prev, [key]: { current, duration } }));
                    }}
                    onEnded={() => setPlayingKey(null)}
                  />
                </div>
              );
            })}

            <div style={{marginTop: '20px', textAlign: 'center'}}>
              <span className="label-gold">تقييمك</span>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num} className={`star ${num <= (starRatings[song.id] || 0) ? 'active' : ''}`} onClick={() => setStarRatings(prev => ({ ...prev, [song.id]: num }))}>★</span>
                ))}
              </div>
            </div>
          </div>

          <div className="lyrics-side">
            <span className="label-gold">كلمات الأغنية</span>
            <div className="title-row">
              <h2 className="song-title-red">{song.title}</h2>
              {'duet' in song && song.duet && <span className="duet-badge">ديو</span>}
            </div>
            <div className="lyrics-scroll">
              {song.lyrics.map((l, i) => (
                <div key={i} className={`line ${l.red ? 'red' : ''}`}>{l.text}</div>
              ))}
            </div>
            <span className="label-gold">الآراء النقدية (اضغط للتقييم)</span>
            {song.critics.map((critic, idx) => (
              <div key={idx} className="critic-item" onClick={() => handleCriticClick(song.id, idx)}>
                <span style={{fontSize: '14px'}}>{critic}</span>
                {selectedCritics[`${song.id}-${idx}`] && <span style={{color: '#c9a84c', fontWeight: 'bold'}}>{selectedCritics[`${song.id}-${idx}`]}%</span>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MelodiesPage
