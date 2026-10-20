'use client'

import { motion, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { sonar } from '../../_lib/sonido/bus'

import {
  ESTADO_INICIAL, HISTORIAS, avanceDelItem, gestoDelPuntero, siguienteDeLasHistorias,
  type EstadoDeLasHistorias, type EventoDeLasHistorias, type ItemDeHistoria, type SalidaDeLasHistorias,
} from './maquinaDeLasHistorias'

/** Lo que recibe el que pinta cada ítem: si está en pausa (mantener) y su `reinicio` (cambia cuando arranca: el medio vuelve a cero). */
export interface EstadoDelItem {
  readonly indice: number
  readonly pausada: boolean
  readonly reinicio: number
}

export interface PropsDeLasHistorias<T extends ItemDeHistoria> {
  /** Los ítems, en orden: la cantidad de pasos es la de la lista (el Portfolio, 4; el precio de servicios, 3). */
  readonly items: readonly T[]
  readonly renderItem: (item: T, estado: EstadoDelItem) => ReactNode
  /** Deslizar hacia arriba (o pasar después del último): `adelante`; deslizar hacia abajo: `atras`. */
  readonly alSalir: (hacia: SalidaDeLasHistorias) => void
  /** El nombre del grupo, para el lector. */
  readonly etiqueta: string
  /** Los nombres de los dos controles del teclado (el anterior y el siguiente). */
  readonly rotulos: { readonly anterior: string; readonly siguiente: string }
  readonly duracionMs?: number
  readonly alCambiar?: (indice: number) => void
  /** Dónde van las barras desde arriba (un largo de CSS): debajo de la barra del sitio, si la hay. Sin esto, arriba, en el área segura. */
  readonly arribaDeLasBarras?: string
  readonly className?: string
}

/** Lo que se usa normal adentro de un ítem (un campo, un botón, un enlace): no es un toque de la historia. */
const SE_USA_NORMAL = 'input, textarea, select, button, a[href], label, summary, [contenteditable="true"], [data-sin-toque]'
const ES_UN_CAMPO = 'input, textarea, select, [contenteditable="true"]'
const esDe = (el: EventTarget | null, selector: string): boolean => el instanceof Element && el.closest(selector) !== null

/** La barra del ítem de ahora: se llena con el valor de Motion (sin renders por cuadro). */
function BarraDeAhora({ avance }: { readonly avance: MotionValue<number> }): React.JSX.Element {
  const ancho = useTransform(avance, (a) => `${(a * 100).toFixed(2)}%`)
  return (
    <span data-parte="barra" data-barra="activa" className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/25">
      <motion.span className="absolute inset-y-0 left-0 bg-tinta" style={{ width: ancho }} />
    </span>
  )
}

/** Una barra vista (llena) o una que viene (vacía). */
function BarraFija({ llena }: { readonly llena: boolean }): React.JSX.Element {
  return (
    <span data-parte="barra" data-barra={llena ? 'llena' : 'vacia'} className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-tinta/25">
      <span className="absolute inset-y-0 left-0 bg-tinta" style={{ width: llena ? '100%' : '0%' }} />
    </span>
  )
}

/**
 * [B1.2d B] P-H19 · LAS HISTORIAS — el componente común (`maquinaDeLasHistorias.ts` es la máquina): barras arriba, el ítem de ahora a pantalla
 * completa y los gestos (toques, mantener, deslices). No sabe de dónde vienen los ítems ni qué hay detrás: lo propio de cada uso (el
 * Portfolio, el precio de servicios) entra por `items`, `renderItem` y `alSalir`. Se monta cuando las historias tienen que correr y se
 * desmonta al salir (cada entrada arranca del primero).
 *
 * El tiempo corre con `requestAnimationFrame` (la pestaña oculta lo frena: no salta al volver) y las barras se llenan con un valor de
 * Motion, sin renders por cuadro. Los toques se leen en el puntero y no en botones (lo de adentro que se usa normal, no cuenta); para el
 * teclado hay dos controles escondidos, y mientras uno tiene el foco el tiempo no corre (WCAG 2.2.2). El scroll no avanza nada: la
 * superficie no lo deja pasar (`touch-action: none`) y la máquina no lo escucha.
 */
export function Historias<T extends ItemDeHistoria>({ items, renderItem, alSalir, etiqueta, rotulos, duracionMs = HISTORIAS.duracionMs, alCambiar, arribaDeLasBarras, className }: PropsDeLasHistorias<T>): React.JSX.Element {
  const [estado, setEstado] = useState<EstadoDeLasHistorias>(ESTADO_INICIAL)
  const vivo = useRef<EstadoDeLasHistorias>(ESTADO_INICIAL)
  const avance = useMotionValue(0)
  const raiz = useRef<HTMLDivElement | null>(null)
  const puntero = useRef<{ readonly id: number; readonly x: number; readonly y: number; readonly reloj: number; mantenido: boolean } | null>(null)
  // Lo último de las props, para los escuchas (se leen en el evento, no en el render).
  const props = useRef({ items, alSalir, alCambiar, duracionMs })
  useEffect(() => {
    props.current = { items, alSalir, alCambiar, duracionMs }
  }, [items, alSalir, alCambiar, duracionMs])

  const aplicar = useRef((ev: EventoDeLasHistorias): void => {
    const { items: lista, alSalir: salir, alCambiar: cambiar, duracionMs: dura } = props.current
    const antes = vivo.current
    const p = siguienteDeLasHistorias(antes, ev, lista, dura)
    vivo.current = p.estado
    avance.set(avanceDelItem(p.estado, lista, dura))
    if (p.estado.indice !== antes.indice || p.estado.reinicio !== antes.reinicio || p.estado.pausada !== antes.pausada || p.estado.enfocada !== antes.enfocada) setEstado(p.estado)
    if (p.porElUsuario) sonar('tic')
    if (p.estado.indice !== antes.indice) cambiar?.(p.estado.indice)
    if (p.salida !== null) salir(p.salida)
  })

  // El tiempo: un cuadro por cuadro, con el salto acotado (una pestaña que vuelve no se come el ítem).
  useEffect(() => {
    let ultimo = performance.now()
    let id = 0
    const cuadro = (t: number): void => {
      aplicar.current({ tipo: 'tiempo', ms: Math.min(100, t - ultimo) })
      ultimo = t
      id = requestAnimationFrame(cuadro)
    }
    id = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(id)
  }, [])
  useEffect(() => () => window.clearTimeout(puntero.current?.reloj), [])

  const alBajar = (e: React.PointerEvent<HTMLDivElement>): void => {
    if ((e.pointerType === 'mouse' && e.button !== 0) || esDe(e.target, SE_USA_NORMAL)) return
    window.clearTimeout(puntero.current?.reloj)
    const reloj = window.setTimeout(() => {
      if (puntero.current === null) return
      puntero.current.mantenido = true
      aplicar.current({ tipo: 'mantener' })
    }, HISTORIAS.mantenerMs)
    puntero.current = { id: e.pointerId, x: e.clientX, y: e.clientY, reloj, mantenido: false }
  }
  const alMoverse = (e: React.PointerEvent<HTMLDivElement>): void => {
    const p = puntero.current
    // Un dedo que se va es un deslice: ya no pausa.
    if (p !== null && p.id === e.pointerId && !p.mantenido && Math.hypot(e.clientX - p.x, e.clientY - p.y) > HISTORIAS.toqueMaxPx) window.clearTimeout(p.reloj)
  }
  const alSubir = (e: React.PointerEvent<HTMLDivElement>): void => {
    const p = puntero.current
    if (p === null || p.id !== e.pointerId) return
    window.clearTimeout(p.reloj)
    puntero.current = null
    const dx = e.clientX - p.x
    const dy = e.clientY - p.y
    const gesto = gestoDelPuntero(dx, dy, p.mantenido)
    if (p.mantenido) aplicar.current({ tipo: 'soltar' })
    else if (gesto === 'toque') {
      const caja = raiz.current?.getBoundingClientRect()
      aplicar.current({ tipo: 'toque', fraccion: caja === undefined || caja.width === 0 ? 1 : (e.clientX - caja.left) / caja.width })
    } else aplicar.current({ tipo: 'deslice', dx, dy })
  }
  const alCancelar = (): void => {
    const p = puntero.current
    if (p === null) return
    window.clearTimeout(p.reloj)
    puntero.current = null
    if (p.mantenido) aplicar.current({ tipo: 'soltar' })
  }

  const item = items[estado.indice]
  return (
    <div
      ref={raiz}
      role="group"
      aria-roledescription="historias"
      aria-label={etiqueta}
      data-pieza="historias"
      data-indice={estado.indice}
      data-pausada={estado.pausada ? 'si' : 'no'}
      className={cn('relative h-full w-full touch-none select-none overflow-clip', className)}
      onPointerDown={alBajar}
      onPointerMove={alMoverse}
      onPointerUp={alSubir}
      onPointerCancel={alCancelar}
      onFocus={(e) => aplicar.current({ tipo: 'foco', adentro: esDe(e.target, ES_UN_CAMPO) })}
      onBlur={(e) => aplicar.current({ tipo: 'foco', adentro: e.relatedTarget instanceof Node && raiz.current?.contains(e.relatedTarget) === true && esDe(e.relatedTarget, ES_UN_CAMPO) })}
    >
      {item === undefined ? null : <div key={`${item.id}-${String(estado.reinicio)}`} className="absolute inset-0">{renderItem(item, { indice: estado.indice, pausada: estado.pausada, reinicio: estado.reinicio })}</div>}
      <div aria-hidden="true" data-parte="barras" className="pointer-events-none absolute inset-x-4 top-[calc(var(--spacing-3)+env(safe-area-inset-top))] flex gap-2" style={arribaDeLasBarras === undefined ? undefined : { top: arribaDeLasBarras }}>
        {items.map((it, i) => (
          i === estado.indice ? <BarraDeAhora key={it.id} avance={avance} /> : <BarraFija key={it.id} llena={i < estado.indice} />
        ))}
      </div>
      {/* Para el teclado: con el foco en uno, el tiempo no corre; Enter va al anterior o al siguiente. */}
      <button type="button" data-toque="anterior" className="sr-only" onFocus={() => aplicar.current({ tipo: 'mantener' })} onBlur={() => aplicar.current({ tipo: 'soltar' })} onClick={() => aplicar.current({ tipo: 'toque', fraccion: 0 })}>
        {rotulos.anterior}
      </button>
      <button type="button" data-toque="siguiente" className="sr-only" onFocus={() => aplicar.current({ tipo: 'mantener' })} onBlur={() => aplicar.current({ tipo: 'soltar' })} onClick={() => aplicar.current({ tipo: 'toque', fraccion: 1 })}>
        {rotulos.siguiente}
      </button>
    </div>
  )
}
