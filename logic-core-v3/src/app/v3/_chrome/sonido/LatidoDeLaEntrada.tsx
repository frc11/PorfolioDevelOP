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
 */
export const LATIDO_DE_LA_ENTRADA = { desdePx: 1024, demoraMs: 250, demoraDeLaRutaMs: 900, esperaMaximaMs: 6000, grosorPx: 2 } as const

const BOTON = '[data-pieza="control-del-sonido"]'

/** Un solo pulso de opacidad (movimiento reducido): baja y vuelve, nada se agranda. */
const PULSO_REDUCIDO: Animacion = {
  cuadros: [{ opacity: 1, easing: EN_CSS.principal }, { opacity: 0.55, offset: LATIDO.subeMs / (LATIDO.subeMs + LATIDO.bajaMs), easing: EN_CSS.entrada }, { opacity: 1 }],
  duracion: LATIDO.subeMs + LATIDO.bajaMs,
  demora: 0,
  relleno: 'none',
}

/** Las animaciones de UNA entrada: el latido del botón (dos pulsos, o uno de opacidad) y, sin reducido, la onda de cada pulso. */
export function animacionesDeLaEntrada(reducido: boolean, escalaInicial: number): { readonly boton: Animacion; readonly ondas: readonly { readonly escala: Animacion; readonly opacidad: Animacion }[] } {
  const unaVez = (a: Animacion): Animacion => ({ ...a, iteraciones: 1 })
  if (reducido) return { boton: PULSO_REDUCIDO, ondas: [] }
  return { boton: unaVez(latidoDelBoton(false)), ondas: ([0, 1] as const).map((i) => { const o = ondaDelPulso(i, escalaInicial); return { escala: unaVez(o.escala), opacidad: unaVez(o.opacidad) } }) }
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

const animar = (el: Element, a: Animacion): Animation => el.animate(a.cuadros as Keyframe[], { duration: a.duracion, delay: a.demora, fill: a.relleno, iterations: a.iteraciones ?? 1 })

export function LatidoDeLaEntrada(): React.JSX.Element | null {
  const ruta = usePathname()
  const reducido = useMovimientoReducido()
  const [latido, setLatido] = useState<Latido | null>(null)
  const primera = useRef(true)
  const ondas = useRef<{ escala: HTMLSpanElement | null; opacidad: HTMLSpanElement | null }[]>([{ escala: null, opacidad: null }, { escala: null, opacidad: null }])

  // Cuándo late: en cada entrada (la carga y cada ruta nueva), con el botón, la entrada abierta y la pestaña a la vista.
  useEffect(() => {
    const esPrimera = primera.current
    primera.current = false
    if ((esPrimera && conPreloader()) || !window.matchMedia(`(min-width: ${String(LATIDO_DE_LA_ENTRADA.desdePx)}px)`).matches) return undefined
    const desde = performance.now()
    let reloj = 0
    let quitar: (() => void) | null = null
    const probar = (): void => {
      quitar?.()
      quitar = null
      const boton = document.querySelector(BOTON)
      const caja = boton?.getBoundingClientRect()
      if (performance.now() - desde > LATIDO_DE_LA_ENTRADA.esperaMaximaMs) return
      if (!entradaAbierta()) {
        quitar = suscribirALaEntrada(probar)
        return
      }
      if (document.visibilityState !== 'visible' || caja === undefined || !(caja.width >= 1) || !(window.innerWidth > 0)) {
        reloj = window.setTimeout(probar, 200)
        return
      }
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
    const a = animacionesDeLaEntrada(reducido, latido.lado / (2 * latido.radio))
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
  }, [latido, reducido])

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
