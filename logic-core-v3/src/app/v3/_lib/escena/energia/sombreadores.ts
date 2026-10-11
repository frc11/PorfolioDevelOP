import { TEXTO_EN_PANTALLA } from './textoEnPantalla'

/**
 * [PULIDO 15] M2 · LOS SOMBREADORES DE LA ENERGÍA (`cargas.ts`: el todo). Las cargas, instanciadas: un cuadrado por carga que mira a
 * la cámara, con su tamaño del mundo a su distancia (lejos, chicas; cerca, grandes, con un tope en px) y su brillo con la lejanía
 * (lejos, tenues); la positiva es un punto lleno con halo, la negativa un anillo fino. Los arcos, un cuadrado por tramo con el ancho
 * en px de la pantalla: un núcleo fino y un halo. Los dos se apagan detrás de una caja de texto (pasan por detrás). De noche, luz
 * que suma; de día, tinta con un halo del papel (premultiplicado: el alfa es 0 de noche y tapa de día).
 */
export const DIBUJO = {
  /** Las cargas: el radio del núcleo en el mundo (u, de la más chica a la más grande), sus topes en px y el halo (en radios). */
  carga: { radio: [0.035, 0.085], minimoPx: 1.2, maximoPx: 6, halo: 3.5 },
  /** La lejanía: desde dónde se apagan (u de la cámara) y en cuánto. */
  lejania: { desde: 14, tramo: 26, apaga: 0.7 },
  /** Los arcos: el medio ancho del halo y el del núcleo (px de CSS). */
  arco: { halo: 6, nucleo: 0.95 },
  /** Detrás de un texto, cuánto se apagan. */
  texto: 0.94,
} as const

const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

/** Las uniformes comunes y cuánto adentro de una caja de texto (con su aire, NDC) está un punto: 0 afuera, 1 adentro. */
const COMUN = /* glsl */ `
uniform vec3 uCentro;
uniform vec2 uResolucion;
uniform float uPixel;
uniform float uEscalaPx;
uniform float uTiempo;
uniform vec4 uTextos[ ${String(TEXTO_EN_PANTALLA.cajas)} ];
uniform float uCuantosTextos;
float adentroDelTexto( vec2 s ) {
	float m = 0.0;
	vec2 borde = 24.0 / uResolucion * uPixel;
	for ( int r = 0; r < ${String(TEXTO_EN_PANTALLA.cajas)}; r ++ ) {
		if ( float( r ) >= uCuantosTextos ) break;
		vec4 c = uTextos[ r ];
		float x = smoothstep( c.x - borde.x, c.x + borde.x, s.x ) * ( 1.0 - smoothstep( c.z - borde.x, c.z + borde.x, s.x ) );
		float y = smoothstep( c.y - borde.y, c.y + borde.y, s.y ) * ( 1.0 - smoothstep( c.w - borde.y, c.w + borde.y, s.y ) );
		m = max( m, x * y );
	}
	return m;
}
`

const COLOR = /* glsl */ `
uniform vec3 uColorDia;
uniform vec3 uColorNoche;
uniform vec3 uHaloDia;
uniform vec3 uHaloNoche;
uniform float uNoche;
uniform float uApagado;
`

export const VERTICES_DE_LAS_CARGAS = /* glsl */ `
attribute vec3 aLugar;
attribute vec4 aCarga;
varying vec2 vEsquina;
varying float vRadio;
varying float vSigno;
varying float vAlfa;
varying float vLejos;
varying float vTexto;
${COMUN}
void main() {
	vec4 mv = viewMatrix * vec4( uCentro + aLugar, 1.0 );
	float distancia = max( 0.5, - mv.z );
	float mundo = mix( ${f(DIBUJO.carga.radio[0])}, ${f(DIBUJO.carga.radio[1])}, aCarga.y );
	float radio = clamp( uEscalaPx * mundo / distancia, ${f(DIBUJO.carga.minimoPx)} * uPixel, ${f(DIBUJO.carga.maximoPx)} * uPixel );
	vec4 clip = projectionMatrix * mv;
	vTexto = adentroDelTexto( clip.xy / clip.w );
	clip.xy += position.xy * radio * ${f(DIBUJO.carga.halo)} / uResolucion * 2.0 * clip.w;
	gl_Position = clip;
	vEsquina = position.xy * ${f(DIBUJO.carga.halo)};
	vRadio = radio;
	vSigno = aCarga.x;
	vLejos = clamp( ( distancia - ${f(DIBUJO.lejania.desde)} ) / ${f(DIBUJO.lejania.tramo)}, 0.0, 1.0 );
	// Un latido lento, distinto por carga, y el brillo que le deja un arco.
	vAlfa = ( 0.82 + 0.18 * sin( uTiempo * 1.3 + aCarga.w ) ) * ( 1.0 + 1.1 * aCarga.z );
}
`

export const FRAGMENTOS_DE_LAS_CARGAS = /* glsl */ `
varying vec2 vEsquina;
varying float vRadio;
varying float vSigno;
varying float vAlfa;
varying float vLejos;
varying float vTexto;
${COLOR}
void main() {
	float r = length( vEsquina );
	// Un px de la pantalla, en radios del núcleo: los bordes suaves de un px y el anillo de al menos un px.
	float px = 1.0 / max( 1.0, vRadio );
	float nucleo;
	float halo;
	if ( vSigno > 0.0 ) {
		nucleo = 1.0 - smoothstep( 1.0 - px, 1.0 + px, r );
		halo = exp( - r * r * 0.55 ) * mix( 0.3, 0.42, uNoche );
	} else {
		float grosor = max( 0.13, 0.75 * px );
		nucleo = exp( - pow( ( r - 1.0 ) / grosor, 2.0 ) );
		halo = exp( - r * r * 0.7 ) * mix( 0.22, 0.2, uNoche );
	}
	float a = ( nucleo + halo ) * vAlfa * ( 1.0 - ${f(DIBUJO.lejania.apaga)} * vLejos ) * ( 1.0 - uApagado ) * ( 1.0 - ${f(DIBUJO.texto)} * vTexto );
	a = min( a, 1.0 );
	if ( a < 0.004 ) discard;
	vec3 color = mix( mix( uColorDia, uColorNoche, uNoche ), mix( uHaloDia, uHaloNoche, uNoche ), halo / max( 1e-3, nucleo + halo ) );
	gl_FragColor = vec4( color * a, a * ( 1.0 - uNoche ) );
}
`

export const VERTICES_DE_LOS_ARCOS = /* glsl */ `
attribute vec3 aA;
attribute vec3 aB;
attribute vec4 aForma;
varying float vLado;
varying float vAncho;
varying float vAlfa;
varying float vTexto;
${COMUN}
void main() {
	vec4 cA = projectionMatrix * viewMatrix * vec4( uCentro + aA, 1.0 );
	vec4 cB = projectionMatrix * viewMatrix * vec4( uCentro + aB, 1.0 );
	vec4 c = aForma.x < 0.5 ? cA : cB;
	vLado = aForma.y;
	vAlfa = aForma.w;
	// Detrás de la cámara: nada.
	if ( cA.w <= 0.05 || cB.w <= 0.05 ) {
		vAncho = 1.0;
		vTexto = 0.0;
		vAlfa = 0.0;
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		return;
	}
	vec2 mitad = uResolucion * 0.5;
	vec2 sA = cA.xy / cA.w * mitad;
	vec2 sB = cB.xy / cB.w * mitad;
	vec2 d = sB - sA;
	float l = length( d );
	vec2 dir = l > 1e-3 ? d / l : vec2( 1.0, 0.0 );
	vec2 normal = vec2( - dir.y, dir.x );
	float medio = ${f(DIBUJO.arco.halo)} * uPixel * aForma.z;
	// Cada tramo se alarga medio ancho en sus puntas: las juntas de un camino quebrado no dejan muescas.
	vec2 s = ( aForma.x < 0.5 ? sA - dir * medio * 0.5 : sB + dir * medio * 0.5 ) + normal * aForma.y * medio;
	vAncho = medio;
	vTexto = adentroDelTexto( c.xy / c.w );
	gl_Position = vec4( s / mitad * c.w, c.z, c.w );
}
`

export const FRAGMENTOS_DE_LOS_ARCOS = /* glsl */ `
varying float vLado;
varying float vAncho;
varying float vAlfa;
varying float vTexto;
uniform float uPixel;
${COLOR}
void main() {
	float x = abs( vLado ) * vAncho;
	float nucleo = exp( - pow( x / ( ${f(DIBUJO.arco.nucleo)} * uPixel ), 2.0 ) );
	float halo = exp( - pow( x / ( vAncho * 0.42 ), 2.0 ) ) * mix( 0.5, 0.5, uNoche );
	float a = min( 1.0, ( nucleo + halo ) * vAlfa * ( 1.0 - uApagado ) * ( 1.0 - ${f(DIBUJO.texto)} * vTexto ) );
	if ( a < 0.004 ) discard;
	vec3 color = mix( mix( uColorDia, uColorNoche, uNoche ), mix( uHaloDia, uHaloNoche, uNoche ), halo / max( 1e-3, nucleo + halo ) );
	gl_FragColor = vec4( color * a, a * ( 1.0 - uNoche ) );
}
`
