import * as THREE from 'three'

/**
 * [NOCTURNO FINAL] B4 · LAS PIEZAS DEL PIE PARA EL POLVO QUE CAE — las motas que caen (con la página quieta) no atraviesan
 * las piezas del pie (las placas, los botones, los enlaces, el formulario: no el texto suelto): si una entra a una pieza,
 * vuelve afuera. Por la cara de ARRIBA (la que mira hacia arriba en el mundo) se apoya, pero sólo un cupo (`cupo`, por
 * mota y al azar: no se acumulan); las demás salen por la cara más cercana que no es la de arriba y siguen cayendo al
 * costado. La apoyada queda en su modo de caída, frenada por la cara en cada paso: si la pieza se mueve, la lleva (o la
 * suelta). Hasta `cajas` piezas, las de la vista (el pie de volumen escribe sus cajas en cada cuadro: `armadas.ts`).
 *
 * Cada caja: la matriz del mundo a la pieza (sus unidades son px del DOM: la pieza está escalada) y su caja en la pieza
 * (centro y media medida, px); `margen` px afuera de la cara.
 */
export const POLVO_EN_EL_PIE = { cajas: 12, cupo: 0.3, margen: 3 } as const

export const CAJAS_DEL_PIE = {
  uCajasDelPie: { value: Array.from({ length: POLVO_EN_EL_PIE.cajas }, () => new THREE.Matrix4()) },
  uCentroDelPie: { value: Array.from({ length: POLVO_EN_EL_PIE.cajas }, () => new THREE.Vector4()) },
  uMedidaDelPie: { value: Array.from({ length: POLVO_EN_EL_PIE.cajas }, () => new THREE.Vector4()) },
  uCuantasCajasDelPie: { value: 0 },
}

const CENTRO = new THREE.Vector3()
const MEDIDA = new THREE.Vector3()

/** Escribe la caja `n` (la pieza, con la matriz de su mundo ya al día y su caja en la pieza); devuelve la siguiente. */
export function escribirLaCaja(n: number, mundoDeLaPieza: THREE.Matrix4, caja: THREE.Box3): number {
  if (n >= POLVO_EN_EL_PIE.cajas || caja.isEmpty()) return n
  CAJAS_DEL_PIE.uCajasDelPie.value[n].copy(mundoDeLaPieza).invert()
  caja.getCenter(CENTRO)
  caja.getSize(MEDIDA).multiplyScalar(0.5)
  CAJAS_DEL_PIE.uCentroDelPie.value[n].set(CENTRO.x, CENTRO.y, CENTRO.z, 0)
  CAJAS_DEL_PIE.uMedidaDelPie.value[n].set(MEDIDA.x, MEDIDA.y, MEDIDA.z, 0)
  return n + 1
}

/** La simulación del polvo: `chocarConElPie( p, v, azar )` saca de las piezas a la mota que cae (y apoya a su cupo). */
export const CAJAS_DEL_PIE_GLSL = /* glsl */ `
uniform mat4 uCajasDelPie[ ${String(POLVO_EN_EL_PIE.cajas)} ];
uniform vec4 uCentroDelPie[ ${String(POLVO_EN_EL_PIE.cajas)} ];
uniform vec4 uMedidaDelPie[ ${String(POLVO_EN_EL_PIE.cajas)} ];
uniform int uCuantasCajasDelPie;
// La normal en el mundo de la cara de la pieza i en el eje k (0, 1, 2) del lado s (±1).
vec3 normalDeLaCara( int i, int k, float s ) {
	vec3 e = k == 0 ? vec3( 1.0, 0.0, 0.0 ) : ( k == 1 ? vec3( 0.0, 1.0, 0.0 ) : vec3( 0.0, 0.0, 1.0 ) );
	return normalize( transpose( mat3( uCajasDelPie[ i ] ) ) * ( e * s ) );
}
void chocarConElPie( inout vec3 p, inout vec3 v, float azar ) {
	for ( int i = 0; i < ${String(POLVO_EN_EL_PIE.cajas)}; i++ ) {
		if ( i >= uCuantasCajasDelPie ) break;
		vec3 m = uMedidaDelPie[ i ].xyz;
		vec3 q = ( uCajasDelPie[ i ] * vec4( p, 1.0 ) ).xyz - uCentroDelPie[ i ].xyz;
		vec3 hondo = m - abs( q );
		if ( hondo.x <= 0.0 || hondo.y <= 0.0 || hondo.z <= 0.0 ) continue;
		vec3 lado = sign( q + vec3( 1e-6 ) );
		bool apoya = fract( azar * 13.37 ) < ${POLVO_EN_EL_PIE.cupo.toFixed(3)};
		// La cara por la que sale: la de menos hondura, sin la de arriba; el cupo que acaba de cruzar la de arriba (en su
		// cuarto de arriba: no salta desde el costado) se apoya ahí.
		int k = -1;
		float menor = 1e9;
		for ( int j = 0; j < 3; j++ ) {
			float h = j == 0 ? hondo.x : ( j == 1 ? hondo.y : hondo.z );
			float s = j == 0 ? lado.x : ( j == 1 ? lado.y : lado.z );
			float medida = j == 0 ? m.x : ( j == 1 ? m.y : m.z );
			bool arriba = normalDeLaCara( i, j, s ).y > 0.5;
			if ( arriba && apoya && h < 0.25 * medida ) { k = j; menor = -1.0; break; }
			if ( arriba ) continue;
			if ( h < menor ) { menor = h; k = j; }
		}
		if ( k < 0 ) continue;
		float afuera = ( k == 0 ? m.x : ( k == 1 ? m.y : m.z ) ) + ${POLVO_EN_EL_PIE.margen.toFixed(1)};
		if ( k == 0 ) q.x = lado.x * afuera;
		else if ( k == 1 ) q.y = lado.y * afuera;
		else q.z = lado.z * afuera;
		p = ( inverse( uCajasDelPie[ i ] ) * vec4( q + uCentroDelPie[ i ].xyz, 1.0 ) ).xyz;
		if ( menor < 0.0 ) v = vec3( 0.0 );
	}
}
`
