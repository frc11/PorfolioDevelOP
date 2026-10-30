'use client'

import { useEffect, type RefObject } from 'react'

/**
 * [M1] AL CRUZAR — cuando el centro de un elemento cruza hacia arriba una línea de la pantalla (`entra`, fracción del alto desde arriba)
 * avisa `true`; cuando vuelve a bajar más allá de `sale`, avisa `false`. Es el gesto del gatillo del home (se dispara al cruzar y vuelve
 * en espejo al subir), con histéresis para que no titile en la línea. Lo usan el equipo de Nosotros (la segunda toma en el teléfono) y
 * los casos del Portfolio (el ritmo de su texto). Llevado del prototipo de `l7/lab` (no importado).
 */
export function useAlCruzar(ref: RefObject<HTMLElement | null>, alCambiar: (adentro: boolean) => void, activo: boolean, entra = 0.55, sale = 0.7): void {
  useEffect(() => {
    const el = ref.current
    if (!activo || el === null) return undefined
    let adentro = false
    let pedido = 0
    const medir = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const centro = (caja.top + caja.height / 2) / window.innerHeight
      if (!adentro && centro < entra) {
        adentro = true
        alCambiar(true)
      } else if (adentro && centro > sale) {
        adentro = false
        alCambiar(false)
      }
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(medir)
    }
    // Siempre escuchando (un cuadro por vez): un salto que pasa por encima del elemento sin que entre a la pantalla también lo cruza.
    window.addEventListener('scroll', pedir, { passive: true })
    pedir()
    return () => {
      window.removeEventListener('scroll', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [ref, alCambiar, activo, entra, sale])
}

/** El avance (0 → 1) de un elemento que entra por abajo: 0 con su tope en el fondo de la pantalla, 1 con su tope a `hasta` del alto. */
export function avanceDeEntrada(tope: number, alto: number, hasta = 0.2): number {
  if (!(alto > 0)) return 1
  const t = (alto - tope) / (alto * (1 - hasta))
  return t <= 0 ? 0 : t >= 1 ? 1 : t
}

/**
 * Un efecto atado al scroll: llama a `pintar` una vez por cuadro mientras se scrollea (y al cambiar el tamaño). Devuelve cómo soltarlo.
 * Sólo en el cliente, adentro de un efecto.
 */
export function porCuadroDelScroll(pintar: () => void): () => void {
  let pedido = 0
  const pedir = (): void => {
    if (pedido === 0)
      pedido = requestAnimationFrame(() => {
        pedido = 0
        pintar()
      })
  }
  window.addEventListener('scroll', pedir, { passive: true })
  window.addEventListener('resize', pedir)
  pintar()
  return () => {
    window.removeEventListener('scroll', pedir)
    window.removeEventListener('resize', pedir)
    if (pedido !== 0) cancelAnimationFrame(pedido)
  }
}
