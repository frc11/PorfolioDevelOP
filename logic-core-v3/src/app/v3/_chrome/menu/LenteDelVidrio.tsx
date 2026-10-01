'use client'

import { useMemo } from 'react'

import { ESCALA_DE_LA_LENTE, mapaDeLaLente } from './lente'

/**
 * [NAVBAR] T3 · LA REFRACCIÓN DEL CANTO, SÓLO DONDE SE PUEDE.
 *
 * El filtro SVG que `vidrio.css` pone en el `backdrop-filter` del panel cuando lleva `data-lente`: el mapa de `lente.ts`
 * (dibujado una vez, a media resolución, en un lienzo) estirado al tamaño del panel y un `feDisplacementMap` que corre
 * el fondo hacia adentro cerca del borde.
 *
 * ⚠️ **Safari no lo acepta, y no lo dice.** WebKit parsea `url()` en `backdrop-filter` (`CSS.supports` da verdadero)
 * pero no lo pinta: con el `url()` adentro, el panel se queda sin desenfoque. Por eso no se pregunta con `@supports`:
 * se pregunta por el motor (`navigator.userAgentData` sólo existe en Chromium; en el iPhone todos los navegadores son
 * WebKit). Fuera de Chromium el panel lleva el desenfoque, la saturación, el especular y el filo, que se sostienen
 * solos.
 */
export const ID_DE_LA_LENTE = 'lente-del-menu'

/** ¿Pinta este motor un filtro SVG en el `backdrop-filter`? Sólo Chromium. */
export function conLente(): boolean {
  return typeof navigator !== 'undefined' && 'userAgentData' in navigator
}

function dibujarElMapa(ancho: number, alto: number, radio: number): string {
  const mapa = mapaDeLaLente(ancho, alto, radio)
  const lienzo = document.createElement('canvas')
  lienzo.width = mapa.ancho
  lienzo.height = mapa.alto
  lienzo.getContext('2d')?.putImageData(new ImageData(new Uint8ClampedArray(mapa.pixeles), mapa.ancho, mapa.alto), 0, 0)
  return lienzo.toDataURL()
}

export function LenteDelVidrio({ ancho, alto, radio }: { readonly ancho: number; readonly alto: number; readonly radio: number }): React.JSX.Element {
  const mapa = useMemo(() => dibujarElMapa(ancho, alto, radio), [ancho, alto, radio])
  return (
    <svg aria-hidden="true" width={0} height={0} className="absolute">
      <filter id={ID_DE_LA_LENTE} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feImage href={mapa} x={0} y={0} width={ancho} height={alto} preserveAspectRatio="none" result="mapa" />
        <feDisplacementMap in="SourceGraphic" in2="mapa" scale={ESCALA_DE_LA_LENTE} xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}
