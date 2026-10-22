'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

import { calentarElDestino } from '../../_componentes/navegacion/calentar'
import { hayBanco } from '../../_lib/escena/entorno'
import { escenaDeLaRutaLista } from '../../_lib/escena/ruta/listaDeLaRuta'
import { DIA_DEL_FINAL, NOCHE_DISPARADA } from '../../_lib/escena/nocheDisparada'
import { VUELTA_AL_HOME, claveDeLaEntrada, devolverLosAlmacenes, posicionGuardadaDelHome, type PosicionDelHome } from '../../_lib/escena/ruta/posicionDelHome'
import { sonar } from '../../_lib/sonido/bus'
import { EVENTOS_DEL_VELO, RUTA_DEL_HOME, VELO_EN_CURSO, atenderElVelo, conElMontajeLiviano, conLaBandaCorta, cubrirConElVelo, viaDelVelo } from '../../_lib/veloDeNavegacion'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'

import { llevarElScrollA, reponerLosAlmacenes, scrollDeLaRuta } from './alCambiarDeRuta'
import { tonoDeLoQueTapa } from './tonoDeLoQueTapa'
import { CURVA_DEL_VELO, CURVA_DEL_VELO_CSS, colorDelVelo, coberturaDelVelo, degradeDelVelo, frenteDelVelo, geometriaDeLaBanda, puedeDestapar, siguienteFaseDelVelo, tiemposDelVelo, transformadaDelVelo, type EventoDelVelo, type FaseDelVelo } from './velo'

/** [T0] Lo que tardan cubrir y destapar con la vía del velo de ahora (`viaDelVelo`: la banda corta o la de siempre). */
const tiempos = (): ReturnType<typeof tiemposDelVelo> => tiemposDelVelo(conLaBandaCorta(viaDelVelo()))

/** Si la ruta no cambia después de cubrir (un error, un enlace a la misma), se destapa igual a los `VENCE_MS`. */
const VENCE_MS = 4000

/** [B12a.7] El defecto, para el control positivo del arnés (`window.__defectosDelVelo = 'sin-vuelta'`: la flecha lleva arriba); nunca la URL. */
const sinVuelta = (): boolean => (window as Window & { __defectosDelVelo?: unknown }).__defectosDelVelo === 'sin-vuelta'

/** [B12a.7] Lo que lee el banco de la vuelta: los almacenes, la posición guardada y si hay una vuelta en curso. */
type VentanaDelBanco = Window & { __vueltaDelBanco?: () => { readonly noche: number; readonly dia: boolean; readonly guardada: PosicionDelHome | null; readonly enCurso: boolean }; __veloDelBanco?: { readonly cubrir: () => Promise<void> } }

const COLOR = { tinta: 'var(--color-tinta)', papel: 'var(--color-fondo)' } as const

/**
 * [B12a.6] EL VELO DE LA NAVEGACIÓN — en el layout, encima de todo (la capa del overlay), sin recibir el puntero en reposo. `EnlaceDeRuta`
 * lo pide antes de navegar (`cubrirConElVelo`): cubre con el frente de la banda (`velo.ts`), la ruta cambia debajo, se reponen los
 * almacenes y el scroll (`alCambiarDeRuta.ts`) y destapa con la cola. Suena suave al irse y al llegar (con el sonido apagado, nada). Con
 * movimiento reducido, un corte. Lo que el banco lee: la fase y la cobertura en el DOM (`data-fase`, `data-cobertura`).
 *
 * [B12a.7] LA FLECHA DEL NAVEGADOR cambia la ruta sin pedir nada: el velo cubre de una (el corte). Si vuelve al home, trae la posición que
 * el home guardó al irse (`GuardaDeLaPosicionDelHome`): debajo del velo se devuelven la noche y el día del final, el scroll va ahí (y
 * vuelve a ir mientras el documento del home no alcanza) y recién se destapa.
 *
 * [B12a.8] UNA PASADA CONTINUA, SIN PANTALLA EN BLANCO:
 * · la banda es un elemento con su degradé quieto, movido con `transform` por una animación del compositor (P-H32): sigue pareja aunque
 *   el hilo principal esté montando la página nueva;
 * · su color contrasta con lo que tapa (`tonoDeLoQueTapa`): sobre papel la tinta, sobre la escena de noche el papel;
 * · destapa apenas la página nueva tiene su primer cuadro estable (montada, con su scroll y dos cuadros pintados), no 20 cuadros y todos los títulos: lo
 *   que la página arme después no traba la banda. Los 3,5 s quedan de techo;
 * · la vuelta al home trae la posición de SU entrada del historial (`claveDeLaEntrada`), no la última;
 * · al volver una página del bfcache (P-H35, `pageshow` con `persisted`), el velo queda quieto: la navegación que lo puso ya terminó;
 * · pasa DEBAJO del chrome (la píldora, el parlante, Contacto y Login: el layout los deja en su lugar) y avisa cuándo cubre y cuándo la
 *   página nueva tiene su scroll (`EVENTOS_DEL_VELO`): la píldora se desliza a su lugar del destino mientras el velo pasa (T2).
 */
export function VeloDeNavegacion(): React.JSX.Element {
  const capa = useRef<HTMLDivElement>(null)
  const banda = useRef<HTMLDivElement>(null)
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
    const b = banda.current
    if (el === null || b === null) return undefined
    let fase: FaseDelVelo = 'quieto'
    let geometria = geometriaDeLaBanda(window.innerWidth, window.innerHeight)
    let color: string = COLOR.tinta
    let rutaAlCubrir: string | null = null
    let animacion: Animation | null = null
    let siguiendo = 0
    let vence = 0
    let esperando = 0
    let vuelta: PosicionDelHome | null = null
    const medir = (): void => {
      geometria = geometriaDeLaBanda(window.innerWidth, window.innerHeight)
      b.style.width = `${geometria.largo.toFixed(1)}px`
      b.style.height = `${geometria.espesor.toFixed(1)}px`
      b.style.backgroundImage = degradeDelVelo(color, geometria)
    }
    const colorear = (): void => {
      color = COLOR[colorDelVelo(tonoDeLoQueTapa())]
      el.setAttribute('data-color', color === COLOR.tinta ? 'tinta' : 'papel')
      b.style.backgroundImage = degradeDelVelo(color, geometria)
    }
    /** Lo que lee el banco, y si recibe el puntero (tapado no se toca la página de abajo). */
    const marcar = (f: FaseDelVelo, t: number): void => {
      el.setAttribute('data-fase', f)
      el.setAttribute('data-cobertura', coberturaDelVelo(f, t).toFixed(3))
      el.style.pointerEvents = f === 'quieto' ? 'none' : 'auto'
      // [B12a.8] (4) Las obras del home que no se ven esperan al velo quieto (`VELO_EN_CURSO`).
      const enCurso = VELO_EN_CURSO.activo
      VELO_EN_CURSO.activo = f !== 'quieto'
      if (enCurso && f === 'quieto') window.dispatchEvent(new Event(EVENTOS_DEL_VELO.quieto))
    }
    const pintar = (f: FaseDelVelo, t: number): void => {
      animacion?.cancel()
      animacion = null
      cancelAnimationFrame(siguiendo)
      b.style.transform = transformadaDelVelo(frenteDelVelo(f, t, geometria), geometria)
      b.style.visibility = f === 'quieto' ? 'hidden' : 'visible'
      marcar(f, t)
    }
    const pasar = (e: EventoDelVelo): void => {
      fase = siguienteFaseDelVelo(fase, e)
    }
    /** La banda de una punta a la otra de su fase, en el compositor; el banco lee su avance en cada cuadro. */
    const animar = (f: FaseDelVelo, ms: number, alTerminar: () => void): void => {
      animacion?.cancel()
      cancelAnimationFrame(siguiendo)
      if (reducidoAhora.current || ms <= 0) {
        pintar(f, 1)
        alTerminar()
        return
      }
      b.style.visibility = 'visible'
      const desde = transformadaDelVelo(frenteDelVelo(f, 0, geometria), geometria)
      const hasta = transformadaDelVelo(frenteDelVelo(f, 1, geometria), geometria)
      b.style.transform = desde
      const a = b.animate([{ transform: desde }, { transform: hasta }], { duration: ms, easing: CURVA_DEL_VELO_CSS, fill: 'forwards' })
      animacion = a
      const seguir = (): void => {
        const t = Math.min(1, Number(a.currentTime ?? 0) / ms)
        marcar(f, CURVA_DEL_VELO(t))
        if (animacion === a && t < 1) siguiendo = requestAnimationFrame(seguir)
      }
      marcar(f, 0)
      siguiendo = requestAnimationFrame(seguir)
      a.onfinish = () => {
        if (animacion !== a) return
        b.style.transform = hasta
        a.cancel()
        animacion = null
        alTerminar()
      }
    }
    const destapar = (): void => {
      if (fase !== 'cubierto') return
      window.clearTimeout(vence)
      VUELTA_AL_HOME.enCurso = false
      pasar('llego')
      window.dispatchEvent(new Event(EVENTOS_DEL_VELO.destapa))
      sonar('abre')
      animar('destapando', tiempos().destaparMs, () => {
        pasar('destapo')
        pintar('quieto', 0)
      })
    }
    /** [P-H35] Una página que vuelve del bfcache: la navegación que puso el velo ya terminó (o se fue a otro documento): quieto. */
    const alVolverDelBfcache = (e: PageTransitionEvent): void => {
      if (!e.persisted) return
      window.clearTimeout(vence)
      cancelAnimationFrame(esperando)
      VUELTA_AL_HOME.enCurso = false
      vuelta = null
      fase = 'quieto'
      pintar('quieto', 0)
    }
    medir()
    pintar('quieto', 0)
    const soltarElPedido = atenderElVelo((p) => {
      if (fase === 'cubierto') {
        p.cubierto()
        return
      }
      colorear()
      rutaAlCubrir = window.location.pathname
      window.dispatchEvent(new Event(EVENTOS_DEL_VELO.cubre))
      pasar('cubrir')
      sonar('cierra')
      animar('cubriendo', tiempos().cubrirMs, () => {
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
      cancelAnimationFrame(esperando)
      colorear()
      window.dispatchEvent(new Event(EVENTOS_DEL_VELO.cubre))
      rutaAlCubrir = rutaDeAhora.current
      // [B12a.8] La posición de ESTA entrada del historial (la de la última vez que se estuvo en ella), no la última que se guardó.
      vuelta = destino === RUTA_DEL_HOME && !sinVuelta() ? posicionGuardadaDelHome(claveDeLaEntrada()) : null
      VUELTA_AL_HOME.enCurso = vuelta !== null
      pasar('corte')
      pintar('cubierto', 1)
      window.clearTimeout(vence)
      vence = window.setTimeout(destapar, VENCE_MS)
    }
    window.addEventListener('popstate', alUsarLaFlecha)
    window.addEventListener('pageshow', alVolverDelBfcache)
    window.addEventListener('resize', medir)
    const ventana = window as VentanaDelBanco
    if (hayBanco()) ventana.__vueltaDelBanco = () => ({ noche: NOCHE_DISPARADA.cantidad, dia: DIA_DEL_FINAL.activo, guardada: posicionGuardadaDelHome(claveDeLaEntrada()), enCurso: VUELTA_AL_HOME.enCurso })
    // [B12a.8] Sólo con banco: cubrir como lo pide un enlace (en esta rama el home no tiene un enlace a una página: el arnés cubre y navega con el router de next).
    if (hayBanco()) ventana.__veloDelBanco = { cubrir: () => cubrirConElVelo() }
    // La ruta cambió con el velo puesto: se repone lo de la ruta y se destapa con el primer cuadro estable de la página nueva.
    alCambiarLaRuta.current = (r) => {
      if (fase !== 'cubierto' || rutaAlCubrir === r) return
      const guardada = r === RUTA_DEL_HOME ? vuelta : null
      vuelta = null
      reponerLosAlmacenes()
      if (guardada !== null) devolverLosAlmacenes(guardada)
      // El scroll de la ruta (o el que el home dejó) en el primer cuadro, antes de que la gota observe por primera vez: así repone su
      // noche sin barrido. Después, el primer cuadro estable: la página ya montada (estamos después de su commit), su scroll en su lugar y
      // sus cuadros pintados.
      const t0 = performance.now()
      let pintados = 0
      let primero = true
      const esperar = (ahora: number): void => {
        if (primero) {
          primero = false
          if (guardada === null) scrollDeLaRuta()
          else llevarElScrollA(guardada.y)
          window.dispatchEvent(new Event(EVENTOS_DEL_VELO.repuso))
        } else {
          pintados += 1
          // Si el documento del home todavía no alcanzaba (lo que mide al montarse), se vuelve a llevar; mientras, no está quieto.
          if (guardada !== null && Math.abs(window.scrollY - guardada.y) > 1) {
            llevarElScrollA(guardada.y)
            pintados = 0
          }
        }
        // [T0] 11 · 1 · y con la escena de la ruta lista: la variante de la página ya dibujó (su noche y su acento desde el primer cuadro destapado).
        if (puedeDestapar(pintados, escenaDeLaRutaLista(), ahora - t0)) destapar()
        else esperando = requestAnimationFrame(esperar)
      }
      cancelAnimationFrame(esperando)
      esperando = requestAnimationFrame(esperar)
    }
    return () => {
      soltarElPedido()
      window.removeEventListener('popstate', alUsarLaFlecha)
      window.removeEventListener('pageshow', alVolverDelBfcache)
      window.removeEventListener('resize', medir)
      delete ventana.__vueltaDelBanco
      delete ventana.__veloDelBanco
      VUELTA_AL_HOME.enCurso = false
      alCambiarLaRuta.current = () => undefined
      animacion?.cancel()
      cancelAnimationFrame(siguiendo)
      cancelAnimationFrame(esperando)
      window.clearTimeout(vence)
    }
  }, [])

  useEffect(() => {
    alCambiarLaRuta.current(ruta)
    rutaDeAhora.current = ruta
  }, [ruta])

  // [T0] 11 · 3 · la vía `montaje`: en una página, con el hilo libre, se pide ya la coreografía animada del home (`calentarElDestino`):
  // la vuelta (por un enlace o por la flecha) lo monta una sola vez, sin el árbol quieto que después se rehacía entero.
  useEffect(() => {
    if (ruta === RUTA_DEL_HOME || !conElMontajeLiviano(viaDelVelo())) return undefined
    const pedir = (): void => calentarElDestino(RUTA_DEL_HOME)
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(pedir, { timeout: 4000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = window.setTimeout(pedir, 2000)
    return () => window.clearTimeout(id)
  }, [ruta])

  return (
    <div ref={capa} aria-hidden="true" data-pieza="velo-de-navegacion" data-fase="quieto" data-cobertura="0" className="pointer-events-none fixed inset-0 z-[calc(var(--z-cabecera)-1)] overflow-hidden">
      <div ref={banda} data-parte="banda" className="invisible absolute top-1/2 left-1/2 will-change-transform" />
    </div>
  )
}
