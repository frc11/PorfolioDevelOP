/**
 * [ESCENA 4] LAS PARTES DE LA «cp» — pura: qué región de la malla del logo es la «c», la «p», el
 * infinito sin el palo y el palo. Una copia fallada se arma con piezas rígidas, y cada pieza es la
 * malla del logo con todo lo que queda fuera de su región descartado en el shader.
 *
 * Las fronteras salen del SVG (`/logodevelOP.svg`, caja de 1024): el palo baja entre x 532 y 658
 * desde la unión con el cuenco, en y ≈ 700, hasta el pie en 885; nada más del logo pasa por debajo
 * de y 690 con x > 520 (el fondo de la «c» termina en x ≈ 330). La «c» y la «p» se separan en x 520,
 * a mitad del trazo diagonal que las cruza.
 */

export const REGION = {
  todo: 0,
  c: 1,
  p: 2,
  infinito: 3,
  palo: 4,
  izquierda: 5,
  derecha: 6,
} as const

export type Region = (typeof REGION)[keyof typeof REGION]

/** Las fronteras en coordenadas del SVG. */
export const FRONTERAS_SVG = {
  corteCP: 520,
  paloDesde: 525,
  paloHasta: 665,
  paloArriba: 690,
} as const

/** Las mismas fronteras, en el espacio de la copia (pie en y = 0, centrada en x). */
export interface Fronteras {
  readonly corteCP: number
  readonly paloDesde: number
  readonly paloHasta: number
  /** El palo es lo que queda por DEBAJO de esta altura, entre `paloDesde` y `paloHasta`. */
  readonly paloArriba: number
}

/** ¿El punto (x, y) de la copia pertenece a la región? `corte` sólo vale para izquierda y derecha. */
export function enLaRegion(x: number, y: number, region: Region, corte: number, f: Fronteras): boolean {
  const palo = x > f.paloDesde && x < f.paloHasta && y < f.paloArriba
  switch (region) {
    case REGION.todo:
      return true
    case REGION.c:
      return x < f.corteCP
    case REGION.p:
      return x >= f.corteCP
    case REGION.infinito:
      return !palo
    case REGION.palo:
      return palo
    case REGION.izquierda:
      return x < corte
    case REGION.derecha:
      return x >= corte
  }
}

/** El mismo test, en GLSL: el shader de la copia lo usa para descartar lo que no es de la pieza. */
export const EN_LA_REGION_GLSL = /* glsl */ `
uniform vec4 uFronteras;
bool enLaRegion( vec2 p, float region, float corte ) {
	bool palo = p.x > uFronteras.y && p.x < uFronteras.z && p.y < uFronteras.w;
	if ( region < 0.5 ) return true;
	if ( region < 1.5 ) return p.x < uFronteras.x;
	if ( region < 2.5 ) return p.x >= uFronteras.x;
	if ( region < 3.5 ) return ! palo;
	if ( region < 4.5 ) return palo;
	if ( region < 5.5 ) return p.x < corte;
	return p.x >= corte;
}
`
