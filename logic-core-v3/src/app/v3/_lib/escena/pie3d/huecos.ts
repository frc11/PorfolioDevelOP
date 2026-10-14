import * as THREE from 'three'

/**
 * [PULIDO 22] T3 · EL HUECO DE CADA PIEZA DEL PIE EN EL PISO, como el del logo. [PULIDO 23] U3 · AJUSTADO, NO UN POZO: en T3 los bloques de
 * adentro de la huella bajaban (un pozo rectangular, de bloques enteros, con manchas de sombra; debajo de los grupos, compartido). Ahora el
 * hueco es la SILUETA de la placa (su rectángulo redondeado, con su radio) con `margen` de más, y se recorta en el DIBUJO del piso por
 * píxel (como el del logo): adentro el piso no se dibuja, la placa queda al ras; alrededor, un labio limpio (un anillo apenas oscuro de
 * `labio` u). Se abre mientras la pieza cae (crece desde el centro con su vuelco). Sólo las placas (botones, redes, la placa del form):
 * los textos se apoyan sobre el piso (`caida.ts`). Los escribe `huecosDeLaCaida.ts` en cada cuadro; los usa el dibujo del piso
 * (`final/enElPiso.ts`).
 */
export const MAXIMO_DE_HUECOS_DEL_PIE = 32

export const HUECO_DEL_PIE = {
  /** Lo que el hueco sobra de la placa (parte: 3 %), el ancho del labio (u) y cuánto lo oscurece. */
  margen: 0.03,
  labio: 0.05,
  oscuroDelLabio: 0.4,
} as const

export const HUECOS_DEL_PIE = {
  /** (centro x, centro z, medio ancho a lo largo de `derecha`, medio fondo a lo largo de `atras`), en el mundo (la base del pie). */
  uHuecosDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  /** (cuánto se abrió, 0 a 1; el radio de sus esquinas, u; 0, 0). */
  uFormaDeLosHuecosDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  uCuantosHuecosDelPie: { value: 0 },
}

/**
 * [PULIDO 25] W2 a · LA QUIETUD DEBAJO DE LO QUE SE LEE: acostadas, la energía del piso (el brillo de las juntas, los pistones) pasaba por
 * debajo de los textos, los botones, los enlaces y el form. Por pieza acostada (todas: placas y textos), su huella más `margen` (u): ahí la
 * energía queda en calma, con un borde difuminado de `borde` (u). Alrededor y cerca del logo, igual. Las escribe `huecosDeLaCaida.ts`.
 */
export const QUIETUD = { margen: 0.3, borde: 0.6 } as const

export const QUIETUD_DEL_PIE = {
  /** (centro x, centro z, medio ancho, medio fondo) en la base del pie y cuánto vale (0 a 1, con el vuelco). */
  uQuietudDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  uFuerzaDeLaQuietud: { value: new Float32Array(MAXIMO_DE_HUECOS_DEL_PIE) },
  uCuantasQuietudes: { value: 0 },
}

const f = (x: number): string => (Number.isInteger(x) ? `${String(x)}.0` : String(x))

/**
 * `huecoDelPie( xz )`: la distancia con signo al borde del hueco más cercano (u: negativa adentro; muy grande sin huecos). La forma es el
 * rectángulo redondeado de la placa en la base del pie, por lo que se abrió (desde su centro).
 */
export const HUECOS_DEL_PIE_GLSL = /* glsl */ `
uniform vec4 uHuecosDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform vec4 uFormaDeLosHuecosDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform int uCuantosHuecosDelPie;
uniform vec4 uBaseDelPie;
float huecoDelPie( vec2 xz ) {
	float m = 1e4;
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantosHuecosDelPie ) break;
		vec4 h = uHuecosDelPie[ k ];
		vec4 forma = uFormaDeLosHuecosDelPie[ k ];
		if ( forma.x <= 0.0 ) continue;
		vec2 d = xz - h.xy;
		vec2 medio = h.zw * forma.x;
		float r = min( forma.y, min( medio.x, medio.y ) );
		vec2 q = vec2( abs( dot( d, uBaseDelPie.xy ) ), abs( dot( d, uBaseDelPie.zw ) ) ) - medio + r;
		m = min( m, length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 ) - r );
	}
	return m;
}
// El labio: un anillo apenas oscuro alrededor del hueco.
float labioDelHuecoDelPie( float sd ) {
	return sd < 0.0 ? 0.0 : ${f(HUECO_DEL_PIE.oscuroDelLabio)} * ( 1.0 - smoothstep( 0.0, ${f(HUECO_DEL_PIE.labio)}, sd ) );
}
`

/** [PULIDO 25] W2 a · `quietudDelPie( xz )`: cuánto se calma la energía del piso ahí (0 a 1). Necesita `uBaseDelPie` declarada antes. */
export const QUIETUD_DEL_PIE_GLSL = /* glsl */ `
uniform vec4 uQuietudDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform float uFuerzaDeLaQuietud[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform int uCuantasQuietudes;
float quietudDelPie( vec2 xz ) {
	float m = 0.0;
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantasQuietudes ) break;
		vec4 h = uQuietudDelPie[ k ];
		vec2 d = xz - h.xy;
		float afuera = max( abs( dot( d, uBaseDelPie.xy ) ) - h.z, abs( dot( d, uBaseDelPie.zw ) ) - h.w ) - ${f(QUIETUD.margen)};
		m = max( m, uFuerzaDeLaQuietud[ k ] * ( 1.0 - smoothstep( 0.0, ${f(QUIETUD.borde)}, afuera ) ) );
	}
	return m;
}
`
