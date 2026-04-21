
const fs = require('fs');
const path = require('path');

const filesToFix = [
  'src/components/sections/home/OurServices.tsx',
  'src/components/sections/home/Footer.tsx',
  'src/components/layout/Hero.tsx',
  'src/components/layout/Navbar.tsx',
  'src/components/sections/web-development/AiSection.tsx',
  'src/app/contact/page.tsx',
];

const patterns = [
  // Double-encoded characters (Mojibake)
  { search: /Ã³/g, replace: 'ó' },
  { search: /Ã¡/g, replace: 'á' },
  { search: /Ã­/g, replace: 'í' },
  { search: /Ã©/g, replace: 'é' },
  { search: /Ã±/g, replace: 'ñ' },
  { search: /Ãš/g, replace: 'Ú' },
  { search: /Ã“/g, replace: 'Ó' },
  { search: /Â·/g, replace: '·' },
  { search: /Â¿/g, replace: '¿' },
  { search: /Â¡/g, replace: '¡' },
  { search: /Ã—/g, replace: '×' },
  { search: /â ±/g, replace: '⏱' },
  { search: /â˜…/g, replace: '★' },
  { search: /â­ /g, replace: '⭐' },
  { search: /âœ…/g, replace: '✅' },
  { search: /âœ“/g, replace: '✓' },
  { search: /â†’/g, replace: '→' },
  { search: /â€”/g, replace: '—' },
  { search: /â€“/g, replace: '–' },
  { search: /â€¢/g, replace: '•' },
  { search: /ðŸ‘‹/g, replace: '👋' },
  
  // Specific missing accents
  [/\bCaracteristicas\b/g, 'Características'],
  [/\bAutomatizacion\b/g, 'Automatización'],
  [/\bTucuman\b/gi, 'Tucumán'],
  [/\bAtencion\b/g, 'Atención'],
  [/\bautomaticas\b/g, 'automáticas'],
  [/\bMetricas\b/g, 'Métricas'],
  [/\bposicion\b/gi, 'posición'],
  [/\boperacion\b/gi, 'operación'],
  [/\bgestion\b/gi, 'gestión'],
  [/\blogica\b/gi, 'lógica'],
  [/\bautomatico\b/gi, 'automático'],
  [/\bNingun\b/g, 'Ningún'],
  [/\bElegi\b/g, 'Elegí'],
  [/\bcomodo\b/g, 'cómodo'],
  [/\brapido\b/g, 'rápido'],
  [/\bTelefono\b/g, 'Teléfono'],
  [/\bDiagnostico\b/g, 'Diagnóstico'],
  [/\baccion\b/g, 'acción'],
  
  // Grammar fix: remove unnecessary accent on 'que'
  [/([Ll]o) qué/g, '$1 que'],
  [/([Pp]ara) qué/g, '$1 que'],
  [/([Ii]nfo) qué/g, '$1 que'],
  [/([Dd]eal) qué/g, '$1 que'],
  [/([Tt]odo) qué/g, '$1 que'],
  [/([Rr]ápido) qué/g, '$1 que'],
  [/([Qq]uerés) qué/g, '$1 que'],
  [/([Cc]ierre) qué/g, '$1 que'],
];

filesToFix.forEach(relPath => {
  const fullPath = path.join(process.cwd(), relPath);
  if (fs.existsSync(fullPath)) {
    console.log(`Fixing ${relPath}...`);
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;

    patterns.forEach(p => {
      if (Array.isArray(p)) {
        content = content.replace(p[0], p[1]);
      } else {
        content = content.replace(p.search, p.replace);
      }
    });

    if (content !== original) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  Updated ${relPath}`);
    } else {
      console.log(`  No changes for ${relPath}`);
    }
  } else {
    console.log(`File not found: ${relPath}`);
  }
});
