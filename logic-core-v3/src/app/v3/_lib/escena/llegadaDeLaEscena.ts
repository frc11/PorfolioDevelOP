import { SECCIONES } from '../secciones'
import { SUPERFICIES } from '../superficies'
import { NOCHE_DISPARADA } from './nocheDisparada'
import { PORTFOLIO_EN_LA_ESCENA, objetivoDeLaPose } from './portfolioEnLaEscena'
import { ORBIT_TARGET_Y } from './probeScene'
import { CAMARA_DEL_CUADRO, conElDefectoDeLaLlegada, type PoseDeCinco } from './viaje'

/**
 * [C2-21] LA LLEGADA DE LA ESCENA — en un viaje del menú, el título del destino espera a que la escena LLEGUE.
 *
 * El viaje (`useDeslizamientoDelCta`) apaga el `<main>` con el velo, mueve el scroll y, cuando el scroll llega, devolvía el `<main>` y
 * pedía la llegada del título en el acto. Pero la escena no llega con el scroll: la cámara lo persigue con su inercia, el Portfolio suelta
 * su pose con su propio reloj y la noche cambia con el reloj del barrido. Desde el Portfolio eso se veía como «la cámara no se mueve y el
 * cartel llega antes». Ahora, llegado el scroll, el velo y el título esperan a que:
 *
 *   · la cámara viva esté en la pose que persigue (a menos del 1 %: la distancia entre las dos posiciones contra la distancia al logo, y
 *     el encuadre en las unidades del rig);
 *   · el peso del Portfolio esté en su punta (0 afuera, 1 adentro: ni la pose ni el oscurecido a mitad de camino);
 *   · la noche esté en una punta (ningún barrido a medias).
 *
 * Nunca se queda esperando: con la pestaña oculta, sin cuadros de la escena (suspendida o caída) o pasado el techo, sigue. Y a un destino
 * de papel opaco (la sala no se ve) no espera.
 */

/** Cuánto se aparta la cámara de su pose, como fracción (1 % = 0,01). */
export const TOLERANCIA_DE_LA_LLEGADA = 0.01

/** El techo de la espera (ms): la pose del Portfolio (0,7 s) más el asiento de la cámara, con margen. */
export const ESPERA_MAXIMA_DE_LA_LLEGADA_MS = 1500

/** Sin un cuadro de la escena en este tiempo (ms), la escena no dibuja: no hay nada que esperar. */
export const SIN_CUADROS_MS = 250

/** La noche en una punta: a lo sumo esto de 0 o de 1. */
const PUNTA_DE_LA_NOCHE = 0.01

const posicion = (p: Readonly<PoseDeCinco>): readonly [number, number, number] => {
  const a = (p.angleDeg * Math.PI) / 180
  return [Math.sin(a) * p.distance, p.height, Math.cos(a) * p.distance]
}

/** El desvío entre dos poses: la distancia entre las dos cámaras contra la distancia de la segunda al logo, o el encuadre. */
export function desvioDeLaPose(viva: Readonly<PoseDeCinco>, objetivo: Readonly<PoseDeCinco>): number {
  const [ax, ay, az] = posicion(viva)
  const [bx, by, bz] = posicion(objetivo)
  const escala = Math.max(1e-3, Math.hypot(objetivo.distance, objetivo.height - ORBIT_TARGET_Y))
  return Math.max(Math.hypot(ax - bx, ay - by, az - bz) / escala, Math.abs(viva.frameX - objetivo.frameX), Math.abs(viva.frameY - objetivo.frameY))
}

/** Lo que mira la llegada en un momento (puro: lo prueba s78-c21). */
export interface EstadoDeLaLlegada {
  readonly viva: Readonly<PoseDeCinco>
  readonly objetivo: Readonly<PoseDeCinco>
  /** La hora del último cuadro de la escena y la de ahora (ms). */
  readonly cuadroMs: number
  readonly ahoraMs: number
  readonly pesoDelPortfolio: number
  readonly portfolioAdentro: boolean
  readonly noche: number
}

export function escenaLlegada(e: EstadoDeLaLlegada): boolean {
  if (e.ahoraMs - e.cuadroMs > SIN_CUADROS_MS) return true
  const camara = desvioDeLaPose(e.viva, e.objetivo) <= TOLERANCIA_DE_LA_LLEGADA
  const portfolio = e.pesoDelPortfolio === (e.portfolioAdentro ? 1 : 0)
  const noche = Math.min(e.noche, 1 - e.noche) <= PUNTA_DE_LA_NOCHE
  return camara && portfolio && noche
}

const estadoDeAhora = (ahoraMs: number): EstadoDeLaLlegada => ({
  viva: CAMARA_DEL_CUADRO.viva,
  objetivo: CAMARA_DEL_CUADRO.objetivo,
  cuadroMs: CAMARA_DEL_CUADRO.cuando,
  ahoraMs,
  pesoDelPortfolio: PORTFOLIO_EN_LA_ESCENA.peso,
  // [C2-41e] Adónde va el peso de la pose: el panel adentro o Demos a la vista.
  portfolioAdentro: objetivoDeLaPose(PORTFOLIO_EN_LA_ESCENA) === 1,
  noche: NOCHE_DISPARADA.cantidad,
})

/** ¿La sala se ve en esta sección? (una de papel opaco la tapa entera: ahí no hay escena que esperar). */
const SALA_EN = new Map(SECCIONES.map((s) => [s.id, SUPERFICIES[s.superficie].dejaVerElCanvas]))
export const seVeLaSalaEn = (destino: string): boolean => SALA_EN.get(destino) ?? true

/**
 * Espera la llegada de la escena al destino y llama `alLlegar` (una vez). Mira en cada cuadro; un reloj de pared la cubre con la pestaña
 * oculta (sin cuadros). Devuelve cómo cancelarla.
 */
export function esperarLaLlegada(destino: string, alLlegar: () => void): () => void {
  if (conElDefectoDeLaLlegada('sin-espera') || !seVeLaSalaEn(destino)) {
    alLlegar()
    return () => undefined
  }
  const desde = performance.now()
  let hecho = false
  let cuadro = 0
  let techo = 0
  const terminar = (): void => {
    if (hecho) return
    hecho = true
    cancelAnimationFrame(cuadro)
    window.clearTimeout(techo)
    alLlegar()
  }
  const mirar = (): void => {
    const ahora = performance.now()
    if (document.visibilityState !== 'visible' || ahora - desde >= ESPERA_MAXIMA_DE_LA_LLEGADA_MS || escenaLlegada(estadoDeAhora(ahora))) terminar()
    else cuadro = requestAnimationFrame(mirar)
  }
  techo = window.setTimeout(terminar, ESPERA_MAXIMA_DE_LA_LLEGADA_MS + 100)
  cuadro = requestAnimationFrame(mirar)
  return () => {
    hecho = true
    cancelAnimationFrame(cuadro)
    window.clearTimeout(techo)
  }
}
