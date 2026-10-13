#!/usr/bin/env node
// Auditoría de renovación 2026-10 — barrido de credenciales en el HISTORIAL de git.
//
// Dos pasadas, solo lectura y SIN imprimir valores nunca:
//  1. Archivos con nombre sensible que alguna vez se agregaron en cualquier ref
//     (.env*, *credentials*, *service-account*, *.pem/.p12/.key, enviroment.env…),
//     con el commit que los agregó y si siguen en la base.
//  2. Líneas AGREGADAS en cualquier commit de cualquier ref que matchean patrones
//     de credencial de formato conocido. Se reporta commit, fecha, archivo y
//     TIPO de patrón; el valor se descarta en el momento.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/secrets-historial.mjs
//   node scripts/auditoria/secrets-historial.mjs --out docs/auditoria-2026-10/_crudo/secrets-historial.json

import { execFileSync, spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const BASE = opt('--base', 'origin/main')
const appRoot = process.cwd()
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_crudo/secrets-historial.json'))
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const git = (...a) => execFileSync('git', ['-c', 'core.quotepath=off', ...a], { cwd: repoRoot, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 }).trim()

// ── 1. Archivos con nombre sensible ─────────────────────────────────────────
const NOMBRE_SENSIBLE = /(^|\/)(\.env(\.[^/]*)?|[^/]*\.env|[^/]*enviroment[^/]*|[^/]*environment\.env|[^/]*credentials?[^/]*\.json|[^/]*service[-_]?account[^/]*\.json|[^/]*\.(pem|p12|pfx|key|keystore|jks))$/i
const EXCLUIR_NOMBRE = /(^|\/)\.env\.example$|node_modules\//i
const agregados = []
let commitActual = null
for (const l of git('log', '--all', '--diff-filter=A', '--name-only', '--format=@@%H%x09%cI').split('\n')) {
  if (l.startsWith('@@')) { commitActual = l.slice(2).split('\t'); continue }
  if (!l || !commitActual) continue
  if (NOMBRE_SENSIBLE.test(l) && !EXCLUIR_NOMBRE.test(l)) agregados.push({ archivo: l, commit: commitActual[0].slice(0, 10), fecha: commitActual[1] })
}
const enBase = new Set(git('ls-tree', '-r', '--name-only', BASE).split('\n'))
const archivosSensibles = []
for (const a of agregados) {
  const refs = git('branch', '-a', '--contains', a.commit).split('\n').filter(Boolean).length
  archivosSensibles.push({ ...a, sigue_en_base: enBase.has(a.archivo), refs_que_lo_contienen: refs })
}

// ── 2. Líneas agregadas con forma de credencial ─────────────────────────────
const PATRONES = [
  ['anthropic-key', /sk-ant-[A-Za-z0-9_-]{20,}/],
  ['google-api-key', /AIza[0-9A-Za-z_-]{35}/],
  ['brevo-key', /xkeysib-[a-f0-9]{20,}/],
  ['resend-key', /\bre_[A-Za-z0-9]{8,}_[A-Za-z0-9]{8,}/],
  ['clave-privada-pem', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['github-token', /\b(ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/],
  ['aws-key', /\bAKIA[0-9A-Z]{16}\b/],
  ['sentry-token', /sntrys_[A-Za-z0-9]{20,}/],
  ['neon-password', /\bnpg_[A-Za-z0-9]{10,}/],
  ['webhook-secret', /\bwhsec_[A-Za-z0-9]{20,}/],
  ['postgres-url-con-credencial', /postgres(ql)?:\/\/[^:@/\s'"<]+:[^@/\s'"<>]{6,}@(?!localhost|127\.0\.0\.1)[a-z0-9.-]+/i],
  ['asignacion-de-clave-con-valor', /\b[A-Z0-9_]*(API_KEY|SECRET|TOKEN|PASSWORD)\s*=\s*['"]?(?!\$|<|your|tu-|xxx|changeme|\.\.\.)[A-Za-z0-9_+/=.\-]{16,}/],
  // Genéricos (pedidos por la revisión de F0): contraseñas literales, hash de un
  // literal, credenciales en texto «email / contraseña», y formatos de proveedor
  // que el repo usa (Google OAuth, Telegram, Meta/WhatsApp, cal.com, Netlify, JWT).
  ['password-literal', /\b(pass(word)?|pwd|contrase(ñ|n)a|clave)\b\s*[:=]\s*['"](?![$<{])[^'"\s]{6,}['"]/i],
  ['bcrypt-de-literal', /bcrypt\.hash(Sync)?\(\s*['"][^'"]{4,}['"]/],
  ['email-barra-password', /[\w.+-]+@[\w-]+(\.[\w-]+)+\s+\/\s+(?![$<])[^\s`'"<|]{6,}/],
  ['uuid-asignado-a-clave', /\b[A-Z0-9_]*(KEY|SECRET|TOKEN)\b["']?\s*[:=]\s*['"]?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i],
  ['google-oauth-secret', /GOCSPX-[A-Za-z0-9_-]{20,}/],
  ['telegram-bot-token', /\b\d{8,10}:[A-Za-z0-9_-]{35}\b/],
  ['meta-token', /\bEAA[A-Za-z0-9]{30,}/],
  ['calcom-key', /\bcal_(live|test)_[A-Za-z0-9]{16,}/],
  ['netlify-pat', /\bnfp_[A-Za-z0-9]{20,}/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
]

// Control positivo: cada patrón tiene que matchear una muestra sintética armada
// en tiempo de ejecución (ninguna es una credencial real). Si alguno no matchea,
// el barrido no vale y el script se corta.
const r = (n, c = 'a') => c.repeat(n)
const MUESTRAS = {
  'anthropic-key': 'sk-ant-' + r(24, 'x'),
  'google-api-key': 'AIza' + r(35, 'B'),
  'brevo-key': 'xkeysib-' + r(24, 'f'),
  'resend-key': 're_' + r(9, 'A') + '_' + r(9, 'B'),
  'clave-privada-pem': '-----BEGIN ' + 'PRIVATE KEY-----',
  'github-token': 'ghp_' + r(32, 'Z'),
  'aws-key': 'AKIA' + r(16, 'Q'),
  'sentry-token': 'sntrys_' + r(24, 'k'),
  'neon-password': 'npg_' + r(12, 'w'),
  'webhook-secret': 'whsec_' + r(24, 'v'),
  'postgres-url-con-credencial': 'postgresql://usuario:' + r(10, 'p') + '@ep-ejemplo.neon.tech/db',
  'asignacion-de-clave-con-valor': 'MY_API_KEY=' + r(20, 'k'),
  'password-literal': "const PASSWORD = '" + r(8, 'q') + "'",
  'bcrypt-de-literal': "bcrypt.hash('" + r(8, 'q') + "', 10)",
  'email-barra-password': 'admin@ejemplo.com / ' + r(8, 'q') + '!',
  'uuid-asignado-a-clave': 'SOME_KEY=12345678-1234-1234-1234-123456789abc',
  'google-oauth-secret': 'GOCSPX-' + r(24, 'g'),
  'telegram-bot-token': '123456789:' + r(35, 'T'),
  'meta-token': 'EAA' + r(32, 'M'),
  'calcom-key': 'cal_live_' + r(20, 'c'),
  'netlify-pat': 'nfp_' + r(24, 'n'),
  'jwt': 'eyJ' + r(12, 'h') + '.eyJ' + r(12, 'p') + '.' + r(12, 's'),
}
const fallan = PATRONES.filter(([tipo, re]) => !re.test(MUESTRAS[tipo] ?? ''))
if (fallan.length) {
  console.error(`CONTROL POSITIVO FALLIDO: ${fallan.map(([t]) => t).join(', ')}`)
  process.exit(2)
}
const hallazgos = new Map() // clave: commit|archivo|tipo
const proc = spawn('git', ['-c', 'core.quotepath=off', 'log', '--all', '-p', '-U0', '--no-color', '--no-ext-diff', '--format=@@%H%x09%cI'], { cwd: repoRoot })
const rl = readline.createInterface({ input: proc.stdout, crlfDelay: Infinity })
let commit = null
let archivo = null
for await (const linea of rl) {
  if (linea.startsWith('@@') && linea.includes('\t') && /^@@[0-9a-f]{40}\t/.test(linea)) { commit = linea.slice(2).split('\t'); continue }
  if (linea.startsWith('+++ ')) { archivo = linea.startsWith('+++ b/') ? linea.slice(6) : null; continue }
  if (!linea.startsWith('+') || linea.startsWith('+++') || !archivo || !commit) continue
  if (/package-lock\.json$|\.github\/skills\/|\.(svg|png|jpe?g|mp4|ico)$/i.test(archivo)) continue
  for (const [tipo, re] of PATRONES) {
    if (re.test(linea)) {
      const k = `${commit[0]}|${archivo}|${tipo}`
      const esFixture = /(__tests__\/|\.invariant\.|\.test\.|\.spec\.|(^|\/)tests\/)/.test(archivo)
      if (!hallazgos.has(k)) hallazgos.set(k, { commit: commit[0].slice(0, 10), fecha: commit[1], archivo, tipo, lineas: 0, sigue_en_base: enBase.has(archivo), es_test: esFixture })
      hallazgos.get(k).lineas++
    }
  }
}
await new Promise((r) => proc.on('close', r))

const lineasSospechosas = [...hallazgos.values()].sort((a, b) => a.fecha.localeCompare(b.fecha))
mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ base: BASE, nota: 'Sin valores: solo commit, archivo y tipo de patrón.', archivos_sensibles: archivosSensibles, lineas_sospechosas: lineasSospechosas }, null, 2) + '\n', 'utf8')
console.log(`archivos con nombre sensible agregados alguna vez: ${archivosSensibles.length}`)
for (const a of archivosSensibles) console.log(`  ${a.fecha.slice(0, 10)} ${a.commit} ${a.archivo}  en-base:${a.sigue_en_base}  refs:${a.refs_que_lo_contienen}`)
console.log(`líneas agregadas con forma de credencial: ${lineasSospechosas.length} (commit×archivo×tipo); control positivo: ${PATRONES.length}/${PATRONES.length} patrones OK`)
const porTipo = lineasSospechosas.reduce((m, h) => ((m[h.tipo] = (m[h.tipo] ?? 0) + 1), m), {})
console.log(`  por tipo: ${JSON.stringify(porTipo)}`)
// Vista por archivo (sin tests), para el triage a mano.
const porArchivo = new Map()
for (const h of lineasSospechosas.filter((x) => !x.es_test)) {
  const k = h.archivo
  if (!porArchivo.has(k)) porArchivo.set(k, { tipos: new Set(), commits: 0, en_base: h.sigue_en_base })
  const v = porArchivo.get(k); v.tipos.add(h.tipo); v.commits++; v.en_base = v.en_base || h.sigue_en_base
}
console.log(`archivos (sin tests) con al menos una línea sospechosa: ${porArchivo.size}`)
for (const [a, v] of [...porArchivo].sort((x, y) => Number(y[1].en_base) - Number(x[1].en_base) || x[0].localeCompare(y[0]))) {
  console.log(`  ${v.en_base ? 'EN-BASE ' : 'historial'} ${a}  [${[...v.tipos].join(',')}] commits:${v.commits}`)
}
console.log(`\nescrito: ${path.relative(appRoot, OUT)}`)
