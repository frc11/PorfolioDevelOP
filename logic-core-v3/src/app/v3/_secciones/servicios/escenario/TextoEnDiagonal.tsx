'use client'

import type { CSSProperties, ReactNode } from 'react'

import { palabrasDe } from '../../../_lib/palabras'
import { CORTE_DE_LA_DIAGONAL, PARRAFOS_DEL_TELEFONO } from './datos'

/**
 * [B4 · C2-50 · L3] EL TEXTO DE UN SERVICIO, EN SU FRANJA — de techo a pie (ítem 13), con el cuerpo más grande que entra (`ajuste.ts`, lo
 * corre la coreografía sobre `data-parte="parrafos"`). [L3] En la letra de los cuerpos del sitio (`font-cuerpo`), derecha: el mismo
 * tope, la misma franja y la misma diagonal que la serif cursiva de antes (ítem 50: «literalmente como está, pero con la letra de los
 * cuerpos»). Abajo de 1024, sólo los primeros `PARRAFOS_DEL_TELEFONO` (los otros, ocultos): más corto y, con el ajuste, más grande.
 *
 * En web, cada renglón arranca donde lo corta la diagonal: un `float` con `shape-outside` en triángulo, del alto del panel y de ancho
 * `CORTE_DE_LA_DIAGONAL` (`100cqh` es el alto del panel, su contenedor). La franja se corre ese mismo corte hacia el video (un margen
 * negativo), así la diagonal del texto es PARALELA al corte del video y queda a un `gap` de él. En software, el espejo; en IA, a plomo.
 * Abajo de 1024 la tangente es 0: a plomo, apilado. `final` ([L3] «Leer más…») va en su propio renglón al final, adentro del mismo flujo:
 * sigue la diagonal como el cuerpo.
 *
 * Cada palabra va en su ventana (`overflow: hidden`) para levantarse en 2D renglón por renglón (`data-palabra`, la mueve el escenario con
 * la transición); el texto se lee entero, palabra por palabra, en el árbol de accesibilidad.
 */

/** Una palabra en su ventana, para levantarse con su renglón. */
const Ventana = ({ children }: { readonly children: ReactNode }): React.JSX.Element => (
  <span className="-mx-[var(--spacing-1)] -mb-[var(--spacing-1)] inline-block overflow-hidden px-[var(--spacing-1)] pb-[var(--spacing-1)] align-top">
    <span data-palabra="" className="inline-block will-change-transform">
      {children}
    </span>
  </span>
)

export function TextoEnDiagonal({ parrafos, diagonal, final, className }: { readonly parrafos: readonly string[]; readonly diagonal: 'izquierda' | 'derecha' | null; readonly final?: ReactNode; readonly className?: string }): React.JSX.Element {
  const triangulo = diagonal === 'izquierda' ? 'polygon(0 0, 0 100%, 100% 100%)' : 'polygon(100% 0, 100% 100%, 0 100%)'
  const corte: CSSProperties = { width: CORTE_DE_LA_DIAGONAL, shapeOutside: triangulo }
  const hacia = diagonal === 'izquierda' ? 'escritorio:-ml-[calc(100cqh*var(--tangente-de-la-diagonal))]' : diagonal === 'derecha' ? 'escritorio:-mr-[calc(100cqh*var(--tangente-de-la-diagonal))]' : ''
  return (
    <div data-pieza="texto-del-servicio" data-diagonal={diagonal ?? 'a-plomo'} className={`overflow-hidden ${hacia} ${className ?? ''}`}>
      {diagonal !== null && <div aria-hidden="true" className={diagonal === 'izquierda' ? 'float-left h-full' : 'float-right h-full'} style={corte} />}
      <div aria-hidden="true" className="h-[calc(var(--spacing-20)+var(--spacing-8))] max-escritorio:hidden" />
      <div data-parte="parrafos" className={`font-cuerpo text-fluido-titulo-l escritorio:text-fluido-titulo-xl leading-texto text-tinta ${diagonal === 'derecha' ? 'text-right' : 'text-left'}`}>
        {parrafos.map((parrafo, k) => (
          <p key={parrafo} className={`${k > 0 ? 'mt-[var(--spacing-4)]' : ''} ${k >= PARRAFOS_DEL_TELEFONO ? 'max-escritorio:hidden' : ''}`}>
            {palabrasDe(parrafo).map((palabra, i, todas) => (
              <span key={`${String(i)}-${palabra}`}>
                <Ventana>{palabra}</Ventana>
                {i < todas.length - 1 ? ' ' : null}
              </span>
            ))}
          </p>
        ))}
        {final === undefined ? null : (
          <p data-parte="final-del-cuerpo" className="mt-[var(--spacing-4)]">
            <Ventana>{final}</Ventana>
          </p>
        )}
      </div>
      <div aria-hidden="true" className="h-[var(--spacing-12)] max-escritorio:hidden" />
    </div>
  )
}
