import { useSyncExternalStore } from 'react'

/**
 * [B1.2d] EL CORRIMIENTO DE LA PÍLDORA — cuando se abre el Portfolio, la píldora de las secciones se corre a la columna de la izquierda
 * para no tapar los trabajos (§14, A1). Sólo desde 1024 y sólo la píldora: la esquina (Contacto y Login) no se mueve.
 *
 * Lo pide el Portfolio (`pedirElCorrimiento`, con el eje del título y el borde del panel, en px de la ventana) y lo hace la barra
 * (`useCorrimientoDeLaPastilla`). El almacén es como el del contacto (`contacto/apertura.ts`): de módulo, sin contexto.
 *
 * El movimiento va en DOS TIEMPOS de distancia D: primero se mueve el borde que va adelante (al irse, el izquierdo se estira D hacia
 * la izquierda y la píldora se ensancha), después el otro (el derecho se comprime D y vuelve a su ancho, ya en su lugar). Al volver,
 * el espejo. Los ítems van con el borde izquierdo y nunca se salen ni se deforman.
 */
export const CORRIMIENTO = {
  /** Lo que dura cada uno de los dos tiempos (ms): unos 400 entre los dos. */
  tiempoMs: 200,
  /** El aire mínimo (px) contra el botón de sonido y contra el panel. */
  aire: 16,
  /** Desde dónde se corre (el corte de escritorio, `--breakpoint-escritorio`). */
  consulta: '(min-width: 1024px)',
} as const

/** Lo que pide el Portfolio: el eje del título y el borde izquierdo del panel (px de la ventana). */
export interface PedidoDeCorrimiento {
  readonly eje: number
  readonly borde: number
}

/** Una caja horizontal: sus dos bordes (px). */
export interface Bordes {
  readonly l: number
  readonly r: number
}

/**
 * El borde izquierdo de la píldora corrida: centrada en el eje si entra entre el botón de sonido y el panel (con su aire a cada lado);
 * si no, en el margen, después del botón de sonido.
 */
export function izquierdaCorrida(p: PedidoDeCorrimiento, ancho: number, finDelSonido: number): number {
  const centrada = p.eje - ancho / 2
  const minimo = finDelSonido + CORRIMIENTO.aire
  const maximo = p.borde - CORRIMIENTO.aire - ancho
  return centrada >= minimo && centrada <= maximo ? centrada : minimo
}

/**
 * Los dos tiempos de un corrimiento: primero el borde que va adelante, después el otro (la caja de en medio y la del final). Hacia la
 * izquierda, el izquierdo; hacia la derecha, el derecho. Si sólo hay que achicarla (se dio vuelta a mitad de camino), un tiempo.
 */
export function tiemposDelCorrimiento(desde: Bordes, hasta: Bordes): readonly [Bordes, Bordes] {
  if (hasta.l < desde.l) return [{ l: hasta.l, r: desde.r }, hasta]
  if (hasta.r > desde.r) return [{ l: desde.l, r: hasta.r }, hasta]
  return [hasta, hasta]
}

// ─── El almacén ───────────────────────────────────────────────────────────

let pedido: PedidoDeCorrimiento | null = null
const oyentes = new Set<() => void>()

const iguales = (a: PedidoDeCorrimiento | null, b: PedidoDeCorrimiento | null): boolean =>
  a === b || (a !== null && b !== null && Math.abs(a.eje - b.eje) < 0.5 && Math.abs(a.borde - b.borde) < 0.5)

/** El Portfolio pide el corrimiento (o lo suelta con `null`). */
export function pedirElCorrimiento(p: PedidoDeCorrimiento | null): void {
  if (iguales(pedido, p)) return
  pedido = p
  for (const f of oyentes) f()
}

function suscribir(f: () => void): () => void {
  oyentes.add(f)
  return () => oyentes.delete(f)
}

export const corrimientoPedido = (): PedidoDeCorrimiento | null => pedido

/** El pedido de ahora, para la barra. */
export function useCorrimientoPedido(): PedidoDeCorrimiento | null {
  return useSyncExternalStore(suscribir, corrimientoPedido, () => null)
}

// ─── [B1.2d] A2.1 · El despeje del medio ──────────────────────────────────

/**
 * La píldora en reposo, medida por la barra (px de la ventana): su ancho, su borde de abajo y el fin del botón de sonido; `puede`: si
 * se corre en este ancho (desde 1024 y en modo barra).
 */
export interface PastillaEnReposo {
  readonly ancho: number
  readonly abajo: number
  readonly finDelSonido: number
  readonly puede: boolean
}

/**
 * Cuánto baja el medio del panel (px desde el tope del panel, que en el escenario pegado es el del cuadro), o `null`: nada. A 1280 y a
 * 1024 la píldora corrida no entra en la columna y se mete en el panel; ahí el medio (el video o el póster) arranca `aire` debajo de su
 * borde de abajo. Es de la GEOMETRÍA del ancho y no del momento: con la píldora yendo o volviendo, el medio no salta. A 1440 la píldora
 * entra con su aire: nada.
 */
export function despejeDelMedio(panel: PedidoDeCorrimiento | null, pastilla: PastillaEnReposo | null): number | null {
  if (panel === null || pastilla === null || !pastilla.puede) return null
  const derecha = izquierdaCorrida(panel, pastilla.ancho, pastilla.finDelSonido) + pastilla.ancho
  return derecha + CORRIMIENTO.aire > panel.borde ? pastilla.abajo + CORRIMIENTO.aire : null
}

let panelDelPortfolio: PedidoDeCorrimiento | null = null
let pastillaEnReposo: PastillaEnReposo | null = null
const avisar = (): void => {
  for (const f of oyentes) f()
}

/** El Portfolio publica la geometría de su panel (el eje del título y el borde), siempre: no sólo cuando pide el corrimiento. */
export function publicarElPanel(p: PedidoDeCorrimiento | null): void {
  if (iguales(panelDelPortfolio, p)) return
  panelDelPortfolio = p
  avisar()
}

/** La barra publica su píldora en reposo. */
export function publicarLaPastilla(p: PastillaEnReposo | null): void {
  const igual = p === pastillaEnReposo || (p !== null && pastillaEnReposo !== null && p.puede === pastillaEnReposo.puede && [p.ancho - pastillaEnReposo.ancho, p.abajo - pastillaEnReposo.abajo, p.finDelSonido - pastillaEnReposo.finDelSonido].every((d) => Math.abs(d) < 0.5))
  if (igual) return
  pastillaEnReposo = p
  avisar()
}

export const despejeActual = (): number | null => despejeDelMedio(panelDelPortfolio, pastillaEnReposo)

/** El despeje de ahora, para las tiras (un número o `null`: la instantánea es estable). */
export function useDespejeDelMedio(): number | null {
  return useSyncExternalStore(suscribir, despejeActual, () => null)
}
