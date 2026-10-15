import * as THREE from 'three'

import { SATINADO } from '../estudio'
import { FLOOR_Y, INK_COLOR } from '../probeScene'
import type { UniformesDelPie } from './coreografia'

/**
 * [PULIDO 27] Y1 c · LA PLACA DEL FORM SE DERRITE Y LO NUEVO NACE DEL CHARCO (gracias, error y de vuelta al form) — antes se hundía por
 * su hueco y se disolvía con el tramado: una mancha gris borrosa. Ahora, en el sombreador de vértices (la placa, teselada: `teselado.ts`),
 * VISCOSA como la glucosa: espesa, lenta, con tensión superficial.
 *
 *   · cada punto LLEGA al piso a su tiempo: lo de abajo primero y lo de arriba al final (`llega`), y baja despacio al principio y cada vez
 *     más rápido (espesa); el borde de arriba, ondulado;
 *   · las GOTAS: en algunas columnas lo de abajo llega antes y se estira en lenguas de punta redondeada (casi planas en el medio y caídas
 *     suaves a los lados: la tensión superficial);
 *   · la superficie se vuelve LÍQUIDA: el relieve de los rótulos y los pozos se funden en la cara y el color va al negro del charco, con
 *     la luz de un líquido (`mojado`); la normal sale de la superficie deformada;
 *   · el PISO es el tope (su campo: la altura de los bloques del piso vivo, `PISO_EN_VIVO`, por encima de todos, continua; sin piso
 *     vivo, su plano): lo que llega se apoya sobre los bloques, se ABOMBA un poco hacia adelante y después se EXTIENDE (hacia adelante de la cara y a
 *     los costados), cada vez más despacio y más fino hacia el borde (`capa`): un charco de borde redondeado;
 *   · al final el charco se hunde en el piso (`hunde`): se integra. Ahí se cambian (las dos derretidas enteras, en el mismo lugar) y lo
 *     nuevo hace lo mismo al revés: sale del charco y se levanta, con la misma viscosidad, hasta quedar sólido.
 *
 * Todo es función del punto en reposo y de `uDerriteDelPie` (0 sólida, 1 en el charco): sin reloj ni azar por cuadro. Acostada (el
 * final), lo alto sobre el piso es casi cero: se funde y se hunde en su hueco y lo nuevo sale de ahí. Lo escribe `armadas.ts`.
 */
export const DERRETIDO = {
  /** El abombado de la base al llegar y lo que avanza el charco hacia adelante y hacia los costados (veces el alto de la placa). */
  bulto: 0.1,
  alcance: 0.32,
  costados: 0.12,
  /** Las gotas: cuántas, su ancho (parte del ancho de la placa, de… a…) y cuánto antes llegan. */
  gotas: 6,
  anchoDeLasGotas: [0.05, 0.11],
  adelantan: 0.2,
  /** El espesor del charco (u) y adónde se hunde al final (u debajo del piso: más que el zócalo de los bloques, que lo tapan). */
  capa: 0.07,
  hunde: 0.65,
  /** La rugosidad del charco (mojado: brilla). */
  mojado: 0.18,
  /** El lado más largo de un triángulo de la placa teselada (px). */
  lado: 10,
} as const

/** Un cuadro del derretido de una pieza: cuánto (0 sólida, 1 en el charco) y la luz de un líquido mientras dura. */
export function mojar(material: THREE.MeshStandardMaterial, uniformes: UniformesDelPie, derrite: number): void {
  uniformes.uDerriteDelPie.value = derrite
  material.roughness = SATINADO.roughness + (DERRETIDO.mojado - SATINADO.roughness) * Math.min(1, derrite * 4)
}

const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))
const D = DERRETIDO
/** El negro del charco: la tinta de la placa (`COLORES_DEL_PIE.negro`; acá sin importar la geometría, que importa este módulo). */
const N = new THREE.Color(INK_COLOR)

/** Antes de `main` (con los de las letras): dónde queda un punto de la placa derretida, en el mundo. */
export const DERRETIDO_PARS_GLSL = /* glsl */ `
uniform float uDerriteDelPie;
uniform vec3 uCajaDelPie;
uniform sampler2D uPisoVivo;
uniform vec4 uGrillaDelPiso;
varying float vDerriteDelPie;
// El piso donde se apoya el charco: la altura de los bloques (\`piso/enVivo.ts\`); en cada esquina, el más alto de los cuatro bloques que
// la tocan, interpolado entre esquinas: continuo y nunca por debajo del bloque de abajo (ningún bloque atraviesa el charco).
float bloqueDelDerretido( ivec2 c ) {
	int n = int( uGrillaDelPiso.x );
	return texelFetch( uPisoVivo, clamp( c, ivec2( 0 ), ivec2( n - 1 ) ), 0 ).b;
}
float esquinaDelDerretido( ivec2 c ) {
	return max( max( bloqueDelDerretido( c ), bloqueDelDerretido( c - ivec2( 1, 0 ) ) ), max( bloqueDelDerretido( c - ivec2( 0, 1 ) ), bloqueDelDerretido( c - ivec2( 1, 1 ) ) ) );
}
float pisoDelDerretido( vec2 xz ) {
	if ( uGrillaDelPiso.z < 0.5 ) return ${f(FLOOR_Y)};
	vec2 q = xz / uGrillaDelPiso.y + uGrillaDelPiso.x * 0.5;
	vec2 i = floor( q );
	vec2 t = q - i;
	ivec2 c = ivec2( i );
	float abajo = mix( esquinaDelDerretido( c ), esquinaDelDerretido( c + ivec2( 1, 0 ) ), t.x );
	float arriba = mix( esquinaDelDerretido( c + ivec2( 0, 1 ) ), esquinaDelDerretido( c + ivec2( 1, 1 ) ), t.x );
	return ${f(FLOOR_Y)} + mix( abajo, arriba, t.y );
}
float azarDelDerretido( float n ) {
	return fract( sin( n * 127.1 + 3.7 ) * 43758.5453 );
}
// Las gotas: lomas a lo ancho de punta redondeada (casi planas en el medio, caídas suaves a los lados).
float gotasDelDerretido( float x ) {
	float g = 0.0;
	for ( int k = 0; k < ${String(D.gotas)}; k ++ ) {
		float c = 0.08 + 0.84 * azarDelDerretido( float( k ) + 1.0 );
		float w = mix( ${f(D.anchoDeLasGotas[0])}, ${f(D.anchoDeLasGotas[1])}, azarDelDerretido( float( k ) + 11.0 ) );
		float a = 0.55 + 0.45 * azarDelDerretido( float( k ) + 23.0 );
		float d = ( x - c ) / w;
		g = max( g, a * exp( - d * d * d * d ) );
	}
	return g;
}
// Cuánto bajó el punto (x: 0 a 1, despacio al principio) y cuánto lleva en el charco (y: 0 a 1, cada vez más despacio). El charco se
// extiende parejo (sin las gotas: el borde, redondeado, no hace dientes).
vec2 tiempoDelDerretido( float xn, float yn, float T ) {
	float alzado = 1.0 - yn;
	float onda = sin( xn * 7.3 + 1.7 ) * sin( xn * 2.9 + 0.4 );
	float charco = clamp( 0.2 + 0.6 * alzado + 0.03 * onda, 0.1, 0.8 );
	float llega = clamp( charco - ${f(D.adelantan)} * gotasDelDerretido( xn ) * ( 1.0 - alzado ) + 0.02 * onda, 0.1, 0.8 );
	float s = clamp( T / llega, 0.0, 1.0 );
	float tras = clamp( ( T - charco ) / ( 0.9 - charco ), 0.0, 1.0 );
	return vec2( pow( s, 1.7 ), 1.0 - ( 1.0 - tras ) * ( 1.0 - tras ) );
}
// \`local\`: en px de la pieza (x a la derecha, y hacia arriba desde su borde de arriba, la cara en z = 0). \`baja\`: cuánto bajó.
vec3 derretidoDelPie( vec3 local, out float baja ) {
	float xn = clamp( local.x / max( 1.0, uCajaDelPie.x ), 0.0, 1.0 );
	float yn = clamp( - local.y / max( 1.0, uCajaDelPie.y ), 0.0, 1.0 );
	vec2 m = tiempoDelDerretido( xn, yn, uDerriteDelPie );
	baja = m.x;
	// El relieve y los pozos se funden en la cara (el dorso no se mueve): la superficie se vuelve líquida.
	vec3 l = local;
	if ( l.z > - 0.5 * uCajaDelPie.z ) l.z = mix( l.z, 0.0, smoothstep( 0.0, 0.5, m.x ) );
	vec3 p = ( modelMatrix * vec4( l, 1.0 ) ).xyz;
	float alto = max( 0.0, p.y - pisoDelDerretido( p.xz ) );
	p.y -= alto * m.x;
	float altoDeLaPlaca = uCajaDelPie.y * length( modelMatrix[ 0 ].xyz );
	vec3 adelante = vec3( modelMatrix[ 2 ].x, 0.0, modelMatrix[ 2 ].z );
	vec3 costado = vec3( modelMatrix[ 0 ].x, 0.0, modelMatrix[ 0 ].z );
	adelante = dot( adelante, adelante ) > 1e-12 ? normalize( adelante ) : vec3( 0.0 );
	costado = dot( costado, costado ) > 1e-12 ? normalize( costado ) : vec3( 0.0 );
	// Al llegar se abomba hacia adelante y después se extiende (más despacio y más fino hacia el borde).
	p += adelante * altoDeLaPlaca * ( ${f(D.bulto)} * smoothstep( 0.55, 1.0, m.x ) * ( 1.0 - m.y ) + ${f(D.alcance)} * m.y );
	p += costado * ( xn - 0.5 ) * ${f(2 * D.costados)} * altoDeLaPlaca * m.y;
	float frente = clamp( ( local.z + uCajaDelPie.z ) / max( 1.0, uCajaDelPie.z ), 0.0, 1.0 );
	p.y += ${f(D.capa)} * frente * smoothstep( 0.8, 1.0, m.x ) * ( 1.0 - 0.75 * m.y ) * min( 1.0, alto * 5.0 );
	// Al final el charco se hunde en el piso, debajo de sus bloques: se integra.
	p.y = mix( p.y, ${f(FLOOR_Y)} - ${f(D.hunde)}, smoothstep( 0.86, 1.0, uDerriteDelPie ) );
	return p;
}
`

/**
 * Después de la normal de las letras (`beginnormal_vertex`): el punto derretido (al objeto) y la normal de la superficie deformada (con
 * dos vecinos en el plano de la cara, a 3 px).
 */
export const DERRETIDO_NORMAL_GLSL = /* glsl */ `
	vec3 posicionDelPie = position;
	vDerriteDelPie = 0.0;
	if ( uDerriteDelPie > 0.0 ) {
		float bajaDelPie;
		float otraDelPie;
		vec3 haciaDelPie = abs( objectNormal.x ) < 0.9 ? vec3( 1.0, 0.0, 0.0 ) : vec3( 0.0, 1.0, 0.0 );
		vec3 t1DelPie = normalize( cross( objectNormal, haciaDelPie ) );
		vec3 t2DelPie = cross( objectNormal, t1DelPie );
		vec3 enElMundoDelPie = derretidoDelPie( position, bajaDelPie );
		vec3 normalDelPie = cross( derretidoDelPie( position + t1DelPie * 3.0, otraDelPie ) - enElMundoDelPie, derretidoDelPie( position + t2DelPie * 3.0, otraDelPie ) - enElMundoDelPie );
		if ( dot( normalDelPie, normalDelPie ) > 1e-14 ) objectNormal = normalize( transpose( mat3( modelMatrix ) ) * normalDelPie );
		// Al apoyarse, hacia arriba (donde la cara se dobla contra el piso la diferencia da normales sueltas: brillos en punta).
		objectNormal = normalize( mix( objectNormal, normalize( transpose( mat3( modelMatrix ) ) * vec3( 0.0, 1.0, 0.0 ) ), smoothstep( 0.8, 1.0, bajaDelPie ) ) );
		posicionDelPie = ( inverse( modelMatrix ) * vec4( enElMundoDelPie, 1.0 ) ).xyz;
		vDerriteDelPie = smoothstep( 0.1, 0.6, bajaDelPie );
	}
`

/** Después de la posición de las letras (`begin_vertex`). */
export const DERRETIDO_POSICION_GLSL = /* glsl */ `
	if ( uDerriteDelPie > 0.0 ) transformed = posicionDelPie;
`

/** En el fragmento: la declaración y el color del charco (el negro de la tinta), después del color de la cara. */
export const DERRETIDO_FRAGMENTO_PARS_GLSL = /* glsl */ `
varying float vDerriteDelPie;
`
export const DERRETIDO_COLOR_GLSL = /* glsl */ `
	diffuseColor.rgb = mix( diffuseColor.rgb, vec3( ${N.r.toFixed(4)}, ${N.g.toFixed(4)}, ${N.b.toFixed(4)} ), vDerriteDelPie );
`
