'use client'

import { useLayoutEffect, type RefObject } from 'react'

/**
 * [PULIDO 10] J8 · LA COLUMNA DEL FORMULARIO, CON SU TECHO FIJO: centrada con el alto que tiene al montarse (el formulario) y
 * después quieta, aunque lo de adentro cambie de alto. Centrada con una transformada, la tarjeta de gracias (más baja) se
 * recentraba y bajaba 63 px (J4 · d); y un error que crece la subía. Se vuelve a centrar sólo si cambia el cuadro o al
 * llegar las fuentes, antes de que el pie de volumen se arme (los dos lo rearman: `PieDeVolumen.tsx`).
 */
export function useArribaFijo(ref: RefObject<HTMLElement | null>, activo: boolean, junto: RefObject<HTMLElement | null> | null = null): void {
  useLayoutEffect(() => {
    const el = ref.current
    if (!activo || el === null) return undefined
    let cuadro = ''
    const fijar = (forzar: boolean): void => {
      if (!forzar && `${String(innerWidth)}x${String(innerHeight)}` === cuadro) return
      cuadro = `${String(innerWidth)}x${String(innerHeight)}`
      el.style.top = ''
      el.style.translate = ''
      const padre = el.offsetParent
      if (!(padre instanceof HTMLElement)) return
      // [PULIDO 26] X1 · con `junto` (la columna izquierda, anclada arriba) el centro de las dos es el mismo; sin ella, el del cuadro.
      const otra = junto?.current ?? null
      const centro = otra !== null && otra.offsetParent === padre ? otra.offsetTop + otra.offsetHeight / 2 : padre.clientHeight / 2
      el.style.top = `${String(Math.round(centro - el.offsetHeight / 2))}px`
      el.style.translate = 'none'
    }
    const alCambiarElCuadro = (): void => fijar(false)
    fijar(true)
    let vivo = true
    void document.fonts.ready.then(() => {
      if (vivo) fijar(true)
    })
    window.addEventListener('resize', alCambiarElCuadro)
    return () => {
      vivo = false
      window.removeEventListener('resize', alCambiarElCuadro)
      el.style.top = ''
      el.style.translate = ''
    }
  }, [ref, activo, junto])
}
