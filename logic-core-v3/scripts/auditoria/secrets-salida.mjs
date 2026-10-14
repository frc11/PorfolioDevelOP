#!/usr/bin/env node
// Auditoría de renovación 2026-10 — control de la autorrevisión §10 («¿valor de secret?»).
//
// Busca los mismos patrones de credencial que secrets-historial.mjs (se leen de ese
// archivo, sin duplicarlos) en lo que escribe la corrida: docs/auditoria-2026-10/ y
// scripts/auditoria/. Imprime ruta:línea y TIPO, nunca el valor. Sale con código 1 si
// encuentra algo. secrets-historial.mjs arma sus muestras sintéticas en tiempo de
// ejecución, así que su texto no matchea.
//
// Uso (desde logic-core-v3):
//   node scripts/auditoria/secrets-salida.mjs             barrido
//   node scripts/auditoria/secrets-salida.mjs --control   control positivo: el mismo
//        escaneo sobre las muestras sintéticas de secrets-historial.mjs tiene que
//        encontrar los 22 tipos

import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

const FUENTE = 'scripts/auditoria/secrets-historial.mjs'
const src = readFileSync(FUENTE, 'utf8').replace(/\r\n/g, '\n')
const bloque = (desde, cierre) => { const i = src.indexOf(desde); return src.slice(i, src.indexOf(cierre, i) + cierre.length) }
// código propio de la corrida (lista de [tipo, /regex/] y muestras sintéticas): se evalúa tal cual
const PATRONES = (0, eval)(bloque('const PATRONES = [', '\n]\n').replace('const PATRONES = ', '').trim())
const escanear = (lineas) => {
  const res = []
  lineas.forEach((l, i) => { for (const [tipo, re] of PATRONES) if (re.test(l)) res.push({ linea: i + 1, tipo }) })
  return res
}

if (process.argv.includes('--control')) {
  const MUESTRAS = (0, eval)(`(() => { ${bloque('const r = (n', '\n')}\n${bloque('const MUESTRAS = {', '\n}\n')}\nreturn MUESTRAS })()`)
  const encontrados = new Set(escanear(Object.values(MUESTRAS)).map((h) => h.tipo))
  const fallan = PATRONES.map(([t]) => t).filter((t) => !encontrados.has(t))
  console.log(`control positivo: ${PATRONES.length - fallan.length}/${PATRONES.length} tipos encontrados en las muestras${fallan.length ? ` · fallan: ${fallan.join(', ')}` : ''}`)
  process.exit(fallan.length ? 1 : 0)
}

const recorrer = (d) => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? recorrer(p) : [p] })
const archivos = [...recorrer('docs/auditoria-2026-10'), ...recorrer('scripts/auditoria')]
// el bloque MUESTRAS de secrets-historial.mjs tiene una sola muestra literal (un UUID de relleno): se saltea
const lf = src.split('\n')
const mIni = lf.findIndex((l) => l.startsWith('const MUESTRAS = {'))
const mFin = lf.findIndex((l, i) => i > mIni && l === '}')
const saltear = (f, linea) => path.resolve(f) === path.resolve(FUENTE) && linea - 1 >= mIni && linea - 1 <= mFin
let total = 0
const porTipo = {}
for (const f of archivos) {
  for (const h of escanear(readFileSync(f, 'utf8').split(/\r?\n/)).filter((x) => !saltear(f, x.linea))) {
    total++
    porTipo[h.tipo] = (porTipo[h.tipo] ?? 0) + 1
    console.log(`${f.split(path.sep).join('/')}:${h.linea} ${h.tipo}`)
  }
}
console.log(`secrets-salida: ${PATRONES.length} patrones · ${archivos.length} archivos · ${total} coincidencias ${JSON.stringify(porTipo)}`)
process.exit(total ? 1 : 0)
