import { cubicBezierEase } from '@/app/v3/_lib/escena/bezier'
import { MOTION_EASE } from '@/components/design-system/motion/tokens'

import { check, report, section } from './introChecks'
import { INTRO_DUST_SCALE } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { buildSceneParticles } from './introParticleLanding'
import { introParticleWindows } from './introParticleTiming'
import { near, quantile, readSource } from './introParticleProbe'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL ACOMODAMIENTO — **que lleguen, y que se lea como
 * llegar.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleField.invariant.ts
 *
 * ── 🔴 QUÉ MEDÍA ANTES, Y POR QUÉ EL SUJETO CAMBIÓ (V3-A) ──────────────────
 *
 * Hasta acá esto era «la comprobación estática de LA CAÍDA», y su unidad era el
 * diámetro de la propia mota: el campo bajaba `INTRO_FALL_WORLD` unidades **de
 * mundo**, así que en píxeles cada mota recorría algo distinto —cientos las
 * cercanas, decenas las lejanas—, pero medido en diámetros el recorrido era el
 * mismo para todas y un solo número gobernaba el campo entero.
 *
 * **El acomodamiento no tiene esa propiedad, y no es un descuido: es lo que lo
 * define.** El destino ya no sale de una traslación rígida sino de una
 * ASIGNACIÓN —cada mota va a la mota de la escena más cercana de su concha
 * (`introParticleLanding.ts`)—, así que el recorrido depende de dónde había un
 * lugar libre y no de la profundidad. Por eso acá se mide el reparto entero y no
 * un número solo, y por eso las cifras de S13/S14 sobre la caída quedan vencidas
 * en vez de reinterpretadas (regla 11).
 *
 * Lo que SÍ se conserva es la unidad —diámetros de la propia mota— porque sigue
 * siendo lo que decide si el gesto se lee como movimiento o como un salto.
 *
 * Y acá va también **dónde cuelga la capa**, que es lo que responde qué pasa con
 * `prefers-reduced-motion`: nada, porque el intro entero se saltea y las
 * partículas viven adentro del overlay.
 */

const T = HOME_INTRO_TIMELINE
const FRAMES = introParticleWindows(T).outDurationS * 60
const WINDOWS: readonly (readonly [number, number])[] = [
  [1440, 810],
  [1920, 1080],
  [390, 844],
]

// ── 1 · Cada mota tiene destino, y el destino es una mota de la escena ──────

section('1 · Cada mota se acomoda en una mota REAL del campo de la escena')

/** El recorrido de la mota mediana, en diámetros de sí misma. */
const travelIn = (
  motes: readonly { settleDxPx: number; settleDyPx: number; sizePx: number; kind: string }[]
): number =>
  quantile(
    motes
      .filter((m) => m.kind === 'dust')
      .map((m) => Math.hypot(m.settleDxPx, m.settleDyPx) / m.sizePx),
    0.5
  )

const clave = (x: number, y: number) => `${x.toFixed(6)}|${y.toFixed(6)}`

for (const [width, height] of WINDOWS) {
  const field = buildIntroParticles(width, height)
  const escena = buildSceneParticles(width, height)
  const destinos = new Set(escena.map((m) => clave(m.xPx, m.yPx)))
  const recorrido = field.motes.map((m) => Math.hypot(m.settleDxPx, m.settleDyPx))
  const aterrizajes = field.motes.map((m) => clave(m.xPx + m.settleDxPx, m.yPx + m.settleDyPx))
  const polvo = field.motes.filter((m) => m.kind === 'dust')

  check(
    `${width}×${height} — TODAS aterrizan sobre una mota del campo de la escena`,
    field.motes.length > 0 && aterrizajes.every((k) => destinos.has(k)),
    `${field.motes.length} motas del intro contra ${escena.length} de la escena`
  )
  check(
    `${width}×${height} — y ninguna comparte destino con otra`,
    new Set(aterrizajes).size === field.motes.length,
    'la asignación toma cada destino una sola vez'
  )
  check(
    `${width}×${height} — el viaje es corto: acomodarse, no mudarse`,
    quantile(recorrido, 0.5) < 60,
    `mediana ${quantile(recorrido, 0.5).toFixed(1)} px · p90 ${quantile(recorrido, 0.9).toFixed(1)} px · máximo ${quantile(recorrido, 1).toFixed(0)} px`
  )
  check(
    `${width}×${height} — y se lee como movimiento, no como un salto`,
    travelIn(field.motes) / FRAMES > 0.05 && travelIn(field.motes) / FRAMES < 4,
    `${travelIn(field.motes).toFixed(2)} diámetros · ${(travelIn(field.motes) / FRAMES).toFixed(2)} por cuadro a 60 fps sobre ${FRAMES.toFixed(1)} cuadros`
  )
  check(
    `${width}×${height} — la mota TERMINA con el diámetro de la escena, no con el suyo`,
    quantile(polvo.map((m) => m.settleDSizePx), 0.9) < 0,
    `mediana del cambio ${quantile(polvo.map((m) => m.settleDSizePx), 0.5).toFixed(2)} px — el polvo del intro mide ×${INTRO_DUST_SCALE} y se encoge hasta el de la escena`
  )
}

/**
 * ⚠ **El acomodamiento NO tiene dirección dominante, y eso es la propiedad.**
 * La caída de S13 era −Y de mundo para todas —por eso se podía afirmar «todas
 * bajan»—. Acá cada mota va hacia su vecina, así que las direcciones se reparten
 * en las cuatro. Que se repartan es lo que distingue «se acomodan» de «se van».
 */
const desktop = buildIntroParticles(1440, 810)
const haciaAbajo = desktop.motes.filter((m) => m.settleDyPx > 0).length
check(
  'las direcciones se reparten: ninguna domina, que es lo contrario de irse',
  haciaAbajo > desktop.motes.length * 0.3 && haciaAbajo < desktop.motes.length * 0.7,
  `${haciaAbajo} de ${desktop.motes.length} van hacia abajo — ${((100 * haciaAbajo) / desktop.motes.length).toFixed(0)}%`
)

// ── 2 · La curva del gesto ──────────────────────────────────────────────────

section('2 · 🔴 `arrive` y no `linear`: el estrobo dejó de ser el criterio')

/**
 * 🔴 **El argumento de S13 contra `shift` se midió y se conserva medido, pero ya
 * no aplica** — y eso hay que publicarlo, no borrarlo (regla 11).
 *
 * S13 usaba `linear` porque la ventana era cortísima y sobre una ventana así la
 * curva decide **cuánto ESTROBEA**: `shift` tiene una pendiente máxima de
 * 2,735×, así que el mismo recorrido se ve a más del doble de velocidad en el
 * medio del gesto. Con la caída de 109 px de mediana eso importaba.
 *
 * Con el acomodamiento el recorrido mediano es de unos pocos diámetros, así que
 * **ninguna de las tres curvas se acerca al régimen de fila de puntos**. La
 * elección pasa a ser de carácter y `arrive` es la curva del sistema para todo
 * lo que llega. La pendiente se sigue midiendo acá porque es lo que demuestra
 * que el argumento viejo era cierto y que hoy no muerde.
 */
const SHIFT_SAMPLES = 2_000
const pendienteMaxima = (curva: readonly [number, number, number, number]): number => {
  let maxima = 0
  for (let i = 1; i <= SHIFT_SAMPLES; i += 1) {
    const from = cubicBezierEase(curva, (i - 1) / SHIFT_SAMPLES)
    const to = cubicBezierEase(curva, i / SHIFT_SAMPLES)
    maxima = Math.max(maxima, (to - from) * SHIFT_SAMPLES)
  }
  return maxima
}
const shiftSlope = pendienteMaxima(MOTION_EASE.shift)
const arriveSlope = pendienteMaxima(MOTION_EASE.arrive)

check(
  'control positivo — la pendiente máxima de `shift` es la que el docblock cita',
  near(shiftSlope, 2.735, 0.005) && near(cubicBezierEase(MOTION_EASE.shift, 1), 1, 1e-9),
  `${shiftSlope.toFixed(4)}× medida sobre ${SHIFT_SAMPLES} muestras del evaluador que embarca`
)
check(
  '`arrive` arranca más rápido que `linear` y frena antes que `shift`: es una llegada',
  arriveSlope > 1 && arriveSlope < shiftSlope,
  `arrive ×${arriveSlope.toFixed(3)} · shift ×${shiftSlope.toFixed(3)} · linear ×1`
)
const pasoConArrive = (travelIn(desktop.motes) / FRAMES) * arriveSlope
check(
  '⚠ con `arrive` el paso por cuadro sigue muy adentro de la banda de lectura',
  pasoConArrive > 0.05 && pasoConArrive < 4,
  `${pasoConArrive.toFixed(2)} diámetros por cuadro en el peor tramo`
)

// ── 3 · Dónde cuelga la capa, y `prefers-reduced-motion` ───────────────────

section('3 · Movimiento reducido: las partículas no existen, y por dónde cuelgan')

/**
 * **No hay nada nuevo que definir, y ésa es la respuesta.** El intro entero se
 * saltea con movimiento reducido —doble guard: el script pre-paint y el
 * componente—, y las partículas viven ADENTRO de `IntroOverlay`, así que no
 * tienen camino a montarse. Lo que se verifica es exactamente eso.
 */
const OVERLAY_SRC = readSource('src/components/layout/home-intro/IntroOverlay.tsx')
const HOME_SRC = readSource('src/components/layout/HomeIntro.tsx')
const BOOT_SRC = readSource('src/components/layout/home-intro/introBoot.tsx')

check(
  'la capa de partículas cuelga del overlay, y de ningún otro lado',
  OVERLAY_SRC.includes('<IntroParticleCanvas') &&
    !HOME_SRC.includes('IntroParticleCanvas') &&
    !BOOT_SRC.includes('IntroParticleCanvas')
)
check(
  'y el overlay solo se monta mientras el intro corre',
  HOME_SRC.includes("state !== 'finished' && (") && HOME_SRC.includes('<IntroOverlay')
)
check(
  'el guard de movimiento reducido del componente sigue puesto',
  HOME_SRC.includes('introWasArmed() && !prefersReducedMotion')
)
check(
  'y el del script pre-paint también',
  BOOT_SRC.includes("matchMedia('(prefers-reduced-motion: reduce)')"),
  'doble guard, como desde S8'
)
/** Control positivo: los cuatro pasarían igual si el `grep` leyera el vacío. */
check(
  'control positivo — los tres archivos se leyeron de verdad',
  OVERLAY_SRC.includes('IntroLockup') &&
    HOME_SRC.includes('useIntroEngine') &&
    BOOT_SRC.includes('navigator.webdriver'),
  `${OVERLAY_SRC.length} + ${HOME_SRC.length} + ${BOOT_SRC.length} bytes leídos`
)

/**
 * Y la capa va DEBAJO del lockup, que es lo que hace que la marca las tape en
 * todo instante y sin discontinuidad — primero el SVG relleno, después el mesh.
 * Se verifica por posición en el archivo, que es donde el orden vive.
 */
check(
  'la capa va debajo del lockup y del mesh, no encima',
  OVERLAY_SRC.indexOf('<IntroParticleCanvas') < OVERLAY_SRC.indexOf('<IntroLockup') &&
    OVERLAY_SRC.indexOf('<IntroParticleCanvas') < OVERLAY_SRC.indexOf('<IntroLogo3D'),
  'la marca las ocluye en todo instante, igual que en la escena'
)
check(
  'y por encima del velo, que es contra lo que se recortan',
  OVERLAY_SRC.indexOf('bg-ds-void') < OVERLAY_SRC.indexOf('<IntroParticleCanvas'),
  'son de tinta, no de luz'
)

report('introParticleField')
