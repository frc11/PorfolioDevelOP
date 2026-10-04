import * as THREE from 'three'

import { SATINADO } from '../estudio'
import { COSTADO_DE_DIA } from '../titulos3d/filo'
import { DISOLVER_DEL_PIE_GLSL, DISOLVER_DEL_PIE_PARS_GLSL, LETRAS_DEL_PIE_NORMAL_GLSL, LETRAS_DEL_PIE_PARS_GLSL, LETRAS_DEL_PIE_POSICION_GLSL, uniformesDelPie, type UniformesDelPie } from './coreografia'

/**
 * [RETOQUE DEL PIE] P2 · EL MATERIAL DEL PIE — el satinado del logo y de los títulos (su rugosidad y los reflejos del mismo
 * estudio), con el color de cada vértice (el negro, el claro del relieve, el pozo) y el filo b de los títulos (P1): lo que
 * no es cara (los costados, el bisel, las paredes de los pozos) en el mismo gris. El pie siempre es de día (lo prende la
 * compuerta del final, después de Tu panel): sin el dibujo de noche.
 *
 * [PASADA FINAL] C2 · uno por pieza (sus uniformes son los de su llegada: `coreografia.ts`), con un solo programa: las
 * letras del titular llegan en el sombreador y todas se disuelven con el tramado de los títulos. La cara se lee de la
 * normal quieta (antes del giro de la letra): en camino, la cara sigue negra y los costados grises.
 */
export function materialDelPie(uniformes: UniformesDelPie = uniformesDelPie()): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniformes)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying float vTapaDelPie;\n${LETRAS_DEL_PIE_PARS_GLSL}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n\tvTapaDelPie = step( 0.999, abs( objectNormal.z ) );\n${LETRAS_DEL_PIE_NORMAL_GLSL}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${LETRAS_DEL_PIE_POSICION_GLSL}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying float vTapaDelPie;\n${DISOLVER_DEL_PIE_PARS_GLSL}`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${DISOLVER_DEL_PIE_GLSL}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, vTapaDelPie );`)
  }
  m.customProgramCacheKey = () => 'pie-de-volumen'
  return m
}
