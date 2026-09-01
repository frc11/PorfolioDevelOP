/**
 * COMPROBACIONES · qué le hace el arco del sol al modelado y a la visibilidad
 * de la fuente. Nació en S7 y **S9 la volvió a medir contra el recorrido
 * definitivo**, que es el único que corre.
 *
 *     npx tsx src/app/probe-escena/__tests__/s7-modelado.invariant.ts
 *
 * Las dos cosas que el arco tiene que resolver a la vez, y que tiran en
 * direcciones opuestas: **un sol solo entra en cuadro cuando está detrás del
 * objeto desde donde se lo mira**, y eso es exactamente el peor lugar para
 * modelarlo. Acá se verifica que el arco elegido no le saque modelado a ninguna
 * de las ventanas que llevan contenido, y que el contraluz caiga donde el
 * sprint lo pide.
 *
 * La métrica de modelado es γ: el ángulo 3D entre la dirección a la luz y la
 * dirección al observador, medido desde el objeto. Es el número que usa un
 * fotógrafo — γ→0 luz plana desde atrás de la cámara · 45–70 tres cuartos ·
 * ≈90 luz lateral · >130 contraluz.
 *
 * ── Lo que S9 dio vuelta, y por qué ────────────────────────────────────────
 *
 * En S7 la cámara vivía en azimut 0 durante más de medio recorrido y el
 * contraluz se gastaba entero adentro de Demos. El recorrido definitivo lee
 * contenido en seis azimuts repartidos por toda la vuelta, así que **el ángulo
 * relativo entre el sol y el observador recorre 180° sí o sí** y el contraluz
 * cae en algún lado. Cae donde la tabla del sprint lo pide: el fondo de Demos y
 * el cierre, que es el sol poniéndose detrás del logo.
 *
 * Por eso las ventanas están partidas en dos listas y no en una.
 */
import { CHOREO_KEYFRAMES } from '@/app/v3/_lib/escena/choreography'
import { sampleLightArc } from '@/app/v3/_lib/escena/choreographySampler'
import type { MutableLightLevels } from '@/app/v3/_lib/escena/choreographyTypes'
import {
  cameraAt,
  check,
  emptyPose,
  makeTrack,
  report,
  section,
  type Vec3,
} from './harness'

const RAD = Math.PI / 180
const arc: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }


const track = makeTrack(CHOREO_KEYFRAMES)

// ── 5 · Modelado y visibilidad ──────────────────────────────────────────────

section('Modelado: γ entre la luz y el observador')

/**
 * γ: ángulo 3D entre la dirección a la luz y la dirección al observador.
 *
 * `desdeLaCamara` es lo que hace que esto se pueda CONTROLAR: pone la luz sobre
 * el eje de la cámara, o sea luz plana perfecta (γ = 0). Es la entrada
 * deliberadamente equivocada con la que se prueba que el detector no esté ciego
 * — sin ella, "la luz modela" saldría en verde también con la cuenta rota.
 */
function gammaAt(p: number, fixed = false, desdeLaCamara = false): number {
  const pose = emptyPose()
  const cam = cameraAt(track, p, 16 / 9, pose)
  const view = cam.position
  const length = Math.hypot(view[0], view[1], view[2])
  sampleLightArc(p, arc)
  const az = (fixed ? -42 : arc.azimuthDeg) * RAD
  const el = (fixed ? 36 : arc.elevationDeg) * RAD
  // La entrada equivocada NO cortocircuita la cuenta: pone el vector de luz sobre
  // el eje del observador y deja que la MISMA trigonometría diga cuánto da.
  const light: Vec3 = desdeLaCamara
    ? [view[0] / length, view[1] / length, view[2] / length]
    : [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)]
  const cosine = (view[0] * light[0] + view[1] * light[1] + view[2] * light[2]) / length
  return (Math.acos(Math.min(1, Math.max(-1, cosine))) * 180) / Math.PI
}

function band(from: number, to: number, fixed = false, desdeLaCamara = false): { min: number; max: number } {
  let min = 999
  let max = -1
  for (let i = 0; i <= 40; i += 1) {
    const g = gammaAt(from + ((to - from) * i) / 40, fixed, desdeLaCamara)
    min = Math.min(min, g)
    max = Math.max(max, g)
  }
  return { min, max }
}

/** EL PREDICADO, con nombre: es lo que se corre contra la entrada equivocada. */
const noModela = ({ min, max }: { min: number; max: number }): boolean => min < 24 || max > 105

/**
 * Las ventanas donde el logo TIENE que estar modelado: las que llevan texto que
 * alguien lee. Son los tramos de reposo o de llegada, no el tramo entero — la
 * cámara pasa por muchos ángulos en el camino y ahí la luz hace lo que puede.
 */
const MODELADAS: readonly [string, number, number][] = [
  ['entrada', 0, 0.02],
  ['hero', 0.06, 0.125],
  ['quiénes somos', 0.35, 0.375],
  ['números', 0.478, 0.5],
  ['trabajos', 0.6, 0.625],
]

let modeladasOk = true
const bands: string[] = []
for (const [name, from, to] of MODELADAS) {
  const { min, max } = band(from, to)
  bands.push(`${name} ${min.toFixed(0)}–${max.toFixed(0)}°`)
  if (noModela({ min, max })) modeladasOk = false
}
check(
  'en las cinco ventanas que llevan texto la luz modela (tres cuartos o lateral)',
  modeladasOk,
  bands.join(' · ')
)

/**
 * ⚠️ **LOS CONTROLES POSITIVOS DE ESTE ARCHIVO (SITIO-S10).** El invariante corría
 * cuatro afirmaciones sobre γ **sin una sola entrada equivocada**: nada probaba
 * que `band()` supiera reportar una ventana mal iluminada, así que un γ roto
 * —una cuenta que devolviera siempre 90°— habría salido en verde. Se le da la
 * luz PLANA por antonomasia, la que viene del eje de la cámara.
 */
const planas = MODELADAS.map(([nombre, from, to]) => [nombre, band(from, to, false, true)] as const)
check(
  'control positivo — con la luz sobre el eje de la cámara, las cinco ventanas quedan SIN modelar',
  planas.every(([, b]) => noModela(b)),
  planas.map(([nombre, b]) => `${nombre} ${b.min.toFixed(0)}–${b.max.toFixed(0)}°`).join(' · ')
)
check(
  'control positivo — y el mínimo del recorrido entero cae DEBAJO del umbral de luz plana',
  !(Math.min(...Array.from({ length: 501 }, (_, i) => gammaAt(i / 500, false, true))) > 24),
  'es el mismo predicado que la afirmación de "no hay un solo punto con luz plana"'
)

/**
 * Y las dos donde el contraluz es la intención. Demos lo pide explícitamente
 * ("bajo, contraluz, sol visible en cuadro") y el cierre lo hereda: el sol se
 * está poniendo justo detrás del logo.
 */
const CONTRALUZ: readonly [string, number, number][] = [
  ['demos', 0.7, 0.75],
  ['cierre', 0.93, 1],
]

let contraluzOk = true
const contraluzBands: string[] = []
for (const [name, from, to] of CONTRALUZ) {
  const { min } = band(from, to)
  contraluzBands.push(`${name} ${min.toFixed(0)}°`)
  if (min < 130) contraluzOk = false
}
check(
  'en Demos y en el cierre la luz viene de atrás, que es lo que el sprint pide',
  contraluzOk,
  contraluzBands.join(' · ')
)
check(
  'control positivo — el MISMO umbral de contraluz da falso con la luz sobre el eje de la cámara',
  !CONTRALUZ.every(([, from, to]) => band(from, to, false, true).min >= 130),
  'sin esto, "viene de atrás" pasaría también con γ clavado en cualquier valor alto'
)

let gammaMinArc = 999
let gammaMinFixed = 999
for (let i = 0; i <= 500; i += 1) {
  gammaMinArc = Math.min(gammaMinArc, gammaAt(i / 500))
  gammaMinFixed = Math.min(gammaMinFixed, gammaAt(i / 500, true))
}
check(
  'no hay un solo punto del recorrido con luz plana',
  gammaMinArc > 24,
  `γ mínimo ${gammaMinArc.toFixed(1)}° con el arco, contra ${gammaMinFixed.toFixed(1)}° que dejaría una key fija en −42°/36°`
)

/**
 * ⚠️ **El control negativo cambió de forma en S9, y hay que decir por qué.**
 *
 * En S7 el arco ganaba en el γ MÍNIMO del track: la key fija tenía un punto de
 * luz plana (4°) en `final · se levanta` y el arco lo subía a 29°. Sobre el
 * recorrido definitivo eso ya no es cierto —una key fija en −42°/36° da un
 * mínimo de 40,8° contra los 35,5° del arco— y forzar la comparación vieja
 * sería mentir con un número.
 *
 * Lo que el arco compra en este recorrido es OTRA cosa, y es la que importa:
 * con la cámara leyendo contenido en seis azimuts repartidos por toda la
 * vuelta, **una key fija deja dos de las cinco ventanas de texto fuera de
 * rango** —Quiénes somos a 160° es contraluz puro— y deja una tercera
 * (Números, 104°) rozando el límite. Eso es lo que se verifica acá.
 */
const rotas = MODELADAS.filter(([, from, to]) => noModela(band(from, to, true)))
check(
  'una key fija dejaría ventanas de texto sin modelar, y el arco no',
  rotas.length >= 2 && modeladasOk,
  `key fija: ${rotas.map(([name, from, to]) => `${name} ${band(from, to, true).min.toFixed(0)}–${band(from, to, true).max.toFixed(0)}°`).join(' · ')}`
)

/**
 * ⚠️ **LA SECCIÓN "VISIBILIDAD DEL SOL" SE BORRÓ EN S11, Y NO SE REEMPLAZÓ ACÁ.**
 *
 * Eran cinco chequeos sobre el DISCO: en qué ventana del recorrido entraba en
 * cuadro, que no se fuera, que el halo nunca entrara entero, que en Demos quedara
 * detrás del logo y que en el cierre se hubiera separado del wordmark. Los cinco
 * medían la cobertura de un sprite que ya no existe — S11 borró el cuerpo del sol
 * porque no se leía como un sol, y dejó su dirección como la fuente de la
 * proyección.
 *
 * **No se convirtieron en "el disco nunca está en cuadro".** Un chequeo así, en
 * una escena sin disco, es verdadero por vacío: pasaría igual con el instrumento
 * roto. Lo que SÍ hay que proteger —que nadie vuelva a meter un cuerpo de sol— se
 * verifica en `s11-piso.invariant.ts` con un escáner del fuente **y su control
 * positivo**, que es la única forma de que un chequeo de ausencia valga algo.
 *
 * Lo que reemplaza a la visibilidad como pregunta de composición está en
 * `s11-celosia.invariant.ts`: el paso proyectado, el batido, el barrido y el
 * estiramiento de las bandas. La pregunta dejó de ser "se ve el sol" y pasó a ser
 * "se ve lo que el sol hace".
 */

report('modelado y visibilidad · recorrido definitivo')
