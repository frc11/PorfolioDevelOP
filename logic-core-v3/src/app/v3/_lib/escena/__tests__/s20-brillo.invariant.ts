/**
 * INVARIANTE — B8 · EL BRILLO DE LAS PARTÍCULAS EN LA NOCHE.
 *
 *     npm run test:s20-brillo
 *
 * Lo que afirma, y por qué:
 *
 *   1. LA CURVA: cero con luz (nivel ≥ 0,34, la misma frontera que el contraluz),
 *      el tope en la noche (nivel ≤ 0,08), monótona y suave entre medio. Que sea
 *      EXACTAMENTE cero con luz es lo que deja intacto todo lo que S6–S12 y
 *      B4–B7 midieron con la sala iluminada.
 *   2. SIN COLOR: el parche mezcla hacia `vec3( 1.0 )` —los tres canales
 *      iguales— y se inyecta después del color de vértice, no en su lugar.
 *   3. EL CABLEADO: los dos campos de partículas se parchean, `OrbitRig` escribe
 *      el uniform en su `useFrame`, y no hay ninguna partícula nueva: la
 *      cantidad sigue saliendo de `probeParticles.ts`.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { afirmar, afirmarIgual, cerrar, controlPositivo, titulo } from '../../__tests__/afirmar'
import { NIVEL_DE_LA_NOCHE } from '../lightArc'
import { BLANCO_DE_LA_NOCHE, BRILLO_DE_LA_NOCHE, MEZCLA_HACIA_EL_BLANCO, brilloDeLaNocheEn } from '../particleGlow'
import { RIM_NIGHT_LEVEL } from '../probeLighting'

const RAIZ = process.cwd()
const leer = (rel: string): string => readFileSync(path.join(RAIZ, rel), 'utf8')

// ═══════════════════════════════════════════════════════════════════════════
titulo('1 · LA CURVA — cero con luz, el tope en la noche, suave entre medio')

afirmarIgual(brilloDeLaNocheEn(1), 0, 'a mediodía no brillan: cero exacto, no un casi cero')
afirmarIgual(brilloDeLaNocheEn(RIM_NIGHT_LEVEL), 0, `  y en la frontera de la noche (${RIM_NIGHT_LEVEL}) tampoco: la misma frontera que el contraluz`)
afirmarIgual(brilloDeLaNocheEn(0.643), 0, '  ni en la mañana del Cierre (0,643): lo que se midió con luz no se mueve')
afirmarIgual(brilloDeLaNocheEn(NIVEL_DE_LA_NOCHE), 1, `en la noche (${NIVEL_DE_LA_NOCHE}) la mezcla es completa: todas las motas al gris de la noche`)
afirmarIgual(brilloDeLaNocheEn(0), 1, '  y por debajo de la noche no pasa de completa')
const muestras = Array.from({ length: 201 }, (_, i) => 1 - i / 200)
const curva = muestras.map(brilloDeLaNocheEn)
afirmar(curva.every((v, i) => i === 0 || v >= curva[i - 1]), 'la curva sube monótona a medida que la luz baja: nunca parpadea')
afirmar(
  curva.every((v) => v >= 0 && v <= 1) && BLANCO_DE_LA_NOCHE > 0 && BLANCO_DE_LA_NOCHE <= 1,
  `  y se queda entre 0 y 1; el gris de la noche es a lo sumo blanco puro (1): ${BLANCO_DE_LA_NOCHE} lineal`,
)
const medio = (RIM_NIGHT_LEVEL + NIVEL_DE_LA_NOCHE) / 2
afirmar(
  Math.abs(brilloDeLaNocheEn(medio) - 0.5) < 1e-9,
  'a mitad de camino entre la frontera y la noche la mezcla es la mitad: la S es simétrica',
  `nivel ${medio.toFixed(3)} → ${brilloDeLaNocheEn(medio).toFixed(4)}`,
)
controlPositivo('la curva no es un cero constante: en la noche se mueve', NIVEL_DE_LA_NOCHE, (n: number) => brilloDeLaNocheEn(n) === 0)

// ═══════════════════════════════════════════════════════════════════════════
titulo('2 · SIN COLOR — la mezcla va hacia el blanco, después del color de vértice')

const objetivo = /vec3\(\s*([\d.]+)\s*\)/.exec(MEZCLA_HACIA_EL_BLANCO)
afirmar(
  objetivo !== null && Math.abs(Number(objetivo[1]) - BLANCO_DE_LA_NOCHE) < 1e-6 && /mix\(/.test(MEZCLA_HACIA_EL_BLANCO) && /uNoche/.test(MEZCLA_HACIA_EL_BLANCO),
  `el fragmento mezcla \`diffuseColor\` hacia \`vec3( ${BLANCO_DE_LA_NOCHE} )\` según \`uNoche\`: UN escalar, tres canales iguales, cero color`,
  MEZCLA_HACIA_EL_BLANCO,
)
afirmar(
  !/vec3\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*\)/.test(MEZCLA_HACIA_EL_BLANCO) && !/#[0-9a-fA-F]{3,8}/.test(leer('src/app/v3/_lib/escena/particleGlow.ts')),
  '  y ni el fragmento ni el módulo escriben un color: ningún vec3 de tres valores, ningún hex',
)
const modulo = leer('src/app/v3/_lib/escena/particleGlow.ts')
afirmar(
  modulo.includes("'#include <color_fragment>'") && modulo.includes('#include <color_fragment>\\n'),
  'el parche se inyecta DESPUÉS de `<color_fragment>`: la tinta de vértice se aplica primero y recién ahí se mezcla',
)
afirmarIgual(BRILLO_DE_LA_NOCHE.uNoche.value, 0, 'el uniform arranca en cero: hasta que el arco diga otra cosa, las motas son las de siempre')

// ═══════════════════════════════════════════════════════════════════════════
titulo('3 · EL CABLEADO — los dos campos, el cuadro de la luz, y ninguna partícula nueva')

const polvo = leer('src/app/v3/_lib/escena/DepthParticles.tsx')
const bokeh = leer('src/app/v3/_lib/escena/BokehParticles.tsx')
const rig = leer('src/app/v3/_lib/escena/OrbitRig.tsx')
afirmar(/conBrilloDeNoche\(material\)/.test(polvo) && /conBrilloDeNoche\(material\)/.test(bokeh), 'los dos campos de partículas parchean su material con `conBrilloDeNoche`')
afirmar(
  /BRILLO_DE_LA_NOCHE\.uNoche\.value = brilloDeLaNocheEn\(arc\.level\)/.test(rig),
  '`OrbitRig` escribe el uniform desde el nivel del arco, en el mismo `useFrame` que alimenta a `applyLightRig`',
)
afirmar(
  rig.indexOf('applyLightRig(targets, lightInput, scratch.lightCache)') < rig.indexOf('BRILLO_DE_LA_NOCHE.uNoche.value'),
  '  y lo escribe DESPUÉS de aplicar la luz: brillo y luz salen del mismo `arc.level` en el mismo cuadro',
)
const constantes = leer('src/app/v3/_lib/escena/probeParticles.ts')
afirmar(
  /export const PARTICLES_MAX = 3000/.test(constantes) && /export const BOKEH_COUNT = 90/.test(constantes),
  'la cantidad no cambió: 3000 motas y 90 de bokeh, las de siempre — brillar no es agregar',
)
afirmar(!/new THREE\.Points|<points/.test(modulo), '  y `particleGlow.ts` no crea ni una partícula: parchea materiales y nada más')
controlPositivo('el detector de cableado no está ciego: NO encuentra el parche en un archivo que no lo tiene', constantes, (fuente: string) => /conBrilloDeNoche\(material\)/.test(fuente))

cerrar('s20-brillo.invariant')
