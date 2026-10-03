import * as THREE from 'three'

import { SATINADO } from '../estudio'
import { COSTADO_DE_DIA } from '../titulos3d/filo'

/**
 * [RETOQUE DEL PIE] P2 · EL MATERIAL DEL PIE — uno para todas las piezas: el satinado del logo y de los títulos (su
 * rugosidad y los reflejos del mismo estudio), con el color de cada vértice (el negro, el claro del relieve, el pozo) y
 * el filo b de los títulos (P1): lo que no es cara (los costados, el bisel, las paredes de los pozos) en el mismo gris.
 * El pie siempre es de día (lo prende la compuerta del final, después de Tu panel): sin el dibujo de noche.
 */
export function materialDelPie(): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  m.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vTapaDelPie;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\n\tvTapaDelPie = step( 0.999, abs( objectNormal.z ) );')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vTapaDelPie;')
      .replace('#include <color_fragment>', `#include <color_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, vTapaDelPie );`)
  }
  m.customProgramCacheKey = () => 'pie-de-volumen'
  return m
}
