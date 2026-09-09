import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { ANCLAJE } from '../anclaje'
import { CHOREO_KEYFRAMES, CHOREO_TRAMOS } from '../choreography'
import { AZIMUT_DEL_MOUSE_POR_PROGRESO, MOUSE_ANGLE_DEG_MAXIMO, MOUSE_ANGLE_DEG_PISO, MOUSE_HEIGHT_FACTOR } from '../choreographyPhysics'
import { sampleLightArc } from '../choreographySampler'
import type { MutableLightLevels } from '../choreographyTypes'
import { ATARDECER } from '../lightArc'
import { azimutDelMouseEn, excursionDeAltura, excursionDeAzimut } from '../modulacionDeLaPose'
import { FLOOR_Y } from '../probeScene'
import { progresoDelScroll } from '../recorrido'
import { escenaEnCuadro } from '../visibilidad'

/**
 * B5 (suite s18) · LOS DOS TECHOS DEL OFFSET DE MOUSE — el del piso y el del
 * contraste.
 *
 * Salió de `s18-modulacion.invariant.ts` cuando aquel archivo pasó las 300
 * líneas del repo, y el corte es por tema: allá se afirma que la modulación **no
 * puede tocar el progreso**; acá, **hasta dónde puede llegar**.
 *
 * ── Los dos techos, y por qué son de naturaleza distinta ─────────────────
 *
 *   · **El de ALTURA es geométrico y no se negocia**: si la cámara baja más de
 *     `(height − FLOOR_Y) / distance` en el keyframe más bajo, se va abajo del
 *     papel. Se recalcula acá contra los keyframes REALES.
 *   · **El de AZIMUT es de contraste y es VARIABLE por tramo**: cada lugar donde
 *     la escena se ve tiene su propio piso de legibilidad. Lo que se afirma acá
 *     es la forma de la tabla y —lo que importa— que la rampa entre los dos
 *     valores viva donde la escena **no dibuja**, así que el cambio de amplitud
 *     no se ve.
 *
 * ── ⚠️ B6-A: TRES bandas visibles, y la rampa en la primera suspendida ─────
 *
 * Con Trabajos abierta sobre la escena la ventana de visibilidad tiene TRES
 * bandas —el hero, Trabajos, y el diferencial con el Cierre— y la rampa de B5
 * (0,14 → 0,73) cruzaba la segunda: **918 posiciones** con cambio de amplitud a
 * la vista, medido con la tabla abierta. B6-A la movió a [0,14 · 0,46], adentro
 * de la PRIMERA banda suspendida; desde Trabajos hasta el final el valor es el
 * piso, 8°. La tabla de B5 queda abajo como control positivo: el detector la
 * tiene que ver fallar.
 */

// ═══════════════════════════════════════════════════════════════════════════
titulo('4 · El techo geométrico del canal de altura, recalculado')

/**
 * ⚠️ No es un número copiado: se recalcula contra los keyframes y el `FLOOR_Y`
 * REALES. Si alguien baja una pose o mueve el piso, esto se entera.
 */
let techo = Infinity
let cual = ''
for (const k of CHOREO_KEYFRAMES) {
  const margen = (k.pose.height - FLOOR_Y) / k.pose.distance
  if (margen < techo) {
    techo = margen
    cual = k.name
  }
}
afirmar(
  MOUSE_HEIGHT_FACTOR < techo,
  `el factor de altura (${MOUSE_HEIGHT_FACTOR}) cabe abajo del techo geométrico (${techo.toFixed(6)}, en «${cual}»)`,
  `holgura ×${(techo / MOUSE_HEIGHT_FACTOR).toFixed(3)} — es la razón por la que B5 amplificó el AZIMUT y no la altura`,
)
for (const k of CHOREO_KEYFRAMES) {
  afirmar(
    k.pose.height - excursionDeAltura(k.pose.distance, 1) >= FLOOR_Y,
    `  «${k.name}» no se va abajo del papel con el mouse en el extremo`,
  )
}
controlPositivo(
  'el detector ve un factor que SÍ perfora el piso',
  techo * 1.01,
  (f: number) => CHOREO_KEYFRAMES.every((k) => k.pose.height - f * k.pose.distance >= FLOOR_Y),
)

// ═══════════════════════════════════════════════════════════════════════════
titulo('4b · El azimut variable por tramo, y la rampa donde la escena NO dibuja')

/**
 * ⚠️ **LA PROPIEDAD QUE HACE QUE EL AZIMUT VARIABLE NO SE VEA.**
 *
 * Cada tramo tiene su techo de contraste y la tabla los interpola, así que en
 * algún lado la amplitud CAMBIA. Con el puntero en un extremo, un cambio de
 * amplitud es un movimiento de cámara que nadie pidió: 14° entre el hero y el
 * cierre.
 *
 * Lo que lo vuelve invisible no es la interpolación —una rampa suave sigue
 * siendo movimiento— sino **DÓNDE ocurre**: la rampa vive dentro de una banda en
 * la que `visibilidad.ts` suspende el lazo, o sea donde la escena no dibuja un
 * cuadro. Eso se muestrea, no se supone: se recorre el documento entero y se
 * pregunta, en cada posición, si la escena está en cuadro y cuánto azimut le
 * toca a ese progreso.
 */
afirmarIgual(
  AZIMUT_DEL_MOUSE_POR_PROGRESO.map(([p]) => p),
  [...AZIMUT_DEL_MOUSE_POR_PROGRESO.map(([p]) => p)].sort((a, b) => a - b),
  'los nudos de la tabla están ordenados por progreso',
)
afirmarIgual(AZIMUT_DEL_MOUSE_POR_PROGRESO[0][0], 0, '  y cubren el recorrido entero: el primero en 0')
afirmarIgual(
  AZIMUT_DEL_MOUSE_POR_PROGRESO[AZIMUT_DEL_MOUSE_POR_PROGRESO.length - 1][0],
  1,
  '  y el último en 1',
)
/**
 * ⚠️ **LOS NUDOS NO SE APOYAN EN LOS BORDES DE TRAMO, Y ES LO CORRECTO.**
 *
 * El hero se sigue viendo **después** de que su tramo termina, y Trabajos
 * **antes** de que empiece el suyo. Con la rampa apoyada en los tramos, la
 * amplitud cambiaba a la vista en 19 posiciones del barrido de abajo — medido, y
 * es lo que puso en rojo a esta sección la primera vez. Lo que manda es la
 * ventana de VISIBILIDAD, no la tabla de tramos.
 */
const TRAMO_DE_TRABAJOS = CHOREO_TRAMOS[3]
afirmarIgual(TRAMO_DE_TRABAJOS.name, 'trabajos', 'el cuarto tramo de la coreografía es Trabajos')
afirmar(
  AZIMUT_DEL_MOUSE_POR_PROGRESO[1][0] > CHOREO_TRAMOS[0].to,
  `el nudo del hero (${AZIMUT_DEL_MOUSE_POR_PROGRESO[1][0]}) va MÁS ALLÁ del borde de su tramo (${CHOREO_TRAMOS[0].to})`,
)
/**
 * ⚠️ **B8 · LA RAMPA SE MUDÓ AL ATARDECER.** Custodiaba que terminara ANTES del
 * tramo de Trabajos, adentro de la banda suspendida entre el hero y Trabajos.
 * B8 abrió Quiénes somos y Números y esa banda no existe. La rampa vive ahora
 * en el atardecer del arco (`lightArc.ts`, `ATARDECER`): sus dos nudos SON los
 * bordes del atardecer —los lee, no los copia— y el segundo coincide con el
 * arranque del tramo de Trabajos, que es cuando la sección llena el cuadro y
 * la noche ya está puesta.
 */
afirmarIgual(
  [AZIMUT_DEL_MOUSE_POR_PROGRESO[1][0], AZIMUT_DEL_MOUSE_POR_PROGRESO[2][0]],
  [ATARDECER.desde, ATARDECER.hasta],
  '  y los dos nudos de la rampa son los bordes del ATARDECER del arco (B8): leídos, no copiados',
)
afirmarIgual(
  AZIMUT_DEL_MOUSE_POR_PROGRESO[2][0],
  TRAMO_DE_TRABAJOS.from,
  `  y la rampa termina EXACTAMENTE donde arranca el tramo de Trabajos (${TRAMO_DE_TRABAJOS.from}): con la noche puesta, el piso`,
)
afirmarIgual(azimutDelMouseEn(0), MOUSE_ANGLE_DEG_MAXIMO, `en el hero el azimut es el máximo: ${MOUSE_ANGLE_DEG_MAXIMO}°`)
afirmarIgual(azimutDelMouseEn(0.125), MOUSE_ANGLE_DEG_MAXIMO, '  y se mantiene hasta el final de su tramo')
afirmarIgual(azimutDelMouseEn(TRAMO_DE_TRABAJOS.from), 8, 'Trabajos recibe el piso de 8° desde su primer cuadro')
afirmarIgual(azimutDelMouseEn(1), 8, 'y en el cierre sigue en el techo del diferencial: 8°')
afirmar(
  azimutDelMouseEn(-1) === MOUSE_ANGLE_DEG_MAXIMO && azimutDelMouseEn(2) === 8,
  '  y fuera de rango se clava en la punta, no devuelve basura',
)
/** Monótona: si subiera y bajara, habría un tramo con más azimut que su techo. */
let monotona = true
let previo = Infinity
for (let i = 0; i <= 1000; i += 1) {
  const v = azimutDelMouseEn(i / 1000)
  if (v > previo + 1e-9) monotona = false
  previo = v
}
afirmar(monotona, 'la curva no sube en ningún punto: ningún progreso recibe más azimut que su techo')
afirmar(
  excursionDeAzimut(1) === MOUSE_ANGLE_DEG_MAXIMO,
  `la excursión del peor caso es el techo de la tabla: ${excursionDeAzimut(1)}°`,
)

/**
 * ⚠️ **DÓNDE CAMBIA LA AMPLITUD, CONTRA DÓNDE SE VE LA ESCENA.**
 *
 * Se recorre el documento de 5 en 5 px con las medidas reales del anclaje y,
 * en cada posición, se pregunta a `visibilidad.ts` si la escena dibuja y a la
 * tabla cuánto azimut toca. Si en dos posiciones consecutivas VISIBLES el azimut
 * difiere, ahí hay un cambio de amplitud a la vista.
 */
const VENTANA = 1080
const ARRIBA = 0
const ABAJO = ANCLAJE.pantallasDelDocumento * VENTANA

interface Barrido {
  readonly visibles: number
  readonly visiblesConCambio: number
  /** De los cambios a la vista, los que caen FUERA del atardecer del arco (B8). */
  readonly cambiosFueraDelAtardecer: number
  readonly bandas: readonly { readonly desde: number; readonly hasta: number }[]
}

/** El MISMO barrido para la tabla real y para las tablas de control: una sola escritura. */
function barrer(azimutEn: (p: number) => number, paso: number): Barrido {
  let visiblesConCambio = 0
  let cambiosFueraDelAtardecer = 0
  let visibles = 0
  let azimutPrevio: number | null = null
  let visiblePrevio = false
  const bandas: { desde: number; hasta: number }[] = []
  let abierta: { desde: number; hasta: number } | null = null
  for (let y = 0; y <= ABAJO - VENTANA; y += paso) {
    const enCuadro = escenaEnCuadro(y, ARRIBA, ABAJO, VENTANA)
    const progreso = progresoDelScroll(y, ARRIBA, ABAJO, VENTANA)
    const azimut = azimutEn(progreso)
    if (enCuadro) {
      visibles += 1
      if (abierta === null) abierta = { desde: progreso, hasta: progreso }
      else abierta.hasta = progreso
      if (visiblePrevio && azimutPrevio !== null && Math.abs(azimut - azimutPrevio) > 1e-9) {
        visiblesConCambio += 1
        if (progreso < ATARDECER.desde || progreso > ATARDECER.hasta) cambiosFueraDelAtardecer += 1
      }
    } else if (abierta !== null) {
      bandas.push(abierta)
      abierta = null
    }
    azimutPrevio = azimut
    visiblePrevio = enCuadro
  }
  if (abierta !== null) bandas.push(abierta)
  return { visibles, visiblesConCambio, cambiosFueraDelAtardecer, bandas }
}

/** Interpola una tabla cualquiera igual que `azimutDelMouseEn` interpola la real. */
function enTabla(tabla: readonly (readonly [number, number])[]): (p: number) => number {
  return (p: number): number => {
    if (p <= tabla[0][0]) return tabla[0][1]
    const u = tabla[tabla.length - 1]
    if (p >= u[0]) return u[1]
    for (let i = 1; i < tabla.length; i += 1) {
      if (p > tabla[i][0]) continue
      const t = (p - tabla[i - 1][0]) / (tabla[i][0] - tabla[i - 1][0])
      return tabla[i - 1][1] + (tabla[i][1] - tabla[i - 1][1]) * t
    }
    return u[1]
  }
}

/**
 * ⚠️ **B8 · CUSTODIABA «la amplitud NO cambia en ninguna posición donde la
 * escena dibuja», y esa propiedad dejó de poder existir.** Vivía en la banda
 * suspendida entre el hero y Trabajos (0,14 → 0,46); B8 abrió Quiénes somos y
 * Números por decisión del humano y la escena dibuja de corrido de la pantalla
 * 0 a la 11: no queda banda suspendida antes de Trabajos. La rampa se mudó al
 * ATARDECER del arco (`lightArc.ts`), aprobado en la PARADA 1 de B8, y lo que
 * se afirma ahora es lo que lo vuelve invisible: que TODO cambio a la vista
 * caiga adentro del atardecer, donde el sol pierde más del 90 % de su nivel en
 * la misma pantalla —un evento adentro de otro—, y que fuera de él la amplitud
 * no se mueva. Los dos controles de antes siguen: una rampa en el hero y la
 * tabla de B5 tienen cambios FUERA del atardecer, y el detector los ve.
 */
const real = barrer(azimutDelMouseEn, 5)
afirmar(real.visibles > 50, `el barrido vio la escena dibujando en ${real.visibles} posiciones: no esta midiendo el vacio`)
afirmar(
  real.bandas.length === 2,
  `y vio DOS bandas visibles (B8: del hero a Trabajos de corrido, y el diferencial con el Cierre): ${real.bandas.map((b) => `[${b.desde.toFixed(4)} · ${b.hasta.toFixed(4)}]`).join(' y ')}`,
)
afirmar(
  real.bandas[0].desde <= ATARDECER.desde && real.bandas[0].hasta >= ATARDECER.hasta,
  `el atardecer entero cae ADENTRO de la primera banda visible: la rampa se ve, y se ve mientras el sol se pone (${ATARDECER.desde} · ${ATARDECER.hasta})`,
)
afirmar(
  real.visiblesConCambio > 0,
  'la amplitud SÍ cambia a la vista: desde B8 no hay banda suspendida donde esconder la rampa',
  `${real.visiblesConCambio} posiciones con cambio, de ${real.visibles} visibles`,
)
afirmarIgual(
  real.cambiosFueraDelAtardecer,
  0,
  '  y NINGÚN cambio cae fuera del atardecer: la rampa entera vive donde la luz se va',
)
const arco: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }
const nivelEn = (p: number): number => {
  sampleLightArc(p, arco)
  return arco.level
}
afirmar(
  nivelEn(ATARDECER.desde) - nivelEn(ATARDECER.hasta) > 0.9 && MOUSE_ANGLE_DEG_MAXIMO - MOUSE_ANGLE_DEG_PISO === 14,
  'y es un evento adentro de otro: en la misma pantalla en que la amplitud baja 14°, el sol pierde más del 90 % de su nivel',
  `nivel ${nivelEn(ATARDECER.desde)} → ${nivelEn(ATARDECER.hasta)} · azimut ${MOUSE_ANGLE_DEG_MAXIMO}° → ${MOUSE_ANGLE_DEG_PISO}°`,
)
afirmar(
  azimutDelMouseEn(real.bandas[0].desde) === MOUSE_ANGLE_DEG_MAXIMO &&
    azimutDelMouseEn(real.bandas[0].hasta) === MOUSE_ANGLE_DEG_PISO &&
    real.bandas.slice(1).every((b) => azimutDelMouseEn(b.desde) === MOUSE_ANGLE_DEG_PISO && azimutDelMouseEn(b.hasta) === MOUSE_ANGLE_DEG_PISO),
  '  la primera banda entra con el máximo y sale con el piso; la segunda es el piso de punta a punta',
)
controlPositivo(
  'el detector de cambio a la vista no está ciego: con la rampa corrida al hero, la ve FUERA del atardecer',
  [
    [0, 22],
    [0.02, 22],
    [0.06, 8],
    [1, 8],
  ] as const,
  (tabla: readonly (readonly [number, number])[]) => barrer(enTabla(tabla), 30).cambiosFueraDelAtardecer === 0,
)
controlPositivo(
  'y ve fallar la tabla de B5 (0,14 → 0,73): cruzaba Quiénes somos, Números y Trabajos a la vista, fuera del atardecer',
  [
    [0, 22],
    [0.14, 22],
    [0.73, 8],
    [1, 8],
  ] as const,
  (tabla: readonly (readonly [number, number])[]) => barrer(enTabla(tabla), 30).cambiosFueraDelAtardecer === 0,
)

cerrar('s18-azimut.invariant')
