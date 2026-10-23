/**
 * [C2-41t] EL CARRUSEL QUE ASOMA, PURO — las cuentas del modo `asoma` de `CarruselDeTarjetas` (Demos en el teléfono y la tablet): una
 * tarjeta grande, la siguiente asomada a su derecha y el dedo que las arrastra. Sin React ni el DOM: s84-demos-telefono las prueba.
 *
 * Las tarjetas no van en una cinta que se rebobina: cada una se coloca por su lugar RELATIVO a la posición —un número continuo, la tarjeta
 * que se ve (2,3 es la tercera arrastrada un 30 % hacia la cuarta)— dando la vuelta. Así la vuelta infinita nunca cruza el cuadro: la
 * tarjeta que salta de un extremo al otro lo hace afuera (con tres o más tarjetas).
 */

export const ASOMA = {
  /** Lo que separa una tarjeta de la siguiente (px). */
  separacionPx: 16,
  /** La vecina, un poco más chica y apagada: la de adelante es la que se lee. */
  escalaDeLaVecina: 0.94,
  opacidadDeLaVecina: 0.55,
  /** El resorte de la UI del sitio (el del dock, `CLAUDE.md`): la tarjeta se asienta sin rebote largo. */
  resorte: { type: 'spring', stiffness: 380, damping: 38, mass: 0.9 },
} as const

/** La forma de la tarjeta: su `proporcion` (ancho / alto) y la `fraccion` del ancho de la vista que ocupa como mucho. */
export interface FormaDeLaTarjeta {
  readonly proporcion: number
  readonly fraccion: number
}

/** Dónde cae la tarjeta `i` (de `n`) para una posición: 0 la de adelante, 1 la asomada, −1 la que se fue; entre −1,5 y n − 1,5. */
export function relativoEnLaVuelta(i: number, posicion: number, n: number): number {
  if (!(n > 0)) return 0
  const r = (((i - posicion) % n) + n) % n
  return r >= n - 1.5 ? r - n : r
}

/** Adónde va la posición para mostrar la tarjeta `indice`: el equivalente más cercano en la vuelta (desde un arrastre, el que falta). */
export function destinoEnLaVuelta(posicion: number, indice: number, n: number): number {
  if (!(n > 0)) return posicion
  const adelante = (((indice - posicion) % n) + n) % n
  return adelante <= n / 2 ? posicion + adelante : posicion - (n - adelante)
}

/** La posición para un arrastre de `dx` px desde `base` con tarjetas a `paso` px (a la izquierda, hacia la siguiente). */
export function posicionDelArrastre(base: number, dx: number, paso: number): number {
  return paso > 0 ? base - dx / paso : base
}

/** El ancho de la tarjeta (px): la fracción del ancho de la vista, sin pasarse del alto de la vista con su proporción. */
export function anchoDeLaTarjeta(anchoDeLaVista: number, altoDeLaVista: number, forma: FormaDeLaTarjeta): number {
  if (!(anchoDeLaVista > 0)) return 0
  const porElAncho = anchoDeLaVista * forma.fraccion
  return altoDeLaVista > 0 ? Math.min(porElAncho, altoDeLaVista * forma.proporcion) : porElAncho
}

/** La pose de una tarjeta a `rel` de la de adelante: entera en 0; desde la vecina, más chica y apagada (continua mientras se arrastra). */
export function poseEnLaVuelta(rel: number): { readonly escala: number; readonly opacidad: number } {
  const d = Math.min(1, Math.abs(rel))
  return { escala: 1 - (1 - ASOMA.escalaDeLaVecina) * d, opacidad: 1 - (1 - ASOMA.opacidadDeLaVecina) * d }
}
