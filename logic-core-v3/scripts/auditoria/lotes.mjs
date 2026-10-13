#!/usr/bin/env node
// Auditoría de renovación 2026-10 — partidor de lotes de lectura para F2.
//
// Lee `docs/auditoria-2026-10/_cobertura.csv`, toma los archivos `profundo` de
// cada dominio que sigan `pendiente` y los agrupa en lotes de hasta MAX_LOC
// líneas, sin partir una carpeta de flujo (ruta + sus _actions/_components, o
// un subdirectorio de lib/módulo) salvo que la carpeta sola supere el tope.
// Así cada lector puede trazar UI → action/route → lib → DB dentro de su lote.
//
// Solo lectura: lee el CSV y los archivos del árbol (idénticos a la ref base
// porque esta rama no toca código de la app) y escribe un JSON de lotes.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/lotes.mjs                         (todos los dominios)
//   node scripts/auditoria/lotes.mjs --dominio D2 --max 6500
//   node scripts/auditoria/lotes.mjs --out docs/auditoria-2026-10/_crudo/lotes.json

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 && args[i + 1] ? args[i + 1] : d }
const MAX_LOC = Number(opt('--max', '6500'))
const SOLO = opt('--dominio', null)
const appRoot = process.cwd()
const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim()
const CSV = path.resolve(appRoot, 'docs/auditoria-2026-10/_cobertura.csv')
const OUT = path.resolve(appRoot, opt('--out', 'docs/auditoria-2026-10/_crudo/lotes.json'))
const A = 'logic-core-v3/'

function parsearCsv(texto) {
  const filas = []
  let fila = [], actual = '', comillas = false
  for (let i = 0; i < texto.length; i++) {
    const c = texto[i]
    if (comillas) {
      if (c === '"' && texto[i + 1] === '"') { actual += '"'; i++ } else if (c === '"') comillas = false; else actual += c
    } else if (c === '"') comillas = true
    else if (c === ',') { fila.push(actual); actual = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && texto[i + 1] === '\n') i++
      fila.push(actual); actual = ''
      if (fila.some((x) => x !== '')) filas.push(fila)
      fila = []
    } else actual += c
  }
  if (actual !== '' || fila.length) { fila.push(actual); filas.push(fila) }
  return filas
}

// Clave de carpeta de flujo: hasta dónde se agrupa un archivo.
function claveDeFlujo(ruta) {
  const r = ruta.startsWith(A) ? ruta.slice(A.length) : ruta
  const s = r.split('/')
  if (r.startsWith('src/app/(protected)/')) return s.slice(0, Math.min(s.length - 1, 5)).join('/') // src/app/(protected)/<area>/<seccion>
  if (r.startsWith('src/app/api/')) return s.slice(0, Math.min(s.length - 1, 5)).join('/')
  if (r.startsWith('src/app/')) return s.slice(0, Math.min(s.length - 1, 3)).join('/')
  if (r.startsWith('src/modules/')) return s.slice(0, Math.min(s.length - 1, 5)).join('/')
  if (r.startsWith('src/components/')) return s.slice(0, Math.min(s.length - 1, 4)).join('/')
  if (r.startsWith('src/lib/')) return s.length > 3 ? s.slice(0, 3).join('/') : 'src/lib/(sueltos)'
  if (r.startsWith('prisma/migrations/')) return 'prisma/migrations'
  return s.slice(0, Math.max(1, s.length - 1)).join('/') || '(raiz)'
}

const filas = parsearCsv(readFileSync(CSV, 'utf8')).slice(1)
const porDominio = new Map()
for (const [ruta, dominio, alcance, estado] of filas) {
  if (alcance !== 'profundo' || estado !== 'pendiente') continue
  if (SOLO && dominio !== SOLO) continue
  // Líneas reales: saltos de línea + 1 si el archivo no termina en salto (como `wc -l` corregido).
  let loc = 0
  try {
    const texto = readFileSync(path.join(repoRoot, ruta), 'utf8')
    loc = (texto.match(/\n/g) ?? []).length + (texto.length && !texto.endsWith('\n') ? 1 : 0)
  } catch { loc = 0 }
  if (!porDominio.has(dominio)) porDominio.set(dominio, new Map())
  const grupos = porDominio.get(dominio)
  const k = claveDeFlujo(ruta)
  if (!grupos.has(k)) grupos.set(k, [])
  grupos.get(k).push({ ruta, loc })
}

const lotes = []
for (const dominio of [...porDominio.keys()].sort()) {
  const grupos = [...porDominio.get(dominio)].map(([clave, archivos]) => ({
    clave,
    archivos: archivos.sort((a, b) => a.ruta.localeCompare(b.ruta)),
    loc: archivos.reduce((s, a) => s + a.loc, 0),
  }))
  // Carpetas más grandes que el tope: se parten en trozos contiguos por ruta.
  const piezas = []
  for (const g of grupos) {
    if (g.loc <= MAX_LOC) { piezas.push(g); continue }
    let actual = { clave: g.clave, archivos: [], loc: 0 }
    for (const a of g.archivos) {
      if (actual.loc + a.loc > MAX_LOC && actual.archivos.length) { piezas.push(actual); actual = { clave: g.clave, archivos: [], loc: 0 } }
      actual.archivos.push(a); actual.loc += a.loc
    }
    if (actual.archivos.length) piezas.push(actual)
  }
  // Empaquetado en orden de ruta: las carpetas vecinas (mismo padre) caen en el
  // mismo lote, que es lo que más se parece a «un flujo». Un resto menor al 15 %
  // del tope se suma al lote anterior en vez de abrir uno casi vacío.
  piezas.sort((a, b) => a.clave.localeCompare(b.clave))
  const delDominio = []
  for (const p of piezas) {
    const ultimo = delDominio[delDominio.length - 1]
    if (ultimo && ultimo.loc + p.loc <= MAX_LOC) { ultimo.carpetas.push(p.clave); ultimo.archivos.push(...p.archivos); ultimo.loc += p.loc }
    else delDominio.push({ carpetas: [p.clave], archivos: [...p.archivos], loc: p.loc })
  }
  // Lotes vecinos que juntos entran en el tope se funden (evita lotes chicos
  // que quedan entre dos carpetas grandes).
  for (let i = 0; i < delDominio.length - 1; ) {
    const a = delDominio[i], b = delDominio[i + 1]
    if (a.loc + b.loc <= MAX_LOC) { a.carpetas.push(...b.carpetas); a.archivos.push(...b.archivos); a.loc += b.loc; delDominio.splice(i + 1, 1) }
    else i++
  }
  if (delDominio.length > 1 && delDominio[delDominio.length - 1].loc < MAX_LOC * 0.15) {
    const resto = delDominio.pop()
    const previo = delDominio[delDominio.length - 1]
    previo.carpetas.push(...resto.carpetas); previo.archivos.push(...resto.archivos); previo.loc += resto.loc
  }
  delDominio.forEach((l, i) => {
    lotes.push({
      id: `${dominio}-L${i + 1}`,
      dominio,
      loc: l.loc,
      carpetas: [...new Set(l.carpetas)].sort(),
      archivos: l.archivos.map((a) => a.ruta).sort(),
    })
  })
}

mkdirSync(path.dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ max_loc: MAX_LOC, lotes }, null, 2) + '\n', 'utf8')
for (const l of lotes) console.log(`${l.id.padEnd(8)} ${String(l.archivos.length).padStart(4)} archivos ${String(l.loc).padStart(6)} LOC  ${l.carpetas.slice(0, 4).join(', ')}${l.carpetas.length > 4 ? ` (+${l.carpetas.length - 4})` : ''}`)
console.log(`\n${lotes.length} lotes → ${path.relative(appRoot, OUT)}`)
