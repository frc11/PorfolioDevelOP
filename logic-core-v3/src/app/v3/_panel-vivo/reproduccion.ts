'use client'

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react'

/**
 * [NOCTURNO] B · CÓMO CORRE UNA DEMO DEL PANEL — el contexto que la demo lee para saber si se mueve sola, y los pasos de
 * su guion. [RETOQUE PANEL] T1 · un solo modo: la demo en su lugar, en la tarjeta, usable (la miniatura y la grande se
 * fueron). Se mueve sola sólo a la vista y con la pestaña visible, con su botón de pausa (WCAG 2.2.2); fuera de cuadro,
 * quieta. Con movimiento reducido no se mueve sola nunca: se avanza a mano.
 */
export interface Reproduccion {
  /** Se mueve sola ahora (a la vista, sin pausa, sin movimiento reducido). */
  readonly corre: boolean
  readonly reducido: boolean
  readonly pausada: boolean
  readonly alternarPausa: () => void
  /** Con la barra lateral del panel: sólo si la pantalla de la demo es ancha (en una angosta se cierra, como en el panel). */
  readonly conBarra: boolean
}

const NADA = (): void => undefined

export const ReproduccionDeLaDemo = createContext<Reproduccion>({ corre: false, reducido: true, pausada: false, alternarPausa: NADA, conBarra: true })

export function useReproduccion(): Reproduccion {
  return useContext(ReproduccionDeLaDemo)
}

export interface Pasos {
  /** El paso de ahora: de 0 a `total`. */
  readonly paso: number
  readonly termino: boolean
  /** A mano (con movimiento reducido o en pausa, el botón «siguiente»). */
  readonly avanzar: () => void
  readonly reiniciar: () => void
}

/** Los pasos de una demo con guion: avanza uno cada `cadaMs` mientras corre y se queda en el último. */
export function usePasos(total: number, cadaMs: number): Pasos {
  const r = useReproduccion()
  const [ticks, setTicks] = useState(0)
  const paso = Math.min(total, ticks)
  const sumar = useCallback(() => setTicks((t) => t + 1), [])
  useEffect(() => {
    if (!r.corre || paso >= total) return undefined
    const reloj = window.setTimeout(sumar, cadaMs)
    return () => window.clearTimeout(reloj)
  }, [r.corre, paso, total, cadaMs, sumar])
  const reiniciar = useCallback(() => setTicks(0), [])
  return { paso, termino: paso >= total, avanzar: sumar, reiniciar }
}

/** ¿La pestaña está a la vista? (Oculta, no corre nada: ni siquiera se notaría.) */
const suscribirALaPestana = (f: () => void): (() => void) => {
  document.addEventListener('visibilitychange', f)
  return () => document.removeEventListener('visibilitychange', f)
}
export function usePestanaVisible(): boolean {
  return useSyncExternalStore(suscribirALaPestana, () => document.visibilityState === 'visible', () => false)
}
