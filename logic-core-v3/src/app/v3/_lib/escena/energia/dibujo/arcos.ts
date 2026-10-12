import * as THREE from 'three'

import { AL_TONO, COMUN, SALIDA, f } from './comun'

/**
 * [PULIDO 17] O3 · LOS ARCOS, UN CANAL DE LUZ (`docs/rediseno/PLASMA.md`): una tira continua por camino (`arcos/cinta.ts`) que el
 * sombreador abre en la pantalla a los dos lados de cada punto, con la unión en inglete (el ancho en px de la pantalla: un canal fino
 * se ve fino lejos y cerca). El canal tiene tres capas gaussianas: el NÚCLEO fino de cada golpe, su HALO y el RESPLANDOR residual
 * (más ancho y tenue: lo que queda entre golpe y golpe). Menos dibujado que un trazo: las puntas se afinan hasta casi nada, la luz
 * CORRE por el canal (una ondulación del brillo a lo largo que se mueve) y las ramas son más tenues. De día, el halo es energía
 * oscura (grafito muy translúcido y ancho: el marco que deja ver el núcleo) y el núcleo, más blanco que el papel (o tinta, con
 * `uArcoDia.w`): en DOS PASADAS (`uCapa`): primero lo oscuro, después los núcleos. De noche suman. Sobre un texto, nada.
 */
export const TRAZO = {
  /** El medio ancho del canal (px de CSS, por el ancho de su clase), el del núcleo (px), cuánto corre la luz y cuánto se afinan las puntas. */
  uArcoForma: [11, 0.85, 0.3, 1],
  /** De día: cuánto tapa el halo oscuro, el resplandor oscuro, el núcleo y su color (0 blanco, 1 tinta). */
  uArcoDia: [0.22, 0.1, 1, 0],
  /** De noche: la luz del halo, la del resplandor y la del núcleo. */
  uArcoNoche: [0.16, 0.18, 1.7, 0],
} as const

export type NombreDelTrazo = keyof typeof TRAZO

export function uniformesDelTrazo(): Record<NombreDelTrazo, { value: THREE.Vector4 }> {
  const v = (n: NombreDelTrazo): { value: THREE.Vector4 } => ({ value: new THREE.Vector4(TRAZO[n][0], TRAZO[n][1], TRAZO[n][2], TRAZO[n][3]) })
  return { uArcoForma: v('uArcoForma'), uArcoDia: v('uArcoDia'), uArcoNoche: v('uArcoNoche') }
}

const TRAZO_GLSL = /* glsl */ `
uniform vec4 uArcoForma;
uniform vec4 uArcoDia;
uniform vec4 uArcoNoche;
uniform float uCapa;
`

export const VERTICES_DE_LOS_ARCOS = /* glsl */ `
attribute vec3 aPunto;
attribute vec3 aAntes;
attribute vec3 aDespues;
attribute vec4 aForma;
attribute vec4 aExtra;
varying float vLado;
varying float vAncho;
varying float vGolpe;
varying float vResidual;
varying float vTexto;
varying float vLargo;
varying float vSemilla;
varying float vRama;
${COMUN}
${TRAZO_GLSL}
vec2 enPantalla( vec4 c ) {
	return c.xy / c.w * uResolucion * 0.5;
}
void main() {
	vec4 c = projectionMatrix * viewMatrix * vec4( aPunto, 1.0 );
	vec4 cA = projectionMatrix * viewMatrix * vec4( aAntes, 1.0 );
	vec4 cD = projectionMatrix * viewMatrix * vec4( aDespues, 1.0 );
	vLado = aForma.x;
	vGolpe = aForma.z;
	vResidual = aForma.w;
	vLargo = aExtra.x;
	vSemilla = aExtra.y;
	vRama = aExtra.z;
	vTexto = 0.0;
	vAncho = 1.0;
	if ( aForma.y <= 0.0 || c.w <= 0.05 || cA.w <= 0.05 || cD.w <= 0.05 ) {
		gl_Position = vec4( 2.0, 2.0, 2.0, 1.0 );
		return;
	}
	vec2 s = enPantalla( c );
	vec2 a = enPantalla( cA );
	vec2 d = enPantalla( cD );
	// La tangente: el promedio de los dos tramos (o el que hay, en las puntas); el inglete, con tope (sin picos en los quiebres).
	vec2 t1 = s - a;
	vec2 t2 = d - s;
	t1 = length( t1 ) > 1e-3 ? normalize( t1 ) : vec2( 0.0 );
	t2 = length( t2 ) > 1e-3 ? normalize( t2 ) : vec2( 0.0 );
	vec2 t = t1 + t2;
	t = length( t ) > 1e-3 ? normalize( t ) : ( length( t1 ) > 0.0 ? t1 : vec2( 1.0, 0.0 ) );
	vec2 normal = vec2( - t.y, t.x );
	vec2 n1 = length( t1 ) > 0.0 ? vec2( - t1.y, t1.x ) : normal;
	float inglete = 1.0 / max( 0.5, dot( normal, n1 ) );
	// Las puntas se afinan (el canal hacia sus dos puntas; cada rama hacia la suya).
	float afina = vRama > 0.5 ? mix( 1.0, 0.15, vLargo ) : 0.12 + 0.88 * smoothstep( 0.0, 0.16, vLargo ) * smoothstep( 1.0, 0.84, vLargo );
	afina = mix( 1.0, afina, uArcoForma.w );
	float medio = ( uCapa < 0.5 ? uArcoForma.x * aForma.y : uArcoForma.y * 3.0 * max( 0.6, aForma.y ) ) * uPixel * afina;
	vAncho = medio;
	vTexto = adentroDelTexto( c.xy / c.w );
	gl_Position = vec4( ( s + normal * vLado * medio * inglete ) / ( uResolucion * 0.5 ) * c.w, c.z, c.w );
}
`

export const FRAGMENTOS_DE_LOS_ARCOS = /* glsl */ `
varying float vLado;
varying float vAncho;
varying float vGolpe;
varying float vResidual;
varying float vTexto;
varying float vLargo;
varying float vSemilla;
varying float vRama;
${COMUN}
${AL_TONO}
${TRAZO_GLSL}
void main() {
	float x = abs( vLado ) * vAncho;
	// La luz que corre por el canal: una ondulación a lo largo que se mueve rápido (no un brillo parejo de trazo).
	float corre = 1.0 - uArcoForma.z + uArcoForma.z * ( 0.5 + 0.5 * sin( vLargo * 23.0 - uTiempo * 41.0 + vSemilla ) * sin( vLargo * 9.0 + uTiempo * 17.0 + vSemilla * 1.3 ) );
	float rama = vRama > 0.5 ? 0.6 : 1.0;
	float nucleo = exp( - pow( x / ( uArcoForma.y * uPixel ), 2.0 ) ) * vGolpe * corre * rama;
	float halo = exp( - pow( x / ( vAncho * 0.45 ), 2.0 ) ) * vGolpe * corre * rama;
	float resplandor = exp( - pow( x / ( vAncho * 0.85 ), 2.0 ) ) * vResidual * rama;
	// La capa 0: la energía oscura (de día) y la luz del halo y del resplandor (de noche). La capa 1: el núcleo.
	float oscuro = min( 1.0, halo * uArcoDia.x + resplandor * uArcoDia.y );
	float blanco = min( 1.0, nucleo * uArcoDia.z );
	float aDia = uCapa < 0.5 ? oscuro : blanco;
	vec3 colorDia = uCapa < 0.5 ? uTintaDia : mix( uClaroDia, uTintaDia, uArcoDia.w );
	vec3 luzNoche = uCapa < 0.5 ? uLuzNoche * ( halo * uArcoNoche.x + resplandor * uArcoNoche.y ) : uLuzNoche * nucleo * uArcoNoche.z;
	float vis = ( 1.0 - ${f(0.95)} * vTexto ) * ( 1.0 - uApagado );
	${SALIDA}
}
`
