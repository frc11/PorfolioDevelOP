/**
 * INVARIANTE TRANSVERSAL — el peso de `/v3`: lo PROPIO se afirma, lo HEREDADO
 * se publica con atribución (regla 13).
 *
 * Corre con `npm run build` y después `npm run test:s5-peso`.
 *
 * MODO PULIDO — COLAPSADO A UN TECHO. Hasta este sprint, el presupuesto vivía
 * repartido en dieciséis líneas con nombre, cada una con su recibo, su A/B
 * entre builds y su propio control positivo. Mantener esa contabilidad
 * costaba más de lo que protegía (la historia completa está en `git log` de
 * este archivo, antes de esta versión). Lo que queda es UN techo y UNA
 * afirmación: que lo que el lane escribe hoy no crezca más del margen
 * declarado. El techo es el peso medido en la parada de este sprint más 15%.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { DIST, conjuntoInicial, exigirBuild, htmlDe, kib, partirCargaInicial, pesar } from './s3-bundle'
import { RUTAS_BORRADAS } from './s4-rutas-de-demo'

exigirBuild()

const RUTA = '/v3'

const inicial = conjuntoInicial(RUTA)
const inicialHome = conjuntoInicial('/')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La ruta existe en el build, y la partición no está vacía')

afirmar(htmlDe(RUTA) !== '', `la ruta ${RUTA} está prerenderizada en el build`)
afirmar(inicial.length > 0, `su carga inicial son ${inicial.length} archivos`)
afirmar(inicialHome.length > 0, `  y la del home ${inicialHome.length}, contra la que se parte`)

const { heredados, propios, pesoHeredado, pesoPropio } = partirCargaInicial(inicial, inicialHome)
const pesoTotal = pesar(inicial)

afirmar(pesoPropio.crudo > 0, 'lo propio pesa más de cero bytes: las ocho secciones existen en el build')
afirmar(heredados.length > 0, 'y el heredado se pudo medir: la partición no está vacía')

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · EL TECHO — una sola cifra, con lo heredado publicado aparte (regla 13)')

/** El preámbulo que `@sentry/nextjs` le pone a la cabeza de cada chunk. Se
 *  detecta por su forma, no por su largo: si cambiara de tamaño, la resta se
 *  mueve con él. Es HEREDADO del layout raíz —estos sprints tienen prohibido
 *  tocarlo— y por eso se publica y no se afirma. */
const RE_PREAMBULO_DE_SENTRY = /^!function\(\)\{try\{var [\s\S]*?\}catch\(e\)\{\}\}\(\)[;,]/
const preambuloDe = (f: string): number =>
  RE_PREAMBULO_DE_SENTRY.exec(readFileSync(path.join(DIST, f), 'utf8'))?.[0].length ?? 0

const preambuloPropio = propios.reduce((n, f) => n + preambuloDe(f), 0)
const escritoPorElLane = pesoPropio.crudo - preambuloPropio

/** El techo: 70,53 KiB medidos en la parada de este sprint (Modo pulido, Sep
 *  2026) más 15% de margen. Subirlo pide una nueva parada y una nueva medición
 *  — no una línea más. */
const TECHO_KIB = 81.11

console.log(`  /v3 propio  ${kib(pesoPropio.crudo)} crudo con preámbulo heredado · ${kib(escritoPorElLane)} sin él — ${propios.length} archivos`)
console.log(`  /v3 entero  ${kib(pesoTotal.crudo)} crudo · ${kib(pesoTotal.gzip)} gzip — ${inicial.length} archivos`)
console.log(`  HEREDADO Y PUBLICADO (regla 13): ${kib(preambuloPropio)} de preámbulo de \`@sentry/nextjs\` en los chunks propios, más ${kib(pesoHeredado.crudo)} en ${heredados.length} chunks heredados del layout raíz. Estos sprints tienen PROHIBIDO tocarlo.`)

afirmar(
  preambuloPropio > 0,
  `el detector del preámbulo no está ciego: lo encontró en ${propios.filter((f) => preambuloDe(f) > 0).length} de los ${propios.length} chunks propios`,
)
afirmar(
  escritoPorElLane / 1024 < TECHO_KIB,
  `lo que /v3 escribe, sin el preámbulo heredado, entra en el techo de ${TECHO_KIB} KiB`,
  `${kib(escritoPorElLane)} — ${(TECHO_KIB * 1024 - escritoPorElLane).toFixed(1)} B de aire`,
)
controlPositivo(
  'el techo no se cumple solo: con un techo de 1 KiB, lo propio de hoy NO entra',
  1,
  (techo: number) => escritoPorElLane / 1024 < techo,
)
controlPositivo(
  'y la resta del preámbulo no es un cheque en blanco: sin restarlo, el número publicado es otro',
  pesoPropio.crudo,
  (crudo: number) => crudo === escritoPorElLane,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La deuda que este invariante declaró, pagada')

/**
 * El sistema de motion ya NO viaja en la carga inicial. Se afirma con las
 * mismas cinco huellas que `test:s2-bundle` usa: cinco módulos distintos del
 * sistema, no una marca sola.
 */
const HUELLAS_DEL_SISTEMA = [
  'salida-fuerte',
  'atado-al-scroll',
  'simetrica-suave',
  'data-lineas-piezas',
  'bottom-=240px',
]
const contiene = (f: string, aguja: string): boolean =>
  readFileSync(path.join(DIST, f), 'utf8').includes(aguja)

for (const huella of HUELLAS_DEL_SISTEMA) {
  afirmar(
    inicial.filter((f) => contiene(f, huella)).length === 0,
    `\`${huella}\` NO está en la carga inicial de /v3 — la deuda de este lane, pagada`,
  )
}
console.log('  el chunk de la coreografía se pesa en `test:s7-compuerta`, que es de quien la construyó.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La ruta que este invariante medía ya no existe')

for (const borrada of RUTAS_BORRADAS) {
  afirmar(
    htmlDe(borrada.ruta) === '',
    `\`${borrada.ruta}\` no está en el build: se borró al componer el home`,
    borrada.motivo,
  )
}

cerrar('s5-peso.invariant')
