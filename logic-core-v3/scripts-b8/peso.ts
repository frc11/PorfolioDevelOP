/**
 * EL RECIBO DEL PESO — bytes exactos de lo que ESCRIBE el lane en un build.
 *
 *     npx tsx scripts-b8/peso.ts .next-b8
 *     npx tsx scripts-b8/peso.ts .next
 *
 * `s5-peso.invariant.ts` publica en KiB con un decimal; para dejar UNA línea
 * heredada con su número y la línea de B8 con el suyo hacen falta los bytes.
 * Es el mismo reparto y la misma resta del preámbulo de Sentry que usa el
 * invariante —las funciones son las de `s3-bundle.ts`, que lee el `distDir`
 * del segundo argumento—, corrido sobre el build aislado del árbol mergeado
 * antes de tocar producto (`.next-b8`, la línea de base) y sobre el build
 * final (`.next`). Un run por build, para que `DIST` no tenga dos valores.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { DIST, conjuntoInicial, exigirBuild, partirCargaInicial } from '../src/app/v3/_lib/__tests__/s3-bundle'

const RE_PREAMBULO_DE_SENTRY = /^!function\(\)\{try\{var [\s\S]*?\}catch\(e\)\{\}\}\(\)[;,]/

exigirBuild()
const inicial = conjuntoInicial('/v3')
const inicialHome = conjuntoInicial('/')
const { propios, pesoPropio } = partirCargaInicial(inicial, inicialHome)
const preambulo = propios.reduce((n, f) => n + (RE_PREAMBULO_DE_SENTRY.exec(readFileSync(path.join(DIST, f), 'utf8'))?.[0].length ?? 0), 0)
const escrito = pesoPropio.crudo - preambulo
console.log(`${process.argv[2] ?? '.next'}: ${propios.length} chunks propios · ${pesoPropio.crudo} B crudos · ${preambulo} B de preámbulo de Sentry · ${escrito} B escritos por el lane = ${(escrito / 1024).toFixed(3)} KiB`)
for (const f of propios) console.log(`   · ${f}`)
