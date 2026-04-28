import { useState, useRef, useMemo } from 'react';
import SearchBar from '@/components/SearchBar';
import { normalizeArabic } from '@/lib/arabic';
import { useLang } from '@/contexts/LangContext';

// مكون النوتات الموسيقية الطائرة
const FloatingNotes = () => {
  const NOTES = ['♩', '♪', '♫', '♬', '𝄞', '♭', '♯'];
  const floatingItems = Array.from({ length: 20 }, (_, i) => ({
    note: NOTES[i % NOTES.length],
    left: (i * 15 + 5) % 95,
    size: 20 + (i % 30),
    duration: 10 + (i % 10),
    delay: i * 0.5,
  }));

  return (
    <div className="floating-notes-container">
      {floatingItems.map((item, i) => (
        <span
          key={i}
          className="floating-note"
          style={{
            left: `${item.left}%`,
            fontSize: `${item.size}px`,
            animationDuration: `${item.duration}s`,
            animationDelay: `${item.delay}s`,
          }}
        >
          {item.note}
        </span>
      ))}
    </div>
  );
};

const CATEGORY_ORDER = ['poems', 'classic', 'drama', 'romantic', 'maqsum', 'pop', 'rock', 'tarab', 'trap', 'shaabi'];

const ALL_CATEGORIES_CONFIG = [
  { key: 'all', ar: 'الكل', en: 'All', match: () => true },
  { key: 'poems', ar: 'قصائد', en: 'Poems', match: (c) => /قصائد|poems/i.test(c) },
  { key: 'classic', ar: 'كلاسيك', en: 'Classic', match: (c) => /كلاسيك|classic/i.test(c) },
  { key: 'drama', ar: 'دراما', en: 'Drama', match: (c) => /دراما|drama/i.test(c) },
  { key: 'romantic', ar: 'رومانسي', en: 'Romantic', match: (c) => /رومانسي|romantic/i.test(c) },
  { key: 'maqsum', ar: 'مقسوم', en: 'Maqsum', match: (c) => /مقسوم|maqsum/i.test(c) },
  { key: 'pop', ar: 'بوب', en: 'Pop', match: (c) => /بوب|pop/i.test(c) },
  { key: 'rock', ar: 'روك', en: 'Rock', match: (c) => /روك|rock/i.test(c) },
  { key: 'tarab', ar: 'طرب', en: 'Tarab', match: (c) => /طرب|tarab/i.test(c) },
  { key: 'trap', ar: 'تراب', en: 'Trap', match: (c) => /تراب|trap/i.test(c) },
];

const allVideos = [
  {
    id: 1,
    title: "عداد الروقان",
    category: "مقسوم",
    videoUrls: ["https://youtu.be/kEgSPLkl0oQ?si=ITml38SiSzPgmF2T"],
    views: "88",
    critics: ["كلمات مُبتكره", "لحن مميز", "أداء قوي", "توزيع ضعيف"],
    lyrics: [
      { text: "أنا هبعت كلمة مهمة", red: false },
      { text: " من قلبي لقلب حبيبي", red: false },
      { text: "وهقوله بعادك غُمّة", red: false },
      { text: " وبجد مطلع عيني", red: false },
      { text: "\u00A0", red: false },
      { text: "طب ده أنا بطمن لما ", red: false },
      { text: " بلاقيك مش ناسيني", red: false },
      { text: "وبقولها لكُل العامه ", red: false },
      { text: " إنَك حَليتلي سنيني", red: false },
      { text: "\u00A0", red: false },
      { text: "«تكرار»", red: false },
      { text: "أنا هبعت كلمة مهمة", red: false },
      { text: " من قلبي لقلب حبيبي", red: false },
      { text: "وهقوله بعادك غُمّة", red: false },
      { text: " وبجد مطلع عيني", red: false },
      { text: "\u00A0", red: false },
      { text: "طب ده أنا بطمن لما ", red: false },
      { text: " بلاقيك مش ناسيني", red: false },
      { text: "وبقولها لكُل العامه ", red: false },
      { text: " إنَك حَليتلي سنيني", red: false },
      { text: "\u00A0", red: false },
      { text: "يـ مـقَـفِل عداد الروقان", red: true },
      { text: "اه ي واخد أوسكار فالجمدان", red: true },
      { text: "ده انتَ أما بتدخُل أي مكان", red: true },
      { text: "بتغطي على الناس إللي فيه", red: true },
      { text: "\u00A0", red: false },
      { text: "وبراحتّك خَطي وماتسميش", red: true },
      { text: "ياللي انت جمالك مِنُه مَفيش", red: true },
      { text: "طول ما انت معايا مايشغلنيش", red: true },
      { text: "الدُنيَّا بيحصل فيـهـا إيـه", red: true },
      { text: "\u00A0", red: false },
      { text: "كان فينّك بقىّ مِن بَدري؟", red: false },
      { text: "بدل الـهَـم إللي أنا شفتُه..", red: false },
      { text: "أحسّن حاجة إنك قدري", red: false },
      { text: "إللي فرحت أمّا عرِفتُه..", red: false },
      { text: "\u00A0", red: false },
      { text: "ده أنا كُـل م بسأل عنك", red: false },
      { text: "بيقولوا رد بيعجبني", red: false },
      { text: "بيقولوا إن مَفيش مِنّك..", red: false },
      { text: "وإنـك فِعلاً مناسِبلي", red: false },
      { text: "\u00A0", red: false },
      { text: "«تكرار»", red: false },
      { text: "كان فينّك بقىّ مِن بَدري؟", red: false },
      { text: "بدل الـهَـم إللي أنا شفتُه..", red: false },
      { text: "أحسّن حاجة إنك قدري", red: false },
      { text: "إللي فرحت أمّا عرِفتُه..", red: false },
      { text: "\u00A0", red: false },
      { text: "ده أنا كُـل م بسأل عنك", red: false },
      { text: "بيقولوا رد بيعجبني", red: false },
      { text: "بيقولوا إن مَفيش مِنّك..", red: false },
      { text: "وإنـك فِعلاً مناسِبلي", red: false },
      { text: "\u00A0", red: false },
      { text: "يـ مـقَـفِل عداد الروقان", red: true },
      { text: "اه ي واخد أوسكار فالجمدان", red: true },
      { text: "ده انتَ أما بتدخُل أي مكان", red: true },
      { text: "بتغطي على الناس إللي فيه", red: true },
      { text: "\u00A0", red: false },
      { text: "وبراحتّك خَطي وماتسميش", red: true },
      { text: "ياللي انت جمالك مِنُه مَفيش", red: true },
      { text: "طول ما انت معايا مايشغلنيش", red: true },
      { text: "الدُنيَّا بيحصل فيـهـا إيـه", red: true },
    ],
  },
  {
    id: 2,
    title: "كَيْفَ حَالُكِ؟",
    category: "قصائد",
    videoUrls: ["https://drive.google.com/file/d/1t3l9R8m8oWxm4C31MZQbZKn-iv_F06y2/view?usp=sharing"],
    views: "156",
    critics: ["الكلمات عميقه وقويه", "اللحن أفضل من اللحن 1 و اللحن 2", "الفيديو ممتاز وبه مجهود و تفاصيل", "مناسبة لصوت كاظم الساهر"],
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
      { text: "يا هل ترى حُبي لَكِي مُتَبَادِلً", red: false },
      { text: "أّم أَنَّهُ كلاماً عابراً لا أسَاسَ لهُ من الوجودٍِ", red: false },
      { text: "\u00A0", red: false },
      { text: "هَلْ مِنْ سَبِيلٍ لِلتَّلَاقِي بَعْدَ فِرَاقِنَا الطَّوِيلِ", red: false },
      { text: "كَيْفَ حَالُكِ؟ أَخْبِرِينِي يَا ذَاتَ الْوَجْهِ الْجَمِيلِ", red: false },
      { text: "هَلْ مَا زِلْتِي تَذْكُرِينِي وَقَلْبُكِ لِي يَمِيلُ؟", red: false },
      { text: "آهِ مِنْ عَيْنَيْكِ الْحَسْنَاوَيْنِ اللَّتَيْيِنِ تَشْفِيَاَنِ الْعَلِيلَ!", red: false },
      { text: "\u00A0", red: false },
      { text: "قَدْ سَأَلْتُ نُجُومَ اَلْلَيلِ عنكِي", red: true },
      { text: "فقَاَلُوُ لي أَنّهُمْ إذا رَأَوكِي سَيُخبِرونِي", red: true },
      { text: "\u00A0", red: false },
      { text: "وَ اسْتَشَرْتُ البحرَ حينَ نَاجَيِتُهُ", red: true },
      { text: "فَنَصَحَنِي بالتَأنّي مُؤَكِّداً أَنَّكِي سَتعُودِي", red: true },
      { text: "\u00A0", red: false },
      { text: "مَهْمَا جَارَ عَلَيَّ الزَّمَانُ فَإِنَّنِي إِنَّنِي لَنْ أَجُورَ عَلَيْكِ", red: false },
      { text: "وَاللهِ إِنَّ جُرْحِي يَطِيبُ حِينَ أَرَى عَيْنَيْكِ", red: false },
    ],
  },
  {
    id: 3,
    title: "نبره حزينه",
    category: "دراما",
    videoUrls: ["https://res.cloudinary.com/dq3orhpdj/video/upload/v1777259384/%D9%86%D8%A8%D8%B1%D8%A9_%D8%AD%D8%B2%D9%8A%D9%86%D8%A9_gzmks7.mp4"],
    views: "0",
    critics: ["الكلمات دقيقة وتروي قصة", "اللحن متناغم مع الكلمات", "مناسبة لصوت تامر عاشور", "مناسبة لصوت رامي جمال"],
    lyrics: [
      { text: "نبره حزينه", red: false },
      { text: "\u00A0", red: false },
      { text: "جمعتنا صُدفة ف مكان .. وحصل م بينا كلام", red: false },
      { text: "عيني جائت ف عينها وأوام .. إفتكرت زكرياتنا", red: false },
      { text: "نزلت دموع من عنيها .. ولمحت رعشة ف إيداها", red: false },
      { text: "فجأة التعب بان عليها .. بسبب سيرة بُعدنا", red: false },
      { text: "\u00A0", red: false },
      { text: "وقالت لي بنبرة حزينة .. إنها ندمانه", red: true },
      { text: "مكنتش حاسه بقيمتي .. وكانت غلطانه", red: true },
      { text: "من يوم م بعدنا وهيا .. في أسوأ حالة", red: true },
      { text: "وقالت لي إنها بصراحة .. حنَّت لهوانا", red: true },
      { text: "\u00A0", red: false },
      { text: "ولقيت دموعها بتزيد .. صعبت عليّا أكيد", red: false },
      { text: "خدتها وقعدنا بعيد .. عشان محدش يلاحظ", red: false },
      { text: "هديتها أنا بالكلام .. حست ساعتها بأمان", red: false },
      { text: "محستوش من زمان .. وكانت مرتاحة خالص", red: false },
      { text: "\u00A0", red: false },
      { text: "وقالت لي بنظرة بريئة .. إنها مبسوطة", red: true },
      { text: "كل همومها خلاص راحت .. ومش موجودة", red: true },
      { text: "وأن أنا رديت روحها اللي .. كانت مفقودة", red: true },
      { text: "ووجودي نوّر دنيتها .. بعد ما كانت سوداء", red: true },
    ],
  },
  {
    id: 4,
    title: "كلامي واضح",
    category: "تراب",
    videoUrls: ["https://drive.google.com/file/d/1LmDxEar_OOyBdgNOfoW23q6l8kvwrKmK/view?usp=sharing"],
    views: "0",
    critics: ["كلمات قوية", "إيقاع مناسب للراب الحماسي", "أداء واضح", "مناسب للفيديو"],
    lyrics: [
      { text: "ودي مسا على مسا", red: false },
      { text: "جينا ريحنا العدا", red: false },
      { text: "سمعنا كل الندا ايه.", red: false },
      { text: "متعنا كل الحِمل ايه.", red: false },
      { text: "\u00A0", red: false },
      { text: "جينا قعدنا شنيبه", red: false },
      { text: "وجودنا كان مشكلة.", red: false },
      { text: "بقوا يسمعوا اسمنا", red: false },
      { text: "يعملوا فيها مش من هنا.", red: false },
      { text: "\u00A0", red: false },
      { text: "كانت أشكال وحشة ومُقرفة.", red: false },
      { text: "لا مش مسترجلة.", red: false },
      { text: "فالحين بس يزيطو ف الزيطه.", red: false },
      { text: "وقت الجد يسلمو نمر.", red: false },
      { text: "\u00A0", red: false },
      { text: "الكلمة سيف وكلامي واضح.", red: true },
      { text: "أنا عندي طلاقه", red: true },
      { text: "ف اللسان ايه.", red: true },
      { text: "\u00A0", red: false },
      { text: "كلامكو زيف مالوش ملامح.", red: true },
      { text: "تمامكم معروف من زمان.", red: true },
      { text: "\u00A0", red: false },
      { text: "لو حتي الوضع مش سامح.", red: true },
      { text: "انا هوصل لهدفي مهما كان.", red: true },
      { text: "\u00A0", red: false },
      { text: "انا من يومي fiter ومكافح.", red: true },
      { text: "الايد مش بطالة شقيييان.", red: true },
      { text: "\u00A0", red: false },
      { text: "دي عيال مُخها تعبان.", red: false },
      { text: "ودماغهم فعلاً فاضي ايه.", red: false },
      { text: "\u00A0", red: false },
      { text: "بيقدوها story haat.", red: false },
      { text: "بيموتوا يابا", red: false },
      { text: "\u00A0", red: false },
      { text: "على ال money ايه.", red: false },
      { text: "دا بيسعو لأجل trand aat.", red: false },
      { text: "\u00A0", red: false },
      { text: "عايزين العيشه", red: false },
      { text: "دي soo honey.", red: false },
      { text: "\u00A0", red: false },
      { text: "اخرتهم يا زميلي black.", red: false },
      { text: "وقضايا كبيرة فعل فاضح.", red: false },
      { text: "\u00A0", red: false },
      { text: "مرمطه وسين وجيم.", red: false },
      { text: "وكلها في أقسام.", red: false },
      { text: "\u00A0", red: false },
      { text: "قضيني بقا أو حلني.", red: false },
      { text: "لما يخرجوا إخلاء فعلاً.", red: false },
      { text: "\u00A0", red: false },
      { text: "ف بلاش تعيشوا دور مش دوركو.", red: false },
      { text: "بطلوا اشتغلات يابا.", red: false },
      { text: "\u00A0", red: false },
      { text: "كان القرد نفع نفسه", red: false },
      { text: "وأختلفت الاحوال.", red: false },
      { text: "\u00A0", red: false },
      { text: "مش اي حد يشيل كام Bar.", red: false },
      { text: "يعمل فيها Van-Damm ايه.", red: false },
      { text: "\u00A0", red: false },
      { text: "واظن كله عارف حجمه.", red: false },
      { text: "وبالنسبة لي أنتو عيال.", red: false },
      { text: "\u00A0", red: false },
      { text: "شوف أنتو فين وأنا فين.", red: false },
      { text: "هتلاقي الفرق بينا سنين.", red: false },
      { text: "\u00A0", red: false },
      { text: "مقامكم تحت الرجلين.", red: false },
      { text: "مكانا Top El Scene.", red: false },
      { text: "\u00A0", red: false },
      { text: "أحنا واصلين علشان جامدين.", red: true },
      { text: "وأنتو واقعين علشان فاشلين.", red: true },
      { text: "\u00A0", red: false },
      { text: "السمعة ك ال Vitamin.", red: false },
      { text: "وانتو ك ال Ketamine ايه.", red: false },
      { text: "\u00A0", red: false },
      { text: "الحلو جاي بيهز ف طوله.", red: false },
      { text: "طب ما تفضوا السكة.", red: false },
      { text: "وسّعولُه ايه.", red: false },
      { text: "\u00A0", red: false },
      { text: "سيبوه كده يقول اللي يقوله.", red: false },
      { text: "هنا Tutto sotto.", red: false },
      { text: "controllo", red: false },
    ],
  },
  {
    id: 5,
    title: "تِلْكَ السُّلطَانَهْ",
    category: "روك",
    videoUrls: ["https://drive.google.com/file/d/12TWS402XYp6SEZXr5Kn9PdnZW4Y-0Va_/view?usp=sharing"],
    views: "0",
    critics: ["مزج رومانسي وروك مناسب للنص", "كلمات فصحى بليغة", "هيكل مقاطع واضح", "مناسب لعرض فيديو عالي الطاقة"],
    lyrics: [
      { text: "_ يَوْماً مَ", red: false },
      { text: "_ سَنَكُونُ مَعاً", red: false },
      { text: "_ سَأَسْأَلُكِ", red: false },
      { text: "_ وَ بِكُلِّ أَمَلْ", red: false },
      { text: "_ أَتُحِبِّيني؟", red: false },
      { text: "_ فَتَقُولِي نَعَمْ", red: false },
      { text: "_ هلْ تَقْبَلِي بِي؟", red: false },
      { text: "_ فَتَقُولِي أَجَلْ", red: false },
      { text: "\u00A0", red: false },
      { text: "\u00A0", red: false },
      { text: "_ وَأَطْلُبُ يَدَكِ", red: false },
      { text: "_ مِنْ وَالِدَكِ", red: false },
      { text: "_ وَأُقِيمُ زِفَافاً", red: false },
      { text: "_ لِجَلالَتِكِ", red: false },
      { text: "_ وَأَقُولُ لِلنَّاسْ", red: false },
      { text: "_ وَبِكُلِّ أَمَانَة", red: false },
      { text: "_ تِلْكَ السُّلطَانَهْ", red: false },
      { text: "_ صَارَتْ حَرَمِي", red: false },
      { text: "\u00A0", red: false },
      { text: "\u00A0", red: false },
      { text: "_ تِلْكَ الَّتِي شَغَلَتْ أَفْكَارِي", red: true },
      { text: "_ طِيلَةَ لَيْلِي وَنَهاري", red: true },
      { text: "_ بِجَمَالِهَا لَفَتَتْ أَنْظَارِي", red: true },
      { text: "_ مِنْ أَجْلِهَا زَادَ إِصْرَارِي", red: true },
      { text: "_ أَنْ تَسْكُنَ قَلْبِي وَدِيَارِي", red: true },
      { text: "_ هِيَ رُوحِي وَأَجْمَلُ أَقْدَارِي", red: true },
      { text: "\u00A0", red: false },
      { text: "\u00A0", red: false },
      { text: "_ وَتَمْضِي الأَيَّامْ", red: false },
      { text: "_ بِنَا فِي سَلامْ", red: false },
      { text: "_ بَيْنَ مَشَاعِرِ", red: false },
      { text: "_ حُبٍّ وَغَرَامْ", red: false },
      { text: "_ نُنْجِبُ طِفْلاً", red: false },
      { text: "_ يُصْبِحُ عَوْناً", red: false },
      { text: "_ نَجْماً سَاطِعْ", red: false },
      { text: "_ وَلَهُ أَحْلامْ", red: false },
      { text: "\u00A0", red: false },
      { text: "_ وَنَغْرِسُ فِيهِ", red: false },
      { text: "_ حُسْنَ الأَخْلاقِ", red: false },
      { text: "_ مِثْلَ العَدْلِ", red: false },
      { text: "_ وَالإِحْسَانِ", red: false },
      { text: "_ وَنُزَوِّجُهُ", red: false },
      { text: "_ بِنْتَ الذَّوَاتِ", red: false },
      { text: "_ لِتُسَانِدَهُ", red: false },
      { text: "_ وَقْتَ الأَزَمَاتِ", red: false },
      { text: "_ وَالأَحْزَانِ", red: false },
      { text: "\u00A0", red: false },
      { text: "\u00A0", red: false },
      { text: "_ وَنُكَوِّنُ نَسْلاً يَجْمَعُنَا", red: true },
      { text: "_ يَسْتَمْتِعُ بِالكَوْنِ مَعَنَا", red: true },
      { text: "_ لا نَتْرُكُ هَمّاً يَمْنَعُنَا", red: true },
      { text: "_ كَيْ نَجْعَلَ لِحَيَاتِنَا مَعْنَى", red: true },
      { text: "\u00A0", red: false },
      { text: "_تِلْكَ الَّتِي شَغَلَتْ أَفْكَارِي", red: true },
      { text: "_ طِيلَةَ لَيْلِي وَنَهاري", red: true },
      { text: "_ بِجَمَالِهَا لَفَتَتْ أَنْظَارِي", red: true },
      { text: "_ مِنْ أَجْلِهَا زَادَ إِصْرَارِي", red: true },
      { text: "_ أَنْ تَسْكُنَ قَلْبِي وَدِيَارِي", red: true },
      { text: "_ هِيَ رُوحِي وَأَجْمَلُ أَقْدَارِي", red: true },
    ],
  },
];

const VideosPage = () => {
  const { lang } = useLang();
  const [search, setSearch] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});

  const availableCategories = useMemo(() => {
    const presentKeys = new Set(allVideos.map(v => {
      const found = ALL_CATEGORIES_CONFIG.find(c => c.key !== 'all' && c.match(v.category));
      return found ? found.key : null;
    }));
    return ALL_CATEGORIES_CONFIG.filter(c => c.key === 'all' || presentKeys.has(c.key));
  }, []);

  const filteredVideos = useMemo(() => {
    const q = normalizeArabic(search);
    const catConfig = ALL_CATEGORIES_CONFIG.find(c => c.key === activeCat);
    let result = allVideos.filter(v => {
      const matchesCat = catConfig ? catConfig.match(v.category) : true;
      if (!matchesCat) return false;
      if (!q) return true;
      const hay = [v.title, v.category, ...(v.lyrics?.map(l => l.text) || [])].join(' ');
      return normalizeArabic(hay).includes(q);
    });
    return result.sort((a, b) => {
      const orderA = CATEGORY_ORDER.indexOf(ALL_CATEGORIES_CONFIG.find(c => c.match(a.category))?.key || '');
      const orderB = CATEGORY_ORDER.indexOf(ALL_CATEGORIES_CONFIG.find(c => c.match(b.category))?.key || '');
      return (orderA === -1 ? 99 : orderA) - (orderB === -1 ? 99 : orderB);
    });
  }, [search, activeCat]);

  return (
    <div dir="rtl" className="page-wrapper">
      <FloatingNotes />
      
      <style>{`
        .page-wrapper { 
          background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, #000 100%);
          min-height: 100vh; padding: 40px 20px; position: relative; overflow-x: hidden;
        }

        .floating-notes-container { position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 0; }
        .floating-note { position: absolute; bottom: -50px; color: rgba(255, 255, 255, 0.1); animation: floatUp linear infinite; }
        @keyframes floatUp {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 0.4; }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }

        .main-card { 
          max-width: 1100px; margin: 0 auto 60px; 
          /* خلفية الكارد أحمر أفتح قليلاً مع نسيج الجلد */
          background-image: url('https://www.transparenttextures.com/patterns/leather.png');
          background-color: #8b0000; 
          border-radius: 30px; overflow: hidden; position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.1);
        }

        .card-content { display: grid; grid-template-columns: 1.3fr 0.7fr; gap: 25px; padding: 35px; position: relative; z-index: 2; }
        
        /* صندوق الكلمات بلون أزرق غامق (نفس لون الصفحة القديم) */
        .lyrics-section { 
          background: #0a0f2b; 
          padding: 30px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1);
          box-shadow: inset 0 0 20px rgba(0,0,0,0.5);
        }

        .video-title { color: #fff; font-size: 2.2rem; margin-bottom: 20px; font-family: 'Aref Ruqaa Ink', serif; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
        .line { color: #e0e0e0; font-size: 1.15rem; margin-bottom: 6px; line-height: 1.6; }
        .line.red { color: #ff3333; font-weight: bold; text-shadow: 0 0 8px rgba(255,0,0,0.2); }

        .filter-chip {
          padding: 10px 25px; border-radius: 25px; background: rgba(0,0,0,0.3);
          color: #fff; border: 1px solid rgba(255,255,255,0.2); cursor: pointer; transition: 0.3s;
        }
        .filter-chip.active { background: #fff; color: #8b0000; font-weight: bold; }

        .video-wrapper { position: relative; padding-bottom: 56.25%; height: 0; border-radius: 15px; overflow: hidden; margin-bottom: 25px; border: 3px solid rgba(0,0,0,0.2); }
        .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        
        .critic-item { background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 12px; margin-bottom: 10px; color: #fff; border-right: 4px solid #fff; }
        .views-badge { background: #fff; color: #8b0000; padding: 6px 18px; border-radius: 20px; font-weight: bold; display: inline-block; }
      `}</style>

      {/* البحث والفلترة */}
      <div style={{ maxWidth: 1100, margin: '0 auto 40px', position: 'relative', zIndex: 10 }}>
        <SearchBar value={search} onChange={setSearch} placeholder="ابحث في القصائد أو الأغاني..." />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 25 }}>
          {availableCategories.map((c) => (
            <button key={c.key} className={`filter-chip ${activeCat === c.key ? 'active' : ''}`} onClick={() => setActiveCat(c.key)}>
              {lang === 'ar' ? c.ar : c.en}
            </button>
          ))}
        </div>
      </div>

      {/* عرض الفيديوهات */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {filteredVideos.map((video) => (
          <div key={video.id} className="main-card">
            <div className="card-content">
              {/* يمين: الفيديو والكلمات */}
              <div className="right-col">
                <div className="video-wrapper">
                  {video.videoUrls[0].includes('youtube') || video.videoUrls[0].includes('youtu.be') ? (
                    <iframe className="video-frame" src={`https://www.youtube.com/embed/${video.videoUrls[0].split('/').pop()?.split('?')[0]}`} allowFullScreen />
                  ) : (
                    <video className="video-frame" controls src={video.videoUrls[0]} />
                  )}
                </div>
                
                <div className="lyrics-section">
                  <h2 className="video-title">{video.title}</h2>
                  <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                    {video.lyrics?.map((lyric, i) => (
                      <div key={i} className={`line ${lyric.red ? 'red' : ''}`}>
                        {lyric.text === '\u00A0' ? <br /> : lyric.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* يسار: التقييمات والمعلومات */}
              <div className="left-col">
                <h4 style={{ color: '#fff', marginBottom: '20px', fontSize: '1.4rem' }}>آراء النقاد</h4>
                {video.critics?.map((critic, idx) => (
                  <div key={idx} className="critic-item">
                    {critic}
                  </div>
                ))}
                <div style={{ marginTop: '30px', textAlign: 'center' }}>
                  <div className="views-badge">{video.views} K VIEWS</div>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: '10px', fontSize: '0.9rem' }}>التصنيف: {video.category}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideosPage;
