'use client'

import { useEffect } from 'react'

/** El defecto, para el control positivo del arnés (`window.__defectosDeLasHistorias = 'sin-freno'`); nunca la URL. */
const sinFreno = (): boolean => (window as Window & { __defectosDeLasHistorias?: unknown }).__defectosDeLasHistorias === 'sin-freno'

/**
 * [P-H31b] EL FRENO DEL ARRASTRE — mientras las historias corren, el dedo no mueve la página: los deslices son de las historias. La
 * superficie ya tiene `touch-action: none`; esto frena además el arrastre que arranca en lo que flota encima (la barra del sitio). Lo que
 * pasa adentro de un diálogo (`data-lenis-prevent`: el menú, el contacto) no se toca. Era del Portfolio ([B1.2d B] T8,
 * `useSinScrollEnLasHistorias`); desde P-H31 lo trae el componente común y lo tiene cualquier uso, mientras está montado.
 */
export function useFrenoDelArrastre(activo: boolean): void {
  useEffect(() => {
    if (!activo || sinFreno()) return undefined
    const frenar = (e: TouchEvent): void => {
      if (!e.cancelable) return
      if (e.target instanceof Element && e.target.closest('[data-lenis-prevent]') !== null) return
      e.preventDefault()
    }
    document.addEventListener('touchmove', frenar, { passive: false })
    return () => document.removeEventListener('touchmove', frenar)
  }, [activo])
}
