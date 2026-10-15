#!/usr/bin/env node
// Auditoría de renovación 2026-10 — inventario de variables de entorno por servicio externo (E10, D7).
//
// Con `git grep` sobre la ref (por defecto origin/main) junta cada lectura `process.env.X` (y
// `process.env['X']` literal) en src/, netlify/, prisma/, scripts/ y next.config.ts, más las cajas de
// cifrado de src/lib/crypto/secret-box.ts que leen su clave por nombre (`createSecretBox('X', …)`), y
// las agrupa por servicio con reglas de nombre (Vertex, Brevo, Resend, Google OAuth, Sentry,
// GA4/Search Console, GBP, Tiendanube, cal.com, Telegram, Meta/WhatsApp, n8n, Neon, Netlify, …).
// Para cada variable: dónde se lee (ruta:línea, sin tests), si está en .env.example y en qué línea.
// Es la base de la tabla de credenciales de E10: «dónde se lee» sale de acá; «qué se cae», «si el
// sistema se entera» y «cómo se renueva» los completa D7. Nunca lee ni imprime valores.
//
// Solo lectura. Escribe _crudo/credenciales-env.json. Control positivo: GOOGLE_VERTEX_CREDENTIALS_JSON
// (la credencial vencida conocida) tiene que aparecer en el grupo de Vertex.
// Uso (desde logic-core-v3): node scripts/auditoria/env-inventario.mjs [--ref origin/main]

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { escribirSegunPeso } from './crudo-partes.mjs'

const args = process.argv.slice(2)
const REF = args.includes('--ref') ? args[args.indexOf('--ref') + 1] : 'origin/main'
const CRUDO = path.join(process.cwd(), 'docs/auditoria-2026-10/_crudo')
const grep = (patron, rutas) => {
  try {
    return execFileSync('git', ['-c', 'core.quotepath=off', 'grep', '-n', '-E', patron, REF, '--', ...rutas], { encoding: 'utf8', maxBuffer: 1 << 26 }).split('\n').filter(Boolean)
  } catch (e) { if (e.status === 1) return []; throw e }
}
const RUTAS = ['src', 'netlify', 'prisma', 'scripts', ':(glob)*.ts', ':(glob)*.mjs', 'netlify.toml']
const esTest = (r) => /(__tests__|\.test\.|\.spec\.|\.invariant\.|\/tests?\/)/.test(r)

const lecturas = new Map() // var → [{ruta, linea, test}]
const sumar = (v, ruta, linea) => {
  if (!lecturas.has(v)) lecturas.set(v, [])
  lecturas.get(v).push({ ruta, linea: Number(linea), test: esTest(ruta) })
}
for (const l of grep('process\\.env(\\.[A-Z][A-Z0-9_]*|\\[[\'"][A-Z][A-Z0-9_]*[\'"]\\])', RUTAS)) {
  const m = l.match(/^[^:]+:([^:]+):(\d+):(.*)$/)
  if (!m) continue
  for (const v of m[3].matchAll(/process\.env(?:\.([A-Z][A-Z0-9_]*)|\[['"]([A-Z][A-Z0-9_]*)['"]\])/g)) sumar(v[1] ?? v[2], m[1], m[2])
}
// cajas de cifrado que leen la clave por nombre: createSecretBox('X') o createSecretBox(CONST) con
// const CONST = 'X' en el mismo archivo
for (const l of grep('createSecretBox\\([A-Za-z_\'"]', ['src'])) {
  const m = l.match(/^[^:]+:([^:]+):(\d+):(.*)$/)
  if (!m || /function createSecretBox|__tests__/.test(l)) continue
  const arg = m[3].match(/createSecretBox\(\s*(?:['"]([A-Z][A-Z0-9_]*)['"]|([A-Za-z_][A-Za-z0-9_]*))/)
  let v = arg?.[1]
  if (!v && arg?.[2]) {
    const def = grep(`const ${arg[2]}\\s*=\\s*['"][A-Z][A-Z0-9_]*['"]`, [m[1].replace(/^logic-core-v3\//, '')])[0]
    v = def?.match(/=\s*['"]([A-Z][A-Z0-9_]*)['"]/)?.[1]
  }
  if (v) sumar(v, m[1], m[2])
}
// lecturas implícitas de Auth.js v5: un provider OAuth sin clientId lee AUTH_<PROVIDER>_ID y _SECRET del entorno
const authTs = grep('(Google|GitHub)\\(\\{|clientId', ['src/auth.ts', 'src/auth.config.ts'])
for (const l of authTs) {
  const m = l.match(/^[^:]+:([^:]+):(\d+):(.*)$/)
  const p = m?.[3].match(/(Google|GitHub)\(\{/)?.[1]
  if (p && !authTs.some((x) => /clientId/.test(x))) for (const s of ['ID', 'SECRET']) sumar(`AUTH_${p.toUpperCase()}_${s}`, m[1], m[2])
}
// env("X") del schema de Prisma y de prisma.config.ts
for (const l of grep('env\\([\'"][A-Z][A-Z0-9_]*[\'"]\\)', ['prisma/schema.prisma', 'prisma.config.ts'])) {
  const m = l.match(/^[^:]+:([^:]+):(\d+):(.*)$/)
  for (const v of m?.[3].matchAll(/env\(['"]([A-Z][A-Z0-9_]*)['"]\)/g) ?? []) sumar(v[1], m[1], m[2])
}
// .env.example
const ejemplo = new Map()
try {
  execFileSync('git', ['show', `${REF}:logic-core-v3/.env.example`], { encoding: 'utf8' }).split('\n').forEach((t, i) => {
    const m = t.match(/^\s*#?\s*([A-Z][A-Z0-9_]*)=/)
    if (m && !ejemplo.has(m[1])) ejemplo.set(m[1], i + 1)
  })
} catch { /* sin .env.example */ }

const SERVICIOS = [
  ['Vertex AI (Google Cloud)', /VERTEX|GOOGLE_APPLICATION_CREDENTIALS|GCP|CHATBOT_GOOGLE|GOOGLE_GENERATIVE/],
  ['Anthropic', /ANTHROPIC/],
  ['OpenAI', /OPENAI/],
  ['Brevo', /BREVO/],
  ['Resend', /RESEND/],
  ['Google OAuth (login)', /^AUTH_GOOGLE|GOOGLE_CLIENT/],
  ['Google Business Profile', /GBP|GOOGLE_BUSINESS/],
  ['GA4 / Search Console', /GA4|ANALYTICS|SEARCH_CONSOLE|GSC|GOOGLE_SERVICE_ACCOUNT/],
  ['Sentry', /SENTRY/],
  ['Google PageSpeed', /PAGESPEED/],
  ['Tiendanube', /TIENDANUBE|NUVEMSHOP/],
  ['cal.com', /^CAL_|CALCOM/],
  ['Telegram', /TELEGRAM/],
  ['Meta / WhatsApp (360dialog)', /META|WHATSAPP|WABA|DIALOG|MOTOR/],
  ['n8n', /N8N/],
  ['Slack (alertas)', /SLACK|ALERT_WEBHOOK/],
  ['Neon / Postgres', /DATABASE|POSTGRES|NEON/],
  ['Netlify / Vercel', /NETLIFY|VERCEL|^URL$|DEPLOY/],
  ['Auth.js (secretos propios)', /^AUTH_|NEXTAUTH/],
  ['Secretos propios (firma y cifrado)', /ENCRYPT|CIPHER|SECRET_BOX|_SECRET_KEY$|SALT|IMPERSONATION_SECRET|OAUTH_STATE_SECRET|UNSUBSCRIBE_SECRET/],
  ['Cron y QA', /CRON|QA_|E2E/],
]
const servicioDe = (v) => (SERVICIOS.find(([, re]) => re.test(v)) ?? ['Otros (configuración)'])[0]

const variables = [...lecturas.entries()].map(([v, ls]) => {
  const prod = ls.filter((x) => !x.test)
  return {
    variable: v, servicio: servicioDe(v),
    lecturas: prod.slice(0, 12).map((x) => `${x.ruta.replace(/^logic-core-v3\//, '')}:${x.linea}`),
    lecturas_total: prod.length, lecturas_en_tests: ls.length - prod.length,
    solo_scripts: prod.length > 0 && prod.every((x) => /^(logic-core-v3\/)?scripts\//.test(x.ruta)),
    en_env_example: ejemplo.has(v) ? `.env.example:${ejemplo.get(v)}` : null,
  }
}).sort((a, b) => a.servicio.localeCompare(b.servicio) || a.variable.localeCompare(b.variable))
const sinLeer = [...ejemplo.keys()].filter((v) => !lecturas.has(v))

if (!variables.some((v) => v.variable === 'GOOGLE_VERTEX_CREDENTIALS_JSON' && v.servicio.startsWith('Vertex'))) { console.error('control positivo FALLA: GOOGLE_VERTEX_CREDENTIALS_JSON no está en el grupo de Vertex'); process.exit(1) }

const porServicio = {}
for (const v of variables) (porServicio[v.servicio] ??= []).push(v.variable)
escribirSegunPeso(CRUDO, 'credenciales-env', {
  generado: { ref: REF, sha: execFileSync('git', ['rev-parse', REF], { encoding: 'utf8' }).trim() },
  nota: 'Inventario de variables de entorno por servicio (E10). Solo nombres y ruta:línea; nunca valores. Base de la tabla de credenciales de D7.',
  por_servicio: porServicio, variables, documentadas_sin_lectura: sinLeer,
})
console.log(`env-inventario (${REF}): ${variables.length} variables leídas en ${Object.keys(porServicio).length} grupos · ${sinLeer.length} documentadas en .env.example sin lectura en el código · control positivo OK`)
for (const [s, vs] of Object.entries(porServicio)) {
  const app = vs.filter((v) => !variables.find((x) => x.variable === v).solo_scripts)
  console.log(`  ${s}: ${app.join(', ') || '—'}${app.length < vs.length ? ` (+${vs.length - app.length} solo en scripts)` : ''}`)
}
