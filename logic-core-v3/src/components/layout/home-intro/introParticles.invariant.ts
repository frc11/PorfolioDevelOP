import {
  BOKEH_R_MAX,
  BOKEH_SIZE,
  PARTICLES_MAX,
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
  PARTICLE_R_MAX,
  PARTICLE_SIZE,
} from '@/app/probe-escena/_components/probeParticles'
import { ORBIT_TARGET_Y } from '@/app/probe-escena/_components/probeScene'
import { PROBE_DEFAULTS } from '@/app/probe-escena/_components/probeStore'
import { shadeUnlit } from '@/app/probe-escena/__tests__/shading'
import { pointSizePx } from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'

import { check, report, section } from './introChecks'
import {
  DUST_MATERIAL_ALPHA,
  DUST_RADIUS_BIAS,
  FLOOR_CLEARANCE,
  INTRO_DUST_SHARE,
  INTRO_TINT_STEPS,
  dustDepthFloor,
  introTintColor,
  moteRampColor,
  type IntroMote,
} from './introParticles'
import { buildIntroParticles } from './introParticleField'
import {
  near,
  nearestDistances,
  quantile,
  readSource,
  sceneParticleField,
  seededDustField,
} from './introParticleProbe'
import { hexToSrgb, mixSrgbInLinearLight, srgbToHex } from './introShading'

/**
 * COMPROBACIÓN ESTÁTICA DE LA ESPECIE — **que las del intro y las de la escena
 * sean la misma población, y a la vez NO la misma muestra.**
 *
 *     npx tsx src/components/layout/home-intro/introParticles.invariant.ts
 *
 * Las dos mitades importan por separado y tiran en direcciones opuestas:
 *
 *  · **Misma población.** Si el ojo registra un cambio de especie al disolverse
 *    el blanco, el truco se rompe. Por eso el campo del intro no se calibra: es
 *    el de la escena, proyectado. Acá se mide cuánto se parecen.
 *  · **Distinta muestra.** Con la misma semilla las motas caerían desde
 *    exactamente los lugares donde, tres décimas más tarde, las de la escena
 *    vuelven a estar — y eso no se lee como dos poblaciones sino como UNA que se
 *    teletransportó. **La divergencia se comprueba, no se supone**, y el control
 *    positivo demuestra que este instrumento vería la coincidencia si existiera.
 *
 * La caída está en `introParticleField.invariant.ts` y el ritmo en
 * `introParticleTiming.invariant.ts`; el banco de medición que las tres
 * comparten, en `introParticleProbe.ts`.
 */

const W = 1440
const H = 810

// ── 1 · Los números que el intro copia de la escena ─────────────────────────

section('1 · Lo copiado de la escena sigue siendo lo mismo, leído del código')

/**
 * `DepthParticles.tsx` y `BokehParticles.tsx` pasan tres números como literales
 * y ningún módulo los exporta. Están copiados en `introParticles.ts`, así que la
 * única forma de que no se separen es **leer el código de esos componentes**.
 * Es el patrón de `introSilhouette.invariant.ts`, que verifica el clip leyendo
 * el SVG en vez de confiar en que nadie lo mueva.
 */
const DEPTH_SRC = readSource('src/app/probe-escena/_components/DepthParticles.tsx')
const BOKEH_SRC = readSource('src/app/probe-escena/_components/BokehParticles.tsx')

check(
  'el sesgo radial del polvo es el mismo que el componente pasa',
  DEPTH_SRC.includes(`      ${DUST_RADIUS_BIAS},\n`),
  `${DUST_RADIUS_BIAS}`
)
check(
  'y el recorte contra el papel también, en los dos campos',
  DEPTH_SRC.includes(`FLOOR_Y + ${FLOOR_CLEARANCE}`) &&
    BOKEH_SRC.includes(`FLOOR_Y + ${FLOOR_CLEARANCE}`),
  `FLOOR_Y + ${FLOOR_CLEARANCE}`
)
check(
  'la opacidad del material del polvo es la del componente',
  DEPTH_SRC.includes(`opacity={${DUST_MATERIAL_ALPHA}}`),
  `${DUST_MATERIAL_ALPHA}`
)
check(
  'y la fracción del campo dibujada es el default que el probe embarca',
  Math.round(INTRO_DUST_SHARE * PARTICLES_MAX) === PROBE_DEFAULTS.particleCount,
  `${INTRO_DUST_SHARE} × ${PARTICLES_MAX} = ${PROBE_DEFAULTS.particleCount}`
)
/** Control positivo: si el `grep` no encontrara nada, los cuatro pasarían igual. */
check(
  'control positivo — el instrumento está leyendo los archivos, no el vacío',
  DEPTH_SRC.includes('buildParticleField') &&
    BOKEH_SRC.includes('buildParticleField') &&
    !DEPTH_SRC.includes(`      ${DUST_RADIUS_BIAS + 1},\n`),
  `${DEPTH_SRC.length} + ${BOKEH_SRC.length} bytes leídos`
)

// ── 2 · La especie, contra el campo de la escena en la pose inicial ─────────

section('2 · El campo del intro contra el de la escena, en la pose inicial')

const intro = buildIntroParticles(W, H)
const scene = sceneParticleField(W, H)
const introDust = intro.motes.filter((m) => m.kind === 'dust').map((m) => m.sizePx)
const sceneDust = scene.filter((m) => m.kind === 'dust').map((m) => m.sizePx)
const introBokeh = intro.motes.filter((m) => m.kind === 'bokeh').map((m) => m.sizePx)
const sceneBokeh = scene.filter((m) => m.kind === 'bokeh').map((m) => m.sizePx)

check(
  'la densidad en cuadro es la misma dentro del 5%',
  Math.abs(intro.motes.length / scene.length - 1) < 0.05,
  `${intro.motes.length} contra ${scene.length} — ${(((intro.motes.length - scene.length) / scene.length) * 100).toFixed(1)}%`
)
for (const [label, a, b, tolerance] of [
  ['polvo · mediana', quantile(introDust, 0.5), quantile(sceneDust, 0.5), 0.1],
  ['polvo · p10', quantile(introDust, 0.1), quantile(sceneDust, 0.1), 0.1],
  ['polvo · p90', quantile(introDust, 0.9), quantile(sceneDust, 0.9), 0.3],
  ['bokeh · mediana', quantile(introBokeh, 0.5), quantile(sceneBokeh, 0.5), 0.6],
] as const) {
  check(
    `${label}: mismo diámetro en píxeles`,
    near(a, b, tolerance),
    `${a.toFixed(2)} contra ${b.toFixed(2)} px`
  )
}

// ── 3 · La divergencia de la semilla ────────────────────────────────────────

section('3 · 🔴 Misma población, distinta muestra — y la divergencia se MIDE')

const introVsScene = nearestDistances(intro.motes, scene)
const thirdVsScene = nearestDistances(seededDustField(0xa17e3a, W, H, INTRO_DUST_SHARE), scene)
const sceneVsScene = nearestDistances(scene, scene)
const coincident = (distances: readonly number[]) =>
  distances.filter((d) => d < 1).length / distances.length

/**
 * 🔴 **EL CONTROL POSITIVO VA PRIMERO, y no es un detalle de orden.** Si el
 * instrumento no puede ver la coincidencia, medir la divergencia no significa
 * nada. El campo de la escena contra SÍ MISMO es la coincidencia perfecta: cada
 * mota tiene otra a distancia cero — que es exactamente lo que pasaría si el
 * intro usara `PARTICLE_SEED` en vez de la suya.
 */
check(
  'control positivo — el instrumento DETECTA la coincidencia si existe',
  coincident(sceneVsScene) === 1 && quantile(sceneVsScene, 1) === 0,
  `campo de la escena contra sí mismo: ${(coincident(sceneVsScene) * 100).toFixed(0)}% a menos de 1 px`
)
check(
  '🔴 y el campo del intro NO está en los lugares del de la escena',
  coincident(introVsScene) < 0.02,
  `${(coincident(introVsScene) * 100).toFixed(1)}% a menos de 1 px · mediana ${quantile(introVsScene, 0.5).toFixed(1)} px hasta la mota más cercana`
)
check(
  'y esa divergencia es la genérica de dos muestras independientes',
  near(quantile(introVsScene, 0.5), quantile(thirdVsScene, 0.5), 2),
  `mediana ${quantile(introVsScene, 0.5).toFixed(1)} px contra ${quantile(thirdVsScene, 0.5).toFixed(1)} de una tercera semilla`
)

// ── 4 · El color ────────────────────────────────────────────────────────────

section('4 · El color de cada mota es el que la escena renderiza')

/**
 * La rampa del intro contra `shadeUnlit`, que es como la escena mide el valor de
 * una mota: el color del vértice —la mezcla en luz lineal de cerca a lejos, que
 * es donde `THREE.Color.lerp` trabaja— pasa directo al tone mapping, porque
 * `PointsMaterial` no recibe luz.
 *
 * Son dos caminos independientes al mismo número: acá el del intro
 * (`moteRampColor`, con la versión para grises del operador) y allá el de la
 * escena (`neutralToneMap` entero, canal por canal).
 */
const NEAR = hexToSrgb(PARTICLE_NEAR_COLOR)
const FAR = hexToSrgb(PARTICLE_FAR_COLOR)
const greenOf = (hex: string) => parseInt(hex.slice(3, 5), 16)

let worstColor = 0
let exactColors = 0
for (let i = 0; i <= 200; i += 1) {
  const t = i / 200
  const raw = srgbToHex(mixSrgbInLinearLight(NEAR, FAR, t))
  const difference = Math.abs(greenOf(moteRampColor(NEAR, FAR, t)) - Math.round(shadeUnlit(raw)))
  if (difference === 0) exactColors += 1
  worstColor = Math.max(worstColor, difference)
}
check(
  'la rampa del intro es la que la escena renderiza — 201 puntos, dos caminos',
  worstColor <= 1,
  `${exactColors} de 201 exactos · el resto a un byte, que es el redondeo`
)
check(
  'y los dos extremos son las motas cercana y lejana de la escena',
  near(shadeUnlit(PARTICLE_NEAR_COLOR), 70.6, 0.1) &&
    near(shadeUnlit(PARTICLE_FAR_COLOR), 214.5, 0.1),
  `${shadeUnlit(PARTICLE_NEAR_COLOR).toFixed(1)} → ${shadeUnlit(PARTICLE_FAR_COLOR).toFixed(1)}`
)

/** El error que introduce cuantizar la rampa en escalones para poder teñir. */
let worstTint = 0
for (const mote of intro.motes as readonly IntroMote[]) {
  if (mote.tint < 0) continue
  worstTint = Math.max(
    worstTint,
    Math.abs(greenOf(mote.color) - greenOf(introTintColor(mote.tint)))
  )
}
check(
  'y el escalonado del teñido queda acotado por la mitad del paso',
  worstTint <= 3.2,
  `${INTRO_TINT_STEPS} escalones sobre ${(shadeUnlit(PARTICLE_FAR_COLOR) - shadeUnlit(PARTICLE_NEAR_COLOR)).toFixed(0)} bytes · peor mota ${worstTint.toFixed(1)} de 255`
)

/**
 * Control positivo: repartir los escalones parejo en `t` —que es lo obvio y lo
 * que estaba primero— **duplica el peor error**, y lo concentra en las motas
 * cercanas. Sin esta medición, el reparto por valor parecería una elección de
 * estilo en vez de la que baja el error a la mitad.
 */
let worstEven = 0
for (let step = 1; step < INTRO_TINT_STEPS; step += 1) {
  const a = greenOf(moteRampColor(NEAR, FAR, (step - 1) / (INTRO_TINT_STEPS - 1)))
  const b = greenOf(moteRampColor(NEAR, FAR, step / (INTRO_TINT_STEPS - 1)))
  worstEven = Math.max(worstEven, (b - a) / 2)
}
check(
  'control positivo — con escalones parejos en `t` el error sería el doble',
  worstEven > worstTint * 1.8,
  `${worstEven.toFixed(1)} contra ${worstTint.toFixed(1)} de 255`
)

// ── 5 · El recorte de las dos escalas ───────────────────────────────────────

section('5 · El único recorte, y sale de la regla de las dos escalas de S10')

const eye = Math.hypot(SCENE_ENTRY_POSE.distance, SCENE_ENTRY_POSE.height - ORBIT_TARGET_Y)
const floor = dustDepthFloor(eye)
check(
  'el piso de profundidad del polvo ES el diámetro del bokeh más chico',
  near(pointSizePx(PARTICLE_SIZE, floor, H), pointSizePx(BOKEH_SIZE, eye + BOKEH_R_MAX, H), 1e-9),
  `${floor.toFixed(3)} de profundidad → ${pointSizePx(PARTICLE_SIZE, floor, H).toFixed(2)} px, el mismo disco`
)
check(
  'ninguna mota de polvo del intro proyecta más que el bokeh más chico',
  Math.max(...introDust) < Math.min(...introBokeh),
  `polvo hasta ${Math.max(...introDust).toFixed(2)} px · bokeh desde ${Math.min(...introBokeh).toFixed(2)} px`
)
check(
  'la escena, en esta pose, ya lo cumple sola — no se le está imponiendo nada',
  Math.max(...sceneDust) < pointSizePx(PARTICLE_SIZE, floor, H),
  `su mota más grande mide ${Math.max(...sceneDust).toFixed(2)} px contra ${pointSizePx(PARTICLE_SIZE, floor, H).toFixed(2)}`
)
/**
 * Control positivo: el recorte tiene que estar cubriendo un caso REAL. El campo
 * llega a radio 34 con la cámara a 20,05 del origen, así que una mota puede
 * quedar a dos unidades de la lente — y con la semilla del intro, una queda.
 */
check(
  'control positivo — el recorte cubre un caso que el campo produce de verdad',
  PARTICLE_R_MAX > eye && intro.motes.length > 900,
  `el campo llega a radio ${PARTICLE_R_MAX} con la cámara a ${eye.toFixed(2)}: una mota puede quedar a ${(PARTICLE_R_MAX - eye).toFixed(2)} por delante · quedan ${intro.motes.length} en cuadro`
)

report('introParticles')
