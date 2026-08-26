import { check, report, section } from './introChecks'
import { INTRO_FALL_WORLD } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { introParticleWindows } from './introParticleTiming'
import { near, quantile, readSource } from './introParticleProbe'
import { HOME_INTRO_TIMELINE } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DE LA CAÍDA — **que bajen, y que se lea como bajar.**
 *
 *     npx tsx src/components/layout/home-intro/introParticleField.invariant.ts
 *
 * ── Por qué la unidad es el DIÁMETRO de la propia mota ─────────────────────
 *
 * El campo baja `INTRO_FALL_WORLD` unidades **de mundo** y se lo vuelve a
 * proyectar, así que en píxeles cada mota recorre algo distinto: las cercanas
 * cientos, las lejanas decenas. Eso es el paralaje y es lo que se busca. Pero
 * medido en diámetros de la propia mota **el recorrido es el mismo para todas**
 * —el desplazamiento y el tamaño se dividen los dos por la profundidad y el
 * cociente se cancela— y tampoco depende de la ventana. Un solo número gobierna
 * el campo entero, y es el que decide si la caída se lee como movimiento o como
 * una fila de puntos.
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

// ── 1 · Hacia abajo, con paralaje ───────────────────────────────────────────

section('1 · La dirección dominante es hacia abajo, y el paralaje es real')

for (const [width, height] of WINDOWS) {
  const field = buildIntroParticles(width, height)
  const dy = field.motes.map((m) => m.dyPx)
  const dx = field.motes.map((m) => Math.abs(m.dxPx))
  const steps = field.motes
    .filter((m) => m.kind === 'dust')
    .map((m) => Math.hypot(m.dxPx, m.dyPx) / m.sizePx)

  check(
    `${width}×${height} — todas bajan, y ninguna deriva más de lo que baja`,
    field.motes.every((m) => m.dyPx > 0 && m.dyPx > Math.abs(m.dxPx)),
    `${field.motes.length} motas · |dy| mediana ${quantile(dy, 0.5).toFixed(0)} px · deriva mediana ${quantile(dx, 0.5).toFixed(0)} px`
  )
  check(
    `${width}×${height} — la más cercana barre mucho más que la lejana`,
    quantile(dy, 1) / quantile(dy, 0) > 4,
    `de ${quantile(dy, 0).toFixed(0)} a ${quantile(dy, 1).toFixed(0)} px — el paralaje, gratis`
  )
  check(
    `${width}×${height} — el recorrido en diámetros no depende de la ventana`,
    near(quantile(steps, 0.5), 33.79, 0.2),
    `${quantile(steps, 0.5).toFixed(2)} diámetros · ${(quantile(steps, 0.5) / FRAMES).toFixed(2)} por cuadro a 60 fps`
  )
}

/**
 * La deriva lateral no es ruido inventado: es lo que la proyección de una caída
 * vertical en el mundo produce cuando la cámara no está a nivel. Que exista y
 * que sea CHICA es la "dispersión" que la instrucción permite.
 */
const desktop = buildIntroParticles(1440, 810)
check(
  'hay deriva lateral, y es un accidente de la proyección, no un número al azar',
  quantile(desktop.motes.map((m) => Math.abs(m.dxPx)), 0.5) > 1 &&
    quantile(desktop.motes.map((m) => Math.abs(m.dxPx) / m.dyPx), 0.9) < 0.5,
  `mediana ${quantile(desktop.motes.map((m) => Math.abs(m.dxPx)), 0.5).toFixed(0)} px · p90 del cociente |dx|/dy = ${quantile(desktop.motes.map((m) => Math.abs(m.dxPx) / m.dyPx), 0.9).toFixed(2)}`
)

// ── 2 · La banda de la perilla ──────────────────────────────────────────────

section('2 · 🔴 `INTRO_FALL_WORLD` es una banda, no un valor: se decide mirando')

/**
 * 🔴 Es la única perilla del sprint que se decide **mirando** —misma clase que
 * `placeS`—, así que la comprobación no puede fijar su valor: **acepta los dos
 * vecinos anotados y rechaza los dos extremos.**
 *
 * La unidad es el paso por cuadro en diámetros de la propia mota. Por debajo de
 * 0,5 la mota se mueve menos de media mota por cuadro y se lee como un
 * desvanecimiento en el lugar; por encima de 4 salta cuatro veces su tamaño y se
 * lee como una fila de puntos.
 */
const stepFor = (fall: number): number => {
  const field = buildIntroParticles(1440, 810, fall)
  const dust = field.motes.filter((m) => m.kind === 'dust')
  return quantile(dust.map((m) => Math.hypot(m.dxPx, m.dyPx) / m.sizePx), 0.5) / FRAMES
}
const inBand = (fall: number) => stepFor(fall) > 0.5 && stepFor(fall) < 4

check(
  'el default cae en la banda',
  inBand(INTRO_FALL_WORLD),
  `${INTRO_FALL_WORLD} → ${stepFor(INTRO_FALL_WORLD).toFixed(2)} diámetros por cuadro`
)
check(
  'y los dos vecinos anotados también',
  inBand(1.2) && inBand(3),
  `1,2 → ${stepFor(1.2).toFixed(2)} · 3,0 → ${stepFor(3).toFixed(2)}`
)
check(
  'control negativo — sin caída, la banda lo rechaza',
  !inBand(0),
  `0 → ${stepFor(0).toFixed(2)} diámetros por cuadro: se desvanecerían en el lugar`
)
check(
  'control negativo — y con una caída de 6 también',
  !inBand(6),
  `6 → ${stepFor(6).toFixed(2)} diámetros por cuadro: una fila de puntos`
)
check(
  'la banda es monótona en la perilla, así que rechaza por el lado que dice',
  stepFor(0) < stepFor(1.2) && stepFor(1.2) < stepFor(3) && stepFor(3) < stepFor(6),
  `${stepFor(0).toFixed(2)} < ${stepFor(1.2).toFixed(2)} < ${stepFor(3).toFixed(2)} < ${stepFor(6).toFixed(2)}`
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
