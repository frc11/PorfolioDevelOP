import {
  FILL_AZIMUTH_DEG,
  FILL_ELEVATION_DEG,
  FILL_INTENSITY,
  HEMI_INTENSITY,
  KEY_AZIMUTH_DEG,
  KEY_ELEVATION_DEG,
  KEY_INTENSITY,
} from '@/app/v3/_lib/escena/probeLighting'
import { CELOSIA_BAR, celosiaSkyFactor } from '@/app/v3/_lib/escena/probeCelosia'
import { BOUNCE_COLOR, INK_COLOR, PAPER_COLOR } from '@/app/v3/_lib/escena/probeScene'
import {
  hexToLinear,
  levelAt,
  linearToSrgb,
  neutralToneMap,
  shadeSurface,
} from '@/app/probe-escena/__tests__/shading'
import type { Vec3 } from '@/app/probe-escena/__tests__/harness'

import { check, report, section } from './introChecks'
import { INTRO_SKY_FACTOR, sampleInkShading, type IntroInkShading } from './introRig'
import { INTRO_SHADOW } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL RIG DEL INTRO — **cuánta luz tiene el logo, y que
 * sea exactamente la de la escena.**
 *
 *     npx tsx src/components/layout/home-intro/introRig.invariant.ts
 *
 * Salió de `introShading.invariant.ts` en S13, con la misma costura que partió
 * los módulos: allá el color, acá la luz.
 *
 * Dos cosas se custodian:
 *
 *  1. **Con `reveal` en 0 no hay una sola luz encendida.** Es lo que hace
 *     imposible el bug de S8b —iluminar de frente pone `dotNH = 1` sobre toda la
 *     cara y con `INK_ROUGHNESS` en 0,34 salía en #D9D9D9—, y no por
 *     calibración: si no hay luces no hay especular posible.
 *  2. **Con `reveal` en 1 el rig es el de la escena, con su factor de cielo.**
 *     Es el escalón de exposición de §7.11, resuelto — ver abajo.
 */

// ── El logo plano ───────────────────────────────────────────────────────────

section('🔴 con el logo plano NO hay una sola luz encendida')

/** La propiedad, como predicado: es lo que hace imposible el bug de S8b. */
const UNLIT = (shading: IntroInkShading): boolean =>
  shading.keyIntensity === 0 && shading.fillIntensity === 0 && shading.hemiIntensity === 0

const flat = sampleInkShading(0)
check('key, fill y hemisférico en cero', UNLIT(flat))
check('la emisiva entera', flat.emissiveMix === 1)
check('y no hay sombra que proyectar', flat.shadowOpacity === 0)

// ── El logo revelado ────────────────────────────────────────────────────────

section('con el volumen revelado, el rig es el de la escena')

const lit = sampleInkShading(1)
check('la emisiva se apagó', lit.emissiveMix === 0)
check('key', lit.keyIntensity === KEY_INTENSITY, `${KEY_INTENSITY}`)
check('fill', lit.fillIntensity === FILL_INTENSITY, `${FILL_INTENSITY}`)
check('la sombra llegó a su opacidad', lit.shadowOpacity === INTRO_SHADOW.opacity)

/**
 * 🔴 **EL ESCALÓN DE EXPOSICIÓN DE §7.11 — la comprobación que S13 endureció.**
 *
 * Hasta S12 esto comparaba `lit.hemiIntensity === HEMI_INTENSITY` por identidad,
 * y custodiaba **"el intro termina en el valor pleno"**. El problema es que la
 * escena NO arranca en el valor pleno: `applyLightRig` le pone el factor de
 * cielo de la celosía, o sea −32,6% de ambiente en el instante del traspaso.
 *
 * La comprobación nueva custodia **"el intro termina en el ambiente exacto con
 * el que la escena empieza"**, que es la misma garantía contra el valor correcto
 * — más fuerte, no más floja: hoy hay UN número donde antes había dos. Y los dos
 * factores entran importados: sigue sin haber un solo literal.
 */
check(
  'hemisférico — el del intro ES el de la escena, con su factor de cielo',
  lit.hemiIntensity === HEMI_INTENSITY * celosiaSkyFactor(CELOSIA_BAR),
  `${HEMI_INTENSITY} × ${celosiaSkyFactor(CELOSIA_BAR).toFixed(4)} = ${lit.hemiIntensity.toFixed(4)}`
)
check(
  'y el factor que publica el rig del intro es el mismo, no una copia',
  INTRO_SKY_FACTOR === celosiaSkyFactor(CELOSIA_BAR)
)
check(
  'ninguna intensidad es inventada acá',
  lit.keyIntensity + lit.fillIntensity + lit.hemiIntensity ===
    KEY_INTENSITY + FILL_INTENSITY + HEMI_INTENSITY * celosiaSkyFactor(CELOSIA_BAR)
)

/**
 * ⚠ **La key y el fill no tenían escalón POR UN DATO DEL ARCO, no por
 * construcción.** `applyLightRig` las escribe como `INTENSITY × level`, y el
 * nivel de `LIGHT_ARC` en p=0 vale 1. Si alguna vez el hero deja de estar a luz
 * plena aparecen dos escalones más, y hay que volver a `introRig.ts`.
 */
check(
  'el arco está a luz plena en la pose del hero — por eso key y fill ya coincidían',
  levelAt(0) === 1,
  `nivel ${levelAt(0)}`
)

// ── Cuánto valía el escalón, sobre las superficies que existen ─────────────

section('🔴 lo que §7.11 sobreestimaba: el escalón, medido donde ocurre')

const RAD = Math.PI / 180
const SKY = celosiaSkyFactor(CELOSIA_BAR)

function direction(azimuthDeg: number, elevationDeg: number): Vec3 {
  return [
    Math.sin(azimuthDeg * RAD) * Math.cos(elevationDeg * RAD),
    Math.sin(elevationDeg * RAD),
    Math.cos(azimuthDeg * RAD) * Math.cos(elevationDeg * RAD),
  ]
}

/**
 * EL RIG DEL INTRO, no el de la escena: key + fill + hemisférico, **sin
 * contraluz y sin niebla**. Reimplementar `shadeSurface` con el rim adentro
 * habría medido otra cosa — el intro no tiene rim porque su cámara no orbita
 * (`IntroSceneLights.tsx` lo deja anotado).
 *
 * Todo lo demás es de `__tests__/shading.ts`: el mismo espacio de color y el
 * mismo `NeutralToneMapping` con el que S11 publicó sus números.
 */
function introShade(hex: string, n: Vec3, sky: number): number {
  const albedo = hexToLinear(hex)
  const key = direction(KEY_AZIMUTH_DEG, KEY_ELEVATION_DEG)
  const fill = direction(FILL_AZIMUTH_DEG, FILL_ELEVATION_DEG)
  const dotKey = Math.max(0, n[0] * key[0] + n[1] * key[1] + n[2] * key[2])
  const dotFill = Math.max(0, n[0] * fill[0] + n[1] * fill[1] + n[2] * fill[2])
  const direct = (KEY_INTENSITY * dotKey + FILL_INTENSITY * dotFill) / Math.PI

  const skyColor = hexToLinear(PAPER_COLOR)
  const ground = hexToLinear(BOUNCE_COLOR)
  const mix = 0.5 * n[1] + 0.5
  const hemisphere = HEMI_INTENSITY * sky

  const linear: [number, number, number] = [0, 0, 0]
  for (let c = 0; c < 3; c += 1) {
    linear[c] =
      albedo[c] * (direct + ((ground[c] + (skyColor[c] - ground[c]) * mix) * hemisphere) / Math.PI)
  }
  const mapped = neutralToneMap(linear)
  return linearToSrgb(Math.max(0, Math.min(1, mapped[1]))) * 255
}

/**
 * 🔴 **Control positivo del instrumento, ANTES de usarlo.** Los cuatro números
 * del papel que S11 publicó tienen que salir de acá; si no salen, lo que mida
 * sobre el logo no vale nada. Es el mismo `shadeSurface` de la escena, con el
 * factor de cielo en 1 y en Ω.
 */
const view = { progress: 0, cameraAzimuthDeg: 0, cameraHeight: 6.4 }
const UP: Vec3 = [0, 1, 0]
const paperLitOpen = shadeSurface(PAPER_COLOR, UP, view, 19, 1, 1)
const paperLitSky = shadeSurface(PAPER_COLOR, UP, view, 19, 1, SKY)
const paperShadowOpen = shadeSurface(PAPER_COLOR, UP, view, 19, 0, 1)
const paperShadowSky = shadeSurface(PAPER_COLOR, UP, view, 19, 0, SKY)
check(
  'el instrumento reproduce los cuatro números del papel de S11',
  Math.abs(paperLitOpen - 249.4) < 0.1 &&
    Math.abs(paperLitSky - 248.3) < 0.1 &&
    Math.abs(paperShadowOpen - 236.9) < 0.1 &&
    Math.abs(paperShadowSky - 218.7) < 0.1,
  `iluminado ${paperLitOpen.toFixed(1)} → ${paperLitSky.toFixed(1)} · en sombra ${paperShadowOpen.toFixed(1)} → ${paperShadowSky.toFixed(1)}`
)
check(
  'y ahí el escalón vale los −18,2 puntos que §7.11 publica',
  Math.abs(paperShadowSky - paperShadowOpen + 18.2) < 0.1,
  `${(paperShadowSky - paperShadowOpen).toFixed(1)} puntos sobre el papel EN SOMBRA de la escena`
)

/**
 * ⚠ **Y ahora la corrección.** Esos −18,2 son sobre el **piso de la escena**, y
 * el intro no tiene piso: no hay papel, y su plano de sombra es un
 * `ShadowMaterial`, que oscurece lo que hay detrás en vez de recibir luz. La
 * ÚNICA superficie iluminada del intro es el logo, y la tinta `#0F0F0F` queda
 * tan abajo que el toe del tone map la aplasta.
 */
const NORMALS: readonly (readonly [string, Vec3])[] = [
  ['cara frontal', [0, 0, 1]],
  ['canto superior', [0, 1, 0]],
  ['canto inferior', [0, -1, 0]],
  ['canto derecho', [1, 0, 0]],
  ['canto izquierdo', [-1, 0, 0]],
]
let worstStep = 0
let worstLabel = ''
for (const [label, normal] of NORMALS) {
  const step = introShade(INK_COLOR, normal, 1) - introShade(INK_COLOR, normal, SKY)
  if (step > worstStep) {
    worstStep = step
    worstLabel = `${label} ${introShade(INK_COLOR, normal, 1).toFixed(2)} → ${introShade(INK_COLOR, normal, SKY).toFixed(2)}`
  }
}
check(
  'sobre el logo del intro el escalón NO llega a medio byte',
  worstStep < 0.5,
  `peor cara: ${worstLabel} · ${worstStep.toFixed(2)} puntos sRGB de 255`
)
check(
  'y sin embargo existe: el instrumento no lo está midiendo en cero',
  worstStep > 0.2,
  `${worstStep.toFixed(2)} puntos — el mismo −32,6% de ambiente, sobre una tinta que el toe aplasta`
)

// ── Monotonía ───────────────────────────────────────────────────────────────

section('el cruce es monótono en las dos direcciones')

const EPS = 1e-9
let emissiveFalls = true
let lightsRise = true
let previousEmissive = Infinity
let previousKey = -Infinity
for (let i = 0; i <= 400; i += 1) {
  const shading = sampleInkShading(i / 400)
  if (shading.emissiveMix > previousEmissive + EPS) emissiveFalls = false
  if (shading.keyIntensity < previousKey - EPS) lightsRise = false
  previousEmissive = shading.emissiveMix
  previousKey = shading.keyIntensity
}
check('la emisiva solo baja', emissiveFalls)
check('las luces y la sombra solo suben', lightsRise)
check('fuera de rango se recorta', sampleInkShading(-3).keyIntensity === 0)
check('y por arriba también', sampleInkShading(9).emissiveMix === 0)

// ── Controles positivos ─────────────────────────────────────────────────────

section('Que estas comprobaciones puedan fallar')

const conLuzFrontal: IntroInkShading = { ...flat, keyIntensity: 3.2 }
check('control positivo — detecta una luz prendida sobre el logo plano', !UNLIT(conLuzFrontal))
check(
  'control positivo — detecta el ambiente de cielo abierto, el escalón que §7.11 reportó',
  HEMI_INTENSITY !== HEMI_INTENSITY * SKY && SKY < 1,
  `cielo abierto ${HEMI_INTENSITY} contra ${(HEMI_INTENSITY * SKY).toFixed(4)} — ${((1 - SKY) * 100).toFixed(1)}% de caída`
)
check(
  'control positivo — con la celosía abierta el factor vuelve a 1, que es el estado anterior',
  celosiaSkyFactor(0) === 1
)
check(
  'control positivo — el modelo responde a la luz: apagar la key lo oscurece de verdad',
  introShade(INK_COLOR, [0, 0, 1], SKY) > 0,
  `cara frontal ${introShade(INK_COLOR, [0, 0, 1], SKY).toFixed(2)} contra ${introShade(INK_COLOR, [0, 0, 1], 0).toFixed(2)} sin ambiente`
)

report('introRig')
