'use client'

import { animate, motion, useIsPresent, useMotionValue, useTransform, type MotionValue } from 'motion/react'
import { useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { sonar } from '../../_lib/sonido/bus'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { useFrenoDelArrastre } from './frenoDelArrastre'

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
  /** [P-H31a] Una transición propia entre pasos (servicios: un corte diagonal). Sin ella, el corte de siempre (el Portfolio). */
  readonly transicion?: TransicionDeLasHistorias
  /** [P-H31c] El color de las barras (la pista y el relleno), sobre un fondo propio: sobre un acento, `BARRAS_SOBRE_ACENTO`. Sin él, las de la tinta. */
  readonly colorDeLasBarras?: ColorDeLasBarras
}

/**
 * [P-H31a] LA TRANSICIÓN ENTRE PASOS — el ítem que entra se pinta ENCIMA del que se va durante `ms`, envuelto en `Envoltorio`, que recibe el
 * avance (0 → 1, lineal, en un valor de Motion: sin renders por cuadro; la curva la pone él) y el sentido (1, hacia adelante; −1, hacia
 * atrás). El que se va sigue montado debajo hasta que termina. Con movimiento reducido, el corte.
 */
export interface TransicionDeLasHistorias {
  readonly ms: number
  readonly Envoltorio: ComponentType<{ readonly avance: MotionValue<number>; readonly sentido: 1 | -1; readonly children: ReactNode }>
}

/** [P-H31c] Los colores de las barras: la pista (lo que falta) y el relleno (lo que pasó y el avance de ahora), como colores de CSS. */
export interface ColorDeLasBarras {
  readonly pista: string
  readonly relleno: string
}

/**
 * [P-H31c] LAS BARRAS SOBRE UN FONDO DE ACENTO (WCAG 1.4.11, ≥ 3:1). Las de la tinta sobre un acento oscuro daban 2,64:1 (la tinta, #111111,
 * contra el de web). Sobre el acento van en el papel, como su texto (`CLASE_TINTA_SOBRE_ACENTO`): el relleno contra el acento y contra la
 * pista, ≥ 3:1 con los tres (s76 lo mide con los tokens).
 */
export const BARRAS_SOBRE_ACENTO: ColorDeLasBarras = { pista: 'color-mix(in srgb, var(--color-fondo) 25%, transparent)', relleno: 'var(--color-fondo)' }

/** Lo que se usa normal adentro de un ítem (un campo, un botón, un enlace): no es un toque de la historia. */
const SE_USA_NORMAL = 'input, textarea, select, button, a[href], label, summary, [contenteditable="true"], [data-sin-toque]'
const ES_UN_CAMPO = 'input, textarea, select, [contenteditable="true"]'
const esDe = (el: EventTarget | null, selector: string): boolean => el instanceof Element && el.closest(selector) !== null

/** La barra del ítem de ahora: se llena con el valor de Motion (sin renders por cuadro). */
function BarraDeAhora({ avance, color }: { readonly avance: MotionValue<number>; readonly color?: ColorDeLasBarras }): React.JSX.Element {
  const ancho = useTransform(avance, (a) => `${(a * 100).toFixed(2)}%`)
  return (
    <span data-parte="barra" data-barra="activa" className={cn('relative h-0.5 flex-1 overflow-hidden rounded-full', color === undefined && 'bg-tinta/25')} style={color === undefined ? undefined : { backgroundColor: color.pista }}>
      <motion.span className={cn('absolute inset-y-0 left-0', color === undefined && 'bg-tinta')} style={color === undefined ? { width: ancho } : { width: ancho, backgroundColor: color.relleno }} />
    </span>
  )
}

/** Una barra vista (llena) o una que viene (vacía). */
function BarraFija({ llena, color }: { readonly llena: boolean; readonly color?: ColorDeLasBarras }): React.JSX.Element {
  return (
    <span data-parte="barra" data-barra={llena ? 'llena' : 'vacia'} className={cn('relative h-0.5 flex-1 overflow-hidden rounded-full', color === undefined && 'bg-tinta/25')} style={color === undefined ? undefined : { backgroundColor: color.pista }}>
      <span className={cn('absolute inset-y-0 left-0', color === undefined && 'bg-tinta')} style={color === undefined ? { width: llena ? '100%' : '0%' } : { width: llena ? '100%' : '0%', backgroundColor: color.relleno }} />
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
export function Historias<T extends ItemDeHistoria>({ items, renderItem, alSalir, etiqueta, rotulos, duracionMs = HISTORIAS.duracionMs, alCambiar, arribaDeLasBarras, className, transicion, colorDeLasBarras }: PropsDeLasHistorias<T>): React.JSX.Element {
  const [estado, setEstado] = useState<EstadoDeLasHistorias>(ESTADO_INICIAL)
  // [P-H31b] El freno del arrastre mientras corren: montadas y presentes (adentro de un `AnimatePresence`, la salida ya no frena: el
  // Portfolio las monta con el panel y frenaba con `historias && panel`, que es esto). Lo tiene cualquier uso.
  const presentes = useIsPresent()
  useFrenoDelArrastre(presentes)
  // [P-H31a] El que se va (con su sentido) y el avance de la transición; sin `transicion` (o con movimiento reducido), nunca hay.
  const reducido = usePrefiereMenosMovimiento()
  const [saliente, setSaliente] = useState<{ readonly indice: number; readonly reinicio: number } | null>(null)
  const avanceDelPaso = useMotionValue(1)
  const [sentido, setSentido] = useState<1 | -1>(1)
  const vivo = useRef<EstadoDeLasHistorias>(ESTADO_INICIAL)
  const avance = useMotionValue(0)
  const raiz = useRef<HTMLDivElement | null>(null)
  const puntero = useRef<{ readonly id: number; readonly x: number; readonly y: number; readonly reloj: number; mantenido: boolean } | null>(null)
  // Lo último de las props, para los escuchas (se leen en el evento, no en el render).
  const props = useRef({ items, alSalir, alCambiar, duracionMs, transicion, reducido })
  useEffect(() => {
    props.current = { items, alSalir, alCambiar, duracionMs, transicion, reducido }
  }, [items, alSalir, alCambiar, duracionMs, transicion, reducido])
  const transicionEnCurso = useRef<{ stop: () => void } | null>(null)
  useEffect(() => () => transicionEnCurso.current?.stop(), [])

  const aplicar = useRef((ev: EventoDeLasHistorias): void => {
    const { items: lista, alSalir: salir, alCambiar: cambiar, duracionMs: dura } = props.current
    const antes = vivo.current
    const p = siguienteDeLasHistorias(antes, ev, lista, dura)
    vivo.current = p.estado
    avance.set(avanceDelItem(p.estado, lista, dura))
    if (p.estado.indice !== antes.indice || p.estado.reinicio !== antes.reinicio || p.estado.pausada !== antes.pausada || p.estado.enfocada !== antes.enfocada) setEstado(p.estado)
    if (p.porElUsuario) sonar('tic')
    // [P-H31a] Un paso nuevo con transición: el de antes queda debajo mientras el nuevo entra.
    const { transicion: t, reducido: quieto } = props.current
    if (p.estado.indice !== antes.indice && t !== undefined && !quieto && t.ms > 0) {
      transicionEnCurso.current?.stop()
      setSaliente({ indice: antes.indice, reinicio: antes.reinicio })
      setSentido(p.estado.indice > antes.indice ? 1 : -1)
      avanceDelPaso.set(0)
      transicionEnCurso.current = animate(avanceDelPaso, 1, { duration: t.ms / 1000, ease: 'linear', onComplete: () => setSaliente(null) })
    }
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
  const delSaliente = saliente === null ? undefined : items[saliente.indice]
  const Envoltorio = transicion?.Envoltorio
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
      {/* [P-H31a] El que se va, debajo, mientras dura la transición (quieto: en pausa). */}
      {saliente === null || delSaliente === undefined ? null : (
        <div key={`sale-${delSaliente.id}-${String(saliente.reinicio)}`} data-parte="saliente" className="absolute inset-0">
          {renderItem(delSaliente, { indice: saliente.indice, pausada: true, reinicio: saliente.reinicio })}
        </div>
      )}
      {item === undefined ? null : (
        <div key={`${item.id}-${String(estado.reinicio)}`} className="absolute inset-0">
          {/* Con transición, siempre envuelto (en reposo, en 1): si no, al terminar se montaría de nuevo. */}
          {Envoltorio === undefined ? renderItem(item, { indice: estado.indice, pausada: estado.pausada, reinicio: estado.reinicio }) : <Envoltorio avance={avanceDelPaso} sentido={sentido}>{renderItem(item, { indice: estado.indice, pausada: estado.pausada, reinicio: estado.reinicio })}</Envoltorio>}
        </div>
      )}
      <div aria-hidden="true" data-parte="barras" className="pointer-events-none absolute inset-x-4 top-[calc(var(--spacing-3)+env(safe-area-inset-top))] flex gap-2" style={arribaDeLasBarras === undefined ? undefined : { top: arribaDeLasBarras }}>
        {items.map((it, i) => (
          i === estado.indice ? <BarraDeAhora key={it.id} avance={avance} color={colorDeLasBarras} /> : <BarraFija key={it.id} llena={i < estado.indice} color={colorDeLasBarras} />
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
