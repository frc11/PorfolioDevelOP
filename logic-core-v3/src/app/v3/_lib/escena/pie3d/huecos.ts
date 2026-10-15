import * as THREE from 'three'

/**
 * [PULIDO 22] T3 · EL HUECO DE CADA PIEZA DEL PIE EN EL PISO, como el del logo. [PULIDO 23] U3 · AJUSTADO, NO UN POZO: en T3 los bloques de
 * adentro de la huella bajaban (un pozo rectangular, de bloques enteros, con manchas de sombra; debajo de los grupos, compartido). Ahora el
 * hueco es la SILUETA de la placa (su rectángulo redondeado, con su radio) con `margen` de más, y se recorta en el DIBUJO del piso por
 * píxel (como el del logo): adentro el piso no se dibuja, la placa queda al ras; alrededor, un labio limpio (un anillo apenas oscuro de
 * `labio` u). Se abre mientras la pieza cae (crece desde el centro con su vuelco). Sólo las placas (botones, redes, la placa del form):
 * los textos se apoyan sobre el piso (`caida.ts`). Los escribe `huecosDeLaCaida.ts` en cada cuadro; los usa el dibujo del piso
 * (`final/enElPiso.ts`).
 * [PULIDO 28] AA4 · AJUSTADOS AL BLOQUE: el hueco es la silueta exacta (sin margen ni labio) y el piso alrededor queda normal: sin el
 * techo de los bloques alrededor (bajaba una banda y debajo de los grupos se juntaba: el mail y WhatsApp en un rectángulo hundido, las
 * redes en un bloque entero) y el núcleo y la bajada sólo para los bloques enteros adentro (los que tocaban el borde quedaban hundidos
 * afuera). El bloque que cruza el borde se corta ahí y su cara la arma la pared del pozo (`pozos.ts`), hasta su tope.
 */
export const MAXIMO_DE_HUECOS_DEL_PIE = 32

export const HUECO_DEL_PIE = {
  /** Lo que el hueco sobra de la placa (parte). [PULIDO 28] AA4 · nada: la silueta exacta (era 3 %, con un labio oscuro de 0,05 u). */
  margen: 0,
  /**
   * [PULIDO 27] Y2 b · lo hondo que tiene de más que la placa (u) y desde dónde bajan los bloques de adentro (la parte de su camino del
   * medio al borde: bajan antes de que llegue el corte). [PULIDO 28] AA5 · se abre con el vuelco (ya no por tiempo hasta antes del contacto).
   */
  hondoDeMas: 0.04,
  bajanAntes: 0.5,
} as const

/**
 * [PULIDO 27] Y2 c · d · NINGÚN BLOQUE POR ENCIMA DE LO QUE ESTÁ ACOSTADO: alrededor de cada hueco (las placas, el form) y del logo, los
 * bloques quedan a ras del labio o por debajo (`labio`, u respecto del piso) en una banda (`banda`, u desde el borde) y recién después
 * vuelven a subir (`ancho`, u, con el borde irregular de la quietud). Los textos, igual con su techo bajo (`TECHO_DE_LOS_TEXTOS.banda`).
 * [PULIDO 28] AA4 · sólo alrededor del logo (sus bordes, aprobados): los huecos de las piezas, con el piso normal.
 */
export const TECHO_DE_LOS_HUECOS = { labio: -0.01, banda: 0.7, ancho: 2.5, alto: 9 } as const

export const HUECOS_DEL_PIE = {
  /** (centro x, centro z, medio ancho a lo largo de `derecha`, medio fondo a lo largo de `atras`), en el mundo (la base del pie). */
  uHuecosDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  /** (cuánto se abrió, 0 a 1; el radio de sus esquinas, u; [PULIDO 28] AA5 · lo hondo ahora, u, y la franja abierta desde el canto, 0 a 1). */
  uFormaDeLosHuecosDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  uCuantosHuecosDelPie: { value: 0 },
}

/**
 * [PULIDO 25] W2 a · LA QUIETUD DEBAJO DE LO QUE SE LEE: acostadas, la energía del piso (el brillo de las juntas, los pistones) pasaba por
 * debajo de los textos, los botones, los enlaces y el form. Por pieza acostada (todas: placas y textos), su huella. Las escribe
 * `huecosDeLaCaida.ts`. [PULIDO 26] X2 · DISIMULADA: en W2 la zona quedaba como un rectángulo llano y apagado (se veía el límite). Ahora
 * el piso NO se aplana (sólo el núcleo debajo de cada placa, que queda en su hueco): alrededor los bloques conservan su relieve (sigue la
 * energía), los pistones se FRENAN en una altura quieta por racimo (`piston`, u: no bajan a cero ni se mueven), la energía se ATENÚA
 * (`brillo` en la simulación, `juntas` en el dibujo: un brillo mínimo vivo) y el borde es IRREGULAR y ancho: por bloque (la celda de la
 * grilla), con `margen` y `borde` (u) movidos por un ruido de baja frecuencia (`escala` bloques por onda, `irregular` u de más o de menos):
 * sin forma de rectángulo.
 */
export const QUIETUD = { margen: 0.4, borde: 3.5, irregular: 2.4, escala: 4, brillo: 0.4, juntas: 0.75, nucleo: 0.2, piston: 0.35 } as const

/**
 * [PULIDO 26] X2 · debajo de un TEXTO acostado (sólo sus letras tapan el piso: entre ellas se ve) el piso no se aplana: los bloques tienen
 * un TECHO bajo (`bajo`, u: pueden quedar más abajo, con su variación) que sube hasta dejar de contar en `ancho` u por afuera de la huella
 * (más `margen`), con el borde irregular de la quietud: ninguna letra queda tapada y no se ve un rectángulo llano.
 */
// [PULIDO 27] Y2 d · con una banda plana (`banda`, u) antes de subir: a 0,5 u de un texto ya podía haber bloques de casi 0,9 u (la línea
// legal quedaba tapada).
export const TECHO_DE_LOS_TEXTOS = { bajo: 0.22, alto: 9, margen: 0.25, ancho: 3, sube: 0.25, banda: 0.7 } as const

export const QUIETUD_DEL_PIE = {
  /** (centro x, centro z, medio ancho, medio fondo) en la base del pie y cuánto vale (0 a 1, con el vuelco). */
  uQuietudDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  uFuerzaDeLaQuietud: { value: new Float32Array(MAXIMO_DE_HUECOS_DEL_PIE) },
  /** [PULIDO 26] X2 · si es un texto (1: el techo bajo) o una placa (0: el núcleo, adentro de su hueco). */
  uEsTextoLaQuietud: { value: new Float32Array(MAXIMO_DE_HUECOS_DEL_PIE) },
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
// [PULIDO 28] AA5 · hasta dónde llega la franja abierta (a lo largo de atrás, desde el centro de la huella).
float limiteDeLaFranja( float medio, float franja ) {
	return - medio + 2.0 * medio * franja;
}
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
		vec2 local = vec2( dot( d, uBaseDelPie.xy ), dot( d, uBaseDelPie.zw ) );
		vec2 q = abs( local ) - medio + r;
		// [PULIDO 28] AA5 · sólo la franja debajo de la pieza: desde su borde cercano al canto (hacia atrás está el lejano).
		m = min( m, max( length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 ) - r, local.y - limiteDeLaFranja( medio.y, forma.w ) ) );
	}
	return m;
}
`

/**
 * [PULIDO 25] W2 a · `quietudDelPie( xz )`: cuánto se calma la energía del piso ahí (0 a 1), por bloque y con el borde irregular;
 * [PULIDO 26] X2 · `nucleoDeLaQuietud( xz )`: la huella misma (lo que la pieza tapa: ahí sí se aplana). Necesitan `uBaseDelPie` y `uLado`.
 */
export const QUIETUD_DEL_PIE_GLSL = /* glsl */ `
uniform vec4 uQuietudDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform float uFuerzaDeLaQuietud[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform float uEsTextoLaQuietud[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform int uCuantasQuietudes;
float azarDeLaQuietud( vec2 c ) {
	return fract( sin( dot( c, vec2( 127.1, 311.7 ) ) ) * 43758.5453 );
}
// Un ruido de valor de baja frecuencia sobre las celdas de la grilla (una onda cada \`escala\` bloques).
float ruidoDeLaQuietud( vec2 celda ) {
	vec2 q = celda / ${f(QUIETUD.escala)};
	vec2 i = floor( q );
	vec2 u = q - i;
	u = u * u * ( 3.0 - 2.0 * u );
	float lento = mix( mix( azarDeLaQuietud( i ), azarDeLaQuietud( i + vec2( 1.0, 0.0 ) ), u.x ), mix( azarDeLaQuietud( i + vec2( 0.0, 1.0 ) ), azarDeLaQuietud( i + 1.0 ), u.x ), u.y );
	// Y una octava más corta (bloque a bloque, a veces sí y a veces no): el borde no sigue la forma de la huella.
	return 0.65 * lento + 0.35 * azarDeLaQuietud( celda + 31.0 );
}
float afueraDeLaHuella( vec2 xz, vec4 h ) {
	vec2 d = xz - h.xy;
	return max( abs( dot( d, uBaseDelPie.xy ) ) - h.z, abs( dot( d, uBaseDelPie.zw ) ) - h.w );
}
float quietudDelPie( vec2 xz ) {
	vec2 celda = floor( xz / uLado );
	vec2 centro = ( celda + 0.5 ) * uLado;
	float r = ruidoDeLaQuietud( celda );
	float m = 0.0;
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantasQuietudes ) break;
		float afuera = afueraDeLaHuella( centro, uQuietudDelPie[ k ] ) - ${f(QUIETUD.margen)} - ( r - 0.5 ) * ${f(QUIETUD.irregular)};
		m = max( m, uFuerzaDeLaQuietud[ k ] * ( 1.0 - smoothstep( 0.0, ${f(QUIETUD.borde)} * ( 0.6 + 0.8 * r ), afuera ) ) );
	}
	return m;
}
float nucleoDeLaQuietud( vec2 xz ) {
	float m = 0.0;
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantasQuietudes ) break;
		// [PULIDO 28] AA4 · sólo los bloques enteros adentro (el del borde se corta y queda a su altura).
		m = max( m, uFuerzaDeLaQuietud[ k ] * ( 1.0 - uEsTextoLaQuietud[ k ] ) * step( afueraDeLaHuella( xz, uQuietudDelPie[ k ] ) + 0.7072 * uLado, 0.0 ) );
	}
	return m;
}
// [PULIDO 26] X2 · el techo de los bloques debajo y cerca de los textos acostados (por bloque, con el borde irregular).
float techoDeLosTextos( vec2 xz ) {
	vec2 celda = floor( xz / uLado );
	vec2 centro = ( celda + 0.5 ) * uLado;
	float r = ruidoDeLaQuietud( celda + 17.0 );
	float techo = ${f(TECHO_DE_LOS_TEXTOS.alto)};
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantasQuietudes ) break;
		if ( uEsTextoLaQuietud[ k ] < 0.5 ) continue;
		float afuera = afueraDeLaHuella( centro, uQuietudDelPie[ k ] ) - ${f(TECHO_DE_LOS_TEXTOS.margen)} - r * 0.5;
		float bajo = mix( ${f(TECHO_DE_LOS_TEXTOS.alto)}, ${f(TECHO_DE_LOS_TEXTOS.bajo)}, uFuerzaDeLaQuietud[ k ] );
		techo = min( techo, mix( bajo, ${f(TECHO_DE_LOS_TEXTOS.alto)}, smoothstep( ${f(TECHO_DE_LOS_TEXTOS.banda)}, ${f(TECHO_DE_LOS_TEXTOS.banda)} + ${f(TECHO_DE_LOS_TEXTOS.ancho)} * ( 0.6 + 0.8 * r ), afuera ) ) );
	}
	return techo;
}
`

/**
 * [PULIDO 27] Y2 b · c · LO QUE LA SIMULACIÓN DEL PISO HACE CON LOS HUECOS (pide `HUECOS_DEL_PIE_GLSL`, `QUIETUD_DEL_PIE_GLSL`, `uBaseDelPie`,
 * `uLado`): `bajaEnLosHuecos( xz )`, cuánto bajan los bloques de adentro de cada hueco que se abre (u: del medio hacia el borde, hasta su
 * fondo, antes de que llegue el corte). [PULIDO 28] AA4 · sólo los bloques enteros adentro; el techo de alrededor se borró.
 */
export const BAJA_EN_LOS_HUECOS_GLSL = /* glsl */ `
float bajaEnLosHuecos( vec2 xz ) {
	float baja = 0.0;
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantosHuecosDelPie ) break;
		vec4 h = uHuecosDelPie[ k ];
		vec4 forma = uFormaDeLosHuecosDelPie[ k ];
		if ( forma.x <= 0.0 ) continue;
		vec2 d = xz - h.xy;
		vec2 q = ( vec2( abs( dot( d, uBaseDelPie.xy ) ), abs( dot( d, uBaseDelPie.zw ) ) ) + 0.7072 * uLado ) / max( h.zw, vec2( 1e-3 ) );
		float rho = max( q.x, q.y );
		if ( rho >= 1.0 || dot( d, uBaseDelPie.zw ) + 0.7072 * uLado > limiteDeLaFranja( h.w, forma.w ) ) continue;
		baja = max( baja, forma.z * smoothstep( max( 0.0, rho - ${f(HUECO_DEL_PIE.bajanAntes)} ), max( 0.05, rho - 0.05 ), forma.x ) );
	}
	return baja;
}
`
