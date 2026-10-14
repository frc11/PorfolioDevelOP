import * as THREE from 'three'

import { CRISTAL } from './cristal'

/**
 * [PULIDO 20] R2 · EL VIDRIO (`cristal.ts`: lo puro; `muro.ts`: la geometría; `fondo.ts`: lo que refracta). Cada fragmento: la normal de
 * su celda, la REFRACCIÓN por Snell del rayo de la vista leída en el fondo donde el rayo desviado cae a `fondo` u detrás (si eso mira
 * fuera del fondo, se desvanece: nunca estira), el FRESNEL de Schlick con un reflejo tenue del entorno, el BRILLO ESPECULAR de la luz de
 * la sala y, con el prisma (por defecto), el ARCOÍRIS en los cantos (cada canal con su índice). No escribe profundidad.
 *
 * [PULIDO 23] U1 · EL MURO, UN VITRAL ROTO: las celdas comparten sus bordes y en cada borde va la LÍNEA DE QUIEBRE, fina y brillante (por
 * píxel: la distancia al borde en px sale de `aInterior` y su derivada), con el prisma más fuerte cerca. SIN MÁSCARAS: se borraron la
 * elipse central, las cajas del texto y de la barra, el logo y la cercanía de la cámara; lo tapa sólo lo que de verdad está delante (la
 * profundidad: el logo, los títulos y el pie son opacos y escriben profundidad; las partículas y la energía van después). Una sola cara
 * (la de adentro: la cámara siempre está adentro del muro). Quieto: sin giro ni respiración.
 */
export const VERTICES_DEL_VIDRIO = (n: number): string => /* glsl */ `
// [PULIDO 23] U1 · el muro de ${String(n)} celdas, quieto.
attribute float aInterior;
varying vec3 vMundo;
varying vec3 vNormal;
varying float vInterior;
void main() {
	vec4 p = modelMatrix * vec4( position, 1.0 );
	vMundo = p.xyz;
	vNormal = normalize( mat3( modelMatrix ) * normal );
	vInterior = aInterior;
	gl_Position = projectionMatrix * viewMatrix * p;
}
`

const Q = CRISTAL.quiebre
const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

export const FRAGMENTOS_DEL_VIDRIO = /* glsl */ `
uniform sampler2D uFondo;
uniform vec2 uResolucion;
uniform float uAmplitud;
uniform float uNoche;
uniform float uPrisma;
uniform vec3 uCamara;
uniform mat4 uVista;
uniform vec3 uLuz;
uniform vec4 uVidrio;
uniform vec4 uBrillo;
uniform vec4 uFilo;
varying vec3 vMundo;
varying vec3 vNormal;
varying float vInterior;
vec2 enElFondo( vec3 p ) {
	vec4 c = uVista * vec4( p, 1.0 );
	return c.xy / max( 1e-4, c.w ) * 0.5 + 0.5;
}
// Cuánto adentro del fondo cae una lectura (0 afuera, 1 lejos del borde): afuera se desvanece, nunca estira.
float adentroDelFondo( vec2 m ) {
	vec2 b = smoothstep( vec2( 0.0 ), vec2( 0.03 ), m ) * smoothstep( vec2( 0.0 ), vec2( 0.03 ), 1.0 - m );
	return b.x * b.y;
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolucion;
	float amp = uAmplitud;
	if ( amp < 0.002 ) discard;
	vec3 n = normalize( vNormal );
	vec3 v = normalize( vMundo - uCamara );
	if ( dot( n, v ) > 0.0 ) n = - n;
	// La distancia al borde de la celda en px: la línea de quiebre y el canto donde el prisma abre más.
	float px = vInterior / max( fwidth( vInterior ), 1e-5 );
	float quiebre = 1.0 - smoothstep( ${f(Q.anchoPx * 0.5)}, ${f(Q.anchoPx * 1.6)}, px );
	float filo = 1.0 - smoothstep( 0.0, ${f(Q.prismaPx)}, px );
	filo *= filo;
	// La refracción: dónde cae el rayo desviado a «fondo» u detrás, contra dónde caería derecho.
	vec2 derecho = enElFondo( vMundo + v * uVidrio.y );
	vec3 color;
	float adentro;
	if ( uPrisma >= 0.5 ) {
		float d = uVidrio.z * ( 1.0 + 2.0 * filo );
		vec2 mr = uv + enElFondo( vMundo + refract( v, n, 1.0 / ( uVidrio.x - d ) ) * uVidrio.y ) - derecho;
		vec2 mg = uv + enElFondo( vMundo + refract( v, n, 1.0 / uVidrio.x ) * uVidrio.y ) - derecho;
		vec2 mb = uv + enElFondo( vMundo + refract( v, n, 1.0 / ( uVidrio.x + d ) ) * uVidrio.y ) - derecho;
		color = vec3( texture2D( uFondo, mr ).r, texture2D( uFondo, mg ).g, texture2D( uFondo, mb ).b );
		adentro = min( adentroDelFondo( mr ), min( adentroDelFondo( mg ), adentroDelFondo( mb ) ) );
	} else {
		vec2 m = uv + enElFondo( vMundo + refract( v, n, 1.0 / uVidrio.x ) * uVidrio.y ) - derecho;
		color = texture2D( uFondo, m ).rgb;
		adentro = adentroDelFondo( m );
	}
	amp *= adentro;
	if ( amp < 0.002 ) discard;
	// De día el cuerpo apenas se tiñe; el canto: de día la reflexión total lo oscurece, de noche toma la luz.
	color *= 1.0 - uFilo.z * ( 1.0 - uNoche );
	color *= 1.0 - uFilo.x * filo * ( 1.0 - uNoche ) * 0.5;
	color += vec3( uFilo.y * filo * uNoche * 0.5 );
	// El Fresnel con el reflejo tenue del entorno (el cielo por la altura del reflejado) y el brillo de la luz en las facetas.
	float cosV = max( 0.0, dot( - v, n ) );
	float fresnel = uVidrio.w + ( 1.0 - uVidrio.w ) * pow( 1.0 - cosV, 5.0 );
	vec3 r = reflect( v, n );
	vec3 cielo = mix( mix( vec3( 0.78, 0.78, 0.77 ), vec3( 0.98 ), r.y * 0.5 + 0.5 ), mix( vec3( 0.01 ), vec3( 0.09, 0.09, 0.1 ), r.y * 0.5 + 0.5 ), uNoche );
	color = mix( color, cielo, fresnel * mix( uBrillo.w, uFilo.w, uNoche ) );
	vec3 h = normalize( uLuz - v );
	float especular = pow( max( 0.0, dot( n, h ) ), uBrillo.z ) * mix( uBrillo.x, uBrillo.y, uNoche ) * ( 0.4 + 0.6 * filo + fresnel );
	color += vec3( especular );
	// La línea de quiebre, fina y brillante.
	color += vec3( quiebre * mix( ${f(Q.brillo[0])}, ${f(Q.brillo[1])}, uNoche ) );
	gl_FragColor = vec4( color * amp, amp );
}
`

/** Las uniformes del vidrio. [PULIDO 21] S4 · el prisma, por defecto. */
export function uniformesDelVidrio() {
  const C = CRISTAL
  return {
    uFondo: { value: null as THREE.Texture | null },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uAmplitud: { value: 0 },
    uNoche: { value: 0 },
    uPrisma: { value: 1 },
    uCamara: { value: new THREE.Vector3() },
    uVista: { value: new THREE.Matrix4() },
    uLuz: { value: new THREE.Vector3(0, 1, 0) },
    uVidrio: { value: new THREE.Vector4(C.vidrio.indice, C.vidrio.fondo, C.vidrio.dispersion, C.vidrio.f0) },
    uBrillo: { value: new THREE.Vector4(C.luz.especular[0], C.luz.especular[1], C.luz.dureza, C.luz.reflejo[0]) },
    uFilo: { value: new THREE.Vector4(C.luz.filo[0], C.luz.filo[1], C.luz.tinta, C.luz.reflejo[1]) },
  }
}
export type UniformesDelVidrio = ReturnType<typeof uniformesDelVidrio>

/** El muro: transparente, premultiplicado, sin escribir profundidad (sí la lee: lo de adelante lo tapa), una sola cara, antes que las partículas. */
export function armarElVidrio(geometria: THREE.BufferGeometry, uniformes: UniformesDelVidrio, n: number): THREE.Mesh {
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICES_DEL_VIDRIO(n), fragmentShader: FRAGMENTOS_DEL_VIDRIO, uniforms: uniformes, transparent: true, depthWrite: false, depthTest: true, side: THREE.FrontSide, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
  const malla = new THREE.Mesh(geometria, material)
  malla.name = 'cristal · muro'
  malla.frustumCulled = false
  malla.renderOrder = CRISTAL.orden
  return malla
}
