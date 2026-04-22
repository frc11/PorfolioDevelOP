
const fs = require('fs');
const buffer = fs.readFileSync('src/components/sections/home/OurServices.tsx');
const searchString = 'TU EMPRESA';
let index = buffer.indexOf(searchString);
while (index !== -1) {
  const slice = buffer.slice(index, index + 40);
  console.log('Match at', index);
  console.log(slice.toString('utf8'));
  console.log(slice.toString('hex'));
  index = buffer.indexOf(searchString, index + 1);
}
