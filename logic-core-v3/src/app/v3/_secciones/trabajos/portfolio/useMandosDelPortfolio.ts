'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'

import { vistaDelPaso } from './estado'
import { conDialogo, conElDefecto, medir, pegado, type Vuelo } from './medida'
import { duracionDeLaSalida } from './orden'
import { PANTALLAS_POR_PASO, PX_JUSTO_ANTES_DEL_PIN, bordesDelPaso, pxDeLaSeccion, pxDelScroll, scrollDelPx, type IndiceDePaso } from './pasos'
import { tiraDeLaEntrada, type DestinoDeLaRueda } from './rueda'
import { useClicAfueraDelPanel, type ControlDelClicAfuera } from './useClicAfueraDelPanel'
import { useRuedaDelPortfolio, type ControlDeLaRueda } from './useRuedaDelPortfolio'

/** [B1.2c] Lo que dura una rueda «reciente» (ms): la inercia de Lenis después del último evento de un golpe fuerte. */
export const RUEDA_RECIENTE_MS = 600

export interface PiezasDeLosMandos {
  readonly caja: RefObject<HTMLElement | null>
  readonly actual: { readonly current: IndiceDePaso }
  readonly enVuelo: { readonly current: Vuelo | null }
  readonly inerte: { current: { readonly x: number; readonly y: number } | null }
  readonly ultimaRueda: { current: number }
  /** [F2] Si el panel ya terminó de entrar (su transición hecha): recién ahí la rueda da pasos. */
  readonly entradaLista: { readonly current: boolean }
  readonly paso: IndiceDePaso
  /** [B1.2e] Debajo de 1024, el carrusel: la rueda y el clic afuera no son del Portfolio (el scroll es de la página). */
  readonly carrusel: boolean
  /** Lo que tarda el título en llegar y en caer (s). */
  readonly tituloS: number
  /** Lleva la página a un píxel de la regla en `ms` (0: en silencio) y pone ya el paso de destino. */
  readonly irAlPx: (px: number, ms: number, scrollExtra?: number) => void
  /** Salta al centro de un paso; `rueda`, si lo pidió la rueda (el hover queda afuera hasta que la transición termine, A3). */
  readonly saltar: (i: number, inmediato: boolean, rueda: boolean) => void
}

/**
 * [B1.2d] LOS MANDOS DEL PORTFOLIO — lo que mueve la página porque lo pidió el visitante, fuera del scroll: la rueda de a un proyecto
 * y sus salidas (a Demos y hacia arriba), la entrada que atrapa la inercia de un golpe fuerte y el clic afuera (A11). Salió de
 * `usePortfolio.ts` (la regla de las 300 líneas). Las salidas tardan lo del orden: el panel se va y el título cae entero
 * (`duracionDeLaSalida`). [B1.2e] Con el carrusel (debajo de 1024) no hay nada de esto: la rueda no manda, no atrapa ni se traga nada, y
 * el clic afuera no sale. Las salidas de las historias se fueron con ellas.
 */
export function useMandosDelPortfolio(m: PiezasDeLosMandos): void {
  const { caja, actual, enVuelo, inerte, ultimaRueda, entradaLista, paso, carrusel, tituloS, irAlPx, saltar } = m
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
    // [F1] El defecto, para el control positivo del arnés: la rueda de antes (sin trampa y con pasos mientras el panel entra).
    const conLaTrampa = !carrusel && !conElDefecto('rueda-en-la-entrada')
    // [F2] La entrada atrapa la rueda: el evento que lleva la página adentro desde afuera (con el destino de Lenis y este evento, que Lenis
    // suma DESPUÉS: la rueda del Portfolio escucha en la captura) vuela al primero del sentido. Sin otro vuelo en curso ni un diálogo.
    const atrapa = (px: number): boolean => {
      if (!conLaTrampa || enVuelo.current !== null || conDialogo(caja.current)) return false
      const lenis = LENIS_DEL_SITIO.instancia
      const medida = medir(caja.current)
      if (lenis === null || medida === null) return false
      const hacia = pxDelScroll(lenis.targetScroll + px * lenis.options.wheelMultiplier, medida.tope, medida.alto)
      const tira = tiraDeLaEntrada(vistaDelPaso(actual.current).fase, hacia, px > 0 ? 1 : -1, PANTALLAS_POR_PASO)
      if (tira === null) return false
      saltar(tira, false, true)
      return true
    }
    const adentro = (): boolean => !carrusel && vistaDelPaso(actual.current).fase === 'adentro' && !conDialogo(caja.current)
    control.current = {
      manda: () => {
        const v = vistaDelPaso(actual.current)
        return !carrusel && v.fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current) && (entradaLista.current || !conLaTrampa) ? v.tira : null
      },
      ocupado: () => enVuelo.current !== null,
      ir: (d) => ir(d, true),
      atrapa,
      entrando: () => conLaTrampa && adentro() && !entradaLista.current,
      inerte,
      ultimaRueda,
    }
  }, [actual, caja, carrusel, enVuelo, entradaLista, inerte, ir, saltar, ultimaRueda])
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
    if (carrusel || antes === 'adentro' || fase !== 'adentro' || lenis === null || medida === null || enVuelo.current !== null || performance.now() - ultimaRueda.current > RUEDA_RECIENTE_MS) return
    const { desde, hasta } = bordesDelPaso(paso, PANTALLAS_POR_PASO)
    const destino = lenis.targetScroll
    if (destino > scrollDelPx(hasta, medida.tope, medida.alto) || destino < scrollDelPx(desde, medida.tope, medida.alto)) saltar(vistaDelPaso(paso).tira, false, true)
  }, [caja, carrusel, enVuelo, fase, paso, saltar, ultimaRueda])

  // [B1.2d] A11, el clic afuera (justo antes del pin, con la salida normal). Leído en el evento: un `ref`, como la rueda.
  const mandos = useRef<ControlDelClicAfuera | null>(null)
  useEffect(() => {
    mandos.current = {
      adentro: () => !carrusel && vistaDelPaso(actual.current).fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current),
      salir: () => irAlPx(PX_JUSTO_ANTES_DEL_PIN, salidaMs),
    }
  }, [actual, caja, carrusel, irAlPx, salidaMs])
  useClicAfueraDelPanel(caja, mandos)
}
