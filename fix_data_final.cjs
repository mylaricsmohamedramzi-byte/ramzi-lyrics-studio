const fs = require('fs');
const file = 'src/data/lyricsSongs.ts';
let c = fs.readFileSync(file, 'utf8');
const lines = c.split('\n');
let changes = 0;

// Helper: find the line range for a song by searching for "id": X
function findSongRange(id) {
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\s*"?id"?\s*:\s*(\d+)/);
    if (m && parseInt(m[1]) === id) {
      let end = lines.length;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].match(/^\s*"?id"?\s*:\s*\d+/)) { end = j; break; }
      }
      return { start: i, end };
    }
  }
  return null;
}

function fixTitleInBlock(id, newTitle) {
  const range = findSongRange(id);
  if (!range) { console.log(`  [id=${id}] NOT FOUND`); return; }
  for (let i = range.start; i < range.end; i++) {
    if (lines[i].includes(`"title"`)) {
      lines[i] = lines[i].replace(/"title":\s*".+?"/, `"title": "${newTitle}"`);
      changes++;
      console.log(`  [id=${id}] Title set to "${newTitle}"`);
      break;
    }
  }
}

function fixTypeInBlock(id, newType) {
  const range = findSongRange(id);
  if (!range) { console.log(`  [id=${id}] NOT FOUND`); return; }
  for (let i = range.start; i < range.end; i++) {
    if (lines[i].includes(`"type"`)) {
      lines[i] = lines[i].replace(/"type":\s*".+?"/, `"type": "${newType}"`);
      changes++;
      console.log(`  [id=${id}] Type set to "${newType}"`);
      break;
    }
  }
}

console.log("=== Fix Titles ===");
fixTitleInBlock(12, "وعدّي الليل");
fixTitleInBlock(13, "أبات اقول");
fixTitleInBlock(14, "حائر القلب");
fixTitleInBlock(18, "لو خطّي");
fixTitleInBlock(23, "بُرج الميزان");
fixTitleInBlock(25, "سنّه سنّه");
fixTitleInBlock(30, "حاجة تانيه");
fixTitleInBlock(35, "مش هوقّف");
fixTitleInBlock(38, "كلو بيمثّل");
fixTitleInBlock(37, "طوق نجاه"); // they typed كوق نجاه but actually want طوق نجاه probably, wait, the user's prompt says "طوق نجاه" is currently "طوق نجاه", I will leave it
fixTitleInBlock(51, "لو بايدي");
fixTitleInBlock(58, "أخر فرصة");
fixTitleInBlock(61, "تجربه عديتها");
fixTitleInBlock(76, "مهما أستجدع");
fixTitleInBlock(78, "براحته يتشرط");
fixTitleInBlock(80, "قلبي إتورّط");
fixTitleInBlock(89, "عمّ الجنيني");
fixTitleInBlock(93, "محدش له جِميله علينا");
fixTitleInBlock(94, "أضحك يا عمّ");
fixTitleInBlock(98, "سحرتني و الله");
fixTitleInBlock(101, "حُبّ ومودة");
fixTitleInBlock(69, "وأما قابلتك");
fixTitleInBlock(52, "صفحة جديده");
fixTitleInBlock(73, "حظي الحلو");
fixTitleInBlock(74, "وش الخير");
fixTitleInBlock(21, "عايش عشانك"); // "عايش عشانكمعاليك" to "عايش عشانك"
fixTitleInBlock(48, "Master"); // ماستر -> Master

console.log("\n=== Fix Types ===");
// سِنّة سِنّة: رومانسي -> بوب
fixTypeInBlock(25, "بوب");
// مش طبيعي: مقسوم -> رومانسي مقسوم
fixTypeInBlock(20, "رومانسي مقسوم");
// أتفضل: مقسوم -> رومانسي مقسوم
fixTypeInBlock(75, "رومانسي مقسوم");
// سمّعني: مقسوم -> رومانسي مقسوم
fixTypeInBlock(77, "رومانسي مقسوم");
// ما يقع إلا الشاطر: مقسوم -> رومانسي مقسوم
fixTypeInBlock(79, "رومانسي مقسوم");
// يعمل ما بداله: مقسوم -> رومانسي مقسوم
fixTypeInBlock(85, "رومانسي مقسوم");
// من غير تفكير: مقسوم -> رومانسي مقسوم
fixTypeInBlock(86, "رومانسي مقسوم");
// بالتراضي: راب -> تراب
fixTypeInBlock(47, "تراب");
// Master: راب -> تراب
fixTypeInBlock(48, "تراب");
// إجتماعي -> إجتماعي& عائلي
fixTypeInBlock(88, "إجتماعي& عائلي");

// دراما -> درامة
fixTypeInBlock(1, "درامة");
fixTypeInBlock(2, "درامة");
fixTypeInBlock(3, "درامة");
fixTypeInBlock(4, "درامة");
fixTypeInBlock(5, "درامة");
// (The other ones are already درامة)

// Write back
c = lines.join('\n');
fs.writeFileSync(file, c, 'utf8');
console.log(`\nDone! ${changes} changes applied.`);
