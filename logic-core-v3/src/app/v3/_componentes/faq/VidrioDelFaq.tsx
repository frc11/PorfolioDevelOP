'use client'

import { useEffect, useState, type CSSProperties, type ReactNode, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { useTonoDebajo } from '../../_chrome/menu/useTonoDebajo'

/**
 * [B10] UN BLOQUE DEL FAQ — el vidrio del formulario del pie de abajo de 1024 (`[data-material="vidrio"]`, `vidrio.css`: una sola
 * definición del material) con el tono de lo que tiene debajo (`useTonoDebajo`, el del botón del menú): sobre la sala de día, claro; de
 * noche, oscuro (los claros encima). Es la caja de `CajaDeVidrio` (`ColumnasDelPie.tsx`) con su propia referencia y su estilo: el FAQ le
 * escribe el hundimiento a ESTE elemento (en un ancestro, el recorte le cortaría el desenfoque).
 */
export function VidrioDelFaq({ caja, estilo, className, children }: { readonly caja: RefObject<HTMLDivElement | null>; readonly estilo?: CSSProperties; readonly className?: string; readonly children: ReactNode }): React.JSX.Element {
  const [aLaVista, setALaVista] = useState(false)
  useEffect(() => {
    const el = caja.current
    if (el === null) return undefined
    const vigia = new IntersectionObserver(([e]) => setALaVista(e?.isIntersecting ?? false))
    vigia.observe(el)
    return () => vigia.disconnect()
  }, [caja])
  const debajo = useTonoDebajo(caja, aLaVista)
  return (
    <div ref={caja} data-material="vidrio" data-seccion={debajo === 'oscuro' ? 'invertida' : undefined} style={estilo} className={cn('text-tinta', className)}>
      {children}
    </div>
  )
}
