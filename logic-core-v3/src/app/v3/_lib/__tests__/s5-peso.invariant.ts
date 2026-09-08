/**
 * INVARIANTE TRANSVERSAL — el peso de `/v3`: lo PROPIO se afirma, lo HEREDADO
 * se publica con atribución.
 *
 * Corre con `npm run build` y después `npm run test:s5-peso`.
 *
 * ── Regla 13 del proyecto, y por qué existe ───────────────────────────────
 *
 * *Un invariante afirma lo que su sprint controla. Lo que hereda se publica con
 * atribución y se vigila, pero no se afirma.* La regla nació de `s3-peso`, que
 * afirmaba el total de la carga inicial de `/v3` y fallaba por 24 archivos del
 * layout RAÍZ que ese sprint tenía prohibido tocar. **Un check puesto a fallar
 * por algo que su sprint no produce ni puede arreglar no protege: entrena a
 * ignorarlo.**
 *
 * ═══ QUÉ CAMBIÓ EN SITIO-S7, Y POR QUÉ ESTE ARCHIVO SE PONE MEJOR ═════════
 *
 * Este invariante medía `/v3/secciones-a`, la ruta donde el lane mostraba sus
 * cuatro secciones, y partía su carga inicial en TRES —heredado del home, de
 * `/v3`, y del lane— porque eso era lo que hacía medible *cuánto agrega este
 * lane*. **Esa ruta ya no existe**: se borró al componer el home, que es lo que
 * su propio docblock declaraba como fecha de baja.
 *
 * La partición de tres se fue con ella y **no se reemplaza por una peor**: las
 * cuatro secciones ahora son parte de `/v3`, así que lo que se mide es `/v3`.
 *
 * Y hay algo que este archivo puede afirmar hoy y no podía cuando se escribió.
 * Su propio cierre decía:
 *
 * > *"La consecuencia que este lane NO resuelve y publica: el sistema de motion
 * > viaja también abajo de 1025 en esta ruta. […] Es una decisión de la
 * > composición del home, no de este lane."*
 *
 * La composición del home llegó. **Ese pendiente se cierra acá, afirmándolo:**
 * el presupuesto de este lane sumaba 28,2 KiB porque el sistema de motion
 * bajaba estáticamente, y ahora **no baja**. Un instrumento que declaró una
 * deuda es el lugar correcto para afirmar que se pagó.
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

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · La cifra, con su reparto')

console.log(`  /v3 entero  ${kib(pesoTotal.crudo)} crudo · ${kib(pesoTotal.gzip)} gzip — ${inicial.length} archivos`)
console.log(`    heredado del layout raíz : ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo`)
console.log(`    propio de /v3            : ${propios.length} archivos · ${kib(pesoPropio.crudo)} crudo · ${kib(pesoPropio.gzip)} gzip`)
for (const f of propios) console.log(`      · ${f}`)
console.log('  DE QUIÉN ES lo heredado: el layout RAÍZ importa estáticamente el chrome viejo.')
console.log('  Estos sprints tienen PROHIBIDO tocarlo. Se publica, no se afirma (regla 13).')

afirmar(pesoPropio.crudo > 0, 'lo propio pesa más de cero bytes: las ocho secciones existen en el build')
afirmar(heredados.length > 0, 'y el heredado se pudo medir: la partición no está vacía')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL PRESUPUESTO PROPIO, con la cuenta a la vista')

import {
  ARREGLO_DE_B7_KIB,
  HEREDADO_SIN_DECLARAR_KIB,
  MONTAJE_DE_B4A_KIB,
  MONTAJES_DECLARADOS_KIB,
  PRESUPUESTO_DEL_LANE_KIB,
  PRESUPUESTO_PROPIO_KIB,
} from './s5-presupuesto'


/** El preámbulo que `@sentry/nextjs` le pone a la cabeza de cada chunk. Se
 *  detecta por su forma, no por su largo: si cambiara de tamaño, la resta se
 *  mueve con él. */
const RE_PREAMBULO_DE_SENTRY = /^!function\(\)\{try\{var [\s\S]*?\}catch\(e\)\{\}\}\(\)[;,]/
const preambuloDe = (f: string): number =>
  RE_PREAMBULO_DE_SENTRY.exec(readFileSync(path.join(DIST, f), 'utf8'))?.[0].length ?? 0

const preambuloPropio = propios.reduce((n, f) => n + preambuloDe(f), 0)
const preambuloHeredado = heredados.reduce((n, f) => n + preambuloDe(f), 0)
const escritoPorElLane = pesoPropio.crudo - preambuloPropio

console.log(`  HEREDADO Y PUBLICADO (regla 13): ${kib(preambuloPropio)} de preámbulo de \`@sentry/nextjs\` en los ${propios.length} chunks propios`)
console.log(`    — 348 B por chunk, inyectados por la integración de Sentry de la configuración RAÍZ, que estos sprints tienen PROHIBIDA.`)
console.log(`    — el mismo preámbulo pesa ${kib(preambuloHeredado)} en los ${heredados.length} chunks heredados. Es del build, no del lane.`)
console.log(`  ⚠️ Es EXACTAMENTE el desvío que B2 publicó (61,3 contra 60): 1,36 KiB. El techo no se movió por eso.`)

afirmar(
  preambuloPropio > 0,
  `  y el detector del preámbulo NO está ciego: lo encontró en ${propios.filter((f) => preambuloDe(f) > 0).length} de los ${propios.length} chunks propios`,
)
console.log(
  `  EL TECHO: ${PRESUPUESTO_PROPIO_KIB} KiB = ${PRESUPUESTO_DEL_LANE_KIB} del lane` +
    ` + ${MONTAJE_DE_B4A_KIB} que B4-A monta (la marca en sus tres superficies + la meseta)` +
    ` + ${ARREGLO_DE_B7_KIB} que B7 monta (el proveedor de \`prefers-reduced-motion\`, 0,52 medidos A/B)` +
    ` + ${HEREDADO_SIN_DECLARAR_KIB} HEREDADOS y publicados con su dueño: 0,11 medidos que ya estaban en rojo antes de que B7 tocara producto.`,
)
console.log('    Lo subió el humano en la parada, con el número medido. La alternativa era no montar la marca: por eso la decisión es revocable.')
afirmar(
  escritoPorElLane / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo que ESCRIBE el lane entra en ${PRESUPUESTO_PROPIO_KIB} KiB crudo`,
  `${kib(escritoPorElLane)} — ${(PRESUPUESTO_PROPIO_KIB - escritoPorElLane / 1024).toFixed(2)} KiB de aire · ${kib(pesoPropio.crudo)} con el preámbulo heredado adentro`,
)
afirmar(
  escritoPorElLane / 1024 - MONTAJES_DECLARADOS_KIB < PRESUPUESTO_DEL_LANE_KIB,
  `  y el techo VIEJO sigue vigilando todo lo que NO está declarado: sin los ${MONTAJES_DECLARADOS_KIB} KiB de montajes con nombre, el lane entra en ${PRESUPUESTO_DEL_LANE_KIB} KiB`,
  `${kib(escritoPorElLane - MONTAJES_DECLARADOS_KIB * 1024)} — es la cifra que la afirmación mira, y desmontar los montajes declarados tiene que devolverla a 59,94`,
)

controlPositivo(
  'el presupuesto no se cumple solo: con un techo de 1 KiB, lo propio de hoy NO entra',
  1,
  (techo: number) => escritoPorElLane / 1024 < techo,
)
controlPositivo(
  'y la resta no es un cheque en blanco: sin restar el preámbulo, el número publicado es OTRO',
  pesoPropio.crudo,
  (crudo: number) => crudo === escritoPorElLane,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · LA DEUDA QUE ESTE INVARIANTE DECLARÓ, PAGADA')

/**
 * El sistema de motion ya NO viaja en la carga inicial. Es lo que este archivo
 * publicaba como "la consecuencia que este lane no resuelve", y es lo que la
 * composición del home resolvió. Se afirma con las mismas cinco huellas que
 * `test:s2-bundle` usa: cinco módulos distintos del sistema, no una marca sola.
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
titulo('5 · La ruta que este invariante medía ya no existe')

for (const borrada of RUTAS_BORRADAS) {
  afirmar(
    htmlDe(borrada.ruta) === '',
    `\`${borrada.ruta}\` no está en el build: se borró al componer el home`,
    borrada.motivo,
  )
}

cerrar('s5-peso.invariant')
