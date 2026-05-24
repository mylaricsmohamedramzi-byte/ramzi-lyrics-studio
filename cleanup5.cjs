const fs = require('fs');

const referenceText = `كلاسيك: لو نسيتني، مرسال، معرفش ليه، وعدّي الليل، أبات اقول، وملكنا الحب، حُبّ ومودة، وأما قابلتك
رومانسي: عايش عشانك، حصل خير، حاجة تانيه
رومانسي مقسوم: يعمل ما بداله، ما يُقع إلا الشاطر، من غير تفكير، مش طبيعي، سمّعني، أتفضل
سلو: أيه رأيك، صفحة جديده، حظي الحلو، وش الخير، كتّر خيرها
بوب: لو خطّي، معايا ما يُثبت، قلبي إتورّط، بُرج الميزان، سنّه سنّه
روك: مجنني، بيني و بينك، قمر هادئ، هوا فيه أيه، حُبك مش ذنبي، دور بطولي، لو بايدي، دُنيا عتمه
تراب: كبير بالفعل، بالتراضي، Master
راب: الحال العام
مقسوم: كان كابوس، متوتر، عندي مناعه، قمر الليل، أخر صبري، قلبي عندك، إتجوزت رسمي، مهما أستجدع، جماله عربي، براحته يتشرط، عمّ الجنيني، يا سيدي
شعبي: رقصوا كل الناس، عجبي عليك يا زمن، قولوا آمين، كله هيتحاسب، محدش له جِميله علينا، أضحك يا عمّ، المركب مشيت، تلميذ بليد، دنيا مظاهر
دراما: كلو بيمثّل، تجربه عديتها، طلعنا كدابيين، الدنيا بتعلم، من قلبي حبيته، موضوع وخلص، أدينا عايشين، أعذارك قدمت، أخر فرصة، أصح قرار، أكتر حد فاهمني، زي ضلي، فاكرني لعبة
صعيدي: والله هويته
طرب: نفسي أسمع كلامك، سحرتني و الله، القلب داعي، حقك تستغرب، من الساعة دي، كلام جد، كل ما أقرّب، علي بحر غرامك، حالة نادرة، نيّتي خير
قصائد: حائر القلب
وطني: إبن النيل
تحفيزية: مفتاح الحياة، مش هوقّف، سوبر هيرو، طوق نجاه
إجتماعي& عائلي: ست الكل`;

const DIACRITICS_RE = /[\u064B-\u065F\u0670\u0640]/g;
function normalize(input) {
  if (!input) return '';
  return input
    .toString()
    .normalize('NFKD')
    .replace(DIACRITICS_RE, '')
    .replace(/[\u0622\u0623\u0625\u0622]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
}

const refSongs = new Map();
referenceText.split('\n').forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(':');
  if (parts.length < 2) return;
  let category = parts[0].trim();
  const songs = parts[1].split('،').map(s => s.trim()).filter(Boolean);
  songs.forEach(song => {
    refSongs.set(normalize(song), { title: song, type: category });
  });
});

let content = fs.readFileSync('src/data/lyricsSongs.ts', 'utf8');

// Strip out TS types from the array string to eval it
let arrayString = content.replace('export const allSongs: any[] = ', '');
arrayString = arrayString.replace(/;\s*$/, ''); // remove trailing semicolon

// It's still valid JS since we stripped the TS type declaration
let allSongs = eval(arrayString);

let finalSongs = [];
let nextId = 1;
let matchedNorms = new Set();
let foundMaster = 0;

for (let song of allSongs) {
  let norm = normalize(song.title);
  
  if (song.title === "عايش عشانكمعاليك") norm = normalize("عايش عشانك");
  if (song.title === "Master") {
    foundMaster++;
    if (foundMaster === 1) { // The one that was overwritten (قمر هادئ)
       norm = normalize("قمر هادئ");
    } else {
       norm = normalize("Master");
    }
  }

  let expected = refSongs.get(norm);
  if (expected) {
    matchedNorms.add(norm);
    song.id = nextId++;
    song.title = expected.title;
    song.type = expected.type;
    
    if (expected.title === "قمر هادئ" && song.lyrics) {
      song.lyrics.forEach(l => {
        l.text = l.text.replace(/هادي/g, "هادئ");
      });
    }

    finalSongs.push(song);
  } else {
    console.log(`DELETED: ${song.title}`);
  }
}

console.log(`Matched ${matchedNorms.size} songs.`);

const finalStr = `export const allSongs: any[] = ${JSON.stringify(finalSongs, null, 2)};\n`;
fs.writeFileSync('src/data/lyricsSongs.ts', finalStr, 'utf8');

// We also need to fix 'درامة' to 'دراما' globally.
const filesToFix = ['src/pages/LyricsPage.tsx', 'src/pages/SongsPage.tsx', 'src/pages/MelodiesPage.tsx'];
for (let f of filesToFix) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/درامة/g, 'دراما');
    fs.writeFileSync(f, c, 'utf8');
  }
}
console.log("Renamed 'درامة' to 'دراما' globally.");
