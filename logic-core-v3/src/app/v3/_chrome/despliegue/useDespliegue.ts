'use client'

import { useCallback, useMemo, useRef, type RefObject } from 'react'

import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { sonar } from '../../_lib/sonido/bus'
import {
  cajaDeLaPantalla,
  cajaDelOrigen,
  correrPorTiempo,
  escalaDelFundido,
  formaDelDespliegue,
  msDelTramo,
  opacidadDelContenido,
  type Caja,
} from './despliegue'

/**
 * [B7] EL GANCHO DEL DESPLIEGUE — pinta `despliegue.ts` sobre dos capas de pantalla completa: la HOJA (el fondo liso que sale del
 * botón) y el CONTENIDO (lo de adentro, recortado por la misma forma). Sin estado de React: cada cuadro escribe estilos.
 *
 *   · `abrir(origen, alTerminar)`: suena `abre` (el de las demos; con el sonido apagado, nada) y despliega desde donde esté (1 si
 *     estaba cerrada). Al terminar suelta la forma: la hoja queda entera, sin recorte;
 *   · `cerrar(origen, alTerminar)`: suena `cierra` y vuelve al botón desde donde esté (si se cierra mientras abre, desde ahí, con
 *     el tiempo que le falta: no vuelve a empezar);
 *   · el reloj arranca UN CUADRO DESPUÉS del que pinta la primera pose (el cuadro del clic es el que monta: contar desde ahí era
 *     perder los primeros, `VentanaDeDemo`), y el avance queda en `data-avance` de la hoja, para el banco.
 *
 * Las capas arrancan con `opacity: 0` en su estilo (nada se ve antes de la primera pose); la primera pose se pinta en el mismo
 * cuadro en que se pide (quien abre lo llama desde un efecto de layout).
 */

export interface CapasDelDespliegue {
  readonly hoja: RefObject<HTMLElement | null>
  readonly contenido: RefObject<HTMLElement | null>
}

export interface ControlDelDespliegue {
  readonly abrir: (origen: HTMLElement | null, alTerminar: () => void) => void
  readonly cerrar: (origen: HTMLElement | null, alTerminar: () => void) => void
  readonly cancelar: () => void
}

interface Geometria {
  readonly pantalla: Caja
  readonly origen: Caja
}

export function useDespliegue(capas: CapasDelDespliegue): ControlDelDespliegue {
  const reducido = useMovimientoReducido()
  const cancelador = useRef<() => void>(() => undefined)
  /** Cuánto está adentro del botón: 1 = cerrada, 0 = desplegada. */
  const avance = useRef(1)
  /** Con un botón a la vista y con movimiento, la forma del Genie; si no (`null`), el fundido. */
  const geometria = useRef<Geometria | null>(null)

  const soltar = useCallback((): void => {
    for (const capa of [capas.hoja.current, capas.contenido.current]) {
      capa?.style.removeProperty('clip-path')
      capa?.style.removeProperty('opacity')
      capa?.style.removeProperty('scale')
    }
  }, [capas])

  const pintar = useCallback(
    (m: number): void => {
      avance.current = m
      const hoja = capas.hoja.current
      const contenido = capas.contenido.current
      hoja?.setAttribute('data-avance', m.toFixed(3))
      const g = geometria.current
      if (g === null) {
        const u = 1 - m
        hoja?.style.setProperty('opacity', u.toFixed(3))
        contenido?.style.setProperty('opacity', u.toFixed(3))
        contenido?.style.setProperty('scale', escalaDelFundido(u).toFixed(4))
        return
      }
      const forma = `path('${formaDelDespliegue(m, g.pantalla, g.origen)}')`
      hoja?.style.setProperty('opacity', '1')
      hoja?.style.setProperty('clip-path', forma)
      contenido?.style.setProperty('clip-path', forma)
      contenido?.style.setProperty('opacity', opacidadDelContenido(m).toFixed(3))
    },
    [capas],
  )

  /** De dónde sale y adónde vuelve, medido al empezar cada tramo (la pantalla puede haber cambiado). */
  const medir = useCallback(
    (origen: HTMLElement | null): void => {
      const ancho = window.innerWidth
      const alto = window.innerHeight
      // Un botón escondido (la esquina de la barra en el modo del menú) conserva su caja: también cuenta como «sin botón».
      const aLaVista = origen !== null && origen.isConnected && getComputedStyle(origen).visibility !== 'hidden'
      const caja = reducido || !aLaVista ? null : cajaDelOrigen(origen.getBoundingClientRect(), ancho, alto)
      geometria.current = caja === null ? null : { pantalla: cajaDeLaPantalla(ancho, alto), origen: caja }
    },
    [reducido],
  )

  /**
   * [C2 · 80] EL FUNDIDO, EN EL COMPOSITOR: una animación nativa de opacidad y escala (lineal, como `pintar`). En la entrada directa
   * el home todavía monta sus secciones y le quitaba los cuadros a un fundido pintado desde JS (los 200 ms se volvían ~630, sin un
   * paso intermedio). El avance lo sigue leyendo el hilo principal (para `data-avance` y para cortar a mitad de camino).
   */
  const fundir = useCallback(
    (desde: number, hasta: number, ms: number, alTerminar: () => void): (() => void) => {
      const hoja = capas.hoja.current
      const contenido = capas.contenido.current
      if (hoja === null || contenido === null) {
        pintar(hasta)
        alTerminar()
        return () => undefined
      }
      const [u0, u1] = [1 - desde, 1 - hasta]
      const como: KeyframeAnimationOptions = { duration: ms, easing: 'linear', fill: 'forwards' }
      const animaciones = [
        hoja.animate([{ opacity: u0 }, { opacity: u1 }], como),
        contenido.animate([{ opacity: u0, scale: String(escalaDelFundido(u0)) }, { opacity: u1, scale: String(escalaDelFundido(u1)) }], como),
      ]
      const enMedio = (): number => {
        const t = animaciones[0].currentTime
        return desde + (hasta - desde) * Math.min(1, typeof t === 'number' ? t / ms : 0)
      }
      let cuadro = 0
      const seguir = (): void => {
        const m = enMedio()
        avance.current = m
        hoja.setAttribute('data-avance', m.toFixed(3))
        cuadro = requestAnimationFrame(seguir)
      }
      cuadro = requestAnimationFrame(seguir)
      // Los estilos del final quedan escritos antes de soltar la animación (sin un cuadro con los de antes). Una sola vez: el
      // próximo tramo llama al cancelador de éste, y ya terminado no tiene que repintar nada.
      let vivo = true
      const terminar = (m: number): boolean => {
        if (!vivo) return false
        vivo = false
        cancelAnimationFrame(cuadro)
        pintar(m)
        animaciones.forEach((a) => a.cancel())
        return true
      }
      animaciones[0].onfinish = () => {
        if (terminar(hasta)) alTerminar()
      }
      return () => {
        if (vivo) terminar(enMedio())
      }
    },
    [capas, pintar],
  )

  const correr = useCallback(
    (hasta: 0 | 1, alTerminar: () => void): void => {
      cancelador.current()
      const desde = avance.current
      const ms = msDelTramo(desde, hasta, geometria.current !== null)
      // Sin restos del modo del tramo anterior (un fundido que se cierra con el Genie, o al revés); la primera pose, ya.
      soltar()
      pintar(desde)
      if (ms === 0) {
        pintar(hasta)
        alTerminar()
        return
      }
      if (geometria.current === null) {
        cancelador.current = fundir(desde, hasta, ms, alTerminar)
        return
      }
      const espera = requestAnimationFrame(() => {
        cancelador.current = correrPorTiempo(ms, (t) => pintar(desde + (hasta - desde) * (t / ms)), alTerminar)
      })
      cancelador.current = () => cancelAnimationFrame(espera)
    },
    [pintar, soltar, fundir],
  )

  const abrir = useCallback(
    (origen: HTMLElement | null, alTerminar: () => void): void => {
      sonar('abre')
      medir(origen)
      correr(0, () => {
        soltar()
        alTerminar()
      })
    },
    [medir, correr, soltar],
  )

  const cerrar = useCallback(
    (origen: HTMLElement | null, alTerminar: () => void): void => {
      sonar('cierra')
      medir(origen)
      correr(1, alTerminar)
    },
    [medir, correr],
  )

  const cancelar = useCallback((): void => cancelador.current(), [])

  return useMemo(() => ({ abrir, cerrar, cancelar }), [abrir, cerrar, cancelar])
}
