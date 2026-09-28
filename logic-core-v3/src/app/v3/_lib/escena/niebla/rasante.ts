import { FLOOR_Y } from '../probeScene'
import { FORMACION } from '../formacion/enFormacion'

/**
 * [ESCENA 7] T8 · LA NIEBLA DE AFUERA — 6c y 6d, un solo efecto, encendido en el producto. Puro.
 *
 * **La niebla.** Bancos bajos que ruedan despacio sobre el piso de la formación, tapando y destapando las
 * copias. Es la que ESCONDE LAS FILAS DE ATRÁS para que no llamen la atención: cerca del escenario es
 * apenas un velo al pie de la primera fila, y hacia afuera se hace más densa y más alta, hasta tragarse
 * las filas del fondo. No son planos ni sprites: la niebla es una DENSIDAD en el espacio (un ruido de valor
 * que gira muy lento alrededor del círculo y cambia con el tiempo, con la altura de cada banco también de
 * ruido), y cada superficie de afuera —las copias, el piso de abajo— integra esa densidad a lo largo de su
 * propio rayo desde la cámara, en `pasos` tramos corridos por píxel (sin escalones; en las copias, que
 * son chicas en pantalla, por vértice). Así una copia de la décima fila recibe la niebla que tiene delante
 * y la de la primera, la suya: la profundidad entre filas es la de verdad, y no hay bordes de plano ni una
 * textura que se repita. El color es el de la bruma de la sala (de día clara, de noche oscura).
 *
 * **Se abre con la velocidad (6d).** Con el scroll rápido la niebla se adelgaza (la de los bancos y la de
 * las copias) y la formación se entrevé entera; al frenar se vuelve a posar rápido. `uAbre` es esa apertura,
 * 0–1, y la escribe `Formacion.tsx`.
 */
/** Lo que comparten las superficies de afuera: la apertura con la velocidad. */
export const NIEBLA_DE_AFUERA = { uAbre: { value: 0 } }

export const RASANTE = {
  /** Dónde hay niebla: del borde del escenario hacia afuera (con su fundido), hasta el final del piso. */
  desde: FORMACION.radioDelEscenario + 1,
  hasta: FORMACION.radioDelPisoDeAbajo,
  /**
   * La altura de un banco sobre el piso de abajo: la mínima, lo que suma el ruido, y cuánto más alto es en
   * el fondo (u). Adelante le llega a la rodilla a la primera fila; atrás, tapa copias enteras.
   */
  alto: { minimo: 1.6, suma: 2.4, fondo: 3.4 },
  /** De dónde a dónde la niebla se hace densa y alta (radio, u). */
  crece: [58, 150],
  /** La escala de los bancos (1/u), cuánto tapa un banco lleno (por unidad) adelante y atrás, y qué parte del piso ocupan. */
  escala: 0.05,
  densidad: { adelante: 0.55, fondo: 1.2 },
  umbral: [0.4, 0.62],
  /** Rueda: vuelta alrededor del círculo (rad/s) y cuánto cambia la forma (1/s). */
  gira: 0.012,
  cambia: 0.035,
  pasos: 12,
  /** Hasta dónde integra un rayo (u): más allá la niebla ya tapó todo. */
  largo: 170,
  /** 6d: cuánto se abre cada niebla con la velocidad plena. */
  abre: { neblina: 0.6, rasante: 0.85 },
} as const

/** El corrimiento por píxel de los tramos (ruido de gradiente entrelazado): sólo en un fragmento. */
export const CORRIDO_POR_PIXEL = 'fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) )'

const f = (x: number): string => x.toFixed(4)

/**
 * `transmitanciaRasante( camara, mundo, abre, corrido )`: qué parte de la superficie en `mundo` llega a
 * la cámara a través de los bancos (1 sin niebla). Pide `uTiempo`. `corrido` (0–1) corre los tramos: por
 * píxel, `CORRIDO_POR_PIXEL` (sin escalones); por vértice, 0,5.
 */
export const RASANTE_GLSL = /* glsl */ `
float azarRasante( vec3 p ) { return fract( sin( dot( p, vec3( 127.1, 311.7, 74.7 ) ) ) * 43758.5453 ); }
float ruidoRasante( vec3 p ) {
	vec3 i = floor( p );
	vec3 f = fract( p );
	vec3 u = f * f * ( 3.0 - 2.0 * f );
	float a = mix( mix( azarRasante( i ), azarRasante( i + vec3( 1, 0, 0 ) ), u.x ), mix( azarRasante( i + vec3( 0, 1, 0 ) ), azarRasante( i + vec3( 1, 1, 0 ) ), u.x ), u.y );
	float b = mix( mix( azarRasante( i + vec3( 0, 0, 1 ) ), azarRasante( i + vec3( 1, 0, 1 ) ), u.x ), mix( azarRasante( i + vec3( 0, 1, 1 ) ), azarRasante( i + vec3( 1, 1, 1 ) ), u.x ), u.y );
	return mix( a, b, u.z );
}
float densidadRasante( vec3 p ) {
	float r = length( p.xz );
	float anillo = smoothstep( ${f(RASANTE.desde)}, ${f(RASANTE.desde + 4)}, r ) * ( 1.0 - smoothstep( ${f(RASANTE.hasta - 10)}, ${f(RASANTE.hasta)}, r ) );
	if ( anillo <= 0.0 ) return 0.0;
	// Gira despacio alrededor del círculo, y cambia de forma con el tiempo.
	float a = uTiempo * ${f(RASANTE.gira)};
	vec2 q = mat2( cos( a ), sin( a ), - sin( a ), cos( a ) ) * p.xz * ${f(RASANTE.escala)};
	float z = uTiempo * ${f(RASANTE.cambia)};
	float banco = 0.65 * ruidoRasante( vec3( q, z ) ) + 0.35 * ruidoRasante( vec3( q * 2.3 + 11.0, z * 1.7 ) );
	float hay = smoothstep( ${f(RASANTE.umbral[0])}, ${f(RASANTE.umbral[1])}, banco );
	// Hacia el fondo, más densa y más alta: la que esconde las filas de atrás.
	float fondo = smoothstep( ${f(RASANTE.crece[0])}, ${f(RASANTE.crece[1])}, r );
	float alto = ${f(RASANTE.alto.minimo)} + ${f(RASANTE.alto.suma)} * ruidoRasante( vec3( q * 1.3 + 5.0, z * 0.6 ) ) + ${f(RASANTE.alto.fondo)} * fondo;
	float h = p.y - ${f(FLOOR_Y - FORMACION.desnivel)};
	float perfil = 1.0 - smoothstep( 0.25 * alto, alto, h );
	return mix( ${f(RASANTE.densidad.adelante)}, ${f(RASANTE.densidad.fondo)}, fondo ) * anillo * hay * perfil * step( - 0.2, h );
}
float transmitanciaRasante( vec3 camara, vec3 mundo, float abre, float corrido ) {
	vec3 d = mundo - camara;
	float largo = length( d );
	d /= max( largo, 1e-4 );
	// Donde el rayo entra al anillo de la niebla (la cámara está adentro de la trama).
	float a = dot( d.xz, d.xz );
	float b = 2.0 * dot( camara.xz, d.xz );
	float c = dot( camara.xz, camara.xz ) - ${f(RASANTE.desde * RASANTE.desde)};
	float entra = a > 1e-6 ? ( - b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a ) : largo;
	if ( entra >= largo ) return 1.0;
	float tramo = min( largo - entra, ${f(RASANTE.largo)} ) / ${RASANTE.pasos.toFixed(1)};
	float optica = 0.0;
	for ( int i = 0; i < ${RASANTE.pasos}; i++ ) {
		vec3 p = camara + d * ( entra + ( float( i ) + corrido ) * tramo );
		optica += densidadRasante( p ) * tramo;
	}
	return exp( - optica * ( 1.0 - ${f(RASANTE.abre.rasante)} * abre ) );
}
`
