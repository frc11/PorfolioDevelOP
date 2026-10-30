'use client'

import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Titular, type NivelDeTitular } from '../../_componentes/tipografia/Titular'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { PRESENCIA_DEL_ENCABEZADO } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { TitularQueSeLevanta, usePresencia } from '../../_secciones/trabajos/portfolio/levantarse'

import { useCruzoLaLinea } from './cruce'

/**
 * [M2] UN TITULAR QUE SE LEVANTA AL CRUZAR LA LÍNEA — el de los títulos del Portfolio y de Demos en el teléfono (`levantarse.tsx`: desde abajo de
 * su ventana, de acostado a parado), disparado por la línea del sitio (`useCruzoLaLinea`) y no por la sección. Lo usan los títulos de las tarjetas
 * de notas (con un `retrasoMs`: llegan después de su tarjeta) y los subtítulos de la nota. Vuelve en espejo al subir. En el teléfono no se
 * desactiva; con movimiento reducido está parado desde el principio.
 *
 * La ventana recorta (`overflow-hidden`) con un respiro abajo para los descendentes del último renglón.
 */
export function TitularQueSeLevantaAlCruzar({ children, nivel, como, retrasoMs = 0, className, id }: {
  readonly children: string
  readonly nivel: NivelDeTitular
  readonly como: 'h2' | 'h3'
  readonly retrasoMs?: number
  readonly className?: string
  readonly id?: string
}): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const caja = useRef<HTMLDivElement>(null)
  const cruzo = useCruzoLaLinea(caja)
  const [arriba, setArriba] = useState(false)
  useEffect(() => {
    if (!cruzo) {
      setArriba(false)
      return undefined
    }
    const t = window.setTimeout(() => setArriba(true), retrasoMs)
    return () => window.clearTimeout(t)
  }, [cruzo, retrasoMs])
  const presencia = usePresencia(arriba || reducido, reducido, PRESENCIA_DEL_ENCABEZADO)
  return (
    <div ref={caja} data-parte="titular-que-se-levanta">
      <Titular nivel={nivel} como={como} id={id} className={cn('-mb-[0.15em] overflow-hidden pb-[0.15em]', className)}>
        <TitularQueSeLevanta presencia={presencia}>{children}</TitularQueSeLevanta>
      </Titular>
    </div>
  )
}
