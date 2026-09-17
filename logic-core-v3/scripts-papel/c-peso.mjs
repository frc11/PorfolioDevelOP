/**
 * PAPEL-2 · C — LA CIFRA EXACTA DEL LANE, EN BYTES, PARA UN BUILD.
 *
 *     node scripts-papel/c-peso.mjs .next-papel
 *
 * `s5-peso.invariant.ts` publica el número en KiB con un decimal, que es lo que
 * un techo necesita; un A/B necesita el BYTE. Esto reproduce su cuenta —los
 * chunks propios de `/v3` menos el preámbulo de Sentry— leyendo el mismo
 * manifiesto, y no agrega ni una resta propia.
 *
 * ⚠ Lee el HTML construido de `/v3` para saber cuáles son los chunks de la ruta,
 * igual que `conjuntoInicial()`: **sólo `<script src>`**, o sea sólo JavaScript.
 * El CSS y los `.woff2` no entran en esta cuenta y nunca entraron.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

const DIST = process.argv[2] ?? '.next'

const htmlDe = (ruta) => {
  for (const candidato of [path.join(DIST, 'server/app', `${ruta}.html`), path.join(DIST, 'server/pages', `${ruta}.html`)]) {
    try {
      return readFileSync(candidato, 'utf8')
    } catch {
      /* sigue */
    }
  }
  throw new Error(`no encuentro el HTML de ${ruta} en ${DIST}`)
}

const scriptsDe = (ruta) => [...new Set([...htmlDe(ruta).matchAll(/\/_next\/(static\/[^"']+?\.js)/g)].map((m) => m[1]))]

/** Los chunks que TAMBIÉN pide el layout raíz: heredados, no del lane. */
const deLaRaiz = new Set(scriptsDe('/index').length > 0 ? scriptsDe('/index') : [])

const RE_PREAMBULO_DE_SENTRY = /^!function\(\)\{try\{var [\s\S]*?\}catch\(e\)\{\}\}\(\)[;,]/
const preambuloDe = (f) => RE_PREAMBULO_DE_SENTRY.exec(readFileSync(path.join(DIST, f), 'utf8'))?.[0].length ?? 0

const todos = scriptsDe('/v3')
const propios = todos.filter((f) => !deLaRaiz.has(f))
const crudo = propios.reduce((n, f) => n + statSync(path.join(DIST, f)).size, 0)
const preambulo = propios.reduce((n, f) => n + preambuloDe(f), 0)

console.log(`dist: ${DIST}  ·  build ${readFileSync(path.join(DIST, 'BUILD_ID'), 'utf8').trim()}`)
console.log(`  chunks de /v3: ${todos.length} · propios: ${propios.length} · heredados: ${todos.length - propios.length}`)
for (const f of propios) console.log(`    ${String(statSync(path.join(DIST, f)).size).padStart(7)} B  ${f}`)
console.log(`  crudo propio            ${crudo.toFixed(1)} B`)
console.log(`  preámbulo de Sentry     ${preambulo.toFixed(1)} B`)
console.log(`  ESCRITO POR EL LANE     ${(crudo - preambulo).toFixed(1)} B`)
