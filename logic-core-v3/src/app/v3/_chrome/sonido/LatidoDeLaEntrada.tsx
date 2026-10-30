'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { entradaAbierta, suscribirALaEntrada } from '../../_lib/entrada'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { EN_CSS, LATIDO, latidoDelBoton, ondaDelPulso, type Animacion } from '../preloader/animaciones'
import { decisionDeLaVentana } from '../preloader/decision'

/**
 * [L8b · 1] EL LATIDO DE LA ENTRADA — el botón del sonido late «tu-tu» UNA vez en cada entrada a una página, con la onda fina que cruza el
 * fondo desde él (las mismas animaciones del preloader, `animaciones.ts`, de a una vuelta). Antes latía sólo adentro del preloader, que es
 * la primera entrada del día: en las demás entradas no latía nunca. Si el preloader corrió en esta carga, su latido es el de la entrada (la
 * capa no sale sin haber latido una vez) y éste no se repite; en las entradas por enlace (sin recarga) late cuando el velo ya destapó.
 *
 * Sólo desde 1024 (el teléfono no cambia en este lote). Espera al botón (perezoso), a la entrada abierta y a la pestaña visible; si el botón
 * no llega en `LATIDO_DE_LA_ENTRADA.esperaMaximaMs`, nada. Con movimiento reducido: un pulso de opacidad, sin onda. Todo en el compositor
 * (`opacity` y `transform`). La onda va con `mix-blend-difference` sobre el color del papel: oscura sobre el papel, clara sobre la escena
 * de noche.
 *
 * [L9b · 1] La onda viaja y se apaga en `ondaMs` (el doble de la del preloader: «parpadea muy rápido»). Late UNA vez por entrada aunque el
 * efecto vuelva a correr o la pieza se vuelva a montar (`tomarElLatido`, un registro de la carga), y recién con la página lista
 * (`paginaLista`): una carga lenta espera, no apila latidos.
 */
export const LATIDO_DE_LA_ENTRADA = { desdePx: 1024, demoraMs: 250, demoraDeLaRutaMs: 900, esperaMaximaMs: 20000, grosorPx: 2, ondaMs: 2500, fueraDelPreloader: false } as const

const BOTON = '[data-pieza="control-del-sonido"]'
const VELO = '[data-pieza="velo-de-carga"]'

/** Un solo pulso de opacidad (movimiento reducido): baja y vuelve, nada se agranda. */
const PULSO_REDUCIDO: Animacion = {
  cuadros: [{ opacity: 1, easing: EN_CSS.principal }, { opacity: 0.55, offset: LATIDO.subeMs / (LATIDO.subeMs + LATIDO.bajaMs), easing: EN_CSS.entrada }, { opacity: 1 }],
  duracion: LATIDO.subeMs + LATIDO.bajaMs,
  demora: 0,
  relleno: 'none',
}

/** [L9b] La onda de un pulso de la entrada: la del preloader (`ondaDelPulso`, los mismos cuadros y su curva), de una vuelta y en `ondaMs`. */
function ondaDeLaEntrada(indice: 0 | 1, escalaInicial: number): { readonly escala: Animacion; readonly opacidad: Animacion } {
  const lenta = (a: Animacion): Animacion => {
    const fin = a.cuadros.find((c) => c.offset !== undefined && c.offset > 0)?.offset ?? 1
    return { ...a, iteraciones: 1, duracion: LATIDO_DE_LA_ENTRADA.ondaMs, cuadros: a.cuadros.filter((c) => c.offset !== 1).map((c) => (c.offset === fin ? { ...c, offset: 1 } : c)) }
  }
  const o = ondaDelPulso(indice, escalaInicial)
  return { escala: lenta(o.escala), opacidad: lenta(o.opacidad) }
}

/** Las animaciones de UNA entrada: el latido del botón (dos pulsos, o uno de opacidad) y, sin reducido, la onda de cada pulso. */
export function animacionesDeLaEntrada(reducido: boolean, escalaInicial: number): { readonly boton: Animacion; readonly ondas: readonly { readonly escala: Animacion; readonly opacidad: Animacion }[] } {
  if (reducido) return { boton: PULSO_REDUCIDO, ondas: [] }
  return { boton: { ...latidoDelBoton(false), iteraciones: 1 }, ondas: ([0, 1] as const).map((i) => ondaDeLaEntrada(i, escalaInicial)) }
}

/** El radio que cubre el fondo desde el centro (`cx`, `cy`) hasta la esquina más lejana de la pantalla. */
export const radioHastaLaEsquina = (cx: number, cy: number, ancho: number, alto: number): number => Math.max(Math.hypot(cx, cy), Math.hypot(ancho - cx, cy), Math.hypot(cx, alto - cy), Math.hypot(ancho - cx, alto - cy))

interface Latido {
  readonly cx: number
  readonly cy: number
  readonly lado: number
  readonly radio: number
}

/** Con el preloader en esta carga, su latido fue el de la primera entrada. */
const conPreloader = (): boolean => decisionDeLaVentana() !== null

/** [L9b] Las entradas de esta carga: cada cambio de ruta es una entrada nueva (`numero`); `latio`, la última que ya tomó su latido. */
const ENTRADAS: { ruta: string | null; numero: number; latio: number } = { ruta: null, numero: 0, latio: 0 }
export function numeroDeLaEntrada(ruta: string): number {
  if (ruta !== ENTRADAS.ruta) {
    ENTRADAS.ruta = ruta
    ENTRADAS.numero += 1
  }
  return ENTRADAS.numero
}

/** La primera entrada es la de la ruta de la carga antes de cualquier cambio (igual si el efecto corre dos veces). */
export const esLaPrimeraEntrada = (ruta: string): boolean => numeroDeLaEntrada(ruta) === 1

/** [L9b] El latido de una entrada se toma UNA vez: la primera llamada con esa entrada; las demás (un efecto repetido, la pieza remontada), no. */
export function tomarElLatido(entrada: number): boolean {
  if (ENTRADAS.latio >= entrada) return false
  ENTRADAS.latio = entrada
  return true
}

/** [L9b] La página está lista: el preloader se fue, el velo de la carga del home también y el documento terminó de cargar. */
const paginaLista = (): boolean => entradaAbierta() && document.readyState === 'complete' && document.querySelector(VELO) === null

const animar = (el: Element, a: Animacion): Animation => el.animate(a.cuadros as Keyframe[], { duration: a.duracion, delay: a.demora, fill: a.relleno, iterations: a.iteraciones ?? 1 })

export function LatidoDeLaEntrada(): React.JSX.Element | null {
  const ruta = usePathname()
  const reducido = useMovimientoReducido()
  const [latido, setLatido] = useState<Latido | null>(null)
  const ondas = useRef<{ escala: HTMLSpanElement | null; opacidad: HTMLSpanElement | null }[]>([{ escala: null, opacidad: null }, { escala: null, opacidad: null }])
  // [L9b] El latido en curso no se reinicia si cambia la preferencia (antes: cancelar y volver a latir).
  const reducidoAhora = useRef(reducido)
  useLayoutEffect(() => {
    reducidoAhora.current = reducido
  }, [reducido])

  // Cuándo late: en cada entrada (la carga y cada ruta nueva), con el botón, la página lista y la pestaña a la vista.
  useEffect(() => {
    // [L7d · 7] Las ondas son sólo del preloader (el suyo): fuera de él no se dispara ninguna. Con `true` vuelve el latido de cada entrada de L8b/L9b.
    if (!LATIDO_DE_LA_ENTRADA.fueraDelPreloader) return undefined
    const entrada = numeroDeLaEntrada(ruta)
    const esPrimera = entrada === 1
    if ((esPrimera && conPreloader()) || !window.matchMedia(`(min-width: ${String(LATIDO_DE_LA_ENTRADA.desdePx)}px)`).matches) return undefined
    const desde = performance.now()
    let reloj = 0
    let quitar: (() => void) | null = null
    const probar = (): void => {
      const boton = document.querySelector(BOTON)
      const caja = boton?.getBoundingClientRect()
      if (performance.now() - desde > LATIDO_DE_LA_ENTRADA.esperaMaximaMs || ENTRADAS.latio >= entrada) return
      // Una sola suscripción mientras la entrada está cerrada (sacarse y volver a sumarse adentro del aviso lo recorre sin fin).
      if (!entradaAbierta()) {
        quitar ??= suscribirALaEntrada(probar)
        return
      }
      quitar?.()
      quitar = null
      if (!paginaLista() || document.visibilityState !== 'visible' || caja === undefined || !(caja.width >= 1) || !(window.innerWidth > 0)) {
        reloj = window.setTimeout(probar, 200)
        return
      }
      if (!tomarElLatido(entrada)) return
      const [cx, cy] = [caja.left + caja.width / 2, caja.top + caja.height / 2]
      setLatido({ cx, cy, lado: caja.width, radio: radioHastaLaEsquina(cx, cy, window.innerWidth, window.innerHeight) })
    }
    reloj = window.setTimeout(probar, esPrimera ? LATIDO_DE_LA_ENTRADA.demoraMs : LATIDO_DE_LA_ENTRADA.demoraDeLaRutaMs)
    return () => {
      window.clearTimeout(reloj)
      quitar?.()
    }
  }, [ruta])

  // El latido: el botón real y las dos ondas; al terminar la última, se desarma.
  useLayoutEffect(() => {
    const boton = document.querySelector(BOTON)
    if (latido === null || boton === null) return undefined
    const a = animacionesDeLaEntrada(reducidoAhora.current, latido.lado / (2 * latido.radio))
    const todas = [animar(boton, a.boton)]
    a.ondas.forEach((o, i) => {
      const el = ondas.current[i]
      if (el?.escala) todas.push(animar(el.escala, o.escala))
      if (el?.opacidad) todas.push(animar(el.opacidad, o.opacidad))
    })
    let vivo = true
    void Promise.all(todas.map((x) => x.finished.catch(() => undefined))).then(() => vivo && setLatido(null))
    return () => {
      vivo = false
      for (const x of todas) x.cancel()
    }
  }, [latido])

  if (latido === null || reducido) return null
  const { cx, cy, radio } = latido
  return (
    <div aria-hidden="true" data-pieza="latido-de-la-entrada" className="text-fondo pointer-events-none fixed inset-0 z-[var(--z-cabecera)] overflow-hidden mix-blend-difference">
      {[0, 1].map((i) => (
        <span
          key={i}
          ref={(el) => {
            const o = ondas.current[i]
            if (o) o.opacidad = el
          }}
          data-parte="onda-de-la-entrada"
          className="absolute opacity-0"
          style={{ left: cx - radio, top: cy - radio, width: 2 * radio, height: 2 * radio }}
        >
          <span
            ref={(el) => {
              const o = ondas.current[i]
              if (o) o.escala = el
            }}
            className="block size-full rounded-full border-current will-change-transform"
            style={{ borderWidth: LATIDO_DE_LA_ENTRADA.grosorPx }}
          />
        </span>
      ))}
    </div>
  )
}
