import type { MiradaDeLaCamara } from '../../_lib/escena/miradaDeLaCamara'

/**
 * [RONDA 2] F5 · LA PIEZA DEL PIE — la geometría, el material y la pose de un bloque sólido de CSS 3D (`BloqueSolido`),
 * sin React. Una tecla de gama alta, o una ficha maquinada, en el negro satinado del logo: la tapa con el filo claro en
 * el contorno (el de F4), los cantos en otro gris (más claro el de arriba, que recibe la luz) y una sombra de contacto
 * suave sobre el plano de atrás. Los colores salen de los tokens de la sala invertida (la pieza lleva
 * `data-seccion="invertida"`: tinta clara y foco claro sobre el negro), mezclados con `color-mix`.
 *
 * La pose: cada pieza se ve desde el centro del cuadro (como la vería la cámara de la escena): las de la izquierda
 * muestran su costado derecho, las de abajo su canto de arriba, y todas un poco de canto siempre; encima, el paralaje del
 * mouse exagerado, que gira la pieza al revés de la cámara (fija en el mundo: se revela la perspectiva).
 */
export type FormaDeLaPieza = 'tecla' | 'ranura' | 'principal'

export const PIEZA = {
  /** El espesor de cada forma (px): los cantos que se ven siempre. */
  profundidad: { tecla: 24, ranura: 18, principal: 32 },
  perspectiva: 900,
  /**
   * La pose de base (grados): el canto de arriba que se ve siempre, el que se suma abajo del centro, y el costado que
   * mira al centro en el borde del cuadro. Antes no había base: con el mouse quieto, de frente.
   */
  inclinacion: { siempre: 12, abajo: 12, costado: 24 },
  /** El paralaje del mouse, exagerado: los valores de Por qué develOP lo llevan al doble (`EXAGERACION_DEL_CSS`). */
  exageracion: 3.5,
  /**
   * El ancho (px) hasta el que una pieza gira entera de costado: una más ancha (los campos) gira menos, porque su punta
   * se acerca tanto que tapa el rótulo de arriba y deforma lo que se escribe.
   */
  anchoQueGiraEntero: 180,
  /** Cuánto se hunde (px): con el mouse encima (o el foco del teclado) y al apretar. */
  hundida: { encima: 6, apretada: 14 },
  /** La sombra de contacto: a cuánto del plano de atrás (px) y cuánto baja (la luz viene de arriba). */
  sombra: { separacion: 10, baja: 8 },
} as const

/** Dónde está la pieza respecto del centro de su pie, de −1 a 1 (x hacia la derecha, y hacia abajo), y cuánto gira de costado. */
export interface Lado {
  readonly x: number
  readonly y: number
  readonly costado: number
}

export const AL_CENTRO: Lado = { x: 0, y: 0, costado: 1 }

const acotar = (v: number): number => Math.max(-1, Math.min(1, v))

/** El lado de una caja dentro de su marco (los dos en coordenadas del cuadro). */
export function ladoEn(caja: DOMRect, marco: DOMRect): Lado {
  if (marco.width <= 0 || marco.height <= 0) return AL_CENTRO
  return {
    x: acotar((caja.left + caja.width / 2 - (marco.left + marco.width / 2)) / (marco.width / 2)),
    y: acotar((caja.top + caja.height / 2 - (marco.top + marco.height / 2)) / (marco.height / 2)),
    costado: Math.min(1, PIEZA.anchoQueGiraEntero / Math.max(1, caja.width)),
  }
}

/** La pose de la pieza: su base (por el lado) y el paralaje exagerado, al revés de la cámara. */
export function poseDeLaPieza(lado: Lado, m: MiradaDeLaCamara): string {
  const i = PIEZA.inclinacion
  const k = PIEZA.exageracion
  const x = -(i.siempre + i.abajo * Math.max(0, lado.y)) + m.inclinacion * k
  const y = (i.costado * lado.x - m.giro * k) * lado.costado
  return `rotateX(${x.toFixed(3)}deg) rotateY(${y.toFixed(3)}deg)`
}

type Cara = { readonly clase: string; readonly estilo: React.CSSProperties }

/** Un gris de la pieza: la tinta (clara, en la sala invertida) sobre el negro, en `p` por ciento. */
const gris = (p: number): string => `color-mix(in srgb, var(--color-tinta) ${String(p)}%, var(--color-fondo))`

/** La cara de atrás y los cuatro cantos, hacia el fondo; el de arriba, más claro. */
export function cantosDeLaPieza(d: number): readonly Cara[] {
  const px = `${String(d)}px`
  return [
    { clase: 'inset-0', estilo: { transform: `translateZ(-${px})`, background: gris(4) } },
    { clase: 'inset-x-0 top-0', estilo: { height: px, transformOrigin: 'top', transform: 'rotateX(-90deg)', background: gris(34) } },
    { clase: 'inset-x-0 bottom-0', estilo: { height: px, transformOrigin: 'bottom', transform: 'rotateX(90deg)', background: gris(10) } },
    { clase: 'inset-y-0 left-0', estilo: { width: px, transformOrigin: 'left', transform: 'rotateY(90deg)', background: gris(20) } },
    { clase: 'inset-y-0 right-0', estilo: { width: px, transformOrigin: 'right', transform: 'rotateY(-90deg)', background: gris(20) } },
  ]
}

/** La tapa: el satinado (un brillo ancho arriba a la izquierda) y el filo claro en el contorno; la de una ranura, una placa más clara. */
export function tapaDeLaPieza(forma: FormaDeLaPieza): React.CSSProperties {
  const filo = forma === 'principal' ? 62 : 44
  const [a, b, c, e] = forma === 'ranura' ? [30, 18, 14, 20] : [18, 3, 0, 8]
  return {
    background: `linear-gradient(160deg, ${gris(a)} 0%, ${gris(b)} 48%, ${gris(c)} 70%, ${gris(e)} 100%)`,
    boxShadow: `inset 0 0 0 1px color-mix(in srgb, var(--color-tinta) ${String(filo)}%, transparent), inset 0 1px 0 color-mix(in srgb, var(--color-tinta) ${String(filo + 20)}%, transparent)`,
  }
}

/** La ranura de un campo: una placa hundida adentro de la tapa (la sombra de adentro arriba, el filo abajo). */
export const RANURA: React.CSSProperties = {
  background: gris(0),
  boxShadow: 'inset 0 3px 7px rgb(0 0 0 / 0.75), inset 0 -1px 0 color-mix(in srgb, var(--color-tinta) 30%, transparent)',
}

/** La sombra de contacto, en el plano de atrás: suave, un poco abajo (un relleno difuminado: una `box-shadow` deja su caja hueca). */
export function sombraDeLaPieza(d: number): React.CSSProperties {
  const s = PIEZA.sombra
  return {
    transform: `translateZ(-${String(d + s.separacion)}px) translateY(${String(s.baja)}px)`,
    background: 'rgb(0 0 0 / 0.4)',
    filter: 'blur(10px)',
  }
}
