'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { sonar } from '../../_lib/sonido/bus'
import { TITULOS_EN_CAMINO } from '../../_lib/titulos3d/registro'
import { atenderElVelo } from '../../_lib/veloDeNavegacion'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { reponerLosAlmacenes, scrollDeLaRuta } from './alCambiarDeRuta'
import { CURVA_DEL_VELO, VELO, coberturaDelVelo, maskDelVelo, puedeDestapar, siguienteFaseDelVelo, type EventoDelVelo, type FaseDelVelo } from './velo'

/** Si la ruta no cambia después de cubrir (un error, un enlace a la misma), se destapa igual a los `VENCE_MS`. */
const VENCE_MS = 4000

/**
 * [B12a.6] EL VELO DE LA NAVEGACIÓN — en el layout, encima de todo (la capa del overlay), sin recibir el puntero en reposo. `EnlaceDeRuta`
 * lo pide antes de navegar (`cubrirConElVelo`): cubre con el frente de la banda (`velo.ts`), la ruta cambia debajo, se reponen los
 * almacenes y el scroll (`alCambiarDeRuta.ts`), espera a que los cuadros vuelvan a ser parejos (la página nueva montada y quieta: el montaje
 * se paga tapado) y destapa con la cola. Suena suave al irse y al llegar (con el sonido apagado, nada). Con movimiento reducido, un corte. Lo que el banco lee: la fase y la
 * cobertura en el DOM (`data-fase`, `data-cobertura`).
 */
export function VeloDeNavegacion(): React.JSX.Element {
  const capa = useRef<HTMLDivElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  const reducidoAhora = useRef(reducido)
  const alCambiarLaRuta = useRef<(ruta: string) => void>(() => undefined)
  const ruta = usePathname()

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
      el.style.backgroundColor = p.noche === 'noche' ? 'var(--color-tinta)' : 'var(--color-fondo)'
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
    // La ruta cambió con el velo puesto: se repone lo de la ruta, se espera la página nueva y se destapa.
    alCambiarLaRuta.current = (r) => {
      if (fase !== 'cubierto' || rutaAlCubrir === r) return
      reponerLosAlmacenes()
      // El scroll de la ruta en el primer cuadro; después, se espera a que los cuadros vuelvan a ser parejos (la página nueva quieta).
      const t0 = performance.now()
      let antes = t0
      let parejos = 0
      let primero = true
      const esperar = (ahora: number): void => {
        if (primero) {
          primero = false
          scrollDeLaRuta()
        } else parejos = ahora - antes < VELO.cuadroParejoMs ? parejos + 1 : 0
        antes = ahora
        if (puedeDestapar(parejos, TITULOS_EN_CAMINO.urgentes, ahora - t0)) destapar()
        else esperando = requestAnimationFrame(esperar)
      }
      cancelAnimationFrame(esperando)
      esperando = requestAnimationFrame(esperar)
    }
    return () => {
      soltarElPedido()
      alCambiarLaRuta.current = () => undefined
      cancelar()
      cancelAnimationFrame(esperando)
      window.clearTimeout(vence)
    }
  }, [])

  useEffect(() => {
    alCambiarLaRuta.current(ruta)
  }, [ruta])

  return <div ref={capa} aria-hidden="true" data-pieza="velo-de-navegacion" data-fase="quieto" data-cobertura="0" className="bg-fondo pointer-events-none fixed inset-0 z-[var(--z-overlay)]" style={{ maskImage: maskDelVelo('quieto', 0) }} />
}
