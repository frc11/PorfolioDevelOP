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
 * · **No llevan color.** El parche mezcla la tinta de vértice hacia
 *   `vec3(BLANCO_DE_LA_NOCHE)` —los tres canales iguales— según un uniform que
 *   sigue al nivel del arco. `PointsMaterial` ya es emisivo (no recibe luz):
 *   brillar es dejar de restar. ⚠️ B12: el destino es **blanco puro**, ver la
 *   constante.
 * · **Todas al mismo blanco.** De día la perspectiva atmosférica lleva las
 *   lejanas hacia el PAPEL (`PARTICLE_FAR_COLOR`) y las cercanas hacia la tinta:
 *   dos poblaciones. En la noche el aire es oscuro y las dos convergen al mismo
 *   valor, así que son puntos luminosos PAREJOS y no manchas de dos brillos.
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
 * El BLANCO LINEAL al que van todas las motas en plena noche (1 es blanco puro).
 *
 * ══════════════════════════════════════════════════════════════════════════
 * ⚠️ B12 · SUBE DE 0,25 A 1: BLANCO PURO, Y ES LA MISMA MEDICIÓN AL REVÉS
 * ══════════════════════════════════════════════════════════════════════════
 *
 * B8 lo bajó a 0,25 con un número que era correcto **para su sala**: con 1,0 el
 * pico mediano de las motas daba **220 sobre un fondo de 41–51**, o sea manchas
 * claras sobre un gris. La referencia tiene puntos de **47 sobre negro (0,6)**:
 * lo que la hace legible no es que sus motas sean tenues, es que **su fondo es
 * negro de verdad**.
 *
 * B12 baja la noche de 0,08 a 0,04 (`lightArc.ts`), y con eso el fondo de la
 * captura cae de 41–51 a la banda oscura de la referencia. Sobre ese fondo,
 * 0,25 lineal (~137 sRGB) deja de ser «un punto claro» y pasa a ser lo que
 * había que evitar al revés: motas grises sobre negro. El pedido del humano es
 * textual —*«que las partículas tengan que verse: sobre negro, emisivas, en
 * blanco»*— y la pieza ya está preparada para darlo sin inventar nada:
 * `PointsMaterial` es emisivo (no recibe luz), así que **brillar es dejar de
 * restar**, y con 1 no se resta.
 *
 * **Cero color, y sigue siendo un solo escalar.** `vec3(1.0)` son los tres
 * canales iguales: blanco, no un blanco cálido ni un tinte. Lo que cambia es
 * cuánto, no de qué color.
 *
 * La cantidad, el tamaño y la atenuación **no se tocan**: son las del campo de
 * siempre (3000 + 90). El censo de la corrida lo publica al lado del de la
 * referencia (≈600 por pantalla, ⌀ 1,6 px, pico 47 sobre 0).
 *
 * ── ⚠️ LO QUE CUESTA, Y CÓMO SE REVOCA EN UNA LÍNEA ──────────────────────
 *
 * **Cuesta el contraste del nombre de los proyectos, y está medido: `D-B12.1`**
 * (`_lib/__tests__/deudas-b12.ts`). La tinta de la tarjeta es clara y el peor
 * píxel de cada glifo cae sobre una mota: con el pico en 217, «Lo que cambió»,
 * «El Garage» y «Banú» dan **1,27–1,42:1** contra los 3,62–4,75 que B11 había
 * dejado — entre 2 y 23 píxeles por bloque, el 1 % al 5 % del glifo.
 *
 * **Volver a 0,25 es cambiar el número de esta constante y nada más.** El pico
 * baja a 117, los nombres vuelven a 3,6–4,8:1 y las motas se leen a 5,6× el
 * fondo en vez de a 10×. El humano lo decidió con la cifra a la vista en la
 * PARADA 1 de B12 y lo juzga grabando: la decisión es suya y es revocable.
 */
export const BLANCO_DE_LA_NOCHE = 1

/** Uniform compartido por los dos campos de partículas. `OrbitRig` lo escribe en cada cuadro. */
export const BRILLO_DE_LA_NOCHE = { uNoche: { value: 0 } }

/**
 * Cuánto de la mezcla se aplica según el nivel del arco: 0 con luz
 * (nivel ≥ `RIM_NIGHT_LEVEL`), 1 en la noche (nivel ≤ `NIVEL_DE_LA_NOCHE`), y una
 * S suave entre medio para que el atardecer no las encienda de golpe.
 *
 * ⚠️ Las dos puntas son CONSTANTES IMPORTADAS y no literales, así que cuando B12
 * bajó la noche de 0,08 a 0,04 la rampa se estiró sola: el encendido ocupa ahora
 * el atardecer entero en vez de sus dos tercios finales, sin tocar esta función.
 */
export function brilloDeLaNocheEn(level: number): number {
  const t = (RIM_NIGHT_LEVEL - level) / (RIM_NIGHT_LEVEL - NIVEL_DE_LA_NOCHE)
  const u = Math.max(0, Math.min(1, t))
  return u * u * (3 - 2 * u)
}

/** El fragmento que se inyecta después del color de vértice: la mezcla hacia el blanco de la noche, tres canales iguales. */
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
