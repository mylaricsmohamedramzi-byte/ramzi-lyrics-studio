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

// The file format is export const allSongs: any[] = [ { ... }, { ... } ];
// Let's match all song blocks.
const songRegex = /\{\s*id:\s*(\d+),\s*title:\s*["'`](.+?)["'`][\s\S]*?(?=\n  \},\n  \{|\n  \}\n\];)/g;

let match;
let finalBlocks = [];
let matchedNorms = new Set();
let nextId = 1;

while ((match = songRegex.exec(content)) !== null) {
  let block = match[0];
  const oldTitle = match[2];
  let norm = normalize(oldTitle);

  // Manual fallback for names that don't perfectly normalize match if there's an issue
  if (oldTitle === "عايش عشانكمعاليك") norm = normalize("عايش عشانك");
  if (oldTitle === "Master" && block.includes('type: "تراب"')) {
    // If it's the real Master
    norm = normalize("Master");
  } else if (oldTitle === "Master" && block.includes('قمر هادي')) {
    // Wait, earlier the ID 48 collision replaced "قمر هادئ" with "Master" but its lyrics have "قمر هادي"
    norm = normalize("قمر هادئ");
  }

  const expected = refSongs.get(norm);
  
  if (expected) {
    matchedNorms.add(norm);
    
    // Correct type and title
    block = block.replace(/type:\s*["'`](.+?)["'`]/, `type: "${expected.type}"`);
    block = block.replace(/title:\s*["'`](.+?)["'`]/, `title: "${expected.title}"`);
    
    // Ensure sequential ID
    block = block.replace(/id:\s*\d+,/, `id: ${nextId++},`);
    
    // Custom fix for "قمر هادئ"
    if (expected.title === "قمر هادئ") {
      block = block.replace(/هادي/g, "هادئ");
    }

    finalBlocks.push(block);
  } else {
    console.log(`Removed extra song: ${oldTitle}`);
  }
}

console.log(`\nMatched ${matchedNorms.size} out of ${refSongs.size} reference songs.`);

// What is missing?
for (let [norm, ref] of refSongs.entries()) {
  if (!matchedNorms.has(norm)) {
    console.log(`Missing in code (Will need to be added manually later if no data exists): ${ref.title}`);
  }
}

// Assemble the final file content
const finalContent = `export const allSongs: any[] = [\n  ${finalBlocks.join(',\n  ')}\n];\n`;
fs.writeFileSync('src/data/lyricsSongs.ts', finalContent, 'utf8');

// Also update `درامة` to `دراما` everywhere
// (This is already handled because the referenceText uses `دراما` and sets expected.type to `دراما`.)
