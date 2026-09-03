import {
  BOKEH_R_MAX,
  BOKEH_SIZE,
  PARTICLES_MAX,
  PARTICLE_R_MAX,
  PARTICLE_SIZE,
} from '@/app/v3/_lib/escena/probeParticles'
import { ORBIT_TARGET_Y } from '@/app/v3/_lib/escena/probeScene'
import { PROBE_DEFAULTS } from '@/app/v3/_lib/escena/probeStore'
import { pointSizePx } from '@/lib/scene-camera'
import { SCENE_ENTRY_POSE } from '@/lib/scene-framing'

import { check, report, section } from './introChecks'
import {
  DUST_MATERIAL_ALPHA,
  DUST_RADIUS_BIAS,
  FLOOR_CLEARANCE,
  INTRO_DUST_SCALE,
  INTRO_DUST_SHARE,
  INTRO_DUST_SIZE,
  dustDepthFloor,
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
 *    el de la escena, proyectado. Acá se mide cuánto se parecen — y desde S14,
 *    **en qué se diferencian a propósito**: el tamaño y la densidad del polvo
 *    son propios del intro, y la comprobación exige que la diferencia sea
 *    exactamente la perilla. El color, el material y la forma no se tocan.
 *  · **Distinta muestra.** Con la misma semilla las motas caerían desde
 *    exactamente los lugares donde, tres décimas más tarde, las de la escena
 *    vuelven a estar — y eso no se lee como dos poblaciones sino como UNA que se
 *    teletransportó. **La divergencia se comprueba, no se supone**, y el control
 *    positivo demuestra que este instrumento vería la coincidencia si existiera.
 *
 * El color se fue a `introParticleTint.invariant.ts` con su módulo. La caída
 * está en `introParticleField.invariant.ts`, el ritmo en
 * `introParticleTiming.invariant.ts`, la lectura en
 * `introParticleReading.invariant.ts` y la perilla de tamaño en
 * `introParticleScale.invariant.ts`; el banco que comparten, en
 * `introParticleProbe.ts`.
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
const DEPTH_SRC = readSource('src/app/v3/_lib/escena/DepthParticles.tsx')
const BOKEH_SRC = readSource('src/app/v3/_lib/escena/BokehParticles.tsx')

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
/**
 * 🔴 **Acá S14 suelta una restricción, y conviene dejar dicho cuál.** Hasta S13
 * el intro dibujaba la MISMA fracción que el probe embarca —era la mezcla de la
 * escena— y esta comprobación exigía la igualdad. La correspondencia de
 * población nunca fue el requisito del mecanismo: el requisito es que no se vean
 * las dos poblaciones juntas, y de eso se ocupa `PARTICLES_BEFORE_VEIL` con su
 * control negativo. Lo que se custodia ahora es que las dos cosas propias del
 * intro —la densidad y la escala— sean **declaradas y en el sentido que el
 * sprint pide**: menos motas y más grandes.
 */
check(
  'la fracción dibujada es propia del intro, y menor que la de la escena',
  INTRO_DUST_SHARE < PROBE_DEFAULTS.particleCount / PARTICLES_MAX,
  `${Math.round(INTRO_DUST_SHARE * PARTICLES_MAX)} motas contra las ${PROBE_DEFAULTS.particleCount} de la escena — el ${((INTRO_DUST_SHARE * PARTICLES_MAX * 100) / PROBE_DEFAULTS.particleCount).toFixed(0)}%`
)
check(
  'y el tamaño también es propio, y mayor',
  INTRO_DUST_SIZE > PARTICLE_SIZE,
  `${PARTICLE_SIZE} × ${INTRO_DUST_SCALE} = ${INTRO_DUST_SIZE.toFixed(4)} de mundo`
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

/**
 * 🔴 **La densidad y el tamaño del polvo YA NO coinciden con los de la escena, y
 * es el punto del sprint.** Lo que se comprueba en su lugar es más fuerte que la
 * igualdad que había: que la diferencia sea **exactamente la perilla y nada
 * más**.
 *
 * ── ⚠️ CÓMO SE COMPRUEBA ESO, Y POR QUÉ CAMBIÓ EN V3-E ─────────────────────
 *
 * Se comprobaba comparando **tres cuantiles** del polvo del intro contra los del
 * polvo de la escena y pidiendo que las tres razones dieran la perilla ±0,1.
 * **Eso no era una identidad: era un estimador**, y frágil. Las dos poblaciones
 * NO son la misma muestra —lo dice §3 abajo, es a propósito: otra semilla, otra
 * fracción dibujada, y el corte de profundidad del intro— así que la razón de
 * dos cuantiles es la razón de dos SORTEOS distintos de la misma distribución.
 * En la cola baja, donde la densidad es poca, esa razón vale **1,943** y no
 * 2,05: un desvío de 0,107 contra una tolerancia de 0,1.
 *
 * V3-E movió `frameX` del hero de 0,68 a 0,5 —la cámara rota, y con ella cambia
 * qué motas caen en cuadro— y el p10 cruzó el umbral por **0,007**. Ensanchar la
 * tolerancia habría sido aflojar una comprobación que ya estaba midiendo mal.
 *
 * **Lo que corre ahora es la identidad EXACTA, sin tolerancia y sin número
 * escrito.** `buildIntroParticles` acepta el tamaño del polvo por parámetro, así
 * que se construye el MISMO campo —misma semilla, misma fracción, misma cámara—
 * con el tamaño de la escena, y se emparejan las motas **por su posición en
 * pantalla**, que es idéntica porque los puntos son los mismos. Para cada una de
 * las 386, la razón de tamaños es la perilla **al bit** (peor desvío 4,4×10⁻¹⁶).
 * Las razones de cuantiles se siguen PUBLICANDO, porque describen lo que el ojo
 * ve; lo que dejaron de ser es la afirmación.
 */
check(
  'la densidad en cuadro es menor, y esa es la mitad del cambio',
  intro.motes.length < scene.length * 0.6,
  `${intro.motes.length} contra ${scene.length} — ${(((intro.motes.length - scene.length) / scene.length) * 100).toFixed(1)}%`
)

/** El mismo campo del intro con el tamaño de polvo de la escena. Mismos puntos. */
const conTamanoDeEscena = buildIntroParticles(W, H, PARTICLE_SIZE)
const porPosicion = new Map(
  conTamanoDeEscena.motes.filter((m) => m.kind === 'dust').map((m) => [`${m.xPx}|${m.yPx}`, m.sizePx]),
)
const razones = intro.motes
  .filter((m) => m.kind === 'dust')
  .map((m) => {
    const chico = porPosicion.get(`${m.xPx}|${m.yPx}`)
    return chico === undefined ? null : m.sizePx / chico
  })
const emparejadas = razones.filter((r): r is number => r !== null)
const peorDesvio = emparejadas.reduce((peor, r) => Math.max(peor, Math.abs(r - INTRO_DUST_SCALE)), 0)

check(
  'polvo: es el de la escena POR LA ESCALA, mota por mota y al bit',
  emparejadas.length === introDust.length && peorDesvio < 1e-12,
  `las ${emparejadas.length} motas de polvo emparejadas por posición · peor desvío de la razón ${peorDesvio.toExponential(1)} contra la perilla en ${INTRO_DUST_SCALE}`,
)
check(
  'control positivo — el emparejamiento NO es vacío ni parcial: cubre todo el polvo del intro',
  emparejadas.length > 0 && razones.every((r) => r !== null),
  `${emparejadas.length} de ${razones.length} — si el campo chico fuera otro sorteo, ninguna posición emparejaría`,
)
check(
  'control positivo — con OTRA escala la misma identidad da falso',
  Math.abs(emparejadas[0] - INTRO_DUST_SCALE * 1.05) > 1e-12,
  'la razón medida es la perilla, no cualquier número: contra la perilla ×1,05 el predicado se cae',
)
console.log(
  `  razones de CUANTILES (publicadas, no afirmadas — dos sorteos distintos): ` +
    `p10 ×${(quantile(introDust, 0.1) / quantile(sceneDust, 0.1)).toFixed(3)} · ` +
    `mediana ×${(quantile(introDust, 0.5) / quantile(sceneDust, 0.5)).toFixed(3)} · ` +
    `p90 ×${(quantile(introDust, 0.9) / quantile(sceneDust, 0.9)).toFixed(3)} · perilla ${INTRO_DUST_SCALE}`,
)
/**
 * El bokeh, en cambio, **no se tocó**: sigue siendo el mismo disco que la escena
 * proyecta en esta pose. La escala grande del campo ya estaba donde tenía que
 * estar; lo que no se leía era el polvo.
 */
check(
  'bokeh · mediana: mismo diámetro en píxeles, sin escala de por medio',
  near(quantile(introBokeh, 0.5), quantile(sceneBokeh, 0.5), 0.6),
  `${quantile(introBokeh, 0.5).toFixed(2)} contra ${quantile(sceneBokeh, 0.5).toFixed(2)} px`
)

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

// ── 4 · El recorte de las dos escalas ───────────────────────────────────────

section('4 · El único recorte, y sale de la regla de las dos escalas de S10')

const eye = Math.hypot(SCENE_ENTRY_POSE.distance, SCENE_ENTRY_POSE.height - ORBIT_TARGET_Y)
const floor = dustDepthFloor(eye)
/**
 * ⚠ **Entra `INTRO_DUST_SIZE`, no `PARTICLE_SIZE` (S14).** El borde se corre CON
 * la mota: el tamaño está arriba y abajo de la misma cuenta y se cancela, así
 * que **el diámetro del corte no se mueve ni un píxel** al agrandar el polvo —
 * lo que se mueve es la profundidad a la que cae, de 3,97 a 8,15, y con ella
 * cuántas motas quedan afuera.
 */
check(
  'el piso de profundidad del polvo ES el diámetro del bokeh más chico',
  near(pointSizePx(INTRO_DUST_SIZE, floor, H), pointSizePx(BOKEH_SIZE, eye + BOKEH_R_MAX, H), 1e-9),
  `${floor.toFixed(3)} de profundidad → ${pointSizePx(INTRO_DUST_SIZE, floor, H).toFixed(2)} px, el mismo disco`
)
check(
  'ninguna mota de polvo del intro proyecta más que el bokeh más chico',
  Math.max(...introDust) < Math.min(...introBokeh),
  `polvo hasta ${Math.max(...introDust).toFixed(2)} px · bokeh desde ${Math.min(...introBokeh).toFixed(2)} px`
)
check(
  'la escena, en esta pose, ya lo cumple sola — no se le está imponiendo nada',
  Math.max(...sceneDust) < pointSizePx(INTRO_DUST_SIZE, floor, H),
  `su mota más grande mide ${Math.max(...sceneDust).toFixed(2)} px contra ${pointSizePx(INTRO_DUST_SIZE, floor, H).toFixed(2)}`
)
/**
 * 🔴 **Control positivo: el recorte tiene que estar sacando motas de verdad**, o
 * las tres comprobaciones de arriba serían verdes por vacío. Se cuenta contra el
 * MISMO campo con un tamaño de mundo ínfimo, donde el borde se va a cero y no
 * deja afuera a nadie: las posiciones no dependen del tamaño, así que la
 * diferencia son exactamente las motas que el recorte se lleva.
 */
const unclipped = buildIntroParticles(W, H, INTRO_DUST_SIZE * 0.01).dustCount
check(
  'control positivo — el recorte cubre un caso que el campo produce de verdad',
  PARTICLE_R_MAX > eye && unclipped > intro.dustCount,
  `el campo llega a radio ${PARTICLE_R_MAX} con la cámara a ${eye.toFixed(2)}: una mota puede quedar a ${(PARTICLE_R_MAX - eye).toFixed(2)} por delante · el recorte se lleva ${unclipped - intro.dustCount} de ${unclipped} (${(((unclipped - intro.dustCount) / unclipped) * 100).toFixed(2)}%)`
)

report('introParticles')
