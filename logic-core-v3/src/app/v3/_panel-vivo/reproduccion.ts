'use client'

import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from 'react'

/**
 * [NOCTURNO] B · CÓMO CORRE UNA DEMO DEL PANEL — el contexto que la demo lee para saber si se mueve sola, y los pasos de
 * su guion. Dos modos: la `miniatura` de la tarjeta (inerte, chica, repite el final de su guion cada vez que entra a la
 * vista y queda quieta: cinco segundos como mucho, WCAG 2.2.2) y la `completa` de la ampliación (usable, se mueve sola con
 * su botón de pausa). Fuera de cuadro, con la pestaña oculta o con la ampliación abierta detrás, no corre. Con movimiento
 * reducido no se mueve sola nunca: se avanza a mano.
 */
export type ModoDeLaDemo = 'miniatura' | 'completa'

export interface Reproduccion {
  readonly modo: ModoDeLaDemo
  /** Se mueve sola ahora (a la vista, sin pausa, sin movimiento reducido). */
  readonly corre: boolean
  readonly reducido: boolean
  /** Cuántas veces entró a la vista: la miniatura repite el final de su guion en cada entrada. */
  readonly entrada: number
  readonly pausada: boolean
  readonly alternarPausa: () => void
}

const NADA = (): void => undefined

export const ReproduccionDeLaDemo = createContext<Reproduccion>({ modo: 'completa', corre: false, reducido: true, entrada: 1, pausada: false, alternarPausa: NADA })

export function useReproduccion(): Reproduccion {
  return useContext(ReproduccionDeLaDemo)
}

/**
 * Lo que la miniatura repite del final de su guion en cada entrada (pasos), cada cuánto avanza un paso (ms) y cuánto
 * se mueve en cada entrada (ms): después queda quieta del todo, también las animaciones de CSS del panel (los puntos que
 * laten, los íconos que giran). Menos de cinco segundos: WCAG 2.2.2; y quieta, no cuesta nada.
 */
export const MINIATURA = { pasosAlFinal: 3, msMaximoPorPaso: 1600, vivaMs: 5000 } as const

export interface Pasos {
  /** El paso de ahora: de 0 a `total`. */
  readonly paso: number
  readonly termino: boolean
  /** A mano (con movimiento reducido o en pausa, el botón «siguiente»). */
  readonly avanzar: () => void
  readonly reiniciar: () => void
}

/**
 * Los pasos de una demo con guion: avanza uno cada `cadaMs` mientras corre y se queda en el último. La miniatura arranca
 * `MINIATURA.pasosAlFinal` antes del final en cada entrada (y, con movimiento reducido, ya en el final).
 */
export function usePasos(total: number, cadaMs: number): Pasos {
  const r = useReproduccion()
  const miniatura = r.modo === 'miniatura'
  const [cuenta, setCuenta] = useState({ entrada: r.entrada, ticks: 0 })
  const ticks = cuenta.entrada === r.entrada ? cuenta.ticks : 0
  const inicial = miniatura ? (r.reducido ? total : Math.max(0, total - MINIATURA.pasosAlFinal)) : 0
  const paso = Math.min(total, inicial + ticks)
  const ms = miniatura ? Math.min(cadaMs, MINIATURA.msMaximoPorPaso) : cadaMs
  const entrada = r.entrada
  const sumar = useCallback(() => setCuenta((c) => ({ entrada, ticks: (c.entrada === entrada ? c.ticks : 0) + 1 })), [entrada])
  useEffect(() => {
    if (!r.corre || paso >= total) return undefined
    const reloj = window.setTimeout(sumar, ms)
    return () => window.clearTimeout(reloj)
  }, [r.corre, paso, total, ms, sumar])
  const reiniciar = useCallback(() => setCuenta({ entrada, ticks: 0 }), [entrada])
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

/** ¿Está abierta la demo grande? Mientras, las miniaturas de atrás no corren. */
let abierta = false
const oyentes = new Set<() => void>()
export function marcarLaDemoGrande(v: boolean): void {
  if (abierta === v) return
  abierta = v
  for (const f of oyentes) f()
}
const suscribirALaGrande = (f: () => void): (() => void) => {
  oyentes.add(f)
  return () => {
    oyentes.delete(f)
  }
}
export function useDemoGrandeAbierta(): boolean {
  return useSyncExternalStore(suscribirALaGrande, () => abierta, () => false)
}
