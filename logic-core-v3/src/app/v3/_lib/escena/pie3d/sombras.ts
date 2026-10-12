import * as THREE from 'three'

/**
 * [RETOQUE DEL PIE] P2 · LAS SOMBRAS DE CONTACTO DEL PIE, sobre el piso vivo — las pinta el propio piso (como la mancha del
 * logo, `sombra/enElPiso.ts`): un plano apoyado quedaría tapado por los bloques que suben; así la sombra sigue las olas.
 * Cada pieza deja un rectángulo blando en el piso, debajo de ella: más oscuro y nítido cuanto más cerca flota, y nada lejos
 * del piso. Las escribe la escena del pie en cada cuadro; sin pie a la vista, ninguna (el lazo sale enseguida).
 * [NOCTURNO FINAL] A4 · de pie en la pared, ninguna (eran sombras raras bajo una pared que flota). [PULIDO 19] Q4 · las piezas
 * que CAEN en el final sí la tienen (`final/sombraDeLaPieza.ts`, `pie3d/caida.ts`): el rectángulo va en la base del pie
 * (`uBaseDeLasSombrasDelPie`: `derecha` y `atras` de la cámara de antes del final), no en los ejes del mundo.
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
  /** (centro x, centro z, medio ancho a lo largo de `derecha`, medio fondo a lo largo de `atras`), en el mundo. */
  uSombrasDelPie: { value: Array.from({ length: MAXIMO_DE_SOMBRAS_DEL_PIE }, () => new THREE.Vector4()) },
  /** (blandura, alfa, 0, 0). */
  uFormaDeLasSombrasDelPie: { value: Array.from({ length: MAXIMO_DE_SOMBRAS_DEL_PIE }, () => new THREE.Vector4()) },
  /** La base de los rectángulos en el plano del piso: (derecha x, derecha z, atrás x, atrás z), unitarios. */
  uBaseDeLasSombrasDelPie: { value: new THREE.Vector4(1, 0, 0, -1) },
  uCuantasSombrasDelPie: { value: 0 },
}

/** `sombraDelPie( xz )`: el alfa de las sombras del pie en ese punto del piso (la más oscura de las que lo cubren). */
export const SOMBRAS_DEL_PIE_GLSL = /* glsl */ `
uniform vec4 uSombrasDelPie[ ${MAXIMO_DE_SOMBRAS_DEL_PIE} ];
uniform vec4 uFormaDeLasSombrasDelPie[ ${MAXIMO_DE_SOMBRAS_DEL_PIE} ];
uniform vec4 uBaseDeLasSombrasDelPie;
uniform int uCuantasSombrasDelPie;
float sombraDelPie( vec2 xz ) {
	float s = 0.0;
	for ( int i = 0; i < ${MAXIMO_DE_SOMBRAS_DEL_PIE}; i ++ ) {
		if ( i >= uCuantasSombrasDelPie ) break;
		vec4 c = uSombrasDelPie[ i ];
		vec2 f = uFormaDeLasSombrasDelPie[ i ].xy;
		// El punto en la base del pie (a lo largo de derecha y de atrás), y la distancia con signo al rectángulo.
		vec2 r = xz - c.xy;
		vec2 q = abs( vec2( dot( r, uBaseDeLasSombrasDelPie.xy ), dot( r, uBaseDeLasSombrasDelPie.zw ) ) ) - c.zw;
		float d = length( max( q, 0.0 ) ) + min( max( q.x, q.y ), 0.0 );
		s = max( s, f.y * ( 1.0 - smoothstep( - f.x, f.x, d ) ) );
	}
	return s;
}`

/** Dónde se aplica (después de la mancha del logo, con su mismo color). */
export const APLICAR_LAS_SOMBRAS_DEL_PIE_GLSL = /* glsl */ `gl_FragColor.rgb = mix( gl_FragColor.rgb, COLOR_DEL_CONTACTO, sombraDelPie( vPiso.xz ) );`

/** El alfa de la sombra de una pieza con la altura `h` (u) de su borde de abajo sobre el piso. */
export const alfaDeLaSombra = (h: number): number => SOMBRA_DEL_PIE.alfa * Math.exp(-Math.max(0, h) / SOMBRA_DEL_PIE.caida)

/** Y su blandura (u). */
export const blandaDeLaSombra = (h: number): number => SOMBRA_DEL_PIE.blanda[0] + SOMBRA_DEL_PIE.blanda[1] * Math.max(0, h)

/** La sombra de una pieza: su alfa y su blandura con la altura `h` (u) de su borde de abajo sobre el piso. */
export function formaDeLaSombra(h: number): { readonly alfa: number; readonly blanda: number } {
  return { alfa: alfaDeLaSombra(h), blanda: blandaDeLaSombra(h) }
}
