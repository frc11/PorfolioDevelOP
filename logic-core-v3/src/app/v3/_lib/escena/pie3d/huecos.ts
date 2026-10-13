import * as THREE from 'three'

/**
 * [PULIDO 22] T3 · EL HUECO DE CADA PIEZA DEL PIE EN EL PISO, como el del logo: mientras la pieza cae, el piso le abre un hueco con su
 * huella (el rectángulo de la pieza en la base del pie, como su sombra de contacto: `final/sombraDeLaPieza.ts`) y los bloques de adentro
 * bajan `hondo`; acostada queda al ras adentro de él. Antes la cara quedaba al ras del piso SIN hueco y los bloques la cortaban (las
 * redes se veían como rayitas, y su hover también quedaba tapado). Los escribe `huecosDeLaCaida.ts` en cada cuadro; los usa la
 * simulación del piso (`final/enElPiso.ts`).
 */
export const MAXIMO_DE_HUECOS_DEL_PIE = 32

export const HUECO_DEL_PIE = {
  /** Cuánto bajan los bloques del hueco abierto (u). */
  hondo: 1.2,
} as const

export const HUECOS_DEL_PIE = {
  /** (centro x, centro z, medio ancho a lo largo de `derecha`, medio fondo a lo largo de `atras`), en el mundo (la base del pie). */
  uHuecosDelPie: { value: Array.from({ length: MAXIMO_DE_HUECOS_DEL_PIE }, () => new THREE.Vector4()) },
  /** Cuánto se abrió cada uno (0 a 1). */
  uAperturaDeLosHuecosDelPie: { value: new Float32Array(MAXIMO_DE_HUECOS_DEL_PIE) },
  uCuantosHuecosDelPie: { value: 0 },
}

/** `huecoDelPie( xz )`: cuánto está abierto el hueco de una pieza en ese punto (un bloque que toca la huella baja entero). */
export const HUECOS_DEL_PIE_GLSL = /* glsl */ `
uniform vec4 uHuecosDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform float uAperturaDeLosHuecosDelPie[ ${String(MAXIMO_DE_HUECOS_DEL_PIE)} ];
uniform int uCuantosHuecosDelPie;
float huecoDelPie( vec2 xz ) {
	float m = 0.0;
	for ( int k = 0; k < ${String(MAXIMO_DE_HUECOS_DEL_PIE)}; k ++ ) {
		if ( k >= uCuantosHuecosDelPie ) break;
		vec4 h = uHuecosDelPie[ k ];
		vec2 d = xz - h.xy;
		float afuera = max( abs( dot( d, uBaseDelPie.xy ) ) - h.z, abs( dot( d, uBaseDelPie.zw ) ) - h.w );
		m = max( m, uAperturaDeLosHuecosDelPie[ k ] * step( afuera, 0.5 * uLado ) );
	}
	return m;
}
`
