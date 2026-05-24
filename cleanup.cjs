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

// Map of normalized title to expected data
const refSongs = new Map();
referenceText.split('\n').forEach(line => {
  if (!line.trim()) return;
  const parts = line.split(':');
  if (parts.length < 2) return;
  let category = parts[0].trim();
  // We use "دراما" in the reference text above.
  
  const songs = parts[1].split('،').map(s => s.trim()).filter(Boolean);
  songs.forEach(song => {
    // Normalization mapping to help catch variations
    refSongs.set(normalize(song), { title: song, type: category });
  });
});

let content = fs.readFileSync('src/data/lyricsSongs.ts', 'utf8');

// Manual fixes BEFORE parsing blocks:
// 1. Fix the double "Master" issue (ID 48 overwritten)
let lines = content.split('\n');
let masterCount = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('title: "Master"')) {
    masterCount++;
    if (masterCount === 1 && lines[i-1] && lines[i-1].includes('id: 48')) {
      // This is the one that used to be قمر هادئ
      lines[i] = lines[i].replace('"Master"', '"قمر هادئ"');
    }
  }
}
content = lines.join('\n');

// 2. Fix the "هادي" to "هادئ" in ID 48 lyrics
// We'll just do a global replace of "قمر هادي" to "قمر هادئ" if it exists, or just "هادي" in that block later.

// Parse the file into an AST-like array of blocks
const blockRegex = /\{\s*id:\s*(\d+),\s*title:\s*["'`](.+?)["'`][\s\S]*?(?=\n\s*\{|\n\s*\])/g;

let match;
let newBlocks = [];
let matchedRefTitles = new Set();
let seenIds = new Set();
let newIdCounter = 1000;

// Read blocks manually
let out = [];
let currentBlock = [];
let insideBlock = false;
let currentNorm = "";
let currentId = -1;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.match(/^\s*\{\s*$/) && lines[i+1] && lines[i+1].match(/^\s*id:\s*\d+,/)) {
    insideBlock = true;
    currentBlock = [line];
    currentNorm = "";
    currentId = -1;
    continue;
  }
  
  if (insideBlock) {
    currentBlock.push(line);
    const idMatch = line.match(/^\s*id:\s*(\d+),/);
    if (idMatch) currentId = parseInt(idMatch[1]);
    
    const titleMatch = line.match(/^\s*title:\s*["'`](.+?)["'`]/);
    if (titleMatch) currentNorm = normalize(titleMatch[1]);

    if (line.match(/^\s*\},?\s*$/)) {
      // End of block
      insideBlock = false;
      
      let expected = refSongs.get(currentNorm);
      
      // Some manual fallbacks if normalize didn't match perfectly
      if (!expected) {
        if (currentNorm === normalize("عايش عشانكمعاليك")) expected = refSongs.get(normalize("عايش عشانك"));
      }

      if (expected) {
        matchedRefTitles.add(currentNorm);
        
        let blockStr = currentBlock.join('\n');
        
        // Correct the type
        blockStr = blockStr.replace(/type:\s*["'`](.+?)["'`]/, `type: "${expected.type}"`);
        // Correct the title
        blockStr = blockStr.replace(/title:\s*["'`](.+?)["'`]/, `title: "${expected.title}"`);
        
        // Ensure ID is unique
        if (seenIds.has(currentId)) {
           currentId = newIdCounter++;
           blockStr = blockStr.replace(/id:\s*\d+,/, `id: ${currentId},`);
        }
        seenIds.add(currentId);

        // Fixes inside lyrics
        if (expected.title === "قمر هادئ") {
          blockStr = blockStr.replace(/هادي/g, "هادئ");
        }

        out.push(blockStr);
      } else {
        console.log(`DELETING Extra Song: ${currentBlock.find(l => l.includes('title:'))}`);
      }
    }
  } else {
    // Keep parts of the file outside the array (imports, array declaration, etc)
    if (!line.match(/^\s*\},?\s*$/)) {
       // Wait, we need to carefully reconstruct the file
    }
  }
}

// Since parsing by lines can be fragile if not perfect, let's just use string replace or a better parser.
// Actually, using a regex over the entire content is safer for replacing blocks.
