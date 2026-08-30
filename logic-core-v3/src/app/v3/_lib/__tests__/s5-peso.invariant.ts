/**
 * INVARIANTE TRANSVERSAL — el peso del lane A: lo PROPIO se afirma, lo
 * HEREDADO se publica con atribución.
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
 * Acá la partición es de tres, no de dos, y es lo que hace medible la pregunta
 * del sprint —*cuánto agrega ESTE lane*—:
 *
 *     heredado   lo que la ruta comparte con el HOME  → del layout raíz
 *     de /v3     lo que comparte con /v3 y no con el home → de S1..S4
 *     del lane   lo que sólo pide `/v3/secciones-a`  → ESTO es lo nuestro
 *
 * ── El presupuesto propio, y de dónde sale ────────────────────────────────
 *
 * No es un número elegido: es la suma de dos medidos.
 *   · S1 fijó **30 KiB** para lo propio de `/v3`, y ese presupuesto rige.
 *   · S2 midió el chunk de la coreografía en **28,2 KiB crudo**, y este lane lo
 *     carga de forma ESTÁTICA —no por la compuerta— porque las secciones tienen
 *     que renderizar su contenido en los dos lados del umbral.
 * 30 + 28,2 = 58,2, redondeado hacia arriba a **60 KiB**. Está escrito acá con
 * la cuenta a la vista para que se pueda discutir el número y no la intención.
 *
 * ⚠ **La consecuencia que este lane NO resuelve y publica:** el sistema de
 * motion viaja también abajo de 1025 en esta ruta. La compuerta de S2 saca el
 * chunk del bundle porque lo que gatea es una RUTA entera; acá lo gateado es el
 * comportamiento de un contenido que tiene que renderizarse en los dos lados.
 * Separarlo en dos chunks obligaría a escribir cada sección dos veces. Es una
 * decisión de la composición del home, no de este lane.
 */

import { afirmar, cerrar, controlPositivo, titulo } from './afirmar'
import { conjuntoInicial, exigirBuild, htmlDe, kib, pesar } from './s3-bundle'
import { RUTAS_DE_DEMO } from './s4-rutas-de-demo'

exigirBuild()

const RUTA = '/v3/secciones-a'

const inicialLane = conjuntoInicial(RUTA)
const inicialV3 = conjuntoInicial('/v3')
const inicialHome = conjuntoInicial('/')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La ruta existe en el build, y la partición no está vacía')

afirmar(htmlDe(RUTA) !== '', `la ruta ${RUTA} está prerenderizada en el build`)
afirmar(inicialLane.length > 0, `su carga inicial son ${inicialLane.length} archivos`)
afirmar(inicialHome.length > 0, `  y la del home ${inicialHome.length}, contra la que se parte`)
afirmar(inicialV3.length > 0, `  y la de /v3 ${inicialV3.length}, contra la que se aísla lo del lane`)

const heredados = inicialLane.filter((f) => inicialHome.includes(f))
const deV3 = inicialLane.filter((f) => !inicialHome.includes(f) && inicialV3.includes(f))
const delLane = inicialLane.filter((f) => !inicialHome.includes(f) && !inicialV3.includes(f))

const pesoHeredado = pesar(heredados)
const pesoDeV3 = pesar(deV3)
const pesoDelLane = pesar(delLane)
const pesoTotal = pesar(inicialLane)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · LA CIFRA PUBLICADA — el total, con su reparto y su dueño')

console.log(`  ${RUTA}  ${kib(pesoTotal.crudo)} crudo · ${kib(pesoTotal.gzip)} gzip — ${inicialLane.length} archivos`)
console.log(
  `     heredado del layout RAÍZ (compartido con el home): ${heredados.length} archivos · ${kib(pesoHeredado.crudo)} crudo`,
)
console.log(
  `     de /v3 (S1..S4, compartido con /v3 y no con el home): ${deV3.length} archivos · ${kib(pesoDeV3.crudo)} crudo`,
)
console.log(
  `     PROPIO DEL LANE A (las cuatro secciones + contrato + motion): ${delLane.length} archivos · ${kib(pesoDelLane.crudo)} crudo · ${kib(pesoDelLane.gzip)} gzip`,
)
console.log(`     archivos propios del lane: ${delLane.join(' · ') || '(ninguno)'}`)
console.log('  DE QUIÉN ES LO HEREDADO: el layout RAÍZ importa estáticamente el chrome viejo')
console.log('  (Navbar, Shutter, Preloader, Lenis, sonner, el widget de chat). PublicOnlyComponents')
console.log('  los apaga en /v3 devolviendo null, pero el import estático ya metió los chunks en la')
console.log('  carga inicial de TODA ruta: apagar un componente no lo saca del bundle. Estos sprints')
console.log('  tienen PROHIBIDO tocarlo; se vuelve alcanzable en el sprint que REEMPLACE al home.')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · LO PROPIO — esto sí se afirma')

/** 30 KiB (presupuesto propio de /v3, S1) + 28,2 KiB (chunk de coreografía
 *  medido por S2, que acá viaja estático) = 58,2, redondeado a 60. */
const PRESUPUESTO_PROPIO_KIB = 60

afirmar(
  pesoDelLane.crudo / 1024 < PRESUPUESTO_PROPIO_KIB,
  `lo PROPIO del lane A < ${PRESUPUESTO_PROPIO_KIB} KiB crudo — 30 (propio de /v3, S1) + 28,2 (coreografía, S2)`,
  `${kib(pesoDelLane.crudo)} crudo · ${kib(pesoDelLane.gzip)} gzip · ${(PRESUPUESTO_PROPIO_KIB - pesoDelLane.crudo / 1024).toFixed(1)} KiB de aire`,
)

controlPositivo(
  'el presupuesto no se cumple solo: con un techo de cero, lo propio NO entra',
  0,
  (techo: number) => pesoDelLane.crudo / 1024 < techo,
)

afirmar(
  pesoDelLane.crudo > 0,
  'y lo propio pesa más de cero bytes: las cuatro secciones existen de verdad en el build',
  `${pesoDelLane.crudo} B`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · La compuerta de 1025, y lo que este lane NO acota')

/**
 * `/v3` sin secciones tiene su escenario detrás de un `dynamic(ssr:false)`, así
 * que abajo de 1025 ese chunk no se pide. Las secciones NO tienen esa
 * propiedad, y la diferencia hay que publicarla en vez de dejarla implícita.
 */
console.log(`  la coreografía de las secciones viaja en la carga inicial de ${RUTA} en TODOS los anchos.`)
console.log('  Abajo de 1025 el comportamiento sí está gateado —no se monta el motor, no se parte el')
console.log('  texto, no se escribe una transformada— pero el CÓDIGO baja igual. Acotar eso es partir')
console.log('  cada sección en dos árboles, y es una decisión de la composición del home.')
console.log(`  lo que este lane agrega sobre /v3 pelado: ${kib(pesoDelLane.crudo)} crudo · ${kib(pesoDelLane.gzip)} gzip`)

const enPadron = RUTAS_DE_DEMO.some((r) => r.ruta === RUTA)
afirmar(enPadron, 'la ruta está en el padrón de rutas de demo: el techo del heredado escala con ella')

cerrar('s5-peso.invariant')
