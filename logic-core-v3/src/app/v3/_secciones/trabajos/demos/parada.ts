/**
 * [NOCTURNO B5] LA PARADA DE DEMOS — una parada como las del Portfolio, entre «la tuya» y Servicios (decisión de Valentino: «al llegar
 * desde el Portfolio, la entrada de Demos se completa entera aunque se siga scrolleando, y Demos se queda hasta un gesto nuevo»).
 *
 * Es la máquina de gatillos común (`_componentes/gatillos/`, la del Portfolio: A8, F1 y F2) con UN paso, sobre una pista invisible
 * centrada en el fin del pin de Trabajos (donde aterrizan los dos vuelos que llegan a Demos: el del Portfolio desde «la tuya» y el de
 * Servicios hacia arriba). Nada cambia de alto: la pista es un elemento posicionado que no ocupa lugar (REGLA DE ALTURAS: sin tramo).
 *
 *   · **La entrada se ve entera** (F1): mientras la llegada de Demos corre (lo mostrado persigue a lo pedido, `entrada.ts`), la rueda y
 *     las teclas se tragan; la ráfaga que sobra queda dada.
 *   · **Demos se queda hasta un gesto nuevo**: recién con la rueda quieta 160 ms (o una tecla nueva) un gesto sale: abajo, a Servicios
 *     (la salida de siempre de la máquina: una pantalla después de la pista, que cae adentro del primer paso de Servicios); arriba, a
 *     «la tuya» (`salidaDeArriba`: su ancla).
 *   · **La entrada atrapa** (F2): una rueda que entra a la pista desde afuera aterriza en la parada.
 *
 * Todo en px de scroll (no en la regla de 900): la pista mide la ventana de verdad.
 */

import { ANCLA_DE_LA_TUYA } from '../portfolio/anclas'

/** Cuánto se extiende la parada a cada lado del fin del pin, en altos de ventana. */
export const PARADA_DE_DEMOS = { mitad: 0.5 } as const

/**
 * La pista de la parada, en altos de ventana: termina `mitad` DEBAJO del pie de la sección (en Servicios, sin ocupar lugar) y mide una
 * ventana más las dos mitades. Así su único paso va de `fin del pin − mitad` a `fin del pin + mitad`, con el centro en el fin del pin.
 */
export function pistaDeLaParada(mitad: number = PARADA_DE_DEMOS.mitad): { readonly abajo: number; readonly alto: number } {
  return { abajo: -mitad, alto: 1 + 2 * mitad }
}
export const PISTA_DE_LA_PARADA = pistaDeLaParada()

/**
 * La regla que la máquina lee de la pista (como `useGatillos`: el tope de la pista en el documento y su alto menos una ventana), con
 * el fin del pin en px de scroll (el pie de la sección menos una ventana). `mitad`: para que el invariante pruebe otras paradas.
 */
export function reglaDeLaParada(finDelPin: number, alto: number, mitad: number = PARADA_DE_DEMOS.mitad): { readonly inicio: number; readonly pasoPx: number } {
  const pista = pistaDeLaParada(mitad)
  const pie = finDelPin + alto
  const altoDeLaPista = pista.alto * alto
  const topeDeLaPista = pie - pista.abajo * alto - altoDeLaPista
  return { inicio: topeDeLaPista, pasoPx: Math.max(1, altoDeLaPista - alto) }
}

// ─── La llegada de Demos, para la parada ─────────────────────────────────────

/** Lo que la capa de Demos persigue (`CapaDeDemos`: lo pedido por el scroll y lo mostrado); `null` sin capa (la rama quieta). */
export interface LlegadaQueCorre {
  readonly pedida: number
  readonly mostrada: number
}

/** La persecución viva de la capa (la registra `CapaDeDemos` al montarse; la parada la lee en cada evento). */
export const LLEGADA_DE_DEMOS: { persecucion: LlegadaQueCorre | null } = { persecucion: null }

/** ¿La llegada de Demos está corriendo? Lo mostrado todavía no alcanzó a lo pedido (en las dos direcciones). */
export function llegadaEnCurso(l: LlegadaQueCorre | null): boolean {
  return l !== null && Math.abs(l.pedida - l.mostrada) > 1e-6
}

/** La salida de arriba: el scroll que pone el ancla de «la tuya» arriba del cuadro (la regla en el centro de su paso), o `null`. */
export function scrollDeLaTuya(): number | null {
  const ancla = document.getElementById(ANCLA_DE_LA_TUYA)
  return ancla === null ? null : ancla.getBoundingClientRect().top + window.scrollY
}
