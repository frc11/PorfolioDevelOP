import { type Punto, type Trazo, circulo, disco, repartir, trazar } from './trazos'

/**
 * [B4] LA RED NEURONAL — el símbolo de IA y automatizaciones en la sección Servicios del home (reemplaza al robot de antes: «nada
 * de robot»). Cuatro capas de nodos (3, 4, 4 y 2) unidas todas con todas entre capas vecinas; los nodos son anillos con su relleno,
 * y las conexiones, líneas. El tiempo lo pone el sombreador (`VIDA_DE_LA_RED_GLSL`): en cada ciclo se prende un subconjunto de nodos
 * capa por capa y un pulso corre por cada conexión entre dos nodos prendidos, de izquierda a derecha.
 *
 * Lo que cada nanobot es va en `w` (el sombreador lo decodifica):
 *
 *   10 + L + k·0,1 + r·0,05    el nodo k de la capa L: su anillo (r 0) o su relleno (r 1).
 *   20 + L·100 + k·10 + j + u·0,98    la conexión del nodo k de la capa L al j de la capa L+1, a la fracción u de su largo.
 */

export const RED_NEURONAL = {
  /** Cuántos nodos tiene cada capa, de izquierda a derecha. */
  capas: [3, 4, 4, 2] as const,
  /** Dónde va cada capa (x) y cuánto ocupa la columna de nodos (y, de −alto a alto). */
  ancho: 0.78,
  alto: 0.62,
  anillo: 0.075,
  relleno: 0.045,
  /** El ciclo de los pulsos (s): las capas se prenden a 0, ¼, ½ y ¾ de él. */
  cicloS: 2.8,
  /** Qué parte de los nodos se prende en cada ciclo (el resto queda apagado ese ciclo). */
  prendidos: 0.62,
} as const

export interface NodoDeLaRed {
  readonly capa: number
  readonly indice: number
  readonly x: number
  readonly y: number
}

/** Los nodos, capa por capa. */
export function nodosDeLaRed(): readonly NodoDeLaRed[] {
  const { capas, ancho, alto } = RED_NEURONAL
  return capas.flatMap((cuantos, capa) => {
    const x = -ancho + (2 * ancho * capa) / (capas.length - 1)
    return Array.from({ length: cuantos }, (_, indice) => ({ capa, indice, x, y: alto - (2 * alto * indice) / (cuantos - 1) }))
  })
}

/** Las conexiones: cada nodo con todos los de la capa siguiente. */
export function conexionesDeLaRed(): readonly { readonly de: NodoDeLaRed; readonly a: NodoDeLaRed }[] {
  const nodos = nodosDeLaRed()
  return nodos.flatMap((de) => nodos.filter((a) => a.capa === de.capa + 1).map((a) => ({ de, a })))
}

export const wDelNodo = (capa: number, indice: number, relleno: boolean): number => 10 + capa + indice * 0.1 + (relleno ? 0.05 : 0)
export const wDeLaConexion = (capa: number, k: number, j: number, u: number): number => 20 + capa * 100 + k * 10 + j + u * 0.98

/** La red: `n` nanobots exactos (los rellenos por área, el resto por largo de trazo, a paso constante). */
export function redNeuronal(n: number, azar: () => number): Punto[] {
  const { anillo, relleno } = RED_NEURONAL
  const nodos = nodosDeLaRed()
  const trazos: Trazo[] = [
    ...nodos.map((nodo) => ({ vertices: circulo(nodo.x, nodo.y, anillo, 40), w: wDelNodo(nodo.capa, nodo.indice, false), cerrado: true })),
    ...conexionesDeLaRed().map(({ de, a }) => {
      const largo = Math.hypot(a.x - de.x, a.y - de.y)
      const [dx, dy] = [(a.x - de.x) / largo, (a.y - de.y) / largo]
      return {
        vertices: [[de.x + dx * anillo, de.y + dy * anillo], [a.x - dx * anillo, a.y - dy * anillo]] as const,
        w: (u: number) => wDeLaConexion(de.capa, de.indice, a.indice, u),
      }
    }),
  ]
  const [deRellenos, deTrazos] = repartir(n, [0.12, 0.88])
  const porNodo = repartir(deRellenos, nodos.map(() => 1))
  const rellenos = nodos.flatMap((nodo, i) => disco(nodo.x, nodo.y, relleno, porNodo[i], wDelNodo(nodo.capa, nodo.indice, true), 0.01))
  return [...rellenos, ...trazar(trazos, deTrazos, 0.02, azar)]
}

const f = (x: number): string => x.toFixed(5)
const R = RED_NEURONAL

/**
 * La vida de la red en el sombreador: `vidaDeLaRed(d, t, quieto)` devuelve (cuánto se ve, cuánto brilla). Un nodo se prende en el
 * momento de su capa (y se apaga despacio); una conexión lleva su pulso mientras va de su capa a la siguiente, si los dos nodos que
 * une están prendidos en este ciclo. Con movimiento reducido, todo visible y quieto.
 */
export const VIDA_DE_LA_RED_GLSL = /* glsl */ `
float azarDe( float x ) { return fract( sin( x * 12.9898 ) * 43758.5453 ); }
float prendido( float capa, float indice, float ciclo ) {
	return step( 1.0 - ${f(R.prendidos)}, azarDe( capa * 10.0 + indice + ciclo * 7.13 + 0.5 ) );
}
vec2 vidaDeLaRed( vec4 d, float t, float quieto ) {
	if ( quieto > 0.5 ) return vec2( 1.0, 0.0 );
	float tc = t / ${f(R.cicloS)};
	float ciclo = floor( tc );
	float fase = tc - ciclo;
	float capas = ${f(R.capas.length)};
	if ( d.w < 20.0 ) {
		float q = d.w - 10.0;
		float capa = floor( q );
		float s = ( q - capa ) * 10.0;
		float indice = floor( s + 0.01 );
		float esRelleno = step( 0.25, s - indice );
		float desde = fract( fase - capa / capas );
		float brillo = prendido( capa, indice, ciclo ) * exp( - desde / 0.09 );
		return vec2( mix( 0.9, 0.12 + 0.88 * brillo, esRelleno ), brillo );
	}
	float q = d.w - 20.0;
	float capa = floor( q / 100.0 );
	float r = q - capa * 100.0;
	float k = floor( r / 10.0 + 0.0001 );
	float j = floor( r - k * 10.0 + 0.0001 );
	float u = ( r - k * 10.0 - j ) / 0.98;
	float s = ( fase - capa / capas ) * capas;
	float activa = prendido( capa, k, ciclo ) * prendido( capa + 1.0, j, ciclo ) * step( 0.0, s ) * step( s, 1.0 );
	float pulso = activa * exp( - pow( ( u - s ) / 0.09, 2.0 ) );
	return vec2( 0.35 + 0.65 * pulso, pulso );
}`
