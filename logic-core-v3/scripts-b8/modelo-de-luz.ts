/**
 * EL MODELO DE LUZ POR NIVEL — para elegir la noche de Trabajos con un número
 * antes de tocar el arco (B8, PARADA 1).
 *
 *     npx tsx scripts-b8/modelo-de-luz.ts
 *
 * Es la MISMA cadena que `probe-escena/__tests__/shading.ts` reimplementa de
 * three —irradiancia de las cuatro luces → Lambert → NeutralToneMapping → sRGB →
 * niebla—, con UNA diferencia: el nivel y el reparto del contraluz entran por
 * parámetro en vez de salir de `LIGHT_ARC` y de `RIM_DIM_SHARE`. Sirve para
 * preguntar «¿qué valor tiene el papel con el sol a 4°?» sin editar el arco. Lo
 * que NO modela es lo mismo que allá: partículas, sombra proyectada y especular,
 * así que los valores son un TECHO de la escena real.
 *
 * El control positivo es el de S11: con nivel 1, el cielo tapado y la cámara del
 * hero, el papel a sol abierto tiene que dar 248,3 y bajo la barra 218,7
 * (`S11-LUZ.md` §1). Si no reproduce esos dos, ninguna otra cifra vale.
 */

import { FOG_COLOR, FOG_FAR, FOG_NEAR } from '../src/app/v3/_lib/escena/probeAtmosphere'
import { CELOSIA_BAR, celosiaSkyFactor } from '../src/app/v3/_lib/escena/probeCelosia'
import {
  FILL_AZIMUTH_DEG,
  FILL_ELEVATION_DEG,
  FILL_INTENSITY,
  FOG_DIM_GAMMA,
  HEMI_DIM_GAMMA,
  HEMI_INTENSITY,
  KEY_ELEVATION_DEG,
  KEY_INTENSITY,
  RIM_DIM_SHARE,
  RIM_DISTANCE,
  RIM_HEIGHT_BASE,
  RIM_HEIGHT_TRACK,
  RIM_INTENSITY,
} from '../src/app/v3/_lib/escena/probeLighting'
import { MOIRE_COLOR, MOIRE_OPACITY } from '../src/app/v3/_lib/escena/probeMoire'
import { BOUNCE_COLOR, PAPER_COLOR } from '../src/app/v3/_lib/escena/probeScene'
import { hexToLinear, linearToSrgb, neutralToneMap, over } from '../src/app/probe-escena/__tests__/shading'
import { luminancia } from '../scripts-b4/color'

const RAD = Math.PI / 180
type V3 = readonly [number, number, number]

/** `RIM_INTENSITY × (1 − (1 − nivel) × parte)`: el reparto de `lightRig.ts`. */
function rimDeHoy(level: number): number {
  return RIM_INTENSITY * (1 - (1 - level) * RIM_DIM_SHARE)
}

/** Cuánto del contraluz le toca al piso desde una cámara a altura `h`: rim.y / |rim|. */
function dotRimPiso(h: number): number {
  const y = RIM_HEIGHT_BASE + h * RIM_HEIGHT_TRACK
  return Math.max(0, y / Math.hypot(RIM_DISTANCE, y))
}

function valor(hex: string, n: V3, sun: V3, level: number, gobo: number, sky: number, depth: number, dotRim: number, rim: number): number {
  const albedo = hexToLinear(hex)
  const fill: V3 = [
    Math.sin(FILL_AZIMUTH_DEG * RAD) * Math.cos(FILL_ELEVATION_DEG * RAD),
    Math.sin(FILL_ELEVATION_DEG * RAD),
    Math.cos(FILL_AZIMUTH_DEG * RAD) * Math.cos(FILL_ELEVATION_DEG * RAD),
  ]
  const dot = (a: V3, b: V3): number => Math.max(0, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])
  const direct = (KEY_INTENSITY * level * dot(n, sun) * gobo + FILL_INTENSITY * level * dot(n, fill) + rim * dotRim) / Math.PI
  const skyColor = hexToLinear(PAPER_COLOR)
  const ground = hexToLinear(BOUNCE_COLOR)
  const mix = 0.5 * n[1] + 0.5
  const hemisphere = HEMI_INTENSITY * sky * Math.pow(level, HEMI_DIM_GAMMA)
  const linear: [number, number, number] = [0, 0, 0]
  for (let c = 0; c < 3; c += 1) linear[c] = albedo[c] * (direct + ((ground[c] + (skyColor[c] - ground[c]) * mix) * hemisphere) / Math.PI)
  const mapped = neutralToneMap(linear)
  const v = linearToSrgb(Math.max(0, Math.min(1, mapped[1])))
  const t = Math.max(0, Math.min(1, (depth - FOG_NEAR) / (FOG_FAR - FOG_NEAR)))
  const fog = t * t * (3 - 2 * t)
  return (v + (niebla(level) / 255 - v) * fog) * 255
}

/** El color de la niebla y del fondo, apagado con el nivel: `FOG_COLOR × nivel^γ`. */
function niebla(level: number): number {
  return linearToSrgb(Math.max(0, Math.min(1, hexToLinear(FOG_COLOR)[1] * Math.pow(level, FOG_DIM_GAMMA)))) * 255
}

const sky = celosiaSkyFactor(CELOSIA_BAR)
const sunAt = (elevDeg: number, azDeg: number): V3 => [Math.sin(azDeg * RAD) * Math.cos(elevDeg * RAD), Math.sin(elevDeg * RAD), Math.cos(azDeg * RAD) * Math.cos(elevDeg * RAD)]
const ARRIBA: V3 = [0, 1, 0]
const lum = (v: number): number => luminancia(v, v, v)

// ── Control positivo (S11 §1): nivel 1, cielo tapado, cámara del hero (altura 6,4), sin niebla ──
const solDelHero = sunAt(KEY_ELEVATION_DEG, -42)
const rimHero = dotRimPiso(6.4)
const controlAbierto = valor(PAPER_COLOR, ARRIBA, solDelHero, 1, 1, sky, 0, rimHero, rimDeHoy(1))
const controlBarra = valor(PAPER_COLOR, ARRIBA, solDelHero, 1, 0, sky, 0, rimHero, rimDeHoy(1))
console.log(`control S11 · papel a sol abierto ${controlAbierto.toFixed(1)} (esperado 248,3) · bajo la barra ${controlBarra.toFixed(1)} (esperado 218,7)`)
if (Math.abs(controlAbierto - 248.3) > 1 || Math.abs(controlBarra - 218.7) > 1) throw new Error('el modelo no reproduce S11: ninguna cifra de abajo vale')

/** La transmitancia media de las dos capas: (1 − c)² con la barra c. Un promedio grueso, no el gobo por píxel. */
const goboMedio = (1 - CELOSIA_BAR) * (1 - CELOSIA_BAR)

function tabla(titulo: string, camH: number, azCam: number, azSol: number, rim: (level: number) => number): void {
  console.log(`\n${titulo}`)
  console.log('nivel   elev    piso abierto  piso barra  piso medio  |  pared fondo(60)  envolvente  niebla  |  lum piso medio  lum pared')
  const nPared: V3 = [Math.sin(azCam * RAD), 0, Math.cos(azCam * RAD)]
  for (const level of [1, 0.84, 0.7, 0.6, 0.5, 0.4, 0.34, 0.25, 0.2, 0.15, 0.12, 0.1, 0.08, 0.06, 0.04, 0.02]) {
    const elev = (Math.asin(Math.min(1, level * Math.sin(KEY_ELEVATION_DEG * RAD))) * 180) / Math.PI
    const sun = sunAt(elev, azSol)
    const r = rim(level)
    const d = dotRimPiso(camH)
    const abierto = valor(PAPER_COLOR, ARRIBA, sun, level, 1, sky, 20, d, r)
    const barra = valor(PAPER_COLOR, ARRIBA, sun, level, 0, sky, 20, d, r)
    const medio = valor(PAPER_COLOR, ARRIBA, sun, level, goboMedio, sky, 20, d, r)
    // La pared del fondo, detrás del logo, a 60 de la cámara. El contraluz NO la
    // alcanza: una direccional ilumina lo que mira hacia ella, y esa pared mira
    // hacia la cámara, o sea en contra. Dos raíces de celosía: gobo medio.
    const pared = valor(PAPER_COLOR, nPared, sun, level, goboMedio, sky, 60, 0, r)
    const envolvente = over(valor(MOIRE_COLOR, nPared, sun, level, 1, sky, 45, 0, r), MOIRE_OPACITY, pared)
    console.log(
      `${level.toFixed(2).padStart(5)}  ${elev.toFixed(1).padStart(5)}°  ${abierto.toFixed(1).padStart(12)}  ${barra.toFixed(1).padStart(10)}  ${medio.toFixed(1).padStart(10)}  |  ${pared.toFixed(1).padStart(15)}  ${envolvente.toFixed(1).padStart(10)}  ${niebla(level).toFixed(1).padStart(6)}  |  ${lum(medio).toFixed(4).padStart(14)}  ${lum(pared).toFixed(4).padStart(9)}`,
    )
  }
}

tabla('A · POSE DE TRABAJOS (cámara a 4,5 de altura, azimut 195; sol en azimut 120) · contraluz como hoy: RIM × (1 − (1 − nivel) × 0,62)', 4.5, 195, 120, rimDeHoy)
tabla('B · la misma pose, con el contraluz APAGÁNDOSE con la sala debajo de 0,34: rim(nivel) = rimDeHoy(0,34) × nivel / 0,34', 4.5, 195, 120, (level) => (level >= 0.34 ? rimDeHoy(level) : (rimDeHoy(0.34) * level) / 0.34))
tabla('C · POSE DEL CIERRE (cámara a −1,4, azimut 0; sol en azimut 138) · contraluz como hoy', -1.4, 0, 138, rimDeHoy)
console.log('\nreferencia (B6-A a-referencia.json, heredado): la sala de nk.studio tiene luminancia media 0,001 a 0,066 en sus pantallas oscuras — o sea 8 a 72 en sRGB.')
