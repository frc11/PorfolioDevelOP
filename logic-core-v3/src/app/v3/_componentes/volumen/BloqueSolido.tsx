'use client'

import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { PIEZA, RANURA, cantosDeLaPieza, sombraDeLaPieza, tapaDeLaPieza, type FormaDeLaPieza } from './piezaSolida'
import { usePoseDeLaPieza } from './usePoseDeLaPieza'

/**
 * [CIERRE RETOQUE 3D] D5 · UN BLOQUE SÓLIDO DE CSS 3D — una tecla que flota: la cara de adelante es el elemento de verdad
 * (el enlace, el campo, el botón: se enfoca, se escribe, lo anuncia el lector) sobre su tapa, y cuatro cantos y una cara de
 * atrás van hacia el fondo. El elemento de adentro lleva su propio aire (la tecla entera se toca). Abajo de 1025 y con
 * movimiento reducido, plano: sin tapa, sin cantos y sin giro (abajo el pie mezcla contra la escena; el árbol quieto no
 * escribe transformadas). Las caras son `aria-hidden`.
 *
 * [RONDA 2] F5 · LA PIEZA PREMIUM (`piezaSolida.ts`): en el negro satinado del logo, con la tinta clara (la pieza es una
 * sala invertida: el texto y el foco se dan vuelta solos), el filo claro en el contorno, los cantos en otro gris y una
 * sombra de contacto atrás. Siempre se le ven los cantos (la pose de base por su lugar en el pie) y el paralaje del mouse,
 * exagerado, revela la perspectiva. Con el mouse encima (o el foco del teclado) se hunde como una tecla, y más al apretar.
 * Tres formas: `tecla` (los enlaces), `ranura` (los campos: una placa con la ranura hundida) y `principal` (Enviar).
 */
export function BloqueSolido({ children, className, forma = 'tecla' }: { readonly children: React.ReactNode; readonly className?: string; readonly forma?: FormaDeLaPieza }): React.JSX.Element {
  const raiz = useRef<HTMLSpanElement | null>(null)
  const pose = useRef<HTMLSpanElement | null>(null)
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const reducido = useMovimientoReducido()
  const solido = escritorio && !reducido
  usePoseDeLaPieza(raiz, pose, solido)
  const d = PIEZA.profundidad[forma]
  const estilo = { perspective: `${String(PIEZA.perspectiva)}px`, ['--pieza-encima' as string]: `${String(PIEZA.hundida.encima)}px`, ['--pieza-apretada' as string]: `${String(PIEZA.hundida.apretada)}px` }
  return (
    <span
      ref={raiz}
      data-pieza="bloque-solido"
      data-forma={forma}
      data-solido={solido || undefined}
      data-seccion={solido ? 'invertida' : undefined}
      // La tinta, declarada: el `color` que hereda del pie ya viene resuelto (oscuro) y no se da vuelta con la sala.
      className={cn('group/pieza relative inline-block', solido && 'text-tinta', className)}
      style={solido ? estilo : undefined}
    >
      <span ref={pose} className="relative block transform-3d">
        {solido && <span aria-hidden="true" data-parte="sombra" className="pointer-events-none absolute inset-0 rounded-[var(--radius-sutil)]" style={sombraDeLaPieza(d)} />}
        <span
          data-parte="cuerpo"
          className={cn(
            'relative block transform-3d',
            solido && 'transition-transform duration-[var(--duracion-rapida)] group-hover/pieza:-translate-z-[var(--pieza-encima)] group-has-[:focus-visible]/pieza:-translate-z-[var(--pieza-encima)] group-active/pieza:-translate-z-[var(--pieza-apretada)]',
          )}
        >
          {solido && cantosDeLaPieza(d).map((c, k) => <span key={k} aria-hidden="true" data-parte="canto" className={cn('pointer-events-none absolute', c.clase)} style={c.estilo} />)}
          {solido && <span aria-hidden="true" data-parte="tapa" className="pointer-events-none absolute inset-0 rounded-[var(--radius-sutil)]" style={tapaDeLaPieza(forma)} />}
          {solido && forma === 'ranura' && <span aria-hidden="true" data-parte="ranura" className="pointer-events-none absolute inset-[var(--spacing-1)] rounded-[var(--radius-sutil)]" style={RANURA} />}
          <span className="relative block">{children}</span>
        </span>
      </span>
    </span>
  )
}
