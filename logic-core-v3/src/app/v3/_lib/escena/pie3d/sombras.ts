import * as THREE from 'three'

/**
 * [RETOQUE DEL PIE] P2 · LAS SOMBRAS DE CONTACTO DEL PIE, sobre el piso vivo — las pinta el propio piso (como la mancha del
 * logo, `sombra/enElPiso.ts`): un plano apoyado quedaría tapado por los bloques que suben; así la sombra sigue las olas.
 * Cada pieza deja un rectángulo blando en el piso, debajo de ella: más oscuro y nítido cuanto más cerca flota, y nada lejos
 * del piso. Las escribe la escena del pie en cada cuadro; sin pie a la vista, ninguna (el lazo sale enseguida).
 */
export const MAXIMO_DE_SOMBRAS_DEL_PIE = 24

export const SOMBRA_DEL_PIE = {
  /** El alfa al ras y cuánto se apaga con la altura (u): `alfa · e^(−h / caida)`. */
  alfa: 0.34,
  caida: 2.2,
  /** Lo blando del borde (u): `blanda[0] + blanda[1] · h`. */
  blanda: [0.12, 0.3],
  /** Lo que la mancha sobra de la pieza a cada lado (u). */
  sobra: 0.08,
} as const

export const SOMBRAS_DEL_PIE = {
  /** (centro x, centro z, medio ancho, medio fondo), en el mundo. */
  uSombrasDelPie: { value: Array.from({ length: MAXIMO_DE_SOMBRAS_DEL_PIE }, () => new THREE.Vector4()) },
  /** (blandura, alfa, 0, 0). */
  uFormaDeLasSombrasDelPie: { value: Array.from({ length: MAXIMO_DE_SOMBRAS_DEL_PIE }, () => new THREE.Vector4()) },
  uCuantasSombrasDelPie: { value: 0 },
}

/** `sombraDelPie( xz )`: el alfa de las sombras del pie en ese punto del piso (la más oscura de las que lo cubren). */
export const SOMBRAS_DEL_PIE_GLSL = /* glsl */ `
uniform vec4 uSombrasDelPie[ ${MAXIMO_DE_SOMBRAS_DEL_PIE} ];
uniform vec4 uFormaDeLasSombrasDelPie[ ${MAXIMO_DE_SOMBRAS_DEL_PIE} ];
uniform int uCuantasSombrasDelPie;
float sombraDelPie( vec2 xz ) {
	float s = 0.0;
	for ( int i = 0; i < ${MAXIMO_DE_SOMBRAS_DEL_PIE}; i ++ ) {
		if ( i >= uCuantasSombrasDelPie ) break;
		vec4 c = uSombrasDelPie[ i ];
		vec2 f = uFormaDeLasSombrasDelPie[ i ].xy;
		vec2 q = abs( xz - c.xy ) - c.zw;
		float d = length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 );
		s = max( s, f.y * ( 1.0 - smoothstep( - f.x, f.x, d ) ) );
	}
	return s;
}`

/** Dónde se aplica (después de la mancha del logo, con su mismo color). */
export const APLICAR_LAS_SOMBRAS_DEL_PIE_GLSL = /* glsl */ `gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, sombraDelPie( vPiso.xz ) );`

/** La sombra de una pieza: su alfa y su blandura con la altura `h` (u) de su borde de abajo sobre el piso. */
export function formaDeLaSombra(h: number): { readonly alfa: number; readonly blanda: number } {
  const alto = Math.max(0, h)
  return { alfa: SOMBRA_DEL_PIE.alfa * Math.exp(-alto / SOMBRA_DEL_PIE.caida), blanda: SOMBRA_DEL_PIE.blanda[0] + SOMBRA_DEL_PIE.blanda[1] * alto }
}
