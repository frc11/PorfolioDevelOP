import { AL_TONO, COMUN, PALETA_GLSL, SALIDA, f } from './comun'

/**
 * [PULIDO 16] N2 · LOS SOMBREADORES DE LOS ARCOS Y DE LOS EFECTOS (`docs/rediseno/PLASMA.md`).
 *   · LOS ARCOS (y los enlaces y las líneas de campo, que usan la misma malla de tramos): un cuadrado por tramo con el ancho en px
 *     de la pantalla: el NÚCLEO fino de cada golpe, su halo y el RESPLANDOR residual del canal (más ancho y tenue). De día, en
 *     tinta con un núcleo blanco; de noche, luz (el núcleo pasa por el tono y se va al blanco). En DOS PASADAS con la misma
 *     geometría (`uCapa`): primero la tinta y el resplandor de todos los tramos, después los núcleos; de día la tinta de un tramo
 *     tapaba el núcleo del anterior en cada junta (un núcleo punteado). De noche suman: da lo mismo.
 *   · LOS EFECTOS (instanciados): el brillo en el PISO debajo de cada arco (de noche), el destello donde un arco toca el LOGO, el
 *     ANILLO del pulso del clic y el HALO del puntero que se carga.
 * Sobre un texto se apagan (pasan por detrás).
 */
export const TRAZO = {
  /** El medio ancho del halo de un arco y el del núcleo (px de CSS). */
  halo: 6,
  nucleo: 0.9,
} as const

export const VERTICES_DE_LOS_ARCOS = /* glsl */ `
attribute vec3 aA;
attribute vec3 aB;
attribute vec4 aForma;
attribute vec2 aExtra;
varying float vLado;
varying float vAncho;
varying float vGolpe;
varying float vResidual;
varying float vTexto;
uniform float uCapa;
${COMUN}
void main() {
	vec4 cA = projectionMatrix * viewMatrix * vec4( uCentro + aA, 1.0 );
	vec4 cB = projectionMatrix * viewMatrix * vec4( uCentro + aB, 1.0 );
	vec4 c = aForma.x < 0.5 ? cA : cB;
	vLado = aForma.y;
	vGolpe = aForma.w;
	vResidual = aExtra.x;
	// Detrás de la cámara: nada.
	if ( cA.w <= 0.05 || cB.w <= 0.05 ) {
		vAncho = 1.0;
		vTexto = 0.0;
		vGolpe = 0.0;
		vResidual = 0.0;
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
	float medio = ${f(TRAZO.halo)} * uPixel * aForma.z;
	// Cada tramo se alarga en sus puntas (las juntas de un camino quebrado no dejan muescas): la tinta, medio ancho; el núcleo, lo que mide.
	float punta = uCapa < 0.5 ? medio * 0.5 : ${f(TRAZO.nucleo)} * uPixel * 1.2;
	vec2 s = ( aForma.x < 0.5 ? sA - dir * punta : sB + dir * punta ) + normal * aForma.y * medio;
	vAncho = medio;
	vTexto = adentroDelTexto( c.xy / c.w );
	gl_Position = vec4( s / mitad * c.w, c.z, c.w );
}
`

export const FRAGMENTOS_DE_LOS_ARCOS = /* glsl */ `
varying float vLado;
varying float vAncho;
varying float vGolpe;
varying float vResidual;
varying float vTexto;
${COMUN}
${PALETA_GLSL}
${AL_TONO}
uniform vec3 uArcoNoche;
uniform float uCapa;
void main() {
	float x = abs( vLado ) * vAncho;
	float nucleo = exp( - pow( x / ( ${f(TRAZO.nucleo)} * uPixel ), 2.0 ) ) * vGolpe;
	float halo = exp( - pow( x / ( vAncho * 0.42 ), 2.0 ) );
	float resplandor = exp( - pow( x / ( vAncho * 0.75 ), 2.0 ) );
	// La capa 0: la tinta (de día) y la luz del halo y del resplandor (de noche). La capa 1: el núcleo (blanco de día; luz fuerte de noche).
	float tinta = min( 1.0, halo * 0.6 * vGolpe + resplandor * 0.3 * vResidual );
	float blanco = min( 1.0, nucleo );
	float aDia = uCapa < 0.5 ? tinta : blanco;
	vec3 colorDia = uCapa < 0.5 ? uNucleoDia : uBordeDia;
	vec3 luzNoche = uCapa < 0.5 ? uArcoNoche * ( halo * 0.55 * vGolpe + resplandor * 0.5 * vResidual ) : uNucleoNoche * nucleo * 3.2;
	float vis = 1.0 - ${f(0.95)} * vTexto;
	vis *= 1.0 - uApagado;
	${SALIDA}
}
`

/** Los efectos: el brillo del piso, el destello en el logo, el anillo del pulso y el halo del puntero que se carga. */
export const EFECTO = { piso: 0, logo: 1, anillo: 2, halo: 3 } as const
export const EFECTOS = { cuantos: 18 } as const

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
${PALETA_GLSL}
${AL_TONO}
uniform vec3 uArcoNoche;
void main() {
	float r = length( vLocal );
	float tipo = vEfecto.x;
	float k = vEfecto.z;
	float t = vEfecto.w;
	vec3 colorDia = uBordeDia;
	float aDia = 0.0;
	vec3 luzNoche = vec3( 0.0 );
	if ( tipo < 0.5 ) {
		// El piso iluminado por el arco (de noche: de día, sobre el papel, no se ve).
		luzNoche = uArcoNoche * exp( - r * r * 3.2 ) * k * 0.55;
	} else if ( tipo < 1.5 ) {
		// Donde el arco toca el logo: un destello.
		float g = exp( - r * r * 5.0 ) * k;
		aDia = g * 0.75;
		luzNoche = ( uNucleoNoche * 1.6 + uArcoNoche ) * g;
	} else if ( tipo < 2.5 ) {
		// El anillo del pulso: crece y se apaga.
		float radio = 0.25 + 0.72 * t;
		float anillo = exp( - pow( ( r - radio ) / ( 0.035 + 0.05 * t ), 2.0 ) ) * pow( 1.0 - t, 1.6 ) * k;
		colorDia = uNucleoDia;
		aDia = anillo * 0.8;
		luzNoche = uArcoNoche * anillo * 1.3;
	} else {
		// El halo del puntero que se carga: una luz suave y un anillo que late, más grandes con la carga.
		float pulsa = 0.55 + 0.08 * sin( uTiempo * 7.0 );
		float anillo = exp( - pow( ( r - pulsa ) / 0.05, 2.0 ) ) * k;
		float suave = exp( - r * r * 4.0 ) * k;
		colorDia = mix( uNucleoDia, uBordeDia, suave / max( 1e-3, suave + anillo ) );
		aDia = min( 1.0, anillo * 0.8 + suave * 0.45 );
		luzNoche = uArcoNoche * ( anillo * 1.2 + suave * 0.7 );
	}
	float vis = ( 1.0 - ${f(0.95)} * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`
