// scripts/check-env.js
// Verifica que todas las env vars críticas estén configuradas
// Uso: npm run check-env

const CRITICAL_VARS = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'CHATBOT_GCP_PROJECT_ID',
  'CHATBOT_IP_HASH_SALT',
  'BREVO_API_KEY',
  'DEVELOP_ALERTS_EMAIL',
]

const OPTIONAL_VARS = [
  'CHATBOT_GCP_LOCATION',
  'CHATBOT_LLM_PROVIDER',
  'CHATBOT_GOOGLE_API_KEY',
  'SENTRY_DSN',
]

require('dotenv').config()

let missing = []
let configured = []

for (const v of CRITICAL_VARS) {
  if (!process.env[v]) {
    missing.push(v)
  } else {
    configured.push(v)
  }
}

console.log('\n=== Variables de entorno ===\n')
console.log(`✓ Configuradas (${configured.length}/${CRITICAL_VARS.length}):`)
configured.forEach(v => console.log(`  ✓ ${v}`))

if (missing.length > 0) {
  console.log(`\n✗ FALTAN (CRÍTICAS):`)
  missing.forEach(v => console.log(`  ✗ ${v}`))
  console.log('\n⚠ El proyecto no funcionará sin estas variables.\n')
  process.exit(1)
}

console.log('\n=== Opcionales ===\n')
for (const v of OPTIONAL_VARS) {
  if (process.env[v]) {
    console.log(`  ✓ ${v}`)
  } else {
    console.log(`  ⚠ ${v} (no configurada, usará default)`)
  }
}

console.log('\n✓ Todas las variables críticas están configuradas.\n')
process.exit(0)
