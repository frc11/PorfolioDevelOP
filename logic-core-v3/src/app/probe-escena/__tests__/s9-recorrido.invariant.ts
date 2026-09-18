/**
 * COMPROBACIONES DE S9 · el dato del recorrido definitivo.
 *
 *     npx tsx src/app/probe-escena/__tests__/s9-recorrido.invariant.ts
 *
 * Esta mitad mira el recorrido **por dentro**: su forma, su relación con los
 * seis tramos, y el margen contra el piso. Cómo se compone contra la escena está
 * en `s9-composicion.invariant.ts`; lo que S7 verificaba sobre la coreografía
 * calibrada, en `s7-recorridos.invariant.ts`. Los instrumentos viven en
 * `s9-recorrido-soporte.ts` desde V3-E, por la regla de las 300 líneas: acá
 * quedan las CIFRAS y lo que se afirma de ellas.
 *
 *   1. Seis poses, SIETE entradas, cero derivados — y el único sostén que queda
 *      es copia exacta, no "casi igual".
 *   2. Una pose por tramo: la del hero ABRE el suyo, las otras cinco lo CIERRAN.
 *
 * ⚠️ **Modo pulido sacó la velocidad de arranque/cierre y el margen de despeje
 * del piso** (Parte 4 del sprint): eran composición.
 *
 * ── ⚠️ LAS AFIRMACIONES QUE V3-E REESCRIBIÓ ─────────────────────────
 *
 * V3-B sacó `hero · sostén` —decisión medida, no accidente— y este archivo quedó
 * con cuatro comprobaciones en rojo que describían **la decisión vieja**: ocho
 * entradas, el sostén del hero como copia exacta, el tramo del hero cerrando en
 * una pose, y la cámara pedida QUIETA en toda la primera pantalla.
 *
 * Ninguna se borró y ninguna bajó la vara: **se reescribieron contra la
 * propiedad nueva**, y quedaron más fuertes porque las cardinalidades pasaron a
 * derivarse. El censo ya no dice "ocho": dice `poses distintas + sostenes`, con
 * las poses contra `CHOREO_TRAMOS.length`. Los sostenes se derivan del array y
 * se comparan contra la tabla, así que uno que VUELVA pone esto en rojo. El
 * reparto de tramos declara cuál abre y cuáles cierran, y las dos tablas tienen
 * que cubrir los seis exactamente una vez. Y la quietud del arranque pasó a ser
 * su contraria, con el control que la discrimina: con el sostén repuesto el
 * mismo instrumento mide cero.
 *
 * ── Lo que este archivo NO verifica, a propósito ───────────────────────────
 *
 * **La regla de amplitud de los 90° por tramo quedó anulada.** Era
 * aritméticamente imposible —cinco tramos × 90° son 450° sobre una vuelta de
 * 360— y el dueño la retiró. No se comprueba en ningún lado.
 */
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '@/app/v3/_lib/escena/choreography'
import { check, makeTrack, report, section } from './harness'
import {
  type Par,
  comoTexto,
  enElBorde,
  firma,
  sostenesDerivados,
} from './s9-recorrido-soporte'

const track = makeTrack(CHOREO_KEYFRAMES)
const byName = new Map(CHOREO_KEYFRAMES.map((keyframe) => [keyframe.name, keyframe]))

// ── 1 · La forma del recorrido ──────────────────────────────────────────────

section('Seis poses, siete entradas, cero relleno')

check(
  'ninguna lleva la marca `derived`',
  CHOREO_KEYFRAMES.every((keyframe) => keyframe.derived !== true)
)

const distintas = new Set(CHOREO_KEYFRAMES.map(firma))
check(
  'una pose distinta por tramo, ni una de más',
  distintas.size === CHOREO_TRAMOS.length,
  `${distintas.size} poses distintas y ${CHOREO_TRAMOS.length} tramos`
)

/**
 * ⚠️ **QUEDA UN SOSTÉN SOLO, Y LA TABLA SE CIERRA CONTRA EL ARRAY.** V3-B sacó
 * el del hero: existía para que la cámara no se moviera en la primera pantalla y
 * el dueño lo retiró mirando —*«el fondo no scrollea con el mouse en un
 * principio»*—. La comprobación vieja recorría esta tabla y pedía que cada fila
 * estuviera en el array; con el hero afuera daba «falta uno de los dos», que es
 * el rojo correcto para la decisión vieja y ninguna afirmación para la nueva.
 * Ahora cierra **en los dos sentidos** (ver `sostenesDerivados`): uno que VUELVA
 * pone esto en rojo sin que nadie se acuerde de agregarlo acá, y uno declarado
 * que no esté, también.
 */
const SOSTENES: readonly Par[] = [['cierre', 'cierre · sostén']]

const sostenes = sostenesDerivados(CHOREO_KEYFRAMES)
check(
  'el ÚNICO sostén del recorrido es el del cierre, y es copia exacta de su pose',
  comoTexto(sostenes) === comoTexto(SOSTENES),
  `derivados del array: ${comoTexto(sostenes)} · declarados: ${comoTexto(SOSTENES)}`
)
check(
  'control positivo — el derivador NO da un sostén donde las poses difieren',
  sostenesDerivados(
    CHOREO_KEYFRAMES.map((keyframe, i) =>
      i === CHOREO_KEYFRAMES.length - 1
        ? { ...keyframe, pose: { ...keyframe.pose, distance: keyframe.pose.distance + 1 } }
        : keyframe
    )
  ).length === 0,
  'moviéndole 1 a la distancia del sostén, la misma función devuelve cero: compara la pose, no el nombre'
)
check(
  'y el hero ya no tiene el suyo: ningún keyframe se llama así',
  !CHOREO_KEYFRAMES.some((keyframe) => keyframe.name === 'hero · sostén'),
  CHOREO_KEYFRAMES.map((keyframe) => keyframe.name).join(' · ')
)

/**
 * ⚠️ **EL CENSO SE DERIVA.** Decía «ocho entradas» con un 8 escrito, y una
 * cardinalidad a mano no sobrevive a una decisión: son las poses distintas —una
 * por tramo— más los sostenes derivados.
 */
check(
  'las entradas del array son las poses más los sostenes, sin relleno',
  CHOREO_KEYFRAMES.length === distintas.size + sostenes.length,
  `${CHOREO_KEYFRAMES.length} keyframes = ${distintas.size} poses + ${sostenes.length} sostén`
)

check(
  '`frameY` sigue en cero en todas',
  CHOREO_KEYFRAMES.every((keyframe) => keyframe.pose.frameY === 0)
)

section('Una pose por tramo, en el borde de su tramo')

/**
 * ⚠️ **EL HERO CAMBIÓ DE BORDE (V3-B).** Con el sostén, su tramo CERRABA en una
 * pose: la copia en 0,125. Sin él el único keyframe del hero está en 0 —el
 * `from` de su tramo— y ninguno cae en su `to`; la comprobación vieja pedía que
 * los seis cerraran y daba `hero → ?`. No se le sacó el hero a la lista: **se
 * declara de qué lado está**, y las dos tablas juntas tienen que cubrir los seis
 * exactamente una vez, así que un tramo que no entre en ninguna se pone en rojo.
 */
const CIERRA_TRAMO: readonly Par[] = [
  ['quiénes somos', 'quiénes somos'],
  ['números', 'números'],
  ['trabajos', 'trabajos'],
  ['demos', 'demos'],
  ['cierre', 'cierre · sostén'],
]
/** El tramo cuya pose está en la APERTURA: el hero, desde V3-B. */
const ABRE_TRAMO: readonly Par[] = [['hero', 'hero']]
check(
  'hay un tramo por cada nombre de la tabla del sprint',
  CHOREO_TRAMOS.map((tramo) => tramo.name).join(' · ') ===
    'hero · quiénes somos · números · trabajos · demos · cierre',
  CHOREO_TRAMOS.map((tramo) => tramo.name).join(' · ')
)

const repartidos = [...ABRE_TRAMO, ...CIERRA_TRAMO].map(([tramoName]) => tramoName).sort()
check(
  'las dos tablas cubren los seis tramos exactamente una vez',
  repartidos.join(' · ') ===
    CHOREO_TRAMOS.map((tramo) => tramo.name)
      .slice()
      .sort()
      .join(' · '),
  `${ABRE_TRAMO.length} abre + ${CIERRA_TRAMO.length} cierran = ${repartidos.length} de ${CHOREO_TRAMOS.length}`
)

const cierran = enElBorde(CIERRA_TRAMO, 'to', CHOREO_TRAMOS, byName)
check('los cinco tramos que cierran terminan exactamente en su pose', cierran.ok, cierran.detalle)

const abre = enElBorde(ABRE_TRAMO, 'from', CHOREO_TRAMOS, byName)
check('y el del hero ARRANCA en la suya, que es donde aterriza el preloader', abre.ok, abre.detalle)
check(
  'control positivo — el mismo comparador da falso si se le pide el borde equivocado',
  !enElBorde(ABRE_TRAMO, 'to', CHOREO_TRAMOS, byName).ok &&
    !enElBorde(CIERRA_TRAMO, 'from', CHOREO_TRAMOS, byName).ok,
  'el hero no cierra en su pose y los otros cinco no abren en la suya: la tabla no es intercambiable'
)

const unwrapped = track.unwrappedAngles[track.unwrappedAngles.length - 1]
check('la vuelta acumula 360 exacto', unwrapped === 360, `ángulo desenvuelto final ${unwrapped}`)

report('s9 · el dato del recorrido definitivo')
