'use client'

import { useId, useRef } from 'react'

import { cn } from '@/lib/utils'

import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useHundido, useModoDelPie, usePiezaDelPie, usePieListo } from '../../_lib/pie3d/registro'
import { useGiroDeLaMirada } from './useGiroDeLaMirada'

/**
 * [CIERRE RETOQUE 3D] D5 · UN BLOQUE SÓLIDO — [RETOQUE DEL PIE] P2: la pieza del pie del lado del DOM, en sus tres modos
 * (`useModoDelPie`):
 *
 *   · `volumen` (desde 1025): la pieza la dibuja la escena en WebGL (`escena/pie3d/`). `placa` (un enlace) se anota
 *     sola y la escena le escribe, cada cuadro, la transformada que la deja sobre su placa; `principal` (Enviar) y
 *     `ranura` (un campo) son parte de la placa del formulario, que se anota entera. Con el 3D listo, lo de adentro se
 *     vuelve transparente (el anillo del foco no: es de la pieza). La placa y Enviar se hunden con el mouse, el foco y
 *     al apretar, y suenan como los CTA (`data-solido`: el tic y el pestillo);
 *   · `antes` (`?pruebas=pie=antes`): el bloque de CSS 3D de antes de RONDA 2, que gira al revés del mouse;
 *   · `plano` (abajo de 1025, sin títulos de volumen): el elemento y nada más.
 */
export type FormaDelBloque = 'placa' | 'ranura' | 'principal'

export function BloqueSolido({ children, forma = 'placa', className }: { readonly children: React.ReactNode; readonly forma?: FormaDelBloque; readonly className?: string }): React.JSX.Element {
  const modo = useModoDelPie()
  if (modo === 'volumen') return <BloqueEnVolumen forma={forma} className={className}>{children}</BloqueEnVolumen>
  if (modo === 'antes') return <BloqueDeAntes className={className}>{children}</BloqueDeAntes>
  return (
    <span data-pieza="bloque-solido" className={cn('relative inline-block', className)}>
      {children}
    </span>
  )
}

function BloqueEnVolumen({ children, forma, className }: { readonly children: React.ReactNode; readonly forma: FormaDelBloque; readonly className?: string }): React.JSX.Element {
  const raiz = useRef<HTMLSpanElement | null>(null)
  const id = useId()
  const listo = usePieListo()
  const solido = forma !== 'ranura'
  usePiezaDelPie(raiz, { id, forma: 'placa', activo: forma === 'placa' })
  useHundido(raiz, solido)
  // Transparente también lo que trae su color (los enlaces del recorrido, `pie.css`): el importante le gana a la hoja.
  return (
    <span ref={raiz} data-pieza="bloque-solido" data-forma={forma} data-solido={solido ? '' : undefined} className={cn('relative inline-block', solido && listo && 'text-transparent [&_*]:text-transparent!', className)}>
      {children}
    </span>
  )
}

/** El bloque de [CIERRE RETOQUE 3D] D5 (antes de RONDA 2): cuatro cantos y una cara de atrás de CSS 3D, girando al revés del mouse. */
const BLOQUE_DE_ANTES = { profundidad: 20, perspectiva: 700 } as const

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

const CARAS = carasDelBloque(BLOQUE_DE_ANTES.profundidad)

function BloqueDeAntes({ children, className }: { readonly children: React.ReactNode; readonly className?: string }): React.JSX.Element {
  const giro = useRef<HTMLSpanElement | null>(null)
  const reducido = useMovimientoReducido()
  useGiroDeLaMirada(giro, !reducido)
  return (
    <span data-pieza="bloque-solido" className={cn('relative inline-block', className)} style={reducido ? undefined : { perspective: `${String(BLOQUE_DE_ANTES.perspectiva)}px` }}>
      <span ref={giro} className="relative block transform-3d">
        {!reducido && CARAS.map((c, k) => <span key={k} aria-hidden="true" data-parte="canto" className={cn('pointer-events-none absolute border border-borde', c.clase)} style={c.estilo} />)}
        {!reducido && <span aria-hidden="true" data-parte="tapa" className="pointer-events-none absolute inset-0 rounded-[var(--radius-sutil)] border border-borde-fuerte bg-superficie-1 shadow-[var(--shadow-flotante)]" />}
        <span className="relative block">{children}</span>
      </span>
    </span>
  )
}
