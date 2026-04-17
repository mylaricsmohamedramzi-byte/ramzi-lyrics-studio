import { useState } from 'react';
import { useLang } from '@/contexts/LangContext';

type LyricLine = { text: string; red?: boolean };
type Method = {
  number: string;
  title: { ar: string; en: string };
  subtitle: { ar: string; en: string };
  description: { ar: React.ReactNode; en: React.ReactNode };
  songName?: string;
  lyrics: LyricLine[];
};

const methods: Method[] = [
  {
    number: '١',
    title: { ar: 'الإلهام الفجائي', en: 'Sudden Inspiration' },
    subtitle: { ar: 'لحظة من العدم', en: 'A moment from nothing' },
    description: {
      ar: (
        <div className="method-text">
          هيا إني أكون بعمل أي حاجه و فجأه ربنا يلهمني بكلام و ممكن يكون: <br />
          <span className="cyan">• مجرد سطر:</span>
          <br /><br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• خلينا نكون واضحيين .. أحنا معدناش قادرين</span>
          <br /><br />
          <span className="cyan">• أو كوبليه:</span>
          <br /><br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• تسمح لي أكون ف حياتك ..... وأشغل معظم أوقاتك</span><br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• و أتكلم وقت سكاتك .... و أفضفض وأحكي معاك</span><br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• تسمح لي أقول لجنابك ..... أنا قلبي وأقف على بابك</span><br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• دايب ولهان في غرامك ..... نفسه أنه يقرب ليك</span>
          <br /><br />
          وفي الحالتين أنا بكمل عليهم لحد ميبقو أغنيه كامله.
        </div>
      ),
      en: (
        <div className="method-text">
          It's when I'm doing anything and suddenly God inspires me with words, which might be: <br />
          <span className="cyan">• Just a single line</span>
          <br /><br />
          <span className="cyan">• Or a full verse</span>
          <br /><br />
          In both cases, I keep building on them until they become a complete song.
        </div>
      ),
    },
    songName: 'على نور',
    lyrics: [
      { text: '' }, { text: '' },
      { text: 'خلينا نكون واضحين .. إحنا معدناش قادرين' },
      { text: 'نستحمل بعض .. و نوفي بوعد .. حافظنا عليه لسنين' },
      { text: 'خلينا نكون على نور .. وضعنا مبقاش مقبول' },
      { text: 'فرقنا الهم .. كأنه سم .. بيجري في الشرايين' },
      { text: '' },
      { text: 'بقينا عايشين .. و روحنا في دوامه كبيره', red: true },
      { text: 'عنينا سهرانين بيناموا في الأسبوع ليله', red: true },
      { text: 'دا حتى الحنين .. مبقاش يقرب لينا', red: true },
      { text: 'كأن الحياه .. معدتش باقيه علينا', red: true },
      { text: '' },
      { text: 'مشاعرنا خلاص بتموت .. و الشوق مبقاش موجود' },
      { text: 'ومعدش في ود .. ولا فينا حد ... دموعه مش ماليه العين' },
      { text: 'صممنا على النسيان .. وفشلنا فيه هوا كمان' },
      { text: 'عمرنا م نسينا .. و أهو بان علينا ... و إحنا لسه مكابرين' },
      { text: '' },
      { text: 'مين فينا هيحاسب؟ مين.. غلطتنا إحنا الاتنين' },
      { text: 'سيبنا نفسنا تهرب منا ..وبقينا إتنين تانين' },
    ],
  },
  {
    number: '٢',
    title: { ar: 'الكتابة النائمة', en: 'Sleep Writing' },
    subtitle: { ar: 'العقل الباطن يكتب', en: 'The subconscious writes' },
    description: {
      ar: (
        <div className="method-text">
          <span className="cyan">• هيا غريبه شويه:</span>
          <br />
          أني أحاول أنام بس يكون في حاجه في دماغي و أكتشف لما أجرب أكتب أن في كلام عقلي مجمعه
          <br />
          بس أنا مكتبتوش علي ورقه أو علي الفون ولما بكتب الحاجه دي بنام عادي..
          <br />
          علي فكره ممكن يكون أغنيه كامله.
        </div>
      ),
      en: (
        <div className="method-text">
          <span className="cyan">• It's a bit strange:</span>
          <br />
          I try to sleep while something is on my mind, and I discover when I try to write that my mind has gathered words I never wrote down on paper or on the phone — and once I write them, I sleep normally.
          <br />
          By the way, it could even be a complete song.
        </div>
      ),
    },
    songName: 'حبيبي الغالي',
    lyrics: [
      { text: '' }, { text: '' },
      { text: 'علي طول .. جوايا كلام.. معرفش ..أزاي .. أداريه' },
      { text: 'أنا عمري.. في يوم ..  ما أنساه .. لو حتي .. هيحصل أيه' },
      { text: 'ومعذب .. فكري .. الخوف  .. من أني .. مبقاش ليه' },
      { text: 'وأنا مهما..  يعيد ويقول .. هفضل برضه .. أبقي عليه' },
      { text: '' },
      { text: 'دا حبيبي .. و غالي  .. عندي .. وكل .. يوم .. بحبه أكثر', red: true },
      { text: 'لو ليله .. بعد عني .. مقدرش أني .. في غيره أفكر', red: true },
      { text: 'بيزيد.. وصفي وكلامي .. عنه .. وبيزيد أكتير  .. في تفاصيله', red: true },
      { text: 'دا أنا قلبي .. بيطمن يادوب ..  لما .. لما بشوف عينه', red: true },
      { text: '' },
      { text: 'دا حبيبي الغالي .. حبيبي الغالي .. حبيبي و روحي كمان', red: true },
      { text: 'دا في كل دقيقه .. في كل ثواني .. بشوفه في كل مكان', red: true },
      { text: '' },
      { text: 'وبحس أني .. بطير وأسرح .. بخيالي ..  في وسط سماه' },
      { text: 'سحرتني عيناه .. و إرتاحت أنا ليه .. و كأن وجوده حياه' },
      { text: 'سلمت إليه .. روحي دابت فيه.. ضحكت لي .. الدنيا معاه' },
      { text: 'والايام بيه ..  بقت أحلي .. و العين عشقاه .. وبقيت مغرم بهواه' },
    ],
  },
  {
    number: '٣',
    title: { ar: 'الإلهام البصري', en: 'Visual Inspiration' },
    subtitle: { ar: 'مشهد يولد أغنية', en: 'A scene gives birth to a song' },
    description: {
      ar: (
        <div className="method-text">
          <span className="cyan">• دي أشهر واحده:</span>
          <br />
          أني أشوف مشهد من مسلسل أو فيلم ف يأثر فيا
          <br />
          و أحاول أتخيله بطريقه أعمق ف أكتب حاجه عليه زي مثلا المشهد دا كان بيقول فى أخره
          <br />
          <span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>• متحوليش تكرهيني فيكي</span>
          <br />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <iframe
              width="315"
              height="560"
              src="https://www.youtube.com/embed/qldQ8SLGuhU"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            ></iframe>
          </div>
          <br />
          ف أنا كتبت الغنوه دي بنائناً علي الجمله دي.
        </div>
      ),
      en: (
        <div className="method-text">
          <span className="cyan">• This is the most famous one:</span>
          <br />
          I see a scene from a series or a film and it affects me. I try to imagine it more deeply, then I write something inspired by it. For example, this scene ended with the line:
          <br />
          <span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>• "Don't make yourself hate me"</span>
          <br />
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <iframe
              width="315"
              height="560"
              src="https://www.youtube.com/embed/qldQ8SLGuhU"
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
            ></iframe>
          </div>
          <br />
          So I wrote this song based on that single sentence.
        </div>
      ),
    },
    songName: 'عيونك فضحاكي',
    lyrics: [
      { text: '' }, { text: '' },
      { text: 'متحوليش تكرهيني فيكي' },
      { text: 'عشان أنا من قلبي دا شاريكي' },
      { text: 'ومن زمان وأنا مغرم بيكي' },
      { text: ' بس إنتي مش حاسه' },
      { text: '' },
      { text: 'متحوليش توضحي لي حاجه' },
      { text: 'أنا مش هبعد عنك إستحاله' },
      { text: 'كل سؤال أنا عندي ليه إجابه' },
      { text: ' بس إنتي أديني فرصه' },
      { text: '' },
      { text: 'متقفليش كل البيبان قدامي', red: true },
      { text: 'مترفضيش روحي اللي عاوزاكي', red: true },
      { text: ' و متخليش الفرح ينساكي', red: true },
      { text: 'مهما تداري عيونك برضه فضحاكي', red: true },
      { text: '' },
      { text: 'محتاره ليه أطمني أنا معاكي' },
      { text: ' يا أحلي نجمة عيوني شايفاكي' },
      { text: 'وعد مني هيبقا كل همي رضاكي' },
      { text: ' لا هزعلك ولا هقسي  مرَّه عليكي' },
      { text: '' },
      { text: 'دا اللي ما بينا عباره عن أجمل حكايه' },
      { text: 'ومش ناقصها حاجه غير فصل النهايه' },
      { text: 'دورك فيها  أنك تحْلي دُنيايا' },
      { text: ' و دوري فيها أخليكي مرتاحه  معايا' },
    ],
  },
  {
    number: '٤',
    title: { ar: 'وصف الجمال', en: 'Describing Beauty' },
    subtitle: { ar: 'الشكل والروح معاً', en: 'Form and soul together' },
    description: {
      ar: (
        <div className="method-text">
          أشوف بنت جميله و أوصف جمالها ك شكل أو ك روح. <br />
          <span className="cyan">• ممكن أتكلم عن صفات البنت بوجه عام:</span>
          <br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• ويلي يابا من شخصيتها ..... و من أخلاقها و شطارتها</span>
          <br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• وليبهلل في طبيعتها .. ربي يخليها و من العين يحميها</span>
          <br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• كفاية عفوية ضحكتها</span>
          <br />
          <span className="cyan">• لو بنوته صغيره:</span>
          <br />
          ممكن أشوف بنوته صغيره معرفهاش خالص وتكون لابسه فستان شيك وشكلها حلو فأروح قايل!
          <br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• عيني عليكي برده أيه الجمال دا.. حلوه مفيش غلطه آه يا فلته</span>
          <br />
          <span className="cyan" style={{ color: 'rgb(7, 140, 31)' }}>• شايفين الطلة يا ماشاء الله .. قلبي سبني وله إليها والله</span>
        </div>
      ),
      en: (
        <div className="method-text">
          I see a beautiful girl and describe her beauty — either her appearance or her soul. <br />
          <span className="cyan">• I might describe a girl's traits in general:</span>
          <br />
          her personality, her morals, her cleverness, her natural grace, even just the spontaneity of her laugh.
          <br /><br />
          <span className="cyan">• Or it could be a young child:</span>
          <br />
          I might see a little girl I don't know at all, wearing an elegant dress and looking lovely — and the words just pour out of me describing her.
        </div>
      ),
    },
    songName: 'مش ملاحظة',
    lyrics: [
      { text: '' }, { text: '' },
      { text: 'عيني عليكي برده أيه الجمال دا' },
      { text: 'حلوه مفيش غلطة أه يا فلته' },
      { text: 'شايفين الطلة يا ماشاء الله' },
      { text: 'قلبي سبني وله إليها والله' },
      { text: '' },
      { text: 'في البستان أنتي أحلي وردة' },
      { text: ' حالة بتفاصيلها منفريدة' },
      { text: 'عقلي كان قتيل النهارده' },
      { text: 'بس لما شفتك راق وهدي' },
      { text: '' },
      { text: 'أنتي نجمة مش بنلقي منها كتير', red: true },
      { text: 'نجمة وُحد بس سايبه 100 تأثير', red: true },
      { text: 'الكلام ده كله جد مش تحوير', red: true },
      { text: 'اللي يزعل القمر ده يبقا مش أصيل', red: true },
      { text: '' },
      { text: 'نظرة واحده منها بدمنها' },
      { text: 'نفسي أكون نصيبها وأعجبها' },
      { text: 'كل لحظة بتزيد حلاوتها' },
      { text: ' لسه مش ملاحظة أني حاببها' },
      { text: '' },
      { text: 'مش هسيبها واقف علي بابها' },
      { text: 'عمري يوم م هقدر أتعبها' },
      { text: 'لو ف أيه تفكر هيجلها' },
      { text: 'هل باجي في بالها بسألها ؟' },
    ],
  },
  {
    number: '٥',
    title: { ar: 'الكتابة المقصودة', en: 'Intentional Writing' },
    subtitle: { ar: 'خطوات منهجية', en: 'A methodical process' },
    description: {
      ar: (
        <div className="method-text">
          هيا أني أقعد و أقرر أني هكتب أغنيه ساعتها ببدأ أعمل كام حاجه وهما: <br />
          <span className="cyan">1_ أدور علي فكره:</span>
          <br />
          خلينا نقول أني أخترت أتكلم عن فكرة الأشخاص اللي بتظهر ف حياتنا من العدم وتقرب مننا في وقت قليل جداً وتدّعي أننا غالين عندها وكدا، وبمجرد ما توصل لحاجه معينه مننا بتختفي تاني وكأنها عرفانه
          (<span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>الناس بتاعة المصلحه و بس</span>). <br /><br />
          <span className="cyan">2_ أقرر الحالة:</span>
          <br />
          يعني أقرر هتكون حزينه ولا فيها بهجه، وساعتها لازم أجاوب علي سؤال من دول:
          <br />
          <span className="cyan" style={{ color: 'rgb(200, 50, 70)' }}>-- هل أنا عاوز أوصل أني متضايق فعلاً من اللي عمل كدا معايا؟</span>
          <br />
          <span className="cyan">• ولا</span>
          <br />
          <span className="cyan" style={{ color: 'rgb(200, 50, 70)' }}>-- هل أنا عاوز أوصل أني مش متأثر خالص و حياتي تمام؟</span>
          <br /><br />
          <span className="cyan">3_ أشوف هتكون سريعه أم بطيئه:</span>
          <br />
          طب أنا بعمل كدا إزاي؟ الإجابة هيا
          <span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}> • اللحن </span>
          ، وهو الطريقة اللي بحول بيها الكلام من مجرد جملة لحاجة بتولد مشاعر تأثر أو فرح. <br />
          <span className="cyan">4_ أبدأ أكتب الكلمات المفتاحية:</span>
          <br />
          زي (عامل بيحبنا - مش قد كلمة - أنه شخصية رخيصة). <br />
          <span className="cyan">5_ الصياغة النهائية:</span>
          <br />
          أرجع أكتب تاني بطريقة منظمة متوافقة مع مبادئ الكتابة، لحد ما أوصل لأغنيه كامله.
        </div>
      ),
      en: (
        <div className="method-text">
          This is when I sit down and decide I'm going to write a song. I then go through several steps: <br />
          <span className="cyan">1_ Find an idea:</span> e.g. writing about opportunistic people who appear in our lives, get close fast, then disappear once they get what they want. <br /><br />
          <span className="cyan">2_ Decide the mood:</span> Will it be sad or joyful? I have to answer one of two questions — am I trying to show that I'm truly hurt, or that I'm completely unaffected and life is great? <br /><br />
          <span className="cyan">3_ Decide the pace:</span> fast or slow — and the <span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>melody</span> is what turns words into emotion. <br />
          <span className="cyan">4_ Write the keywords</span> that anchor the song. <br />
          <span className="cyan">5_ Final draft:</span> Rewrite everything in an organized way, following the principles of songwriting, until it becomes a complete song.
        </div>
      ),
    },
    songName: 'عرض خاص',
    lyrics: [
      { text: '' }, { text: '' },
      { text: 'مش دا اللي كان عامل بيحبنا' },
      { text: ' وبدون مُبرر راح وفارق قلبنا' },
      { text: 'دلوقتي جاي يقول إنَّه مُشتاق لنا' },
      { text: ' مع إِن الغلطة عنده ومش عندنا' },
      { text: '' },
      { text: 'مغرُور أوي وغُروره دا اللي وقعُه' },
      { text: ' حذرتُه وكلامي مرضيش يسمعُه' },
      { text: 'بيقول أعذار مش مَقنعين وَلَا ينفعُه' },
      { text: 'أنا قلبي كان معاه وأختار يضيعُه' },
      { text: '' },
      { text: 'بطلنا خلاص نشتري في الرخص', red: true },
      { text: 'قررنا نبيعهم وعملنا عرض خاص', red: true },
      { text: 'أشتري بيَاع وَ وَاحِدْ مَالُوش عزاز', red: true },
      { text: 'هتاخد عليهم واحِد مَعْدُومَ الإحساس', red: true },
      { text: '' },
      { text: 'كان بيقول حاجه وبيعمل عكسها' },
      { text: 'وعمايله فعلَا زادت عن حدّها' },
      { text: 'كان فيه شروط معملهاش كُلها' },
      { text: 'إيدانا كلمه مطلعنش قدّاها' },
      { text: '' },
      { text: 'كان عامل طيب و فاكرني هصدقه' },
      { text: 'و أهو برضه طمعه كشفه و غرقه' },
      { text: 'رغم أنه عارف إني بعشقه' },
      { text: 'دلوقتي إسمه مبقتش بنطقه' },
      { text: '' },
      { text: 'لا مستحيل قلبنا يضعف  و يميل', red: true },
      { text: 'عدينا كتير و أهو مطلعش أصيل', red: true },
      { text: 'من أجل جنابُه ياما دخلنا في مواويل', red: true },
      { text: 'بقا دي أخرتها بقا دا رد الجِميل', red: true },
    ],
  },
  {
    number: '٦',
    title: { ar: 'الكتابة علي اللحن', en: 'Writing to a Melody' },
    subtitle: { ar: 'السلاح ذو الحدين', en: 'A double-edged sword' },
    description: {
      ar: (
        <div className="method-text">
          <span className="cyan">1 - الطريقه الطبيعيه:</span>
          <br />
          الملحن بيبعت اللحن سواء هوا عزفه علي الجيتار أو عود <br />
          <span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>• و دا بيكون ميزه ليّه</span>
          <br />
          لانه بيكون مبين هل الاغنيه هتكون حزينه أم مبهجة وبالتالي بعرف أنا هكتب كلام بيعبر عن أي حاله.
          <br />
          الاول أنا بسمع اللحن كامل أكتر من مره وبعد كده أبدأ أسمع كل جزء كويس وأكتب الكلام عليه.
          <br /><br />
          <span className="cyan">2 - السرقه اللحنيه:</span>
          <br />
          (<span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>ودي منتشره جدا في أغاني المهرجانات</span>). <br /><br />
          بيكون في حالتين:
          <br />
          <span className="cyan" style={{ color: 'rgb(200, 50, 70)' }}>-- أن الكاتب يتبعت له اللحن ويطلب منه يكتب عليه من غير ما يكون عارف أنه مسروق</span>
          <br />
          ودا من الأسباب اللي بتخليني مُجبر أسمع كل الأغاني اللي بتنزل والقديمه كمان، وبالتالي لو حد بعت حاجه هقدر أحدد هل مسروقه أم لا.
          <br />
          <span className="cyan">• تاني حاله</span>
          <br />
          <span className="cyan" style={{ color: 'rgb(200, 50, 70)' }}>-- بيكون الكاتب مطلوب منه يكتب علي لحن أغنيه معينه عشان الأغنيه دي نجحت</span>
        </div>
      ),
      en: (
        <div className="method-text">
          <span className="cyan">1 - The natural way:</span>
          <br />
          The composer sends the melody — played on guitar or oud.
          <br />
          <span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>• And this is an advantage for me</span>
          <br />
          because it already shows whether the song will be sad or joyful, so I know what kind of words to write. I listen to the full melody several times, then I focus on each section and write the lyrics over it.
          <br /><br />
          <span className="cyan">2 - Melodic theft:</span>
          <br />
          (<span className="cyan" style={{ color: 'rgb(29, 49, 243)' }}>very common in mahraganat songs</span>). <br /><br />
          It happens in two cases:
          <br />
          <span className="cyan" style={{ color: 'rgb(200, 50, 70)' }}>-- The writer receives the melody and is asked to write lyrics without knowing it has been stolen.</span>
          <br />
          That's one of the reasons I'm forced to listen to every new and old song so that I can tell if a melody sent to me is stolen.
          <br />
          <span className="cyan" style={{ color: 'rgb(200, 50, 70)' }}>-- The writer is asked to write lyrics over the melody of a successful song on purpose.</span>
        </div>
      ),
    },
    lyrics: [],
  },
];

const SongwritingArtPage = () => {
  const { lang } = useLang();
  const [active, setActive] = useState<number | null>(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Aref+Ruqaa+Ink:wght@700&family=Tajawal:wght@400;700&display=swap');

        @font-face {
          font-family: 'DG Forsha';
          src: local('DG Forsha'), local('DG-Forsha'), url('/fonts/DG-Forsha.ttf') format('truetype');
          font-display: swap;
        }

        .swa-root {
          --deep-burgundy: rgb(53, 3, 3);
          --silver: rgb(192, 192, 192);
          --leather-black: rgba(40, 9, 13, 1);
          --gold: #c9a84c;
          --cyan: #4cc9f0;
          --red: #ff4d4d;
        }

        .swa-grain-overlay {
          position: absolute;
          inset: 0;
          background-image: url('https://www.transparenttextures.com/patterns/leather.png');
          opacity: 0.35;
          pointer-events: none;
          z-index: 1;
        }

        .swa-container {
          min-height: 100vh;
          background: radial-gradient(circle at center, rgb(103, 6, 6) 0%, var(--leather-black) 100%);
          font-family: 'Tajawal', sans-serif;
          color: white;
          padding: 80px 20px;
          position: relative;
        }

        .swa-heading {
          font-family: 'Almarai', sans-serif;
          font-size: clamp(35px, 7vw, 70px);
          text-align: center;
          color: var(--gold);
          margin-bottom: 16px;
          text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.54);
          position: relative;
          z-index: 10;
        }

        .swa-subheading {
          text-align: center;
          color: var(--silver);
          font-family: 'Almarai', sans-serif;
          opacity: 0.85;
          margin-bottom: 60px;
          position: relative;
          z-index: 10;
        }

        .swa-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 30px;
          max-width: 1300px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        .swa-card {
          background: rgba(15, 2, 2, 0.85);
          border: 1px solid rgba(201, 168, 76, 0.2);
          padding: 35px;
          cursor: pointer;
          transition: 0.4s;
          position: relative;
          border-radius: 6px;
        }

        .swa-card:hover { border-color: var(--gold); transform: translateY(-5px); }

        .swa-bg-number {
          font-family: 'Almarai', sans-serif;
          font-size: 80px;
          opacity: 0.15;
          position: absolute;
          top: 0;
          left: 15px;
          color: var(--gold);
        }

        .swa-card-title { font-family: 'Almarai', sans-serif; font-size: 28px; color: var(--gold); margin-bottom: 15px; }
        .method-text { line-height: 2; font-size: 16px; color: var(--silver); margin-bottom: 25px; }
        .method-text .cyan { color: var(--cyan); font-weight: 800; }

        .swa-song-reveal {
          max-height: 0;
          overflow: hidden;
          transition: max-height 1s ease-in-out;
        }

        .swa-card.active .swa-song-reveal {
          max-height: 5000px;
          padding-top: 30px;
          border-top: 2px solid var(--gold);
          margin-top: 20px;
        }

        .swa-song-header {
          font-family: 'Aref Ruqaa Ink', serif;
          font-size: 34px;
          color: var(--gold);
          margin-bottom: 25px;
          text-align: center;
          direction: rtl;
        }

        .swa-lyric-line {
          font-family: 'DG Forsha', 'Aref Ruqaa Ink', serif;
          font-size: 24px;
          margin-bottom: 12px;
          padding-right: 15px;
          border-right: 4px solid var(--gold);
          direction: rtl;
          text-align: right;
        }

        .swa-lyric-line.is-red {
          color: var(--red);
          border-right-color: var(--red);
          font-weight: 900;
        }

        .swa-spacer { height: 20px; border-right: none; }

        @media (max-width: 900px) {
          .swa-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="swa-root">
        <div className="swa-container" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <div className="swa-grain-overlay" />
          <h1 className="swa-heading">
            {lang === 'ar' ? 'فن كتابة الأغنية' : 'The Art of Songwriting'}
          </h1>
          <p className="swa-subheading">
            {lang === 'ar'
              ? 'تعلم أساليب وتقنيات كتابة الأغاني'
              : 'Learn songwriting methods and techniques'}
          </p>

          <div className="swa-grid">
            {methods.map((m, idx) => (
              <div
                key={idx}
                className={`swa-card ${active === idx ? 'active' : ''}`}
                onClick={() => setActive(active === idx ? null : idx)}
              >
                <div className="swa-bg-number">{m.number}</div>
                <h2 className="swa-card-title">
                  {lang === 'ar' ? m.title.ar : m.title.en}
                </h2>
                <div style={{ color: 'var(--gold)', opacity: 0.6, fontSize: '13px', marginBottom: '15px' }}>
                  {lang === 'ar' ? m.subtitle.ar : m.subtitle.en}
                </div>
                <div className="method-text">
                  {lang === 'ar' ? m.description.ar : m.description.en}
                </div>

                {m.lyrics.length > 0 && (
                  <div className="swa-song-reveal">
                    {m.songName && <h3 className="swa-song-header">{m.songName}</h3>}
                    <div>
                      {m.lyrics.map((l, i) => (
                        <div
                          key={i}
                          className={`swa-lyric-line ${l.red ? 'is-red' : ''} ${l.text === '' ? 'swa-spacer' : ''}`}
                        >
                          {l.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default SongwritingArtPage;
