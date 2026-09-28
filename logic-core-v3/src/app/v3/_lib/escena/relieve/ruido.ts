/**
 * [ESCENA 5] 5e · EL RUIDO DEL RELIEVE — la idea de «Isometric Noise Field» (bloques cuadrados con
 * alturas escalonadas por ruido), escrita de cero: la licencia de la referencia no está publicada
 * (HANDOFF-4) y de ahí se toma la idea, no el código.
 *
 * Un ruido de valor en tres dimensiones (dos de lugar y una de tiempo), suave entre los nudos de la
 * red, y cuantizado en `niveles` escalones: eso da mesetas y terrazas en vez de una superficie lisa.
 * Con `relieve=vivo` la tercera dimensión avanza `velocidad` por segundo (muy lento); si no, quieto.
 */
export const RELIEVE = {
  /** R1 · las celdas de la capa gruesa: cuántos escalones, de qué alto, y la escala del ruido. */
  paredes: { niveles: 5, paso: 0.7, escalaAngular: 2.4, escalaVertical: 0.34 },
  /** R2 · el piso de afuera: el lado de cada bloque, cuántos escalones, su alto y la escala del ruido. */
  piso: { lado: 2.2, niveles: 4, paso: 0.4, escala: 0.11 },
  /** Cuánto avanza el ruido por segundo con `relieve=vivo`. */
  velocidad: 0.018,
} as const

/** R2 · el tiempo del ruido del piso: lo escribe el piso y lo leen también las copias paradas encima. */
export const TIEMPO_DEL_PISO = { uTiempoDelRuido: { value: 0 } }

/** El ruido y su escalón, en GLSL. */
export const RUIDO_GLSL = /* glsl */ `
float hashDelRelieve( vec3 p ) {
	p = fract( p * 0.3183099 + 0.1 );
	p *= 17.0;
	return fract( p.x * p.y * p.z * ( p.x + p.y + p.z ) );
}
float ruidoDelRelieve( vec3 x ) {
	vec3 i = floor( x );
	vec3 f = fract( x );
	f = f * f * ( 3.0 - 2.0 * f );
	return mix(
		mix( mix( hashDelRelieve( i ), hashDelRelieve( i + vec3( 1.0, 0.0, 0.0 ) ), f.x ), mix( hashDelRelieve( i + vec3( 0.0, 1.0, 0.0 ) ), hashDelRelieve( i + vec3( 1.0, 1.0, 0.0 ) ), f.x ), f.y ),
		mix( mix( hashDelRelieve( i + vec3( 0.0, 0.0, 1.0 ) ), hashDelRelieve( i + vec3( 1.0, 0.0, 1.0 ) ), f.x ), mix( hashDelRelieve( i + vec3( 0.0, 1.0, 1.0 ) ), hashDelRelieve( i + vec3( 1.0, 1.0, 1.0 ) ), f.x ), f.y ),
		f.z
	);
}
// El escalón: 0, 1, … niveles − 1.
float escalonDelRelieve( float n, float niveles ) {
	return min( floor( clamp( n, 0.0, 0.9999 ) * niveles ), niveles - 1.0 );
}
`

/** R2 · el alto del bloque del piso en (x, z), en GLSL: lo comparten el piso y las copias paradas encima. */
export const ALTO_DEL_PISO_GLSL = /* glsl */ `
float altoDelPiso( vec2 xz, float tiempo ) {
	vec2 celda = floor( xz / ${RELIEVE.piso.lado.toFixed(2)} ) + 0.5;
	float n = ruidoDelRelieve( vec3( celda * ${RELIEVE.piso.lado.toFixed(2)} * ${RELIEVE.piso.escala.toFixed(3)}, tiempo ) );
	return escalonDelRelieve( n, ${RELIEVE.piso.niveles.toFixed(1)} ) * ${RELIEVE.piso.paso.toFixed(3)};
}
`
