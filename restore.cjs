const fs = require('fs');
let c = fs.readFileSync('src/data/lyricsSongs.ts', 'utf8');
const lines = c.split('\n');
for (let i = 1360; i < 1390; i++) {
  if (lines[i].includes('title: "Master"')) {
    lines[i] = lines[i].replace('title: "Master"', 'title: "قمر هادئ"');
  }
  if (lines[i].includes('type: "تراب"')) {
    lines[i] = lines[i].replace('type: "تراب"', 'type: "روك"');
  }
}
fs.writeFileSync('src/data/lyricsSongs.ts', lines.join('\n'), 'utf8');
console.log("Restored قمر هادئ");
