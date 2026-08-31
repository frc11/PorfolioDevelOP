/**
 * EL RIG DEL INTRO, LEÍDO CON EL INSTRUMENTO DE LA ESCENA — sin reescribirlo.
 *
 * ════════════════════════════════════════════════════════════════════════════
 * EL PROBLEMA, Y POR QUÉ ESTE ARCHIVO NO REIMPLEMENTA UN SHADER
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Para medir el escalón de exposición hay que poder sombrear una superficie
 * **con el rig del intro**: key + fill + hemisférico, y NADA más. El intro no
 * tiene contraluz —su cámara no orbita, `IntroSceneLights.tsx` lo deja
 * anotado—, no tiene celosía y no tiene niebla.
 *
 * `shadeSurface` de `probe-escena/__tests__/shading.ts` sombrea **con el rig de
 * la escena**, que sí tiene las tres cosas. Reescribirlo acá sin el contraluz
 * —que es lo que `introRig.invariant.ts` hizo con su `introShade` privado—
 * sería una segunda implementación del mismo shader, y dos implementaciones que
 * hay que confiar en que coincidan es exactamente lo que este repo no hace.
 *
 * ── La salida: apagar el rim DESDE SUS PROPIOS PARÁMETROS ─────────────────
 *
 * En `shadeSurface`, `view.cameraAzimuthDeg` y `view.cameraHeight` **no entran
 * en ninguna otra cuenta**: sólo fijan la dirección del contraluz
 * (`RIM_AZIMUTH_OFFSET_DEG`, `RIM_HEIGHT_BASE`, `RIM_HEIGHT_TRACK`). Y el aporte
 * del contraluz pasa por un `Math.max(0, n · rim)`: en cuanto la dirección cae
 * del otro lado de la superficie, el término vale CERO exactamente.
 *
 * Entonces **el mínimo de `shadeSurface` sobre esos dos parámetros es el valor
 * sin contraluz**, calculado por la función de la escena y no por una copia. Y
 * que ese mínimo se alcance en una MESETA —muchas combinaciones dando el mismo
 * número al bit— es la prueba de que el clamp está activo y no de que se cayó
 * en un borde: si el rim todavía aportara algo, el mínimo sería un punto y no
 * una región.
 *
 * ⚠ **No sirve para cualquier normal.** Para `n = [0, 1, 0]` el aporte del rim
 * no depende del azimut, así que la meseta sólo aparece cuando la altura de
 * cámara baja lo suficiente para poner el contraluz por debajo del horizonte
 * (`RIM_HEIGHT_BASE + h × RIM_HEIGHT_TRACK ≤ 0`, o sea `h ≤ −1,647`). Por eso el
 * barrido es de DOS ejes y no de uno: con azimut solo, el canto superior daría
 * 1,79 en vez de 1,34 y la reproducción de §7.11 fallaría — que es exactamente
 * cómo se descubrió que hacía falta el segundo eje.
 *
 * La validación está en `s8-relevo.invariant.ts` §1: los tres números que
 * §7.11 publica sobre la tinta del intro (1,68 → 1,28 · 1,34 → 1,01 ·
 * 0,70 → 0,44) salen de acá, y el control positivo corre el MISMO barrido con
 * el rim puesto y tiene que fallar ahí.
 */

import { FOG_NEAR } from '@/app/v3/_lib/escena/probeAtmosphere'
import type { Vec3 } from '@/app/probe-escena/__tests__/harness'
import { shadeSurface } from '@/app/probe-escena/__tests__/shading'

/**
 * La profundidad a la que la niebla **todavía no aporta**: `smoothstep` arranca
 * en `FOG_NEAR`. No es un valor inventado — es la constante de
 * `probeAtmosphere.ts`, evaluada en su propio borde.
 */
export const SIN_NIEBLA = FOG_NEAR

/** Un punto del barrido: el valor y con qué par de parámetros salió. */
export interface Barrido {
  /** El mínimo sobre los dos ejes del contraluz: el valor SIN contraluz. */
  readonly valor: number
  /** Cuántas combinaciones dan ese mismo mínimo al bit. La meseta. */
  readonly meseta: number
  /** Cuántas combinaciones se probaron. */
  readonly muestras: number
}

/**
 * `shadeSurface` minimizado sobre los dos parámetros del contraluz.
 *
 * La grilla —120 azimuts × 49 alturas— no es una perilla de precisión: el
 * mínimo es un valor exacto de coma flotante y no una aproximación, porque se
 * alcanza donde el término del rim ya está clampeado a cero. La grilla sólo
 * tiene que CONTENER un punto de esa región, y la región cubre medio círculo.
 */
export function sinContraluz(
  hex: string,
  normal: Vec3,
  sky: number,
  gobo = 1,
  profundidad = SIN_NIEBLA,
): Barrido {
  const valores: number[] = []
  for (let azimut = 0; azimut < 360; azimut += 3) {
    for (let altura = -12; altura <= 12; altura += 0.5) {
      valores.push(
        shadeSurface(
          hex,
          normal,
          { progress: 0, cameraAzimuthDeg: azimut, cameraHeight: altura },
          profundidad,
          gobo,
          sky,
        ),
      )
    }
  }
  const valor = Math.min(...valores)
  return {
    valor,
    meseta: valores.filter((v) => v === valor).length,
    muestras: valores.length,
  }
}

/**
 * El MISMO barrido, con el contraluz puesto. Es el control positivo de
 * `sinContraluz`: tiene que dar otro número sobre el canto superior, que es la
 * cara donde el rim no se apaga solo con el azimut.
 */
export function conContraluz(
  hex: string,
  normal: Vec3,
  sky: number,
  vista: { readonly cameraAzimuthDeg: number; readonly cameraHeight: number },
  gobo = 1,
  profundidad = SIN_NIEBLA,
): number {
  return shadeSurface(hex, normal, { progress: 0, ...vista }, profundidad, gobo, sky)
}

/** Las cinco caras de la losa del logo, con el nombre con el que §7.11 las llama. */
export const CARAS_DEL_LOGO: readonly (readonly [string, Vec3])[] = [
  ['cara frontal', [0, 0, 1]],
  ['canto superior', [0, 1, 0]],
  ['canto inferior', [0, -1, 0]],
  ['canto derecho', [1, 0, 0]],
  ['canto izquierdo', [-1, 0, 0]],
]
