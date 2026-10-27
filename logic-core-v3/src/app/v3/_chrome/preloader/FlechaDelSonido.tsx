'use client'

import { useImperativeHandle, useLayoutEffect, useRef, useState, type Ref, type RefObject } from 'react'

import { PULSO_DE_LA_PUNTA, TAU_DEL_FRENO, apareceLaRaya, inicioDeLaFlecha, recorridosDeLaPunta } from './animaciones'
import { alinear, animar } from './reloj'
import { TRAZADO, rayasDeLaFlecha, renglonesDe, trazarLaFlecha, type Caja, type Lado, type Punto, type Raya, type Renglon, type Trazado } from './trazado'

/**
 * [B12c] LA FLECHA — sale de la frase y termina donde está su botón (sin dibujarlo). Las cajas son las reales (los renglones de la frase y
 * el botón), medidas en cada cuadro: si el botón llega tarde (su módulo es perezoso), cambian las fuentes o la ventana, el trazado se rehace.
 *
 * [C2-81] **A trazos y en el compositor:** cada raya es un elemento con su `transform` fijo y una animación de `opacity` que la hace
 * aparecer cuando el dibujo llega (`animaciones.ts`); la punta recorre el camino con una animación de `transform`. Todo alineado con el reloj
 * de la capa (`reloj.ts`): sigue dibujándose aunque el hilo principal esté ocupado. El freno si falta la carga (`linea.ts`) toca sólo el
 * último 20 % (las rayas y el tramo de la punta desde `TAU_DEL_FRENO`): quieto en el tiempo de la línea mientras falta, y suelto en el
 * compositor apenas está (`seguir`). El pulso de la punta, otra animación nativa. Ningún render por cuadro: React sólo rehace las rayas
 * cuando cambia el trazado.
 *
 * Una por botón: la del sonido (arriba a la izquierda) y, en el teléfono con movimiento, la del movimiento (arriba a la derecha).
 */
export const OBJETIVOS = {
  sonido: { boton: '[data-pieza="control-del-sonido"]', lugar: '[data-parte="lugar-del-parlante"]' },
  movimiento: { boton: '[data-pieza="control-del-movimiento"]', lugar: '[data-parte="lugar-del-movimiento"]' },
} as const
export type Objetivo = keyof typeof OBJETIVOS

/** El control `punta-corta` del banco: cuánto antes del botón termina (px). */
const PUNTA_CORTA_PX = 20

/** El vértice de la punta (el dibujo de la punta, con su vértice en el origen) y dónde cae su caja. */
const PUNTA = { d: 'M -12 -6.5 L 0 0 L -12 6.5', caja: { x: -13, y: -7.5, ancho: 14, alto: 15 } } as const

export interface ManijaDeLaFlecha {
  /** Mide y, si algo se movió, rehace el trazado (y sus animaciones, alineadas con el reloj). */
  readonly medir: () => void
  /** El tiempo de la flecha según la línea, si su último tramo corre suelto, y si la punta pulsa. */
  readonly seguir: (tau: number, libre: boolean, pulsa: boolean) => void
  /** Dónde está la punta en la pantalla ahora (la marca de su vértice, ya transformada). */
  readonly punta: () => Punto | null
  /** El trazado de ahora y la caja del botón contra la que se trazó (para el banco). */
  readonly medida: () => { readonly trazado: Trazado; readonly boton: Caja } | null
}

const cajaDe = (r: DOMRect | DOMRectReadOnly): Caja => ({ x: r.left, y: r.top, ancho: r.width, alto: r.height })
const igual = (a: Caja, b: Caja): boolean => Math.abs(a.x - b.x) < 0.5 && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.ancho - b.ancho) < 0.5 && Math.abs(a.alto - b.alto) < 0.5

interface Armado {
  readonly renglones: readonly Caja[]
  readonly boton: Caja
  readonly ancho: number
  readonly alto: number
  readonly trazado: Trazado
  readonly rayas: readonly Raya[]
}

interface Props {
  readonly frase: RefObject<HTMLElement | null>
  readonly objetivo: Objetivo
  readonly lado: Lado
  readonly renglon: Renglon
  readonly reloj: RefObject<Animation | null>
  readonly reducido: boolean
  readonly corta?: boolean
  readonly ref: Ref<ManijaDeLaFlecha>
}

export function FlechaDelSonido({ frase, objetivo, lado, renglon, reloj, reducido, corta = false, ref }: Props): React.JSX.Element | null {
  const [armado, setArmado] = useState<Armado | null>(null)
  const ultimo = useRef<Armado | null>(null)
  const rayas = useRef<(HTMLSpanElement | null)[]>([])
  const punta = useRef<HTMLSpanElement>(null)
  const pulso = useRef<HTMLSpanElement>(null)
  const marca = useRef<HTMLSpanElement>(null)
  const control = useRef({ tau: 0, libre: false, frenables: [] as Animation[], pulsando: null as Animation | null })

  // Las animaciones del trazado de ahora: las libres corren con el reloj; las frenables, quietas hasta que la línea las suelta.
  useLayoutEffect(() => {
    const r = reloj.current
    if (armado === null || r === null) return undefined
    const c = control.current
    const origen = inicioDeLaFlecha(reducido)
    const todas: Animation[] = []
    const frenables: Animation[] = []
    armado.rayas.forEach((raya, i) => {
      const el = rayas.current[i]
      if (el === null || el === undefined) return
      const a = apareceLaRaya(raya, armado.trazado.camino.largo, reducido)
      const anim = animar(el, a, r, origen)
      todas.push(anim)
      if (!reducido && a.demora >= TAU_DEL_FRENO) frenables.push(anim)
    })
    if (punta.current !== null) {
      for (const tramo of recorridosDeLaPunta(armado.trazado, reducido)) {
        const anim = animar(punta.current, tramo.animacion, r, origen)
        todas.push(anim)
        if (tramo.frenable) frenables.push(anim)
      }
    }
    c.frenables = frenables
    if (!c.libre) {
      for (const f of frenables) {
        f.pause()
        f.currentTime = c.tau
      }
    }
    return () => {
      for (const a of todas) a.cancel()
      c.frenables = []
    }
  }, [armado, reducido, reloj])

  useImperativeHandle(
    ref,
    () => ({
      medir: (): void => {
        const deLaFrase = frase.current
        const sel = OBJETIVOS[objetivo]
        const boton = document.querySelector(sel.boton) ?? document.querySelector(sel.lugar)
        if (deLaFrase === null || boton === null || window.innerWidth <= 0) return
        const rango = document.createRange()
        rango.selectNodeContents(deLaFrase)
        const renglones = renglonesDe(Array.from(rango.getClientRects(), cajaDe))
        if (renglones.length === 0) return
        const caja = cajaDe(boton.getBoundingClientRect())
        const ancho = window.innerWidth
        const alto = window.innerHeight
        const antes = ultimo.current
        const mismo = antes !== null && antes.ancho === ancho && antes.alto === alto && igual(antes.boton, caja) && antes.renglones.length === renglones.length && antes.renglones.every((c, i) => igual(c, renglones[i]))
        if (mismo) return
        // El control `punta-corta`: contra un disco más grande, la punta queda antes del botón.
        const contra = corta ? { x: caja.x - PUNTA_CORTA_PX, y: caja.y - PUNTA_CORTA_PX, ancho: caja.ancho + 2 * PUNTA_CORTA_PX, alto: caja.alto + 2 * PUNTA_CORTA_PX } : caja
        const trazado = trazarLaFlecha(renglones, contra, { ancho, alto }, lado, renglon)
        const nuevo = { renglones, boton: caja, ancho, alto, trazado, rayas: rayasDeLaFlecha(trazado, { ancho, alto }) }
        ultimo.current = nuevo
        setArmado(nuevo)
      },
      seguir: (tau: number, libre: boolean, pulsa: boolean): void => {
        const c = control.current
        const r = reloj.current
        c.tau = tau
        if (libre && !c.libre && r !== null) {
          c.libre = true
          for (const f of c.frenables) alinear(f, r, inicioDeLaFlecha(reducido))
        } else if (!libre && !c.libre) for (const f of c.frenables) f.currentTime = tau
        if (pulsa && c.pulsando === null && pulso.current !== null) {
          const p = PULSO_DE_LA_PUNTA
          c.pulsando = pulso.current.animate(p.cuadros as Keyframe[], { duration: p.duracion, iterations: p.iteraciones, fill: p.relleno })
        } else if (!pulsa && c.pulsando !== null) {
          c.pulsando.cancel()
          c.pulsando = null
        }
      },
      punta: (): Punto | null => {
        const r = marca.current?.getBoundingClientRect()
        return r === undefined ? null : { x: r.left, y: r.top }
      },
      medida: () => (ultimo.current === null ? null : { trazado: ultimo.current.trazado, boton: ultimo.current.boton }),
    }),
    [frase, objetivo, lado, renglon, reloj, reducido, corta],
  )

  if (armado === null) return null
  const grosor = TRAZADO.raya.grosor
  const { caja } = PUNTA
  return (
    <div aria-hidden="true" data-parte="flecha" data-objetivo={objetivo} className="text-tinta pointer-events-none absolute inset-0">
      {armado.rayas.map((r, i) => (
        <span
          key={i}
          ref={(el) => {
            rayas.current[i] = el
          }}
          data-parte="raya"
          className="absolute top-0 left-0 origin-top-left rounded-full bg-current opacity-0"
          style={{ width: r.largo, height: grosor, transform: `translate(${r.x.toFixed(2)}px, ${r.y.toFixed(2)}px) rotate(${r.angulo.toFixed(2)}deg) translateY(-50%)` }}
        />
      ))}
      {/* La punta: su origen es el vértice (el de la marca, que mide el banco); el pulso escala alrededor de él. */}
      <span ref={punta} data-parte="punta" className="absolute top-0 left-0 opacity-0 will-change-transform">
        <span ref={marca} data-parte="vertice" className="absolute top-0 left-0 size-0" />
        <span ref={pulso} className="absolute top-0 left-0 size-0 origin-top-left">
          <svg width={caja.ancho} height={caja.alto} viewBox={`${String(caja.x)} ${String(caja.y)} ${String(caja.ancho)} ${String(caja.alto)}`} className="absolute overflow-visible" style={{ left: caja.x, top: caja.y }}>
            <path d={PUNTA.d} fill="none" stroke="currentColor" strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </span>
    </div>
  )
}
