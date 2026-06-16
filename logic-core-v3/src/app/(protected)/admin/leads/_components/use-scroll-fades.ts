'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

const SCROLL_FADE_THRESHOLD = 4 // px de margen para considerar "se puede scrollear"

/**
 * Fades SCROLL-AWARE de un bloque scrolleable: fade arriba sólo si se puede subir, abajo
 * sólo si se puede bajar (sin overflow → ninguno). El setState vive en callbacks (onScroll
 * / ResizeObserver), no en el cuerpo del effect → sin react-hooks/set-state-in-effect.
 *
 * @param contentKey re-corre la medición cuando cambia el contenido (p. ej. cantidad de items).
 * @param fadeHeight alto del fade en px.
 * @returns ref para el contenedor, onScroll para el handler, y el maskImage a aplicar.
 */
export function useScrollFades(contentKey: number, fadeHeight: number) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollUp, setCanScrollUp] = useState(false)
  const [canScrollDown, setCanScrollDown] = useState(false)

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    setCanScrollUp(el.scrollTop > SCROLL_FADE_THRESHOLD)
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - SCROLL_FADE_THRESHOLD)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) {
      return
    }
    // observe() dispara el callback al montar y en cada resize; contentKey re-corre el
    // effect (re-observa) cuando cambia el contenido sin cambiar el tamaño del contenedor.
    const observer = new ResizeObserver(onScroll)
    observer.observe(el)
    return () => observer.disconnect()
  }, [onScroll, contentKey])

  const maskImage = `linear-gradient(to bottom, ${
    canScrollUp ? 'transparent' : '#000'
  }, #000 ${fadeHeight}px, #000 calc(100% - ${fadeHeight}px), ${
    canScrollDown ? 'transparent' : '#000'
  })`

  return { scrollRef, onScroll, maskImage }
}
