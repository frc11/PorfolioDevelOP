// scripts/check-env.js
// Verifica que todas las env vars críticas estén configuradas.
// Uso: npm run check-env
//
// Alineado al inventario verificado en docs/env-vars.md (2026-05-21).
// Cualquier var nueva en código debe sumarse acá o a la lista de OPCIONALES.

// Cargar .env y .env.local en el orden que usa Next.js
// (.env.local sobrescribe .env, ambos sobre process.env).
require('dotenv').config({ path: '.env' })
require('dotenv').config({ path: '.env.local', override: true })

// Variables que la app necesita para arrancar / operar.
// Si una falta, exit code 1.
const CRITICAL_VARS = [
  // Infra / auth
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXTAUTH_URL',
  'IMPERSONATION_SECRET',
  // Chatbot (Vertex AI)
  'CHATBOT_GCP_PROJECT_ID',
  // Email (alertas técnicas develOP)
  'DEVELOP_ALERTS_EMAIL',
  // Public CTAs
  'NEXT_PUBLIC_APP_URL',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
]

// Variables que el código consulta pero el feature degrada sin ellas
// (mock fallback, feature off, sin notificaciones, etc.).
const OPTIONAL_VARS = [
  // Chatbot LLM
  'CHATBOT_LLM_PROVIDER',
  'CHATBOT_GCP_LOCATION',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'GOOGLE_VERTEX_CREDENTIALS_JSON',
  'CHATBOT_IP_HASH_SALT',
  'ANTHROPIC_API_KEY',
  // Email
  'RESEND_API_KEY',
  'RESEND_FROM_EMAIL',
  'BREVO_API_KEY',
  'BREVO_FROM_EMAIL',
  'BREVO_FROM_NAME',
  // Google APIs (analytics/SEO/business)
  'GOOGLE_SERVICE_ACCOUNT_KEY',
  'GOOGLE_PAGESPEED_API_KEY',
  'GOOGLE_BUSINESS_PROFILE_CLIENT_ID',
  'GOOGLE_BUSINESS_PROFILE_CLIENT_SECRET',
  'GOOGLE_BUSINESS_PROFILE_REDIRECT_URI',
  // Integraciones
  'TIENDANUBE_CLIENT_ID',
  'TIENDANUBE_CLIENT_SECRET',
  'N8N_API_URL',
  'N8N_API_KEY',
  'N8N_CONTACT_WEBHOOK_URL',
  'NEXT_PUBLIC_N8N_CONTACT_WEBHOOK_URL',
  // Notificaciones
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  // Cron (solo prod)
  'CRON_SECRET',
  // Monitoring
  'NEXT_PUBLIC_SENTRY_DSN',
  'SENTRY_AUTH_TOKEN',
  'SENTRY_ORG',
  'SENTRY_PROJECT',
]

// Variables que están en código solo como warning legacy (no autentican nada).
// Si las dejaste sin valor, está bien.
const LEGACY_VARS = ['CHATBOT_GOOGLE_API_KEY']

const missing = []
const configured = []

for (const v of CRITICAL_VARS) {
  if (!process.env[v]) {
    missing.push(v)
  } else {
    configured.push(v)
  }
}

console.log('\n=== Variables de entorno ===\n')
console.log(`OK Configuradas (${configured.length}/${CRITICAL_VARS.length}):`)
configured.forEach((v) => console.log(`  + ${v}`))

if (missing.length > 0) {
  console.log(`\nFALTAN (CRÍTICAS):`)
  missing.forEach((v) => console.log(`  - ${v}`))
  console.log('\nLa app no funcionará sin estas variables.\n')
  process.exit(1)
}

console.log('\n=== Opcionales ===\n')
for (const v of OPTIONAL_VARS) {
  if (process.env[v]) {
    console.log(`  + ${v}`)
  } else {
    console.log(`  - ${v} (no configurada, usará default o feature degradada)`)
  }
}

console.log('\n=== Legacy (informativas, NO bloquean) ===\n')
for (const v of LEGACY_VARS) {
  if (process.env[v]) {
    console.log(`  + ${v} (presente — se loguea como warning informativo)`)
  } else {
    console.log(`  - ${v} (esperado vacío — el runtime no la usa)`)
  }
}

// Cross-checks
console.log('\n=== Coherencia ===\n')

const hasResend = !!process.env.RESEND_API_KEY
const hasBrevo = !!process.env.BREVO_API_KEY
if (!hasResend && !hasBrevo) {
  console.log('  ! Ni RESEND_API_KEY ni BREVO_API_KEY están configuradas. Las notificaciones por email no van a salir.')
} else {
  console.log(`  + Email provider configurado: ${hasResend ? 'Resend' : ''}${hasResend && hasBrevo ? ' + ' : ''}${hasBrevo ? 'Brevo' : ''}`)
}

const provider = (process.env.CHATBOT_LLM_PROVIDER ?? 'google').toLowerCase()
if (provider === 'google') {
  const hasCredFile = !!process.env.GOOGLE_APPLICATION_CREDENTIALS
  const hasCredJson = !!process.env.GOOGLE_VERTEX_CREDENTIALS_JSON
  if (!hasCredFile && !hasCredJson) {
    console.log('  ! provider=google y no hay GOOGLE_APPLICATION_CREDENTIALS ni GOOGLE_VERTEX_CREDENTIALS_JSON. El chatbot no va a poder llamar a Vertex.')
  } else {
    console.log(`  + Vertex credentials: ${hasCredFile ? 'file path' : ''}${hasCredFile && hasCredJson ? ' + ' : ''}${hasCredJson ? 'inline JSON' : ''}`)
  }
}

const isProd = process.env.NODE_ENV === 'production'
if (isProd) {
  if (!process.env.CHATBOT_IP_HASH_SALT) {
    console.log('  ! NODE_ENV=production y CHATBOT_IP_HASH_SALT vacía — el bot va a arrancar con error.')
  }
  if (!process.env.CRON_SECRET) {
    console.log('  ! NODE_ENV=production y CRON_SECRET vacía — los crons de Netlify van a fallar 401.')
  }
}

console.log('\nOK — Todas las críticas configuradas.\n')
process.exit(0)
