const fs = require('fs');
const path = require('path');

const filesToUpdateViews = [
  'src/pages/VideosPage.tsx',
  'src/pages/MelodiesPage.tsx',
  'src/data/lyricsSongs.ts'
];

filesToUpdateViews.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // 1. Reset Views to "0"
  content = content.replace(/views:\s*"[^"]*"/g, 'views: "0"');
  
  // 2. Remove Critics Render Block from VideosPage and MelodiesPage
  if (file.includes('VideosPage.tsx') || file.includes('MelodiesPage.tsx')) {
    // Regex to match the Critics section block and remove it
    // In VideosPage: {/* ─── الآراء النقدية ─── */} ... <div className="comments-header"
    // Wait, it's safer to just remove the specific block or let's use exact string replacement
    const criticsBlockRegex = /\{\/\*\s*───\s*الآراء النقدية\s*───\s*\*\/\}\s*<div className="mb-5">\s*<span className="label-gold"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g;
    
    content = content.replace(criticsBlockRegex, '');
    
    // Sometimes it's slightly different in MelodiesPage
    const criticsBlockMelodies = /\{\/\*\s*الآراء النقدية\s*\*\/\}\s*<div className="mb-4">[\s\S]*?<\/div>\s*<\/div>/g;
    content = content.replace(criticsBlockMelodies, '');
  }

  // 3. Update lyrics in lyricsSongs.ts
  if (file.includes('lyricsSongs.ts')) {
    const oldLyrics = `{ text: "عمره يوم ما هان عليا.. بس أنا هنت عليه", red: true },
      { text: "كان حبيبي ونور عينيه.. كنت أنسب حد ليه", red: true },
      { text: "رد خيري بالأزيه.. والجميل مطمورش فيه", red: true },
      { text: "قال كلام ومعملش بيه.. كان شاطر في التمثيلية", red: true },`;
      
    const newLyrics = `{ text: "عمره يوم ما هان عليا... بس أنا هنت عليه", red: true },
      { text: "كان حبيبي ونور عينيه... كنت أنسب حدّ ليه", red: true },
      { text: "رد خيري بالأزيه... والجميل مطمورش فيه", red: true },
      { text: "قال كلام ومعملش بيه... كان شاطر في التمثيلية", red: true },`;
      
    content = content.replace(oldLyrics, newLyrics);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
