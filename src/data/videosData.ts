export const VIDEO_CATEGORIES = [
  { key: 'all', ar: 'الكل', en: 'All', match: () => true, order: 0 },
  { key: 'islamic', ar: 'إسلامي', en: 'Islamic', match: (c) => /islamic|إسلامي/i.test(c), order: 1 },
  { key: 'patriotic', ar: 'وطني', en: 'Patriotic', match: (c) => /patriotic|وطني/i.test(c), order: 2 },
  { key: 'social', ar: 'اجتماعي وعائلي', en: 'Social & Family', match: (c) => /social|family|اجتماعي|عائلي/i.test(c), order: 3 },
  { key: 'occasion', ar: 'مناسبات وأعياد', en: 'Occasion & Holiday', match: (c) => /occasion|holiday|مناسبات|أعياد/i.test(c), order: 4 },
  { key: 'motivational', ar: 'تحفيزية', en: 'Motivational', match: (c) => /motivational|تحفيزية|تحفيز/i.test(c), order: 5 },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /poems|قصائد|قصيدة/i.test(c), order: 6 },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /classic|كلاسيك/i.test(c), order: 7 },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /drama|دراما/i.test(c), order: 8 },
  { key: 'slow', ar: 'سلو', en: 'Slow', match: (c) => /slow|سلو/i.test(c), order: 9 },
  { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c) => /^رومانسي$/i.test(c.trim()), order: 10 },
  { key: 'romantic_maqsum', ar: 'رومانسي مقسوم', en: 'Romantic Maqsum', match: (c) => /رومانسي مقسوم/i.test(c), order: 11 },
  { key: 'pop', ar: 'بوب', en: 'Pop', match: (c) => /pop|بوب/i.test(c), order: 12 },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /rock|روك/i.test(c), order: 13 },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /^مقسوم$/i.test(c.trim()), order: 14 },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /tarab|طرب/i.test(c), order: 15 },
  { key: 'shaabi', ar: 'شعبي', en: 'Shaabi', match: (c) => /shaabi|شعبي/i.test(c), order: 16 },
  { key: 'saidi', ar: 'صعيدي', en: "Sa'idi", match: (c) => /sa'idi|saidi|صعيدي/i.test(c), order: 17 },
  { key: 'rap', ar: 'راب', en: 'Rap', match: (c) => /^راب$/i.test(c.trim()), order: 18 },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /trap|تراب/i.test(c), order: 19 },
];

export const allVideos = [
  {
    id: 1,
    title: 'أغنية إسلامية تجريبية',
    category: 'islamic',
    videoUrls: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ'],
    lyrics: [
      { text: 'هذه كلمة تجريبية', red: false },
      { text: 'هذه كلمة حمراء', red: true },
    ],
    views: 0,
  },
  {
    id: 2,
    title: 'أغنية رومانسية',
    category: 'romantic',
    videoUrls: ['https://www.youtube.com/watch?v=3JZ_D3ELwOQ'],
    lyrics: [
      { text: 'حبك يا قلبي', red: false },
      { text: 'قلبك احمر', red: true },
    ],
    views: 0,
  },
];
