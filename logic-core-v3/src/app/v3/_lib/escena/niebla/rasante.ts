import { FLOOR_Y } from '../probeScene'
import { FORMACION } from '../formacion/enFormacion'

/**
 * [ESCENA 6] 6c · LA NIEBLA RASANTE, y 6d · LA NIEBLA QUE SE ABRE CON LA VELOCIDAD — puro.
 *
 * **6c.** Bancos de niebla bajos que ruedan despacio sobre el piso de afuera (el de la formación),
 * tapando y destapando partes de las copias. No son planos ni sprites: la niebla es una DENSIDAD en el
 * espacio (un ruido de valor que gira muy lento alrededor del círculo y cambia con el tiempo, con la
 * altura de cada banco también de ruido), y cada superficie de afuera —las copias, el piso de abajo,
 * el ciclorama— integra esa densidad a lo largo de su propio rayo desde la cámara, en `pasos` tramos
 * con un corrimiento por píxel (sin escalones). Así una copia de la tercera fila recibe la niebla que
 * tiene delante y la de la primera, la suya: la profundidad entre filas es la de verdad, y no hay
 * bordes de plano ni una textura que se repita. El color es el de la bruma de la sala (de día clara,
 * de noche oscura).
 *
 * **6d.** Con el scroll rápido la niebla de afuera se adelgaza (la de las copias, `NEBLINA`, y la
 * rasante) y la formación se entrevé; al frenar se cierra, con la familia de inercia de E6. `uAbre` es
 * esa apertura, 0–1.
 */
/** Lo que comparten las superficies de afuera: la apertura de 6d (0 sin la prueba). */
export const NIEBLA_DE_AFUERA = { uAbre: { value: 0 } }

export const RASANTE = {
  /** Dónde hay niebla: del borde del escenario hacia afuera (con su fundido). */
  desde: FORMACION.radioDelEscenario + 1,
  hasta: 92,
  /** La altura de un banco sobre el piso de abajo: mínima y lo que suma el ruido (u). */
  alto: { minimo: 1.4, suma: 3.0 },
  /** La escala de los bancos (1/u), cuánto se tapa en un banco lleno (por unidad) y qué parte del piso ocupan. */
  escala: 0.05,
  densidad: 0.45,
  umbral: [0.38, 0.72],
  /** Rueda: vuelta alrededor del círculo (rad/s) y cuánto cambia la forma (1/s). */
  gira: 0.012,
  cambia: 0.035,
  pasos: 12,
  /** 6d: cuánto se abre cada niebla con la velocidad plena. */
  abre: { neblina: 0.7, rasante: 0.85 },
} as const

/** El corrimiento por píxel de los tramos (ruido de gradiente entrelazado): sólo en un fragmento. */
export const CORRIDO_POR_PIXEL = 'fract( 52.9829189 * fract( dot( gl_FragCoord.xy, vec2( 0.06711056, 0.00583715 ) ) ) )'

/**
 * `transmitanciaRasante( camara, mundo, abre, corrido )`: qué parte de la superficie en `mundo` llega a
 * la cámara a través de los bancos (1 sin niebla). Pide `uTiempo`. `corrido` (0–1) corre los tramos:
 * por píxel, `CORRIDO_POR_PIXEL` (sin escalones); por vértice, 0,5.
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
	float anillo = smoothstep( ${RASANTE.desde.toFixed(1)}, ${(RASANTE.desde + 4).toFixed(1)}, r ) * ( 1.0 - smoothstep( ${(RASANTE.hasta - 10).toFixed(1)}, ${RASANTE.hasta.toFixed(1)}, r ) );
	if ( anillo <= 0.0 ) return 0.0;
	// Gira despacio alrededor del círculo, y cambia de forma con el tiempo.
	float a = uTiempo * ${RASANTE.gira.toFixed(4)};
	vec2 q = mat2( cos( a ), sin( a ), - sin( a ), cos( a ) ) * p.xz * ${RASANTE.escala.toFixed(3)};
	float z = uTiempo * ${RASANTE.cambia.toFixed(3)};
	float banco = 0.65 * ruidoRasante( vec3( q, z ) ) + 0.35 * ruidoRasante( vec3( q * 2.3 + 11.0, z * 1.7 ) );
	float hay = smoothstep( ${RASANTE.umbral[0].toFixed(2)}, ${RASANTE.umbral[1].toFixed(2)}, banco );
	float suelo = ${(FLOOR_Y - FORMACION.desnivel).toFixed(4)};
	float alto = ${RASANTE.alto.minimo.toFixed(2)} + ${RASANTE.alto.suma.toFixed(2)} * ruidoRasante( vec3( q * 1.3 + 5.0, z * 0.6 ) );
	float h = p.y - suelo;
	float perfil = 1.0 - smoothstep( 0.25 * alto, alto, h );
	return ${RASANTE.densidad.toFixed(3)} * anillo * hay * perfil * step( - 0.2, h );
}
float transmitanciaRasante( vec3 camara, vec3 mundo, float abre, float corrido ) {
	vec3 d = mundo - camara;
	float largo = length( d );
	d /= max( largo, 1e-4 );
	// Donde el rayo entra al anillo de la niebla (la cámara está adentro de la trama).
	float a = dot( d.xz, d.xz );
	float b = 2.0 * dot( camara.xz, d.xz );
	float c = dot( camara.xz, camara.xz ) - ${(RASANTE.desde * RASANTE.desde).toFixed(1)};
	float entra = a > 1e-6 ? ( - b + sqrt( max( b * b - 4.0 * a * c, 0.0 ) ) ) / ( 2.0 * a ) : largo;
	if ( entra >= largo ) return 1.0;
	float tramo = min( largo - entra, 60.0 ) / ${RASANTE.pasos.toFixed(1)};
	float optica = 0.0;
	for ( int i = 0; i < ${RASANTE.pasos}; i++ ) {
		vec3 p = camara + d * ( entra + ( float( i ) + corrido ) * tramo );
		optica += densidadRasante( p ) * tramo;
	}
	return exp( - optica * ( 1.0 - ${RASANTE.abre.rasante.toFixed(2)} * abre ) );
}
`
