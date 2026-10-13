import * as THREE from 'three'

import { DIBUJO } from '../energia/dibujo/comun'
import { CRISTAL, type Esquirla } from './cristal'

/** Las cajas del texto (y de la barra) donde el cristal no se dibuja: hasta `zona.cajas`, con un borde blando (px). */
const CAJAS_GLSL = /* glsl */ `
uniform vec4 uCajas[ ${String(CRISTAL.zona.cajas)} ];
uniform float uCuantasCajas;
uniform float uCajaBorde;
float adentroDeLasCajas( vec2 s ) {
	float m = 0.0;
	vec2 borde = uCajaBorde / uResolucion * uPixel;
	for ( int r = 0; r < ${String(CRISTAL.zona.cajas)}; r ++ ) {
		if ( float( r ) >= uCuantasCajas ) break;
		vec4 c = uCajas[ r ];
		float x = smoothstep( c.x - borde.x, c.x + borde.x, s.x ) * ( 1.0 - smoothstep( c.z - borde.x, c.z + borde.x, s.x ) );
		float y = smoothstep( c.y - borde.y, c.y + borde.y, s.y ) * ( 1.0 - smoothstep( c.w - borde.y, c.w + borde.y, s.y ) );
		m = max( m, x * y );
	}
	return m;
}
`

/**
 * [PULIDO 20] R2 · EL VIDRIO DE LAS ESQUIRLAS (`cristal.ts`: lo puro; `esquirlas.ts`: la geometría; `fondo.ts`: lo que refractan). Cada
 * fragmento de una esquirla: su faceta (la normal plana, girada con la esquirla), la REFRACCIÓN por Snell del rayo de la vista leída en el
 * fondo donde el rayo desviado cae a `fondo` u detrás (si eso mira fuera del fondo, se desvanece: nunca estira), el FRESNEL de Schlick con
 * un reflejo tenue del entorno (el cielo por la altura del rayo reflejado), el BRILLO ESPECULAR de la luz de la sala en las facetas (se
 * mueve con la cámara: centellea al pasar), el FILO de los cantos (de día la reflexión total los oscurece, de noche toman la luz) y, con
 * el prisma, el ARCOÍRIS en los cantos (cada canal con su índice). Sólo en el borde del cuadro: fuera de la elipse central, lejos de las
 * cajas del texto y del logo y de la cámara (`zonaDelCristal`). No escribe profundidad (las partículas, que van después, nunca se tapan).
 */
export const VERTICES_DEL_VIDRIO = (n: number): string => /* glsl */ `
// [PULIDO 21] S4 · ${String(n)} esquirlas: lo de cada una (su centro, su giro, su vida) viaja en sus vértices (un búfer, una llamada; sin
// el tope de uniformes de los teléfonos).
attribute float aFilo;
attribute vec4 aCentro;
attribute vec4 aGiro;
attribute vec4 aVida;
uniform float uTiempo;
uniform float uCrece;
varying vec3 vMundo;
varying vec3 vNormal;
varying float vFilo;
vec3 girar( vec3 v, vec3 eje, float a ) {
	float c = cos( a );
	float s = sin( a );
	return v * c + cross( eje, v ) * s + eje * dot( eje, v ) * ( 1.0 - c );
}
void main() {
	vec4 C = aCentro;
	vec4 G = aGiro;
	vec4 V = aVida;
	// El giro lento (su eje, su velocidad) y la respiración (su fase): con el reloj, sin temblor; crece al aparecer.
	float a = G.w * uTiempo + V.y;
	float escala = uCrece * ( 1.0 + V.z * sin( 6.2831853 * uTiempo / V.w + V.x ) );
	vec3 p = girar( position, G.xyz, a ) * escala + C.xyz;
	vNormal = girar( normal, G.xyz, a );
	vMundo = p;
	vFilo = aFilo;
	gl_Position = projectionMatrix * viewMatrix * vec4( p, 1.0 );
}
`

export const FRAGMENTOS_DEL_VIDRIO = /* glsl */ `
uniform sampler2D uFondo;
uniform vec2 uResolucion;
uniform float uPixel;
uniform float uAspecto;
uniform float uAmplitud;
uniform float uNoche;
uniform float uPrisma;
uniform vec3 uCamara;
uniform mat4 uVista;
uniform vec3 uLuz;
uniform vec4 uVidrio;
uniform vec4 uBrillo;
uniform vec4 uFilo;
uniform vec4 uZona;
uniform vec2 uCerca;
uniform vec4 uLogo;
uniform float uHayLogo;
varying vec3 vMundo;
varying vec3 vNormal;
varying float vFilo;
${CAJAS_GLSL}
vec2 enElFondo( vec3 p ) {
	vec4 c = uVista * vec4( p, 1.0 );
	return c.xy / max( 1e-4, c.w ) * 0.5 + 0.5;
}
// Cuánto adentro del fondo cae una lectura (0 afuera, 1 lejos del borde): afuera se desvanece, nunca estira.
float adentroDelFondo( vec2 m ) {
	vec2 b = smoothstep( vec2( 0.0 ), vec2( 0.03 ), m ) * smoothstep( vec2( 0.0 ), vec2( 0.03 ), 1.0 - m );
	return b.x * b.y;
}
float fueraDeLaCaja( vec2 p, vec4 caja ) {
	vec2 d = max( max( caja.xy - p, vec2( 0.0 ) ), p - caja.zw );
	return length( d * vec2( uAspecto, 1.0 ) );
}
void main() {
	vec2 uv = gl_FragCoord.xy / uResolucion;
	vec2 ndc = uv * 2.0 - 1.0;
	// Dónde se ve: fuera de la elipse central, lejos del texto, del logo y de la cámara.
	float zona = smoothstep( 0.0, 1.0, ( length( ndc / uZona.xy ) - 1.0 ) / uZona.z );
	zona *= 1.0 - adentroDeLasCajas( ndc );
	if ( uHayLogo > 0.5 ) zona *= smoothstep( 0.0, 1.0, fueraDeLaCaja( ndc, uLogo ) / uZona.w );
	zona *= smoothstep( uCerca.x, uCerca.y, length( vMundo - uCamara ) );
	float amp = uAmplitud * zona;
	if ( amp < 0.002 ) discard;
	vec3 n = normalize( vNormal );
	vec3 v = normalize( vMundo - uCamara );
	if ( dot( n, v ) > 0.0 ) n = - n;
	float filo = vFilo * vFilo * vFilo;
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
	color *= 1.0 - uFilo.x * filo * ( 1.0 - uNoche );
	color += vec3( uFilo.y * filo * uNoche );
	// El Fresnel con el reflejo tenue del entorno (el cielo por la altura del reflejado) y el brillo de la luz en las facetas.
	float cosV = max( 0.0, dot( - v, n ) );
	float fresnel = uVidrio.w + ( 1.0 - uVidrio.w ) * pow( 1.0 - cosV, 5.0 );
	vec3 r = reflect( v, n );
	vec3 cielo = mix( mix( vec3( 0.78, 0.78, 0.77 ), vec3( 0.98 ), r.y * 0.5 + 0.5 ), mix( vec3( 0.01 ), vec3( 0.09, 0.09, 0.1 ), r.y * 0.5 + 0.5 ), uNoche );
	color = mix( color, cielo, fresnel * mix( uBrillo.w, uFilo.w, uNoche ) );
	vec3 h = normalize( uLuz - v );
	float especular = pow( max( 0.0, dot( n, h ) ), uBrillo.z ) * mix( uBrillo.x, uBrillo.y, uNoche ) * ( 0.4 + 0.6 * filo + fresnel );
	color += vec3( especular );
	gl_FragColor = vec4( color * amp, amp );
}
`

/** Lo de cada esquirla en sus vértices (`armarLasEsquirlas`): su centro, su eje y velocidad de giro, sus fases y su respiración. */
export function datosDeLaEsquirla(e: Esquirla): readonly [readonly number[], readonly number[], readonly number[]] {
  const M = CRISTAL.movimiento
  return [[e.x, e.y, e.z, 1], [e.eje[0], e.eje[1], e.eje[2], e.velocidad], [e.fase, e.faseDelGiro, M.crece, M.periodoS]]
}

/** Las uniformes del vidrio (lo de cada esquirla va en sus vértices). [PULIDO 21] S4 · el prisma, por defecto. */
export function uniformesDelVidrio() {
  const C = CRISTAL
  return {
    uTiempo: { value: 0 },
    uCrece: { value: 1 },
    uFondo: { value: null as THREE.Texture | null },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uAspecto: { value: 1 },
    uAmplitud: { value: 0 },
    uNoche: { value: 0 },
    uPrisma: { value: 1 },
    uCamara: { value: new THREE.Vector3() },
    uVista: { value: new THREE.Matrix4() },
    uLuz: { value: new THREE.Vector3(0, 1, 0) },
    uVidrio: { value: new THREE.Vector4(C.vidrio.indice, C.vidrio.fondo, C.vidrio.dispersion, C.vidrio.f0) },
    uBrillo: { value: new THREE.Vector4(C.luz.especular[0], C.luz.especular[1], C.luz.dureza, C.luz.reflejo[0]) },
    uFilo: { value: new THREE.Vector4(C.luz.filo[0], C.luz.filo[1], C.luz.tinta, C.luz.reflejo[1]) },
    uZona: { value: new THREE.Vector4(C.zona.semiejes[0], C.zona.semiejes[1], C.zona.fundido, C.zona.logo) },
    uCerca: { value: new THREE.Vector2(C.zona.cerca[0], C.zona.cerca[1]) },
    uLogo: { value: new THREE.Vector4(0, 0, 0, 0) },
    uHayLogo: { value: 0 },
    uCajas: { value: Array.from({ length: C.zona.cajas }, () => new THREE.Vector4()) },
    uCuantasCajas: { value: 0 },
    uCajaBorde: { value: DIBUJO.textoBorde + C.zona.textoPx },
  }
}
export type UniformesDelVidrio = ReturnType<typeof uniformesDelVidrio>

/** La malla de las esquirlas: transparente, premultiplicada, sin escribir profundidad (sí la lee: lo de adelante la tapa), antes que las partículas. */
export function armarElVidrio(geometria: THREE.BufferGeometry, uniformes: UniformesDelVidrio, n: number): THREE.Mesh {
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICES_DEL_VIDRIO(n), fragmentShader: FRAGMENTOS_DEL_VIDRIO, uniforms: uniformes, transparent: true, depthWrite: false, depthTest: true, side: THREE.FrontSide, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
  const malla = new THREE.Mesh(geometria, material)
  malla.name = 'cristal · esquirlas'
  malla.frustumCulled = false
  malla.renderOrder = CRISTAL.orden
  return malla
}
