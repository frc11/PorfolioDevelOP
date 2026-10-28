import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { CRISTAL } from './cristal'
import { GRIETAS } from './grietas'

/**
 * [NOCTURNO B9] LAS GRIETAS EN EL MATERIAL DEL CRISTAL (sin partir la geometría). [C2-31g] CADA CELDA, POR DENTRO: cada fragmento sabe
 * dónde está en su celda (`vGrieta`: a cuántos u del centro de su abanico, la semilla de la celda y sus rayos; `muro.ts`) y cuánto camino
 * hay de ese centro al borde (`vInterior`: 1 en el centro, 0 en el borde; los anillos tienen la forma de la celda). Con eso, sin texturas
 * ni listas: los dos rayos que lo encierran (de 7 a 11 por celda, corridos, con su zigzag) y el anillo más cercano de su tramo, hasta
 * donde llegó el frente (`uGrietas.w`: desde el centro o desde el borde). De la distancia en px a la línea más cercana salen:
 *
 *   · la banda OSCURA: de día oscurece el vidrio; de noche es un gris tenue (una grieta oscura sobre el negro no se vería);
 *   · la LUZ FINA (sólo en las páginas de servicio: en el home `uGrietas.y` queda en 0 y ni se calcula): un núcleo de 1 px con un halo
 *     corto, en el acento, que corre desde donde nace la grieta al encenderse y vuelve al apagarse.
 *
 * [C2-31g intento 2] EL COSTO (medía 0,118 ms por cuadro de más en el home): un solo azar por rayo (su corrimiento, su zigzag y su largo
 * salen de él), la distancia al rayo por el arco (sin seno ni coseno de su ángulo), un solo anillo (el más cercano: los otros están a más
 * de medio espacio), los rayos de la celda calculados una vez en la geometría, nada detrás del frente y la luz sólo si hay luz.
 *
 * Sin grietas (`uGrietas.z` 0, una uniforme: la rama es pareja en todo el cuadro) no cuesta nada más que esa comparación.
 */
const D = GRIETAS.dibujo
const T = GRIETAS.telarana
const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))
const DOS_PI = f(2 * Math.PI)
const VUELTA = f(2 * Math.PI * CRISTAL.muro.radio)
const DESORDEN = f(2 * T.desorden)

export const GRIETAS_GLSL = /* glsl */ `
uniform vec4 uGrietas;
uniform vec3 uGrietasColor;
uniform vec4 uGrietasGeneral;
varying vec4 vGrieta;
const float ANILLOS_DE_LA_GRIETA[ ${String(T.anillos.length)} ] = float[ ${String(T.anillos.length)} ]( ${T.anillos.map(f).join(', ')} );
// [C2-31g] El azar de una celda (su semilla, entera) para cada cosa suya (\`b\`, entera), de 0 a 1.
float azarDeLaGrieta( float a, float b ) {
	return fract( sin( a * 12.9898 + b * 78.233 ) * 43758.5453 );
}
// Hasta dónde llega un rayo (por su azar), en partes del camino desde donde nace: casi todos, al otro extremo; algunos, cortos.
float alcanceDelRayo( float h ) {
	return fract( h * 31.7 ) < ${f(T.cortos)} ? mix( ${f(T.corto[0])}, ${f(T.corto[1])}, fract( h * 57.1 ) ) : 2.0;
}
// La distancia (px) a un rayo a \`arco\` u del fragmento (por el arco), con su zigzag (\`h\`, su azar) que nace en el centro.
float alRayo( float arco, float r, float h, float porPx ) {
	float zig = ${f(T.zigzag)} * smoothstep( 0.0, 0.6, r ) * sin( r * ${f(T.zigzagPorU)} + fract( h * 17.31 ) * ${DOS_PI} );
	return abs( arco - zig ) / porPx;
}
// Una línea a \`dPx\` px, de \`grosor\`, formada hasta \`ve\` (0 a 1) y a la que el frente llegó en \`llega\`: (la banda oscura, la luz).
vec2 laLineaDeLaGrieta( float dPx, float grosor, float ve, float llega ) {
	float banda = clamp( ${f(D.bandaPx)} * grosor + 0.5 - dPx, 0.0, 1.0 ) * ve;
	if ( uGrietas.y <= 0.0 ) return vec2( banda, 0.0 );
	float nucleo = clamp( ${f(D.nucleoPx)} * grosor + 0.5 - dPx, 0.0, 1.0 );
	float halo = exp( - dPx * dPx / ${f(D.haloPx * D.haloPx)} );
	float luz = smoothstep( llega, llega + ${f(D.onda)}, uGrietas.y * ${f(1 + D.onda)} );
	return vec2( banda, ve * luz * ( nucleo * ${f(D.brillo)} + halo * ${f(D.halo)} ) );
}
// [C2-31g] La telaraña de la celda en \`d\` (u desde su centro), \`s\` el camino del centro al borde (0 a 1), \`rayos\` cuántos (la parte
// entera) y su giro (la decimal): (oscura, luz).
vec2 lasGrietas( vec2 d, float s, float semilla, float rayos, float porPx, float porPxDelCamino ) {
	float forma = uGrietas.x;
	float camino = mix( s, 1.0 - s, uGrietas.w );
	// Detrás del frente (mientras se forma) no hay nada: ni rayos ni anillos.
	if ( camino > forma + 3.0 * porPxDelCamino ) return vec2( 0.0 );
	float n = floor( rayos );
	float r = length( d );
	float x = fract( atan( d.y, d.x + 1e-7 ) / ${DOS_PI} - fract( rayos ) ) * n;
	float i = floor( x );
	// Los dos rayos que encierran al fragmento (corridos: el de al lado puede quedar del otro lado), \`j0\` el primero; cada uno con su azar.
	float ha = azarDeLaGrieta( semilla, i );
	float hb = azarDeLaGrieta( semilla, mod( i + 1.0, n ) );
	float xa = i + ( ha - 0.5 ) * ${DESORDEN};
	float xb = i + 1.0 + ( hb - 0.5 ) * ${DESORDEN};
	float j0 = i;
	float x0 = xa;
	float h0 = ha;
	float x1 = xb;
	float h1 = hb;
	if ( xa > x ) {
		j0 = mod( i - 1.0 + n, n );
		h0 = azarDeLaGrieta( semilla, j0 );
		x0 = i - 1.0 + ( h0 - 0.5 ) * ${DESORDEN};
		x1 = xa;
		h1 = ha;
	} else if ( xb <= x ) {
		j0 = mod( i + 1.0, n );
		x0 = xb;
		h0 = hb;
		h1 = azarDeLaGrieta( semilla, mod( i + 2.0, n ) );
		x1 = i + 2.0 + ( h1 - 0.5 ) * ${DESORDEN};
	}
	float alArco = r * ${DOS_PI} / n;
	float d0 = alRayo( ( x - x0 ) * alArco, r, h0, porPx );
	float d1 = alRayo( ( x - x1 ) * alArco, r, h1, porPx );
	float r0 = camino <= alcanceDelRayo( h0 ) ? d0 : 1e9;
	float r1 = camino <= alcanceDelRayo( h1 ) ? d1 : 1e9;
	// El frente, con la punta suave (1 px).
	vec2 g = laLineaDeLaGrieta( min( r0, r1 ), ${f(GRIETAS.grosor.rayo)}, clamp( ( forma - camino ) / porPxDelCamino + 0.5, 0.0, 1.0 ), camino );
	// El anillo más cercano: el tramo entre los dos rayos, a su parte del camino (corrida en cada tramo), si no falta; se cierra desde
	// los rayos hacia el medio después de que pasó el frente.
	float base = ANILLOS_DE_LA_GRIETA[ 0 ];
	float k = 0.0;
	for ( int q = 1; q < ${String(T.anillos.length)}; q ++ ) {
		if ( abs( s - ANILLOS_DE_LA_GRIETA[ q ] ) < abs( s - base ) ) {
			base = ANILLOS_DE_LA_GRIETA[ q ];
			k = float( q );
		}
	}
	float hk = azarDeLaGrieta( semilla + k, j0 + 7.0 );
	float rho = base + ( hk - 0.5 ) * ${f(2 * T.corre)};
	float nace = mix( rho, 1.0 - rho, uGrietas.w );
	if ( fract( hk * 7.31 ) >= ${f(T.falta)} && forma > nace ) {
		float ve = clamp( clamp( ( forma - nace ) / ${f(T.barre)}, 0.0, 1.0 ) * 0.5 * ( d0 + d1 ) - min( d0, d1 ) + 0.5, 0.0, 1.0 );
		g = max( g, laLineaDeLaGrieta( abs( s - rho ) / porPxDelCamino, ${f(GRIETAS.grosor.anillo)}, ve, nace ) );
	}
	return g;
}
`

/**
 * Lo que va al final del \`main\` del vidrio, con \`color\` y \`uNoche\` ya calculados: la banda oscura y, encima, la luz. Las derivadas
 * se toman adentro de ramas de uniformes (parejas en todo el cuadro): bien definidas.
 */
export const GRIETAS_EN_EL_MAIN = /* glsl */ `
	if ( uGrietas.z > 0.5 ) {
		vec2 dGrieta = vGrieta.xy;
		float sGrieta = 1.0 - vInterior;
		float semillaGrieta = floor( vGrieta.z + 0.5 );
		float rayosGrieta = vGrieta.w;
		// [C2-31g] El control del banco (\`CONTROL=general\`): una sola telaraña para todo el muro, centrada donde mira la cámara.
		if ( uGrietasGeneral.x > 0.5 ) {
			float uGeneral = atan( vMundo.x, vMundo.z ) * ${f(CRISTAL.muro.radio)} - uGrietasGeneral.y;
			dGrieta = vec2( mod( uGeneral + 0.5 * ${VUELTA}, ${VUELTA} ) - 0.5 * ${VUELTA}, vMundo.y - ${f(FLOOR_Y)} - uGrietasGeneral.z );
			sGrieta = clamp( length( dGrieta ) / uGrietasGeneral.w, 0.0, 1.0 );
			semillaGrieta = 0.0;
			rayosGrieta = 9.5;
		}
		float porPxGrieta = max( 1e-5, 0.5 * ( fwidth( dGrieta.x ) + fwidth( dGrieta.y ) ) );
		float porPxDelCamino = max( 1e-5, length( vec2( dFdx( sGrieta ), dFdy( sGrieta ) ) ) );
		vec2 g = lasGrietas( dGrieta, sGrieta, semillaGrieta, rayosGrieta, porPxGrieta, porPxDelCamino );
		color = mix( color, mix( color * ${f(1 - D.oscurece)}, max( color, vec3( ${f(D.grisDeNoche)} ) ), uNoche ), g.x );
		color += uGrietasColor * g.y;
	}
`

/** Las uniformes de las grietas. */
export function uniformesDeLasGrietas() {
  return {
    /** La formación que se ve (0 a 1), la luz (0 a 1; siempre 0 en el home), si hay grietas (0 o 1) y desde dónde (0 el centro, 1 el borde). */
    uGrietas: { value: new THREE.Vector4() },
    uGrietasColor: { value: new THREE.Color(0, 0, 0) },
    /** [C2-31g] El control del banco `CONTROL=general`: si va (0 o 1), su centro (u del muro, altura desde el piso) y su radio (u). */
    uGrietasGeneral: { value: new THREE.Vector4() },
  }
}
