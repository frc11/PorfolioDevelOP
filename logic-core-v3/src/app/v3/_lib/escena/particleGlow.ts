/**
 * B8 · EL BRILLO DE LAS PARTÍCULAS EN LA NOCHE.
 *
 * Sobre papel, las motas se leen por ser MÁS OSCURAS que el fondo: la
 * perspectiva atmosférica de `DepthParticles` las tiñe entre `PARTICLE_NEAR_COLOR`
 * y `PARTICLE_FAR_COLOR`, y el bokeh va en `BOKEH_COLOR`. Con la sala a oscuras
 * (`lightArc.ts`, la noche de Trabajos) lo oscuro desaparece: una mota gris
 * sobre una sala de 30 sobre 255 es nada. La referencia las tiene CLARAS sobre
 * negro, ~600 por pantalla (PARADA 1 de B8, medidas).
 *
 * ── Qué hace, y qué NO ────────────────────────────────────────────────────
 *
 * · **No llevan color.** El parche mezcla la tinta de vértice hacia un GRIS
 *   —`vec3(BLANCO_DE_LA_NOCHE)`, los tres canales iguales: blanco a menos
 *   intensidad— según un uniform que sigue al nivel del arco. `PointsMaterial`
 *   ya es emisivo (no recibe luz): brillar es dejar de restar.
 * · **Todas al mismo gris.** De día la perspectiva atmosférica lleva las lejanas
 *   hacia el PAPEL (`PARTICLE_FAR_COLOR`): de noche eso las dejaba como manchas de 220
 *   sobre una sala de 45 (medido: pico mediano 220, ⌀ 3,4 px; la referencia
 *   tiene puntos de 47 sobre negro). En la noche el aire es oscuro, así que las
 *   lejanas BAJAN al mismo gris al que las cercanas SUBEN: puntos luminosos
 *   parejos, no manchas. El gris se calibró midiendo la captura de la noche.
 * · **Cero por encima de la frontera de la noche** (`RIM_NIGHT_LEVEL`, 0,34): la
 *   mezcla es exactamente 0 con luz, así que nada de lo que S6–S12 y B4–B7
 *   midieron con luz se mueve. Es la misma frontera que usa el contraluz.
 * · **La cantidad no cambia.** Sale del campo que ya existe; ni una mota nueva.
 * · Un solo uniform, compartido por los dos campos y escrito por `OrbitRig`
 *   en el mismo `useFrame` que alimenta a `applyLightRig`, así que el brillo y
 *   la luz están siempre en el mismo cuadro.
 *
 * `s20-brillo.invariant.ts` afirma la curva, la frontera y el cableado.
 */

import type * as THREE from 'three'

import { NIVEL_DE_LA_NOCHE } from './lightArc'
import { RIM_NIGHT_LEVEL } from './probeLighting'

/**
 * El gris LINEAL al que van todas las motas en plena noche (1 sería blanco
 * puro). 0,25 lineal es ~137 en sRGB: sobre una sala de 40–50, un punto claro
 * que se lee como luz y no como mancha. Calibrado con `scripts-b8/c-las-ocho.ts`
 * (censo de partículas de la noche de Trabajos): con 1,0 el pico mediano daba 220.
 */
export const BLANCO_DE_LA_NOCHE = 0.25

/** Uniform compartido por los dos campos de partículas. `OrbitRig` lo escribe en cada cuadro. */
export const BRILLO_DE_LA_NOCHE = { uNoche: { value: 0 } }

/**
 * Cuánto de la mezcla se aplica según el nivel del arco: 0 con luz (nivel ≥ 0,34),
 * 1 en la noche (nivel ≤ 0,08), y una S suave entre medio para que el atardecer
 * no las encienda de golpe.
 */
export function brilloDeLaNocheEn(level: number): number {
  const t = (RIM_NIGHT_LEVEL - level) / (RIM_NIGHT_LEVEL - NIVEL_DE_LA_NOCHE)
  const u = Math.max(0, Math.min(1, t))
  return u * u * (3 - 2 * u)
}

/** El fragmento que se inyecta después del color de vértice: la mezcla hacia el gris de la noche, tres canales iguales. */
export const MEZCLA_HACIA_EL_BLANCO = `diffuseColor.rgb = mix( diffuseColor.rgb, vec3( ${BLANCO_DE_LA_NOCHE.toFixed(4)} ), uNoche );`

/**
 * Parchea un material de puntos para que brille en la noche. Se llama una vez
 * por material, antes del primer cuadro; el uniform es el compartido.
 */
export function conBrilloDeNoche<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uNoche = BRILLO_DE_LA_NOCHE.uNoche
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uNoche;')
      .replace('#include <color_fragment>', `#include <color_fragment>\n\t${MEZCLA_HACIA_EL_BLANCO}`)
  }
  material.customProgramCacheKey = () => 'b8-brillo-de-noche'
  material.needsUpdate = true
  return material
}
