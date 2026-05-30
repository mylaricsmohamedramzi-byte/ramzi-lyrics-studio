import { useState, useRef } from 'react';

// دالة استخراج ID اليوتيوب
function getYouTubeVideoId(url: string): string | null {
  try {
    const trimmed = url.trim();
    if (trimmed.includes('youtu.be/')) {
      const match = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : null;
    }
    if (trimmed.includes('youtube.com')) {
      const u = new URL(trimmed);
      return u.searchParams.get('v');
    }
    if (trimmed.length === 11 && /^[a-zA-Z0-9_-]+$/.test(trimmed)) {
      return trimmed;
    }
  } catch {
    return null;
  }
  return null;
}

function getVideoSourceType(url: string): 'youtube' | 'cloudinary' | 'gdrive' | 'direct' {
  const lower = url.toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('cloudinary.com')) return 'cloudinary';
  if (lower.includes('drive.google.com')) return 'gdrive';
  return 'direct';
}

const allVideos = [
  {
    id: 1,
    title: "عداد الرقان ",
    category: "Romantic maqsum",
    videoUrls: ["https://youtu.be/kEgSPLkl0oQ?si=ITml38SiSzPgmF2T"],
    views: "88",
    critics: ["كلمات مُبتكره ","لحن مميز", "أداء قوي", "توزيع ضعيف "], 
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
      { text: "الدُنيَّا بيحصل فيـهـا إيـه", red: true },
    
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
      { text: "الدُنيَّا بيحصل فيـهـا إيـه", red: true },
    ],
  },
  {
    id: 2,
    title: "كَيْفَ حَالُكِ؟",
    category: "Behind the Scenes",
    videoUrls: ["https://youtu.be/tb7sTXQKBwI"],
    views: "156",
    critics: ["الكلمات عميقه وقويه ","اللحن أفضل من اللحن 1 و اللحن 2","الفيديو ممتاز وبه مجهود و تفاصيل ","مناسبة لصوت كاظم الساهر"],
    lyrics: [
      { text: "حَبِيبَتِي قَدْ أَتَتْنِي اَلْرِّيِحُ بِمَا لَا أَشْتَهِي", red: false },
      { text: "وَلَقَدْ صَبَرْتُ حَتَّى صَارَ الصَّبْرُ مِنِّي يَشْتَكِي", red: false },
      { text: "مَا مِنْ كَلَامٍ مُنْصِفٍ يَوصِفُ شَوْقِي لَكِ", red: false },
      { text: "فَلِمَاذَا لَا تُطَمْئِنِيّ قَلْبِي الَّذِي أَحَبَّكِي؟", red: false },
      { text: "\u00A0", red: false },
      { text: "قَدْ سَأَلْتُ نُجُومَ اَلْلَيلِ عنكِي", red: true  },
      { text: "فقَاَلُوُ لي أَنّهُمْ إذا رَأَوكِي سَيُخبِرونِي", red: true  },
      { text: "\u00A0", red: false },
      { text: "وَ اسْتَشَرْتُ البحرَ حينَ نَاجَيِتُهُ", red: true },
      { text: "فَنَصَحَنِي بالتَأنّي مُؤَكِّداً أَنَّكِي سَتعُودِي", red: true  },
      { text: "\u00A0", red: false },
      { text: "يا هل ترى حُبي لَكِي مُتَبَادِلً", red: false },
      { text: "أّم أَنَّهُ كلاماً عابراً لا أسَاسَ لهُ من الوجودٍِ", red: false },
      { text: "\u00A0", red: false },
      { text: "هَلْ مِنْ سَبِيلٍ لِلتَّلَاقِي بَعْدَ فِرَاقِنَا الطَّوِيلِ", red: false },
      { text: "كَيْفَ حَالُكِ؟ أَخْبِرِينِي يَا ذَاتَ الْوَجْهِ الْجَمِيلِ", red: false },
      { text: "هَلْ مَا زِلْتِي تَذْكُرِينِي وَقَلْبُكِ لِي يَمِيلُ؟", red: false },
      { text: "آهِ مِنْ عَيْنَيْكِ الْحَسْنَاوَيْنِ اللَّتَيْيِنِ تَشْفِيَاَنِ الْعَلِيلَ!", red: false },
      { text: "\u00A0", red: false },
      { text: "قَدْ سَأَلْتُ نُجُومَ اَلْلَيلِ عنكِي", red: true  },
      { text: "فقَاَلُوُ لي أَنّهُمْ إذا رَأَوكِي سَيُخبِرونِي", red: true  },
      { text: "\u00A0", red: false },
      { text: "وَ اسْتَشَرْتُ البحرَ حينَ نَاجَيِتُهُ", red: true },
      { text: "فَنَصَحَنِي بالتَأنّي مُؤَكِّداً أَنَّكِي سَتعُودِي", red: true  },
      { text: "\u00A0", red: false },
      { text: "مَهْمَا جَارَ عَلَيَّ الزَّمَانُ فَإِنَّنِي إِنَّنِي لَنْ أَجُورَ عَلَيْكِ", red: false },
      { text: "وَاللهِ إِنَّ جُرْحِي يَطِيبُ حِينَ أَرَى عَيْنَيْكِ", red: false },
      { text: "\u00A0", red: false },
    ],
  },  {
    id: 3,
    title: "نبره حزينه",
    category: "Drama",
    videoUrls: [
      "https://youtu.be/kerALDxqYnE",
    ],
    views: "0",
    critics: [
      "الكلمات دقيقة وتروي قصة",
      "اللحن متناغم مع الكلمات",
      "مناسبة لصوت تامر عاشور",
      "مناسبة لصوت رامي جمال",
    ],
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
  },  {
    id: 4,
    title: "كلامي واضح",
    category: "راب حماسي",
    videoUrls: [
      "https://drive.google.com/file/d/1LmDxEar_OOyBdgNOfoW23q6l8kvwrKmK/view?usp=sharing",
    ],
    views: "0",
    critics: [
      "كلمات قوية",
      "إيقاع مناسب للراب الحماسي",
      "أداء واضح",
      "مناسب للفيديو",
    ],
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
      { text: "الكلمة سيف وكلامي واضح.", red: true  },
      { text: "أنا عندي طلاقه", red: true  },
      { text: "ف اللسان ايه.", red: true },
      { text: "\u00A0", red: false },
      { text: "كلامكو زيف مالوش ملامح.", red: true },
      { text: "تمامكم معروف من زمان.", red: true  },
      { text: "\u00A0", red: false },
      { text: "لو حتي الوضع مش سامح.", red: true },
      { text: "انا هوصل لهدفي مهما كان.", red: true },
      { text: "\u00A0", red: false },
      { text: "انا من يومي fiter ومكافح.", red:true  },
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
      { text: "أحنا واصلين علشان جامدين.", red: true  },
      { text: "وأنتو واقعين علشان فاشلين.", red: true  },
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
    category: "Romantic Rock",
    videoUrls: [
      "https://drive.google.com/file/d/1xqrGDUuImcTSg1P7hIYym-aVRVxz1GM3/view?usp=sharing",
    ],
    views: "0",
    critics: [
      "مزج رومانسي وروك مناسب للنص",
      "كلمات فصحى بليغة وقافية واضحة",
      "هيكل مقاطع واضح (بيت، لازمة، تطوير)",
      "مناسب لعرض فيديو عالي الطاقة",
    ],
    lyrics: [
      
      { text: "_ يَوْماً مَ", red: false },
      { text: "_ سَنَكُونُ مَعاً", red: false },
      { text: "_ سَأَسْأَلُكِ", red: false },
      { text: "_ وَ بِكُلِّ أَمَلْ", red: false },
      { text: "_ أَتُحِبِّيني؟", red: false },
      { text: "_ فَتَقُولِي نَعَمْ", red: false },
      { text: "_ هلْ تَقْبَلِي بِي؟", red: false },
      { text: "_ فَتَقُولِي أَجَلْ", red: false },
      { text: "\u00A0", red: false },
      
      { text: "\u00A0", red: false },
      { text: "_ وَأَطْلُبُ يَدَكِ", red: false },
      { text: "_ مِنْ وَالِدَكِ", red: false },
      { text: "_ وَأُقِيمُ زِفَافاً", red: false },
      { text: "_ لِجَلالَتِكِ", red: false },
      { text: "_ وَأَقُولُ لِلنَّاسْ", red: false },
      { text: "_ وَبِكُلِّ أَمَانَة", red: false },
      { text: "_ تِلْكَ السُّلطَانَهْ", red: false },
      { text: "_ صَارَتْ حَرَمِي", red: false },
      { text: "\u00A0", red: false },
      
      { text: "\u00A0", red: false },
      { text: "_ تِلْكَ الَّتِي شَغَلَتْ أَفْكَارِي", red: true },
      { text: "_ طِيلَةَ لَيْلِي وَنَهاري", red: true },
      { text: "_ بِجَمَالِهَا لَفَتَتْ أَنْظَارِي", red: true },
      { text: "_ مِنْ أَجْلِهَا زَادَ إِصْرَارِي", red: true },
      { text: "_ أَنْ تَسْكُنَ قَلْبِي وَدِيَارِي", red: true },
      { text: "_ هِيَ رُوحِي وَأَجْمَلُ أَقْدَارِي", red: true },
      { text: "\u00A0", red: false },
     
      
      { text: "\u00A0", red: false },
      { text: "_ وَتَمْضِي الأَيَّامْ", red: false },
      { text: "_ بِنَا فِي سَلامْ", red: false },
      { text: "_ بَيْنَ مَشَاعِرِ", red: false },
      { text: "_ حُبٍّ وَغَرَامْ", red: false },
      { text: "_ نُنْجِبُ طِفْلاً", red: false },
      { text: "_ يُصْبِحُ عَوْناً", red: false },
      { text: "_ نَجْماً سَاطِعْ", red: false },
      { text: "_ وَلَهُ أَحْلامْ", red: false },
      { text: "\u00A0", red: false },
      
      { text: "_ وَنَغْرِسُ فِيهِ", red: false },
      { text: "_ حُسْنَ الأَخْلاقِ", red: false },
      { text: "_ مِثْلَ العَدْلِ", red: false },
      { text: "_ وَالإِحْسَانِ", red: false },
      { text: "_ وَنُزَوِّجُهُ", red: false },
      { text: "_ بِنْتَ الذَّوَاتِ", red: false },
      { text: "_ لِتُسَانِدَهُ", red: false },
      { text: "_ وَقْتَ الأَزَمَاتِ", red: false },
      { text: "_ وَالأَحْزَانِ", red: false },
      { text: "\u00A0", red: false },
      { text: "\u00A0", red: false },
      
      { text: "_ وَنُكَوِّنُ نَسْلاً يَجْمَعُنَا", red: true },
      { text: "_ يَسْتَمْتِعُ بِالكَوْنِ مَعَنَا", red: true },
      { text: "_ لا نَتْرُكُ هَمّاً يَمْنَعُنَا", red: true },
      { text: "_ كَيْ نَجْعَلَ لِحَيَاتِنَا مَعْنَى", red: true },
      { text: "\u00A0", red: false },
     
      { text: "_تِلْكَ الَّتِي شَغَلَتْ أَفْكَارِي", red: true },
      { text: "_ طِيلَةَ لَيْلِي وَنَهاري", red: true },
      { text: "_ بِجَمَالِهَا لَفَتَتْ أَنْظَارِي", red: true },
      { text: "_ مِنْ أَجْلِهَا زَادَ إِصْرَارِي", red: true },
      { text: "_ أَنْ تَسْكُنَ قَلْبِي وَدِيَارِي", red: true },
      { text: "_ هِيَ رُوحِي وَأَجْمَلُ أَقْدَارِي", red: true },
    ],
  },

];

const VideosPage = () => {
  const [selectedCritics, setSelectedCritics] = useState<Record<string, number>>({});
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  const handleCriticClick = (videoId: number, idx: number) => {
    const key = `${videoId}-${idx}`;
    if (!selectedCritics[key]) {
      setSelectedCritics(prev => ({ ...prev, [key]: Math.floor(Math.random() * 31) + 65 }));
    }
  };

  const renderVideo = (url: string, idx: number, videoId: number) => {
    const sourceType = getVideoSourceType(url);
    const key = `${videoId}-${idx}`;

    if (sourceType === 'youtube') {
      const vid = getYouTubeVideoId(url);
      if (!vid) return null;
      return (
        <div key={idx} className="video-wrapper">
          <iframe
            className="video-frame"
            src={`https://www.youtube.com/embed/${vid}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (sourceType === 'gdrive') {
      return (
        <div key={idx} className="video-wrapper">
          <iframe
            className="video-frame"
            src={url.replace('/open', '/preview').replace('/view', '/preview')}
            allowFullScreen
          />
        </div>
      );
    }

    return (
      <video
        key={idx}
        ref={(el) => { videoRefs.current[key] = el; }}
        className="video-player"
        controls
      >
        <source src={url} type="video/mp4" />
      </video>
    );
  };

  return (
    <div dir="rtl" className="page-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700&family=Aref+Ruqaa+Ink:wght@700&display=swap');
        
        /* تعريف خط DG Forsha - تأكد من مسار الملف */
        @font-face {
          font-family: 'DG Forsha';
          src: url('/fonts/DG-Forsha.ttf') format('truetype');
          font-weight: normal;
          font-style: normal;
        }

        .page-container { background: #010416; min-height: 100vh; padding: 40px 20px; font-family: 'Almarai', sans-serif; }
        
        .main-card { max-width: 1100px; margin: 0 auto 80px; background: #050a24; border: 1.5px solid #1a2245; border-radius: 40px; overflow: hidden; position: relative; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        
        .card-header { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
        .song-label { color: #5a6491; font-size: 14px; }
        .category-badge { background: #c9a84c; color: #000; padding: 6px 25px; border-radius: 20px; font-weight: bold; font-size: 14px; }
        
        .video-container { padding: 0 40px; margin-bottom: 30px; }
        .video-wrapper { position: relative; padding-bottom: 50.25%; height: 0; border-radius: 60px; overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.6); }
        .video-frame { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
        .video-player { width: 100%; border-radius: 60px; background: #000; }

        .card-content { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 40px; padding: 0 40px 40px; }
        
        .lyrics-section { display: flex; flex-direction: column; }
        .video-title { color: #ff4d4d; font-family: 'Aref Ruqaa Ink', serif; font-size: 2.5rem; margin: 10px 0; }
        
        /* تعديل حاوية الكلمات لتكون Scroll */
        .lyrics-scroll-container { 
          margin-top: 20px; 
          border-right: 3px solid #c9a84c; 
          padding-right: 20px;
          max-height: 300px; /* طول الـ Scroll */
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #c9a84c transparent;
        }

        /* تنسيق الـ Scrollbar لمتصفحات Chrome/Safari */
        .lyrics-scroll-container::-webkit-scrollbar { width: 5px; }
        .lyrics-scroll-container::-webkit-scrollbar-track { background: transparent; }
        .lyrics-scroll-container::-webkit-scrollbar-thumb { background: #c9a84c; border-radius: 10px; }

        .line { 
          font-family: 'DG Forsha', 'Almarai', sans-serif; /* تطبيق الخط المطلوب */
          font-size: 1.3rem; 
          color: #fff; 
          margin-bottom: 12px; 
          line-height: 1.8; 
          opacity: 0.9; 
        }
        .line.red { color: #ff4d4d; font-weight: bold; }

        .rating-section { background: rgba(255,255,255,0.02); border-radius: 20px; padding: 25px; border: 1px solid rgba(255,255,255,0.05); height: fit-content; }
        .rating-title { color: #5a6491; font-size: 14px; margin-bottom: 15px; display: block; text-align: center; }
        
        .critic-item { background: #0c1233; padding: 12px 20px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #1e2650; display: flex; justify-content: space-between; cursor: pointer; color: #ffffff !important; }
        .critic-percent { color: #c9a84c; font-weight: bold; }
        
        .ok-badge { background: #f0fdf4; color: #1a2e44; padding: 8px 30px; border-radius: 30px; font-weight: bold; float: left; margin-top: 20px; }

        @media (max-width: 900px) { .card-content { grid-template-columns: 1fr; } .video-container { padding: 0 15px; } .main-card { border-radius: 20px; } }
      `}</style>

      {allVideos.map((video) => (
        <div key={video.id} className="main-card">
          <div className="card-header">
            <span className="song-label">Song lyrics</span>
            <div className="category-badge">{video.category || "General"}</div>
          </div>

          <div className="video-container">
            {video.videoUrls?.map((url, idx) => renderVideo(url, idx, video.id))}
          </div>

          <div className="card-content">
            <div className="lyrics-section">
              <span className="song-label">Song lyrics</span>
              <h2 className="video-title">{video.title}</h2>
              <div className="lyrics-scroll-container">
                {video.lyrics?.map((lyric, i) => (
                  <div key={i} className={`line ${lyric.red ? 'red' : ''}`}>{lyric.text}</div>
                ))}
              </div>
            </div>

            <div className="rating-section">
              <span className="rating-title">Critic reviews (click to rate)</span>
              {video.critics?.map((critic, idx) => (
                <div key={idx} className="critic-item" onClick={() => handleCriticClick(video.id, idx)}>
                  <span>{critic}</span>
                  {selectedCritics[`${video.id}-${idx}`] && (
                    <span className="critic-percent">{selectedCritics[`${video.id}-${idx}`]}%</span>
                  )}
                </div>
              ))}
              <div className="ok-badge">{video.views} K</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideosPage;