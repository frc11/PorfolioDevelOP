/**
 * [B1] EL ESTADO DEL SELECTOR — puro: qué se ve en cada paso, adónde lleva cada tecla y las guardas del hover (plan §5.9;
 * [B1.2b] §12, puntos 5, 6 y 9).
 *
 * El estado ES el paso (`pasos.ts`): uno por tira, sin portada ni ficha (la tira activa muestra siempre el video y la ficha).
 * Antes del pin el panel está afuera (y entra con El Garage), en la cola está afuera (y si se vuelve subiendo, entra con «la
 * tuya»). El panel entra SÓLO con el escenario pegado: si se llega rápido, el gatillo espera al pin (así entra en horizontal).
 * Las teclas y el hover no cambian el estado por su cuenta: piden un SALTO a un paso, y el salto pone el paso de destino en el
 * mismo cuadro (la página lo sigue con Lenis).
 */

import { ANTES_DEL_PIN, CANTIDAD_DE_PASOS, EN_LA_COLA, type IndiceDePaso } from './pasos'

/** [B1.2b] El hover del lomo: sólo con un puntero fino (en táctil, el clic). Sin espera: cambia en el mismo cuadro. */
export const CONSULTA_DEL_PUNTERO_FINO = '(hover: hover) and (pointer: fine)'

/**
 * [B1.2b] Las guardas del hover instantáneo: después de una activación los lomos que se reacomodan debajo del puntero no activan
 * nada hasta que el puntero se mueva de verdad (`movimientoMinimoPx`); y una ráfaga de cambios (cruzar varios lomos seguidos)
 * suena una sola vez (`rafagaMs`: un cambio a menos de eso del anterior no suena).
 */
export const HOVER = { movimientoMinimoPx: 4, rafagaMs: 250 } as const

/** ¿El puntero se movió de verdad desde la última activación? (sin activación previa, sí). */
export function seMovioDeVerdad(desde: { readonly x: number; readonly y: number } | null, x: number, y: number): boolean {
  return desde === null || Math.hypot(x - desde.x, y - desde.y) >= HOVER.movimientoMinimoPx
}

/** ¿Suena este cambio de proyecto? Sólo el primero de una ráfaga (`antes`: cuándo fue el cambio anterior, ms). */
export const suenaElCambio = (antes: number, ahora: number): boolean => ahora - antes >= HOVER.rafagaMs

/** El índice de «la próxima es la tuya» entre las tiras (después de los tres proyectos). */
export const TIRA_DE_LA_TUYA = 3
export const CANTIDAD_DE_TIRAS = CANTIDAD_DE_PASOS

export type FaseDelPanel = 'antes' | 'adentro' | 'despues'

export interface VistaDelSelector {
  readonly fase: FaseDelPanel
  /** La tira activa (0…3): antes del pin, El Garage; en la cola, la tuya. */
  readonly tira: number
}

export function vistaDelPaso(paso: IndiceDePaso): VistaDelSelector {
  if (paso === ANTES_DEL_PIN) return { fase: 'antes', tira: 0 }
  if (paso === EN_LA_COLA) return { fase: 'despues', tira: TIRA_DE_LA_TUYA }
  return { fase: 'adentro', tira: paso }
}

/**
 * [B1.2b] El paso que se MUESTRA: el del scroll, salvo que el escenario todavía no esté pegado (un salto o un scroll rápido que
 * cruza el borde antes de que el pin se asiente): ahí el panel no entra todavía (ni sale por la cola, que siempre está pegada).
 */
export function pasoConElPin(paso: IndiceDePaso, pegado: boolean): IndiceDePaso {
  return pegado || paso === ANTES_DEL_PIN || paso === EN_LA_COLA ? paso : ANTES_DEL_PIN
}

export type TeclaDelSelector = 'ArrowLeft' | 'ArrowRight' | 'Escape'

export function esTeclaDelSelector(tecla: string): tecla is TeclaDelSelector {
  return tecla === 'ArrowLeft' || tecla === 'ArrowRight' || tecla === 'Escape'
}

/**
 * Lo que hace una tecla adentro del acordeón, desde la cabecera con el foco (`tira`; `null` si el foco está en el contenido de la
 * activa) y el paso de ahora: adónde salta (un paso, o `null`) y a qué cabecera va el foco (o `null`); `null` entero si no hace
 * nada. Con el panel afuera, nada.
 *   ← / →  el proyecto de al lado de la cabecera con el foco (o de la activa), sin dar la vuelta: salta y el foco va con él
 *   Esc    el foco vuelve al lomo activo (sin saltar)
 * Enter (y la barra) en un lomo lo activa: es el clic del botón, no pasa por acá.
 */
export function accionDeLaTecla(tecla: TeclaDelSelector, tira: number | null, paso: IndiceDePaso): { readonly salto: number | null; readonly foco: number | null } | null {
  const { tira: activa, fase } = vistaDelPaso(paso)
  if (fase !== 'adentro') return null
  const desde = tira ?? activa
  switch (tecla) {
    case 'ArrowLeft':
      return desde > 0 ? { salto: desde - 1, foco: desde - 1 } : null
    case 'ArrowRight':
      return desde < CANTIDAD_DE_TIRAS - 1 ? { salto: desde + 1, foco: desde + 1 } : null
    case 'Escape':
      return { salto: null, foco: activa }
  }
}

/** Cuántos pasos hay entre dos (para la duración del salto). */
export const distanciaEnPasos = (desde: IndiceDePaso, hasta: number): number =>
  Math.abs(Math.min(CANTIDAD_DE_PASOS - 1, Math.max(0, desde)) - hasta)
