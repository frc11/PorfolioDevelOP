import * as THREE from 'three'

import { SATINADO } from '../estudio'
import { COSTADO_DE_DIA } from '../titulos3d/filo'
import { DISOLVER_DEL_PIE_GLSL, DISOLVER_DEL_PIE_PARS_GLSL, LETRAS_DEL_PIE_NORMAL_GLSL, LETRAS_DEL_PIE_PARS_GLSL, LETRAS_DEL_PIE_POSICION_GLSL, uniformesDelPie, type UniformesDelPie } from './coreografia'

/** [RETOQUE DEL ENCASTRE] 1G · el giro de la luz del pie (uno para todas las piezas: lo escribe `armadas.ts` en cada cuadro). */
export const LUZ_DEL_PIE = { uGiroDeLaLuz: { value: new THREE.Matrix3() } }

const MUNDO = new THREE.Quaternion()
const GIRO = new THREE.Matrix4()

/**
 * El giro de la luz del pie en el espacio de la cámara viva (`viva`: su orientación en el mundo; `giro`: el del final, de
 * la orientación de ahora a la de antes, en el mundo): viva⁻¹ · giro · viva. Escribe en `destino`. Puro.
 */
export function giroDeLaLuzDelPie(viva: THREE.Quaternion, giro: THREE.Quaternion, destino: THREE.Matrix3): THREE.Matrix3 {
  MUNDO.copy(viva).invert().multiply(giro).multiply(viva)
  return destino.setFromMatrix4(GIRO.makeRotationFromQuaternion(MUNDO))
}

const VISTA = 'vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );'
/** Las luces del pie: las de three, con la dirección de vista girada como la normal (s51 1G lo afirma sobre el sombreador de three). */
export const LUCES_DEL_PIE_GLSL = THREE.ShaderChunk.lights_fragment_begin.replace(VISTA, `${VISTA}\n\tgeometryViewDir = normalize( uGiroDeLaLuz * geometryViewDir );`)

/**
 * [RETOQUE DEL PIE] P2 · EL MATERIAL DEL PIE — el satinado del logo y de los títulos (su rugosidad y los reflejos del mismo
 * estudio), con el color de cada vértice (el negro, el claro del relieve, el pozo) y el filo b de los títulos (P1): lo que
 * no es cara (los costados, el bisel, las paredes de los pozos) en el mismo gris. El pie siempre es de día (lo prende la
 * compuerta del final, después de Tu panel): sin el dibujo de noche.
 *
 * [PASADA FINAL] C2 · uno por pieza (sus uniformes son los de su llegada: `coreografia.ts`), con un solo programa: las
 * letras del titular llegan en el sombreador y todas se disuelven con el tramado de los títulos. La cara se lee de la
 * normal quieta (antes del giro de la letra): en camino, la cara sigue negra y los costados grises.
 *
 * [RETOQUE DEL ENCASTRE] 1G · EL PIE NO RECIBE LA LUZ DE LA CINEMÁTICA: en el final la cámara sube a mirar el logo desde
 * arriba y las piezas van con ella (de frente): las luces de la sala y los reflejos del estudio, quietos en el mundo, les
 * pegaban de otro lado (el titular lavado, en un ángulo raro). Las luces son direccionales y la hemisférica: girar la
 * normal y la dirección de vista con el giro que el final le dio a la cámara (`uGiroDeLaLuz`, en el espacio de la cámara
 * viva: `giroDeLaLuzDelPie`) es girar la luz y el estudio con la pieza. Se ven como antes de la cinemática, en cualquier
 * pose de la cámara. Sin final, la identidad.
 */
export function materialDelPie(uniformes: UniformesDelPie = uniformesDelPie()): THREE.MeshStandardMaterial {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: SATINADO.roughness, metalness: 0, dithering: true })
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniformes, LUZ_DEL_PIE)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\nvarying float vTapaDelPie;\n${LETRAS_DEL_PIE_PARS_GLSL}`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>\n\tvTapaDelPie = step( 0.999, abs( objectNormal.z ) );\n${LETRAS_DEL_PIE_NORMAL_GLSL}`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>\n${LETRAS_DEL_PIE_POSICION_GLSL}`)
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying float vTapaDelPie;\nuniform mat3 uGiroDeLaLuz;\n${DISOLVER_DEL_PIE_PARS_GLSL}`)
      .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n\tnormal = normalize( uGiroDeLaLuz * normal );')
      .replace('#include <lights_fragment_begin>', LUCES_DEL_PIE_GLSL)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>\n${DISOLVER_DEL_PIE_GLSL}`)
      .replace('#include <color_fragment>', `#include <color_fragment>\n\tdiffuseColor.rgb = mix( vec3( ${COSTADO_DE_DIA.toFixed(3)} ), diffuseColor.rgb, vTapaDelPie );`)
  }
  m.customProgramCacheKey = () => 'pie-de-volumen'
  return m
}
