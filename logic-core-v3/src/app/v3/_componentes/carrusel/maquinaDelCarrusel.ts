/**
 * [B1.2e] EL CARRUSEL, PURO — la máquina de un carrusel de tarjetas que rota solo, para cualquier lista (el Portfolio en el teléfono y
 * la tablet; después, Demos en el teléfono). Sin React, sin el DOM y sin nada de quien lo usa: el componente (`CarruselDeTarjetas.tsx`)
 * le pasa los eventos y pinta lo que devuelve. s76 la prueba sin navegador.
 *
 *   · cada tarjeta dura `duracionMs` (10 s) con su línea que se llena; al terminar pasa a la siguiente, y después de la última vuelve a
 *     la primera (la vuelta es infinita en los dos sentidos: antes de la primera está la última);
 *   · el reloj vuelve a cero en CADA cambio (el del tiempo, las flechas, el deslice o un salto desde afuera): cada tarjeta arranca entera;
 *   · las flechas: la anterior y la siguiente. Deslizar de costado: a la izquierda, la siguiente; a la derecha, la anterior. Un dedo que
 *     va vertical no es del carrusel: es el scroll de la página, que nunca se toca;
 *   · se pausa mientras se mantiene apretado, fuera de la vista (la pestaña oculta también), con movimiento reducido y con el foco del
 *     teclado adentro (WCAG 2.2.2: lo que rota solo se tiene que poder frenar). Pausado, el reloj no corre pero no se pierde: al volver,
 *     sigue desde donde estaba.
 *
 * `porElUsuario` dice si el cambio lo pidió un gesto (el único que suena: un tic por deslice; las flechas son botones y suenan solas).
 */

export const CARRUSEL = {
  /** Lo que dura cada tarjeta (ms). */
  duracionMs: 10_000,
  /** Lo que hay que mantener apretado para pausar (ms): el de las historias. */
  mantenerMs: 200,
  /** Lo que se mueve el dedo antes de decidir si va de costado (del carrusel) o vertical (de la página), en px: el de las demos. */
  intencionPx: 8,
  /** Lo menos que tiene que recorrer un deslice de costado (px). */
  desliceMinPx: 40,
  /** La fracción del carrusel (o del cuadro, si el carrusel es más alto) que tiene que estar a la vista para que corra el reloj. */
  enVistaMinima: 0.5,
  /** Lo más que cuenta un cuadro (ms): una pestaña que vuelve no se come la tarjeta. */
  cuadroMaxMs: 100,
} as const

export interface EstadoDelCarrusel {
  /** La tarjeta de ahora (0…n−1). */
  readonly indice: number
  /** Lo que lleva la tarjeta de ahora (ms). */
  readonly transcurridoMs: number
  /** Apretado (mantener). */
  readonly mantenido: boolean
  /** A la vista (y con la pestaña visible). Arranca afuera: el componente lo prende cuando lo ve. */
  readonly enVista: boolean
  /** Con movimiento reducido: no rota solo. */
  readonly reducido: boolean
  /** Con el foco del teclado adentro. */
  readonly enfocado: boolean
  /** Cambia en cada cambio de tarjeta: el que pinta vuelve a cero su medio (y su secuencia). */
  readonly reinicio: number
  /** Hacia dónde fue el último cambio (1, la siguiente; −1, la anterior): la transición entra desde ese lado. */
  readonly sentido: 1 | -1
}

/** Dónde cae un índice en la vuelta: −1 es la última y n la primera. */
export const indiceEnLaVuelta = (i: number, cantidad: number): number => (cantidad > 0 ? (((Math.trunc(i) % cantidad) + cantidad) % cantidad) : 0)

export function estadoInicialDelCarrusel(indice = 0, cantidad = 1): EstadoDelCarrusel {
  return { indice: indiceEnLaVuelta(indice, cantidad), transcurridoMs: 0, mantenido: false, enVista: false, reducido: false, enfocado: false, reinicio: 0, sentido: 1 }
}

export type EventoDelCarrusel =
  | { readonly tipo: 'tiempo'; readonly ms: number }
  | { readonly tipo: 'siguiente' }
  | { readonly tipo: 'anterior' }
  | { readonly tipo: 'ir'; readonly indice: number }
  | { readonly tipo: 'deslice'; readonly dx: number; readonly dy: number }
  | { readonly tipo: 'mantener' }
  | { readonly tipo: 'soltar' }
  | { readonly tipo: 'vista'; readonly adentro: boolean }
  | { readonly tipo: 'reducido'; readonly si: boolean }
  | { readonly tipo: 'foco'; readonly adentro: boolean }

export interface PasoDelCarrusel {
  readonly estado: EstadoDelCarrusel
  /** Si cambió la tarjeta. */
  readonly cambio: boolean
  /** Si el cambio lo pidió un gesto o un botón (no el tiempo ni un salto desde afuera). */
  readonly porElUsuario: boolean
}

export type MotivoDeLaPausa = 'mantenido' | 'fuera-de-vista' | 'reducido' | 'foco'

/** Por qué no corre el reloj (el primero que aplica), o `null` si corre. */
export function motivoDeLaPausa(e: EstadoDelCarrusel): MotivoDeLaPausa | null {
  if (e.reducido) return 'reducido'
  if (!e.enVista) return 'fuera-de-vista'
  if (e.mantenido) return 'mantenido'
  if (e.enfocado) return 'foco'
  return null
}

export const pausado = (e: EstadoDelCarrusel): boolean => motivoDeLaPausa(e) !== null

/** Lo que va de la tarjeta de ahora (0…1): su línea. */
export const avanceDelCarrusel = (e: EstadoDelCarrusel, duracionMs: number = CARRUSEL.duracionMs): number =>
  duracionMs > 0 ? Math.min(1, Math.max(0, e.transcurridoMs / duracionMs)) : 0

const quedarse = (estado: EstadoDelCarrusel): PasoDelCarrusel => ({ estado, cambio: false, porElUsuario: false })

function ir(e: EstadoDelCarrusel, indice: number, cantidad: number, sentido: 1 | -1, porElUsuario: boolean): PasoDelCarrusel {
  const destino = indiceEnLaVuelta(indice, cantidad)
  if (destino === e.indice) return quedarse(e)
  return { estado: { ...e, indice: destino, transcurridoMs: 0, reinicio: e.reinicio + 1, sentido }, cambio: true, porElUsuario }
}

/** El próximo estado del carrusel para un evento, con `cantidad` tarjetas. */
export function siguienteDelCarrusel(e: EstadoDelCarrusel, ev: EventoDelCarrusel, cantidad: number, duracionMs: number = CARRUSEL.duracionMs): PasoDelCarrusel {
  if (cantidad <= 0) return quedarse(e)
  switch (ev.tipo) {
    case 'mantener':
      return quedarse({ ...e, mantenido: true })
    case 'soltar':
      return quedarse({ ...e, mantenido: false })
    case 'vista':
      return quedarse({ ...e, enVista: ev.adentro })
    case 'reducido':
      return quedarse({ ...e, reducido: ev.si })
    case 'foco':
      return quedarse({ ...e, enfocado: ev.adentro })
    case 'tiempo': {
      if (pausado(e) || cantidad < 2) return quedarse(e)
      const transcurridoMs = e.transcurridoMs + Math.min(CARRUSEL.cuadroMaxMs, Math.max(0, ev.ms))
      if (transcurridoMs < duracionMs) return quedarse({ ...e, transcurridoMs })
      return ir(e, e.indice + 1, cantidad, 1, false)
    }
    case 'siguiente':
      return ir(e, e.indice + 1, cantidad, 1, true)
    case 'anterior':
      return ir(e, e.indice - 1, cantidad, -1, true)
    case 'ir': {
      const destino = indiceEnLaVuelta(ev.indice, cantidad)
      return ir(e, destino, cantidad, destino >= e.indice ? 1 : -1, false)
    }
    case 'deslice': {
      if (intencionDelDedo(ev.dx, ev.dy) !== 'costado' || Math.abs(ev.dx) < CARRUSEL.desliceMinPx) return quedarse(e)
      return ev.dx < 0 ? ir(e, e.indice + 1, cantidad, 1, true) : ir(e, e.indice - 1, cantidad, -1, true)
    }
  }
}

/**
 * Hacia dónde va un dedo después de moverse `dx`, `dy`: `null` mientras no pasó `intencionPx`; `costado` si va más de costado que
 * vertical (es del carrusel); `vertical` si no (es el scroll de la página, y el carrusel lo suelta).
 */
export function intencionDelDedo(dx: number, dy: number): 'costado' | 'vertical' | null {
  if (Math.hypot(dx, dy) < CARRUSEL.intencionPx) return null
  return Math.abs(dx) > Math.abs(dy) ? 'costado' : 'vertical'
}
