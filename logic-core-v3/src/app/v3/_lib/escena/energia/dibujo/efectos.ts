import { AL_TONO, COMUN, SALIDA, f } from './comun'

/**
 * [PULIDO 17] O3 · LOS EFECTOS DE LA ENERGÍA (`docs/rediseno/PLASMA.md`), instanciados, todos gaussianos (ninguna figura: ni anillos
 * ni halos dibujados alrededor del cursor):
 *   · el PISO, debajo de cada arco, se ilumina un instante (de noche: de día, sobre el papel, no se ve);
 *   · el LOGO: donde un arco lo toca, un destello.
 * (La luz de la CARGA del puntero se fue: era un disco sobre el logo. La carga se ve en cómo se juntan y se calientan las partículas.)
 * Sobre un texto se apagan.
 */
export const EFECTO = { piso: 0, logo: 1 } as const
export const EFECTOS = { cuantos: 14 } as const

export const VERTICES_DE_LOS_EFECTOS = /* glsl */ `
attribute vec3 aLugar;
attribute vec4 aEfecto;
varying vec2 vLocal;
varying vec4 vEfecto;
varying float vTexto;
${COMUN}
void main() {
	float tipo = aEfecto.x;
	vec3 mundo = uCentro + aLugar;
	vec4 clip;
	if ( tipo < 0.5 ) {
		// En el piso: un disco acostado.
		clip = projectionMatrix * viewMatrix * vec4( mundo + vec3( position.x, 0.0, position.y ) * aEfecto.y, 1.0 );
	} else {
		// De frente a la cámara: su radio del mundo a su distancia.
		vec4 mv = viewMatrix * vec4( mundo, 1.0 );
		clip = projectionMatrix * mv;
		float radioPx = uEscalaPx * aEfecto.y / max( 0.5, - mv.z );
		clip.xy += position.xy * radioPx / ( uResolucion * 0.5 ) * clip.w;
	}
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
	} else {
		float g = exp( - r2 * 5.0 ) * k;
		colorDia = uClaroDia;
		aDia = g * 0.7;
		luzNoche = uLuzNoche * g * 2.2;
	}
	float vis = ( 1.0 - ${f(0.95)} * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`
