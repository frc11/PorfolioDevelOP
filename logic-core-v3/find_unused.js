const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function (file) {
        if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
            arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, file));
        }
    });
    return arrayOfFiles;
}

const srcDir = path.join(__dirname, 'src');
const allTsTsx = getAllFiles(srcDir).filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));
const targetFiles = allTsTsx.filter(f => f.includes('\\components\\') || f.includes('\\modules\\'));

const unusedFiles = [];

targetFiles.forEach(file => {
    const baseName = path.basename(file, path.extname(file));
    if (baseName === 'index' || baseName === 'layout' || baseName === 'page') return;

    let used = false;
    for (const otherFile of allTsTsx) {
        if (otherFile === file) continue;
        const content = fs.readFileSync(otherFile, 'utf8');
        // Check for the component name or the file name in other files
        if (content.includes(baseName)) {
            // Double check it's not just a substring of another word, e.g. Hero in HeroArtifact
            // We'll trust substring for now, if it's unused it will have 0 matches.
            used = true;
            break;
        }
    }
    if (!used) unusedFiles.push(file);
});

console.log("=== POTENTIALLY UNUSED FILES ===");
unusedFiles.forEach(f => console.log(f.replace(srcDir, '')));

// Now let's check package.json dependencies
const pkgFile = fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8');
const pkg = JSON.parse(pkgFile);
const deps = Object.keys(pkg.dependencies || {});
const unusedDeps = [];
const allContents = allTsTsx.map(f => fs.readFileSync(f, 'utf8')).join('\n');

deps.forEach(dep => {
    // Skip common next/react types
    if (dep.startsWith('@types/')) return;

    // A simple approach: if the dep name doesn't appear in the code (as an import or require)
    // For scoped packages like @react-three/fiber, check for the whole name or just 'fiber'
    if (!allContents.includes(dep)) {
        unusedDeps.push(dep);
    }
});

console.log("\n=== POTENTIALLY UNUSED DEPENDENCIES ===");
unusedDeps.forEach(d => console.log(d));

