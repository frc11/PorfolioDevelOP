import {
  FILL_INTENSITY,
  HEMI_INTENSITY,
  KEY_INTENSITY,
} from '@/app/probe-escena/_components/probeLighting'

import { check, report, section } from './introChecks'
import {
  INTRO_INK_FROM,
  INTRO_INK_TO,
  hexToSrgb,
  linearToSrgb,
  mixSrgbInLinearLight,
  neutralToneMapGray,
  sampleInkShading,
  solveEmissiveForSrgb,
  solveNeutralToneMapGray,
  srgbToBytes,
  srgbToHex,
  srgbToLinear,
  type IntroInkShading,
} from './introShading'
import { INTRO_COLORS, INTRO_SHADOW } from './introTimeline'

/**
 * COMPROBACIÓN ESTÁTICA DEL COLOR Y LA LUZ — **que las dos capas del logo
 * pinten exactamente el mismo color durante todo el relevo.**
 *
 *     npx tsx src/components/layout/home-intro/introShading.invariant.ts
 *
 * ── Por qué esto existe ────────────────────────────────────────────────────
 *
 * El relevo 2D→3D es un cruce con alfa entre un SVG y un mesh. Si en algún
 * instante los dos no tienen el mismo color, se lee como dos objetos
 * superpuestos en vez de uno. El SVG pinta el `#RRGGBB` que sale de
 * `sampleInkColor`; el mesh emite lo que `solveEmissiveForSrgb` despeja contra
 * el tone mapping. **Que las dos cuentas den lo mismo es lo que se comprueba
 * acá, punto por punto sobre el recorrido entero de la tinta** — y no se puede
 * ver en un navegador, porque el intro no corre bajo automatización.
 *
 * ── Lo que NO está acá, dicho en voz alta ──────────────────────────────────
 *
 * No se reimplementa el BRDF de three. El diagnóstico del bug de S8b —que con
 * luz frontal la cara daba #D9D9D9 porque `D_GGX` vale 23,82 con `dotNH = 1`—
 * se calculó una vez y está en el reporte de S8c. Lo que se comprueba es la
 * garantía estructural que lo reemplaza: con `reveal` en 0 no hay ninguna luz
 * encendida, así que no hay especular posible.
 */

const EPS = 1e-9

// ── Espacio de color ────────────────────────────────────────────────────────

section('sRGB ↔ lineal, ida y vuelta')

let roundTrips = true
for (let b = 0; b <= 255; b += 1) {
  const channel = b / 255
  if (Math.abs(linearToSrgb(srgbToLinear(channel)) - channel) > 1e-12) roundTrips = false
}
check('los 256 valores vuelven a su lugar', roundTrips)
check('el negro es negro', srgbToLinear(0) === 0)
check('el blanco es blanco', Math.abs(srgbToLinear(1) - 1) < EPS)

section('la mezcla en luz lineal respeta los extremos')

check('en 0 devuelve el primero', srgbToHex(mixSrgbInLinearLight(INTRO_INK_FROM, INTRO_INK_TO, 0)) === INTRO_COLORS.inkOnDark.toLowerCase())
check('en 1 devuelve el segundo', srgbToHex(mixSrgbInLinearLight(INTRO_INK_FROM, INTRO_INK_TO, 1)) === INTRO_COLORS.inkOnLight.toLowerCase())
check('y fuera de rango recorta', srgbToHex(mixSrgbInLinearLight(INTRO_INK_FROM, INTRO_INK_TO, 4)) === INTRO_COLORS.inkOnLight.toLowerCase())

// ── El tone mapping, contra una transcripción literal del GLSL ─────────────

section('NeutralToneMapping — la versión para grises reproduce la de three')

/** Transcripción literal de `tonemapping_pars_fragment.glsl.js` de three 0.182. */
function neutralToneMappingGlsl(color: [number, number, number]): [number, number, number] {
  const START = 0.8 - 0.04
  const DESAT = 0.15
  let [r, g, b] = color
  const x = Math.min(r, Math.min(g, b))
  const offset = x < 0.08 ? x - 6.25 * x * x : 0.04
  r -= offset
  g -= offset
  b -= offset
  const peak = Math.max(r, Math.max(g, b))
  if (peak < START) return [r, g, b]
  const d = 1 - START
  const newPeak = 1 - (d * d) / (peak + d - START)
  const k = newPeak / peak
  r *= k
  g *= k
  b *= k
  const mix = 1 - 1 / (DESAT * (peak - newPeak) + 1)
  return [r + (newPeak - r) * mix, g + (newPeak - g) * mix, b + (newPeak - b) * mix]
}

let matchesGlsl = true
for (let i = 0; i <= 400; i += 1) {
  const value = i / 100 // hasta 4,0: cubre el toe, el codo y la compresión
  const [r] = neutralToneMappingGlsl([value, value, value])
  if (Math.abs(neutralToneMapGray(value) - r) > 1e-12) matchesGlsl = false
}
check('401 valores, del toe a la compresión', matchesGlsl)
check(
  'por debajo del codo es exactamente 6,25·x²',
  Math.abs(neutralToneMapGray(0.03) - 6.25 * 0.03 * 0.03) < 1e-15,
  'el toe que aplasta los negros de la escena'
)
check('la inversa por bisección acierta', Math.abs(neutralToneMapGray(solveNeutralToneMapGray(0.2)) - 0.2) < 1e-9)
check(
  'y alcanza el blanco, que necesita emitir por encima de 1',
  solveNeutralToneMapGray(srgbToLinear(INTRO_INK_FROM[0])) > 1,
  `${solveNeutralToneMapGray(srgbToLinear(INTRO_INK_FROM[0])).toFixed(3)} lineal para ${INTRO_COLORS.inkOnDark}`
)

// ── EL CHEQUEO QUE IMPORTA ──────────────────────────────────────────────────

section('🔴 el mesh y el SVG pintan el MISMO color, en todo el recorrido')

/** Lo que el mesh termina mostrando para una emisiva dada. */
function rendered(emissive: readonly number[]): readonly [number, number, number] {
  return srgbToBytes([
    linearToSrgb(neutralToneMapGray(emissive[0])),
    linearToSrgb(neutralToneMapGray(emissive[1])),
    linearToSrgb(neutralToneMapGray(emissive[2])),
  ])
}

let exact = 0
let off = 0
let worstLabel = ''
for (let i = 0; i <= 400; i += 1) {
  const svg = mixSrgbInLinearLight(INTRO_INK_FROM, INTRO_INK_TO, i / 400)
  const mesh = rendered(solveEmissiveForSrgb(svg))
  const target = srgbToBytes(svg)
  if (mesh[0] === target[0] && mesh[1] === target[1] && mesh[2] === target[2]) exact += 1
  else {
    off += 1
    worstLabel = `${srgbToHex(svg)} → ${mesh.join(',')}`
  }
}
check(
  '401 puntos del recorrido, byte por byte',
  off === 0,
  off === 0 ? `${exact} exactos` : `${off} distintos · p.ej. ${worstLabel}`
)

section('y los dos extremos son los tokens del sistema')

const flat = sampleInkShading(0)
const inkEnd = rendered(solveEmissiveForSrgb(hexToSrgb(INTRO_COLORS.inkOnLight)))
const inkStart = rendered(solveEmissiveForSrgb(hexToSrgb(INTRO_COLORS.inkOnDark)))
check(
  `al terminar la transformación el mesh es ${INTRO_COLORS.inkOnLight}`,
  inkEnd[0] === 17 && inkEnd[1] === 17 && inkEnd[2] === 17,
  `${inkEnd.join(',')}`
)
check(
  `y al empezarla es ${INTRO_COLORS.inkOnDark}`,
  inkStart[0] === 247 && inkStart[1] === 247 && inkStart[2] === 245,
  `${inkStart.join(',')}`
)

// ── La garantía estructural ─────────────────────────────────────────────────

section('🔴 con el logo plano NO hay una sola luz encendida')

/** La propiedad, como predicado: es lo que hace imposible el bug de S8b. */
const UNLIT = (shading: IntroInkShading): boolean =>
  shading.keyIntensity === 0 && shading.fillIntensity === 0 && shading.hemiIntensity === 0

check('key, fill y hemisférico en cero', UNLIT(flat))
check('la emisiva entera', flat.emissiveMix === 1)
check('y no hay sombra que proyectar', flat.shadowOpacity === 0)

section('con el volumen revelado, el rig es el de la escena')

const lit = sampleInkShading(1)
check('la emisiva se apagó', lit.emissiveMix === 0)
check('key', lit.keyIntensity === KEY_INTENSITY, `${KEY_INTENSITY}`)
check('fill', lit.fillIntensity === FILL_INTENSITY, `${FILL_INTENSITY}`)
check('hemisférico', lit.hemiIntensity === HEMI_INTENSITY, `${HEMI_INTENSITY}`)
check('la sombra llegó a su opacidad', lit.shadowOpacity === INTRO_SHADOW.opacity)
check(
  'ninguna intensidad es inventada acá',
  lit.keyIntensity + lit.fillIntensity + lit.hemiIntensity ===
    KEY_INTENSITY + FILL_INTENSITY + HEMI_INTENSITY
)

section('el cruce es monótono en las dos direcciones')

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

// ── Control negativo ────────────────────────────────────────────────────────

section('control negativo — el bug de S8b, en su forma de datos')

const conLuzFrontal: IntroInkShading = { ...flat, keyIntensity: 3.2 }
check('detecta una luz prendida sobre el logo plano', !UNLIT(conLuzFrontal))

const crudo = rendered([
  srgbToLinear(hexToSrgb(INTRO_COLORS.inkOnLight)[0]),
  srgbToLinear(hexToSrgb(INTRO_COLORS.inkOnLight)[1]),
  srgbToLinear(hexToSrgb(INTRO_COLORS.inkOnLight)[2]),
])
check(
  'detecta la emisiva sin resolver: el tone mapping la aplastaría',
  crudo[0] !== 17,
  `emitir la tinta cruda daría ${crudo.join(',')} y no 17,17,17`
)

report('introShading')
