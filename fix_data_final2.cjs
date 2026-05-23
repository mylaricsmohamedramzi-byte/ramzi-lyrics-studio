const fs = require('fs');
const file = 'src/data/lyricsSongs.ts';
let c = fs.readFileSync(file, 'utf8');
const lines = c.split('\n');
let changes = 0;

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
  if (!range) return;
  for (let i = range.start; i < range.end; i++) {
    if (lines[i].match(/^\s*"?title"?\s*:/)) {
      lines[i] = lines[i].replace(/title"?\s*:\s*["'`].+?["'`]/, `title: "${newTitle}"`);
      changes++;
      break;
    }
  }
}

function fixTypeInBlock(id, newType) {
  const range = findSongRange(id);
  if (!range) return;
  for (let i = range.start; i < range.end; i++) {
    if (lines[i].match(/^\s*"?type"?\s*:/)) {
      lines[i] = lines[i].replace(/type"?\s*:\s*["'`].+?["'`]/, `type: "${newType}"`);
      changes++;
      break;
    }
  }
}

fixTitleInBlock(12, "وعدّي الليل");
fixTitleInBlock(13, "أبات اقول");
fixTitleInBlock(14, "حائر القلب");
fixTitleInBlock(18, "لو خطّي");
fixTitleInBlock(23, "بُرج الميزان");
fixTitleInBlock(25, "سنّه سنّه");
fixTitleInBlock(30, "حاجة تانيه");
fixTitleInBlock(35, "مش هوقّف");
fixTitleInBlock(21, "عايش عشانك");

fixTypeInBlock(25, "بوب");
fixTypeInBlock(20, "رومانسي مقسوم");
fixTypeInBlock(1, "درامة");
fixTypeInBlock(2, "درامة");
fixTypeInBlock(3, "درامة");
fixTypeInBlock(4, "درامة");
fixTypeInBlock(5, "درامة");

c = lines.join('\n');
fs.writeFileSync(file, c, 'utf8');
console.log(`\nDone! ${changes} changes applied.`);
