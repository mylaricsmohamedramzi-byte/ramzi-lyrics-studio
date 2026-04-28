import { useState, useRef, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';

// ─── ملاحظات موسيقية عائمة ────────────────────────────────────────────────────
const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '𝄢', '♭', '♮', '♯', '𝄡', '♬', '♪', '♫', '♩'];

const FloatingNotes = () => {
  const items = Array.from({ length: 24 }, (_, i) => ({
    note: NOTES[i % NOTES.length],
    left: (i * 11 + 5) % 96,
    size: 30 + ((i * 9) % 36),
    duration: 8 + ((i * 3) % 9),
    delay: (i * 1.1) % 7,
  }));
  return (
    <div aria-hidden="true" className="floating-notes-layer">
      {items.map(({ note, left, size, duration, delay }, i) => (
        <span key={i} className="floating-note"
          style={{ left: `${left}%`, top: '110%', fontSize: `${size}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
          {note}
        </span>
      ))}
    </div>
  );
};

const CardFloatingNotes = ({ seed }: { seed: number }) => {
  const items = Array.from({ length: 12 }, (_, i) => ({
    note: NOTES[(i + seed) % NOTES.length],
    left: (i * 17 + seed * 9) % 96,
    size: 20 + ((i * 5 + seed) % 20),
    duration: 7 + ((i * 2 + seed) % 7),
    delay: (i * 0.9 + seed * 0.3) % 6,
  }));
  return (
    <div aria-hidden="true" className="card-floating-notes">
      {items.map(({ note, left, size, duration, delay }, i) => (
        <span key={`${seed}-${i}`} className="card-floating-note"
          style={{ left: `${left}%`, top: '112%', fontSize: `${size}px`, animationDuration: `${duration}s`, animationDelay: `${delay}s` }}>
          {note}
        </span>
      ))}
    </div>
  );
};

// ─── فئات الأغاني ────────────────────────────────────────────────────────────
const SONG_CATEGORIES: { key: string; ar: string; en: string; match: (c: string) => boolean; order: number }[] = [
  { key: 'all',             ar: 'الكل',             en: 'All',              match: () => true,                                                       order: 0  },
  { key: 'islamic',         ar: 'إسلامي',           en: 'Islamic',          match: (c) => /islamic|إسلامي/i.test(c),                                order: 1  },
  { key: 'patriotic',       ar: 'وطني',             en: 'Patriotic',        match: (c) => /patriotic|وطني/i.test(c),                                 order: 2  },
  { key: 'social',          ar: 'اجتماعي وعائلي',   en: 'Social & Family',  match: (c) => /social|family|اجتماعي|عائلي/i.test(c),                  order: 3  },
  { key: 'occasion',        ar: 'مناسبات وأعياد',   en: 'Occasion & Holiday', match: (c) => /occasion|holiday|مناسبات|أعياد/i.test(c),            order: 4  },
  { key: 'motivational',    ar: 'تحفيزية',          en: 'Motivational',     match: (c) => /motivational|تحفيزية|تحفيز/i.test(c),                    order: 5  },
  { key: 'poems',           ar: 'قصائد',            en: 'Poems',            match: (c) => /poems|قصائد|قصيدة/i.test(c),                              order: 6  },
  { key: 'classic',         ar: 'كلاسيك',           en: 'Classic',          match: (c) => /classic|كلاسيك/i.test(c),                                 order: 7  },
  { key: 'drama',           ar: 'دراما',            en: 'Drama',            match: (c) => /drama|دراما/i.test(c),                                    order: 8  },
  { key: 'slow',            ar: 'سلو',              en: 'Slow',             match: (c) => /slow|سلو/i.test(c),                                       order: 9  },
  { key: 'romantic',        ar: 'رومانسي',          en: 'Romantic',         match: (c) => /^رومانسي$/i.test(c.trim()),                               order: 10 },
  { key: 'romantic_maqsum', ar: 'رومانسي مقسوم',   en: 'Romantic Maqsum',  match: (c) => /رومانسي مقسوم/i.test(c),                                 order: 11 },
  { key: 'pop',             ar: 'بوب',              en: 'Pop',              match: (c) => /pop|بوب/i.test(c),                                        order: 12 },
  { key: 'rock',            ar: 'روك',              en: 'Rock',             match: (c) => /rock|روك/i.test(c),                                       order: 13 },
  { key: 'maqsum',          ar: 'مقسوم',            en: 'Maqsum',           match: (c) => /^مقسوم$/i.test(c.trim()),                                 order: 14 },
  { key: 'tarab',           ar: 'طرب',              en: 'Tarab',            match: (c) => /tarab|طرب/i.test(c),                                      order: 15 },
  { key: 'shaabi',          ar: 'شعبي',             en: 'Shaabi',           match: (c) => /shaabi|شعبي/i.test(c),                                    order: 16 },
  { key: 'saidi',           ar: 'صعيدي',            en: "Sa'idi",           match: (c) => /sa'idi|saidi|صعيدي/i.test(c),                             order: 17 },
  { key: 'rap',             ar: 'راب',              en: 'Rap',              match: (c) => /^راب$/i.test(c.trim()),                                   order: 18 },
  { key: 'trap',            ar: 'تراب',             en: 'Trap',             match: (c) => /trap|تراب/i.test(c),                                      order: 19 },
];

function getCategoryOrder(type: string): number {
  const match = SONG_CATEGORIES.find((c) => c.key !== 'all' && c.match(type || ''));
  return match ? match.order : 99;
}

function toDriveDirectDownloadUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed || !trimmed.includes('drive.google.com')) return trimmed;
  try {
    const u = new URL(trimmed);
    const fromPath = u.pathname.match(/\/file\/d\/([^/]+)/)?.[1];
    if (fromPath) return `https://drive.google.com/uc?export=download&id=${fromPath}`;
    if (u.pathname === '/open' || u.pathname.endsWith('/open')) {
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
    if (u.pathname === '/uc' && u.searchParams.get('export') === 'download') {
      const id = u.searchParams.get('id');
      if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    }
  } catch { return trimmed; }
  return trimmed;
}

// ─── بيانات الأغاني ───────────────────────────────────────────────────────────
const allSongs = [
  {
    id: 1,
    title: "مليش غيرِك",
    type: "راب",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509740/%D9%85%D9%84%D9%8A%D8%B4_%D8%BA%D9%8A%D8%B1%D9%83-%D8%B1%D8%A7%D8%A8_%D8%B1%D9%88%D9%85%D8%A7%D9%86%D8%B3%D9%8A_j5mdkx.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776510464/%D9%85%D9%84%D9%8A%D8%B4_%D8%BA%D9%8A%D8%B1%D9%83_weld7x.png",
    views: "88 ",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "نفسي لو بقا قلبي دايب ... تبقي انتي ليه المدد", red: false },
      { text: "لو راحو مني الحبايب ... تفضلي انتي للئبد", red: false },
      { text: "نفسي لو مره أتكسرت ... تبقي انتي ليه السند", red: false },
      { text: "ولما طموحي يبقا باهت ... ترجعي انتي بالامل", red: false },
      { text: "\u00A0", red: false },
      { text: "نفسي لما أغيب تشتاقي لي ... و أما أرجع تستقبليني", red: false },
      { text: "و أما أحكي لك تسمعيني ... وتفضلي جمبي وتواسيني", red: false },
      { text: "و لما الدنيا تأسيني ... تيجي عيونك و تهديني", red: false },
      { text: "ولما الهم يناديني ... تيجي بروحك تنقذيني", red: false },
      { text: "\u00A0", red: false },
      { text: "نفسي تشيليني في عينك ... نفسي تحبيني في ليلك", red: true },
      { text: "نفسي افرحك في سنينك ... و يدوم اللي بيني وبينك", red: true },
      { text: "نفسي اجيبلك البساط ... نركب عليه ونطير", red: true },
      { text: "أو نستكشف البحار ... أو نبقا من الاساطير", red: true },
      { text: "\u00A0", red: false },
      { text: "نفسي أجيبلك النجوم ... وأكتب أسمك ع الغيوم", red: true },
      { text: "ونشتري نفس الهدوم ... نسهر وعيوننا تروح في النوم", red: true },
      { text: "\u00A0", red: false },
      { text: "نفسي اجيبلك قصر غالي ... و تبقي الملكه وانا الامير", red: false },
      { text: "نفسي اما يتغير حالي ... تعرفي اني مش بخير", red: false },
      { text: "ولما احكي لكي انا مالي ... القي حضنك البديل", red: false },
      { text: "نفسي اشكي لك اي جرالي ... بدل م اشكي انا ل الليل", red: false },
      { text: "\u00A0", red: false },
      { text: "ومليش غيرك بعد الليل ... وهوا نجمه كبير", red: false },
      { text: "وانا قلبي صغير ... ومعذبني الضمير", red: false },
      { text: "وتعبت من التفكير ... وبقيت للوجع أسير", red: false },
      { text: "وبحاول أغير المصير ... والباقي في عمري مش كثير", red: false },
      { text: "\u00A0", red: false },
      { text: "صدقيني العيشه صعبه ... طول م القلب دا وحيد", red: false },
      { text: "وكلمة الصحاب دي لعبه ... و اصحابي طلعُه تقليد", red: false },
      { text: "كنت عاشق ل المداعبه ... خلو اعصابي حديد", red: false },
      { text: "عملُه في عقلي ألف شُعبه ... و خلُه قلبي بقا العميد", red: false },
      { text: "\u00A0", red: false },
      { text: "نفسي اجيبلك البساط ... نركب عليه ونطير", red: true },
      { text: "أو نستكشف البحار ... أو نبقا من الاساطير", red: true },
    ],
    critics: ["الكلمات مبهره واللحن متناغم", "الكلمات مًبهره لكن اللحن ضعيف", "الأغنية مناسبة لصوت أمير عيد"],
  },
  {
    id: 2,
    title: "إسأل مجرّب",
    type: "رومانسي مقسوم",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776499513/asal_mgrّb-Semi-Romantic_qldibc.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509727/asal_mgr%D9%91b_pop_i91mvo.mp3 ",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776510465/%D8%A5%D8%B3%D8%A3%D9%84_%D9%85%D8%AC%D8%B1%D8%A8_qr7zra.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "", red: true },
      { text: "مع احترامي للجمال بحاله", red: false },
      { text: "أنا أول مرة أشوف حد في جماله", red: false },
      { text: "أهو دا اللي حكى عنه كتير وقاله", red: false },
      { text: "دا بيجي مرة واحدة مفيش بدله", red: false },
      { text: "\u00A0", red: false },
      { text: "أنا عاوز بس أسأل عيناه البريئة", red: false },
      { text: "يا ترى قلبه حبيب وله طريقة؟", red: false },
      { text: "يا ترى شغلت باله ولو دقيقة؟", red: false },
      { text: "طب هل هيرد ويقول الحقيقة؟", red: false },
      { text: "\u00A0", red: false },
      { text: "ولا هيقول كلام ملهش معنى؟", red: false },
      { text: "\u00A0", red: false },
      { text: "أصل بصراحة كده", red: true },
      { text: "أنا عمري ما شفت كده", red: true },
      { text: "ودي مش مجاملة بقى", red: true },
      { text: "دا أنا روحي بيه متعلقة", red: true },
      { text: "\u00A0", red: false },
      { text: "مش عاوز غيره لا لا", red: true },
      { text: "ولا هسيبه استحالة", red: true },
      { text: "دا خلي حالتي حالة", red: true },
      { text: "أول ما شافوه عيوني", red: true },
      { text: "\u00A0", red: false },
      { text: "دا اللي استنيته بفارغ الانتظار", red: false },
      { text: "أول ما شفته عقلي منه طار", red: false },
      { text: "أنا بتكلم بجد ومش هزار", red: false },
      { text: "حبيته وقلبي وافق على القرار", red: false },
      { text: "\u00A0", red: false },
      { text: "طب امتى بس أقابله؟", red: true },
      { text: "وينسيني اللي قبله", red: true },
      { text: "يظهر قلبي اتكتب له", red: true },
      { text: "ميحبش إلا قلبه", red: true },
      { text: "\u00A0", red: false },
      { text: "بيقولوا اسأل مجرب", red: true },
      { text: "وسألته قالي قرب", red: true },
      { text: "لكن عيناه بتتهرب", red: true },
      { text: "كل أما بيشوفوني", red: true },
    ],
    critics: ["كلمات خفيفة وبسيطة", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل", "الاغنية مناسبة لصوت محمد حماقي", "الاغنية مناسبة لصوت رامي جمال"],
  },
  {
    id: 3,
    title: "سرّ إختلافي",
    duet: true,
    type: "بوب",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509721/Sirr_A5tlAfy-2_nyoxxa.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509720/Sirr_A5tlAfy-3_iednte.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776510465/%D8%B3%D8%B1_%D9%91%D8%A5%D8%AE%D8%AA%D9%84%D8%A7%D9%81%D9%8A_otkvhz.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "المطرب 👨‍💼", red: false },
      { text: "ربنا ما يحرمني منك.. ربنا يخليكي ليه", red: false },
      { text: "كل ما أطلب حاجة منك.. بتقولي لي من عنيه", red: false },
      { text: "\u00A0", red: false },
      { text: "المطربة 👩‍🎤", red: true },
      { text: "ربنا ما يحرمني منك.. ربنا يخليك ليه", red: true },
      { text: "بتقولي من عنيه.. كل ما أطلب حاجة منك", red: true },
      { text: "\u00A0", red: false },
      { text: "المطرب 👨‍💼", red: false },
      { text: "وقت زهقي تفرقشيني.. وقت زعلي تضحكيني", red: false },
      { text: "أحلى وردة شافتها عيني.. إنتي يا أحسن هدية", red: false },
      { text: "\u00A0", red: false },
      { text: "المطربة 👩‍🎤", red: true },
      { text: "أحلى حاجة شافتها عيني.. أنت يا أحسن هدية", red: true },
      { text: "\u00A0", red: false },
      { text: "المطرب 👨‍💼", red: false },
      { text: "إنتي قلبي روحي إنت كل حاجة نور عيوني كوني مصدر السعادة", red: false },
      { text: "غالية عندي عندي ليكي حب ياما حب ياما", red: false },
      { text: "\u00A0", red: false },
      { text: "المطربة 👩‍🎤", red: true },
      { text: "وأنت قلبي روحي أنت كل حاجة نور عيوني كوني مصدر السعادة", red: true },
      { text: "يا اللي حبك ساب فيه ميت علامة ميت علامة", red: true },
      { text: "\u00A0", red: false },
      { text: "المطرب 👨‍💼", red: false },
      { text: "أيوه كل الناس في كفه.. وإنتي عندي في كفه ثانية", red: false },
      { text: "وقت وجعي بتبقي واقفه.. مش بتبعدي عني ثانية", red: false },
      { text: "\u00A0", red: false },
      { text: "المطربة 👩‍🎤", red: true },
      { text: "يا جميل يا أبو قلب صافي.. أنت يا سر إختلافي", red: true },
      { text: "إرتاحي يا روحي ليه تخافي.. دا اللي هيحافظ عليه", red: true },
    ],
    critics: ["كلمات مُبهجة", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل", "مناسبة لصوت تامر حسني و شرين عبدالوهاب", "مناسبة لصوت رامي صبري و نانسي عجرم"],
  },
  {
    id: 4,
    title: "كام دقيقة",
    duet: true,
    type: "رومانسي مقسوم",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509709/%D9%83%D8%A7%D9%85_%D8%AF%D9%82%D9%8A%D9%82%D9%87_slow_vtuujc.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509722/%D9%83%D8%A7%D9%85_%D8%AF%D9%82%D9%8A%D9%82%D9%87_%D9%85%D9%82%D8%B3%D9%88%D9%85_wcqx5a.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776512148/%D9%83%D8%A7%D9%85_%D8%AF%D9%82%D9%8A%D9%82%D9%87_gczdu3.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "المطرب 👨‍💼", red: false },
      { text: "اه لو ننسى الغمّ شويه .. والإِ حساس بالمسؤليه", red: false },
      { text: "لو دمعتي تفضل في عنيه .. و أسرح و أنسى معاك الدنيا", red: false },
      { text: "وأبقى في مود الروقان", red: false },
      { text: "\u00A0", red: false },
      { text: "المطربة 👩‍🎤", red: true },
      { text: "و القيك يا حبيبي بتسمعني .. وتخفف لي ف هَمِّي و وجعي", red: true },
      { text: "تشغل بالي و تدخل قلبي .. ميسبنيش ولا يبعد عني", red: true },
      { text: "تبقي السند والأمان", red: true },
      { text: "\u00A0", red: false },
      { text: "المطرب 👨‍💼 مع المطربة 👩‍🎤", red: false },
      { text: "أنا مش عاوز حاجه من الدنيا.. دا كفايه تكون جنبي", red: false },
      { text: "مش هقدر أضيع ولا ثانيه .. يا حبيبي صدقني", red: false },
      { text: "دا مقامك عندي حاجة تانيه.. اه يا حظّي وبختي", red: false },
      { text: "لِآخِر لحظه في عُمْرِي باقيه .. هتفضل في قلبي", red: false },
      { text: "\u00A0", red: false },
      { text: "المطرب 👨‍💼", red: false },
      { text: "اه لو نفرح كام دقيقه.. وتبان الضحكه البريئه", red: false },
      { text: "لو تبقى الأحلام حقيقه .. ونسيب الناس الخنيقه", red: false },
      { text: "و نحب و نعشق كمان", red: false },
      { text: "\u00A0", red: false },
      { text: "المطربة 👩‍🎤", red: true },
      { text: "وأعيش عُمْرِي معاك في سعاده.. و يكبر حُبّنَا دا كل مَادّه", red: true },
      { text: "نعمل ما بدلنا و زياده .. و ننجح كدا من غير إِعاده", red: true },
      { text: "ونتهّرب من الاحزان", red: true },
    ],
    critics: ["كلمات مُعبرة", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل", "مناسبة لصوت محمد حماقي و أنغام", "مناسبة لصوت بهاء سلطان و إليسا"],
  },
  {
    id: 5,
    title: "نفسي أشوفه",
    type: "روك",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509741/Nafsy_Ashofoo-2_hjtoq1.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776512869/%D9%86%D9%81%D8%B3%D9%8A_%D8%A7%D8%B4%D9%88%D9%81%D9%87_pjgqah.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "نفسي أشوفه أو أقابله ... بس بيطلع لي حجه", red: false },
      { text: "مش بلُومه ولا أحاسبه ... مش عارف هقابله أمتي", red: false },
      { text: "لو ظلمني أنا مسامحه ... المهم أنه يرجع", red: false },
      { text: "مش عايش أنا من بعده ... و الكلام دا مش هينفع", red: false },
      { text: "\u00A0", red: false },
      { text: "أيوه روحي فيه وحابُه ... والليالي علينا تشهد", red: false },
      { text: "عُمري م أقدر أنا أعاتبه ... مهما يعمل مهما يغلط", red: false },
      { text: "حُبه بقا ساكن قلبي ... عُمره يوم م يموت ويبهت", red: false },
      { text: "اه وحشني أوي يا قلبي ... حُبي ليه بيزيد و يكتر", red: false },
      { text: "\u00A0", red: false },
      { text: "كان لازم يا قلبي نندم ... علي اللي خلاه منا يغضب", red: true },
      { text: "كان لازم يا قلبي نعرف ... أن من غيره هنتعب", red: true },
      { text: "لأ يا قلبي مش هنقدر ... أننا في غيره نعشق", red: true },
      { text: "مهما يجرئ مهما يحصل ... أحنا منُه مش هنزعل", red: true },
      { text: "\u00A0", red: false },
      { text: "الفراق دا علي عيني ... أصله حسسني بقيمته", red: false },
      { text: "نفسي أشوفه أوي يا عيني ... نفسي حتي أشم رائحته", red: false },
      { text: "هوا دا كل سنيني ... مش مصبرني إلا صورته", red: false },
      { text: "اه يا ناس نور عيني ... أيوه راحتي هيا راحتُه", red: false },
      { text: "\u00A0", red: false },
      { text: "هل يا تري هيسامحنا ... ولاه هيطول في غيبتُه", red: true },
      { text: "نفسي يرجع ويصالحنا ... نفسي أشوف بجد وِدُه", red: true },
      { text: "اه غيابه عنا مِحنا ... دا البُعاد بقا من عوايدُه", red: true },
      { text: "هوا ليه بس جرِحنا ... شكلُه مش عارف غلاوته", red: true },
    ],
    critics: ["الكلمات ضعبفه نسبياً", "اللحن مختلف", "مناسبة لصوت عزيز مارقه"],
  },
  {
    id: 6,
    title: "عامل ناسيني",
    type: "رومانسي مقسوم",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509748/%D8%B9%D9%8E%D8%A7%D9%85%D9%90%D9%84%D9%92_%D9%86%D9%8E%D8%A7%D8%B3%D9%90%D9%8A%D9%86%D9%90%D9%8A_1_b5cueb.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776514519/%D8%B9%D8%A7%D9%85%D9%84_%D9%86%D8%A7%D8%B3%D9%8A%D9%86%D9%8A_h0iwop.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "يا ويلي من اللي بحبه.. اه يا ويلي", red: false },
      { text: "محيرني معاه... مطلع عيني", red: false },
      { text: "و رغم أني شاريه..و روحي فيه", red: false },
      { text: "تقلان وعامل ناسيني", red: false },
      { text: "\u00A0", red: false },
      { text: "مع أن انا بفضل ألاغيه ... وهوا كمان بيلاغي فيا", red: true },
      { text: "لكن عِنده مسيطر عليه ... وبيقول اللي بينا صُحبيه", red: true },
      { text: "وأديني بسياره وبهاوده ... وبفتح ف السيره كل شويه", red: true },
      { text: "ومسيره يقول اللي ف قلبه ... و يقول بحبك ليه", red: true },
      { text: "\u00A0", red: false },
      { text: "جماله دا حاله نادره... ملوش تاني", red: false },
      { text: "شدوني عيناه القادره... ف ثواني", red: false },
      { text: "يا روحي ع الطله....ما شاء الله", red: false },
      { text: "بحبه يا ناس واعمل... أي تاني؟", red: false },
      { text: "\u00A0", red: false },
      { text: "مع أن انا بفضل ألاغيه ... وهوا كمان بيلاغي فيا", red: false },
      { text: "لكن عِنده مسيطر عليه ... وبيقول اللي بينا صُحبيه", red: false },
      { text: "\u00A0", red: false },
      { text: "مع أن انا بفضل ألاغيه ... وهوا كمان بيلاغي فيا", red: true },
      { text: "لكن عِنده مسيطر عليه ... وبيقول اللي بينا صُحبيه", red: true },
      { text: "وأديني بسياره وبهاوده ... وبفتح ف السيره كل شويه", red: true },
      { text: "ومسيره يقول اللي ف قلبه ... و يقول بحبك ليه", red: true },
    ],
    critics: ["الكلمات سهلة الحفظ", "اللحن ضعيف نسبياً", "مناسبة لصوت توليت"],
  },
  {
    id: 7,
    title: "كيف حالك",
    duet: true,
    type: "قصائد",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509741/%D9%83%D9%8A%D9%81_%D8%AD%D8%A7%D9%84%D9%83_-Classic_sjn0km.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509723/%D9%83%D9%8A%D9%81_%D8%AD%D8%A7%D9%84%D9%83_-Duets_w2xrh0.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776515834/%D9%83%D9%8A%D9%81_%D8%AD%D8%A7%D9%84%D9%83_zhidhs.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "حَبِيبَتِي قَدْ أَتَتْنِي اَلْرِّيِحُ بِمَا لَا أَشْتَهِي", red: false },
      { text: "وَلَقَدْ صَبَرْتُ حَتَّى صَارَ الصَّبْرُ مِنِّي يَشْتَكِي", red: false },
      { text: "مَا مِنْ كَلَامٍ مُنْصِفٍ يَوصِفُ شَوْقِي لَكِ", red: false },
      { text: "فَلِمَاذَا لَا تُطَمْئِنِيّ قَلْبِي الَّذِي أَحَبَّكِي؟", red: false },
      { text: "\u00A0", red: false },
      { text: "قَدْ سَأَلْتُ نُجُومَ اَلْلَيلِ عنكِي", red: true },
      { text: "فقَاَلُوُ لي أَنّهُمْ إذا رَأَوكِي سَيُخبِرونِي", red: true },
      { text: "\u00A0", red: false },
      { text: "وَ اسْتَشَرْتُ البحرَ حينَ نَاجَيِتُهُ", red: true },
      { text: "فَنَصَحَنِي بالتَأنّي مُؤَكِّداً أَنَّكِي سَتعُودِي", red: true },
      { text: "\u00A0", red: false },
      { text: "هَلْ مِنْ سَبِيلٍ لِلتَّلَاقِي بَعْدَ فِرَاقِنَا الطَّوِيلِ", red: false },
      { text: "كَيْفَ حَالُكِ؟ أَخْبِرِينِي يَا ذَاتَ الْوَجْهِ الْجَمِيلِ", red: false },
      { text: "هَلْ مَا زِلْتِي تَذْكُرِينِي وَقَلْبُكِ لِي يَمِيلُ؟", red: false },
      { text: "\u00A0", red: false },
      { text: "مَهْمَا جَارَ عَلَيَّ الزَّمَانُ فَإِنَّنِي لَنْ أَجُورَ عَلَيْكِ", red: false },
      { text: "وَاللهِ إِنَّ جُرْحِي يَطِيبُ حِينَ أَرَى عَيْنَيْكِ", red: false },
    ],
    critics: ["الكلمات عميقه وقويه", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل", "مناسبة لصوت كاظم الساهر", "مناسبة لصوت فضل شاكر"],
  },
  {
    id: 8,
    title: "لو شافني",
    type: "بوب",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509714/%D9%84%D9%88_%D8%B4%D8%A7%D9%81%D9%86%D9%8A_aygdxm.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776517974/%D9%84%D9%88_%D8%B4%D8%A7%D9%81%D9%86%D9%8A_ggebvl.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "واله وبقا ليك .. غيري يخليك", red: false },
      { text: "تسهر علشانه الليل", red: false },
      { text: "و اله و بقا في .. غيري تعيش لِيه", red: false },
      { text: "وكمان تتشد له و تميل", red: false },
      { text: "\u00A0", red: false },
      { text: "الله يرحم أيام زمان ... لما كان", red: true },
      { text: "بيطير من الفرحه لو شافني", red: true },
      { text: "\u00A0", red: false },
      { text: "و نبض قلبه .. بيزيد كمان", red: true },
      { text: "لو بس عدّي من جمبي", red: true },
      { text: "\u00A0", red: false },
      { text: "حتي الامان و الرحه بيكونو في قربي", red: true },
      { text: "و اله بيكونو ف قربي", red: true },
      { text: "\u00A0", red: false },
      { text: "كل دا كان كلام بيقوله و فاكرني هصدقه", red: false },
      { text: "كان جاي لغرض معرفش يطوله ف هرب قبل م أغرقه", red: false },
      { text: "و أهو لقي غيري و عماه بغروره و خلّه يقع في ملعبه", red: false },
      { text: "\u00A0", red: false },
      { text: "الله يرحم أيام زمان ... لما كان", red: true },
      { text: "بيطير من الفرحه لو شافني", red: true },
      { text: "\u00A0", red: false },
      { text: "و نبض قلبه .. بيزيد كمان", red: true },
      { text: "لو بس عدّي من جمبي", red: true },
      { text: "\u00A0", red: false },
      { text: "حتي الامان و الرحه بيكونو في قربي", red: true },
      { text: "و اله بيكونو ف قربي", red: true },
    ],
    critics: ["الكلمات بسيطه وسلِسه", "اللحن ضعيف نسبياً", "مناسبة لصوت كريم محسن", "شرين عبد الوهاب"],
  },
  {
    id: 9,
    title: "مش عيب",
    type: "رومانسي مقسوم",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509726/%D9%85%D8%B4_%D8%B9%D9%8A%D8%A8_vedbxq.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776520011/%D9%85%D8%B4_%D8%B9%D9%8A%D8%A8_dhn3py.png",
    views: "0 K",
    credits: "كلمات وألحان : محمد رمزي",
    lyrics: [
      { text: "متزعلش وحياتي عندك ... مبقدرش أنا علي زعلك", red: false },
      { text: "اه غبت لكن هرجعلك ... دا أنت غالي عندي", red: false },
      { text: "\u00A0", red: false },
      { text: "متقلقش طمن قلبك ... مينفعش أبعد عنك", red: false },
      { text: "يا كل ما ليّه بحبك ... ليه هداري يعني !", red: false },
      { text: "\u00A0", red: false },
      { text: "وهخاف من أيه ... لا بجد هخاف من أيه", red: true },
      { text: "أيوه أنا حبيت ... والحب يا ناس مش عيب", red: true },
      { text: "دا ليه سحر جميل ... بيدخل قلبنا يحييه", red: true },
      { text: "دا ملوش توقيت ... دا قدر مكتوب ونصيب", red: true },
      { text: "\u00A0", red: false },
      { text: "حبيبي مهما غيبتي تطول ... هفضل أحنلك علي طول", red: false },
      { text: "ومين عن هواه مسؤول ... أعمل أيه في قلبي", red: false },
      { text: "\u00A0", red: false },
      { text: "شفت الحلو كله معاك ... ضحكت لي الحياه وياك", red: false },
      { text: "فضلت سنين أستناك ... يا حبيبي صدقني", red: false },
      { text: "\u00A0", red: false },
      { text: "وهخاف من أيه ... لا بجد هخاف من أيه", red: true },
      { text: "أيوه أنا حبيت ... والحب يا ناس مش عيب", red: true },
      { text: "دا ليه سحر جميل ... بيدخل قلبنا يحييه", red: true },
      { text: "دا ملوش توقيت ... دا قدر مكتوب ونصيب", red: true },
    ],
    critics: ["الكلمات عاديه وغير مُلفته", "اللحن مناسب و هادء", "مناسبة لصوت ناسي عجرم"],
  },
  {
    id: 10,
    title: "حَيَّ عَلَى الجِهَاد",
    type: "وطني",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509733/%D8%AD%D9%8E%D9%8A%D9%91%D9%8E_%D8%B9%D9%8E%D9%84%D9%8E%D9%89_%D8%A7%D9%84%D8%AC%D9%90%D9%87%D9%8E%D8%A7%D8%AF%D9%90_ksmmfm.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776522138/%D8%AD%D9%8A_%D8%B9%D9%84%D9%8A_%D8%A7%D9%84%D8%AC%D9%87%D8%A7%D8%AF_rprtdg.png",
    views: "0 K",
    lyrics: [
      { text: "مِصْرُ يَا هَدَفَ الأَعَادِي .. جَيْشُكِ وَصَلَ الأَعَالِي", red: false },
      { text: "أَنْتِ يَا أَرْضَ السَّلَامِ .. قَدْ غُرِفْتِ بِالأَمَانِي", red: false },
      { text: "\u00A0", red: false },
      { text: "أَنْتِ مَوْطِنِي وَحَيَاتِي .. قَدْ سَكَنْتِ فِي فُؤَادِي", red: false },
      { text: "أَفْدِيكِ بِرُوحِي وَقَلْبِي .. فِي أَيِّ وَقْتٍ لَا أُبَالِي", red: false },
      { text: "\u00A0", red: false },
      { text: "مِصْرُ يَا وَطَنَ العِمَارَة .. أَنْتِ لِلْعِلْمِ مَنَارَة", red: false },
      { text: "تَارِيخُكِ يَهْدِي الحَيَارَى .. مِصْرُ يَا أُمَّ الحَضَارَة", red: false },
      { text: "\u00A0", red: false },
      { text: "أَنْتِ نَسْرٌ فِي السَّمَاءِ .. سَارَ نَهْجُكِ لِلأَمَامِ", red: true },
      { text: "أَنْتِ نَبْعٌ فِي العَطَاءِ .. شَعْبُكِ شَعْبُ الكِرَامِ", red: true },
      { text: "\u00A0", red: false },
      { text: "قَالَ حَيَّ عَلَى الجِهَادِ .. ثَارَ دَمُنَا فِي الوَرِيدِ", red: false },
      { text: "ظَلَّ يَأْتِي بِالعَتَادِ .. حَتَّى عُدْنَا مِنْ جَدِيدِ", red: false },
      { text: "\u00A0", red: false },
      { text: "أَنْتِ مَوْطِنِي وَحَيَاتِي .. قَدْ سَكَنْتِ فِي فُؤَادِي", red: true },
      { text: "أَفْدِيكِ بِرُوحِي وَقَلْبِي .. فِي أَيِّ وَقْتٍ لَا أُبَالِي", red: true },
      { text: "\u00A0", red: false },
      { text: "مِصْرُ كَرَّمَكِ الإِلَهُ .. إِنَّهُ رَبِّي المُعِينْ", red: false },
      { text: "نَدْعُوكَ يَا رَبَّنَا .. يَا إِلَهَ العَالَمِينْ", red: false },
    ],
    critics: ["الكلمات مُميزه", "اللحن حماسي", "مناسبة لصوت علي الحجار", "مناسبة لصوت أصاله نصري"],
  },
  {
    id: 11,
    title: "وحشاني يا مصر",
    type: "وطني",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509732/%D9%88%D8%AD%D8%B4%D8%A7%D9%86%D9%8A_%D9%8A%D8%A7_%D9%85%D8%B5%D8%B1_zs1fuw.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776526375/%D9%88%D8%AD%D8%B4%D8%A7%D9%86%D9%8A_%D9%8A%D8%A7_%D9%85%D8%B5%D8%B1_ovf9vr.png",
    views: "0 K",
    lyrics: [
      { text: "وحشاني يا مصر وحشاني ..... وبقالي سنين عليكي غايب", red: false },
      { text: "بتمني أرجع ليكي تاني .....علشان سايب فيكي حبايب", red: false },
      { text: "\u00A0", red: false },
      { text: "وحشاني الجيزه والقاهره .....  والحُسين و مقام السيده", red: false },
      { text: "وفُسحة النيل بالمركبه ..... الروح عليهم متعوده", red: false },
      { text: "\u00A0", red: false },
      { text: "وحشاني القعده علي القهوه ..... أنا و أصحابي أحسن لمّهّ", red: true },
      { text: "نلعب شطرنج و طاوله ..... وصوت الست يحلّي السهره", red: true },
      { text: "والوقت يعدي و يسرقنا ..... ومفيش ولا  حاجه  تفرقنا", red: true },
      { text: "\u00A0", red: false },
      { text: "وحشاني سفريت سيناء ..... مع حبايبنا و أهالينا", red: true },
      { text: "وفانوس رمضان و الزينه ..... مع لعب الكوره في حوارينا", red: true },
      { text: "\u00A0", red: false },
      { text: "مصر بلادي و مفيش غيرها ..... فتحه أبوابها للي يجيلها", red: false },
      { text: "دا أحنا ياما شربنا من نيلها .....وعشنا سنين حلوه في خيرها", red: false },
      { text: "أحفظها يا رب", red: false },
    ],
    critics: ["الكلمات بسيطة و إجتماعية", "اللحن مُبهج", "مناسبة لصوت حسين الجسمي", "مناسبة لصوت بهاء سلطان"],
  },
  {
    id: 12,
    title: "أيام رمضان",
    type: "مناسبات وأعياد",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509712/%D8%A3%D9%8A%D8%A7%D9%85_%D8%B1%D9%85%D8%B6%D8%A7%D9%86_bfi8na.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776527528/%D8%A3%D9%8A%D8%A7%D9%85_%D8%B1%D9%85%D8%B6%D8%A7%D9%86_xzw22b.png",
    views: "0 K",
    lyrics: [
      { text: "يبدأ رمضان لما نعلق زينه وفنوس", red: false },
      { text: "وفي أخر الليل نتسحر علشان نصوم", red: false },
      { text: "وأول م الفجر يأذن للصلاه بنقوم", red: false },
      { text: "و ببركة رمضان تتصافى كل النفوس", red: false },
      { text: "\u00A0", red: false },
      { text: "أيام رمضان فعلاً بتكون حاجه تانيه", red: true },
      { text: "بهجه وسعاده تسوي كل الدنياه", red: true },
      { text: "وكفايه انك  بتكون وسط الناس الغاليه", red: true },
      { text: "الوقت مينفعش يضيع منه و لا ثانيه", red: true },
      { text: "\u00A0", red: false },
      { text: "من بعد العِشاء والتراويح", red: false },
      { text: "الاطفال تلعب بالصواريخ", red: false },
      { text: "وشباب تتفرج ع الكوره", red: false },
      { text: "و الرجاله بتسمع تواشيح", red: false },
      { text: "\u00A0", red: false },
      { text: "أيام رمضان فعلاً بتكون حاجه تانيه", red: true },
      { text: "بهجه وسعاده تسوي كل الدنياه", red: true },
      { text: "وكفايه انك  بتكون وسط الناس الغاليه", red: true },
      { text: "الوقت مينفعش يضيع منه و لا ثانيه", red: true },
    ],
    critics: ["الكلمات تقليدية", "اللحن مناسب", "مناسبة لصوت حماده هلال"],
  },
  {
    id: 13,
    title: "عطشان غرام",
    type: "صعيدي",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509717/%D8%B9%D8%B7%D8%B4%D8%A7%D9%86_%D8%BA%D8%B1%D8%A7%D9%85_ybv7af.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776529300/%D8%B9%D8%B7%D8%B4%D8%A7%D9%86_%D8%BA%D8%B1%D8%A7%D9%85_cs0dly.png",
    views: "0 K",
    lyrics: [
      { text: "أنا حدّ هاوي ... للحب غاوي", red: false },
      { text: "بتمني اداوي ، كل القلوب", red: false },
      { text: "بالحب أنا  ... داب قلبي تاني", red: false },
      { text: "وأنا قلبي أبيض  ...خالي من الذنوب", red: false },
      { text: "\u00A0", red: false },
      { text: "يا أم القوام  ... كيف النعام", red: true },
      { text: "تخطي الخطي  ...الناس تنام", red: true },
      { text: "طالب الرضي ... بالاحترام", red: true },
      { text: "كَثُرَ النداء  ...زاد الهيام", red: true },
      { text: "\u00A0", red: false },
      { text: "طبعك ضفيف  ... نبع السلام", red: true },
      { text: "قلبك نضيف  ... مثل الكِرام", red: true },
      { text: "غرضي شَريف  ... كاره الحرام", red: true },
      { text: "طلبي طفيف  ...عطشان غرام", red: true },
      { text: "\u00A0", red: false },
      { text: "وعيون يا ناس ... ألماظ وماس", red: false },
      { text: "تلمع في عيني ... و فيها أحتاس", red: false },
      { text: "اه لو تجيني  ... يا اغلي الناس", red: false },
    ],
    critics: ["الكلمات متناسقه", "اللحن مختلف", "مناسبة لصوت محمد منير"],
  },
  {
    id: 14,
    title: "زمن العجائب",
    type: "صعيدي",
    views: "0 K",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509730/1-%D8%B2%D9%85%D9%86_%D8%A7%D9%84%D8%B9%D8%AC%D8%A7%D9%8A%D8%A8_w1o5w8.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776530659/%D8%B2%D9%85%D9%86_%D8%A7%D9%84%D8%B9%D8%AC%D8%A7%D8%A6%D8%A8_qqvpkl.jpg",
    lyrics: [
      { text: "آه يا زمن العجايب", red: false },
      { text: "أني فيك حبيبي سبوني", red: false },
      { text: "دول حبو عني الخيانه", red: false },
      { text: "وجُم عليّا باعوني", red: false },
      { text: "\u00A0", red: false },
      { text: "يا أهل السلام والغرام", red: true },
      { text: "ظلم الاحباب حرام", red: true },
      { text: "دا الفرح جاني ومدام", red: true },
      { text: "ولا رمشي غفّل ونام", red: true },
      { text: "\u00A0", red: false },
      { text: "دا جلوبنا كانو سُلام", red: true },
      { text: "ليه خلّتيهم حُطام", red: true },
      { text: "لا يعيبني شئ ف الكلام", red: true },
      { text: "و لا أني ناجصان علام", red: true },
      { text: "\u00A0", red: false },
      { text: "حيرني جلّبو وعماني", red: false },
      { text: "من يوم ما طيفه نداني", red: false },
      { text: "خلاص في وصف حبيبي", red: false },
      { text: "عجزة يا ناس المعاني", red: false },
    ],
    critics: ["الكلمات مُعبره", "اللحن غير مناسب", "مناسبة لصوت علي الحجار"],
  },
  {
    id: 15,
    title: "زارِعَ الخَيرِ",
    type: "إسلامي",
    views: "0 K",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509722/%D8%B2%D8%A7%D8%B1%D8%B9_%D8%A7%D9%84%D8%AE%D9%8A%D8%B1_wgt66w.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776533422/%D8%B2%D8%A7%D8%B1%D8%B9_%D8%A7%D9%84%D8%AE%D9%8A%D8%B1_qypvad.png",
    lyrics: [
      { text: "هَيَاعاصٍ هَيَاا مكروب ... يا مَن يَسِحُّ ذنوب", red: false },
      { text: "مَتَى لِلَّهِ أنتَ تَتوب ... وتُفرِحَ بِكَ كُلَّ القلوب.", red: false },
      { text: "\u00A0", red: false },
      { text: "تُزيلُ الغَمَّ عن قلبي ... فتغفِرْ لي يا ربِّي", red: false },
      { text: "وتَشرحْ لي صَدري ... وتُدخلني جَنَّةَ الخُلدِ.", red: false },
      { text: "\u00A0", red: false },
      { text: "إنَّ زارِعَ الشَّرِّ سيَحصُدْ شَرَّهُ سَقمًا", red: true },
      { text: "وإنَّ زارِعَ الخَيرِ سيُجزَى بخيرِهِ نَفعًا", red: true },
      { text: "فكنْ للخيرِ سَبَّاقًا، تَجِدِ اللهَ لَكَ عَونًا", red: true },
      { text: "وعِشْ ما شِئتَ، فالدنيا لَنْ يَبقَى فيها أحَدًا.", red: true },
      { text: "\u00A0", red: false },
      { text: "ما لي سِواكَ أدعوه ... وأنتَ الواحِدُ الأَحَدُ،", red: false },
      { text: "أعِنِّي على نفسي ... يا ربَّنا يا فَردُ يا صَمَدُ.", red: false },
    ],
    critics: ["الكلمات مُأثرة", "اللحن مُلائم", "مناسبة لصوت الشيخ مشاري راشد العفاسي"],
  },
  {
    id: 16,
    title: "الكون إحتفي",
    type: "إسلامي",
    views: "0 K",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509712/%D8%A7%D9%84%D9%83%D9%88%D9%86_%D8%A5%D8%AD%D8%AA%D9%81%D9%8A_1_fm1xwc.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509730/%D8%A7%D9%84%D9%83%D9%88%D9%86%D9%8F_%D8%A7%D8%AD%D8%AA%D9%81%D9%892_npglvq.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776534249/%D8%A7%D9%84%D9%83%D9%88%D9%86_%D8%A5%D8%AD%D8%AA%D9%81%D9%8A_yttpww.png",
    lyrics: [
      { text: "سَلامًا عليكَ يا طهَ وأحمدْ", red: false },
      { text: "يا مُصطفى، يا مُحمّدْ.", red: false },
      { text: "يا من لم يُخلِفْ وعدًا", red: false },
      { text: "نُحبُّكَ واللهُ يَشهَدْ.", red: false },
      { text: "\u00A0", red: false },
      { text: "الصلاةُ والسَّلامُ عليكَ يا رسولَ اللهِ.", red: true },
      { text: "\u00A0", red: false },
      { text: "صلُّوا عليهِ وسَلِّموا، يا رسولَ اللهْ،", red: true },
      { text: "وكبِّروا فاكبُروا، اللهُ اللهْ.", red: true },
      { text: "\u00A0", red: false },
      { text: "صلُّوا على المُصطفى", red: false },
      { text: "رمزِ المحبَّةِ والوفا", red: false },
      { text: "خُلُقُهُ ربِّي مُشرَّفٌ", red: false },
      { text: "وبخُلُقِهِ الكونُ إحتفى.", red: false },
      { text: "\u00A0", red: false },
      { text: "سَلامًا على الصادقِ الأمينِ", red: false },
      { text: "خاتمِ الأنبياءِ والمُرسَلينِ", red: false },
      { text: "بُعِثتَ رحمةً للعالمينِ", red: false },
    ],
    critics: ["الكلمات عميقة", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل"],
  },
  {
    id: 17,
    title: "ألهتني نفسي",
    type: "إسلامي",
    views: "0 K",
    audioUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509739/%D8%A3%D9%8E%D9%84%D9%92%D9%87%D9%8E%D8%AA%D9%92%D9%86%D9%8A_%D9%86%D9%8E%D9%81%D8%B3%D9%8A_qlikwi.mp3"],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776535539/%D8%A3%D9%84%D9%87%D8%AA%D9%86%D9%8A_%D9%86%D9%81%D8%B3%D9%8A_uqkgyi.png",
    lyrics: [
      { text: "يا رَبِّ إنْ كانَ هذا قَضاؤُكَ فلا أُبالي", red: false },
      { text: "هُوَ عَبدُكَ ، مِن صُنعِكَ يا إِلَهي .", red: false },
      { text: "وما في مُعصَمِ يَدي سِوى دُعائي", red: false },
      { text: "فَارحَمهُ يا رَحمنُ، واستَمِعْ لِندائي .", red: false },
      { text: "\u00A0", red: false },
      { text: "يا رَبِّ ألْهِمْني صَبرًا", red: true },
      { text: "قَبلَ أنْ تَجِفَّ دُموعي.", red: true },
      { text: "وأعِنِّي على ألَّا أَعصِيَ لكَ أمرًا", red: true },
      { text: "وعلى الإطالةِ في خُشوعي.", red: true },
      { text: "\u00A0", red: false },
      { text: "وألَّا يَمُرَّ قَطُّ يَومٌ", red: true },
      { text: "إلّا وأدعوكَ في سُجودي ورُكوعي.", red: true },
      { text: "\u00A0", red: false },
      { text: "أَلْهَتْني نَفسي وأنا عَبدُكَ الذَّليلُ", red: false },
      { text: "ومَن سِواكَ يا إِلَهي قلبي إليهِ يَميلُ.", red: false },
      { text: "وكيفَ لي أنْ أَنسى ذِكرَكَ وهوَ السَّبيلُ", red: false },
      { text: "وكيفَ لي أنْ أُنكِرَ عَطفَكَ وهوَ الدَّليلُ.", red: false },
    ],
    critics: ["الكلمات بسيطه", "اللحن مناسب"],
  },
  {
    id: 18,
    title: "مُبتغي الاُممي",
    type: "إسلامي",
    views: "0 K",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509713/%D9%85%D9%8F%D8%A8%D9%92%D8%AA%D9%8E%D8%BA%D9%8E%D9%89_%D8%A7%D9%84%D9%92%D8%A3%D9%8F%D9%85%D9%8E%D9%85%D9%90%D9%8A_1_gw4yoj.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1776509731/%D9%85%D9%8F%D8%A8%D9%92%D8%AA%D9%8E%D8%BA%D9%8E%D9%89_%D8%A7%D9%84%D9%92%D8%A3%D9%8F%D9%85%D9%8E%D9%85%D9%90%D9%8A_2_y9ptqo.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1776536820/%D9%85%D8%A8%D8%AA%D8%BA%D9%8A_%D8%A7%D9%84%D8%A7%D9%85%D9%85%D9%8A_izisos.png",
    lyrics: [
      { text: "يَا رَبِّي إِنَّ صَدْرِي يَضِيقُ مِنَ الْكَرْبِ وَالْهَمِّ", red: false },
      { text: "فَأَزِلْ هُمُومِي بِقُدْرَتِكَ وَاشْرَحْ لِي صَدْرِي", red: false },
      { text: "وَهَبْ لِي مِنْ لَدُنْكَ عِلْمًا فَإِنَّ الْعِلْمَ مُبْتَغَى الْأُمَمِي", red: false },
      { text: "\u00A0", red: false },
      { text: "أَنْتَ السَّلَامُ وَأَنْتَ الرَّحِيمُ", red: true },
      { text: "أَنْتَ الْمُجِيبُ وَأَنْتَ الْكَرِيمُ", red: true },
      { text: "\u00A0", red: false },
      { text: "فَأَجِبْ دُعَائِي فَإِنَّنِي أَدْعُوكَ مِنْ كُلِّ قَلْبِي", red: true },
      { text: "إِنِّي أَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِي", red: true },
      { text: "فَامْنُنْ عَلَيَّ بِفَضْلِكَ يَا رَبِّي", red: true },
      { text: "\u00A0", red: false },
      { text: "اللَّه اللَّه .. رَبِّي اللَّه، لَا شَرِيكَ لَهُ", red: false },
      { text: "اللَّه اللَّه .. رَبِّي اللَّه، نَرْجُو عَفْوَهُ", red: false },
    ],
    critics: ["الكلمات عادية", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل"],
  },
  {
    id: 19,
    title: "جمالك ماركة",
    type: "بوب",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1777006774/Gamalek_marka_1_jo00uq.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1777006816/Gamalek_marka_2_wp5gfs.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777007669/%D8%AC%D9%85%D8%A7%D9%84%D9%83_%D9%85%D8%A7%D8%B1%D9%83%D9%87_gj7ej1.png",
    views: "0 K",
    credits: "كلمات والحان : محمد رمزي",
    lyrics: [
      { text: "كلهم حلوين وانتي", red: false },
      { text: "طبعا الاحلى", red: false },
      { text: "\u00A0", red: false },
      { text: "الجمال علامات وانتي", red: false },
      { text: "جمالك ماركة", red: false },
      { text: "\u00A0", red: false },
      { text: "عليكي بسمة", red: true },
      { text: "تفرح القلب الحزين", red: true },
      { text: "\u00A0", red: false },
      { text: "يا احلى رسمة", red: true },
      { text: "احتاروا فيها الرسامين", red: true },
      { text: "\u00A0", red: false },
      { text: "يا ارق نسمة", red: true },
      { text: "مرت عليا من سنين", red: true },
      { text: "\u00A0", red: false },
      { text: "مهما اغيب عليكي برضه", red: false },
      { text: "عمري ما انساكي", red: false },
      { text: "\u00A0", red: false },
      { text: "ناس كتير في حياتي وانتي", red: false },
      { text: "اللي باقية لي", red: false },
      { text: "\u00A0", red: false },
      { text: "عليكي بسمة", red: true },
      { text: "تفرح القلب الحزين", red: true },
      { text: "\u00A0", red: false },
      { text: "يا احلى رسمة", red: true },
      { text: "احتاروا فيها الرسامين", red: true },
    ],
    critics: ["كلمات جذابة وسهلة الحفظ", "اللحن مناسب", "مناسبة لصوت شبابي"],
  },
  {
    id: 20,
    title: "نفد صبري",
    type: "بوب",
    audioUrls: [
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1777010342/Nafad_sabry_1_ywtllp.mp3",
      "https://res.cloudinary.com/dq3orhpdj/video/upload/v1777010371/Nafad_sabry_vnklxf.mp3",
    ],
    coverImg: "https://res.cloudinary.com/dq3orhpdj/image/upload/v1777010071/%D9%86%D9%81%D8%AF_%D8%B5%D8%A8%D8%B1%D9%8A_q2tahj.png",
    views: "0 K",
    credits: "كلمات والحان : محمد رمزي",
    lyrics: [
      { text: "هذه الكلمات باللهجة السعوديه", red: true },
      { text: "\u00A0", red: false },
      { text: "يا عالم رسوني قتلتني الحيرة", red: false },
      { text: "اللي ما ابي غيره هو يبي غيري", red: false },
      { text: "دموعي ما فارجوني لا يوم ولا ليلة", red: false },
      { text: "صراحة نفد صبري واشكي انا لليلي", red: false },
      { text: "\u00A0", red: false },
      { text: "عسى الله يلين جلبه علي ويهواني", red: true },
      { text: "ترى صعبة هالوحدة وشوجي عياني", red: true },
      { text: "ما في غيره اخذ عقلي وسكن وجداني", red: true },
      { text: "تدرون نبض جلبي يزيد لو بس ناداني", red: true },
      { text: "\u00A0", red: false },
      { text: "اذا كان بيدي ان اختار اقداري", red: false },
      { text: "ما راح اختار سواك جدري ومكتوبي", red: false },
      { text: "اتمنى لو بس عيونك الحلوة يزورني", red: false },
    ],
    critics: ["اللهجة السعودية واضحة وسلسة", "اللحن - 1 -أفضل", "اللحن - 2 -أفضل", "التجربه بوجه عام ممتازه", "مناسبة لصوت رجالي دافئ"],
  },
];

// ─── المكوّن الرئيسي ──────────────────────────────────────────────────────────
const SongsPage = () => {
  const { lang } = useLang();
  const [starRatings, setStarRatings] = useState<Record<number, number>>({});
  const [hoverStar, setHoverStar] = useState<Record<number, number>>({});
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [audioTimes, setAudioTimes] = useState<Record<string, { current: number; duration: number }>>({});
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const presentCategoryKeys = useMemo(() => {
    const keys = new Set<string>();
    allSongs.forEach((s) => {
      const match = SONG_CATEGORIES.find((c) => c.key !== 'all' && c.match(s.type || ''));
      if (match) keys.add(match.key);
    });
    return keys;
  }, []);

  const visibleCategories = useMemo(
    () => SONG_CATEGORIES.filter((c) => c.key === 'all' || presentCategoryKeys.has(c.key)),
    [presentCategoryKeys]
  );

  const filteredSongs = useMemo(() => {
    const q = normalizeArabic(search);
    const cat = SONG_CATEGORIES.find((c) => c.key === activeCat) || SONG_CATEGORIES[0];
    return allSongs
      .filter((s) => {
        if (!cat.match(s.type || '')) return false;
        if (!q) return true;
        const hay = [s.title, s.type, ...(s.lyrics?.map((l) => l.text) || [])].join(' ');
        return normalizeArabic(hay).includes(q);
      })
      .slice()
      .sort((a, b) => getCategoryOrder(a.type) - getCategoryOrder(b.type));
  }, [search, activeCat]);

  const normalizeAudioUrls = (urls: string[] | string | undefined): string[] => {
    if (Array.isArray(urls)) return urls.filter((u) => typeof u === 'string' && u.trim() !== '');
    if (typeof urls === 'string' && urls.trim() !== '') return [urls];
    return [];
  };

  const formatTime = (t: number): string => {
    if (!Number.isFinite(t) || t < 0) return '00:00';
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
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
      setSelectedCritics((prev) => ({ ...prev, [key]: Math.floor(Math.random() * 31) + 65 }));
    }
  };

  const getCategoryLabel = (type: string) => {
    const matched = SONG_CATEGORIES.find((c) => c.key !== 'all' && c.match(type || ''));
    if (matched) return lang === 'ar' ? matched.ar : matched.en;
    return type || (lang === 'ar' ? 'عام' : 'General');
  };

  return (
    <div dir="rtl" className="page-wrapper">
      <FloatingNotes />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');

        :root { --leather-black: #0a0205; }

        .page-wrapper {
          position: relative;
          background: radial-gradient(ellipse at 50% 50%, #3d0a12 0%, #1a0509 40%, #0a0205 100%);
          min-height: 100vh; padding: 40px 20px;
          color: white; font-family: 'Almarai', sans-serif;
        }

        .floating-notes-layer { position: fixed; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .floating-note {
          position: absolute; user-select: none;
          color: rgba(201, 168, 76, 0.32);
          font-family: 'Aref Ruqaa Ink', serif;
          animation-name: floatNote; animation-timing-function: linear; animation-iteration-count: infinite;
        }
        @keyframes floatNote {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 0.72; }
          85%  { opacity: 0.56; }
          100% { transform: translateY(-125vh) rotate(22deg); opacity: 0; }
        }

        .content-layer { position: relative; z-index: 1; }

        .main-card {
          position: relative;
          max-width: 1100px; margin: 0 auto 60px;
          border: 2px solid #c9a84c; border-radius: 40px;
          display: flex; flex-direction: row-reverse; overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.8);
          background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, var(--leather-black) 100%);
        }

        .card-floating-notes { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .card-floating-note {
          position: absolute; user-select: none;
          color: rgba(201, 168, 76, 0.18);
          font-family: 'Aref Ruqaa Ink', serif;
          animation-name: floatNoteCard; animation-timing-function: linear; animation-iteration-count: infinite;
        }
        @keyframes floatNoteCard {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          12%  { opacity: 0.5; }
          82%  { opacity: 0.36; }
          100% { transform: translateY(-900px) rotate(16deg); opacity: 0; }
        }

        .player-side {
          position: relative; z-index: 1;
          flex: 1; padding: 30px;
          background: rgba(0,0,0,0.35);
          display: flex; flex-direction: column; align-items: center;
        }
        .song-tag {
          background: #c9a84c; color: #000;
          padding: 4px 20px; border-radius: 20px;
          font-size: 14px; font-weight: bold; margin-bottom: 15px;
        }
        .cover-box {
          width: 100%; aspect-ratio: 1;
          background-size: cover; background-position: center;
          border-radius: 20px; border: 1px solid rgba(201,168,76,0.3);
        }

        .views-stars-row {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; margin-top: 15px; gap: 10px;
        }
        .views-badge {
          background-color: #f0fdf4; color: #1a2e44;
          padding: 8px 20px; border-radius: 50px;
          font-weight: bold; font-size: 1.2rem;
          cursor: pointer; transition: all 0.3s ease;
          border: none; flex-shrink: 0;
        }
        .views-badge:hover { background-color: #c9a84c; color: #000; transform: scale(1.05); }

        .star-rating { display: flex; gap: 4px; }
        .star {
          font-size: 24px; cursor: pointer;
          color: rgba(201,168,76,0.25);
          transition: color 0.2s, text-shadow 0.2s; user-select: none;
        }
        .star.active { color: #c9a84c; text-shadow: 0 0 8px rgba(201,168,76,0.7); }

        .custom-player-wrapper {
          width: 100%; background: rgba(74,29,77,0.7); border-radius: 50px;
          padding: 8px 15px; display: flex; align-items: center; gap: 12px; margin-top: 12px;
        }
        .play-btn {
          background: #c9a84c; border: none; width: 35px; height: 35px;
          border-radius: 50%; cursor: pointer; color: #040828;
          display: flex; align-items: center; justify-content: center;
        }
        .player-time { min-width: 92px; font-size: 0.85rem; color: #f3d98a; text-align: center; letter-spacing: 0.5px; }
        .wave-container { display: flex; align-items: center; gap: 3px; height: 24px; flex: 1; }
        .wave-bar { width: 3px; height: 8px; background: rgba(201,168,76,0.35); border-radius: 2px; }
        .wave-bar.active { background: #c9a84c; animation: wave-anim 1s infinite; }
        .audio-index-badge {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid #c9a84c; background: rgba(4,8,40,0.95);
          color: #f3d98a; font-size: 0.9rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        @keyframes wave-anim { 0%, 100% { height: 8px; } 50% { height: 24px; } }

        .lyrics-side {
          position: relative; z-index: 1;
          flex: 1.3; padding: 40px;
          background: rgba(4, 4, 20, 0.82);
          border-left: 1px solid rgba(201,168,76,0.2);
        }
        .label-gold { color: #c9a84c; font-size: 13px; margin-bottom: 10px; display: block; }
        .title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .song-title-red { color: #ff4d4d; font-family: 'Aref Ruqaa Ink', serif; font-size: 2.8rem; margin-bottom: 0; }
        .duet-badge { border: 1px solid #c9a84c; color: #c9a84c; border-radius: 8px; padding: 4px 12px; font-size: 0.95rem; font-weight: 700; }

        .lyrics-scroll { height: 250px; overflow-y: auto; margin-bottom: 30px; }
        .lyrics-scroll::-webkit-scrollbar { width: 6px; }
        .lyrics-scroll::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }

        .line { font-size: 1.2rem; color: #e8d5b0; margin-bottom: 10px; border-right: 3px solid #c9a84c; padding-right: 15px; }
        .line.red { color: #ff4d4d; border-right-color: #ff4d4d; font-weight: bold; }

        .critic-item {
          background: rgba(0,0,0,0.35); padding: 12px; border-radius: 12px;
          margin-bottom: 8px; cursor: pointer; display: flex; justify-content: space-between;
          border: 1px solid rgba(201,168,76,0.15); color: #e8d5b0;
          transition: background 0.2s;
        }
        .critic-item:hover { background: rgba(0,0,0,0.55); }

        /* ─── بلوك التوضيح ─── */
        .clarification-block {
          max-width: 760px;
          margin: 0 auto 28px;
          border-radius: 14px;
          padding: 24px 28px;
          border: 1px solid rgba(201,168,76,0.25);
          background: linear-gradient(135deg, hsl(340 25% 6%), hsl(340 20% 8%));
          background-image: repeating-linear-gradient(
            transparent, transparent 28px,
            rgba(201,168,76,0.06) 28px, rgba(201,168,76,0.06) 29px
          );
          position: relative;
          overflow: hidden;
        }
        .clarification-block .note-top {
          position: absolute; top: 10px; right: 16px;
          color: rgba(201,168,76,0.2); font-size: 28px;
          font-family: 'Aref Ruqaa Ink', serif; pointer-events: none;
        }
        .clarification-block .note-bottom {
          position: absolute; bottom: 10px; left: 16px;
          color: rgba(201,168,76,0.2); font-size: 22px;
          font-family: 'Aref Ruqaa Ink', serif; pointer-events: none;
        }
        .clarification-title {
          color: #c9a84c;
          font-family: 'Aref Ruqaa Ink', serif;
          font-size: 1.15rem;
          font-weight: bold;
          text-align: center;
          margin: 0 0 14px;
        }
        .clarification-text {
          color: rgba(232, 213, 176, 0.78);
          line-height: 1.85;
          text-align: center;
          font-family: 'Almarai', sans-serif;
          font-size: 0.95rem;
          margin: 0;
        }

        /* ─── أزرار الفلتر ─── */
        .filter-chip {
          background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3);
          color: #c9a84c; padding: 6px 18px; border-radius: 20px;
          cursor: pointer; font-family: 'Almarai', sans-serif; font-size: 13px;
          transition: all 0.2s;
        }
        .filter-chip:hover { background: rgba(201,168,76,0.2); }
        .filter-chip.active { background: #c9a84c; color: #000; border-color: #c9a84c; font-weight: bold; }

        @media (max-width: 900px) {
          .main-card { flex-direction: column; }
          .lyrics-side { border-left: none; border-top: 1px solid rgba(201,168,76,0.2); }
          .clarification-block { margin: 0 0 24px; }
        }
      `}</style>

      <div className="content-layer">
        {/* ─── سرش + توضيح + فلتر ─── */}
        <div style={{ maxWidth: 1100, margin: '0 auto 30px' }}>

          {/* السرش بار */}
          <SearchBar value={search} onChange={setSearch} placeholder="ابحث عن أغنية..." className="mb-5" />

          {/* ─── بلوك التوضيح المهم ─── */}
          

          {/* أزرار الفلتر */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {visibleCategories.map((c) => (
              <button key={c.key} type="button"
                className={`filter-chip ${activeCat === c.key ? 'active' : ''}`}
                onClick={() => setActiveCat(c.key)}>
                {lang === 'ar' ? c.ar : c.en}
              </button>
            ))}
          </div>

           <div style={{ maxWidth: 750, margin: '0 auto 40px', position: 'relative', zIndex: 2 }}>
                <div
                  style={{
                    background: 'linear-gradient(135deg, hsl(340 25% 6%), hsl(340 20% 8%))',
                    backgroundImage: `repeating-linear-gradient(transparent, transparent 28px, rgba(201,168,76,0.06) 28px, rgba(201,168,76,0.06) 29px)`,
                    borderRadius: 16,
                    border: '1px solid rgba(201,168,76,0.2)',
                    padding: '24px 32px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ position: 'absolute', top: 12, right: 16, color: 'rgba(201,168,76,0.2)', fontSize: 30 }}>♪</div>
                  <div style={{ position: 'absolute', bottom: 12, left: 16, color: 'rgba(201,168,76,0.2)', fontSize: 24 }}>♫</div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#c9a84c', marginBottom: 16, textAlign: 'center' }}>
                    توضيح مهم
                  </h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, textAlign: 'center', fontFamily: 'Almarai, sans-serif', margin: 0 }}>
                    لقد استخدمت أدوات الذكاء الاصطناعي لمساعدتي في ربط أقرب شكل موسيقي بالأفكار والألحان التي ابتكرتها. لذلك ستجد في بعض الأغاني أن هناك أجزاء من الكلمات لا تُنطق بشكل صحيح تمامًا. أما الفيديوهات فهي جهدي لمساعدتك على فهم معنى الكلمات.
                  </p>
                </div>
           </div>
          
          <div style={{ textAlign: 'center', marginTop: 12, color: '#c9a84c', fontSize: 13 }}>
            {filteredSongs.length} / {allSongs.length}
          </div>
        </div>

        {/* ─── الكاردات ─── */}
        {filteredSongs.map((song) => (
          <div key={song.id} className="main-card">
            <CardFloatingNotes seed={song.id} />

            {/* جانب المشغّل */}
            <div className="player-side">
              <div className="song-tag">{getCategoryLabel(song.type)}</div>
              <div className="cover-box" style={{ backgroundImage: `url(${toDriveDirectDownloadUrl(song.coverImg)})` }} />

              <div className="views-stars-row">
                <button className="views-badge">{song.views}</button>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((num) => (
                    <span key={num}
                      className={`star ${num <= (hoverStar[song.id] ?? starRatings[song.id] ?? 0) ? 'active' : ''}`}
                      onClick={() => setStarRatings((prev) => ({ ...prev, [song.id]: num }))}
                      onMouseEnter={() => setHoverStar((prev) => ({ ...prev, [song.id]: num }))}
                      onMouseLeave={() => setHoverStar((prev) => { const n = { ...prev }; delete n[song.id]; return n; })}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

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
                        setAudioTimes((prev) => ({ ...prev, [key]: { current: prev[key]?.current || 0, duration } }));
                      }}
                      onTimeUpdate={(e) => {
                        const current = e.currentTarget.currentTime || 0;
                        const duration = e.currentTarget.duration || 0;
                        setAudioTimes((prev) => ({ ...prev, [key]: { current, duration } }));
                      }}
                      onEnded={() => setPlayingKey(null)}
                    />
                  </div>
                );
              })}
            </div>

            {/* جانب الكلمات */}
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
              {(song as any).critics?.length > 0 && (
                <span className="label-gold">الآراء النقدية (اضغط للتقييم)</span>
              )}
              {((song as any).critics ?? []).map((critic: string, idx: number) => (
                <div key={idx} className="critic-item" onClick={() => handleCriticClick(song.id, idx)}>
                  <span style={{ fontSize: '14px' }}>{critic}</span>
                  {selectedCritics[`${song.id}-${idx}`] && (
                    <span style={{ color: '#c9a84c', fontWeight: 'bold' }}>{selectedCritics[`${song.id}-${idx}`]}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SongsPage;
