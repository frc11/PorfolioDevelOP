/**
 * P37 · Compara una medición fija contra su baseline, celda por celda.
 * Ignora solo `base` (el puerto que registra el instrumento). Aplana cada fila a
 * pares clave→valor (objetos anidados con ruta `a.b`) y cuenta celdas iguales.
 *
 * Uso: node scripts/p37-comparar-mediciones.mjs <baseline.json> <nuevo.json>
 */
import fs from 'fs'

const [, , baseArg, nuevoArg] = process.argv
const base = JSON.parse(fs.readFileSync(baseArg, 'utf8'))
const nuevo = JSON.parse(fs.readFileSync(nuevoArg, 'utf8'))

const aplanar = (obj, prefijo = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v !== null && typeof v === 'object' && !Array.isArray(v)
      ? aplanar(v, `${prefijo}${k}.`)
      : [[`${prefijo}${k}`, JSON.stringify(v)]],
  )

const clave = (f) => `${f.pantalla}|${f.ancho}`
const mapaNuevo = new Map(nuevo.filas.map((f) => [clave(f), f]))
let celdas = 0
let iguales = 0
const difs = []
for (const fb of base.filas) {
  const fn = mapaNuevo.get(clave(fb))
  if (!fn) {
    difs.push(`FALTA fila ${clave(fb)}`)
    continue
  }
  const pn = new Map(aplanar(fn))
  for (const [k, v] of aplanar(fb)) {
    celdas += 1
    if (pn.get(k) === v) iguales += 1
    else difs.push(`${clave(fb)} · ${k}: ${v} → ${pn.get(k)}`)
  }
}
const columnas = new Set(base.filas.flatMap((f) => aplanar(f).map(([k]) => k)))
console.log(
  `filas base ${base.filas.length} · filas nuevas ${nuevo.filas.length} · columnas ${columnas.size} · ` +
    `celdas iguales ${iguales}/${celdas}`,
)
for (const d of difs) console.log('  ' + d)
process.exitCode = difs.length === 0 && base.filas.length === nuevo.filas.length ? 0 : 1
