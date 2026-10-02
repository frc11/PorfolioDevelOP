'use client'

import { useRef } from 'react'

import { cn } from '@/lib/utils'

import { CONSULTA_ESCENARIO } from '../../_lib/compuerta'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useAnchoMinimo } from '../../_lib/useAnchoMinimo'
import { useGiroDeLaMirada } from './useGiroDeLaMirada'

/**
 * [CIERRE RETOQUE 3D] D5 · UN BLOQUE SÓLIDO DE CSS 3D — una tecla que flota: la cara de adelante es el elemento de verdad
 * (el enlace, el campo, el botón: se enfoca, se escribe, lo anuncia el lector) sobre su tapa, y cuatro cantos y una cara de
 * atrás van hacia el fondo. Gira al revés de lo que el mouse le suma a la cámara (`useGiroDeLaMirada`): fijo en el mundo, se
 * le ven la perspectiva y los costados. El elemento de adentro lleva su propio aire (la tecla entera se toca). Abajo de
 * 1025 y con movimiento reducido, plano: sin tapa, sin cantos y sin giro (abajo el pie mezcla contra la escena; el árbol
 * quieto no escribe transformadas). Las caras son `aria-hidden`.
 */
export const BLOQUE_SOLIDO = { profundidad: 20, perspectiva: 700 } as const

type Cara = { readonly clase: string; readonly estilo: React.CSSProperties }

function carasDelBloque(d: number): readonly Cara[] {
  const px = `${String(d)}px`
  return [
    { clase: 'inset-0 bg-superficie-3', estilo: { transform: `translateZ(-${px})` } },
    { clase: 'inset-x-0 top-0 bg-superficie-2', estilo: { height: px, transformOrigin: 'top', transform: 'rotateX(-90deg)' } },
    { clase: 'inset-x-0 bottom-0 bg-superficie-3', estilo: { height: px, transformOrigin: 'bottom', transform: 'rotateX(90deg)' } },
    { clase: 'inset-y-0 left-0 bg-superficie-3', estilo: { width: px, transformOrigin: 'left', transform: 'rotateY(90deg)' } },
    { clase: 'inset-y-0 right-0 bg-superficie-3', estilo: { width: px, transformOrigin: 'right', transform: 'rotateY(-90deg)' } },
  ]
}

const CARAS = carasDelBloque(BLOQUE_SOLIDO.profundidad)

export function BloqueSolido({ children, className }: { readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  const giro = useRef<HTMLSpanElement | null>(null)
  const escritorio = useAnchoMinimo(CONSULTA_ESCENARIO)
  const reducido = useMovimientoReducido()
  const solido = escritorio && !reducido
  useGiroDeLaMirada(giro, solido)
  return (
    <span data-pieza="bloque-solido" className={cn('relative inline-block', className)} style={solido ? { perspective: `${String(BLOQUE_SOLIDO.perspectiva)}px` } : undefined}>
      <span ref={giro} className="relative block transform-3d">
        {solido && CARAS.map((c, k) => <span key={k} aria-hidden="true" data-parte="canto" className={cn('pointer-events-none absolute border border-borde', c.clase)} style={c.estilo} />)}
        {solido && <span aria-hidden="true" data-parte="tapa" className="pointer-events-none absolute inset-0 rounded-[var(--radius-sutil)] border border-borde-fuerte bg-superficie-1 shadow-[var(--shadow-flotante)]" />}
        <span className="relative block">{children}</span>
      </span>
    </span>
  )
}
