/**
 * [ESCENA 3] EL ENTORNO — lo que se aprobó de la exploración de ESCENA 2, prendido en la base.
 *
 * - **E1** · óculo y haz: la columna de luz sobre el logo, en su nivel `sutil` (el `medio` queda
 *   para comparar).
 * - **E4** · el pulso: anillos que salen del logo por el piso, con hover (`entorno/maquinaDelPulso.ts`).
 * - **E6** · el polvo que responde: estelas con la velocidad y inercia al frenar.
 * - **E7** · el cursor: el polvo cercano se corre al paso del puntero y vuelve con inercia. Es el
 *   nivel A de ESCENA 3; el B (más alcance y el bokeh) y la estela del cursor se probaron y se
 *   borraron: el B necesitaba código propio y la estela no sumaba, porque el cursor ya mueve la
 *   cámara y E6 estira todo el polvo.
 *
 * E0, E2, E3, E5 y E8 se descartaron y su código se borró: quedan documentadas en
 * `docs/rediseno/SPRINT-ESCENA-2.md`.
 *
 * El banco de medición pisa todo esto ANTES de cargar la página, sin tocar el archivo:
 *
 *     window.__entornoDeLaEscena = 'producto'             → estas banderas, y la escena publica su estado
 *     window.__entornoDeLaEscena = 'base'                 → la escena de `escena-base-limpia`
 *     window.__entornoDeLaEscena = 'E1,E6,haz=sutil'      → sólo esas, con esos niveles
 *     window.__entornoDeLaEscena = 'E4,mascara=no'        → el pulso sin apagarse sobre el texto (para medirlo)
 */

export const IDEAS_DEL_ENTORNO = ['E1', 'E4', 'E6', 'E7'] as const

export type IdeaDelEntorno = (typeof IDEAS_DEL_ENTORNO)[number]

export type NivelDelHaz = 'sutil' | 'medio'

export interface Entorno {
  readonly E1: boolean
  readonly E4: boolean
  readonly E6: boolean
  readonly E7: boolean
  /** E1 · cuánto se nota el haz, de día y de noche (`entorno/Haz.tsx`). */
  readonly haz: NivelDelHaz
  /** La sombra de contacto sigue la altura del logo y responde al pulso (`entorno/sombra.ts`). */
  readonly sombraViva: boolean
  /** E4 · el anillo se apaga sobre las cajas de texto. Sólo el banco lo apaga, para medir sin él. */
  readonly mascaraDeTexto: boolean
}

/** LAS BANDERAS DEL PRODUCTO. */
export const ENTORNO: Entorno = {
  E1: true,
  E4: true,
  E6: true,
  E7: true,
  haz: 'sutil',
  sombraViva: true,
  mascaraDeTexto: true,
}

/** La base limpia: todo apagado. Es lo que el banco compara contra el producto. */
export const BASE_LIMPIA: Entorno = {
  E1: false,
  E4: false,
  E6: false,
  E7: false,
  haz: 'sutil',
  sombraViva: false,
  mascaraDeTexto: true,
}

type VentanaConEntorno = Window & { __entornoDeLaEscena?: unknown }

/** Traduce el pedido del banco. Pura: el invariante la prueba sin navegador. */
export function entornoPedido(pedido: string): Entorno {
  if (pedido.trim() === 'base') return BASE_LIMPIA
  if (pedido.trim() === 'producto') return ENTORNO
  const partes = new Set(pedido.split(',').map((s) => s.trim()))
  const valor = (clave: string): string | undefined =>
    [...partes].find((p) => p.startsWith(`${clave}=`))?.slice(clave.length + 1)
  const haz = valor('haz')
  return {
    E1: partes.has('E1'),
    E4: partes.has('E4'),
    E6: partes.has('E6'),
    E7: partes.has('E7'),
    haz: haz === 'sutil' || haz === 'medio' ? haz : ENTORNO.haz,
    sombraViva: !partes.has('sombra=quieta'),
    mascaraDeTexto: !partes.has('mascara=no'),
  }
}

let resuelto: Entorno | null = null

/**
 * Las banderas de esta carga: las de arriba, o las que pidió el banco antes de cargar. Se resuelve
 * UNA vez y queda fija, para que todos los componentes vean la misma escena.
 */
export function entornoDeLaEscena(): Entorno {
  if (resuelto !== null) return resuelto
  if (typeof window === 'undefined') return ENTORNO
  const pedido = (window as VentanaConEntorno).__entornoDeLaEscena
  resuelto = typeof pedido === 'string' ? entornoPedido(pedido) : ENTORNO
  return resuelto
}

/** ¿Hay un banco mirando? Sólo entonces la escena publica su estado para que lo lea. */
export function hayBanco(): boolean {
  return typeof window !== 'undefined' && typeof (window as VentanaConEntorno).__entornoDeLaEscena === 'string'
}
