'use client'

import { useEffect, type RefObject } from 'react'

import { avanceDeLaPalabra, grisSinPintar } from '../../_componentes/pintado/pintado'

/** El color de una palabra con su pintado (para su `style`): la tinta en la proporción de `--pintado`, el resto el gris de lo no leído. */
export const COLOR_DE_LA_PALABRA = { color: 'color-mix(in oklab, var(--color-tinta) calc(var(--pintado, 1) * 100%), var(--gris-del-pintado))' } as const

/** Lo que el bloque lleva en su `style`: el gris de lo no leído, el del Panel (`PRESENCIA_SIN_PINTAR`). */
export const estiloDelBloquePintado = (): React.CSSProperties => ({ '--gris-del-pintado': grisSinPintar() }) as React.CSSProperties

/**
 * [L7e] El pintado palabra por palabra del título del Panel (`_componentes/pintado/`), para un bloque de cualquier largo: el avance es
 * cuánto del bloque ya pasó por la línea de lectura (`linea`, fracción del alto de la pantalla). Escribe `--pintado` en cada
 * `[data-palabra]` por cuadro, sólo mientras el bloque está en pantalla. Apagado (`activo` en falso), todo queda pintado.
 */
export function usePintadoDelBloque(ref: RefObject<HTMLElement | null>, activo: boolean, linea = 0.6): void {
  useEffect(() => {
    const el = ref.current
    if (el === null || !activo) return undefined
    const palabras = [...el.querySelectorAll<HTMLElement>('[data-palabra]')]
    let pedido = 0
    const pintar = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const avance = Math.min(1, Math.max(0, (window.innerHeight * linea - caja.top) / caja.height))
      palabras.forEach((p, i) => p.style.setProperty('--pintado', avanceDeLaPalabra(avance, i, palabras.length).toFixed(3)))
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(pintar)
    }
    const cerca = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting === true) window.addEventListener('scroll', pedir, { passive: true })
      else window.removeEventListener('scroll', pedir)
      pedir()
    })
    cerca.observe(el)
    window.addEventListener('resize', pedir)
    pintar()
    return () => {
      cerca.disconnect()
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
      for (const p of palabras) p.style.removeProperty('--pintado')
    }
  }, [ref, activo, linea])
}

/** Un texto partido en palabras pintables (el espacio va afuera de la palabra). */
export function PalabrasPintables({ texto }: { readonly texto: string }): React.JSX.Element {
  return (
    <>
      {texto.split(' ').map((p, i) => (
        <span key={i}>
          <span data-palabra="" style={COLOR_DE_LA_PALABRA}>
            {p}
          </span>{' '}
        </span>
      ))}
    </>
  )
}
