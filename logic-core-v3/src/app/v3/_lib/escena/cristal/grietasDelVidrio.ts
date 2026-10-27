import * as THREE from 'three'

import { FLOOR_Y } from '../probeScene'
import { CRISTAL } from './cristal'
import { GRIETAS } from './grietas'

/**
 * [NOCTURNO B9] LAS GRIETAS EN EL MATERIAL DEL CRISTAL (sin partir la geometría). [C2-31g] CADA CELDA, POR DENTRO: cada fragmento sabe
 * dónde está en su celda (`vGrieta`: a cuántos u del centro de su abanico, con la semilla de la celda; `muro.ts`) y cuánto camino hay de
 * ese centro al borde (`vInterior`: 1 en el centro, 0 en el borde; los anillos tienen la forma de la celda). Con eso, sin texturas ni
 * listas: los dos rayos que lo encierran (de 7 a 11 por celda, corridos, con su zigzag) y los anillos de su tramo, hasta donde llegó el
 * frente (`uGrietas.w`: desde el centro o desde el borde). De la distancia en px a la línea más cercana salen:
 *
 *   · la banda OSCURA: de día oscurece el vidrio; de noche es un gris tenue (una grieta oscura sobre el negro no se vería);
 *   · la LUZ FINA (sólo en las páginas de servicio: en el home `uGrietas.y` queda en 0): un núcleo de 1 px con un halo corto, en el
 *     acento, que corre desde donde nace la grieta al encenderse y vuelve al apagarse;
 *   · la FACETA: cada trozo entre dos rayos y dos anillos, apenas más claro u oscuro (el aristado).
 *
 * Sin grietas (`uGrietas.z` 0, una uniforme: la rama es pareja en todo el cuadro) no cuesta nada más que esa comparación.
 */
const D = GRIETAS.dibujo
const T = GRIETAS.telarana
const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))
const DOS_PI = f(2 * Math.PI)
const VUELTA = f(2 * Math.PI * CRISTAL.muro.radio)

export const GRIETAS_GLSL = /* glsl */ `
uniform vec4 uGrietas;
uniform vec3 uGrietasColor;
uniform vec4 uGrietasGeneral;
varying vec3 vGrieta;
const float ANILLOS_DE_LA_GRIETA[ ${String(T.anillos.length)} ] = float[ ${String(T.anillos.length)} ]( ${T.anillos.map(f).join(', ')} );
// [C2-31g] El azar de una celda (su semilla) para cada cosa suya (\`b\`), de 0 a 1.
float azarDeLaGrieta( float a, float b ) {
	return fract( sin( a * 12.9898 + b * 78.233 ) * 43758.5453 );
}
// El rayo \`j\` de una celda de \`n\` rayos (\`j\` puede pasarse de la vuelta: el azar es el del rayo de la vuelta), en partes del sector.
float rayoDeLaCelda( float j, float n, float semilla ) {
	return j + ( azarDeLaGrieta( semilla, mod( j, n ) ) - 0.5 ) * ${f(2 * T.desorden)};
}
// Hasta dónde llega el rayo, en partes del camino desde donde nace: casi todos, al otro extremo; algunos, cortos.
float alcanceDelRayo( float j, float semilla ) {
	return azarDeLaGrieta( semilla + 0.25, j ) < ${f(T.cortos)} ? mix( ${f(T.corto[0])}, ${f(T.corto[1])}, azarDeLaGrieta( semilla + 0.75, j ) ) : 2.0;
}
// La distancia (px) de \`d\` al rayo de ángulo \`a\`: la perpendicular, con un zigzag que nace en el centro; infinita detrás del centro.
float alRayo( vec2 d, float a, float j, float semilla, float porPx ) {
	vec2 e = vec2( cos( a ), sin( a ) );
	float largo = dot( d, e );
	if ( largo <= 0.0 ) return 1e9;
	float fase = azarDeLaGrieta( semilla + 0.5, j ) * ${DOS_PI};
	float zig = ${f(T.zigzag)} * smoothstep( 0.0, 0.6, largo ) * ( sin( largo * ${f(T.ondas[0])} + fase ) + 0.5 * sin( largo * ${f(T.ondas[1])} + 1.7 * fase ) );
	return abs( e.x * d.y - e.y * d.x - zig ) / porPx;
}
// Una línea a \`dPx\` px, de \`grosor\`, formada hasta \`ve\` (0 a 1) y a la que el frente llegó en \`llega\`: (la banda oscura, la luz).
vec2 laLineaDeLaGrieta( float dPx, float grosor, float ve, float llega ) {
	float banda = clamp( ${f(D.bandaPx)} * grosor + 0.5 - dPx, 0.0, 1.0 );
	float nucleo = clamp( ${f(D.nucleoPx)} * grosor + 0.5 - dPx, 0.0, 1.0 );
	float halo = exp( - dPx * dPx / ${f(D.haloPx * D.haloPx)} );
	float luz = smoothstep( llega, llega + ${f(D.onda)}, uGrietas.y * ${f(1 + D.onda)} );
	return vec2( banda, luz * ( nucleo * ${f(D.brillo)} + halo * ${f(D.halo)} ) ) * ve;
}
// [C2-31g] La telaraña de la celda en \`d\` (u desde su centro), \`s\` el camino del centro al borde (0 a 1): (oscura, luz, faceta).
vec3 lasGrietas( vec2 d, float s, float semilla, float porPx, float porPxDelCamino ) {
	float forma = uGrietas.x;
	float n = floor( ${f(T.rayos[0])} + azarDeLaGrieta( semilla, 101.0 ) * ${f(T.rayos[1] - T.rayos[0] + 1)} );
	float giro = azarDeLaGrieta( semilla, 102.0 );
	float x = fract( atan( d.y, d.x + 1e-7 ) / ${DOS_PI} - giro ) * n;
	float i = floor( x );
	float xa = rayoDeLaCelda( i, n, semilla );
	float xb = rayoDeLaCelda( i + 1.0, n, semilla );
	// El tramo: entre los rayos \`j\` y \`j + 1\` (corridos, el de al lado puede quedar del otro lado del fragmento).
	float j = xa > x ? i - 1.0 : ( xb <= x ? i + 1.0 : i );
	float j0 = mod( j, n );
	float j1 = mod( j + 1.0, n );
	float d0 = alRayo( d, ( rayoDeLaCelda( j, n, semilla ) / n + giro ) * ${DOS_PI}, j0, semilla, porPx );
	float d1 = alRayo( d, ( rayoDeLaCelda( j + 1.0, n, semilla ) / n + giro ) * ${DOS_PI}, j1, semilla, porPx );
	// El camino desde donde nace (el centro o el borde) y el frente, con la punta suave (1 px).
	float camino = mix( s, 1.0 - s, uGrietas.w );
	float frente = clamp( ( forma - camino ) / porPxDelCamino + 0.5, 0.0, 1.0 );
	float r0 = camino <= alcanceDelRayo( j0, semilla ) ? d0 : 1e9;
	float r1 = camino <= alcanceDelRayo( j1, semilla ) ? d1 : 1e9;
	vec2 g = laLineaDeLaGrieta( min( r0, r1 ), ${f(GRIETAS.grosor.rayo)}, frente, camino );
	// Los anillos: el tramo entre los dos rayos, a su parte del camino (corrida en cada tramo), si no falta; se cierra desde los rayos.
	float trozo = 0.0;
	for ( int k = 0; k < ${String(T.anillos.length)}; k ++ ) {
		float fk = float( k );
		float rho = ANILLOS_DE_LA_GRIETA[ k ] + ( azarDeLaGrieta( semilla + fk, j0 + 7.0 ) - 0.5 ) * ${f(2 * T.corre)};
		if ( azarDeLaGrieta( semilla + 3.1 * fk, j0 + 13.0 ) < ${f(T.falta)} ) continue;
		trozo += step( rho, s );
		float nace = mix( rho, 1.0 - rho, uGrietas.w );
		float cierra = clamp( ( forma - nace ) / ${f(T.barre)}, 0.0, 1.0 );
		float ve = clamp( cierra * 0.5 * ( d0 + d1 ) - min( d0, d1 ) + 0.5, 0.0, 1.0 );
		g = max( g, laLineaDeLaGrieta( abs( s - rho ) / porPxDelCamino, ${f(GRIETAS.grosor.anillo)}, ve, nace ) );
	}
	float faceta = ( azarDeLaGrieta( semilla + 5.3 * trozo, j0 + 29.0 ) - 0.5 ) * ${f(2 * D.faceta)} * step( camino, forma );
	return vec3( g, faceta );
}
`

/**
 * Lo que va al final del \`main\` del vidrio, con \`color\` y \`uNoche\` ya calculados: la faceta, la banda oscura y, encima, la luz. Las
 * derivadas se toman adentro de ramas de uniformes (parejas en todo el cuadro): bien definidas.
 */
export const GRIETAS_EN_EL_MAIN = /* glsl */ `
	if ( uGrietas.z > 0.5 ) {
		vec2 dGrieta = vGrieta.xy;
		float sGrieta = 1.0 - vInterior;
		float semillaGrieta = vGrieta.z;
		// [C2-31g] El control del banco (\`CONTROL=general\`): una sola telaraña para todo el muro, centrada donde mira la cámara.
		if ( uGrietasGeneral.x > 0.5 ) {
			float uGeneral = atan( vMundo.x, vMundo.z ) * ${f(CRISTAL.muro.radio)} - uGrietasGeneral.y;
			dGrieta = vec2( mod( uGeneral + 0.5 * ${VUELTA}, ${VUELTA} ) - 0.5 * ${VUELTA}, vMundo.y - ${f(FLOOR_Y)} - uGrietasGeneral.z );
			sGrieta = clamp( length( dGrieta ) / uGrietasGeneral.w, 0.0, 1.0 );
			semillaGrieta = 0.0;
		}
		float porPxGrieta = max( 1e-5, 0.5 * ( fwidth( dGrieta.x ) + fwidth( dGrieta.y ) ) );
		float porPxDelCamino = max( 1e-5, length( vec2( dFdx( sGrieta ), dFdy( sGrieta ) ) ) );
		vec3 g = lasGrietas( dGrieta, sGrieta, semillaGrieta, porPxGrieta, porPxDelCamino );
		color *= 1.0 + g.z;
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
