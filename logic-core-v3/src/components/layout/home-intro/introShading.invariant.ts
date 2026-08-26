import { check, report, section } from './introChecks'
import {
  INTRO_INK_FROM,
  INTRO_INK_TO,
  hexToSrgb,
  linearToSrgb,
  mixSrgbInLinearLight,
  neutralToneMapGray,
  solveEmissiveForSrgb,
  solveNeutralToneMapGray,
  srgbToBytes,
  srgbToHex,
  srgbToLinear,
} from './introShading'
import { INTRO_COLORS } from './introTimeline'

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
 * ── Lo que NO está acá ─────────────────────────────────────────────────────
 *
 * **La luz.** Vive en `introRig.ts` desde S13 y la comprueba
 * `introRig.invariant.ts`, incluido el escalón de exposición de §7.11. Acá quedó
 * solo el color, que es lo que las dos capas tienen que compartir.
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

// ── Control negativo ────────────────────────────────────────────────────────

section('control negativo — la emisiva sin resolver')

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
