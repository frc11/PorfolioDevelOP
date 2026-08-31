import { cubicBezierEase } from '@/app/v3/_lib/escena/bezier'
import { PARTICLE_SIZE } from '@/app/v3/_lib/escena/probeParticles'
import { MOTION_EASE } from '@/components/design-system/motion/tokens'

import { check, report, section } from './introChecks'
import { INTRO_DUST_SCALE, INTRO_FALL_WORLD } from './introParticles'
import { buildIntroParticles } from './introParticleField'
import { introParticleWindows } from './introParticleTiming'
import { near, quantile, readSource } from './introParticleProbe'
import { s13Field } from './introReadingProbe'
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

/** El recorrido de la mota mediana, en diámetros de sí misma. */
const travelIn = (
  motes: readonly { dxPx: number; dyPx: number; sizePx: number; kind: string }[]
): number =>
  quantile(
    motes.filter((m) => m.kind === 'dust').map((m) => Math.hypot(m.dxPx, m.dyPx) / m.sizePx),
    0.5
  )

for (const [width, height] of WINDOWS) {
  const field = buildIntroParticles(width, height)
  const dy = field.motes.map((m) => m.dyPx)
  const dx = field.motes.map((m) => Math.abs(m.dxPx))

  check(
    `${width}×${height} — todas bajan, y ninguna deriva más de lo que baja`,
    field.motes.every((m) => m.dyPx > 0 && m.dyPx > Math.abs(m.dxPx)),
    `${field.motes.length} motas · |dy| mediana ${quantile(dy, 0.5).toFixed(0)} px · deriva mediana ${quantile(dx, 0.5).toFixed(0)} px`
  )
  /**
   * ⚠ **Por deciles y no por extremos (S14).** El máximo y el mínimo de una
   * muestra dependen del tamaño de la muestra, y S14 ralea el campo a 0,30: los
   * extremos se encogen —de ×8,11 a ×5,26— sin que la ley del paralaje cambie un
   * ápice. El cociente entre deciles es prácticamente el mismo antes y después
   * (2,21 → 2,11), y es lo que dice que la ley sigue ahí. El extremo se sigue
   * publicando, porque es el número que se ve; lo que ya no se comprueba es él.
   */
  check(
    `${width}×${height} — la cercana barre mucho más que la lejana: el paralaje`,
    quantile(dy, 0.9) / quantile(dy, 0.1) > 1.8,
    `p90/p10 ×${(quantile(dy, 0.9) / quantile(dy, 0.1)).toFixed(2)} · de ${quantile(dy, 0).toFixed(0)} a ${quantile(dy, 1).toFixed(0)} px en los extremos, ×${(quantile(dy, 1) / quantile(dy, 0)).toFixed(2)}`
  )
  /**
   * Y el recorrido en diámetros **no se compara contra un literal**: se compara
   * contra el del campo de S13 medido en la misma corrida, dividido por la
   * escala. Es la forma exacta de la propiedad — `INTRO_FALL_WORLD` no se tocó,
   * así que lo único que pudo mover el recorrido es el tamaño de la mota.
   */
  check(
    `${width}×${height} — el recorrido en diámetros es el de S13 sobre la escala`,
    near(travelIn(field.motes) * INTRO_DUST_SCALE, travelIn(s13Field(width, height).motes), 0.5),
    `${travelIn(s13Field(width, height).motes).toFixed(2)} ÷ ${INTRO_DUST_SCALE} = ${travelIn(field.motes).toFixed(2)} diámetros · ${(travelIn(field.motes) / FRAMES).toFixed(2)} por cuadro a 60 fps`
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
const stepFor = (fall: number, scale: number = INTRO_DUST_SCALE): number => {
  const field = buildIntroParticles(1440, 810, fall, PARTICLE_SIZE * scale)
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
/**
 * ⚠ **El control de arriba se movió, y es un resultado de S14.** Con las motas
 * de S13 alcanzaba una caída de 6 para salir de la banda (5,66 por cuadro); con
 * las de hoy, la misma caída da **2,76** y está adentro. No es que la banda se
 * aflojó: es que **el mismo desplazamiento estrobea la mitad**, porque el paso
 * se mide en diámetros de la propia mota y la mota se duplicó. Para llegar al
 * régimen de fila de puntos ahora hace falta el doble de caída.
 */
check(
  'control negativo — y con una caída de 12 también',
  !inBand(12),
  `12 → ${stepFor(12).toFixed(2)} diámetros por cuadro: una fila de puntos · con la escala de S13 alcanzaba 6 (${stepFor(6, 1).toFixed(2)}), que hoy da ${stepFor(6).toFixed(2)} y entra en la banda`
)
check(
  'la banda es monótona en la perilla, así que rechaza por el lado que dice',
  stepFor(0) < stepFor(1.2) && stepFor(1.2) < stepFor(3) && stepFor(3) < stepFor(12),
  `${stepFor(0).toFixed(2)} < ${stepFor(1.2).toFixed(2)} < ${stepFor(3).toFixed(2)} < ${stepFor(12).toFixed(2)}`
)

/**
 * 🔴 **Y `linear` contra `shift`, con la pendiente MEDIDA.** El docblock de
 * `sampleParticleOut` argumenta contra `shift` con una pendiente máxima de
 * 2,735× que hasta acá era prosa: ningún instrumento la producía. Se mide sobre
 * el evaluador que el repo embarca, y con ella el paso por cuadro que `shift`
 * habría dado. ⚠ El muestreo no puede ser arbitrariamente fino: `cubicBezierEase`
 * resuelve `x` con `NEWTON_EPSILON` = 1e-6, y una diferencia hacia adelante
 * multiplica ese error por el número de muestras — con 20.000 el ruido del
 * solver ya vale 0,011. Con 2.000 la medida es estable de 200 a 5.000.
 *
 * ⚠ **El resultado corrige la expectativa del sprint.** Con las motas de S13 el
 * argumento era categórico: `shift` daba 5,2 diámetros por cuadro, o sea una
 * fila de puntos, fuera de la banda. Con las de S14 daría **2,5**, que está
 * ADENTRO. `linear` sigue siendo lo correcto —es el mínimo posible para una
 * distancia dada, y eso es aritmética que no depende de la escala— pero el modo
 * de falla del que protegía **ya no ocurre a esta escala**: el argumento no se
 * refuerza, se vuelve innecesario.
 */
const SHIFT_SAMPLES = 2_000
let shiftSlope = 0
for (let i = 1; i <= SHIFT_SAMPLES; i += 1) {
  const from = cubicBezierEase(MOTION_EASE.shift, (i - 1) / SHIFT_SAMPLES)
  const to = cubicBezierEase(MOTION_EASE.shift, i / SHIFT_SAMPLES)
  shiftSlope = Math.max(shiftSlope, (to - from) * SHIFT_SAMPLES)
}
check(
  'control positivo — la pendiente máxima de `shift` es la que el docblock cita',
  near(shiftSlope, 2.735, 0.005) && near(cubicBezierEase(MOTION_EASE.shift, 1), 1, 1e-9),
  `${shiftSlope.toFixed(4)}× medida sobre ${SHIFT_SAMPLES} muestras del evaluador que embarca, contra el 2,735 que estaba escrito`
)
check(
  '⚠ con `shift` el paso por cuadro ya NO se saldría de la banda',
  stepFor(INTRO_FALL_WORLD) * shiftSlope < 4 && stepFor(INTRO_FALL_WORLD, 1) * shiftSlope > 4,
  `${(stepFor(INTRO_FALL_WORLD) * shiftSlope).toFixed(2)} diámetros por cuadro con la escala de hoy · ${(stepFor(INTRO_FALL_WORLD, 1) * shiftSlope).toFixed(2)} con la de S13, que sí quedaba afuera`
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
