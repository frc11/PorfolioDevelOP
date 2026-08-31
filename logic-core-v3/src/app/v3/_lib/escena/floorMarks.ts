import { FLOOR_Y, MARK_COLOR, MARK_SOFT_COLOR, MARK_TAPE_COLOR, type BarPlacement } from './probeScene'

/**
 * LAS MARCAS DE PISO — el replanteo del espacio.
 *
 * ── Qué son y por qué están ────────────────────────────────────────────────
 *
 * Barras finas apoyadas en el piso, del mismo material que todo lo demás. Hacen
 * dos trabajos: **dan la lectura de perspectiva** —son objetos de tamaño
 * conocido sobre una superficie plana, así que al orbitar el ojo lee la
 * profundidad que un plano vacío no da— y **dicen que este lugar es un lugar
 * donde se trabaja**, que es el lenguaje de precisión de la dirección de arte.
 *
 * ── Qué cambió en S5 ───────────────────────────────────────────────────────
 *
 * El set pasó de "marcas de estudio" a **lenguaje de plano**. A lo que ya había
 * (encuadre, cruces de registro, cintas de posición) se le sumaron las tres
 * cosas que un plano de replanteo tiene y un piso de set no:
 *
 * - **Ejes.** Las dos líneas de referencia que cruzan el origen, interrumpidas
 *   donde está el objeto — como se dibuja un eje en un plano cuando pasa por
 *   debajo de algo. Reemplazan a los cuatro ticks de media cara de S4, que
 *   marcaban exactamente lo mismo (el centro de cada lado) con menos idioma y
 *   además caían justo encima de estos.
 * - **Cotas.** Dos líneas de medida con sus ticks de extremo, por fuera del
 *   cuadro de encuadre. Es lo que convierte un dibujo en una medición.
 * - **Escala graduada.** Ticks cada dos unidades sobre el eje X, con el de la
 *   decena más largo. Da la unidad de medida del espacio sin escribir un número
 *   —no hay tipografía en esta escena y no la va a haber: sumar una fuente sería
 *   sumar una dependencia y un activo.
 *
 * Va una sola escala y no dos: con las dos, el piso se convierte en una grilla
 * y empieza a pedir atención. La asimetría es de plano, no un olvido.
 *
 * ── Las 48 barras, un draw call ────────────────────────────────────────────
 *
 * Todas van en un solo `<InstancedBars>`. La alternativa —una malla por marca—
 * costaría 48 draw calls para dibujar el equivalente a unas líneas.
 *
 * ── Las capas, y por qué no es un truco sucio ──────────────────────────────
 *
 * Dos cajas coplanares que se cruzan comparten el mismo valor de profundidad en
 * la zona de solape, y ahí el z-buffer no tiene con qué decidir: titila. La
 * solución no es levantar la de arriba —eso la despegaría del piso— sino
 * **hacerla más finita**: todas apoyan su cara inferior exactamente en el piso y
 * la superior queda un pelo más abajo por cada capa. Nadie flota, nadie titila,
 * y la diferencia de espesor (poco más de una décima de milímetro de mundo por
 * capa) es invisible.
 */

const RAD = Math.PI / 180

/** Espesor de la capa base. Las de más arriba en el orden son un pelo más finas. */
export const MARK_HEIGHT = 0.012
/** Cuánto adelgaza cada capa. Seis capas se comen la mitad del espesor. */
const LAYER_STEP = 0.0012

/** Semi-lado del cuadro interior. Encierra la huella del logo. */
export const MARK_SPAN = 4.7
export const MARK_LENGTH = 1.15
export const MARK_WIDTH = 0.05
/** Cruz de centro, debajo del logo. Los ejes salen de sus puntas. */
export const MARK_CENTER_ARM = 1
/** Dos cruces de registro en cuadrantes opuestos. */
export const MARK_CROSS_OFFSET = 3.1
export const MARK_CROSS_ARM = 0.62
/** Marco exterior: el doble de span, brazos más largos. Da una segunda escala. */
export const MARK_OUTER_SPAN = 9.4
export const MARK_OUTER_LENGTH = 1.9
/** Cintas de posición en T, donde se pararía alguien en un set. */
export const TAPE_RADIUS = 7.6
export const TAPE_WIDTH = 0.14
export const TAPE_BAR = 0.9
export const TAPE_STEM = 0.55
export const TAPE_AZIMUTHS_DEG: readonly number[] = [30, 150, 270]

/** Hasta dónde llegan los ejes. Más allá del marco exterior, que está en 9,4. */
export const AXIS_REACH = 13
/** Distancia de las cotas al cuadro de encuadre que miden. */
export const COTA_OFFSET = 6.5
export const COTA_TICK = 0.55
/** Escala graduada sobre el eje X. */
export const RULER_REACH = 10
export const RULER_STEP = 2
export const RULER_TICK = 0.34
export const RULER_TICK_LONG = 0.72

/**
 * El orden de capas. Solo importa que dos familias que se cruzan no compartan
 * número; el valor exacto no significa nada más que eso.
 */
const LAYER = {
  frame: 0,
  axisX: 1,
  axisZ: 2,
  cota: 3,
  cotaTick: 4,
  ruler: 5,
  tape: 5,
} as const

type Layer = (typeof LAYER)[keyof typeof LAYER]

/** Espesor y centro de una capa: todas apoyadas en el piso, cada una más fina. */
function thickness(layer: Layer): number {
  return MARK_HEIGHT - layer * LAYER_STEP
}

function centerY(layer: Layer): number {
  return FLOOR_Y + thickness(layer) / 2
}

/** Una barra alineada a los ejes, con su capa ya resuelta. */
function bar(
  x: number,
  z: number,
  lengthX: number,
  lengthZ: number,
  layer: Layer,
  color: string
): BarPlacement {
  return {
    position: [x, centerY(layer), z],
    scale: [lengthX, thickness(layer), lengthZ],
    color,
  }
}

const CORNERS: readonly (readonly [number, number])[] = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
]

/**
 * Las 48 barras, calculadas una vez al importar el módulo. No dependen de nada
 * en runtime, así que no tienen por qué recalcularse en cada montaje.
 */
export const MARK_PLACEMENTS: readonly BarPlacement[] = (() => {
  const marks: BarPlacement[] = []

  // 1 · Marco interior — cuatro esquinas en "L" con los brazos hacia adentro.
  //     Es el mismo cuadro del probe original: encierra la huella del logo.
  const inset = MARK_SPAN - MARK_LENGTH / 2
  for (const [sx, sz] of CORNERS) {
    marks.push(bar(sx * inset, sz * MARK_SPAN, MARK_LENGTH, MARK_WIDTH, LAYER.frame, MARK_COLOR))
    marks.push(bar(sx * MARK_SPAN, sz * inset, MARK_WIDTH, MARK_LENGTH, LAYER.frame, MARK_COLOR))
  }

  // 2 · Cruz de centro, justo debajo del logo, y los dos ejes que salen de sus
  //     puntas. El eje se interrumpe donde está el objeto: así se dibuja en un
  //     plano, y de paso los tramos no se solapan con la cruz.
  marks.push(bar(0, 0, MARK_CENTER_ARM * 2, MARK_WIDTH, LAYER.axisX, MARK_COLOR))
  marks.push(bar(0, 0, MARK_WIDTH, MARK_CENTER_ARM * 2, LAYER.axisZ, MARK_COLOR))

  const axisLength = AXIS_REACH - MARK_CENTER_ARM
  const axisCenter = MARK_CENTER_ARM + axisLength / 2
  for (const sign of [-1, 1]) {
    marks.push(
      bar(sign * axisCenter, 0, axisLength, MARK_WIDTH, LAYER.axisX, MARK_SOFT_COLOR),
      bar(0, sign * axisCenter, MARK_WIDTH, axisLength, LAYER.axisZ, MARK_SOFT_COLOR)
    )
  }

  // 3 · Dos cruces de registro en cuadrantes opuestos.
  for (const [sx, sz] of [
    [-1, 1],
    [1, -1],
  ] as const) {
    const cx = sx * MARK_CROSS_OFFSET
    const cz = sz * MARK_CROSS_OFFSET
    marks.push(bar(cx, cz, MARK_CROSS_ARM * 2, MARK_WIDTH, LAYER.axisX, MARK_COLOR))
    marks.push(bar(cx, cz, MARK_WIDTH, MARK_CROSS_ARM * 2, LAYER.axisZ, MARK_COLOR))
  }

  // 4 · Marco exterior, al doble de span y más claro. Da una SEGUNDA escala de
  //     referencia: con una sola, la perspectiva se lee a una única distancia.
  const outerInset = MARK_OUTER_SPAN - MARK_OUTER_LENGTH / 2
  for (const [sx, sz] of CORNERS) {
    marks.push(
      bar(
        sx * outerInset,
        sz * MARK_OUTER_SPAN,
        MARK_OUTER_LENGTH,
        MARK_WIDTH,
        LAYER.frame,
        MARK_SOFT_COLOR
      ),
      bar(
        sx * MARK_OUTER_SPAN,
        sz * outerInset,
        MARK_WIDTH,
        MARK_OUTER_LENGTH,
        LAYER.frame,
        MARK_SOFT_COLOR
      )
    )
  }

  // 5 · Las dos cotas: la línea de medida del cuadro interior, con su tick en
  //     cada extremo. Van por fuera del marco que miden, como en un plano.
  marks.push(bar(0, -COTA_OFFSET, MARK_SPAN * 2, MARK_WIDTH, LAYER.cota, MARK_COLOR))
  marks.push(bar(COTA_OFFSET, 0, MARK_WIDTH, MARK_SPAN * 2, LAYER.cota, MARK_COLOR))
  for (const sign of [-1, 1]) {
    marks.push(
      bar(sign * MARK_SPAN, -COTA_OFFSET, MARK_WIDTH, COTA_TICK, LAYER.cotaTick, MARK_COLOR),
      bar(COTA_OFFSET, sign * MARK_SPAN, COTA_TICK, MARK_WIDTH, LAYER.cotaTick, MARK_COLOR)
    )
  }

  // 6 · La escala graduada sobre el eje X. El tick de la decena es el doble de
  //     largo: sin esa jerarquía, diez ticks iguales son una trama y no una
  //     escala.
  for (let x = RULER_STEP; x <= RULER_REACH; x += RULER_STEP) {
    const length = x === RULER_REACH ? RULER_TICK_LONG : RULER_TICK
    for (const sign of [-1, 1]) {
      marks.push(bar(sign * x, 0, MARK_WIDTH, length, LAYER.ruler, MARK_SOFT_COLOR))
    }
  }

  // 7 · Cintas de posición en "T". Son las únicas marcas rotadas: la barra va
  //     perpendicular al radio y el pie apunta al centro, como una marca de
  //     piso de set. Con la rotación en el azimut, el +X local cae sobre la
  //     tangente y el +Z local sobre el radio hacia afuera.
  for (const azimuthDeg of TAPE_AZIMUTHS_DEG) {
    const azimuth = azimuthDeg * RAD
    const sin = Math.sin(azimuth)
    const cos = Math.cos(azimuth)
    const stemRadius = TAPE_RADIUS - TAPE_WIDTH / 2 - TAPE_STEM / 2
    const y = centerY(LAYER.tape)
    const height = thickness(LAYER.tape)

    marks.push({
      position: [sin * TAPE_RADIUS, y, cos * TAPE_RADIUS],
      scale: [TAPE_BAR, height, TAPE_WIDTH],
      rotation: [0, azimuth, 0],
      color: MARK_TAPE_COLOR,
    })
    marks.push({
      position: [sin * stemRadius, y, cos * stemRadius],
      scale: [TAPE_WIDTH, height, TAPE_STEM],
      rotation: [0, azimuth, 0],
      color: MARK_TAPE_COLOR,
    })
  }

  return marks
})()
