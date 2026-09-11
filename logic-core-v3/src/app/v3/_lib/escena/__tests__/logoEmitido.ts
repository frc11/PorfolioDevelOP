import {
  FILL_AZIMUTH_DEG,
  FILL_ELEVATION_DEG,
  FILL_INTENSITY,
  FOG_DIM_GAMMA,
  HEMI_DIM_GAMMA,
  HEMI_INTENSITY,
  KEY_INTENSITY,
  RIM_AZIMUTH_OFFSET_DEG,
  RIM_DISTANCE,
  RIM_HEIGHT_BASE,
  RIM_HEIGHT_TRACK,
  rimIntensityAt,
} from '../probeLighting'
import { FOG_COLOR, FOG_FAR, FOG_NEAR } from '../probeAtmosphere'
import { BOUNCE_COLOR, INK_COLOR, PAPER_COLOR } from '../probeScene'
import { sampleLightArc } from '../choreographySampler'
import type { MutableLightLevels } from '../choreographyTypes'
import {
  hexToLinear,
  linearToSrgb,
  neutralToneMap,
  shadeSurface,
  type ViewContext,
} from '@/app/probe-escena/__tests__/shading'
import type { Vec3 } from '@/app/probe-escena/__tests__/harness'

/**
 * EL VALOR DEL LOGO CUANDO EMITE — el shading de S7 con el término que le
 * faltaba, y el control que prueba que sigue siendo el mismo.
 *
 * ⚠ **Este archivo NO se escanea por tokens.** Es un instrumento: sus números
 * son irradiancias, valores 0..255 y coeficientes de niebla.
 *
 * ── Por qué existe, si `shading.ts` ya modela la escena ────────────────────
 *
 * Porque `shadeSurface` calcula `linear = albedo × (directa + indirecta)` y le
 * entrega ESO al tone mapping. Una emisiva **no se puede sumar después**: entra
 * al operador junto con el resto de la radiancia (three la suma a
 * `outgoingLight` en `lights_fragment_end`, o sea antes de
 * `tonemapping_fragment` y antes de la niebla), y el operador no es lineal. Con
 * el valor ya mapeado en la mano no hay forma de recuperar la entrada: el toe
 * aplasta y el codo comprime.
 *
 * Así que la cadena se re-escribe **una sola vez, acá**, con el término puesto
 * donde va: `linear = albedo × (directa + indirecta) + emisiva`.
 *
 * ── ⚠ Y por eso lo primero que hace es un CONTROL DE EQUIVALENCIA ──────────
 *
 * `equivaleSinEmision` compara esta cadena con `shadeSurface` sobre una malla de
 * normales, profundidades, gobos y progresos. **Con la emisiva en 0 tienen que
 * dar el mismo número.** Sin ese control, esta copia sería una segunda opinión
 * sobre la escena, y ninguna de las cifras que salgan de acá se podría comparar
 * con las de S7–S12, B8 o B11 — que es exactamente el modo de falla que
 * `s10-logo.ts` documenta en su cabecera para su propia copia.
 *
 * ── Lo que NO modela, heredado de `shading.ts` y sin cambios ───────────────
 *
 * El lóbulo especular, el matiz de la temperatura de color y la sombra
 * proyectada. Los tres empujan hacia abajo, así que lo que sale de acá es un
 * TECHO. **Y hay uno nuevo, propio de la emisiva:** el `emissive` de three NO
 * ilumina nada — no es una luz, es radiancia de salida de ese fragmento —, así
 * que el piso, la pared y las motas alrededor del logo valen exactamente lo
 * mismo con el logo emitiendo que sin él. Es una propiedad del motor, no una
 * simplificación del modelo, y se declara acá porque es la diferencia entre
 * «el objeto brilla» y «el objeto ilumina».
 */

const RAD = Math.PI / 180
const arco: MutableLightLevels = { level: 1, kelvin: 6500, azimuthDeg: 0, elevationDeg: 0 }

function direccion(azimuthDeg: number, elevationDeg: number): Vec3 {
  const azimut = azimuthDeg * RAD
  const elevacion = elevationDeg * RAD
  return [
    Math.sin(azimut) * Math.cos(elevacion),
    Math.sin(elevacion),
    Math.cos(azimut) * Math.cos(elevacion),
  ]
}

/**
 * El valor sRGB 0..255 de una superficie mate de albedo `hex` **que además
 * emite** `emisiva` en luz lineal (los tres canales iguales: un logo que emite
 * emite blanco).
 *
 * Los seis primeros parámetros son los de `shadeSurface`, en el mismo orden y
 * con el mismo significado, para que las dos se puedan cruzar sin traducir.
 */
export function shadeConEmision(
  hex: string,
  n: Vec3,
  view: ViewContext,
  depth: number,
  keyGobo = 1,
  sky = 1,
  emisiva = 0,
): number {
  sampleLightArc(view.progress, arco)
  const level = arco.level
  const albedo = hexToLinear(hex)

  const sol = direccion(arco.azimuthDeg, arco.elevationDeg)
  const relleno = direccion(FILL_AZIMUTH_DEG, FILL_ELEVATION_DEG)

  const rimAzimut = (view.cameraAzimuthDeg + RIM_AZIMUTH_OFFSET_DEG) * RAD
  const rimX = Math.sin(rimAzimut) * RIM_DISTANCE
  const rimZ = Math.cos(rimAzimut) * RIM_DISTANCE
  const rimY = RIM_HEIGHT_BASE + view.cameraHeight * RIM_HEIGHT_TRACK
  const rimLargo = Math.hypot(Math.hypot(rimX, rimZ), rimY)
  const rim: Vec3 = [rimX / rimLargo, rimY / rimLargo, rimZ / rimLargo]

  const dotSol = Math.max(0, n[0] * sol[0] + n[1] * sol[1] + n[2] * sol[2])
  const dotRelleno = Math.max(0, n[0] * relleno[0] + n[1] * relleno[1] + n[2] * relleno[2])
  const dotRim = Math.max(0, n[0] * rim[0] + n[1] * rim[1] + n[2] * rim[2])

  const directa =
    (KEY_INTENSITY * level * dotSol * keyGobo +
      FILL_INTENSITY * level * dotRelleno +
      rimIntensityAt(level) * dotRim) /
    Math.PI

  const cielo = hexToLinear(PAPER_COLOR)
  const suelo = hexToLinear(BOUNCE_COLOR)
  const mezclaHemisferio = 0.5 * n[1] + 0.5
  const hemisferio = HEMI_INTENSITY * sky * Math.pow(level, HEMI_DIM_GAMMA)

  const lineal: [number, number, number] = [0, 0, 0]
  for (let c = 0; c < 3; c += 1) {
    const indirecta =
      ((suelo[c] + (cielo[c] - suelo[c]) * mezclaHemisferio) * hemisferio) / Math.PI
    // ⚠ EL TÉRMINO NUEVO, y el único: la emisiva entra a la suma lineal, antes
    // del tone mapping. Los tres canales llevan el mismo valor.
    lineal[c] = albedo[c] * (directa + indirecta) + emisiva
  }

  const mapeado = neutralToneMap(lineal)
  const valor = linearToSrgb(Math.max(0, Math.min(1, mapeado[1])))

  const t = Math.max(0, Math.min(1, (depth - FOG_NEAR) / (FOG_FAR - FOG_NEAR)))
  const factorDeNiebla = t * t * (3 - 2 * t)
  const valorDeNiebla = linearToSrgb(
    Math.max(0, Math.min(1, hexToLinear(FOG_COLOR)[1] * Math.pow(level, FOG_DIM_GAMMA))),
  )

  return (valor + (valorDeNiebla - valor) * factorDeNiebla) * 255
}

/** Una discrepancia entre las dos cadenas: dónde, y de cuánto. */
export interface Discrepancia {
  readonly progreso: number
  readonly normal: Vec3
  readonly profundidad: number
  readonly gobo: number
  readonly cielo: number
  readonly delta: number
}

/**
 * EL CONTROL DE EQUIVALENCIA. Con la emisiva en 0, `shadeConEmision` tiene que
 * devolver EXACTAMENTE lo que devuelve `shadeSurface` — no «parecido»: el mismo
 * doble. Barre la malla de casos que el logo recorre de verdad.
 *
 * Devuelve la lista de discrepancias (vacía = equivalentes) y cuántos casos
 * comparó, para que el invariante pueda afirmar que la malla no estaba vacía.
 */
export function equivaleSinEmision(): {
  readonly casos: number
  readonly discrepancias: readonly Discrepancia[]
} {
  const normales: readonly Vec3[] = [
    [0, 0, 1],
    [0, 0, -1],
    [0, 1, 0],
    [1, 0, 0],
    [0.577, 0.577, 0.577],
  ]
  const discrepancias: Discrepancia[] = []
  let casos = 0
  for (let i = 0; i <= 20; i += 1) {
    const progreso = i / 20
    const view: ViewContext = {
      progress: progreso,
      cameraAzimuthDeg: progreso * 360,
      cameraHeight: 9 - progreso * 13,
    }
    for (const normal of normales) {
      for (const profundidad of [5, 20, 60, 150, 300]) {
        for (const gobo of [0, 0.5, 1]) {
          for (const cielo of [0.6743, 1]) {
            casos += 1
            const mio = shadeConEmision(INK_COLOR, normal, view, profundidad, gobo, cielo, 0)
            const suyo = shadeSurface(INK_COLOR, normal, view, profundidad, gobo, cielo)
            if (mio !== suyo) {
              discrepancias.push({ progreso, normal, profundidad, gobo, cielo, delta: mio - suyo })
            }
          }
        }
      }
    }
  }
  return { casos, discrepancias }
}
