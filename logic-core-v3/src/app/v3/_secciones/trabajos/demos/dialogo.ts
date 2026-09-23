'use client'

import { useEffect, type RefObject } from 'react'

/**
 * EL DIÁLOGO DE LA DEMO — foco atrapado, Esc y la página quieta. **[DEMOS]**
 *
 * ⚠️ **LA PÁGINA SE PAUSA SIN `lenis.stop()`, y es a propósito.**
 * `ScrollSuaveDeV3.tsx` afirma que nunca llama `stop()` —su clase cuelga un
 * `overflow: clip` del `<html>`— y su instancia no se publica. La pausa se hace
 * con dos piezas que no lo necesitan:
 *
 *   · el diálogo entero —velo incluido, que cubre la pantalla— lleva
 *     `data-lenis-prevent`: Lenis ignora toda rueda que nazca adentro;
 *   · el `<html>` pasa a `overflow: hidden` mientras está abierto, que es lo que
 *     frena lo demás: el teclado y la rueda que la demo encadena a la página
 *     cuando llega a su final. La barra de scroll ya está oculta en
 *     `globals.css`, así que no corre el layout. Al cerrar vuelve lo que había.
 *
 * El foco: entra al primer control, Tab y Shift+Tab dan la vuelta adentro, un
 * foco que se escapa (por ejemplo, saliendo de la demo) vuelve, y al cerrar
 * vuelve a la pieza que la abrió — eso lo hace `VentanaDeDemo`, que es quien
 * sabe cuándo terminó de cerrarse.
 */

export const SELECTOR_DE_FOCALIZABLES = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function focalizablesDe(caja: HTMLElement): HTMLElement[] {
  return [...caja.querySelectorAll<HTMLElement>(SELECTOR_DE_FOCALIZABLES)]
}

/** El siguiente foco con Tab adentro del diálogo: da la vuelta en las dos puntas. */
export function siguienteFoco(lista: readonly HTMLElement[], actual: Element | null, atras: boolean): HTMLElement | null {
  if (lista.length === 0) return null
  const i = actual === null ? -1 : lista.indexOf(actual as HTMLElement)
  if (atras) return i <= 0 ? lista[lista.length - 1] : lista[i - 1]
  return i < 0 || i >= lista.length - 1 ? lista[0] : lista[i + 1]
}

export function useDialogo(caja: RefObject<HTMLElement | null>, alCerrar: () => void): void {
  useEffect(() => {
    const el = caja.current
    if (el === null) return
    const html = document.documentElement
    const overflowAntes = html.style.overflow
    html.style.overflow = 'hidden'
    focalizablesDe(el)[0]?.focus({ preventScroll: true })

    const alTeclear = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') {
        e.preventDefault()
        alCerrar()
        return
      }
      if (e.key !== 'Tab') return
      e.preventDefault()
      siguienteFoco(focalizablesDe(el), document.activeElement, e.shiftKey)?.focus()
    }
    const alEntrarElFoco = (e: FocusEvent): void => {
      const destino = e.target as Node | null
      if (destino !== null && !el.contains(destino)) focalizablesDe(el)[0]?.focus({ preventScroll: true })
    }

    document.addEventListener('keydown', alTeclear)
    document.addEventListener('focusin', alEntrarElFoco)
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.removeEventListener('focusin', alEntrarElFoco)
      html.style.overflow = overflowAntes
    }
  }, [caja, alCerrar])
}
