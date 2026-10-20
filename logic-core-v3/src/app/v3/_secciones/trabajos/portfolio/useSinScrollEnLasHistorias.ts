'use client'

import { useEffect } from 'react'

/**
 * [B1.2d B] T8 · EL SCROLL NUNCA AVANZA LAS HISTORIAS — mientras corren, el dedo no mueve la página: los deslices son de las historias
 * (los de costado cambian de proyecto; arriba sale a Demos, abajo vuelve al título). La superficie ya tiene `touch-action: none`; esto
 * frena además el arrastre que arranca en lo que flota encima (la barra del sitio). Lo que pasa adentro de un diálogo
 * (`data-lenis-prevent`: el menú, el contacto) no se toca.
 */
export function useSinScrollEnLasHistorias(activas: boolean): void {
  useEffect(() => {
    if (!activas) return undefined
    const frenar = (e: TouchEvent): void => {
      if (!e.cancelable) return
      if (e.target instanceof Element && e.target.closest('[data-lenis-prevent]') !== null) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', frenar, { passive: false })
    return () => document.removeEventListener('touchmove', frenar)
  }, [activas])
}
