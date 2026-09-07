import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { RAIZ } from '../../__tests__/s4-corrida'
import { quitarComentarios } from '../../__tests__/s3-escaneo'
import { MOUSE_ANGLE_DEG_MAXIMO, MOUSE_HEIGHT_FACTOR, MOUSE_TAU, SETTLE_TAU } from '../choreographyPhysics'
import {
  crearDesplazamiento,
  crearPuntero,
  desplazamientoDelMouse,
  perseguirAlPuntero,
  sinDesplazamiento,
  soltarElPuntero,
} from '../modulacionDeLaPose'

/**
 * B5 (suite s18) · LA MODULACIÓN DE LA POSE — que NO PUEDA tocar el progreso.
 *
 * ── La regla que este archivo custodia ────────────────────────────────────
 *
 * *«La deriva, el asentamiento y el mouse son un desplazamiento SOBRE LA POSE,
 * nunca un cambio del progreso. Si la cámara moviéndose sola altera el
 * progreso, el anclaje se rompe y se caen las 4.751 afirmaciones que descansan
 * en él.»*
 *
 * ── ⚠️ Y por qué se afirma la FORMA y no sólo el comportamiento ───────────
 *
 * Porque son dos garantías de fuerza distinta. «Medimos que no lo escribe» vale
 * para la corrida de hoy; «no puede escribirlo» vale para siempre. El módulo no
 * recibe el store: sus funciones toman números y devuelven números, y no hay una
 * referencia al rig en todo el archivo. §1 afirma eso sobre el fuente —que es
 * donde vive— y §2 lo corrobora sobre el valor, con control positivo.
 */

const leer = (relativo: string): string => readFileSync(path.join(RAIZ, relativo), 'utf8')

const MODULO = 'src/app/v3/_lib/escena/modulacionDeLaPose.ts'
/**
 * ⚠️ **SIN COMENTARIOS, Y ES LA MISMA RAZÓN QUE `_intro/condiciones.ts` §3.2
 * escribió antes:** el docblock del módulo NOMBRA `rig.set('progress', …)` —para
 * NEGARLO, que es justamente la garantía que este archivo custodia—. Sin borrar
 * los comentarios, el chequeo pondría en rojo el trabajo de haber escrito la
 * garantía.
 */
const FUENTE = quitarComentarios(leer(MODULO))
const FUENTE_ENTERA = leer(MODULO)

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · La forma: el módulo NO PUEDE ver el store')

afirmar(FUENTE_ENTERA.length > 0, `\`${MODULO}\` existe y se leyó (${FUENTE_ENTERA.length} bytes, ${FUENTE.length} sin comentarios)`)
afirmar(
  FUENTE_ENTERA.includes("rig.set('progress'"),
  '  y su docblock SÍ nombra la escritura del progreso — para NEGARLA: la garantía está escrita, no supuesta',
)
for (const prohibido of ['probeStore', 'ProbeRigStore', 'ProbeParamsStore', "rig.set", "'progress'", 'setMany']) {
  afirmar(
    !FUENTE.includes(prohibido),
    `  no nombra \`${prohibido}\`: sin el store no hay a qué escribirle`,
  )
}
/**
 * ⚠️ El patrón cubre importaciones de VARIAS líneas, y no es un detalle: la de
 * `choreographyPhysics` pasó a multilínea al crecer la lista, y con un
 * `^import[^\n]*from` el lector devolvía UNA sola importación y la afirmación
 * salía roja por no saber leer, no por un import de más.
 */
const IMPORTS = [...FUENTE_ENTERA.matchAll(/\bfrom '([^']+)'/g)].map((m) => m[1])
afirmarIgual(
  IMPORTS,
  ['./choreographySampler', './choreographyPhysics'],
  '  y sus DOS únicas importaciones son la amortiguación y las constantes — ninguna trae estado',
)
controlPositivo(
  'el lector de importaciones ve una multilínea',
  "import {\n  A,\n  B,\n} from './probeStore'",
  (f: string) => [...f.matchAll(/\bfrom '([^']+)'/g)].length === 0,
)
controlPositivo(
  'el detector de acceso al store no está ciego',
  "import type { ProbeRigStore } from './probeStore'\nrig.set('progress', 1)",
  (f: string) => !f.includes('probeStore') && !f.includes("rig.set"),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · El valor: el desplazamiento es función de sus argumentos y de nada más')

const destino = crearDesplazamiento()
const puntero = crearPuntero()

afirmarIgual(
  desplazamientoDelMouse(destino, { x: 0, y: 0 }, 12, 1, 0),
  { angleDeg: 0, height: 0 },
  'con el puntero en el centro el desplazamiento es exactamente CERO',
)
afirmarIgual(
  desplazamientoDelMouse(destino, { x: 1, y: 0 }, 12, 1, 0).angleDeg,
  MOUSE_ANGLE_DEG_MAXIMO,
  `con el puntero al borde derecho y el progreso en el hero, el azimut se corre ${MOUSE_ANGLE_DEG_MAXIMO}°`,
)
afirmarIgual(
  desplazamientoDelMouse(destino, { x: -1, y: 0 }, 12, 1, 0).angleDeg,
  -MOUSE_ANGLE_DEG_MAXIMO,
  '  y al borde izquierdo, lo mismo con el signo cambiado: es simétrico',
)
afirmarIgual(
  desplazamientoDelMouse(destino, { x: 0, y: 1 }, 12, 1, 0).height,
  MOUSE_HEIGHT_FACTOR * 12,
  'la altura escala con la DISTANCIA: el desplazamiento en pantalla es el mismo en toda la órbita',
)
afirmarIgual(
  desplazamientoDelMouse(destino, { x: 1, y: 1 }, 12, 0, 0).angleDeg,
  0,
  'con la perilla en 0 no hay desplazamiento: `mouseScale` apaga la modulación entera',
)
afirmarIgual(
  desplazamientoDelMouse(destino, { x: 1, y: 0 }, 12, 2, 0).angleDeg,
  MOUSE_ANGLE_DEG_MAXIMO * 2,
  '  y es lineal en la perilla',
)
afirmarIgual(sinDesplazamiento(destino), { angleDeg: 0, height: 0 }, 'el desplazamiento nulo es cero en los dos canales')

/**
 * DOS LLAMADAS IDÉNTICAS DEVUELVEN LO MISMO. Es la mitad de «no toca el
 * progreso» que se puede afirmar sobre el valor: una función que además
 * escribiera en algún lado tendría algo que la segunda llamada vería distinto.
 */
const a = { ...desplazamientoDelMouse(crearDesplazamiento(), { x: 0.37, y: -0.62 }, 9.4, 1, 0.3) }
const b = { ...desplazamientoDelMouse(crearDesplazamiento(), { x: 0.37, y: -0.62 }, 9.4, 1, 0.3) }
afirmarIgual(a, b, 'dos llamadas con los mismos argumentos dan el mismo objeto, bit a bit')
controlPositivo(
  'el comparador de igualdad no está ciego',
  { angleDeg: a.angleDeg + 1e-9, height: a.height },
  (x: { angleDeg: number; height: number }) => JSON.stringify(x) === JSON.stringify(a),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · La persecución del puntero: arrastra, converge y suelta')

soltarElPuntero(puntero)
afirmarIgual(puntero, { x: 0, y: 0 }, 'soltar el puntero lo deja en cero')

perseguirAlPuntero(puntero, 1, 1, 1 / 60)
const primerPaso = puntero.x
afirmar(primerPaso > 0 && primerPaso < 1, `un cuadro cubre una fracción del camino, no el camino: ${primerPaso.toFixed(4)}`)
/** τ es el tiempo en que se cubre el 63 %. A `MOUSE_TAU` exacto tiene que estar ahí. */
soltarElPuntero(puntero)
for (let i = 0; i < 600; i += 1) perseguirAlPuntero(puntero, 1, 0, MOUSE_TAU / 600)
afirmar(
  Math.abs(puntero.x - (1 - Math.exp(-1))) < 0.01,
  `a τ = ${MOUSE_TAU}s el puntero cubrió el 63 % del camino: ${puntero.x.toFixed(4)} contra ${(1 - Math.exp(-1)).toFixed(4)}`,
)
afirmar(
  MOUSE_TAU > Math.max(...Object.values(SETTLE_TAU)),
  `y arrastra MÁS que cualquier canal del track (${MOUSE_TAU} contra ${Math.max(...Object.values(SETTLE_TAU))}): el offset llega después del contenido, no antes`,
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · Y el consumidor: `OrbitRig` suma el desplazamiento, no lo reemplaza')

const RIG = leer('src/app/v3/_lib/escena/OrbitRig.tsx')
afirmar(RIG.includes("from './modulacionDeLaPose'"), '`OrbitRig` trae la modulación del módulo, no la reimplementa')
afirmar(
  /angleDeg \+= desplazamiento\.angleDeg/.test(RIG) && /height \+= desplazamiento\.height/.test(RIG),
  '  y la SUMA a la pose del track: `+=`, nunca `=`',
)
afirmar(
  !/MOUSE_ANGLE_DEG|MOUSE_HEIGHT_FACTOR|MOUSE_TAU/.test(RIG),
  '  y ya no nombra ninguna constante del mouse: la cuenta tiene un solo dueño',
)
controlPositivo(
  'el detector de asignación directa no está ciego',
  'angleDeg = desplazamiento.angleDeg',
  (f: string) => /angleDeg \+= desplazamiento\.angleDeg/.test(f),
)

cerrar('s18-modulacion.invariant')
