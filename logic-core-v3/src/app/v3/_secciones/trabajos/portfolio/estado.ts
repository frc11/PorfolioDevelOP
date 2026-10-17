/**
 * [B1] EL ESTADO DEL SELECTOR — puro: qué se ve en cada paso y adónde lleva cada tecla (plan §5.9).
 *
 * El estado ES el paso (`pasos.ts`): antes del pin el panel está afuera (y entra con El Garage), en la cola está afuera (y si se
 * vuelve subiendo, entra con «la tuya»). Las teclas no cambian el estado: piden un SALTO a un paso (la página va ahí y el estado
 * lo sigue), así que el teclado, el clic, el hover y el scroll pasan por el mismo lugar.
 */

import { ANTES_DEL_PIN, CANTIDAD_DE_PASOS, EN_LA_COLA, lugarDelPaso, pasoDeLaPortada, type IndiceDePaso, type VistaDelPaso } from './pasos'

/** El índice de «la próxima es la tuya» entre las tiras (después de los tres proyectos). */
export const TIRA_DE_LA_TUYA = 3
export const CANTIDAD_DE_TIRAS = 4

export type FaseDelPanel = 'antes' | 'adentro' | 'despues'

export interface VistaDelSelector {
  readonly fase: FaseDelPanel
  /** La tira activa (0…3): antes del pin, El Garage; en la cola, la tuya. */
  readonly tira: number
  readonly vista: VistaDelPaso
}

export function vistaDelPaso(paso: IndiceDePaso): VistaDelSelector {
  if (paso === ANTES_DEL_PIN) return { fase: 'antes', tira: 0, vista: 'portada' }
  if (paso === EN_LA_COLA) return { fase: 'despues', tira: TIRA_DE_LA_TUYA, vista: 'portada' }
  const { proyecto, vista } = lugarDelPaso(paso)
  return { fase: 'adentro', tira: proyecto, vista }
}

export type TeclaDelSelector = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown' | 'Enter' | 'Escape'

export function esTeclaDelSelector(tecla: string): tecla is TeclaDelSelector {
  return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(tecla)
}

/**
 * Adónde salta una tecla, desde la tira con el foco (`tira`) y el paso de ahora; `null` si no hace nada.
 *   ←/↑ la portada de la tira anterior · →/↓ la de la siguiente (sin dar la vuelta)
 *   Enter en la tira activa: abre o cierra la ficha (en la tuya no hay ficha); en otra tira: va a su portada
 *   Esc: de la ficha a la portada
 */
export function saltoDeLaTecla(tecla: TeclaDelSelector, tira: number, paso: IndiceDePaso): number | null {
  const { tira: activa, vista, fase } = vistaDelPaso(paso)
  switch (tecla) {
    case 'ArrowLeft':
    case 'ArrowUp':
      return tira > 0 ? pasoDeLaPortada(tira - 1) : null
    case 'ArrowRight':
    case 'ArrowDown':
      return tira < CANTIDAD_DE_TIRAS - 1 ? pasoDeLaPortada(tira + 1) : null
    case 'Enter':
      if (fase !== 'adentro' || tira !== activa) return pasoDeLaPortada(tira)
      if (tira === TIRA_DE_LA_TUYA) return null
      return vista === 'portada' ? pasoDeLaPortada(tira) + 1 : pasoDeLaPortada(tira)
    case 'Escape':
      return fase === 'adentro' && vista === 'ficha' ? pasoDeLaPortada(activa) : null
  }
}

/** Cuántos pasos hay entre dos (para la duración del salto). */
export const distanciaEnPasos = (desde: IndiceDePaso, hasta: number): number =>
  Math.abs(Math.min(CANTIDAD_DE_PASOS - 1, Math.max(0, desde)) - hasta)
