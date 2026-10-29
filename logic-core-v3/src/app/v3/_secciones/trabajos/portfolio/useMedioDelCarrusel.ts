'use client'

import { useLayoutEffect, useRef, type RefObject } from 'react'

import { medioDelFlujo } from './medioDelCarrusel'

/** El flujo del carrusel: hermano de la caja del Portfolio en la sección (`FlujoDelPortfolio`). */
export const SELECTOR_DEL_FLUJO = '[data-pieza="flujo-del-portfolio"]'

/**
 * [B1.2e] EL MEDIO DEL CARRUSEL, MEDIDO — lo que mide el flujo (el título, el carrusel y «la tuya») en px de la regla, mientras el CSS decide
 * el carrusel; `null` si no. Se vuelve a medir cuando el flujo cambia de alto (las fuentes, el formulario que muestra un error, el ancho) y
 * cuando cambia la ventana; cada medida avisa (`alMedir`: el Portfolio vuelve a anotar su tramo y a leer el scroll). Se mide en el layout
 * (`getBoundingClientRect` del flujo, que no lleva transformadas: lo que se corre adentro, se corre de costado).
 *
 * [L2] Y mientras está el flujo, el panel suelta el piso de la tabla (su `min-height` en línea, el mismo mecanismo que usaba el túnel): la
 * sección mide el flujo y Demos, y el tramo anotado le devuelve a la escena lo que veía. Se suelta en el cliente con el carrusel ya decidido
 * (no en el CSS del servidor: antes de hidratar la sección no se achica) y se devuelve al irse.
 */
export function useMedioDelCarrusel(caja: RefObject<HTMLElement | null>, carrusel: boolean, alMedir: () => void): RefObject<number | null> {
  const medio = useRef<number | null>(null)
  // El alto de la sección antes de decidir el carrusel (el de los pasos: lo que el navegador midió al saltar a un ancla de más abajo).
  const altoSinElCarrusel = useRef<number | null>(null)
  useLayoutEffect(() => {
    if (!carrusel) altoSinElCarrusel.current = caja.current?.closest<HTMLElement>('[data-panel]')?.offsetHeight ?? null
  }, [caja, carrusel])
  useLayoutEffect(() => {
    const flujo = carrusel ? (caja.current?.parentElement?.querySelector<HTMLElement>(SELECTOR_DEL_FLUJO) ?? null) : null
    if (flujo === null) {
      medio.current = null
      alMedir()
      return undefined
    }
    const panel = caja.current?.closest<HTMLElement>('[data-panel]') ?? null
    const pisoDeLaTabla = panel?.style.minHeight ?? ''
    panel?.style.setProperty('min-height', '0px')
    // Si lo que se mira ya es lo de después de la sección (su pie, antes de achicarse, en el cuadro o más arriba: un ancla de más abajo como
    // `#servicios`, o la posición que devuelve el navegador), lo que la sección se achicó (el estilo de los pasos y el piso de la tabla) se le
    // descuenta al scroll en el mismo cuadro: la página no salta.
    const achique = panel === null || altoSinElCarrusel.current === null ? 0 : altoSinElCarrusel.current - panel.offsetHeight
    altoSinElCarrusel.current = null
    if (panel !== null && achique > 0 && panel.getBoundingClientRect().bottom + achique <= window.innerHeight) window.scrollTo({ top: window.scrollY - achique, behavior: 'instant' })
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
      panel?.style.setProperty('min-height', pisoDeLaTabla)
      medio.current = null
      alMedir()
    }
  }, [caja, carrusel, alMedir])
  return medio
}
