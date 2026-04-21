
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/sections/home/OurServices.tsx',
  'src/components/sections/web-development/AiSection.tsx',
  'src/components/sections/web-development/WebDevelopmentSeo.tsx',
  'src/components/sections/web-development/WebDevelopmentTimeline.tsx',
  'src/components/sections/web-development/WebDevelopmentBento.tsx',
  'src/components/sections/web-development/WebDevelopmentByRubro.tsx',
];

const patterns = [
  { search: /â˜…/g, replace: '★' },
  { search: /â ±/g, replace: '⏱' },
  { search: /â­ /g, replace: '⭐' },
  { search: /âœ…/g, replace: '✅' },
  { search: /â†’/g, replace: '→' },
  { search: /Â·/g, replace: '·' },
  { search: /Ã³/g, replace: 'ó' },
  { search: /Ã¡/g, replace: 'á' },
  { search: /Ã­/g, replace: 'í' },
  { search: /Ã©/g, replace: 'é' },
  { search: /Ã±/g, replace: 'ñ' },
  { search: /Â¿/g, replace: '¿' },
  { search: /Â¡/g, replace: '¡' },
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`Fixing ${relPath}...`);
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    patterns.forEach(({ search, replace }) => {
      content = content.replace(search, replace);
    });

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  Updated ${relPath}`);
    }
  }
});
