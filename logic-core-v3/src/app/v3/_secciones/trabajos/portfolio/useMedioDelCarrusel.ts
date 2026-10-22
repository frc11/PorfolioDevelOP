'use client'

import { useEffect, useRef, type RefObject } from 'react'

import { medioDelFlujo } from './medioDelCarrusel'

/** El flujo del carrusel: hermano de la caja del Portfolio en la sección (`FlujoDelPortfolio`). */
export const SELECTOR_DEL_FLUJO = '[data-pieza="flujo-del-portfolio"]'

/**
 * [B1.2e] EL MEDIO DEL CARRUSEL, MEDIDO — lo que mide el flujo (el título, el carrusel y «la tuya») en px de la regla, mientras el CSS decide
 * el carrusel; `null` si no. Se vuelve a medir cuando el flujo cambia de alto (las fuentes, el formulario que muestra un error, el ancho) y
 * cuando cambia la ventana; cada medida avisa (`alMedir`: el Portfolio vuelve a anotar su tramo y a leer el scroll). Se mide en el layout
 * (`getBoundingClientRect` del flujo, que no lleva transformadas: lo que se corre adentro, se corre de costado).
 */
export function useMedioDelCarrusel(caja: RefObject<HTMLElement | null>, carrusel: boolean, alMedir: () => void): RefObject<number | null> {
  const medio = useRef<number | null>(null)
  useEffect(() => {
    const flujo = carrusel ? (caja.current?.parentElement?.querySelector<HTMLElement>(SELECTOR_DEL_FLUJO) ?? null) : null
    if (flujo === null) {
      medio.current = null
      alMedir()
      return undefined
    }
    const medir = (): void => {
      medio.current = medioDelFlujo(flujo.getBoundingClientRect().height, window.innerHeight)
      alMedir()
    }
    medir()
    const tamano = new ResizeObserver(medir)
    tamano.observe(flujo)
    window.addEventListener('resize', medir)
    return () => {
      tamano.disconnect()
      window.removeEventListener('resize', medir)
      medio.current = null
      alMedir()
    }
  }, [caja, carrusel, alMedir])
  return medio
}
