import { useState, useRef, useMemo } from 'react';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';
import { useTheme } from '@/contexts/ThemeContext';
import SearchBar from '@/components/SearchBar';
import { toDriveDirectDownloadUrl } from '@/lib/googleDrive';

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
  const { lang, t } = useLang();
  const { isDark } = useTheme();

  const [starRatings, setStarRatings] = useState<Record<number, number>>({});
  const [hoverStar, setHoverStar] = useState<Record<number, number>>({});
  const [comments, setComments] = useState<Record<number, { id: number; text: string }[]>>({});
  const [newCommentText, setNewCommentText] = useState<Record<number, string>>({});
  const [activeInputSongId, setActiveInputSongId] = useState<number | null>(null);
  const commentsEndRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const [audioTimes, setAudioTimes] = useState<Record<string, { current: number; duration: number }>>({});
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const [volume, setVolume] = useState(0.8);
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

  const handleAddComment = (songId: number) => {
    setActiveInputSongId(songId);
  };

  const handleCancelComment = (songId: number) => {
    setActiveInputSongId(null);
    setNewCommentText(prev => ({ ...prev, [songId]: '' }));
  };

  const handleSubmitComment = (songId: number) => {
    const txt = newCommentText[songId]?.trim();
    if (!txt) {
      setActiveInputSongId(null);
      return;
    }
    const newComment = { id: Date.now(), text: txt };
    setComments(prev => ({
      ...prev,
      [songId]: [...(prev[songId] || []), newComment]
    }));
    setNewCommentText(prev => ({ ...prev, [songId]: '' }));
    setActiveInputSongId(null);
    
    setTimeout(() => {
      const el = commentsEndRefs.current[songId];
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  const handleEmojiClick = (songId: number, emoji: string) => {
    setNewCommentText(prev => ({
      ...prev,
      [songId]: (prev[songId] || '') + emoji
    }));
  };

  const saveRating = (songId: number, val: number) => {
    setStarRatings(prev => ({ ...prev, [songId]: val }));
  };

  return (
    <div dir={lang === 'ar' ? 'rtl' : 'ltr'} className="page-wrapper content-layer">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');
        
        :root { --leather-black: #0a0205; }
        .page-wrapper { min-height: 100vh; padding: 40px 20px; font-family: 'Outfit', 'Almarai', sans-serif; position: relative; overflow: hidden; }
        .main-card { max-width: 1100px; margin: 0 auto 60px; background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, var(--leather-black) 100%); border: 1px solid rgba(201, 168, 76, 0.4); border-radius: 40px; display: flex; flex-direction: ${lang === 'ar' ? 'row-reverse' : 'row'}; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.8); position: relative; }
        
        /* Unified Header Box */
        .unified-header-box {
          background: #000000;
          border: 1px solid rgba(201, 168, 76, 0.35);
          border-radius: 20px;
          padding: 30px 40px;
          max-width: 800px;
          margin: 40px auto 30px;
          text-align: center;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.8), inset 0 0 20px rgba(201, 168, 76, 0.08);
          position: relative;
          z-index: 10;
        }
        .unified-header-title {
          font-family: 'Aref Ruqaa Ink', serif;
          font-size: 3rem;
          color: #c9a84c;
          margin-bottom: 10px;
        }
        .unified-header-subtitle {
          font-family: 'Almarai', sans-serif;
          color: #ffffff;
          font-size: 1.1rem;
          opacity: 0.9;
        }

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

        .custom-player-wrapper { width: 100%; background: rgba(20,5,8,0.75); border: 1px solid rgba(201,168,76,0.35); border-radius: 20px; padding: 12px 16px; display: flex; flex-direction: column; gap: 10px; margin-top: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.4); }
        .player-row-top { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 10px; }
        .player-controls-left { display: flex; align-items: center; gap: 12px; }
        .player-controls-right { display: flex; align-items: center; gap: 15px; }
        .play-btn { background: #c9a84c; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; color: #040828; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: transform 0.2s, background-color 0.2s; }
        .play-btn:hover { transform: scale(1.1); background: #d4b563; }
        .player-time { font-size: 0.85rem; color: #f3d98a; font-family: monospace; min-width: 80px; text-align: left; }
        .seeker-container { display: flex; align-items: center; width: 100%; }
        .audio-seeker-slider { flex: 1; -webkit-appearance: none; appearance: none; height: 6px; border-radius: 3px; background: rgba(201,168,76,0.2); outline: none; cursor: pointer; }
        .audio-seeker-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #c0272d; border: 2px solid #c9a84c; cursor: pointer; }
        .volume-container { display: flex; align-items: center; gap: 6px; }
        .volume-icon { color: #c9a84c; font-size: 16px; cursor: pointer; user-select: none; transition: transform 0.2s; }
        .volume-icon:hover { transform: scale(1.15); }
        .volume-slider { width: 60px; -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; background: rgba(201,168,76,0.25); outline: none; cursor: pointer; }
        .volume-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 10px; height: 10px; border-radius: 50%; background: #c9a84c; cursor: pointer; }
        .wave-container { display: flex; align-items: center; gap: 3px; height: 20px; }
        .wave-bar { width: 3px; height: 6px; background: rgba(201,168,76,0.25); border-radius: 2px; }
        .wave-bar.active { background: #c9a84c; animation: wave-anim 1s infinite; }
        .audio-index-badge { width: 28px; height: 28px; border-radius: 50%; border: 1px solid #c9a84c; background: rgba(4,8,40,0.95); color: #f3d98a; font-size: 0.85rem; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin: 0 10px; }
        @keyframes wave-anim { 0%, 100% { height: 6px; } 50% { height: 20px; } }

        .star-rating { display: flex; justify-content: center; gap: 4px; margin: 10px 0; }
        .star { font-size: 24px; cursor: pointer; color: rgba(201,168,76,0.25); transition: color 0.2s, text-shadow 0.2s; user-select: none; }
        .star.active { color: #c9a84c; text-shadow: 0 0 8px rgba(201,168,76,0.7); }

        .lyrics-side { flex: 1.3; padding: 40px; background: rgba(20, 5, 8, 0.82); border-left: 1px solid rgba(201,168,76,0.2); position: relative; z-index: 1; }
        .label-gold { color: #c9a84c; font-size: 13px; margin-bottom: 10px; display: block; }
        .title-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 20px; }
        .song-title-red { color: #ff4d4d; font-family: 'Aref Ruqaa Ink', serif; font-size: 2.8rem; margin-bottom: 0; }
        .duet-badge { border: 1px solid #c9a84c; color: #c9a84c; border-radius: 8px; padding: 4px 12px; font-size: 0.95rem; font-weight: 700; }
        .lyrics-scroll { height: 250px; overflow-y: auto; margin-bottom: 30px; }
        .lyrics-scroll::-webkit-scrollbar { width: 6px; }
        .lyrics-scroll::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }
        .line { font-size: 1.2rem; color: #e8d5b0; margin-bottom: 10px; border-right: 3px solid #c9a84c; padding-right: 15px; }
        .line.red { color: #ff4d4d; border-right-color: #ff4d4d; font-weight: bold; }

        .clarification-block {
          max-width: 800px;
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
        .clarification-note-top {
          position: absolute; top: 10px; right: 16px;
          color: rgba(201,168,76,0.2); font-size: 28px;
          font-family: 'Aref Ruqaa Ink', serif; pointer-events: none;
        }
        .clarification-note-bottom {
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

        .filter-chip { background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); color: #c9a84c; padding: 6px 18px; border-radius: 20px; cursor: pointer; font-family: 'Almarai', sans-serif; font-size: 13px; transition: all 0.2s; }
        .filter-chip:hover { background: rgba(201,168,76,0.2); }
        .filter-chip.active { background: #c9a84c; color: #000; border-color: #c9a84c; font-weight: bold; }
      `}</style>

      {/* Unified Black Header Box */}
      <div className="unified-header-box animate-fade-in-up">
        <h1 className="unified-header-title">
          {lang === 'ar' ? '\u0627\u0644\u0623\u0644\u062d\u0627\u0646' : 'MELODIES'}
        </h1>
        <p className="unified-header-subtitle">
          {lang === 'ar' ? '\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0623\u0644\u062d\u0627\u0646 \u0623\u063a\u0627\u0646\u064a \u0645\u0646 \u0643\u062a\u0627\u0628\u0627\u062a\u064a \u0644\u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u0643\u0644\u0645\u0627\u062a.' : 'This page contains melodies for my songs to convey the general mood of the lyrics.'}
        </p>
      </div>

      {/* Clarification Block — styled like SongsPage */}
      <div className="clarification-block">
        <span className="clarification-note-top">&#9834;</span>
        <span className="clarification-note-bottom">&#9835;</span>
        <h3 className="clarification-title">
          {lang === 'ar' ? '\u062a\u0648\u0636\u064a\u062d \u0647\u0627\u0645' : 'Important Clarification'}
        </h3>
        <p className="clarification-text">
          {lang === 'ar'
            ? '\u0647\u0630\u0647 \u0627\u0644\u0635\u0641\u062d\u0629 \u062a\u062d\u062a\u0648\u064a \u0639\u0644\u0649 \u0623\u063a\u0627\u0646\u064a \u0645\u0646 \u0643\u062a\u0627\u0628\u0627\u062a\u064a \u0648\u0644\u0643\u0646 \u0645\u0639 \u0627\u0644\u0644\u062d\u0646 \u0627\u0644\u062e\u0627\u0635 \u0628\u0643\u0644 \u0623\u063a\u0646\u064a\u0629. \u0628\u063a\u0636 \u0627\u0644\u0646\u0638\u0631 \u0639\u0646 \u0627\u0644\u0634\u062e\u0635 \u0627\u0644\u0630\u064a \u0642\u0627\u0645 \u0628\u063a\u0646\u0627\u0621 \u0647\u0630\u0647 \u0627\u0644\u0623\u0644\u062d\u0627\u0646\u060c \u0641\u0625\u0646 \u0627\u0644\u0647\u062f\u0641 \u0647\u0648 \u062a\u0648\u0635\u064a\u0644 \u0627\u0644\u0644\u062d\u0646 \u0644\u0643\u0645 \u0648\u0645\u0633\u0627\u0639\u062f\u062a\u0643\u0645 \u0641\u064a \u062a\u062e\u064a\u0644 \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0639\u0627\u0645\u0629 \u0644\u0644\u0643\u0644\u0645\u0627\u062a.'
            : 'This page contains songs I have written, but with the melody for each song. Regardless of who sang these melodies, the goal is to convey the melody to you and help you imagine the general mood of the lyrics.'}
        </p>
      </div>

      {/* Search + Filter */}
      <div style={{ maxWidth: 1100, margin: '0 auto 30px' }}>
        <SearchBar value={search} onChange={setSearch} placeholder={lang === 'ar' ? 'ابحث عن لحن...' : 'Search for a melody...'} className="mb-5" />
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

            <div className="views-stars-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 15, gap: 10 }}>
              <div className="views-badge">{song.views}</div>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((num) => (
                  <span key={num}
                    className={`star ${num <= (hoverStar[song.id] ?? starRatings[song.id] ?? 0) ? 'active' : ''}`}
                    onClick={() => saveRating(song.id, num)}
                    onMouseEnter={() => setHoverStar((prev) => ({ ...prev, [song.id]: num }))}
                    onMouseLeave={() => setHoverStar((prev) => { const n = { ...prev }; delete n[song.id]; return n; })}
                  >★</span>
                ))}
              </div>
            </div>

            {normalizeAudioUrls(song.audioUrls).map((url, idx) => {
              const key = `${song.id}-${idx}`;
              const time = audioTimes[key] || { current: 0, duration: 0 };
              return (
                <div key={idx} className="custom-player-wrapper">
                  <div className="player-row-top">
                    <div className="player-controls-left">
                      <button className="play-btn" onClick={() => togglePlay(song.id, idx)}>
                        {playingKey === key ? '⏸' : '▶'}
                      </button>
                      <span className="player-time">{formatTime(time.current)} / {formatTime(time.duration)}</span>
                    </div>

                    <div className="player-controls-right">
                      <div className="volume-container">
                        <span className="volume-icon" onClick={() => setVolume((prev) => (prev > 0 ? 0 : 0.8))}>
                          {volume === 0 ? '🔇' : volume < 0.4 ? '🔈' : volume < 0.7 ? '🔉' : '🔊'}
                        </span>
                        <input type="range" min="0" max="1" step="0.05" value={volume}
                          onChange={(e) => setVolume(parseFloat(e.target.value))}
                          className="volume-slider" />
                      </div>

                      <div className="wave-container">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className={`wave-bar ${playingKey === key ? 'active' : ''}`} style={{ animationDelay: `${i * 0.05}s` }} />
                        ))}
                      </div>

                      <span className="audio-index-badge">{idx + 1}</span>
                    </div>
                  </div>

                  <div className="seeker-container">
                    <input type="range" min="0" max={time.duration || 100} value={time.current || 0}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        const audio = audioRefs.current[key];
                        if (audio) {
                          audio.currentTime = val;
                          setAudioTimes((prev) => ({ ...prev, [key]: { ...prev[key], current: val } }));
                        }
                      }}
                      className="audio-seeker-slider" />
                  </div>

                  <audio
                    ref={(el) => { audioRefs.current[key] = el; if (el) el.volume = volume; }}
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
            <div className="comments-header" style={{ marginTop: '15px' }}>
              <span className="label-gold">{lang === 'ar' ? 'التعليقات' : 'Comments'}</span>
              {activeInputSongId !== song.id && (
                <button
                  className="add-comment-btn"
                  onClick={() => handleAddComment(song.id)}
                >
                  {lang === 'ar' ? 'أضف تعليق +' : '+ Add comment'}
                </button>
              )}
            </div>

            {/* Comment Input Area */}
            {activeInputSongId === song.id && (
              <div className="comment-input-area">
                <textarea
                  className="comment-textarea"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    borderColor: isDark ? 'rgba(201, 168, 76, 0.2)' : 'rgba(201, 168, 76, 0.4)',
                  }}
                  value={newCommentText[song.id] || ''}
                  onChange={(e) => setNewCommentText(prev => ({ ...prev, [song.id]: e.target.value }))}
                  placeholder={lang === 'ar' ? 'اكتب تعليقك...' : 'Write your comment...'}
                  autoFocus
                />

                <div className="emoji-row">
                  {['😍', '🔥', '❤️', '👏', '🎵', '💯', '😢'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-btn"
                      onClick={() => handleEmojiClick(song.id, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="action-buttons">
                  <button
                    type="button"
                    className="btn-cancel"
                    style={{
                      color: isDark ? '#ffffff' : '#000000',
                      background: isDark ? 'rgba(255, 255, 255, 0.1)' : '#f3f3f3',
                    }}
                    onClick={() => handleCancelComment(song.id)}
                  >
                    {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    type="button"
                    className="btn-done"
                    onClick={() => handleSubmitComment(song.id)}
                  >
                    {lang === 'ar' ? 'تم ✓' : 'Done ✓'}
                  </button>
                </div>
              </div>
            )}

            {/* Comments Scroll List */}
            <div className="comments-scroll-list" style={{ maxHeight: '140px' }}>
              {(comments[song.id] || []).map((comment) => (
                <div
                  key={comment.id}
                  className="comment-bubble"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    borderColor: isDark ? 'rgba(201, 168, 76, 0.15)' : 'rgba(201, 168, 76, 0.3)',
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {comment.text}
                </div>
              ))}
              <div ref={(el) => { commentsEndRefs.current[song.id] = el; }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MelodiesPage
