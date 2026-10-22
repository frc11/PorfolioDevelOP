import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { CRISTAL } from './cristal'
import { GRIETAS } from './grietas'

/**
 * [NOCTURNO B9] LAS GRIETAS EN EL MATERIAL DEL CRISTAL (sin partir la geometría). Cada fragmento del muro se lleva al muro desenrollado
 * alrededor del centro de las grietas; ahí busca su celda de la rejilla (`trazado.ts`, `empaquetar`) y mide la distancia (en px, con la
 * derivada de la posición) al tramo más cercano, sólo hasta donde llegó el frente de la formación (la punta, redonda). De eso salen:
 *
 *   · la banda OSCURA: de día oscurece el vidrio; de noche es un gris tenue (una grieta oscura sobre el negro no se vería);
 *   · la LUZ FINA: un núcleo de 1 px con un halo corto, en el color de las grietas (neutro en el home, el acento claro en las páginas), que
 *     corre de los impactos a las puntas al encenderse y vuelve al apagarse.
 *
 * Sin grietas (`uGrietas.z` 0, una uniforme: la rama es pareja en todo el cuadro) no cuesta nada más que esa comparación.
 */
const D = GRIETAS.dibujo
const R = GRIETAS.rejilla
const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

export const GRIETAS_GLSL = /* glsl */ `
uniform sampler2D uGrietasCeldas;
uniform sampler2D uGrietasTramos;
uniform vec4 uGrietasMarco;
uniform vec4 uGrietasRejilla;
uniform vec4 uGrietas;
uniform vec3 uGrietasColor;
// [NOCTURNO B9] El punto en el muro desenrollado, alrededor del centro de las grietas (\`uGrietasMarco.x\`): a lo largo (u, con signo) y la altura.
vec2 enLasGrietas( vec3 p ) {
	float vuelta = ${f(2 * Math.PI * CRISTAL.muro.radio)};
	float u = atan( p.x, p.z ) * ${f(CRISTAL.muro.radio)} - uGrietasMarco.x;
	return vec2( mod( u + 0.5 * vuelta, vuelta ) - 0.5 * vuelta, p.y - ${f(FLOOR_Y)} );
}
// Lo de las grietas en \`q\` (\`porPx\`: u por píxel): el núcleo, la banda oscura, el halo y cuánto de su luz llegó.
vec4 lasGrietas( vec2 q, float porPx ) {
	vec2 c = ( q - uGrietasMarco.yz ) / uGrietasRejilla.xy;
	if ( c.x < 0.0 || c.y < 0.0 || c.x >= uGrietasRejilla.z || c.y >= uGrietasRejilla.w ) return vec4( 0.0 );
	int ci = int( c.y ) * int( uGrietasRejilla.z + 0.5 ) + int( c.x );
	vec4 celda = texelFetch( uGrietasCeldas, ivec2( ci % ${String(R.porFila)}, ci / ${String(R.porFila)} ), 0 );
	int inicio = int( celda.x + 0.5 );
	int cuantos = int( celda.y + 0.5 );
	float dPx = 1e9;
	float dU = 1e9;
	float llega = 1.0;
	for ( int k = 0; k < ${String(R.lazo)}; k ++ ) {
		if ( k >= cuantos ) break;
		int i = 2 * ( inicio + k );
		ivec2 t = ivec2( i % ${String(R.ancho)}, i / ${String(R.ancho)} );
		vec4 ab = texelFetch( uGrietasTramos, t, 0 );
		vec4 tt = texelFetch( uGrietasTramos, t + ivec2( 1, 0 ), 0 );
		if ( uGrietas.x <= tt.x ) continue;
		float s = clamp( ( uGrietas.x - tt.x ) / max( 1e-5, tt.y - tt.x ), 0.0, 1.0 );
		vec2 ba = ab.zw - ab.xy;
		float h = clamp( dot( q - ab.xy, ba ) / max( 1e-8, dot( ba, ba ) ), 0.0, s );
		float du = length( q - ab.xy - ba * h );
		float d = du / ( porPx * tt.z );
		if ( d < dPx ) {
			dPx = d;
			dU = du;
			llega = mix( tt.x, tt.y, h );
		}
	}
	if ( dPx > 1e8 ) return vec4( 0.0 );
	float nucleo = clamp( ${f(D.nucleoPx)} + 0.5 - dPx, 0.0, 1.0 );
	float banda = clamp( ${f(D.bandaPx)} + 0.5 - dPx, 0.0, 1.0 );
	float halo = exp( - dPx * dPx / ${f(D.haloPx * D.haloPx)} ) * ( 1.0 - smoothstep( ${f(0.6 * D.margen)}, ${f(D.margen)}, dU ) );
	float luz = smoothstep( llega, llega + ${f(D.onda)}, uGrietas.y * ${f(1 + D.onda)} );
	return vec4( nucleo, banda, halo, luz );
}
`

/**
 * Lo que va al final del \`main\` del vidrio, con \`color\` y \`uNoche\` ya calculados: la banda oscura y, encima, la luz. La derivada se
 * toma adentro de una rama de uniforme (pareja en todo el cuadro): bien definida.
 */
export const GRIETAS_EN_EL_MAIN = /* glsl */ `
	if ( uGrietas.z > 0.5 ) {
		vec2 qGrietas = enLasGrietas( vMundo );
		float porPxGrietas = max( 1e-5, 0.5 * ( fwidth( qGrietas.x ) + fwidth( qGrietas.y ) ) );
		vec4 g = lasGrietas( qGrietas, porPxGrietas );
		color = mix( color, mix( color * ${f(1 - D.oscurece)}, max( color, vec3( ${f(D.grisDeNoche)} ) ), uNoche ), g.y );
		color += uGrietasColor * g.w * ( g.x * ${f(D.brillo)} + g.z * ${f(D.halo)} );
	}
`

/** Las uniformes de las grietas (las texturas las pone `grietasEnVivo.ts` al montarse: sin grietas, el sombreador no las lee). */
export function uniformesDeLasGrietas() {
  return {
    uGrietasCeldas: { value: null as THREE.Texture | null },
    uGrietasTramos: { value: null as THREE.Texture | null },
    /** El centro (u del muro), la esquina de la rejilla (x, y) y nada. */
    uGrietasMarco: { value: new THREE.Vector4() },
    /** El lado de cada celda (x, y) y cuántas a lo ancho y a lo alto. */
    uGrietasRejilla: { value: new THREE.Vector4(1, 1, 0, 0) },
    /** La formación que se ve (0 a 1), la luz (0 a 1), si hay grietas (0 o 1) y nada. */
    uGrietas: { value: new THREE.Vector4() },
    uGrietasColor: { value: new THREE.Color(1, 1, 1) },
  }
}

/** Las dos texturas de la rejilla (flotantes, sin filtrar: se leen por téxel), sobre los arreglos que llena `empaquetar`. */
export function texturasDeLasGrietas(celdas: Float32Array, tabla: Float32Array): { readonly celdas: THREE.DataTexture; readonly tramos: THREE.DataTexture } {
  const crear = (datos: Float32Array, ancho: number, alto: number): THREE.DataTexture => {
    const t = new THREE.DataTexture(datos, ancho, alto, THREE.RGBAFormat, THREE.FloatType)
    t.minFilter = THREE.NearestFilter
    t.magFilter = THREE.NearestFilter
    t.generateMipmaps = false
    t.needsUpdate = true
    return t
  }
  return { celdas: crear(celdas, R.porFila, R.celdas / R.porFila), tramos: crear(tabla, R.ancho, R.filas) }
}
