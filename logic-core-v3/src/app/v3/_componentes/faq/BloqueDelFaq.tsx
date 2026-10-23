'use client'

import { useEffect, type CSSProperties, type ReactNode, type RefObject } from 'react'

import { cn } from '@/lib/utils'

import { anotarElBloqueDelFaq, type IdDelBloqueDelFaq } from '../../_lib/pie3d/faqDelPie'
import { VidrioDelFaq } from './VidrioDelFaq'

/**
 * [C2-71] UN BLOQUE DEL FAQ, EN SUS DOS FORMAS — con el pie plano (una página, o el pie de volumen todavía sin armar), el vidrio de B10
 * (`VidrioDelFaq`, hundido en el DOM). Con el pie de volumen (desde 1025, armado), el bloque es una placa de la escena como la del
 * formulario del pie (`escena/pie3d/faqDeVolumen.ts`): acá queda su DOM (el texto, en la tinta clara de la sección invertida, sobre el
 * negro de la placa), anotado para que la escena lo mida, le arme la placa y lo lleve sobre su cara. Nace apagado (la escena lo enciende
 * cuando su placa llegó).
 */
export function useBloqueDelFaq(ref: RefObject<HTMLElement | null>, id: IdDelBloqueDelFaq, activo: boolean): void {
  useEffect(() => {
    const el = ref.current
    if (!activo || el === null) return undefined
    return anotarElBloqueDelFaq(id, el)
  }, [ref, id, activo])
}

interface Props {
  readonly id: IdDelBloqueDelFaq
  readonly caja: RefObject<HTMLDivElement | null>
  /** El pie es el de volumen y está armado: el bloque es una placa de la escena. */
  readonly volumen: boolean
  /** En el vidrio: el estilo con el que sale del servidor (cerrado en su hueco). */
  readonly estilo: CSSProperties
  /** En volumen: su tamaño (el del formulario del pie). */
  readonly medidas?: CSSProperties
  readonly className?: string
  readonly children: ReactNode
}

export function BloqueDelFaq({ id, caja, volumen, estilo, medidas, className, children }: Props): React.JSX.Element {
  useBloqueDelFaq(caja, id, volumen)
  if (!volumen) {
    return (
      <VidrioDelFaq caja={caja} estilo={estilo} className={className}>
        {children}
      </VidrioDelFaq>
    )
  }
  return (
    <div ref={caja} data-bloque-del-faq={id} data-seccion="invertida" style={{ ...APAGADO, ...medidas }} className={cn('text-tinta', className)}>
      {children}
    </div>
  )
}

/** Apagado hasta que la escena lo enciende (constante: React no lo vuelve a escribir encima de lo que escribe la escena). */
const APAGADO: CSSProperties = { opacity: 0 }
