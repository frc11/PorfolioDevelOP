
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/sections/home/OurServices.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/layout/DynamicDock.tsx',
];

const patterns = [
  // Byte level fixes for 'â ±'
  { search: Buffer.from([0xC3, 0xA2, 0x20, 0xC2, 0xB1]), replace: '⏱' },
  { search: Buffer.from([0xE2, 0x20, 0xB1]), replace: '⏱' },
  { search: Buffer.from([0xC3, 0xA2, 0xCB, 0x9C, 0xE2, 0x80, 0xA6]), replace: '★' },
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let buffer = fs.readFileSync(fullPath);
    let changed = false;

    patterns.forEach(({ search, replace }) => {
      let index = buffer.indexOf(search);
      while (index !== -1) {
        const prefix = buffer.slice(0, index);
        const suffix = buffer.slice(index + search.length);
        buffer = Buffer.concat([prefix, Buffer.from(replace, 'utf8'), suffix]);
        changed = true;
        index = buffer.indexOf(search, index + Buffer.from(replace, 'utf8').length);
      }
    });

    if (changed) {
      fs.writeFileSync(fullPath, buffer);
      console.log(`  Updated bytes in ${relPath}`);
    }
  }
});

// String level fixes
const strPatterns = [
  { search: /Caractersticas/g, replace: 'Características' },
  { search: /Caracteristicas/g, replace: 'Características' },
  { search: /Tucumn/g, replace: 'Tucumán' },
  { search: /qué tu negocio/g, replace: 'que tu negocio' },
  { search: /â ±/g, replace: '⏱' },
  { search: /â˜…/g, replace: '★' },
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    strPatterns.forEach(p => {
      content = content.replace(p.search, p.replace);
    });
    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  Updated strings in ${relPath}`);
    }
  }
});
