'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'

import { vistaDelPaso } from './estado'
import { conDialogo, medir, pegado, type Vuelo } from './medida'
import { duracionDeLaSalida } from './orden'
import { PANTALLAS_POR_PASO, PX_JUSTO_ANTES_DEL_PIN, bordesDelPaso, pxDeLaSeccion, scrollDelPx, type IndiceDePaso } from './pasos'
import { destinoDeLaRueda, type DestinoDeLaRueda } from './rueda'
import { useClicAfueraDelPanel, type ControlDelClicAfuera } from './useClicAfueraDelPanel'
import { useDeslizamientoDelPortfolio, type ControlDelDeslizamiento } from './useDeslizamientoDelPortfolio'
import { useRuedaDelPortfolio, type ControlDeLaRueda } from './useRuedaDelPortfolio'

/** [B1.2c] Lo que dura una rueda «reciente» (ms): la inercia de Lenis después del último evento de un golpe fuerte. */
export const RUEDA_RECIENTE_MS = 600

export interface PiezasDeLosMandos {
  readonly caja: RefObject<HTMLElement | null>
  readonly actual: { readonly current: IndiceDePaso }
  readonly enVuelo: { readonly current: Vuelo | null }
  readonly inerte: { current: { readonly x: number; readonly y: number } | null }
  readonly ultimaRueda: { current: number }
  readonly paso: IndiceDePaso
  readonly historias: boolean
  /** Lo que tarda el título en llegar y en caer (s). */
  readonly tituloS: number
  /** Lleva la página a un píxel de la regla en `ms` (0: en silencio) y pone ya el paso de destino. */
  readonly irAlPx: (px: number, ms: number, scrollExtra?: number) => void
  /** Salta al centro de un paso; `rueda`, si lo pidió la rueda (el hover queda afuera hasta que la transición termine, A3). */
  readonly saltar: (i: number, inmediato: boolean, rueda: boolean) => void
}

/**
 * [B1.2d] LOS MANDOS DEL PORTFOLIO — lo que mueve la página porque lo pidió el visitante, fuera del scroll: la rueda de a un proyecto
 * y sus salidas (a Demos y hacia arriba), la entrada que atrapa la inercia de un golpe fuerte, los toques y el deslizamiento de las
 * historias y el clic afuera (A11). Salió de `usePortfolio.ts` (la regla de las 300 líneas). Las salidas tardan lo del orden: el panel
 * se va y el título cae entero (`duracionDeLaSalida`).
 */
export function useMandosDelPortfolio(m: PiezasDeLosMandos): { readonly irAl: (sentido: 1 | -1) => void } {
  const { caja, actual, enVuelo, inerte, ultimaRueda, paso, historias, tituloS, irAlPx, saltar } = m
  const salidaMs = duracionDeLaSalida(tituloS) * 1000

  // [B1.2c] La rueda: de a un proyecto; después de «la tuya», a Demos (el final del pin, como el viaje del menú: dos píxeles antes);
  // antes del primero, arriba (la sección asomando por abajo).
  const ir = useCallback(
    (d: DestinoDeLaRueda, rueda: boolean): void => {
      if (d.tipo === 'paso') saltar(d.indice, !rueda, rueda)
      else if (d.tipo === 'demos') irAlPx(pxDeLaSeccion(PANTALLAS_POR_PASO), salidaMs, -2)
      else irAlPx(0, salidaMs)
    },
    [irAlPx, saltar, salidaMs],
  )
  const control = useRef<ControlDeLaRueda | null>(null)
  useEffect(() => {
    control.current = {
      manda: () => {
        const v = vistaDelPaso(actual.current)
        return v.fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current) ? v.tira : null
      },
      ocupado: () => enVuelo.current !== null,
      ir: (d) => ir(d, true),
      inerte,
      ultimaRueda,
    }
  }, [actual, caja, enVuelo, inerte, ir, ultimaRueda])
  useRuedaDelPortfolio(control)

  // [B1.2c] La entrada del panel ATRAPA la inercia de la rueda: un golpe fuerte que viene de afuera dejó a Lenis yendo más allá del
  // proyecto en el que entra; el panel lo frena en el centro de ése (el primero que cruzó), y de ahí la rueda va de a uno.
  const fase = vistaDelPaso(paso).fase
  const faseAntes = useRef(fase)
  useEffect(() => {
    const antes = faseAntes.current
    faseAntes.current = fase
    const lenis = LENIS_DEL_SITIO.instancia
    const medida = medir(caja.current)
    if (antes === 'adentro' || fase !== 'adentro' || lenis === null || medida === null || enVuelo.current !== null || performance.now() - ultimaRueda.current > RUEDA_RECIENTE_MS) return
    const { desde, hasta } = bordesDelPaso(paso, PANTALLAS_POR_PASO)
    const destino = lenis.targetScroll
    if (destino > scrollDelPx(hasta, medida.tope, medida.alto) || destino < scrollDelPx(desde, medida.tope, medida.alto)) saltar(vistaDelPaso(paso).tira, false, true)
  }, [caja, enVuelo, fase, paso, saltar, ultimaRueda])

  // [B1.3] Los toques de la historia (el modelo de la rueda, el paso en silencio), el deslizamiento que se asienta de a un proyecto y
  // [B1.2d] A11, el clic afuera (justo antes del pin, con la salida normal). Leídos en el evento: un `ref`, como la rueda.
  const deslizamiento = useRef<ControlDelDeslizamiento | null>(null)
  const mandos = useRef<ControlDelClicAfuera & { readonly irAl: (sentido: 1 | -1) => void } | null>(null)
  useEffect(() => {
    deslizamiento.current = { caja, paso: () => actual.current, ocupado: () => enVuelo.current !== null, irAlPaso: (i) => saltar(i, false, false) }
    mandos.current = {
      irAl: (sentido) => {
        const v = vistaDelPaso(actual.current)
        if (v.fase === 'adentro') ir(destinoDeLaRueda(v.tira, sentido), false)
      },
      adentro: () => vistaDelPaso(actual.current).fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current),
      salir: () => irAlPx(PX_JUSTO_ANTES_DEL_PIN, salidaMs),
    }
  }, [actual, caja, enVuelo, ir, irAlPx, saltar, salidaMs])
  useDeslizamientoDelPortfolio(historias, deslizamiento)
  useClicAfueraDelPanel(caja, mandos)
  const irAl = useCallback((sentido: 1 | -1): void => mandos.current?.irAl(sentido), [])

  return { irAl }
}
