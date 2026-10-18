'use client'

import { motion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useSyncExternalStore } from 'react'

import { cn } from '@/lib/utils'

import { Caption } from '../../../_componentes/tipografia/Textos'

import { CONTENIDO } from '../contenido'

import { CANTIDAD_DE_TIRAS, vistaDelPaso } from './estado'
import type { PortfolioVivo } from './usePortfolio'

/** Una barra: llena (un proyecto ya visto), vacía (uno que viene) o la del activo, que se llena con lo recorrido de su paso. */
export type EstadoDeLaBarra = 'llena' | 'activa' | 'vacia'

export function estadosDeLasBarras(tira: number, fase: 'antes' | 'adentro' | 'despues'): readonly EstadoDeLaBarra[] {
  return Array.from({ length: CANTIDAD_DE_TIRAS }, (_, i) => (fase === 'despues' || i < tira ? 'llena' : fase === 'antes' || i > tira ? 'vacia' : 'activa'))
}

function Barra({ estado, avance }: { readonly estado: EstadoDeLaBarra; readonly avance: MotionValue<number> }): React.JSX.Element {
  const ancho = useTransform(avance, (a) => `${(a * 100).toFixed(2)}%`)
  return (
    <span data-barra={estado} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/25">
      <motion.span className="absolute inset-y-0 left-0 bg-tinta" style={{ width: estado === 'llena' ? '100%' : estado === 'vacia' ? '0%' : ancho }} />
    </span>
  )
}

/**
 * [B1.2c] LAS BARRAS DE PROGRESO (plan §13, punto 7; las mismas que las historias del teléfono, B1.3): una por proyecto y la de «la
 * tuya». Las vistas, llenas; la del activo se llena con lo recorrido de su paso (el scroll: así se entiende que hay que seguir
 * bajando); las que vienen, vacías. Decorativas (`aria-hidden`): el acordeón ya dice cuál está activo. El ancho y no una
 * transformada: la rama quieta no escribe una (`trabajos.invariant`).
 */
export function BarrasDelPortfolio({ vivo, className, style }: { readonly vivo: PortfolioVivo; readonly className?: string; readonly style?: React.CSSProperties }): React.JSX.Element {
  const { tira, fase } = vistaDelPaso(vivo.paso)
  return (
    <div aria-hidden="true" data-pieza="barras-del-portfolio" className={cn('pointer-events-none gap-2', className)} style={style}>
      {estadosDeLasBarras(tira, fase).map((estado, i) => (
        <Barra key={i} estado={estado} avance={vivo.avanceDelPaso} />
      ))}
    </div>
  )
}

/** La pista se vio (y no vuelve en la sesión). */
export const CLAVE_DE_LA_PISTA = 'v3-portfolio-pista'

/** Lo visto, por la sesión (`sessionStorage`) y por esta carga (sin almacenamiento, se va igual). Un almacén externo: nadie escribe estado en un efecto. */
let vistaEnEstaCarga = false
const SUSCRIPTORES = new Set<() => void>()
function laPistaSeVio(): boolean {
  if (vistaEnEstaCarga) return true
  try {
    return window.sessionStorage.getItem(CLAVE_DE_LA_PISTA) === 'vista'
  } catch {
    return false
  }
}
function marcarLaPista(): void {
  vistaEnEstaCarga = true
  try {
    window.sessionStorage.setItem(CLAVE_DE_LA_PISTA, 'vista')
  } catch {
    // Sin almacenamiento: se fue igual en esta carga.
  }
  for (const avisar of SUSCRIPTORES) avisar()
}
function suscribirALaPista(avisar: () => void): () => void {
  SUSCRIPTORES.add(avisar)
  return () => SUSCRIPTORES.delete(avisar)
}

/**
 * [B1.2c] LA PISTA DE LA TABLET (plan §13, punto 7): la primera vez que entra el panel, «Seguí bajando» con una flecha. Se va con el
 * primer paso (o con el panel) y no vuelve en la sesión. Sólo en tablet (el CSS de quien la monta). Decorativa: el acordeón ya es
 * navegable. En el servidor, vista (no se pinta).
 */
export function PistaDelPortfolio({ vivo, className }: { readonly vivo: PortfolioVivo; readonly className?: string }): React.JSX.Element {
  const vista = useSyncExternalStore(suscribirALaPista, laPistaSeVio, () => true)
  const desde = useRef<number | null>(null)
  useEffect(() => {
    if (vista) return
    if (vivo.escena && desde.current === null) {
      desde.current = vivo.paso
      return
    }
    if (desde.current !== null && (!vivo.escena || vivo.paso !== desde.current)) marcarLaPista()
  }, [vista, vivo.escena, vivo.paso])
  // Va siempre en el marcado (el contenido entero llega a las dos ramas) y se esconde con `hidden`.
  return (
    <div aria-hidden="true" data-pieza="pista-del-portfolio" hidden={vista || !vivo.escena} className={cn('pointer-events-none items-center gap-2 rounded-full bg-fondo/80 px-3 py-1 text-tinta', className)}>
      <Caption como="span" interletrado="micro" className="font-codigo uppercase">
        {CONTENIDO.pista}
      </Caption>
      <span className="inline-block animate-bounce motion-reduce:animate-none">↓</span>
    </div>
  )
}
