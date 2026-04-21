
const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/components/sections/home/OurServices.tsx');
let buffer = fs.readFileSync(filePath);

// Search for the sequence <span aria-hidden="true"> followed by the broken chars
const searchPart = Buffer.from('<span aria-hidden="true">', 'utf8');
const replaceWith = '<span aria-hidden="true">\u23f1 </span>'; // Clock emoji

let index = buffer.indexOf(searchPart);
while (index !== -1) {
    // Check if the next few bytes match the broken clock
    // 'â ±' is usually E2 8F B1 in UTF-8 or E2 20 B1 in Latin-1 corrupted
    const nextBytes = buffer.slice(index + searchPart.length, index + searchPart.length + 10);
    console.log('Found aria-hidden at', index, 'next bytes:', nextBytes.toString('hex'));
    
    // Replace up to the next </span>
    const endSpan = buffer.indexOf('</span>', index);
    if (endSpan !== -1) {
        const prefix = buffer.slice(0, index);
        const suffix = buffer.slice(endSpan);
        buffer = Buffer.concat([prefix, Buffer.from(replaceWith, 'utf8'), suffix]);
        index = buffer.indexOf(searchPart, index + replaceWith.length);
    } else {
        index = buffer.indexOf(searchPart, index + 1);
    }
}

fs.writeFileSync(filePath, buffer);
console.log('Replacement finished.');
