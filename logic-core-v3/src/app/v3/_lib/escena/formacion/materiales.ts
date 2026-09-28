import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { BARRIDO_DEL_DIA, DIA_DESDE_AFUERA_GLSL, OSCURECER_GLSL, hayDiaDesdeAfuera } from '../dia/desdeAfuera'
import { NIEBLA_DE_AFUERA, RASANTE, RASANTE_GLSL } from '../niebla/rasante'
import { EN_LA_REGION_GLSL, type Fronteras } from './regiones'

/**
 * [ESCENA 5] EL MATERIAL DE LA COPIA — se dibuja en la sala, opaco, detrás de la trama: la trama es
 * transparente y va después, así que queda por delante sola. No responde a las luces de la sala
 * (un gris con un sombreado fijo y de bajo contraste: cielo más una luz de arriba a la izquierda) y
 * no tiene luz propia de ningún tipo: de noche se apaga con todo.
 *
 * **Apenas visibles.** Lo hace la bruma: la de la sala (42 → 110) y, encima, una más cercana que sólo
 * llevan las copias (`NEBLINA`), que de noche se las come casi enteras. No hay desenfoque ni máscara
 * de texto: si el texto la necesitara, las copias se estarían viendo demasiado.
 */

/** La neblina de la formación: (desde, hasta, cuánto de día, cuánto de noche), sobre la profundidad. */
export const NEBLINA = { desde: 20, hasta: 90, dia: 0.93, noche: 0.93 } as const

const VERTEX_DE_LA_COPIA = /* glsl */ `
attribute vec4 aPieza;
varying vec3 vLocal;
varying vec4 vPieza;
varying vec3 vNormalMundo;
varying vec3 vMundo;
#include <common>
#include <fog_pars_vertex>
void main() {
	vLocal = position;
	vPieza = aPieza;
	vec4 mundo = modelMatrix * instanceMatrix * vec4( position, 1.0 );
	vMundo = mundo.xyz;
	vNormalMundo = normalize( mat3( modelMatrix ) * mat3( instanceMatrix ) * normal );
	vec4 mvPosition = viewMatrix * mundo;
	gl_Position = projectionMatrix * mvPosition;
	#include <fog_vertex>
}
`

const FRAGMENT_DE_LA_COPIA = /* glsl */ `
uniform float uNoche;
uniform float uVisible;
uniform vec4 uNeblina;
uniform vec3 uLuz;
uniform float uAbre;
varying vec3 vLocal;
varying vec4 vPieza;
varying vec3 vNormalMundo;
varying vec3 vMundo;
#include <common>
#include <fog_pars_fragment>
${EN_LA_REGION_GLSL}
#ifdef NIEBLA_RASANTE
	uniform float uTiempo;
	${RASANTE_GLSL}
#endif
#ifdef DIA_DESDE_AFUERA
	${DIA_DESDE_AFUERA_GLSL}
#endif
void main() {
	if ( ! enLaRegion( vLocal.xy, vPieza.x, vPieza.y ) ) discard;
	// La parte de otro tono: la región en la parte entera de w y su tono en la fraccionaria.
	float otra = floor( vPieza.w );
	float tono = otra > 0.5 && enLaRegion( vLocal.xy, otra, 0.0 ) ? fract( vPieza.w ) : vPieza.z;
	vec3 n = normalize( vNormalMundo ) * ( gl_FrontFacing ? 1.0 : - 1.0 );
	float luz = 0.45 + 0.25 * ( 0.5 + 0.5 * n.y ) + 0.4 * max( dot( n, uLuz ), 0.0 );
	gl_FragColor = vec4( vec3( tono ) * luz * mix( 1.0, 0.05, uNoche ), 1.0 );
	#include <colorspace_fragment>
	#include <fog_fragment>
	#ifdef USE_FOG
		// [ESCENA 6] 6d: con la velocidad del scroll la neblina se abre (uAbre es 0 sin la prueba).
		float neblina = smoothstep( uNeblina.x, uNeblina.y, vFogDepth ) * mix( uNeblina.z, uNeblina.w, uNoche ) * ( 1.0 - ${RASANTE.abre.neblina.toFixed(2)} * uAbre );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, max( neblina, 1.0 - uVisible ) );
		#ifdef NIEBLA_RASANTE
			// [ESCENA 6] 6c: los bancos que esta copia tiene delante.
			gl_FragColor.rgb = mix( fogColor, gl_FragColor.rgb, transmitanciaRasante( cameraPosition, vMundo, uAbre ) );
		#endif
	#endif
	#ifdef DIA_DESDE_AFUERA
		${OSCURECER_GLSL('vMundo')}
	#endif
}
`

export interface UniformsDeLaCopia {
  readonly uVisible: { value: number }
}

export function materialDeLaCopia(fronteras: Fronteras, uniforms: UniformsDeLaCopia, rasante: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    defines: { ...(rasante ? { NIEBLA_RASANTE: '' } : {}), ...(hayDiaDesdeAfuera() ? { DIA_DESDE_AFUERA: '' } : {}) },
    uniforms: {
      ...BARRIDO_DEL_DIA,
      uTiempo: VIVO.uTiempo,
      uAbre: NIEBLA_DE_AFUERA.uAbre,
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      ...uniforms,
      uNoche: VIVO.uNoche,
      uNeblina: { value: new THREE.Vector4(NEBLINA.desde, NEBLINA.hasta, NEBLINA.dia, NEBLINA.noche) },
      uLuz: { value: new THREE.Vector3(-0.45, 0.8, 0.4).normalize() },
      uFronteras: { value: new THREE.Vector4(fronteras.corteCP, fronteras.paloDesde, fronteras.paloHasta, fronteras.paloArriba) },
    },
    vertexShader: VERTEX_DE_LA_COPIA,
    fragmentShader: FRAGMENT_DE_LA_COPIA,
    fog: true,
    side: THREE.DoubleSide,
  })
}
