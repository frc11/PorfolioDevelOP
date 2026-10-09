import * as THREE from 'three'

import { PAPER_COLOR } from '../probeScene'
import { FINAL_EN_EL_PISO } from './enElPiso'

/**
 * [PULIDO 7] F1 · ADENTRO DEL LOGO, LISO («que dentro del logo esté liso nomás»): las contraformas (los bucles de la C y de la P,
 * con sus ranuras) son una superficie lisa del papel del piso, sin juntas, sin luz, sin descargas ni pistones. Es un plano en el
 * marco de la máscara del hueco que sólo se dibuja donde ella dice «contraforma» (su canal B: el logo lleno menos la forma,
 * `hueco.ts`), con el hueco abierto entero; el piso descarta ahí sus bloques en el mismo momento (`enElHueco`, `enElPiso.ts`). Va
 * en el grupo del pozo (en el plano del logo acostado, a la altura del piso calmo) y se oscurece con la sala, como el piso.
 */
export function crearLoLiso(marco: THREE.Vector4): THREE.Mesh {
  const geometria = new THREE.PlaneGeometry(marco.z, marco.w)
  geometria.translate(marco.x + marco.z / 2, marco.y + marco.w / 2, 0)
  const material = new THREE.MeshStandardMaterial({ color: PAPER_COLOR, roughness: 0.94, metalness: 0, dithering: true })
  const p = FINAL_EN_EL_PISO
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, { uHueco: p.uHueco, uMarcoDelHueco: p.uMarcoDelHueco, uApertura: p.uApertura, uOscuroDelBrillo: p.uOscuroDelBrillo })
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vEnElLogo;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n\tvEnElLogo = position.xy;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vEnElLogo;\nuniform sampler2D uHueco;\nuniform vec4 uMarcoDelHueco;\nuniform float uApertura;\nuniform float uOscuroDelBrillo;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n\tif ( uApertura < 1.0 || texture2D( uHueco, ( vEnElLogo - uMarcoDelHueco.xy ) / uMarcoDelHueco.zw ).b < 0.5 ) discard;')
      .replace('#include <fog_fragment>', 'gl_FragColor.rgb *= 1.0 - uOscuroDelBrillo;\n#include <fog_fragment>')
  }
  material.customProgramCacheKey = () => 'liso-del-final'
  const liso = new THREE.Mesh(geometria, material)
  liso.name = 'adentro del logo, liso'
  liso.frustumCulled = false
  return liso
}

/** Suelta lo liso (su geometría y su material). */
export function soltarLoLiso(liso: THREE.Mesh): void {
  liso.geometry.dispose()
  if (liso.material instanceof THREE.Material) liso.material.dispose()
}
