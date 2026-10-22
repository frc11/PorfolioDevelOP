'use client'

import type { CSSProperties } from 'react'

import { palabrasDe } from '../../../_lib/palabras'

/**
 * [B4] EL TEXTO DE UN SERVICIO, EN SU FRANJA — en web, cada renglón arranca donde lo corta la diagonal (un `float` con
 * `shape-outside` en triángulo: el navegador corta los renglones por ella); en software, el espejo (los renglones terminan en la
 * diagonal, contra el video); en IA, a plomo. El ángulo sale de `--tangente-de-la-diagonal` (la bandera `?diagonal=`), y el alto de la
 * franja de la caja (`container-type: size`): el triángulo mide el alto de la franja por su tangente.
 *
 * Cada palabra va en su ventana (`overflow: hidden`) para levantarse en 2D renglón por renglón (`data-palabra`, la mueve el
 * escenario con la transición); el texto se lee entero, palabra por palabra, en el árbol de accesibilidad.
 */
export function TextoEnDiagonal({ texto, diagonal, className }: { readonly texto: string; readonly diagonal: 'izquierda' | 'derecha' | null; readonly className?: string }): React.JSX.Element {
  const palabras = palabrasDe(texto)
  const triangulo = diagonal === 'izquierda' ? 'polygon(0 0, 0 100%, 100% 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)'
  const corte: CSSProperties = { width: 'calc(100cqh * var(--tangente-de-la-diagonal, 0.364))', shapeOutside: triangulo }
  return (
    <div data-pieza="texto-del-servicio" data-diagonal={diagonal ?? 'a-plomo'} className={className} style={{ containerType: 'size' }}>
      {diagonal !== null && <div aria-hidden="true" className={diagonal === 'izquierda' ? 'float-left h-full' : 'float-right h-full'} style={corte} />}
      <div aria-hidden="true" className="h-1/5 max-escritorio:hidden" />
      <p className={`font-cuerpo text-fluido-titulo-s leading-texto text-tinta ${diagonal === 'derecha' ? 'text-right' : 'text-left'}`}>
        {palabras.map((palabra, i) => (
          <span key={`${String(i)}-${palabra}`}>
            <span className="inline-block overflow-hidden pb-[var(--spacing-1)] -mb-[var(--spacing-1)] align-top">
              <span data-palabra="" className="inline-block will-change-transform">
                {palabra}
              </span>
            </span>
            {i < palabras.length - 1 ? ' ' : null}
          </span>
        ))}
      </p>
    </div>
  )
}
