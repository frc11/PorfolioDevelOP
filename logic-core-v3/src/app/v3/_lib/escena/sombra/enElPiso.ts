import * as THREE from 'three'

import { CONTACT_COLOR, CONTACT_CORE, CONTACT_DEPTH, CONTACT_FALLOFF, CONTACT_OPACITY, CONTACT_WIDTH } from '../probeAtmosphere'
import { SOMBRA_DEL_HAZ } from './sombraDelHaz'

/**
 * [ESCENA 6] LA MANCHA DE CONTACTO, PARA UN PISO QUE SE MUEVE — la misma cuenta que dibujan los dos
 * planos de `ContactOcclusion` (la mancha blanda y la dura de 5c), escrita para que la pinte el
 * propio piso cuando el piso tiene relieve (el piso vivo, `piso/`). Un plano apoyado quedaría tapado
 * por los bloques que suben; así la mancha sigue sobre ellos.
 *
 * `ContactOcclusion` escribe acá, cuadro a cuadro, la escala y la opacidad que ya calcula (con la
 * altura del logo, el pulso y el haz): no hay una segunda lógica de la sombra.
 */
export const MANCHA_EN_EL_PISO = {
  /** (escala blanda, alfa blanda, escala dura, alfa dura). */
  uMancha: { value: new THREE.Vector4(1, CONTACT_OPACITY, 1, 0) },
}

/** El color de la mancha tal como queda en el búfer (codificado): la mezcla se hace ahí, como la del plano. */
const srgb = new THREE.Color(CONTACT_COLOR).convertLinearToSRGB()

/**
 * `manchaDelContacto( xz )` devuelve (alfa blanda, alfa dura) en ese punto del piso. Es la forma del
 * sprite (`createContactSpriteData`): núcleo lleno y caída con exponente, sobre el plano de
 * `CONTACT_WIDTH` × `CONTACT_DEPTH` acostado (su y es −z del mundo).
 */
export const MANCHA_GLSL = /* glsl */ `
uniform vec4 uMancha;
const vec3 COLOR_DEL_CONTACTO = vec3( ${srgb.r.toFixed(4)}, ${srgb.g.toFixed(4)}, ${srgb.b.toFixed(4)} );
float spriteDelContacto( vec2 xz, float escala, float nucleo, float caida ) {
	vec2 q = vec2( xz.x / ( ${(CONTACT_WIDTH / 2).toFixed(3)} * escala ), - xz.y / ( ${(CONTACT_DEPTH / 2).toFixed(3)} * escala ) );
	float d = length( q );
	return d <= nucleo ? 1.0 : pow( clamp( ( 1.0 - d ) / max( 1e-6, 1.0 - nucleo ), 0.0, 1.0 ), caida );
}
vec2 manchaDelContacto( vec2 xz ) {
	float blanda = spriteDelContacto( xz, uMancha.x, ${CONTACT_CORE.toFixed(3)}, ${CONTACT_FALLOFF.toFixed(3)} ) * uMancha.y;
	float dura = spriteDelContacto( xz, uMancha.z, ${SOMBRA_DEL_HAZ.sprite.nucleo.toFixed(3)}, ${SOMBRA_DEL_HAZ.sprite.caida.toFixed(3)} ) * uMancha.w;
	return vec2( blanda, min( 1.0, dura ) );
}
`
