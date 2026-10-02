import { ORBIT_TARGET_Y } from '../probeScene'

/**
 * [RETOQUE 3D] LAS TRES VARIANTES DEL POLVO — pruebas para comparar (`?pruebas=polvo=a|b|c`; el producto es la de hoy):
 * a Valentino no le convencen ni la cantidad ni el aspecto («parecen muy de vibecoder»). Cambian sólo cuántas motas se
 * ven, su tamaño, su brillo y su forma: la posición la sigue escribiendo la física (la estela, la inercia del aire, el
 * posarse, el obstáculo), así que todo lo aprobado anda igual en las tres. Van con el polvo nítido (su lado en px CSS).
 *
 *   a · MENOS Y MEJOR — menos de la mitad de las motas; muchas chicas y pocas grandes, con brillos distintos; cada una una esfera
 *       chica (un centro iluminado desde arriba a la izquierda) y una profundidad de campo creíble: el foco está a la
 *       distancia del logo y se desenfocan las de adelante y, menos, las de atrás.
 *   b · FACETAS — el idioma de los bloques del piso: un cuadradito que gira despacio (cada uno a su ritmo), con cuatro
 *       caras que la luz pega distinto y un destello cuando una cara mira a la luz.
 *   c · AIRE CON TEXTURA — un velo de motas casi invisibles (un píxel, muy tenues) y unas pocas protagonistas (4 %) que se
 *       notan cerca de la cámara: grandes, suaves y claras; lejos, como el velo.
 */
export type VarianteDelPolvo = 'a' | 'b' | 'c'

export const VARIANTES_DEL_POLVO = {
  a: { quedan: 0.45, tam: [0.7, 2.8], brillo: [0.5, 1], desenfoque: 7 },
  b: { quedan: 0.6, tam: [2.4, 4.4], vueltasPorS: [0.08, 0.35] },
  c: { velo: { tam: [0.7, 1.1], brillo: [0.18, 0.34] }, protagonistas: { fraccion: 0.04, tam: [3, 9], cerca: [9, 3] } },
} as const

const f = (x: number): string => x.toFixed(4)
const { a, b, c } = VARIANTES_DEL_POLVO

/** El número de la variante para el `define` (1, 2, 3). */
export const NUMERO_DE_LA_VARIANTE: Readonly<Record<VarianteDelPolvo, number>> = { a: 1, b: 2, c: 3 }

export const VARIANTE_PARS_GLSL = /* glsl */ `
#ifdef POLVO_VARIANTE
	varying float vBrilloDelPolvo;
	varying float vGiroDelPolvo;
	varying float vProtagonista;
#endif
`

/** En el vértice, después del lado nítido: cuántas quedan, su lado (px del búfer), su brillo y su giro. */
export const VARIANTE_VERTEX_GLSL = /* glsl */ `
#ifdef POLVO_VARIANTE
{
	float azarV = fract( sin( dot( position, vec3( 12.9898, 78.233, 37.719 ) ) ) * 43758.5453 );
	float azarW = fract( sin( dot( position, vec3( 93.989, 67.345, 24.123 ) ) ) * 24634.6345 );
	float lejosV = max( - mvPosition.z, 0.1 );
	vBrilloDelPolvo = 1.0;
	vGiroDelPolvo = 0.0;
	vProtagonista = 0.0;
	#if POLVO_VARIANTE == 1
		vParejo *= 1.0 - smoothstep( ${f(a.quedan - 0.02)}, ${f(a.quedan + 0.02)}, azarW );
		float enFocoV = mix( ${f(a.tam[0])}, ${f(a.tam[1])}, pow( azarV, 2.2 ) );
		vBrilloDelPolvo = mix( ${f(a.brillo[0])}, ${f(a.brillo[1])}, pow( azarV, 0.7 ) );
		float focoV = length( cameraPosition - vec3( 0.0, ${f(ORBIT_TARGET_Y)}, 0.0 ) );
		float cocV = abs( 1.0 / lejosV - 1.0 / focoV ) * focoV * ${f(a.desenfoque)} * ( lejosV < focoV ? 1.0 : 0.4 );
		vLadoN = ( enFocoV + cocV ) * uPixel;
		vDesenfoque = cocV / ( cocV + enFocoV );
	#elif POLVO_VARIANTE == 2
		vParejo *= 1.0 - smoothstep( ${f(b.quedan - 0.02)}, ${f(b.quedan + 0.02)}, azarW );
		vLadoN = mix( ${f(b.tam[0])}, ${f(b.tam[1])}, azarV ) * uPixel;
		vDesenfoque = 0.0;
		vGiroDelPolvo = 6.2832 * ( uTiempo * mix( ${f(b.vueltasPorS[0])}, ${f(b.vueltasPorS[1])}, azarW ) * ( azarV > 0.5 ? 1.0 : -1.0 ) + azarV );
	#else
		vProtagonista = step( azarW, ${f(c.protagonistas.fraccion)} );
		float cercaV = 1.0 - smoothstep( ${f(c.protagonistas.cerca[1])}, ${f(c.protagonistas.cerca[0])}, lejosV );
		float veloV = mix( ${f(c.velo.tam[0])}, ${f(c.velo.tam[1])}, azarV );
		vLadoN = mix( veloV, mix( ${f(c.protagonistas.tam[0])}, ${f(c.protagonistas.tam[1])}, azarV ) * cercaV + veloV * ( 1.0 - cercaV ), vProtagonista ) * uPixel;
		vBrilloDelPolvo = mix( mix( ${f(c.velo.brillo[0])}, ${f(c.velo.brillo[1])}, azarV ), mix( ${f(c.velo.brillo[1])}, 1.0, cercaV ), vProtagonista );
		vDesenfoque = vProtagonista * cercaV * 0.6;
	#endif
	// Un cuadrado girado necesita la diagonal del punto.
	gl_PointSize = max( vLadoN * ( POLVO_VARIANTE == 2 ? 1.42 : 1.0 ), 1.0 );
}
#endif
`

/** En el fragmento, en lugar del perfil nítido: la forma de cada variante, su brillo y su luz. */
export const VARIANTE_FRAGMENT_GLSL = /* glsl */ `
	{
		vec2 pV = gl_PointCoord - 0.5;
		#if POLVO_VARIANTE == 1
			float rV = length( pV ) * 2.0;
			float duroV = 1.0 - smoothstep( 1.0 - 1.5 / max( vLadoN, 1.0 ), 1.0, rV );
			float blandoV = exp( - rV * rV * 3.0 ) * ( 1.0 - smoothstep( 0.85, 1.0, rV ) );
			// La esfera: un centro más claro, iluminado desde arriba a la izquierda.
			diffuseColor.rgb *= 0.78 + 0.22 * clamp( 1.0 - length( pV - vec2( -0.12, 0.12 ) ) * 2.4, 0.0, 1.0 );
			diffuseColor.a *= mix( duroV, blandoV, vDesenfoque ) * vBrilloDelPolvo * mix( 1.0, 0.4, vDesenfoque ) * min( 1.0, vLadoN * vLadoN );
		#elif POLVO_VARIANTE == 2
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
		#else
			float rV = length( pV ) * 2.0;
			float suaveV = exp( - rV * rV * 2.4 ) * ( 1.0 - smoothstep( 0.8, 1.0, rV ) );
			float puntoV = 1.0 - smoothstep( 0.55, 1.0, rV );
			diffuseColor.a *= mix( puntoV, suaveV, vProtagonista ) * vBrilloDelPolvo * min( 1.0, vLadoN * vLadoN );
		#endif
	}
`
