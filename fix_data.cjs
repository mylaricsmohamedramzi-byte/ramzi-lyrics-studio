const fs = require('fs');
const file = 'src/data/lyricsSongs.ts';
let c = fs.readFileSync(file, 'utf8');
let changes = 0;

// Helper: replace title at specific line range
function fixTitle(oldT, newT) {
  const re = new RegExp(`"title":\\s*"${oldT.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}"`, 'g');
  const before = c;
  c = c.replace(re, `"title": "${newT}"`);
  if (c !== before) { changes++; console.log(`  Title: "${oldT}" -> "${newT}"`); }
  else console.log(`  MISS title: "${oldT}"`);
}

function fixType(oldT, newT) {
  const re = new RegExp(`"type":\\s*"${oldT.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}"`, 'g');
  const before = c;
  c = c.replace(re, `"type": "${newT}"`);
  if (c !== before) { changes++; console.log(`  Type: "${oldT}" -> "${newT}"`); }
  else console.log(`  MISS type: "${oldT}"`);
}

// We need targeted replacements - find by id block
function fixSongById(id, titleFrom, titleTo, typeFrom, typeTo) {
  // Find the block for this id
  const idRe = new RegExp(`"id":\\s*${id},`);
  const idx = c.search(idRe);
  if (idx === -1) { console.log(`  ID ${id} NOT FOUND`); return; }
  // Find next song block (next "id":) or end
  const nextId = c.indexOf('"id":', idx + 10);
  const blockEnd = nextId === -1 ? c.length : nextId;
  let block = c.substring(idx, blockEnd);
  let changed = false;
  
  if (titleFrom && titleTo && titleFrom !== titleTo) {
    const oldBlock = block;
    block = block.replace(`"title": "${titleFrom}"`, `"title": "${titleTo}"`);
    if (block !== oldBlock) { changed = true; console.log(`  [id=${id}] Title: "${titleFrom}" -> "${titleTo}"`); }
    else console.log(`  [id=${id}] MISS title: "${titleFrom}"`);
  }
  if (typeFrom && typeTo && typeFrom !== typeTo) {
    const oldBlock = block;
    block = block.replace(`"type": "${typeFrom}"`, `"type": "${typeTo}"`);
    if (block !== oldBlock) { changed = true; console.log(`  [id=${id}] Type: "${typeFrom}" -> "${typeTo}"`); }
    else console.log(`  [id=${id}] MISS type: "${typeFrom}"`);
  }
  if (changed) {
    c = c.substring(0, idx) + block + c.substring(blockEnd);
    changes++;
  }
}

console.log("=== Title Fixes ===");
fixSongById(12, "وعدى الليل", "وعدّي الليل", null, null);
fixSongById(13, "أبات أقول", "أبات اقول", null, null);
fixSongById(14, "حائر القلبِ", "حائر القلب", null, null);
fixSongById(18, "لو خطى", "لو خطّي", null, null);
fixSongById(23, "برج الميزان", "بُرج الميزان", null, null);
fixSongById(30, "حاجه تانيه", "حاجة تانيه", null, null);
fixSongById(35, "أنا مش هوقّف", "مش هوقّف", null, null);
fixSongById(38, "كلو بيمثل", "كلو بيمثّل", null, null);
fixSongById(51, "لو بأيدي", "لو بايدي", null, null);
fixSongById(58, "آخر فرصة", "أخر فرصة", null, null);
fixSongById(61, "تجربة عدتها", "تجربه عديتها", null, null);
fixSongById(76, "مهما استجدع", "مهما أستجدع", null, null);
fixSongById(78, "براحته يشترط", "براحته يتشرط", null, null);
fixSongById(80, "قلبي اتورط", "قلبي إتورّط", null, null);
fixSongById(89, "عم الجنيني", "عمّ الجنيني", null, null);
fixSongById(93, "محدش له جميلة علينا", "محدش له جِميله علينا", null, null);
fixSongById(94, "اضحك يا عم", "أضحك يا عمّ", null, null);
fixSongById(98, "سحرتني والله", "سحرتني و الله", null, null);
fixSongById(101, "حُب و موده", "حُبّ ومودة", null, null);

console.log("\n=== Type Fixes ===");
// سِنّة سِنّة: رومانسي -> بوب + title fix
fixSongById(25, "سِنّة سِنّة", "سنّه سنّه", "رومانسي", "بوب");
// مش طبيعي, اتفضل, سمّعني, ما يقع, يعمل ما بداله, من غير تفكير: مقسوم -> رومانسي مقسوم
fixSongById(20, null, null, "مقسوم", "رومانسي مقسوم");
fixSongById(75, "اتفضل", "أتفضل", "مقسوم", "رومانسي مقسوم");
fixSongById(77, null, null, "مقسوم", "رومانسي مقسوم");
fixSongById(79, null, null, "مقسوم", "رومانسي مقسوم");
fixSongById(85, null, null, "مقسوم", "رومانسي مقسوم");
fixSongById(86, null, null, "مقسوم", "رومانسي مقسوم");
// بالتراضي, Master: راب -> تراب
fixSongById(47, null, null, "راب", "تراب");
fixSongById(48, "Master", "ماستر", "راب", "تراب");
// إجتماعي -> إجتماعي& عائلي
fixSongById(88, null, null, "إجتماعي", "إجتماعي& عائلي");

console.log("\n=== Drama Type Unification ===");
// Fix all دراما and درامه to درامة
fixType("دراما", "درامة");
fixType("درامه", "درامة");

// Fix حبك مش ذنبي (id 49 at line 1834)
const hbkRe = /"title":\s*"حبك مش ذنبي"/;
if (hbkRe.test(c)) {
  c = c.replace(hbkRe, '"title": "حُبك مش ذنبي"');
  changes++;
  console.log('  Title: "حبك مش ذنبي" -> "حُبك مش ذنبي"');
}

// Fix وأمّا قابلتك -> وأما قابلتك  
const wamRe = /"title":\s*"وأمّا قابلتك"/;
if (wamRe.test(c)) {
  c = c.replace(wamRe, '"title": "وأما قابلتك"');
  changes++;
  console.log('  Title: "وأمّا قابلتك" -> "وأما قابلتك"');
}

fs.writeFileSync(file, c, 'utf8');
console.log(`\nDone! ${changes} changes applied.`);
