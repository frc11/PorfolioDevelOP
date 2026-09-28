import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { ALTO_DEL_PISO_GLSL, RUIDO_GLSL, TIEMPO_DEL_PISO } from '../relieve/ruido'
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
attribute vec4 aAncla;
uniform float uMirada;
varying vec3 vLocal;
varying vec4 vPieza;
varying vec3 vNormalMundo;
#include <common>
#include <fog_pars_vertex>
#ifdef SOBRE_EL_PISO_DE_BLOQUES
	uniform float uTiempoDelRuido;
	${RUIDO_GLSL}
	${ALTO_DEL_PISO_GLSL}
#endif
vec2 girar2( vec2 p, float a ) { float c = cos( a ); float s = sin( a ); return vec2( c * p.x - s * p.y, s * p.x + c * p.y ); }
void main() {
	vLocal = position;
	vPieza = aPieza;
	vec4 mundo = modelMatrix * instanceMatrix * vec4( position, 1.0 );
	vec3 n = normalize( mat3( modelMatrix ) * mat3( instanceMatrix ) * normal );
	// F-mirada: cada copia gira alrededor de su lugar hacia el logo, de adelante para atrás.
	float t = smoothstep( 0.0, 1.0, clamp( uMirada * 1.6 - aAncla.w, 0.0, 1.0 ) );
	float a = aAncla.z * t;
	mundo.xz = aAncla.xy + girar2( mundo.xz - aAncla.xy, - a );
	n.xz = girar2( n.xz, - a );
	#ifdef SOBRE_EL_PISO_DE_BLOQUES
		// R2: parada sobre el bloque que tiene debajo.
		mundo.y += altoDelPiso( aAncla.xy, uTiempoDelRuido );
	#endif
	vNormalMundo = n;
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
varying vec3 vLocal;
varying vec4 vPieza;
varying vec3 vNormalMundo;
#include <common>
#include <fog_pars_fragment>
${EN_LA_REGION_GLSL}
void main() {
	if ( ! enLaRegion( vLocal.xy, vPieza.x, vPieza.y ) ) discard;
	// Las espejadas dan vuelta el sentido de las caras: el signo viene en la pieza.
	bool frente = gl_FrontFacing == ( vPieza.w > 0.0 );
	vec3 n = normalize( vNormalMundo ) * ( frente ? 1.0 : - 1.0 );
	float luz = 0.45 + 0.25 * ( 0.5 + 0.5 * n.y ) + 0.4 * max( dot( n, uLuz ), 0.0 );
	gl_FragColor = vec4( vec3( vPieza.z ) * luz * mix( 1.0, 0.05, uNoche ), 1.0 );
	#include <colorspace_fragment>
	#include <fog_fragment>
	#ifdef USE_FOG
		float neblina = smoothstep( uNeblina.x, uNeblina.y, vFogDepth ) * mix( uNeblina.z, uNeblina.w, uNoche );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, max( neblina, 1.0 - uVisible ) );
	#endif
}
`

export interface UniformsDeLaCopia {
  readonly uMirada: { value: number }
  readonly uVisible: { value: number }
}

export function materialDeLaCopia(fronteras: Fronteras, uniforms: UniformsDeLaCopia, sobreBloques: boolean): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    defines: sobreBloques ? { SOBRE_EL_PISO_DE_BLOQUES: '' } : {},
    uniforms: {
      ...TIEMPO_DEL_PISO,
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
