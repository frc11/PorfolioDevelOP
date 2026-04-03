const fs = require('fs');
const file = 'src/components/sections/OurServices.tsx';
const content = fs.readFileSync(file, 'utf8');

const sIdx = content.indexOf('  function SimSEO');
const eIdx = content.indexOf('  const renderPlaceholderScene');

if (sIdx !== -1 && eIdx !== -1) {
  let extract = content.substring(sIdx, eIdx);
  const before = content.substring(0, sIdx);
  const after = content.substring(eIdx);

  
  let newContent = before + after;
  
  // also extract SimProps
  const propsRegex = /(  type SimProps = \{\r?\n    isActive: boolean;\r?\n    progress: number;\r?\n    color: string;\r?\n  \};\r?\n\r?\n)/;
  const propsMatch = newContent.match(propsRegex);
  let propsExtracted = '';
  if (propsMatch) {
     propsExtracted = propsMatch[1];
     newContent = newContent.replace(propsMatch[1], '');
  } else {
     console.log("Could not extract SimProps");
  }

  // insert everything above WebScene
  const webSceneRegex = /(function WebScene\(\{ service \}: \{ service: Service \}\) \{)/;
  
  // fix indentation of extracted functions
  extract = extract.split('\n').map(line => line.replace(/^  /, '')).join('\n');
  propsExtracted = propsExtracted.split('\n').map(line => line.replace(/^  /, '')).join('\n');
  
  newContent = newContent.replace(webSceneRegex, propsExtracted.trim() + '\n\n' + extract.trim() + '\n\n$1');

  fs.writeFileSync(file, newContent);
  console.log("Successfully extracted Sim functions!");
} else {
  console.log("Indices not found! sIdx: " + sIdx + " eIdx: " + eIdx);
}
