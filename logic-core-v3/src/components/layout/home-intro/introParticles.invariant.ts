import { PARTICLES_MAX, PARTICLE_SIZE } from '@/app/v3/_lib/escena/probeParticles'
import { PROBE_DEFAULTS } from '@/app/v3/_lib/escena/probeStore'

import { check, report, section } from './introChecks'
import {
  DUST_MATERIAL_ALPHA,
  DUST_RADIUS_BIAS,
  FLOOR_CLEARANCE,
  INTRO_DUST_SCALE,
  INTRO_DUST_SHARE,
  INTRO_DUST_SIZE,
} from './introParticles'
import { readSource } from './introParticleProbe'

/**
 * COMPROBACIÓN ESTÁTICA — que los números que `introParticles.ts` copia de
 * `DepthParticles.tsx`/`BokehParticles.tsx` sigan sincronizados con la fuente.
 * La comparación de densidad/tamaño/semilla/recorte del campo contra la
 * escena era composición y se desarmó (Modo pulido).
 */

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

report('introParticles')
