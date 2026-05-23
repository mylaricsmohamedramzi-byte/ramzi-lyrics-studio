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
      // Find the end of this song object (next "id": or end)
      let end = lines.length;
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].match(/^\s*"?id"?\s*:\s*\d+/)) { end = j; break; }
      }
      return { start: i, end };
    }
  }
  return null;
}

// Helper: fix title in a specific song block
function fixTitleInBlock(id, oldTitle, newTitle) {
  const range = findSongRange(id);
  if (!range) { console.log(`  [id=${id}] NOT FOUND`); return; }
  let found = false;
  for (let i = range.start; i < range.end; i++) {
    if (lines[i].includes(`"title"`) && lines[i].includes(oldTitle)) {
      lines[i] = lines[i].replace(oldTitle, newTitle);
      found = true;
      changes++;
      console.log(`  [id=${id}] Title: "${oldTitle}" -> "${newTitle}"`);
      break;
    }
  }
  if (!found) console.log(`  [id=${id}] MISS title: "${oldTitle}"`);
}

// Helper: fix type in a specific song block
function fixTypeInBlock(id, oldType, newType) {
  const range = findSongRange(id);
  if (!range) { console.log(`  [id=${id}] NOT FOUND`); return; }
  let found = false;
  for (let i = range.start; i < range.end; i++) {
    if (lines[i].includes(`"type"`) && lines[i].includes(oldType)) {
      lines[i] = lines[i].replace(oldType, newType);
      found = true;
      changes++;
      console.log(`  [id=${id}] Type: "${oldType}" -> "${newType}"`);
      break;
    }
  }
  if (!found) console.log(`  [id=${id}] MISS type: "${oldType}"`);
}

console.log("=== Remaining Title Fixes ===");
fixTitleInBlock(12, "وعدى الليل", "وعدّي الليل");
fixTitleInBlock(13, "أبات أقول", "أبات اقول");
fixTitleInBlock(14, "حائر القلبِ", "حائر القلب");
fixTitleInBlock(18, "لو خطى", "لو خطّي");
fixTitleInBlock(23, "برج الميزان", "بُرج الميزان");
fixTitleInBlock(25, "سِنّة سِنّة", "سنّه سنّه");
fixTitleInBlock(30, "حاجه تانيه", "حاجة تانيه");
fixTitleInBlock(35, "أنا مش هوقّف", "مش هوقّف");
fixTitleInBlock(38, "كلو بيمثل", "كلو بيمثّل");
fixTitleInBlock(37, "طوق نجاه", "كوق نجاه");
fixTitleInBlock(48, "Master", "ماستر");
fixTitleInBlock(52, "صفحة جديدة", "صفحة جديده");

console.log("\n=== Remaining Type Fixes ===");
// سِنّة سِنّة: رومانسي -> بوب
fixTypeInBlock(25, "رومانسي", "بوب");
// مش طبيعي: مقسوم -> رومانسي مقسوم
fixTypeInBlock(20, "مقسوم", "رومانسي مقسوم");
// بالتراضي: راب -> تراب
fixTypeInBlock(47, "راب", "تراب");
// Master: راب -> تراب
fixTypeInBlock(48, "راب", "تراب");
// دراما (ids 1-5) -> درامة
fixTypeInBlock(1, "دراما", "درامة");
fixTypeInBlock(2, "دراما", "درامة");
fixTypeInBlock(3, "دراما", "درامة");
fixTypeInBlock(4, "دراما", "درامة");
fixTypeInBlock(5, "دراما", "درامة");

// Write back
c = lines.join('\n');
fs.writeFileSync(file, c, 'utf8');
console.log(`\nDone! ${changes} changes applied.`);
