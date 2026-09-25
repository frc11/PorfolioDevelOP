import * as THREE from 'three'

import { VIVO } from '../entorno/vivo'
import { EN_LA_REGION_GLSL, type Fronteras } from './regiones'

/**
 * [ESCENA 4] LOS MATERIALES DE LA FORMACIÓN.
 *
 * - **La copia** no responde a las luces de la sala: se dibuja en una escena aparte (para
 *   desenfocarla) donde no hay luces. Lleva un sombreado propio, fijo y de bajo contraste —cielo más
 *   una luz de arriba a la izquierda—, que de noche se apaga casi entero: queda la silueta oscura, y
 *   su borde toma la bruma del horizonte (contraluz). Sin luz propia de ningún tipo.
 * - **El tapón** escribe profundidad y nada de color: el logo y nuestro piso tapan a las copias en la
 *   escena aparte igual que en la sala.
 * - **La composición** vuelve a poner las copias en el cuadro, desenfocadas.
 */

/**
 * LA NEBLINA DE LA FORMACIÓN — encima de la bruma de la sala (42→110), una más cercana que sólo
 * llevan las copias: (desde, hasta, cuánto de día, cuánto de noche). A 40–55 de la cámara la bruma
 * sola casi no las toca; de día tienen que quedar bajas de contraste y de noche, siluetas.
 */
export const NEBLINA = { desde: 10, hasta: 80, dia: 0.8, noche: 0.25 } as const

/** Cuánto toma el borde de la silueta de la bruma, de noche: el contraluz. */
export const CONTRALUZ = 0.5

/** El desenfoque: a qué fracción de la resolución se dibujan las copias, y el radio del filtro en téxeles de ese búfer. */
export const DESENFOQUE = { resolucion: 0.5, radio: 0.9 } as const

/**
 * Detrás del texto la formación queda en esta fracción: el texto no pierde contraste. Las cajas se
 * leen con la misma cuenta que usa el pulso de E4 (`cajasDeTexto.ts`), pero la formación lleva las
 * suyas y más: el pie y Por qué develOP tienen veinte bloques de texto, y las seis más grandes no alcanzan.
 */
export const DETRAS_DEL_TEXTO = 0
export const CAJAS_DE_LA_FORMACION = 32
/** La pluma alrededor de cada caja, en píxeles CSS, y cada cuánto se releen (quieto / con scroll). */
export const TEXTO = { plumaCss: 20, cadaMs: 200, cadaMsConScroll: 60 } as const

const VERTEX_DE_LA_COPIA = /* glsl */ `
attribute vec4 aPieza;
attribute vec4 aAncla;
uniform float uMirada;
varying vec3 vLocal;
varying vec4 vPieza;
varying vec3 vNormalMundo;
varying vec3 vHaciaLaCamara;
#include <common>
#include <fog_pars_vertex>
vec2 girar2( vec2 p, float a ) { float c = cos( a ); float s = sin( a ); return vec2( c * p.x - s * p.y, s * p.x + c * p.y ); }
void main() {
	vLocal = position;
	vPieza = aPieza;
	vec4 mundo = modelMatrix * instanceMatrix * vec4( position, 1.0 );
	vec3 n = normalize( mat3( modelMatrix ) * mat3( instanceMatrix ) * normal );
	// F-mirada: cada copia gira alrededor de su lugar hacia el logo, de adentro para afuera.
	float t = smoothstep( 0.0, 1.0, clamp( uMirada * 1.6 - aAncla.w, 0.0, 1.0 ) );
	float a = aAncla.z * t;
	mundo.xz = aAncla.xy + girar2( mundo.xz - aAncla.xy, - a );
	n.xz = girar2( n.xz, - a );
	vNormalMundo = n;
	vHaciaLaCamara = cameraPosition - mundo.xyz;
	vec4 mvPosition = viewMatrix * mundo;
	gl_Position = projectionMatrix * mvPosition;
	#include <fog_vertex>
}
`

const FRAGMENT_DE_LA_COPIA = /* glsl */ `
uniform float uNoche;
uniform vec4 uNeblina;
uniform vec3 uLuz;
uniform float uContraluz;
varying vec3 vLocal;
varying vec4 vPieza;
varying vec3 vNormalMundo;
varying vec3 vHaciaLaCamara;
#include <common>
#include <fog_pars_fragment>
${EN_LA_REGION_GLSL}
void main() {
	if ( ! enLaRegion( vLocal.xy, vPieza.x, vPieza.y ) ) discard;
	// Las espejadas dan vuelta el sentido de las caras: el signo viene en la pieza.
	bool frente = gl_FrontFacing == ( vPieza.w > 0.0 );
	vec3 n = normalize( vNormalMundo ) * ( frente ? 1.0 : - 1.0 );
	float dia = 1.0 - uNoche;
	float luz = 0.2 + 0.3 * ( 0.5 + 0.5 * n.y ) + 0.6 * max( dot( n, uLuz ), 0.0 );
	gl_FragColor = vec4( vec3( vPieza.z ) * luz * mix( 0.04, 1.0, dia ), 1.0 );
	#include <colorspace_fragment>
	#include <fog_fragment>
	#ifdef USE_FOG
		float neblina = smoothstep( uNeblina.x, uNeblina.y, vFogDepth ) * mix( uNeblina.z, uNeblina.w, uNoche );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, neblina );
		float borde = pow( 1.0 - abs( dot( n, normalize( vHaciaLaCamara ) ) ), 2.5 );
		gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor * 1.3, borde * uNoche * uContraluz );
	#endif
}
`

export interface UniformsDeLaCopia {
  readonly uMirada: { value: number }
}

export function materialDeLaCopia(fronteras: Fronteras, uniforms: UniformsDeLaCopia): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
      ...uniforms,
      uNoche: VIVO.uNoche,
      uNeblina: { value: new THREE.Vector4(NEBLINA.desde, NEBLINA.hasta, NEBLINA.dia, NEBLINA.noche) },
      uLuz: { value: new THREE.Vector3(-0.45, 0.8, 0.4).normalize() },
      uContraluz: { value: CONTRALUZ },
      uFronteras: { value: new THREE.Vector4(fronteras.corteCP, fronteras.paloDesde, fronteras.paloHasta, fronteras.paloArriba) },
    },
    vertexShader: VERTEX_DE_LA_COPIA,
    fragmentShader: FRAGMENT_DE_LA_COPIA,
    fog: true,
    side: THREE.DoubleSide,
  })
}

/** Sólo profundidad: el logo y el piso tapan a las copias en la escena aparte. */
export function materialDelTapon(): THREE.MeshBasicMaterial {
  return new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide })
}

const VERTEX_DE_LA_COMPOSICION = /* glsl */ `
varying vec2 vUv;
void main() {
	vUv = position.xy * 0.5 + 0.5;
	gl_Position = vec4( position.xy, 0.0, 1.0 );
}
`

const FRAGMENT_DE_LA_COMPOSICION = /* glsl */ `
uniform sampler2D uCopias;
uniform vec2 uTexel;
uniform float uRadio;
uniform float uVisible;
uniform vec4 uTexto[ ${CAJAS_DE_LA_FORMACION} ];
uniform float uPluma;
varying vec2 vUv;

// 0 adentro de cualquier caja de texto, 1 lejos de todas (la misma cuenta que el pulso de E4).
float fueraDelTexto() {
	float m = 1.0;
	for ( int i = 0; i < ${CAJAS_DE_LA_FORMACION}; i++ ) {
		vec4 c = uTexto[ i ];
		if ( c.z <= c.x ) continue;
		vec2 dentro = min( gl_FragCoord.xy - c.xy, c.zw - gl_FragCoord.xy );
		m = min( m, 1.0 - smoothstep( - uPluma, 0.0, min( dentro.x, dentro.y ) ) );
	}
	return m;
}

void main() {
	// Un disco de nueve muestras: el centro y ocho alrededor. El búfer ya viene a media resolución.
	vec4 suma = texture2D( uCopias, vUv ) * 2.0;
	float peso = 2.0;
	for ( int i = 0; i < 8; i ++ ) {
		float a = float( i ) * 0.785398;
		suma += texture2D( uCopias, vUv + vec2( cos( a ), sin( a ) ) * uTexel * uRadio );
		peso += 1.0;
	}
	suma /= peso;
	if ( suma.a < 0.003 ) discard;
	gl_FragColor = vec4( suma.rgb / suma.a, suma.a * uVisible * mix( ${DETRAS_DEL_TEXTO.toFixed(2)}, 1.0, fueraDelTexto() ) );
	#include <colorspace_fragment>
}
`

export interface UniformsDeLaComposicion {
  readonly uTexto: { value: THREE.Vector4[] }
  readonly uPluma: { value: number }
  readonly uCopias: { value: THREE.Texture | null }
  readonly uTexel: { value: THREE.Vector2 }
  readonly uRadio: { value: number }
  readonly uVisible: { value: number }
}

export function materialDeLaComposicion(uniforms: UniformsDeLaComposicion): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: { ...uniforms },
    vertexShader: VERTEX_DE_LA_COMPOSICION,
    fragmentShader: FRAGMENT_DE_LA_COMPOSICION,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
  })
}
