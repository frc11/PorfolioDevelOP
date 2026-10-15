import { POBLACION } from '../poblacion'
import { AL_TONO, COMUN, SALIDA, f } from './comun'

/**
 * [PULIDO 17] O3 · LOS EFECTOS DE LA ENERGÍA (`docs/rediseno/PLASMA.md`), instanciados, todos gaussianos (ninguna figura: ni anillos
 * ni halos dibujados alrededor del cursor):
 *   · el PISO, debajo de cada arco, se ilumina un instante (de noche: de día, sobre el papel, no se ve);
 *   · el LOGO: donde un arco lo toca, un destello;
 *   · [PULIDO 27] Z1 · la EXPLOSIÓN de una brasa que muere (`poblacion.ts`): un destello chico en su lugar y chispas sueltas, cada una
 *     con su rapidez, su largo y su brillo, que salen rápido, frenan, caen un poco y se apagan, con la cabeza más brillante que la cola
 *     (de noche luz; de día, grafito). Su edad (0 a 1) en el cuarto número.
 * (La luz de la CARGA del puntero se fue: era un disco sobre el logo. La carga se ve en cómo se juntan y se calientan las partículas.)
 * Sobre un texto se apagan.
 */
export const EFECTO = { piso: 0, logo: 1, explosion: 2 } as const
/** Los lugares: los del piso y del logo (por los arcos) y los de las explosiones. */
export const EFECTOS = { cuantos: 14 + POBLACION.explosion.cuantas } as const
/**
 * [PULIDO 27] Z1 · la explosión: cuántas chispas, su ancho (px), su luz (de noche) y su tinta (de día), cuánto caen (partes del radio) y el
 * destello del principio (cuánto y cuánto dura, en partes de la explosión).
 */
export const EXPLOSION = { chispas: 6, ancho: 0.9, luz: 3, tinta: 0.75, caen: 0.2, destello: 2.6, destelloDura: 0.12 } as const
const X = EXPLOSION

export const VERTICES_DE_LOS_EFECTOS = /* glsl */ `
attribute vec3 aLugar;
attribute vec4 aEfecto;
varying vec2 vLocal;
varying vec4 vEfecto;
varying float vTexto;
varying float vRadioPx;
varying float vSemilla;
${COMUN}
void main() {
	float tipo = aEfecto.x;
	vec3 mundo = aLugar;
	vec4 clip;
	vRadioPx = 1.0;
	if ( tipo < 0.5 ) {
		// En el piso: un disco acostado.
		clip = projectionMatrix * viewMatrix * vec4( mundo + vec3( position.x, 0.0, position.y ) * aEfecto.y, 1.0 );
	} else {
		// De frente a la cámara: su radio del mundo a su distancia.
		vec4 mv = viewMatrix * vec4( mundo, 1.0 );
		clip = projectionMatrix * mv;
		float radioPx = uEscalaPx * aEfecto.y / max( 0.5, - mv.z );
		clip.xy += position.xy * radioPx / ( uResolucion * 0.5 ) * clip.w;
		vRadioPx = radioPx;
	}
	vSemilla = fract( sin( dot( mundo, vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );
	vTexto = tipo < 0.5 ? 0.0 : adentroDelTexto( clip.xy / clip.w );
	gl_Position = clip;
	vLocal = position.xy;
	vEfecto = aEfecto;
}
`

export const FRAGMENTOS_DE_LOS_EFECTOS = /* glsl */ `
varying vec2 vLocal;
varying vec4 vEfecto;
varying float vTexto;
varying float vRadioPx;
varying float vSemilla;
${COMUN}
${AL_TONO}
void main() {
	float r2 = dot( vLocal, vLocal );
	float tipo = vEfecto.x;
	float k = vEfecto.z;
	vec3 colorDia = uTintaDia;
	float aDia = 0.0;
	vec3 luzNoche = vec3( 0.0 );
	if ( tipo < 0.5 ) {
		luzNoche = uLuzNoche * exp( - r2 * 3.2 ) * k * ${f(0.09)};
	} else if ( tipo < 1.5 ) {
		float g = exp( - r2 * 5.0 ) * k;
		colorDia = uClaroDia;
		aDia = g * 0.7;
		luzNoche = uLuzNoche * g * 2.2;
	} else {
		// La explosión: cada chispa, un tramo suelto que sale del punto (rápido, frenando y cayendo un poco), con la cabeza más brillante
		// que la cola, su rapidez y su brillo; todas se apagan. Un destello chico al empezar.
		float t = vEfecto.w;
		float chispas = 0.0;
		vec2 q = vLocal + vec2( 0.0, ${f(X.caen)} * t * t );
		for ( int j = 0; j < ${String(X.chispas)}; j ++ ) {
			float fj = float( j );
			float h1 = fract( vSemilla * ( 7.31 + fj * 3.17 ) );
			float h2 = fract( vSemilla * ( 5.13 + fj * 1.91 ) );
			float h3 = fract( vSemilla * ( 2.71 + fj * 4.47 ) );
			float a = 6.2831853 * ( ( fj + 0.9 * h1 ) / ${f(X.chispas)} + vSemilla );
			vec2 dir = vec2( cos( a ), sin( a ) );
			float cabeza = ( 0.5 + 0.45 * h2 ) * ( 1.0 - ( 1.0 - t ) * ( 1.0 - t ) * ( 1.0 - t ) );
			float cola = cabeza * ( 0.55 + 0.3 * t );
			float s = clamp( dot( q, dir ), cola, cabeza );
			float d = length( q - dir * s ) * vRadioPx / uPixel;
			chispas += exp( - d * d / ${f(X.ancho * X.ancho)} ) * mix( 0.3, 1.0, ( s - cola ) / max( 1e-3, cabeza - cola ) ) * ( 0.45 + 0.55 * h3 );
		}
		float vive = pow( 1.0 - t, 1.5 );
		float destello = exp( - r2 * 40.0 ) * exp( - t / ${f(X.destelloDura)} ) * ${f(X.destello)};
		luzNoche = uLuzNoche * ( chispas * vive * ${f(X.luz)} + destello ) * k;
		aDia = min( 0.6, ( chispas * vive + destello * 0.4 ) * k * ${f(X.tinta)} );
	}
	float vis = ( 1.0 - ${f(0.95)} * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`
