'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMotionValue } from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { sonar } from '../../_lib/sonido/bus'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import type { FormaDeLaTarjeta } from './asoma'
import {
  CARRUSEL, avanceDelCarrusel, estadoInicialDelCarrusel, intencionDelDedo, motivoDeLaPausa, siguienteDelCarrusel,
  type EstadoDelCarrusel, type EventoDelCarrusel, type PasoDelCarrusel,
} from './maquinaDelCarrusel'
import { LineaDeAhora, Ranura, RanuraQueAsoma } from './Ranuras'
import { useAsoma } from './useAsoma'

export { TRANSICION_DEL_CARRUSEL } from './Ranuras'

export interface ItemDelCarrusel {
  readonly id: string
}

/** Lo que recibe el que pinta cada tarjeta. */
export interface EstadoDeLaTarjeta {
  readonly indice: number
  /** La tarjeta de ahora (las otras están montadas, invisibles e inertes: el alto del carrusel no salta). */
  readonly activa: boolean
  /** Si el reloj corre (la activa, a la vista y sin pausa): su medio se reproduce sólo así. */
  readonly corre: boolean
  /** Cambia en cada cambio de tarjeta: el medio vuelve a cero. */
  readonly reinicio: number
}

export interface PropsDelCarrusel<T extends ItemDelCarrusel> {
  /** Las tarjetas, en orden (la vuelta es infinita: después de la última, la primera). */
  readonly items: readonly T[]
  readonly renderItem: (item: T, estado: EstadoDeLaTarjeta) => ReactNode
  /** El nombre del carrusel, para el lector. */
  readonly etiqueta: string
  /** El nombre de cada tarjeta, para el lector. */
  readonly nombreDe: (item: T) => string
  /** Los nombres de las dos flechas. */
  readonly rotulos: { readonly anterior: string; readonly siguiente: string }
  readonly duracionMs?: number
  /** Un salto pedido desde afuera (un ancla): cuando cambia, va a esa tarjeta (con el reloj en cero). */
  readonly indicePedido?: number | null
  readonly alCambiar?: (indice: number) => void
  /** [C2 · 40] Las líneas de las tarjetas ya vistas, llenas (como las historias de Instagram). Por defecto, vacías. */
  readonly vistasLlenas?: boolean
  /**
   * [C2-41t] La tarjeta grande con la siguiente asomada y el dedo que las arrastra (`asoma.ts`), con su forma; sin esto, una a la vez con el
   * fundido (el Portfolio). La vista tiene que tener su alto (`claseDeLaVista`, por ejemplo `flex-1`): la tarjeta lo llena.
   */
  readonly asoma?: FormaDeLaTarjeta | null
  readonly claseDeLaVista?: string
  readonly className?: string
}

/**
 * Las flechas: el disco del botón de sonido de escritorio (el mismo que la pausa del panel, `BotonPausa`: 48 px, la superficie translúcida, el
 * borde fino, la sombra flotante y el desenfoque). Escrito acá y no importado: la pausa la importan sólo los videos en bucle (s77, P-H27).
 */
export const CLASE_DE_LA_FLECHA =
  'flex size-[calc(var(--spacing-3)*2+var(--text-cuerpo)*var(--leading-texto))] shrink-0 cursor-pointer items-center justify-center rounded-full border-[length:var(--border-hairline)] border-borde bg-[var(--color-superficie-translucida)] text-tinta shadow-[var(--shadow-flotante)] backdrop-blur-[var(--blur-panel)]'

/** Lo que se usa normal adentro de una tarjeta (un enlace, un botón, un campo): no arranca ni un deslice ni la pausa. */
const SE_USA_NORMAL = 'input, textarea, select, button, a[href], label, summary, [contenteditable="true"]'
/** [C2-41t] Con `asoma` la tarjeta entera es un enlace (Demos): el dedo la arrastra igual, y un toque sin arrastre la abre. */
const SE_USA_NORMAL_SI_ASOMA = 'input, textarea, select, button, label, summary, [contenteditable="true"]'
const esDe = (el: EventTarget | null, selector: string): boolean => el instanceof Element && el.closest(selector) !== null

/** [C2-41t] Si un toque cayó a la derecha de la tarjeta de ahora (en la que asoma). */
const enLaQueAsoma = (vista: Element, x: number): boolean => {
  const r = vista.querySelector('[data-parte="ranura"][data-activa="si"]')?.getBoundingClientRect()
  return r !== undefined && x > r.right
}

/** Si dos estados se ven distinto (todo menos el reloj, que va en un valor de Motion sin renders por cuadro). */
const seVenDistinto = (a: EstadoDelCarrusel, b: EstadoDelCarrusel): boolean =>
  a.indice !== b.indice || a.reinicio !== b.reinicio || a.mantenido !== b.mantenido || a.enVista !== b.enVista || a.reducido !== b.reducido || a.enfocado !== b.enfocado

/**
 * [B1.2e] EL CARRUSEL DE TARJETAS — el componente común (`maquinaDelCarrusel.ts` es la máquina): una tarjeta a la vez, las flechas y una
 * línea por tarjeta debajo (la de ahora se llena en 10 s). No sabe de dónde vienen las tarjetas: lo propio de cada uso (el Portfolio; después
 * Demos) entra por `items` y `renderItem`.
 *
 * ⚠️ **NO ES UNA TRAMPA DE SCROLL.** No ocupa la pantalla (mide lo que mide su tarjeta más alta) y no le roba nada a la página: la vista es
 * `touch-action: pan-y` (el dedo vertical lo sigue haciendo el navegador; el carrusel toma el dedo recién cuando va de costado), no escucha la
 * rueda y no cancela ningún evento. Un dedo que se queda quieto 200 ms pausa (mantener apretado) hasta que se suelta.
 *
 * El reloj corre con `requestAnimationFrame` sólo mientras rota (a la vista, sin pausa: fuera de la vista no hay cuadros) y la línea se llena
 * con un valor de Motion, sin renders por cuadro. Las flechas son botones (el teclado y el sonido de la casa); con el foco del teclado adentro
 * el reloj no corre (WCAG 2.2.2), y ← → cambian de tarjeta. Mientras rota, el lector no anuncia los cambios (`aria-live` en `off`).
 *
 * [C2-41t] Con `asoma` (Demos): la tarjeta grande, la siguiente asomada y el dedo que las arrastra (`useAsoma`); la misma máquina decide.
 */
export function CarruselDeTarjetas<T extends ItemDelCarrusel>({ items, renderItem, etiqueta, nombreDe, rotulos, duracionMs = CARRUSEL.duracionMs, indicePedido = null, alCambiar, vistasLlenas = false, asoma = null, claseDeLaVista, className }: PropsDelCarrusel<T>): React.JSX.Element {
  const [estado, setEstado] = useState<EstadoDelCarrusel>(() => estadoInicialDelCarrusel(0, items.length))
  const vivo = useRef<EstadoDelCarrusel>(estado)
  const avance = useMotionValue(0)
  const raiz = useRef<HTMLDivElement | null>(null)
  const vista = useRef<HTMLDivElement | null>(null)
  const dedo = useRef<{ readonly id: number; readonly x: number; readonly y: number; readonly reloj: number; mantenido: boolean; intencion: 'costado' | 'vertical' | null } | null>(null)
  const reducido = usePrefiereMenosMovimiento()
  const deslice = useAsoma(asoma, vista, estado.indice, items.length, reducido)
  // Lo último de las props, para los escuchas (se leen en el evento, no en el render).
  const props = useRef({ cantidad: items.length, duracionMs, alCambiar })
  useEffect(() => {
    props.current = { cantidad: items.length, duracionMs, alCambiar }
  }, [items.length, duracionMs, alCambiar])

  const aplicar = useRef((ev: EventoDelCarrusel): PasoDelCarrusel => {
    const { cantidad, duracionMs: dura, alCambiar: cambiar } = props.current
    const antes = vivo.current
    const p = siguienteDelCarrusel(antes, ev, cantidad, dura)
    vivo.current = p.estado
    avance.set(avanceDelCarrusel(p.estado, dura))
    if (seVenDistinto(p.estado, antes)) setEstado(p.estado)
    if (p.cambio) cambiar?.(p.estado.indice)
    return p
  })

  // A la vista: la mitad del carrusel (o del cuadro, si fuera más alto) en el cuadro, con la pestaña visible.
  useEffect(() => {
    const el = raiz.current
    if (el === null) return undefined
    let enElCuadro = false
    const avisar = (): void => {
      aplicar.current({ tipo: 'vista', adentro: enElCuadro && document.visibilityState === 'visible' })
    }
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e === undefined) return
        const alto = Math.min(e.boundingClientRect.height, window.innerHeight)
        enElCuadro = e.isIntersecting && alto > 0 && e.intersectionRect.height >= CARRUSEL.enVistaMinima * alto
        avisar()
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    observador.observe(el)
    document.addEventListener('visibilitychange', avisar)
    return () => {
      observador.disconnect()
      document.removeEventListener('visibilitychange', avisar)
    }
  }, [])
  useEffect(() => {
    aplicar.current({ tipo: 'reducido', si: reducido })
  }, [reducido])
  useEffect(() => {
    if (indicePedido !== null) aplicar.current({ tipo: 'ir', indice: indicePedido })
  }, [indicePedido])

  // El reloj: cuadro por cuadro, sólo mientras rota (el salto de cada cuadro lo acota la máquina).
  const motivo = motivoDeLaPausa(estado)
  const rota = motivo === null && items.length > 1
  useEffect(() => {
    if (!rota) return undefined
    let ultimo = performance.now()
    let id = 0
    const cuadro = (t: number): void => {
      aplicar.current({ tipo: 'tiempo', ms: t - ultimo })
      ultimo = t
      id = requestAnimationFrame(cuadro)
    }
    id = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(id)
  }, [rota])

  // El dedo (y el mouse): quieto 200 ms, pausa hasta que se suelta; de costado, un deslice; vertical, es de la página y se suelta.
  const soltarElDedo = (): void => {
    const d = dedo.current
    if (d === null) return
    window.clearTimeout(d.reloj)
    dedo.current = null
    if (d.mantenido) aplicar.current({ tipo: 'soltar' })
  }
  useEffect(() => () => window.clearTimeout(dedo.current?.reloj), [])
  const alBajar = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!e.isPrimary || (e.pointerType === 'mouse' && e.button !== 0) || esDe(e.target, asoma === null ? SE_USA_NORMAL : SE_USA_NORMAL_SI_ASOMA)) return
    soltarElDedo()
    deslice.empezar()
    // Con el mouse, el arrastre sigue aunque salga de la tarjeta (el dedo ya lo tiene: la captura implícita del táctil). [C2-41t] Con `asoma`,
    // recién cuando va de costado: capturado desde el principio, el clic en la tarjeta (un enlace) no la abriría.
    if (e.pointerType === 'mouse' && asoma === null) e.currentTarget.setPointerCapture(e.pointerId)
    const reloj = window.setTimeout(() => {
      const d = dedo.current
      if (d === null || d.intencion !== null) return
      d.mantenido = true
      aplicar.current({ tipo: 'mantener' })
    }, CARRUSEL.mantenerMs)
    dedo.current = { id: e.pointerId, x: e.clientX, y: e.clientY, reloj, mantenido: false, intencion: null }
  }
  const alMoverse = (e: React.PointerEvent<HTMLDivElement>): void => {
    const d = dedo.current
    if (d === null || d.id !== e.pointerId || d.mantenido) return
    if (d.intencion === null) {
      d.intencion = intencionDelDedo(e.clientX - d.x, e.clientY - d.y)
      if (d.intencion !== null) window.clearTimeout(d.reloj)
    }
    // [C2-41t] Con `asoma`, las tarjetas siguen al dedo de costado (y el mouse que arrastra ya no suelta un clic en el enlace).
    if (asoma === null || d.intencion !== 'costado') return
    if (e.pointerType === 'mouse' && !e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.setPointerCapture(e.pointerId)
    deslice.arrastrar(e.clientX - d.x)
  }
  const alSubir = (e: React.PointerEvent<HTMLDivElement>): void => {
    const d = dedo.current
    if (d === null || d.id !== e.pointerId) return
    const dx = e.clientX - d.x
    const dy = e.clientY - d.y
    const deCostado = !d.mantenido && (d.intencion ?? intencionDelDedo(dx, dy)) === 'costado'
    const antes = vivo.current.indice
    soltarElDedo()
    // [C2-41t] Un toque (sin arrastre ni pausa) en la que asoma la trae.
    if (asoma !== null && d.intencion === null && !d.mantenido && enLaQueAsoma(e.currentTarget, e.clientX)) aplicar.current({ tipo: 'siguiente' })
    // Un tic por deslice que cambia de tarjeta (las flechas son botones: suenan solas).
    if (deCostado && aplicar.current({ tipo: 'deslice', dx, dy }).porElUsuario) sonar('tic')
    if (vivo.current.indice === antes) deslice.colocar()
  }
  const alCancelar = (): void => {
    soltarElDedo()
    deslice.colocar()
  }

  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (esDe(e.target, 'input, textarea, select, [contenteditable="true"]')) return
    if (e.key === 'ArrowRight') aplicar.current({ tipo: 'siguiente' })
    else if (e.key === 'ArrowLeft') aplicar.current({ tipo: 'anterior' })
  }
  const alEnfocar = (e: React.FocusEvent<HTMLDivElement>): void => {
    aplicar.current({ tipo: 'foco', adentro: e.target instanceof Element && e.target.matches(':focus-visible') })
  }
  const alDesenfocar = (e: React.FocusEvent<HTMLDivElement>): void => {
    if (!(e.relatedTarget instanceof Node && raiz.current?.contains(e.relatedTarget) === true)) aplicar.current({ tipo: 'foco', adentro: false })
  }

  return (
    <div
      ref={raiz}
      role="region"
      aria-roledescription="carrusel"
      aria-label={etiqueta}
      data-pieza="carrusel-de-tarjetas"
      data-indice={estado.indice}
      data-pausa={motivo ?? 'no'}
      className={cn('flex flex-col gap-4', className)}
      onKeyDown={alTeclear}
      onFocus={alEnfocar}
      onBlur={alDesenfocar}
    >
      <div
        data-parte="vista"
        aria-live={rota ? 'off' : 'polite'}
        ref={vista}
        className={cn('relative grid touch-pan-y select-none overflow-clip', claseDeLaVista)}
        style={{ WebkitTouchCallout: 'none' }}
        onPointerDown={alBajar}
        onPointerMove={alMoverse}
        onPointerUp={alSubir}
        onPointerCancel={alCancelar}
      >
        {items.map((item, i) => {
          const activa = i === estado.indice
          const tarjeta = renderItem(item, { indice: i, activa, corre: activa && rota, reinicio: estado.reinicio })
          return asoma === null ? (
            <Ranura key={item.id} activa={activa} sentido={estado.sentido} reducido={reducido} nombre={nombreDe(item)}>
              {tarjeta}
            </Ranura>
          ) : (
            <RanuraQueAsoma key={item.id} activa={activa} nombre={nombreDe(item)} indice={i} cantidad={items.length} posicion={deslice.posicion} ancho={deslice.ancho} fraccion={asoma.fraccion}>
              {tarjeta}
            </RanuraQueAsoma>
          )
        })}
      </div>
      <div data-parte="mandos" className="flex items-center gap-4">
        <button type="button" data-flecha="anterior" aria-label={rotulos.anterior} onClick={() => aplicar.current({ tipo: 'anterior' })} className={CLASE_DE_LA_FLECHA}>
          <ChevronLeft className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
        <div aria-hidden="true" data-parte="lineas" className="flex flex-1 items-center gap-2">
          {items.map((item, i) =>
            i === estado.indice ? (
              <LineaDeAhora key={item.id} avance={avance} quieta={reducido} />
            ) : (
              <span key={item.id} data-parte="linea" data-linea={vistasLlenas && i < estado.indice ? 'vista' : undefined} className={cn('h-0.5 flex-1 rounded-full', vistasLlenas && i < estado.indice ? 'bg-tinta' : 'bg-tinta/25')} />
            ),
          )}
        </div>
        <button type="button" data-flecha="siguiente" aria-label={rotulos.siguiente} onClick={() => aplicar.current({ tipo: 'siguiente' })} className={CLASE_DE_LA_FLECHA}>
          <ChevronRight className="size-5" strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
