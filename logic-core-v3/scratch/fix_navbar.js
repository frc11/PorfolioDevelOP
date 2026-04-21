
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/components/layout/Navbar.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/label: "Caracter.*sticas"/, 'label: "Características"');
content = content.replace(/"#caracteristicas": "Caracter.*sticas"/, '"#caracteristicas": "Características"');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Navbar fix finished.');
