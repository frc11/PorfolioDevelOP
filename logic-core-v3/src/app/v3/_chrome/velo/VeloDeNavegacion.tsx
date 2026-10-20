'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { hayBanco } from '../../_lib/escena/entorno'
import { DIA_DEL_FINAL, NOCHE_DISPARADA } from '../../_lib/escena/nocheDisparada'
import { VUELTA_AL_HOME, devolverLosAlmacenes, posicionGuardadaDelHome, type PosicionDelHome } from '../../_lib/escena/ruta/posicionDelHome'
import { sonar } from '../../_lib/sonido/bus'
import { TITULOS_EN_CAMINO } from '../../_lib/titulos3d/registro'
import { RUTA_DEL_HOME, atenderElVelo, nocheDelDestino, type NocheDelVelo } from '../../_lib/veloDeNavegacion'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { llevarElScrollA, reponerLosAlmacenes, scrollDeLaRuta } from './alCambiarDeRuta'
import { CURVA_DEL_VELO, VELO, coberturaDelVelo, maskDelVelo, puedeDestapar, siguienteFaseDelVelo, type EventoDelVelo, type FaseDelVelo } from './velo'

/** Si la ruta no cambia después de cubrir (un error, un enlace a la misma), se destapa igual a los `VENCE_MS`. */
const VENCE_MS = 4000

/** [B12a.7] El defecto, para el control positivo del arnés (`window.__defectosDelVelo = 'sin-vuelta'`: la flecha lleva arriba); nunca la URL. */
const sinVuelta = (): boolean => (window as Window & { __defectosDelVelo?: unknown }).__defectosDelVelo === 'sin-vuelta'

/** [B12a.7] Lo que lee el banco de la vuelta: los almacenes, la posición guardada y si hay una vuelta en curso. */
type VentanaDelBanco = Window & { __vueltaDelBanco?: () => { readonly noche: number; readonly dia: boolean; readonly guardada: PosicionDelHome | null; readonly enCurso: boolean } }

/**
 * [B12a.6] EL VELO DE LA NAVEGACIÓN — en el layout, encima de todo (la capa del overlay), sin recibir el puntero en reposo. `EnlaceDeRuta`
 * lo pide antes de navegar (`cubrirConElVelo`): cubre con el frente de la banda (`velo.ts`), la ruta cambia debajo, se reponen los
 * almacenes y el scroll (`alCambiarDeRuta.ts`), espera a que los cuadros vuelvan a ser parejos (la página nueva montada y quieta: el montaje
 * se paga tapado) y destapa con la cola. Suena suave al irse y al llegar (con el sonido apagado, nada). Con movimiento reducido, un corte. Lo que el banco lee: la fase y la
 * cobertura en el DOM (`data-fase`, `data-cobertura`).
 *
 * [B12a.7] LA FLECHA DEL NAVEGADOR cambia la ruta sin pedir nada: el velo cubre de una (el corte) con el color del destino. Si vuelve al
 * home, trae la posición que el home guardó al irse (`GuardaDeLaPosicionDelHome`): debajo del velo se devuelven la noche y el día del
 * final, el scroll va ahí (y vuelve a ir mientras el documento del home no alcanza) y recién se destapa.
 */
export function VeloDeNavegacion(): React.JSX.Element {
  const capa = useRef<HTMLDivElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  const reducidoAhora = useRef(reducido)
  const alCambiarLaRuta = useRef<(ruta: string) => void>(() => undefined)
  const ruta = usePathname()
  const rutaDeAhora = useRef(ruta)

  useEffect(() => {
    reducidoAhora.current = reducido
  }, [reducido])

  useEffect(() => {
    const el = capa.current
    if (el === null) return undefined
    let fase: FaseDelVelo = 'quieto'
    let rutaAlCubrir: string | null = null
    let cancelar = (): void => undefined
    let vence = 0
    let esperando = 0
    let vuelta: PosicionDelHome | null = null
    const colorear = (noche: NocheDelVelo): void => {
      el.style.backgroundColor = noche === 'noche' ? 'var(--color-tinta)' : 'var(--color-fondo)'
    }
    const pintar = (f: FaseDelVelo, t: number): void => {
      const mascara = maskDelVelo(f, t)
      el.style.maskImage = mascara
      el.style.setProperty('-webkit-mask-image', mascara)
      el.setAttribute('data-fase', f)
      el.setAttribute('data-cobertura', coberturaDelVelo(f, t).toFixed(3))
      el.style.pointerEvents = f === 'quieto' ? 'none' : 'auto'
    }
    const pasar = (e: EventoDelVelo): void => {
      fase = siguienteFaseDelVelo(fase, e)
    }
    const animar = (f: FaseDelVelo, ms: number, alTerminar: () => void): void => {
      cancelar()
      if (reducidoAhora.current || ms <= 0) {
        pintar(f, 1)
        alTerminar()
        return
      }
      const t0 = performance.now()
      let cuadro = 0
      const paso = (ahora: number): void => {
        const t = Math.min(1, (ahora - t0) / ms)
        pintar(f, CURVA_DEL_VELO(t))
        if (t < 1) cuadro = requestAnimationFrame(paso)
        else alTerminar()
      }
      cuadro = requestAnimationFrame(paso)
      cancelar = () => cancelAnimationFrame(cuadro)
    }
    const destapar = (): void => {
      if (fase !== 'cubierto') return
      window.clearTimeout(vence)
      VUELTA_AL_HOME.enCurso = false
      pasar('llego')
      sonar('abre')
      animar('destapando', VELO.destaparMs, () => {
        pasar('destapo')
        pintar('quieto', 0)
      })
    }
    const soltarElPedido = atenderElVelo((p) => {
      if (fase === 'cubierto') {
        p.cubierto()
        return
      }
      colorear(p.noche)
      rutaAlCubrir = window.location.pathname
      pasar('cubrir')
      sonar('cierra')
      animar('cubriendo', VELO.cubrirMs, () => {
        pasar('cubrio')
        pintar('cubierto', 1)
        p.cubierto()
        vence = window.setTimeout(destapar, VENCE_MS)
      })
    })
    // [B12a.7] La flecha: la URL ya es la del destino y la ruta de React todavía no. Sin cambio de ruta (un ancla del home), nada.
    const alUsarLaFlecha = (): void => {
      const destino = window.location.pathname
      if (destino === rutaDeAhora.current) return
      cancelar()
      cancelAnimationFrame(esperando)
      colorear(nocheDelDestino(destino))
      rutaAlCubrir = rutaDeAhora.current
      vuelta = destino === RUTA_DEL_HOME && !sinVuelta() ? posicionGuardadaDelHome() : null
      VUELTA_AL_HOME.enCurso = vuelta !== null
      pasar('corte')
      pintar('cubierto', 1)
      window.clearTimeout(vence)
      vence = window.setTimeout(destapar, VENCE_MS)
    }
    window.addEventListener('popstate', alUsarLaFlecha)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) ventana.__vueltaDelBanco = () => ({ noche: NOCHE_DISPARADA.cantidad, dia: DIA_DEL_FINAL.activo, guardada: posicionGuardadaDelHome(), enCurso: VUELTA_AL_HOME.enCurso })
    // La ruta cambió con el velo puesto: se repone lo de la ruta, se espera la página nueva y se destapa.
    alCambiarLaRuta.current = (r) => {
      if (fase !== 'cubierto' || rutaAlCubrir === r) return
      const guardada = r === RUTA_DEL_HOME ? vuelta : null
      vuelta = null
      reponerLosAlmacenes()
      if (guardada !== null) devolverLosAlmacenes(guardada)
      // El scroll de la ruta (o el que el home dejó) en el primer cuadro, antes de que la gota observe por primera vez: así repone su
      // noche sin barrido. Después, se espera a que los cuadros vuelvan a ser parejos (la página nueva quieta).
      const t0 = performance.now()
      let antes = t0
      let parejos = 0
      let primero = true
      const esperar = (ahora: number): void => {
        if (primero) {
          primero = false
          if (guardada === null) scrollDeLaRuta()
          else llevarElScrollA(guardada.y)
        } else {
          parejos = ahora - antes < VELO.cuadroParejoMs ? parejos + 1 : 0
          // Si el documento del home todavía no alcanzaba (lo que mide al montarse), se vuelve a llevar; mientras, no está quieto.
          if (guardada !== null && Math.abs(window.scrollY - guardada.y) > 1) {
            llevarElScrollA(guardada.y)
            parejos = 0
          }
        }
        antes = ahora
        if (puedeDestapar(parejos, TITULOS_EN_CAMINO.todos, ahora - t0)) destapar()
        else esperando = requestAnimationFrame(esperar)
      }
      cancelAnimationFrame(esperando)
      esperando = requestAnimationFrame(esperar)
    }
    return () => {
      soltarElPedido()
      window.removeEventListener('popstate', alUsarLaFlecha)
      delete ventana.__vueltaDelBanco
      VUELTA_AL_HOME.enCurso = false
      alCambiarLaRuta.current = () => undefined
      cancelar()
      cancelAnimationFrame(esperando)
      window.clearTimeout(vence)
    }
  }, [])

  useEffect(() => {
    alCambiarLaRuta.current(ruta)
    rutaDeAhora.current = ruta
  }, [ruta])

  return <div ref={capa} aria-hidden="true" data-pieza="velo-de-navegacion" data-fase="quieto" data-cobertura="0" className="bg-fondo pointer-events-none fixed inset-0 z-[var(--z-overlay)]" style={{ maskImage: maskDelVelo('quieto', 0) }} />
}
