import type { MouseEvent } from 'react'

import { hayPrimerCuadro } from '../../_lib/carga'
import { CONSULTA_MENOS_MOVIMIENTO } from '../../_lib/cursor'
import { hayBanco } from '../../_lib/escena/entorno'
import { escenaDeLaRutaLista } from '../../_lib/escena/ruta/listaDeLaRuta'
import { AVANCE_DE_LA_INTRO } from '../../_lib/escena/ruta/pistaDeLaIntro'
import { apilarElPreset, type PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import { SONIDOS_DEL_VIAJE, TIEMPOS_DEL_VIAJE, arrancarElViaje, camaraDelViaje, faseDelViaje, llegarConElViaje, nocheDelViaje, prepararElViaje, terminarElViajeAlServicio, type FaseDelViaje } from '../../_lib/escena/ruta/viajeDelServicio'
import { retenerLosGestos } from '../../_lib/gestosDelScroll'
import { sonar } from '../../_lib/sonido/bus'
import { EVENTOS_DEL_VELO, RUTA_DEL_HOME, VELO_EN_CURSO, hayVelo, pedirElViaje } from '../../_lib/veloDeNavegacion'

/**
 * [B12b] EL VIAJE DESDE EL CTA DE UN SERVICIO DEL HOME HASTA SU PÁGINA — el DOM del viaje (la escena lo lee de
 * `_lib/escena/ruta/viajeDelServicio.ts`; el velo lo atiende como un pedido que cubre con la escena: `_chrome/velo/VeloDeNavegacion.tsx`).
 * Plan, log y qué mirar: `docs/rediseno/SPRINT-B12B-NOCTURNO.md`.
 *
 *   1. El CTA (`EnlaceDelServicio`, con `data-viaje-del-servicio`) pide el viaje en su `onClick`, que `EnlaceDeRuta` corre antes de cubrir:
 *      el pedido viaja con su `cubrirConElVelo()` (`pedirElViaje`). Junto, `EnlaceDeRuta` pide la salida de la variante (la del home: ninguna).
 *   2. La escena se entera de adónde va (el preset de la página, apilado en el home: su pista, su noche, su acento y su variante, que la ranura
 *      monta tapada) y despierta detrás del papel, con la cámara en la partida y de día. Se espera a que dibuje con la variante del destino
 *      (a lo sumo `esperaMaximaMs`; si no, la banda de siempre).
 *   3. Arranca el reloj: suena la salida, el papel (el `<main>` del home, recortado a lo que se ve) se levanta, los nanobots se apagan,
 *      anochece y la cámara baja a la composición inicial de la página (con el logo en el hueco que mide `HuecoDelViaje`).
 *   4. Llegó: el velo navega (la navegación cliente, el `<Link>`), la página nueva entra tapada y aparece encima de la escena con el sonido de
 *      la llegada. Con el velo quieto, el preset del viaje se va (queda el de la página) y se sueltan los gestos.
 * Con menos movimiento, sin la escena, fuera del home o con `?viaje=velo`: el velo de siempre.
 */

/** `?viaje=escena|velo` (se lee en el cliente): para comparar con el velo de siempre. Sin la bandera, el viaje. */
export type ModoDelViaje = 'escena' | 'velo'
export const VIAJE_POR_DEFECTO: ModoDelViaje = 'escena'
export function modoDelViaje(busqueda: string): ModoDelViaje {
  const v = new URLSearchParams(busqueda).get('viaje')
  return v === 'escena' || v === 'velo' ? v : VIAJE_POR_DEFECTO
}

/** La escena del home (su envoltorio publica su fase) y los nanobots de la sección (los dos lienzos: el escenario y las pantallas sueltas). */
const SELECTOR_DE_LA_ESCENA = '[data-escena-fase]'
const SELECTOR_DE_LOS_NANOBOTS = '[data-pieza="nanobots-de-servicios"], [data-pieza="nanobots-quietos"]'
/** La curva del papel que se levanta: arranca despacio y sale de cuadro sin frenar. */
const CURVA_DEL_PAPEL = 'cubic-bezier(0.55, 0, 0.45, 1)'

/** Los defectos del banco (`window.__defectosDelViaje`), nunca la URL: `sin-hueco` (`HuecoDelViaje`), `sin-tapar` (`paginaTapada.ts`). */
export const defectoDelViaje = (): string => {
  const d = typeof window === 'undefined' ? undefined : (window as Window & { __defectosDelViaje?: unknown }).__defectosDelViaje
  return typeof d === 'string' ? d : ''
}

/** Lo que lee el banco (`scripts-carga/viaje.ts`): la fase, el reloj de la cámara y de la noche, y los sonidos pedidos. */
const SONIDOS_PEDIDOS: { cual: 'sale' | 'llega'; t: number }[] = []
type VentanaDelBanco = Window & { __viajeDelBanco?: () => { readonly fase: FaseDelViaje; readonly camara: number; readonly noche: number; readonly sonidos: readonly { cual: 'sale' | 'llega'; t: number }[] } }
if (typeof window !== 'undefined' && hayBanco()) {
  ;(window as VentanaDelBanco).__viajeDelBanco = () => ({ fase: faseDelViaje(), camara: camaraDelViaje(performance.now()), noche: nocheDelViaje(performance.now()), sonidos: [...SONIDOS_PEDIDOS] })
}

/** Uno suave al salir y otro al llegar. Con el sonido apagado el bus no tiene motor: no suena (respeta el mute). */
export function sonarElViaje(cual: 'sale' | 'llega'): void {
  sonar(SONIDOS_DEL_VIAJE[cual])
  if (hayBanco()) SONIDOS_PEDIDOS.push({ cual, t: performance.timeOrigin + performance.now() })
}

/** ¿Se puede viajar desde este enlace? En el home, con la escena dibujada, el velo montado, con movimiento y sin otra navegación en curso. */
export function puedeViajar(enlace: Element): boolean {
  if (modoDelViaje(window.location.search) !== 'escena') return false
  if (window.location.pathname !== RUTA_DEL_HOME || !hayVelo() || VELO_EN_CURSO.activo || faseDelViaje() !== 'quieto') return false
  if (document.visibilityState !== 'visible' || !(window.innerHeight > 0) || window.matchMedia(CONSULTA_MENOS_MOVIMIENTO).matches) return false
  return hayPrimerCuadro() && document.querySelector(SELECTOR_DE_LA_ESCENA) !== null && enlace.closest('main') !== null
}

/** El `onClick` del CTA de un servicio: con un clic simple que el enlace va a cubrir, pide el viaje al preset de la página de destino. */
export function pedirElViajeAlServicio(e: MouseEvent<HTMLAnchorElement>, destino: PresetDeLaEscena): void {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const enlace = e.currentTarget
  if (!puedeViajar(enlace)) return
  pedirElViaje(() => viajar(enlace, destino))
}

const escenaCorriendo = (): boolean => document.querySelector(SELECTOR_DE_LA_ESCENA)?.getAttribute('data-escena-fase') === 'corriendo'

function viajar(enlace: HTMLElement, destino: PresetDeLaEscena): Promise<'escena' | 'banda'> {
  const papel = enlace.closest('main')
  if (!(papel instanceof HTMLElement)) return Promise.resolve('banda')
  AVANCE_DE_LA_INTRO.current = 0
  const sacarElPreset = apilarElPreset(destino)
  const soltarLosGestos = retenerLosGestos(() => true)
  prepararElViaje()
  const animaciones: Animation[] = []
  let soltado = false
  /** Todo como estaba: el papel en su lugar, los nanobots, la escena del home (y los gestos). */
  const deshacer = (): void => {
    if (soltado) return
    soltado = true
    for (const a of animaciones) a.cancel()
    papel.style.clipPath = ''
    sacarElPreset()
    terminarElViajeAlServicio()
    soltarLosGestos()
  }
  /** Llegó a la página: queda el preset de la página (el mismo) y se sueltan los gestos. */
  const soltar = (): void => {
    if (soltado) return
    soltado = true
    sacarElPreset()
    terminarElViajeAlServicio()
    soltarLosGestos()
  }
  return new Promise((resolver) => {
    const t0 = performance.now()
    let listos = 0
    const llegar = (desde: number): void => {
      const seguir = (ahora: number): void => {
        if (soltado) return
        if (ahora - desde < TIEMPOS_DEL_VIAJE.camaraMs) {
          requestAnimationFrame(seguir)
          return
        }
        llegarConElViaje()
        // Con el velo quieto: si navegó, el viaje terminó; si no (la ruta no cambió), el papel vuelve.
        window.addEventListener(EVENTOS_DEL_VELO.quieto, () => (window.location.pathname === RUTA_DEL_HOME ? deshacer() : soltar()), { once: true })
        resolver('escena')
      }
      requestAnimationFrame(seguir)
    }
    const levantar = (ahora: number): void => {
      arrancarElViaje(ahora)
      sonarElViaje('sale')
      const r = papel.getBoundingClientRect()
      const alto = window.innerHeight
      // El papel es lo que se ve del `<main>`: recortado al cuadro, sube entero (lo de más abajo no entra al cuadro).
      papel.style.clipPath = `inset(${Math.max(0, -r.top).toFixed(1)}px 0 ${Math.max(0, r.bottom - alto).toFixed(1)}px 0)`
      animaciones.push(papel.animate([{ transform: 'translateY(0px)' }, { transform: `translateY(${String(-alto)}px)` }], { duration: TIEMPOS_DEL_VIAJE.levantaMs, easing: CURVA_DEL_PAPEL, fill: 'forwards' }))
      for (const n of papel.querySelectorAll<HTMLElement>(SELECTOR_DE_LOS_NANOBOTS)) {
        animaciones.push(n.animate([{ opacity: 1 }, { opacity: 0 }], { duration: TIEMPOS_DEL_VIAJE.apaganMs, easing: 'ease-out', fill: 'forwards' }))
      }
      llegar(ahora)
    }
    const esperar = (ahora: number): void => {
      if (soltado) return
      listos = escenaCorriendo() && escenaDeLaRutaLista() ? listos + 1 : 0
      if (listos >= TIEMPOS_DEL_VIAJE.cuadrosDeAsiento) {
        levantar(ahora)
        return
      }
      if (ahora - t0 > TIEMPOS_DEL_VIAJE.esperaMaximaMs) {
        deshacer()
        resolver('banda')
        return
      }
      requestAnimationFrame(esperar)
    }
    requestAnimationFrame(esperar)
  })
}
