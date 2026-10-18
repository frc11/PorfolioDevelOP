'use client'

import { useEffect, type RefObject } from 'react'

import { CORRIMIENTO } from '../../../_chrome/barra/corrimiento'

import { escenarioDe } from './medida'

/**
 * Lo que un clic afuera NO toca: el panel (los lomos y las tiras), lo que se usa (enlaces, botones, campos) y el chrome (la barra y el
 * botón de sonido, que igual viven afuera del escenario).
 */
const NO_ES_AFUERA = '[data-pieza="panel-del-portfolio"], a, button, input, textarea, select, label, [role="button"], [data-pieza="barra"], [data-pieza="sonido-de-la-esquina"]'

/** Lo que el clic afuera lee de la sección en el evento (un `ref`: nada se vuelve a suscribir). */
export interface ControlDelClicAfuera {
  /** El panel adentro, el escenario pegado y ningún diálogo abierto. */
  readonly adentro: () => boolean
  /** La salida: justo antes del pin, con la salida normal. */
  readonly salir: () => void
}

/**
 * [B1.2d] EL CLIC AFUERA PARA SALIR (§14, A11). Desde 1024, con el panel adentro, un clic en la columna de la izquierda (la escena, el
 * título, el logo) que no sea el panel, los lomos, la barra ni el sonido lleva la página justo antes del pin, con la salida normal.
 * Sin pista visual (decisión de Valentino). Un clic que terminó una selección de texto no cuenta.
 */
export function useClicAfueraDelPanel(caja: RefObject<HTMLElement | null>, control: RefObject<ControlDelClicAfuera | null>): void {
  useEffect(() => {
    // En la caja (que no cambia) y no en el escenario: el escenario se vuelve a montar cuando la sección pasa a la rama con coreografía.
    const el = caja.current
    if (el === null) return undefined
    const alClic = (e: MouseEvent): void => {
      const c = control.current
      if (c === null || e.button !== 0 || e.defaultPrevented || !c.adentro() || !window.matchMedia(CORRIMIENTO.consulta).matches) return
      if (!(e.target instanceof Element) || escenarioDe(el)?.contains(e.target) !== true || e.target.closest(NO_ES_AFUERA) !== null) return
      if ((window.getSelection()?.toString() ?? '') !== '') return
      c.salir()
    }
    el.addEventListener('click', alClic)
    return () => el.removeEventListener('click', alClic)
  }, [caja, control])
}
