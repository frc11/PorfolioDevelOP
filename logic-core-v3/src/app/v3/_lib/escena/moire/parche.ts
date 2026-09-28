import * as THREE from 'three'

/**
 * [ESCENA 5] M4 SOBRE LA CAPA FINA — un parche sobre la lectura del alfa de su trama
 * (`MoireScreen.tsx`): en las transiciones entre tramos la trama se lee dos veces, con los dos
 * desajustes enteros que la rodean, y se mezcla. Con la mezcla en 0 la lectura es la de siempre.
 */

export const DESAJUSTE_VIVO = {
  uMezclaDelDesajuste: { value: 0 },
  uRepeticionB: { value: new THREE.Vector2(1, 1) },
  uCorrimientoB: { value: new THREE.Vector2() },
}

const PARS_VERTEX = /* glsl */ `
varying vec2 vUvCruda;
`

const PARS_FRAGMENT = /* glsl */ `
uniform float uMezclaDelDesajuste;
uniform vec2 uRepeticionB;
uniform vec2 uCorrimientoB;
varying vec2 vUvCruda;
`

const LECTURA_DEL_ALFA = /* glsl */ `
#ifdef USE_ALPHAMAP
	float alfaDeLaTrama = texture2D( alphaMap, vAlphaMapUv ).g;
	if ( uMezclaDelDesajuste > 0.0 ) {
		alfaDeLaTrama = mix( alfaDeLaTrama, texture2D( alphaMap, vUvCruda * uRepeticionB + uCorrimientoB ).g, uMezclaDelDesajuste );
	}
	diffuseColor.a *= alfaDeLaTrama;
#endif
`

/** Parchea el material de la capa fina. Se llama una vez, al armar la cúpula. */
export function conDesajusteVivo<T extends THREE.Material>(material: T): T {
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, DESAJUSTE_VIVO)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${PARS_VERTEX}`)
      .replace('#include <uv_vertex>', '#include <uv_vertex>\n\tvUvCruda = uv;')
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>\n${PARS_FRAGMENT}`)
      .replace('#include <alphamap_fragment>', LECTURA_DEL_ALFA)
  }
  material.customProgramCacheKey = () => 'moire-desajuste-vivo'
  material.needsUpdate = true
  return material
}
