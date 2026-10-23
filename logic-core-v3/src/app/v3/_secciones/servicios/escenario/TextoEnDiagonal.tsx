'use client'

import type { CSSProperties } from 'react'

import { palabrasDe } from '../../../_lib/palabras'
import { CORTE_DE_LA_DIAGONAL } from './datos'

/**
 * [B4 · C2-50] EL TEXTO DE UN SERVICIO, EN SU FRANJA — de techo a pie (ítem 13), en serif cursiva (`claseDeLetra`, de
 * `?fuente-servicio=`; mientras llega, la del cuerpo en cursiva) y con el cuerpo más grande que entra (`ajuste.ts`, lo corre la
 * coreografía sobre `data-parte="parrafos"`).
 *
 * En web, cada renglón arranca donde lo corta la diagonal: un `float` con `shape-outside` en triángulo, del alto del panel y de ancho
 * `CORTE_DE_LA_DIAGONAL` (`100cqh` es el alto del panel, su contenedor). La franja se corre ese mismo corte hacia el video (un margen
 * negativo), así la diagonal del texto es PARALELA al corte del video y queda a un `gap` de él: arriba arranca donde el video ya está
 * cortado. En software, el espejo (los renglones terminan en la diagonal, contra el video); en IA, a plomo. Abajo de 1024 la tangente
 * es 0: a plomo, apilado.
 *
 * Arriba y abajo, el aire del panel (en escritorio la franja va de borde a borde del panel, como el video). Cada palabra va en su
 * ventana (`overflow: hidden`) para levantarse en 2D renglón por renglón (`data-palabra`, la mueve el escenario con la transición);
 * el texto se lee entero, palabra por palabra, en el árbol de accesibilidad.
 */
export function TextoEnDiagonal({ parrafos, diagonal, claseDeLetra, className }: { readonly parrafos: readonly string[]; readonly diagonal: 'izquierda' | 'derecha' | null; readonly claseDeLetra: string; readonly className?: string }): React.JSX.Element {
  const triangulo = diagonal === 'izquierda' ? 'polygon(0 0, 0 100%, 100% 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)'
  const corte: CSSProperties = { width: CORTE_DE_LA_DIAGONAL, shapeOutside: triangulo }
  const hacia = diagonal === 'izquierda' ? 'escritorio:-ml-[calc(100cqh*var(--tangente-de-la-diagonal))]' : diagonal === 'derecha' ? 'escritorio:-mr-[calc(100cqh*var(--tangente-de-la-diagonal))]' : ''
  const letra = claseDeLetra === '' ? 'font-cuerpo' : claseDeLetra
  return (
    <div data-pieza="texto-del-servicio" data-diagonal={diagonal ?? 'a-plomo'} className={`overflow-hidden ${hacia} ${className ?? ''}`}>
      {diagonal !== null && <div aria-hidden="true" className={diagonal === 'izquierda' ? 'float-left h-full' : 'float-right h-full'} style={corte} />}
      <div aria-hidden="true" className="h-[calc(var(--spacing-20)+var(--spacing-8))] max-escritorio:hidden" />
      <div data-parte="parrafos" className={`${letra} text-fluido-titulo-l escritorio:text-fluido-titulo-xl leading-texto text-tinta italic ${diagonal === 'derecha' ? 'text-right' : 'text-left'}`}>
        {parrafos.map((parrafo, k) => (
          <p key={parrafo} className={k > 0 ? 'mt-[var(--spacing-4)]' : undefined}>
            {palabrasDe(parrafo).map((palabra, i, todas) => (
              <span key={`${String(i)}-${palabra}`}>
                <span className="-mx-[var(--spacing-1)] -mb-[var(--spacing-1)] inline-block overflow-hidden px-[var(--spacing-1)] pb-[var(--spacing-1)] align-top">
                  <span data-palabra="" className="inline-block will-change-transform">
                    {palabra}
                  </span>
                </span>
                {i < todas.length - 1 ? ' ' : null}
              </span>
            ))}
          </p>
        ))}
      </div>
      <div aria-hidden="true" className="h-[var(--spacing-12)] max-escritorio:hidden" />
    </div>
  )
}
