import {
  PARTICLE_FAR_COLOR,
  PARTICLE_NEAR_COLOR,
} from '@/app/v3/_lib/escena/probeParticles'
import { BOKEH_COLOR } from '@/app/v3/_lib/escena/probeScene'

import {
  hexToSrgb,
  linearToSrgb,
  neutralToneMapGray,
  srgbToHex,
  srgbToLinear,
  type Srgb,
} from './introShading'

/**
 * EL COLOR DE UNA MOTA DEL INTRO — la rampa y su cuantización para el teñido.
 *
 * Salió de `introParticles.ts` en S14, por el límite de 300 líneas del repo y
 * con la costura donde corresponde: **allá el TAMAÑO** —la escala del campo, el
 * borde entre las dos escalas, la caída—, **acá el COLOR**. Es la misma costura
 * que separa `probeParticles.ts` de `particleTextures.ts` en la escena.
 *
 * 🔴 **Y es la mitad de la especie que S14 NO toca.** El sprint corre el reparto
 * de tamaños hacia la escala grande, pero el color, el material y la forma se
 * conservan: las motas del intro tienen que ser reconociblemente los mismos
 * objetos que después flotan en la escena. **Ni un byte de este módulo cambió**,
 * y la comprobación lo exige contra `shadeUnlit` —el instrumento con el que la
 * escena mide el valor de una mota— en 201 puntos de la rampa.
 *
 * Módulo puro: sin React, sin `motion`, sin DOM. Corre en node.
 */

/**
 * El color con el que la escena RENDERIZA una mota.
 *
 * `PointsMaterial` no recibe luz, así que el color del vértice pasa directo al
 * tone mapping. El degradé cerca→lejos se interpola en **luz lineal**, que es
 * donde `THREE.Color.lerp` trabaja con el manejo de color prendido — no en sRGB.
 */
export function moteRampColor(near: Srgb, far: Srgb, t: number): string {
  const mixed: Srgb = [0, 1, 2].map((i) =>
    linearToSrgb(
      neutralToneMapGray(srgbToLinear(near[i]) * (1 - t) + srgbToLinear(far[i]) * t)
    )
  ) as unknown as Srgb
  return srgbToHex(mixed)
}

/**
 * EL COLOR DEL BOKEH EN PANTALLA. Un solo valor: las noventa escriben el mismo.
 */
export const INTRO_BOKEH_COLOR = moteRampColor(
  hexToSrgb(BOKEH_COLOR),
  hexToSrgb(BOKEH_COLOR),
  0
)

/**
 * ESCALONES DE LA RAMPA DEL POLVO, para el teñido de los sprites.
 *
 * `drawImage` no tiñe, así que el rasterizado necesita un sprite por color y la
 * rampa continua hay que cuantizarla. **El dato de cada mota conserva su color
 * exacto** —es lo que la comprobación compara contra la escena— y lo que se
 * cuantiza es solo el dibujo.
 *
 * ⚠ **Los escalones NO están repartidos parejo en la rampa: están repartidos
 * parejo en el VALOR QUE SALE.** La mezcla va en luz lineal, así que del lado
 * oscuro la rampa avanza más del doble por unidad de `t`: con escalones parejos
 * en `t`, el peor error se iba a **7,0 de 255** —concentrado justo en las motas
 * cercanas, que son las que más se ven— y con escalones parejos en valor queda
 * acotado por la mitad del paso, **3,2**. Cuesta una búsqueda binaria por
 * escalón, una sola vez al cargar el módulo.
 *
 * 24 escalones sobre un recorrido de 144 bytes: cada canvas de 64 × 64 cuesta
 * 16 KiB, así que subirlos no es gratis.
 */
export const INTRO_TINT_STEPS = 24

/** El byte que la escena renderiza para una posición de la rampa. */
function rampValue(t: number): number {
  return parseInt(
    moteRampColor(hexToSrgb(PARTICLE_NEAR_COLOR), hexToSrgb(PARTICLE_FAR_COLOR), t).slice(3, 5),
    16
  )
}

const RAMP_FROM = rampValue(0)
const RAMP_TO = rampValue(1)

/** Las posiciones de la rampa que reparten el VALOR de salida en partes iguales. */
const TINT_POSITIONS: readonly number[] = Array.from({ length: INTRO_TINT_STEPS }, (_, step) => {
  const target = RAMP_FROM + ((RAMP_TO - RAMP_FROM) * step) / (INTRO_TINT_STEPS - 1)
  let low = 0
  let high = 1
  for (let i = 0; i < 40; i += 1) {
    const mid = (low + high) / 2
    if (rampValue(mid) < target) low = mid
    else high = mid
  }
  return (low + high) / 2
})

/** A qué escalón cae una posición de la rampa. Por valor, no por `t`. */
export function introTintStep(t: number): number {
  const value = rampValue(Math.min(1, Math.max(0, t)))
  const step = Math.round(
    ((value - RAMP_FROM) / (RAMP_TO - RAMP_FROM)) * (INTRO_TINT_STEPS - 1)
  )
  return Math.min(INTRO_TINT_STEPS - 1, Math.max(0, step))
}

/** El color exacto de un escalón. Lo comparten el atlas y la comprobación. */
export function introTintColor(step: number): string {
  const clamped = Math.min(INTRO_TINT_STEPS - 1, Math.max(0, step))
  return moteRampColor(
    hexToSrgb(PARTICLE_NEAR_COLOR),
    hexToSrgb(PARTICLE_FAR_COLOR),
    TINT_POSITIONS[clamped]
  )
}
