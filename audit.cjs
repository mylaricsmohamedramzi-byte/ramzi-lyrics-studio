const fs = require('fs');
const content = fs.readFileSync('src/data/lyricsSongs.ts', 'utf8');

const lines = content.split('\n');
const songs = [];
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
    songs.push({ id: currentId, title: currentTitle, type: currentType, line: i + 1 });
    currentTitle = null;
    currentType = null;
    currentId = null;
  }
}

// Group by type and print
const grouped = {};
songs.forEach(s => {
  if (!grouped[s.type]) grouped[s.type] = [];
  grouped[s.type].push(s);
});

console.log(`\nTotal songs found: ${songs.length}\n`);
console.log('='.repeat(80));

Object.keys(grouped).sort().forEach(type => {
  const items = grouped[type];
  console.log(`\n${type} (${items.length}):`);
  items.forEach((s, i) => {
    console.log(`  ${i+1}. [id=${s.id}, line=${s.line}] "${s.title}"`);
  });
});
