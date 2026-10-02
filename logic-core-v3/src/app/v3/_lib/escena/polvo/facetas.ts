/**
 * [CIERRE RETOQUE 3D] P1 · EL POLVO EN FACETAS — la variante b del RETOQUE 3D, al producto (la a y la c se borraron, con
 * su bandera): el idioma de los bloques del piso, un cuadradito que gira despacio (cada uno a su ritmo), con cuatro caras
 * que la luz pega distinto y un destello cuando una cara mira a la luz. Cambia sólo cuántas motas se ven, su tamaño, su
 * brillo y su forma: la posición la sigue escribiendo la física (la estela, la inercia del aire, el posarse, el
 * obstáculo), así que todo lo aprobado anda igual. Va con el polvo nítido (su lado en px CSS); el banco la apaga con
 * `facetas=no` (queda el perfil nítido de antes, `nitidez.ts`).
 */
export const FACETAS_DEL_POLVO = { quedan: 0.6, tam: [2.4, 4.4], vueltasPorS: [0.08, 0.35] } as const

const f = (x: number): string => x.toFixed(4)
const b = FACETAS_DEL_POLVO

export const FACETAS_PARS_GLSL = /* glsl */ `
#ifdef POLVO_FACETAS
	varying float vGiroDelPolvo;
#endif
`

/** En el vértice, después del lado nítido: cuántas quedan, su lado (px del búfer) y su giro. */
export const FACETAS_VERTEX_GLSL = /* glsl */ `
#ifdef POLVO_FACETAS
{
	float azarV = fract( sin( dot( position, vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );
	float azarW = fract( sin( dot( position, vec3( 93.989, 67.345, 24.123 ) ) ) * 24634.6345 );
	vParejo *= 1.0 - smoothstep( ${f(b.quedan - 0.02)}, ${f(b.quedan + 0.02)}, azarW );
	vLadoN = mix( ${f(b.tam[0])}, ${f(b.tam[1])}, azarV ) * uPixel;
	vDesenfoque = 0.0;
	vGiroDelPolvo = 6.2832 * ( uTiempo * mix( ${f(b.vueltasPorS[0])}, ${f(b.vueltasPorS[1])}, azarW ) * ( azarV > 0.5 ? 1.0 : -1.0 ) + azarV );
	// Un cuadrado girado necesita la diagonal del punto.
	gl_PointSize = max( vLadoN * 1.42, 1.0 );
}
#endif
`

/** En el fragmento, en lugar del perfil nítido: el cuadradito girado, sus cuatro caras y su destello. */
export const FACETAS_FRAGMENT_GLSL = /* glsl */ `
	{
		vec2 pV = gl_PointCoord - 0.5;
		float cV = cos( vGiroDelPolvo );
		float sV = sin( vGiroDelPolvo );
		vec2 qV = mat2( cV, - sV, sV, cV ) * pV * 1.42;
		vec2 aV = abs( qV );
		float ladoV = max( aV.x, aV.y );
		float formaV = 1.0 - smoothstep( 0.5 - 1.0 / max( vLadoN, 1.0 ), 0.5, ladoV );
		// Cuatro caras (una pirámide chata): la normal de la cara de este píxel, en la pantalla, contra la luz.
		vec2 caraV = aV.x > aV.y ? vec2( sign( qV.x ), 0.0 ) : vec2( 0.0, sign( qV.y ) );
		vec2 enPantallaV = mat2( cV, sV, - sV, cV ) * caraV;
		float luzV = max( dot( enPantallaV, vec2( 0.6, 0.8 ) ), 0.0 );
		diffuseColor.rgb = diffuseColor.rgb * ( 0.45 + 0.55 * luzV ) + vec3( pow( luzV, 24.0 ) * 0.7 );
		diffuseColor.a *= formaV * ( 0.7 + 0.3 * luzV ) * min( 1.0, vLadoN * vLadoN );
	}
`
