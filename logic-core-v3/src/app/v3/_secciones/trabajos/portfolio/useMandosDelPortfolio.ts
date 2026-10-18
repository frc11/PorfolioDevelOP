'use client'

import { useCallback, useEffect, useRef, type RefObject } from 'react'

import type { SalidaDeLasHistorias } from '../../../_componentes/historias/maquinaDeLasHistorias'
import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'

import { vistaDelPaso } from './estado'
import { conDialogo, medir, pegado, type Vuelo } from './medida'
import { duracionDeLaSalida } from './orden'
import { PANTALLAS_POR_PASO, PX_JUSTO_ANTES_DEL_PIN, bordesDelPaso, pxDeLaSeccion, pxDelScroll, scrollDelPx, type IndiceDePaso } from './pasos'
import { entraConLaRafaga, type DestinoDeLaRueda } from './rueda'
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
 * y sus salidas (a Demos y hacia arriba), la entrada que atrapa la inercia de un golpe fuerte, [B1.2d B] las salidas de las historias
 * (T2 a T8: la rueda y los deslices verticales SALEN; el scroll nunca avanza una historia) y el clic afuera (A11). Salió de `usePortfolio.ts` (la regla de las 300 líneas). Las salidas tardan lo del orden: el panel
 * se va y el título cae entero (`duracionDeLaSalida`).
 */
export function useMandosDelPortfolio(m: PiezasDeLosMandos): { readonly salirDeLasHistorias: (hacia: SalidaDeLasHistorias) => void } {
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
  // [B1.2d B] Las salidas de las historias: adelante, a Demos (como después de «la tuya»); atrás, al título (justo antes del pin).
  const salir = useCallback(
    (hacia: SalidaDeLasHistorias): void => (hacia === 'adelante' ? irAlPx(pxDeLaSeccion(PANTALLAS_POR_PASO), salidaMs, -2) : irAlPx(PX_JUSTO_ANTES_DEL_PIN, salidaMs)),
    [irAlPx, salidaMs],
  )
  const control = useRef<ControlDeLaRueda | null>(null)
  // [B1.2d] A2.3 · El vuelo de la ráfaga (su salida o su salteo), para tragar el resto de la ráfaga mientras dura.
  const vueloDeLaRafaga = useRef<Vuelo | null>(null)
  useEffect(() => {
    const rafaga = (sentido: 1 | -1, px: number): boolean => {
      const vuelo = enVuelo.current
      if (vuelo !== null && vuelo === vueloDeLaRafaga.current) return true
      if (conDialogo(caja.current)) return false
      const v = vistaDelPaso(actual.current)
      const destino: DestinoDeLaRueda = sentido > 0 ? { tipo: 'demos' } : { tipo: 'arriba' }
      // Afuera, con un vuelo en curso (la salida de una muesca): que termine; la rueda ya se traga.
      if (vuelo !== null && v.fase !== 'adentro') return true
      if (v.fase !== 'adentro') {
        const lenis = LENIS_DEL_SITIO.instancia
        const medida = medir(caja.current)
        if (lenis === null || medida === null) return false
        // Adónde va la página: el destino de Lenis y este evento, que Lenis suma DESPUÉS (la rueda del Portfolio escucha en la captura).
        const hacia = pxDelScroll(lenis.targetScroll + px * lenis.options.wheelMultiplier, medida.tope, medida.alto)
        if (!entraConLaRafaga(medida.px, hacia, sentido, PANTALLAS_POR_PASO)) return false
      }
      // Adentro sale sin recorrer los proyectos que faltan; afuera, la ráfaga que entra al tramo lo saltea entero (el paso de destino ya:
      // ni la píldora ni el panel).
      ir(destino, true)
      vueloDeLaRafaga.current = enVuelo.current
      return true
    }
    control.current = {
      manda: () => {
        const v = vistaDelPaso(actual.current)
        return v.fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current) ? v.tira : null
      },
      ocupado: () => enVuelo.current !== null,
      // [B1.2d B] T8 · en las historias la rueda no avanza: sale (abajo, a Demos; arriba, al título).
      ir: (d) => (historias ? salir(d.tipo === 'demos' || (d.tipo === 'paso' && d.indice > vistaDelPaso(actual.current).tira) ? 'adelante' : 'atras') : ir(d, true)),
      rafaga,
      inerte,
      ultimaRueda,
    }
  }, [actual, caja, enVuelo, historias, inerte, ir, salir, ultimaRueda])
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

  // [B1.2d] A11, el clic afuera (justo antes del pin, con la salida normal). Leído en el evento: un `ref`, como la rueda.
  const mandos = useRef<ControlDelClicAfuera | null>(null)
  useEffect(() => {
    mandos.current = {
      adentro: () => vistaDelPaso(actual.current).fase === 'adentro' && pegado(caja.current) && !conDialogo(caja.current),
      salir: () => irAlPx(PX_JUSTO_ANTES_DEL_PIN, salidaMs),
    }
  }, [actual, caja, irAlPx, salidaMs])
  useClicAfueraDelPanel(caja, mandos)

  return { salirDeLasHistorias: salir }
}
