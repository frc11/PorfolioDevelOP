const fs = require('fs')
const path = require('path')

const credPath = path.join(__dirname, '..', 'vertex-credentials.json')
const content = fs.readFileSync(credPath, 'utf-8')
const parsed = JSON.parse(content)

console.log('--- Pegar este VALOR en Netlify como GOOGLE_VERTEX_CREDENTIALS_JSON ---')
console.log()
console.log(JSON.stringify(parsed))
console.log()
console.log('--- FIN ---')
