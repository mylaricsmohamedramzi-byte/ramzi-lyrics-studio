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

let lines = fs.readFileSync('src/data/lyricsSongs.ts', 'utf8').split('\n');

let currentBlock = [];
let insideSong = false;
let braceCount = 0;
let finalLines = [];

// Keep header
let i = 0;
while (i < lines.length && !lines[i].includes('export const allSongs: any[] = [')) {
  finalLines.push(lines[i]);
  i++;
}
finalLines.push(lines[i]); // export const allSongs: any[] = [
i++;

let matchedCount = 0;
let nextId = 1;

while (i < lines.length) {
  let line = lines[i];
  
  // If it's the end of the array, just stop
  if (line.match(/^\];?$/)) {
    break;
  }
  
  if (line.trim() === '{' && braceCount === 0) {
    insideSong = true;
    currentBlock = [line];
    braceCount++;
  } else if (insideSong) {
    currentBlock.push(line);
    if (line.includes('{')) braceCount++;
    if (line.includes('}')) braceCount--;
    
    if (braceCount === 0) {
      insideSong = false;
      // We have a full song block
      let blockStr = currentBlock.join('\n');
      let titleMatch = blockStr.match(/title:\s*["'`](.+?)["'`]/);
      
      if (titleMatch) {
        let oldTitle = titleMatch[1];
        let norm = normalize(oldTitle);

        if (oldTitle === "عايش عشانكمعاليك") norm = normalize("عايش عشانك");
        if (oldTitle === "Master" && blockStr.includes('type: "تراب"')) {
          norm = normalize("Master");
        } else if (oldTitle === "Master" && blockStr.includes('قمر هادي')) {
          norm = normalize("قمر هادئ");
        }

        let expected = refSongs.get(norm);
        
        if (expected) {
          matchedCount++;
          // Apply fixes
          blockStr = blockStr.replace(/type:\s*["'`](.+?)["'`]/, `type: "${expected.type}"`);
          blockStr = blockStr.replace(/title:\s*["'`](.+?)["'`]/, `title: "${expected.title}"`);
          blockStr = blockStr.replace(/id:\s*\d+,/, `id: ${nextId++},`);
          
          if (expected.title === "قمر هادئ") {
             blockStr = blockStr.replace(/هادي/g, "هادئ");
          }
          
          finalLines.push(blockStr);
          finalLines.push(','); // add comma between objects
        } else {
          console.log(`DELETED: ${oldTitle}`);
        }
      }
    }
  } else {
    // maybe empty lines between blocks
    if (line.trim() !== '' && line.trim() !== ',') {
      // finalLines.push(line);
    }
  }
  i++;
}

// Remove last comma if exists
if (finalLines[finalLines.length-1] === ',') {
  finalLines.pop();
}

finalLines.push('];');

fs.writeFileSync('src/data/lyricsSongs.ts', finalLines.join('\n'), 'utf8');

console.log(`Matched ${matchedCount} songs.`);

// We also need to fix 'درامة' to 'دراما' globally.
const filesToFix = ['src/pages/LyricsPage.tsx', 'src/pages/SongsPage.tsx', 'src/pages/MelodiesPage.tsx', 'src/data/lyricsSongs.ts'];
for (let f of filesToFix) {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    c = c.replace(/درامة/g, 'دراما');
    fs.writeFileSync(f, c, 'utf8');
  }
}
console.log("Renamed 'درامة' to 'دراما' globally.");
