import * as THREE from 'three'

import { DIBUJO, TEXTOS_GLSL } from '../energia/dibujo/comun'
import { TEXTO_EN_PANTALLA } from '../energia/textoEnPantalla'
import { RUIDO_GLSL } from '../energia/ruido'
import { COLOR_DE_LA_ESCENA_GLSL, PROFUNDIDAD_GLSL } from '../pase/pase'

/**
 * [PULIDO 18] P2 · LOS EFECTOS DE LA PANTALLA (`docs/rediseno/DIMENSION-ESPEJO.md`): CRISTALIZAR, el CALEIDOSCOPIO y la ESPIRAL. Cada uno
 * es un cuadrado sobre su ZONA (un centro y un radio en la pantalla; sin amplitud, no pinta nada) que lee la COPIA DEL CUADRO (el pase
 * compartido: lo opaco, el cielo y la trama, ya dibujados) por otro camino:
 *   · cristal: celdas de Voronoi en la pantalla (Worley; la distancia exacta al borde de Quílez): cada esquirla con su desfase, su giro
 *     y su retardo (se rompen del centro hacia afuera), con un filo de vidrio del mismo ancho en todas; al curarse vuelven y el filo se
 *     borra;
 *   · caleidoscopio: el ángulo alrededor del centro plegado en N cuñas espejadas que giran, desplegado por la amplitud;
 *   · espiral: el logaritmo complejo de la zona, girado y escalado (la galería de Escher): el fondo se enrolla hacia adentro de sí.
 * NUNCA toca lo que no es fondo: el pixel y lo que lee tienen que estar más lejos que el logo (la profundidad del pase); sobre un texto
 * se apaga. Monocromo; con el prisma, un corrimiento de color mínimo en los filos y las costuras.
 */
export type EfectoDePantalla = 'cristal' | 'caleidoscopio' | 'espiral'

export const PANTALLA = {
  /** Cristal: el lado de la celda (px de CSS), cuánto se corre una esquirla (px), cuánto gira (rad) y el ancho del filo (px). */
  uCristal: [78, 10, 0.07, 1.1],
  /** Caleidoscopio: las cuñas, cuánto gira (rad/s), el acercamiento y el brillo de las costuras. */
  uCaleido: [6, 0.12, 0.18, 0.22],
  /** Espiral: la escala de la repetición, el giro por vuelta (rad), la velocidad hacia adentro y la apertura. */
  uEspiral: [3.2, 1.6, 0.18, 0.55],
  /** El fondo: desde cuánto más lejos que el logo un píxel es fondo (u) y en cuánto entra (u). */
  fondo: [4, 4],
} as const

const VERTICES = /* glsl */ `
uniform vec4 uZona;
uniform vec2 uResolucion;
uniform float uPixel;
void main() {
	// El cuadrado de la zona (sin amplitud, nada); sin profundidad: lo que tapa lo decide la del pase.
	float radio = uZona.w > 0.002 ? uZona.z * uPixel : 0.0;
	gl_Position = vec4( uZona.xy + position.xy * radio / ( uResolucion * 0.5 ), 0.0, 1.0 );
}
`

const COMUN_DE_LA_ZONA = /* glsl */ `
uniform vec4 uZona;
uniform vec2 uResolucion;
uniform float uPixel;
uniform float uTiempo;
uniform float uNoche;
uniform float uPrisma;
uniform vec2 uFondo;
${PROFUNDIDAD_GLSL}
${COLOR_DE_LA_ESCENA_GLSL}
${TEXTOS_GLSL}
${RUIDO_GLSL}
// ¿Es fondo (más lejos que el logo)? 1 sí, 0 no.
float esFondo( vec2 uv ) {
	return smoothstep( uFondo.x, uFondo.x + uFondo.y, distanciaALoOpaco( uv ) );
}
// Lee lo de atrás en «desde» si es fondo; si no, lo de este píxel (nunca se toma un píxel del logo ni de un título).
vec3 leerFondo( vec2 aqui, vec2 desde ) {
	return colorDeAtras( mix( aqui, desde, esFondo( desde ) ) );
}
// Con el prisma: los tres canales corridos apenas a lo largo de «n» (px).
vec3 leerConPrisma( vec2 aqui, vec2 desde, vec2 n ) {
	// Sin un retorno temprano: el compilador de D3D avisaba de una variable sin inicializar (visto en la consola del banco).
	vec3 color = leerFondo( aqui, desde );
	if ( uPrisma >= 0.5 ) {
		vec2 corre = n / uResolucion;
		color = vec3( leerFondo( aqui, desde + corre ).r, color.g, leerFondo( aqui, desde - corre ).b );
	}
	return color;
}
`

const CRISTAL = /* glsl */ `
uniform vec4 uCristal;
vec2 semilla( ivec2 c ) {
	uint id = uint( c.x + 4096 ) * 73856093u ^ uint( c.y + 4096 ) * 19349663u;
	return vec2( azar01( id, 41u ), azar01( id, 42u ) );
}
vec3 efecto( vec2 aqui, vec2 centro, float radio, float amp, out float pinta ) {
	float lado = uCristal.x * uPixel;
	vec2 p = gl_FragCoord.xy / lado;
	ivec2 base = ivec2( floor( p ) );
	vec2 fr = fract( p );
	// La celda más cercana (3 × 3) y la distancia exacta a su borde (5 × 5 alrededor de ella: el método de las bisectrices).
	float mejor = 8.0;
	ivec2 mc = base;
	vec2 mr = vec2( 0.0 );
	for ( int j = - 1; j <= 1; j ++ ) for ( int i = - 1; i <= 1; i ++ ) {
		ivec2 g = ivec2( i, j );
		vec2 r = vec2( g ) + semilla( base + g ) - fr;
		float d = dot( r, r );
		if ( d < mejor ) {
			mejor = d;
			mr = r;
			mc = base + g;
		}
	}
	float borde = 8.0;
	for ( int j = - 2; j <= 2; j ++ ) for ( int i = - 2; i <= 2; i ++ ) {
		ivec2 g = mc - base + ivec2( i, j );
		vec2 r = vec2( g ) + semilla( base + g ) - fr;
		vec2 entre = r - mr;
		if ( dot( entre, entre ) > 1e-5 ) borde = min( borde, dot( 0.5 * ( mr + r ), normalize( entre ) ) );
	}
	// La esquirla: se rompe del centro hacia afuera (su retardo), se corre y gira apenas alrededor de su centro.
	uint id = uint( mc.x + 4096 ) * 2654435761u ^ uint( mc.y + 4096 ) * 2246822519u;
	vec2 centroDeLaCelda = ( vec2( mc ) + semilla( mc ) ) * lado;
	float retardo = 0.55 * clamp( length( centroDeLaCelda - centro ) / radio, 0.0, 1.0 ) + 0.2 * azar01( id, 43u );
	float a = smoothstep( retardo, retardo + 0.3, amp );
	float angulo = azar01( id, 44u ) * 6.2831853;
	vec2 corre = vec2( cos( angulo ), sin( angulo ) ) * uCristal.y * uPixel * ( 0.4 + 0.6 * azar01( id, 45u ) ) * a;
	float gira = ( azar01( id, 46u ) * 2.0 - 1.0 ) * uCristal.z * a;
	vec2 rel = gl_FragCoord.xy - centroDeLaCelda;
	vec2 girado = vec2( cos( gira ) * rel.x - sin( gira ) * rel.y, sin( gira ) * rel.x + cos( gira ) * rel.y );
	vec2 desde = ( centroDeLaCelda + girado - corre ) / uResolucion;
	// El filo: una línea del mismo ancho en todas (la distancia al borde, en px) y, del lado de adentro, la sombra de la talla.
	float bordePx = borde * lado;
	float filo = ( 1.0 - smoothstep( 0.0, uCristal.w * uPixel, bordePx ) ) * a;
	float talla = ( 1.0 - smoothstep( uCristal.w * uPixel, 3.5 * uCristal.w * uPixel, bordePx ) ) * a;
	vec2 normal = normalize( mr + 1e-4 );
	vec3 color = leerConPrisma( aqui, desde, normal * 1.6 * filo * uPixel );
	// Cada esquirla toma la luz un poco distinto (una faceta); el filo, claro de noche y una talla de tinta de día.
	color *= 1.0 + ( azar01( id, 47u ) - 0.5 ) * 0.12 * a;
	color = mix( color, mix( color * 0.62, color + 0.25, uNoche ), talla * 0.35 );
	color = mix( color, mix( color * 0.35, vec3( 1.0 ), uNoche ), filo * mix( 0.5, 0.65, uNoche ) );
	pinta = max( a, filo );
	return color;
}
`

const CALEIDOSCOPIO = /* glsl */ `
uniform vec4 uCaleido;
vec3 efecto( vec2 aqui, vec2 centro, float radio, float amp, out float pinta ) {
	vec2 d = gl_FragCoord.xy - centro;
	float r = length( d );
	float th = atan( d.y, d.x );
	float cuna = 3.14159265 / max( 1.0, uCaleido.x );
	float gira = uTiempo * uCaleido.y + amp * 0.9;
	float plegado = abs( mod( th + gira, 2.0 * cuna ) - cuna );
	float escala = 1.0 - uCaleido.z * amp;
	vec2 desde = ( centro + vec2( cos( plegado ), sin( plegado ) ) * r * escala ) / uResolucion;
	// Las costuras de los espejos: una línea fina donde la cuña se pliega.
	float costura = ( 1.0 - smoothstep( 0.0, 1.2 * uPixel, min( plegado, cuna - plegado ) * r ) ) * amp;
	vec3 color = leerConPrisma( aqui, desde, vec2( - sin( th ), cos( th ) ) * 1.4 * costura * uPixel );
	color = mix( color, mix( color * 0.7, color + 0.35, uNoche ), costura * uCaleido.w );
	pinta = smoothstep( 0.0, 0.6, amp );
	return color;
}
`

const ESPIRAL = /* glsl */ `
uniform vec4 uEspiral;
vec3 efecto( vec2 aqui, vec2 centro, float radio, float amp, out float pinta ) {
	vec2 d = gl_FragCoord.xy - centro;
	float r = max( length( d ), 1.0 );
	float th = atan( d.y, d.x );
	// El logaritmo de la zona: en él, la repetición es un corrimiento (cada vuelta, la misma imagen a escala) y el giro, un corte.
	float periodo = log( max( 1.2, uEspiral.x ) );
	float l = log( r / ( radio * uEspiral.w ) );
	float u = mod( l - uTiempo * uEspiral.z, periodo ) - periodo;
	float v = th + uEspiral.y * l / periodo * amp;
	vec2 desde = ( centro + vec2( cos( v ), sin( v ) ) * radio * uEspiral.w * exp( u ) ) / uResolucion;
	vec3 color = leerFondo( aqui, desde );
	pinta = smoothstep( 0.0, 0.7, amp );
	return color;
}
`

const FRAGMENTOS = (efecto: string): string => /* glsl */ `
${COMUN_DE_LA_ZONA}
${efecto}
void main() {
	vec2 aqui = gl_FragCoord.xy / uResolucion;
	vec2 centro = ( uZona.xy * 0.5 + 0.5 ) * uResolucion;
	float radio = uZona.z * uPixel;
	float amp = uZona.w;
	// La zona: un borde suave, sólo el fondo y nunca sobre un texto.
	float zona = 1.0 - smoothstep( 0.55, 1.0, length( gl_FragCoord.xy - centro ) / radio );
	float mascara = zona * esFondo( aqui ) * ( 1.0 - uTextoFuerza * adentroDelTexto( aqui * 2.0 - 1.0 ) );
	if ( mascara * amp < 0.002 || uHayColor < 0.5 ) discard;
	float pinta = 0.0;
	vec3 color = efecto( aqui, centro, radio, amp, pinta );
	float alfa = clamp( mascara * pinta, 0.0, 1.0 );
	gl_FragColor = vec4( color * alfa, alfa );
}
`

const DEL_EFECTO: Readonly<Record<EfectoDePantalla, string>> = { cristal: CRISTAL, caleidoscopio: CALEIDOSCOPIO, espiral: ESPIRAL }

/** Las uniformes de una zona (las del pase se esparcen al armarla). */
export function uniformesDeLaZona() {
  const v4 = (x: readonly number[]): { value: THREE.Vector4 } => ({ value: new THREE.Vector4(x[0], x[1], x[2], x[3]) })
  return {
    uZona: { value: new THREE.Vector4(0, 0, 1, 0) },
    uResolucion: { value: new THREE.Vector2(1, 1) },
    uPixel: { value: 1 },
    uTiempo: { value: 0 },
    uNoche: { value: 0 },
    uPrisma: { value: 0 },
    uFondo: { value: new THREE.Vector2(PANTALLA.fondo[0], PANTALLA.fondo[1]) },
    uTextos: { value: Array.from({ length: TEXTO_EN_PANTALLA.cajas }, () => new THREE.Vector4()) },
    uCuantosTextos: { value: 0 },
    uTextoBorde: { value: DIBUJO.textoBorde },
    uTextoFuerza: { value: 1 },
    uCristal: v4(PANTALLA.uCristal),
    uCaleido: v4(PANTALLA.uCaleido),
    uEspiral: v4(PANTALLA.uEspiral),
  }
}

const CUADRADO = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])

/** El cuadrado de la zona con el sombreador de su efecto: transparente, premultiplicado, sin profundidad (la decide el pase). */
export function armarLaZona(efecto: EfectoDePantalla, uniformes: Record<string, THREE.IUniform>): THREE.Mesh {
  const g = new THREE.BufferGeometry()
  g.setAttribute('position', new THREE.BufferAttribute(CUADRADO, 3))
  g.setIndex([0, 1, 2, 2, 1, 3])
  const material = new THREE.ShaderMaterial({ vertexShader: VERTICES, fragmentShader: FRAGMENTOS(DEL_EFECTO[efecto]), uniforms: uniformes, transparent: true, depthWrite: false, depthTest: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor })
  const malla = new THREE.Mesh(g, material)
  malla.name = `espejo: ${efecto}`
  malla.frustumCulled = false
  return malla
}

/** Desde dónde del ORDEN de los transparentes se dibuja: después de la copia del cuadro (−18) y antes de la energía (−10). */
export const ORDEN_DEL_ESPEJO = -14

