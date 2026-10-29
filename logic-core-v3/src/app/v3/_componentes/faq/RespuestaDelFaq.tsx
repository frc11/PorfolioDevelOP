'use client'

import { useLayoutEffect, useRef } from 'react'

import { EtiquetaDeSeccion } from '../tipografia/Textos'

/** [L8a] El tamaño de la letra de la respuesta (px): la más grande que entra en su bloque, entre estos dos. */
export const LETRA_DE_LA_RESPUESTA = { minimo: 16, maximo: 44 } as const

/** La letra más grande (px) para la que `cabe(px)` sigue siendo cierto, por bisección entre el mínimo y el máximo. Pura. */
export function letraQueEntra(cabe: (px: number) => boolean, minimo: number = LETRA_DE_LA_RESPUESTA.minimo, maximo: number = LETRA_DE_LA_RESPUESTA.maximo): number {
  if (cabe(maximo)) return maximo
  let [bajo, alto] = [minimo, maximo]
  while (alto - bajo > 0.5) {
    const medio = (alto + bajo) / 2
    if (cabe(medio)) bajo = medio
    else alto = medio
  }
  return Math.floor(bajo)
}

interface Props {
  readonly id: string
  readonly pregunta: string
  readonly respuesta: string
  readonly visible: boolean
  /** El alto del bloque (px) cuando es una placa de volumen; sin él, la letra de siempre. */
  readonly altoDelBloque?: number
}

/**
 * [L8a] UNA RESPUESTA DEL FAQ, centrada en su bloque y con la letra más grande que entra (Valentino, lote3/08-09): la letra se ajusta al
 * alto del bloque (el del formulario del pie) descontando el aire del contenedor; una respuesta larga baja hasta el mínimo y, si ni así
 * entra, el bloque crece (su `min-height`).
 */
export function RespuestaDelFaq({ id, pregunta, respuesta, visible, altoDelBloque }: Props): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const texto = useRef<HTMLParagraphElement>(null)
  useLayoutEffect(() => {
    const [el, p] = [caja.current, texto.current]
    const contenedor = el?.parentElement
    if (!visible || el === null || p === null || contenedor === null || contenedor === undefined) return undefined
    if (altoDelBloque === undefined) {
      p.style.fontSize = ''
      return undefined
    }
    const ajustar = (): void => {
      const estilo = getComputedStyle(contenedor)
      const libre = altoDelBloque - Number.parseFloat(estilo.paddingTop) - Number.parseFloat(estilo.paddingBottom)
      const px = letraQueEntra((letra) => {
        p.style.fontSize = `${String(letra)}px`
        return el.offsetHeight <= libre
      })
      p.style.fontSize = `${String(px)}px`
    }
    ajustar()
    const vigia = new ResizeObserver(ajustar)
    vigia.observe(contenedor)
    return () => vigia.disconnect()
  }, [visible, altoDelBloque, respuesta])
  return (
    <div ref={caja} id={id} hidden={!visible} data-parte="respuesta-del-faq" className="flex flex-col items-center gap-[var(--spacing-3)] text-center">
      <EtiquetaDeSeccion sangria={false}>{pregunta}</EtiquetaDeSeccion>
      <p ref={texto} className="font-cuerpo text-cuerpo leading-texto text-balance">
        {respuesta}
      </p>
    </div>
  )
}
