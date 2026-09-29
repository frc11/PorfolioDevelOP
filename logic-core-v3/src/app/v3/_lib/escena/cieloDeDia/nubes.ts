import { FORMACION } from '../formacion/enFormacion'

/**
 * [ESCENA 8] T4 · EL CIELO DE DÍA — puro: un cielo natural (cielo y nubes) adentro de un espacio que se nota
 * construido, como el de The Truman Show. Va en la misma franja de cielo que la noche, detrás de la formación y de
 * la trama; con la noche se funde al color de la bruma (antes de que aparezcan las estrellas) y con el amanecer
 * vuelve desde el horizonte hacia arriba (la cúpula de la noche lo destapa).
 *
 * [CALIDAD 1] A2 · En el producto, el **pintado celeste** (elegido por Valentino): un ciclorama, una cúpula del mundo
 * (no en el infinito: tiene un paralaje mínimo) con el cielo y las nubes pintados, y las uniones de los paneles
 * apenas visibles (un píxel, unos puntos más oscuras, y cada panel con su tono apenas distinto, como pintado por
 * separado). **El celeste rompe la regla monocroma de DIRECCION-ESCENA a propósito: es una excepción aprobada**
 * (ESTADO-ESCENA.md), no un error que haya que corregir. Las otras cinco pruebas (el pintado mono y los bloques y las
 * partículas en los dos tonos) se borraron, código y banderas.
 *
 * El cielo va del color de la bruma en el horizonte (empalma con el piso del fondo sin línea) al celeste arriba. Las
 * nubes, blancas; su sombra, apenas más oscura. Nada compite con el logo: todo claro y de poco contraste, y el texto
 * oscuro se lee sobre cualquier parte (lo midió el banco de ESCENA 8).
 */

/**
 * Los colores del celeste (codificados): el cielo arriba, la nube y su sombra. En el horizonte, la bruma. Medido en
 * ESCENA 8: con #B9C8D4 y el degradé entero a 0,32 el texto sobre el cielo perdía hasta 30 % (Seis razones, de 12,5
 * a 8,7); más claros y con el degradé más largo, la franja donde va el texto queda cerca del papel.
 */
export const CELESTE = { alto: '#C8D5DF', nube: '#FFFFFF', sombra: '#E1E6EA' } as const

export const CIELO_DE_DIA = {
  /** El radio del cielo: el de la noche (más allá de la última fila y del piso de abajo). */
  radio: FORMACION.radioDelCielo,
  /** A qué altura del rayo (el seno de la elevación) el cielo ya tiene el color de arriba (~27°). */
  degrade: 0.45,
  /** Entre qué cantidades de noche se apaga (antes de que asomen las estrellas, en 0,35). */
  noche: [0.1, 0.33],
  /** La bruma sobre las nubes cerca del horizonte: hasta qué seno de la elevación. */
  bruma: 0.07,
  pintado: {
    /** Los paneles: cuántos en la vuelta y cada cuántos grados de alto; cuánto oscurece la unión y cuánto varía el tono. */
    paneles: 24,
    cadaGrados: 9,
    union: 0.045,
    tono: 0.018,
    /** Las nubes pintadas: la escala del dibujo (a lo ancho y a lo alto), el umbral y la suavidad del borde. */
    nubes: { ancho: 5.5, alto: 16, umbral: 0.5, borde: 0.18 },
  },
} as const

/** Cuánto día hay para el cielo con esta noche (1 de día, 0 antes de que asomen las estrellas). */
export function diaDelCielo(noche: number): number {
  const [a, b] = CIELO_DE_DIA.noche
  const u = Math.min(1, Math.max(0, (noche - a) / (b - a)))
  return 1 - u * u * (3 - 2 * u)
}

const f = (n: number): string => n.toFixed(4)
const P = CIELO_DE_DIA.pintado

/**
 * El cielo en GLSL: el degradé de la bruma al celeste de arriba, las nubes pintadas y las uniones de los paneles.
 * `d` es la dirección desde el centro del mundo (la cúpula es del mundo). Pide `uAlto`, `uNube`, `uSombra`, `uNiebla`
 * y `uDia`.
 */
export const CIELO_DE_DIA_GLSL = /* glsl */ `
uniform vec3 uAlto;
uniform vec3 uNube;
uniform vec3 uSombra;
uniform vec3 uNiebla;
uniform float uDia;
float azarDelCielo( vec2 p ) { return fract( sin( dot( p, vec2( 127.1, 311.7 ) ) ) * 43758.5453 ); }
float ruidoDelCielo( vec2 p ) {
	vec2 i = floor( p );
	vec2 u = fract( p );
	u = u * u * ( 3.0 - 2.0 * u );
	return mix( mix( azarDelCielo( i ), azarDelCielo( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDelCielo( i + vec2( 0.0, 1.0 ) ), azarDelCielo( i + vec2( 1.0, 1.0 ) ), u.x ), u.y );
}
float fbmDelCielo( vec2 p ) {
	float s = 0.0;
	float a = 0.5;
	for ( int i = 0; i < 5; i++ ) {
		s += a * ruidoDelCielo( p );
		p = mat2( 1.6, 1.2, - 1.2, 1.6 ) * p;
		a *= 0.5;
	}
	return s;
}
// El cielo sin nubes: de la bruma en el horizonte al tono de arriba.
vec3 cieloSolo( float alto ) {
	return mix( uNiebla, uAlto, pow( smoothstep( 0.0, ${f(CIELO_DE_DIA.degrade)}, alto ), 0.8 ) );
}
// La bruma que se come lo lejano cerca del horizonte.
float brumaDelCielo( float alto ) {
	return 1.0 - smoothstep( 0.0, ${f(CIELO_DE_DIA.bruma)}, alto );
}
vec3 cieloPintado( vec3 d ) {
	float alto = d.y;
	vec3 color = cieloSolo( alto );
	float azimut = atan( d.x, d.z );
	float elevacion = asin( clamp( alto, -1.0, 1.0 ) );
	// Las nubes pintadas: un fbm estirado a lo ancho, con la pincelada (un ruido fino a lo largo).
	vec2 p = vec2( azimut * ${f(P.nubes.ancho)}, elevacion * ${f(P.nubes.alto)} );
	float n = fbmDelCielo( p + vec2( 3.1, 7.7 ) ) + 0.06 * ( ruidoDelCielo( vec2( p.x * 9.0, p.y * 1.5 ) ) - 0.5 );
	float nube = smoothstep( ${f(P.nubes.umbral)}, ${f(P.nubes.umbral + P.nubes.borde)}, n ) * smoothstep( 0.01, 0.08, alto );
	// La sombra de abajo de la nube: donde la de un poco más abajo es menos densa.
	float abajo = fbmDelCielo( p - vec2( 0.0, 0.35 ) + vec2( 3.1, 7.7 ) );
	vec3 deLaNube = mix( uSombra, uNube, smoothstep( -0.05, 0.12, n - abajo + 0.04 ) );
	color = mix( color, deLaNube, nube );
	color = mix( color, uNiebla, brumaDelCielo( alto ) * 0.85 );
	// Los paneles: la unión (un píxel, un poco más oscura) y el tono de cada panel, apenas distinto.
	if ( alto > 0.0 ) {
		float a = azimut / 6.2831853 * ${f(P.paneles)};
		float b = degrees( elevacion ) / ${f(P.cadaGrados)};
		vec2 lejos = vec2( min( fract( a ), 1.0 - fract( a ) ) / max( fwidth( a ), 1e-5 ), min( fract( b ), 1.0 - fract( b ) ) / max( fwidth( b ), 1e-5 ) );
		float junta = 1.0 - smoothstep( 0.4, 1.2, min( lejos.x, lejos.y ) );
		float tono = azarDelCielo( floor( vec2( a, b ) ) ) - 0.5;
		color *= ( 1.0 - ${f(P.union)} * junta ) * ( 1.0 + ${f(P.tono)} * tono );
	}
	return color;
}
`
