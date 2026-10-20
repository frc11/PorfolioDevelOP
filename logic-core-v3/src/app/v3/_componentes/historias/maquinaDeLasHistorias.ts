/**
 * [B1.2d B] P-H19 · LAS HISTORIAS, PURAS — la máquina de unas historias como las de Instagram, para cualquier cantidad de ítems (el
 * Portfolio usa 4; el precio de servicios, 3). Sin React, sin el DOM y sin nada del Portfolio: el componente (`Historias.tsx`) le pasa
 * los eventos y pinta lo que devuelve. s76 la prueba sin navegador.
 *
 *   · cada ítem dura `duracionMs` (10 s, fijo: no la de su video) y, al terminar, pasa al siguiente; el último se queda lleno;
 *   · un ítem `sinTiempo` no corre: su barra queda fija y se queda hasta que el usuario sale;
 *   · cada ítem arranca siempre de cero (su barra y su medio: `reinicio` cambia y el que pinta vuelve a montarlo);
 *   · mantener apretado pausa; al soltar, sigue;
 *   · un toque en el tercio de la izquierda vuelve al anterior (en el primero, lo reinicia); en los dos tercios de la derecha pasa al
 *     siguiente (después del último, sale hacia adelante);
 *   · deslizar de costado: a la izquierda, el siguiente; a la derecha, el anterior. Deslizar hacia arriba sale hacia adelante; hacia
 *     abajo, hacia atrás (lo que sea cada uno lo decide quien las usa);
 *   · con un campo enfocado adentro, nada avanza (ni el tiempo, ni los toques, ni los deslices).
 *
 * Lo que la máquina NO tiene es scroll: el scroll nunca avanza las historias (T8). `porElUsuario` dice si el cambio lo pidió un gesto
 * (el único que suena: un tic por toque, T1).
 */

export const HISTORIAS = {
  /** Lo que dura cada ítem con tiempo (ms). */
  duracionMs: 10_000,
  /** Lo que hay que mantener apretado para pausar (ms). */
  mantenerMs: 200,
  /** Lo más que se puede mover un toque (px): más es un deslice. */
  toqueMaxPx: 10,
  /** Lo menos que tiene que recorrer un deslice (px). */
  desliceMinPx: 40,
  /** La fracción del ancho que vuelve al anterior (desde la izquierda). */
  tercioDeAtras: 1 / 3,
} as const

export interface ItemDeHistoria {
  readonly id: string
  /** Sin tiempo: su barra queda fija y se queda hasta que el usuario sale (la «la tuya» del Portfolio). */
  readonly sinTiempo?: boolean
}

export interface EstadoDeLasHistorias {
  readonly indice: number
  /** Lo que lleva el ítem de ahora (ms). */
  readonly transcurridoMs: number
  /** Apretado (mantener). */
  readonly pausada: boolean
  /** Con un campo enfocado adentro. */
  readonly enfocada: boolean
  /** Cambia cada vez que un ítem arranca: el que pinta lo vuelve a montar desde cero. */
  readonly reinicio: number
}

export const ESTADO_INICIAL: EstadoDeLasHistorias = { indice: 0, transcurridoMs: 0, pausada: false, enfocada: false, reinicio: 0 }

export type EventoDeLasHistorias =
  | { readonly tipo: 'tiempo'; readonly ms: number }
  | { readonly tipo: 'toque'; readonly fraccion: number }
  | { readonly tipo: 'deslice'; readonly dx: number; readonly dy: number }
  | { readonly tipo: 'mantener' }
  | { readonly tipo: 'soltar' }
  | { readonly tipo: 'foco'; readonly adentro: boolean }

export type SalidaDeLasHistorias = 'adelante' | 'atras'

export interface PasoDeLasHistorias {
  readonly estado: EstadoDeLasHistorias
  /** Hacia dónde salir (`null`: se quedan). */
  readonly salida: SalidaDeLasHistorias | null
  /** Si cambió el ítem y lo pidió un gesto (el tic). */
  readonly porElUsuario: boolean
}

/** El progreso del ítem de ahora (0…1) para su barra: los sin tiempo, llenos. */
export function avanceDelItem(e: EstadoDeLasHistorias, items: readonly ItemDeHistoria[], duracionMs: number = HISTORIAS.duracionMs): number {
  if (items[e.indice]?.sinTiempo === true) return 1
  return Math.min(1, Math.max(0, e.transcurridoMs / duracionMs))
}

/** Cómo se ve cada barra: las vistas, llenas; las que vienen, vacías; la de ahora, con su avance. */
export function barrasDeLasHistorias(e: EstadoDeLasHistorias, items: readonly ItemDeHistoria[], duracionMs: number = HISTORIAS.duracionMs): readonly number[] {
  return items.map((_, i) => (i < e.indice ? 1 : i > e.indice ? 0 : avanceDelItem(e, items, duracionMs)))
}

const quedarse = (estado: EstadoDeLasHistorias): PasoDeLasHistorias => ({ estado, salida: null, porElUsuario: false })
const ir = (e: EstadoDeLasHistorias, indice: number, porElUsuario: boolean): PasoDeLasHistorias => ({
  estado: { ...e, indice, transcurridoMs: 0, reinicio: e.reinicio + 1 },
  salida: null,
  porElUsuario: porElUsuario && indice !== e.indice,
})

function adelante(e: EstadoDeLasHistorias, cantidad: number): PasoDeLasHistorias {
  return e.indice < cantidad - 1 ? ir(e, e.indice + 1, true) : { estado: e, salida: 'adelante', porElUsuario: false }
}

function atras(e: EstadoDeLasHistorias): PasoDeLasHistorias {
  // En el primero, lo reinicia (como Instagram): no cambia de ítem, así que no suena.
  return ir(e, Math.max(0, e.indice - 1), true)
}

export function siguienteDeLasHistorias(
  e: EstadoDeLasHistorias,
  ev: EventoDeLasHistorias,
  items: readonly ItemDeHistoria[],
  duracionMs: number = HISTORIAS.duracionMs,
): PasoDeLasHistorias {
  const cantidad = items.length
  if (cantidad === 0) return quedarse(e)
  switch (ev.tipo) {
    case 'mantener':
      return quedarse({ ...e, pausada: true })
    case 'soltar':
      return quedarse({ ...e, pausada: false })
    case 'foco':
      return quedarse({ ...e, enfocada: ev.adentro })
    case 'tiempo': {
      if (e.pausada || e.enfocada || items[e.indice]?.sinTiempo === true) return quedarse(e)
      const transcurridoMs = e.transcurridoMs + Math.max(0, ev.ms)
      if (transcurridoMs < duracionMs) return quedarse({ ...e, transcurridoMs })
      // El último con tiempo se queda lleno (no sale solo: salir es de quien mira).
      return e.indice < cantidad - 1 ? ir(e, e.indice + 1, false) : quedarse({ ...e, transcurridoMs: duracionMs })
    }
    case 'toque':
      if (e.enfocada) return quedarse(e)
      return ev.fraccion < HISTORIAS.tercioDeAtras ? atras(e) : adelante(e, cantidad)
    case 'deslice': {
      if (e.enfocada) return quedarse(e)
      const horizontal = Math.abs(ev.dx) >= Math.abs(ev.dy)
      const largo = horizontal ? Math.abs(ev.dx) : Math.abs(ev.dy)
      if (largo < HISTORIAS.desliceMinPx) return quedarse(e)
      if (horizontal) return ev.dx < 0 ? adelante(e, cantidad) : e.indice > 0 ? ir(e, e.indice - 1, true) : quedarse(e)
      return { estado: e, salida: ev.dy < 0 ? 'adelante' : 'atras', porElUsuario: false }
    }
  }
}

/** Lo que hizo un gesto del puntero, desde que bajó hasta que subió: un toque, un deslice o nada (lo mantuvo: ya pausó). */
export function gestoDelPuntero(dx: number, dy: number, mantenido: boolean): 'toque' | 'deslice' | 'nada' {
  if (mantenido) return 'nada'
  return Math.hypot(dx, dy) <= HISTORIAS.toqueMaxPx ? 'toque' : 'deslice'
}
