const fs = require('fs');

const referenceText = `كلاسيك: لو نسيتني، مرسال، معرفش ليه، وعدّي الليل، أبات اقول، وملكنا الحب، حُبّ ومودة، وأما قابلتك
رومانسي: عايش عشانك، حصل خير، حاجة تانيه
رومانسي & مقسوم: يعمل ما بداله، ما يُقع إلا الشاطر، من غير تفكير، مش طبيعي، سمّعني، أتفضل
سلو: أيه رأيك، صفحة جديده، حظي الحلو، وش الخير، كتّر خيرها
بوب: لو خطّي، معايا ما يُثبت، قلبي إتورّط، بُرج الميزان، سنّه سنّه
روك: مجنني، بيني و بينك، قمر هادئ، هوا فيه أيه، حُبك مش ذنبي، دور بطولي، لو بايدي، دُنيا عتمه
تراب: كبير بالفعل، بالتراضي، Master
راب: الحال العام
مقسوم: كان كابوس، متوتر، عندي مناعه، قمر الليل، أخر صبري، قلبي عندك، إتجوزت رسمي، مهما أستجدع، جماله عربي، براحته يتشرط، عمّ الجنيني، يا سيدي
شعبي: رقصوا كل الناس، عجبي عليك يا زمن، قولو اميين، كله هيتحاسب، محدش له جِميله علينا، أضحك يا عمّ، المركب مشيت، تلميذ بليد، دنيا مظاهر
درامة: كلو بيمثّل، تجربه عديتها، طلعنا كدابيين، الدنيا بتعلم، من قلبي حبيته، موضوع وخلص، أدينا عايشين، أعذارك قدمت، أخر فرصة، أصح قرار، أكتر حد فاهمني، زي ضلي، فاكرني لعبة
صعيدي: والله هويته
طرب: نفسي أسمع كلامك، سحرتني و الله، القلب داعي، حقك تستغرب، من الساعة دي، كلام جد، كل ما أقرّب، علي بحر غرامك، حالة نادرة، نيّتي خير
قصائد: حائر القلب
وطني: إبن النيل
تحفيزية: مفتاح الحياة، مش هوقّف، سوبر هيرو، كوق نجاه
إجتماعي& عائلي: ست الكل`;

const DIACRITICS_RE = /[\u064B-\u065F\u0670\u0640]/g;
function normalize(input) {
  if (!input) return '';
  return input
    .toString()
    .normalize('NFKD')
    .replace(DIACRITICS_RE, '')
    .replace(/[\u0622\u0623\u0625]/g, '\u0627')
    .replace(/\u0649/g, '\u064A')
    .replace(/\u0629/g, '\u0647')
    .replace(/\u0624/g, '\u0648')
    .replace(/\u0626/g, '\u064A')
    .replace(/\s+/g, '')
    .toLowerCase()
    .trim();
}

// Parse Reference
const refSongs = [];
referenceText.split('\n').forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(':');
  if (parts.length < 2) return;
  const category = parts[0].trim();
  const songs = parts[1].split('،').map(s => s.trim()).filter(Boolean);
  songs.forEach(song => {
    refSongs.push({ title: song, type: category, norm: normalize(song) });
  });
});

// Parse Code
const content = fs.readFileSync('src/data/lyricsSongs.ts', 'utf8');
const lines = content.split('\n');
const codeSongs = [];
let currentTitle = null;
let currentType = null;
let currentId = null;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  const idMatch = line.match(/^\s*"?id"?\s*:\s*(\d+)/);
  const titleMatch = line.match(/^\s*"?title"?\s*:\s*["'`](.+?)["'`]/);
  const typeMatch = line.match(/^\s*"?type"?\s*:\s*["'`](.+?)["'`]/);
  
  if (idMatch) currentId = parseInt(idMatch[1]);
  if (titleMatch) currentTitle = titleMatch[1].trim();
  if (typeMatch) currentType = typeMatch[1].trim();
  
  if (currentTitle && currentType && currentId !== null) {
    codeSongs.push({ id: currentId, title: currentTitle, type: currentType, norm: normalize(currentTitle) });
    currentTitle = null;
    currentType = null;
    currentId = null;
  }
}

console.log(`Reference Count: ${refSongs.length}`);
console.log(`Code Count: ${codeSongs.length}\n`);

// Check missing in code
const missing = [];
refSongs.forEach(rs => {
  const found = codeSongs.find(cs => cs.norm === rs.norm);
  if (!found) missing.push(rs);
});

// Check extra in code
const extra = [];
codeSongs.forEach(cs => {
  const found = refSongs.find(rs => rs.norm === cs.norm);
  if (!found) extra.push(cs);
});

console.log("=== MISSING IN CODE ===");
if (missing.length === 0) console.log("None! All reference songs are in code.");
else missing.forEach(m => console.log(`- [${m.type}] ${m.title}`));

console.log("\n=== EXTRA IN CODE ===");
if (extra.length === 0) console.log("None! No extra songs in code.");
else extra.forEach(e => console.log(`- [${e.type}] ${e.title}`));
