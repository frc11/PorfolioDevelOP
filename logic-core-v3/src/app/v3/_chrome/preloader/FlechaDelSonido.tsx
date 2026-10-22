'use client'

import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type RefObject } from 'react'

import { trazarLaFlecha, type Caja, type Trazado } from './trazado'

/**
 * [B12c] LA FLECHA PUNTEADA — sale de alrededor de la frase del sonido y termina donde está el botón del sonido (sin dibujarlo). Las dos
 * cajas son las reales, medidas en el cliente en cada cuadro que se pinta: si el botón llega tarde (su módulo es perezoso) o la ventana
 * cambia, el trazado se rehace. El trazo se dibuja con una máscara (un camino lleno que se destapa con `stroke-dashoffset`, con el largo
 * nativo de `getTotalLength()`: la lección de los SVG del repo) sobre el camino de puntos; la punta va en el frente y pulsa cuando el
 * reloj lo pide (`linea.ts`). Lo maneja la capa por su manija: ningún render por cuadro.
 */
export const SELECTOR_DEL_BOTON_DEL_SONIDO = '[data-pieza="control-del-sonido"]'
/** Mientras el botón no llegó: su lugar en la esquina (la caja del contenedor). */
const SELECTOR_DEL_LUGAR = '[data-parte="lugar-del-parlante"]'
const ID_DE_LA_MASCARA = 'mascara-de-la-flecha-del-sonido'

export interface ManijaDeLaFlecha {
  /** Lo dibujado (0 a 1) y el pulso de la punta (0 a 1). Mide y, si algo se movió, rehace el trazado. */
  readonly pintar: (trazo: number, pulso: number) => void
  /** El trazado de ahora y la caja del botón contra la que se trazó (para el banco). */
  readonly medida: () => { readonly trazado: Trazado; readonly boton: Caja } | null
}

const cajaDe = (el: Element): Caja => {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top, ancho: r.width, alto: r.height }
}
const igual = (a: Caja, b: Caja): boolean => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.ancho - b.ancho) < 0.5 && Math.abs(a.alto - b.alto) < 0.5

interface Medida {
  readonly frase: Caja
  readonly boton: Caja
  readonly ancho: number
  readonly alto: number
  readonly trazado: Trazado
}

export function FlechaDelSonido({ frase, ref }: { readonly frase: RefObject<HTMLElement | null>; readonly ref: Ref<ManijaDeLaFlecha> }): React.JSX.Element | null {
  const [medida, setMedida] = useState<Medida | null>(null)
  const ultima = useRef<Medida | null>(null)
  const camino = useRef<SVGPathElement>(null)
  const punta = useRef<SVGGElement>(null)
  const largo = useRef(0)
  const ultimoTrazo = useRef(0)

  // El largo del camino, al rehacerse (el destape lo usa en cada cuadro).
  useLayoutEffect(() => {
    const c = camino.current
    largo.current = c === null ? 0 : c.getTotalLength()
    if (c === null) return
    c.style.strokeDasharray = `${String(largo.current)} ${String(largo.current)}`
    c.style.strokeDashoffset = String(largo.current * (1 - ultimoTrazo.current))
  }, [medida])

  useImperativeHandle(
    ref,
    () => ({
      pintar: (trazo: number, pulso: number): void => {
        const deLaFrase = frase.current
        const boton = document.querySelector(SELECTOR_DEL_BOTON_DEL_SONIDO) ?? document.querySelector(SELECTOR_DEL_LUGAR)
        if (deLaFrase !== null && boton !== null && window.innerWidth > 0) {
          const ahora = { frase: cajaDe(deLaFrase), boton: cajaDe(boton), ancho: window.innerWidth, alto: window.innerHeight }
          const antes = ultima.current
          if (antes === null || !igual(antes.frase, ahora.frase) || !igual(antes.boton, ahora.boton) || antes.ancho !== ahora.ancho || antes.alto !== ahora.alto) {
            const nueva = { ...ahora, trazado: trazarLaFlecha(ahora.frase, ahora.boton, ahora) }
            ultima.current = nueva
            setMedida(nueva)
          }
        }
        ultimoTrazo.current = trazo
        const c = camino.current
        const p = punta.current
        const l = largo.current
        if (c === null || p === null || l === 0) return
        c.style.strokeDashoffset = String(l * (1 - trazo))
        const hasta = trazo * l
        const en = c.getPointAtLength(hasta)
        const atras = c.getPointAtLength(Math.max(0, hasta - 2))
        const adelante = hasta < 2 ? c.getPointAtLength(2) : en
        const angulo = (Math.atan2(adelante.y - atras.y, adelante.x - atras.x) * 180) / Math.PI
        p.setAttribute('transform', `translate(${en.x.toFixed(2)} ${en.y.toFixed(2)}) rotate(${angulo.toFixed(2)}) scale(${(1 + 0.22 * pulso).toFixed(3)})`)
        p.style.opacity = String(Math.min(1, trazo / 0.04))
      },
      medida: () => (ultima.current === null ? null : { trazado: ultima.current.trazado, boton: ultima.current.boton }),
    }),
    [frase],
  )

  if (medida === null) return null
  return (
    <svg aria-hidden="true" width={medida.ancho} height={medida.alto} viewBox={`0 0 ${String(medida.ancho)} ${String(medida.alto)}`} className="text-tinta pointer-events-none absolute top-0 left-0">
      <defs>
        <mask id={ID_DE_LA_MASCARA} maskUnits="userSpaceOnUse" x="0" y="0" width={medida.ancho} height={medida.alto}>
          <path ref={camino} d={medida.trazado.d} fill="none" stroke="white" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </mask>
      </defs>
      <path d={medida.trazado.d} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeDasharray="0 9" mask={`url(#${ID_DE_LA_MASCARA})`} />
      <g ref={punta} opacity={0}>
        <path d="M -12 -6.5 L 0 0 L -12 6.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
