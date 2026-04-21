
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/components/sections/home/OurServices.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const strPatterns = [
  { search: /([Ll]o) qué/g, replace: '$1 que' },
  { search: /([Pp]ara) qué/g, replace: '$1 que' },
  { search: /([Ii]nfo) qué/g, replace: '$1 que' },
  { search: /([Dd]eal) qué/g, replace: '$1 que' },
  { search: /([Tt]odo) qué/g, replace: '$1 que' },
  { search: /([Rr]ápido) qué/g, replace: '$1 que' },
  { search: /([Qq]uerés) qué/g, replace: '$1 que' },
  { search: /([Cc]ierre) qué/g, replace: '$1 que' },
];

strPatterns.forEach(p => {
    content = content.replace(p.search, p.replace);
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Grammar fixes finished.');
