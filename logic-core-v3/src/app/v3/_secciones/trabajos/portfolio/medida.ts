/**
 * [B1] LO QUE EL PORTFOLIO MIDE EN EL DOM — la regla de la página, el pin del escenario, el panel que existe sólo pegado y el paso
 * publicado con la compuerta del pin. [B1.2c] Salió de `usePortfolio.ts` (la regla de las 300 líneas), sin cambios.
 */

import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'

import { pasoConElPin } from './estado'
import { PANTALLAS_POR_PASO, pasoEn, pxDelScroll, scrollDelPx, type IndiceDePaso } from './pasos'
import { CLAVE_DEL_VUELO, saltarA } from './saltar'

export interface Medida {
  readonly px: number
  readonly tope: number
  readonly alto: number
}

/** Dónde está la página en la regla de la sección: el tope del panel en el documento y la ventana de ahora. */
export function medir(caja: HTMLElement | null): Medida | null {
  const panel = caja?.closest<HTMLElement>('[data-panel]') ?? null
  const alto = window.innerHeight
  if (panel === null || !(alto > 0)) return null
  const tope = panel.getBoundingClientRect().top + window.scrollY
  return { px: pxDelScroll(window.scrollY, tope, alto), tope, alto }
}

export const escenarioDe = (caja: HTMLElement | null): HTMLElement | null => caja?.querySelector<HTMLElement>('[data-pieza="escenario-del-portfolio"]') ?? null

/** ¿El escenario está pegado (su tope en el del cuadro)? Sin escenario, sí (no hay nada que esperar). */
export function pegado(caja: HTMLElement | null): boolean {
  const escenario = escenarioDe(caja)
  return escenario === null || Math.abs(escenario.getBoundingClientRect().top) <= 1
}

/** [B1.2c] ¿Hay un diálogo abierto (el contacto, el menú)? Su hoja corta el scroll de la página: la rueda no es del Portfolio. */
export const conDialogo = (caja: HTMLElement | null): boolean =>
  caja?.closest('[data-v3]')?.hasAttribute('data-contacto-abierto') === true || getComputedStyle(document.documentElement).overflowY === 'hidden'

/** Publica un paso (si cambió), con el pin: el panel no entra hasta que el escenario está pegado. */
export function publicar(caja: HTMLElement | null, actual: { current: IndiceDePaso }, setPaso: (p: IndiceDePaso) => void, siguiente: IndiceDePaso): void {
  const mostrable = pasoConElPin(siguiente, pegado(caja))
  if (mostrable === actual.current) return
  actual.current = mostrable
  setPaso(mostrable)
}

/**
 * [B1.2b] EL PANEL EXISTE SÓLO EN EL ESCENARIO PEGADO. Un scroll que cruza la cola (o la aproximación) más rápido que la transición
 * del panel despegaba el escenario con el panel a mitad de camino y se lo llevaba en vertical (el banco: 1858 px con la rueda).
 * Despegado, el panel queda afuera y sin transición; pegado, manda su clase otra vez. Imperativo y en el MISMO cuadro en que se
 * mueve el scroll (se llama sincrónico desde el `scroll` nativo y desde el de Lenis): con un estado de React quedaba un cuadro de
 * atraso (el banco: 38 px).
 */
export function cortarElPanel(caja: HTMLElement | null, antes: { current: boolean | null }): void {
  const ahora = pegado(caja)
  if (ahora === antes.current) return
  antes.current = ahora
  const panel = caja?.querySelector<HTMLElement>('[data-pieza="panel-del-portfolio"]') ?? null
  if (panel === null) return
  if (ahora) {
    panel.style.removeProperty('transition')
    panel.style.removeProperty('translate')
  } else {
    panel.style.setProperty('transition', 'none')
    panel.style.setProperty('translate', '100% 0')
  }
}

/**
 * Un salto en vuelo: adónde va (px de la regla) y cómo cancelarlo; `id`, quién es (la llegada sólo suelta el suyo). [B1.2d] `y`: el
 * scroll de destino (px de la página); `marca`: la del viaje en el `userData` de Lenis (`null`: inmediato, o sin Lenis).
 */
export interface Vuelo {
  readonly id: symbol
  readonly destino: number
  readonly y: number
  readonly marca: string | null
  readonly cancelar: () => void
}

/**
 * [B1.2d] UN VUELO CON DUEÑO Y CON FIN (§14, A8). Hasta B1.3 un vuelo se soltaba sólo con su llegada, y Lenis no la avisa si otro
 * movimiento le pisa la animación (la rueda, otro `scrollTo`): el vuelo quedaba colgado y el paso clavado en su destino para siempre.
 * Ahora se suelta también si Lenis ya no lleva su viaje (`vueloPisado`) o si vence (lo que dura más `margenMs`).
 */
export const VUELO = { margenMs: 1000 } as const

/**
 * [B1.2d] El defecto de A8.1, para el control positivo del arnés: el vuelo de B1.3, sin dueño ni fin. Sólo lo pide el arnés antes de
 * cargar (`window.__defectosDelPortfolio`, como el banco con `__entornoDeLaEscena`); nunca la URL ni el producto. [F1] Y el de F1: la rueda
 * de antes, sin la trampa de la entrada y dando pasos mientras el panel todavía no entró (`rueda-en-la-entrada`). [F3] Y la píldora que
 * vuelve a la par de la salida del panel (`pildora-con-el-panel`). [F5] Y las historias de antes: el orden de escritorio, el título sin
 * fundido y con la caída corta (`historias-de-antes`).
 */
export type DefectoDelPortfolio = 'vuelo-sin-dueno' | 'rueda-en-la-entrada' | 'pildora-con-el-panel' | 'historias-de-antes'
export function conElDefecto(d: DefectoDelPortfolio): boolean {
  if (typeof window === 'undefined') return false
  const pedido = (window as Window & { __defectosDelPortfolio?: unknown }).__defectosDelPortfolio
  return typeof pedido === 'string' && pedido.split(',').includes(d)
}

/** [B1.2d] ¿Alguien le pisó el viaje? Con Lenis, la marca de su `userData` ya no es la del vuelo (`saltar.ts`). */
export function vueloPisado(vuelo: Vuelo, lenis: { readonly userData: Readonly<Record<string, unknown>> } | null): boolean {
  if (lenis === null || vuelo.marca === null || conElDefecto('vuelo-sin-dueno')) return false
  return lenis.userData[CLAVE_DEL_VUELO] !== vuelo.marca
}

/** Para la marca de cada vuelo: no se repite en la página. */
let vuelos = 0

/**
 * [B1] Lleva la página a un píxel de la regla en `ms` (0: en silencio) y pone ya el paso de destino; mientras vuela, los bordes del
 * camino no disparan nada y el diagnóstico de la carga (`?diag=carga`) no cuenta como desfasado su paso (`data-en-vuelo`).
 *
 * [B1.2c] El vuelo existe ANTES de lanzar el salto: uno inmediato (el hover, el clic, el tap) llega en el acto y su llegada lo lee. Armado
 * adentro de su propio inicializador, la llegada sincrónica pedía el vuelo antes de que existiera (el arnés: «Cannot access before
 * initialization» en cada hover) y la marca `data-en-vuelo` quedaba puesta para siempre.
 *
 * [B1.2d] Y se suelta de tres maneras, todas por `soltar` (que también borra el vencimiento: ningún temporizador huérfano): la llegada,
 * la cancelación (otro vuelo, o `vueloPisado` desde la lectura del scroll) y el vencimiento.
 */
export function volarAlPx(
  v: { readonly caja: { readonly current: HTMLElement | null }; readonly enVuelo: { current: Vuelo | null }; readonly actual: { current: IndiceDePaso }; readonly setPaso: (p: IndiceDePaso) => void },
  px: number,
  ms: number,
  scrollExtra: number,
): void {
  const m = medir(v.caja.current)
  if (m === null) return
  v.enVuelo.current?.cancelar()
  const caja = v.caja.current
  const y = Math.round(scrollDelPx(px, m.tope, m.alto) + scrollExtra)
  const id = Symbol('vuelo')
  vuelos += 1
  const marca = ms > 0 && LENIS_DEL_SITIO.instancia !== null ? `portfolio-${String(vuelos)}` : null
  let vence = 0
  const soltar = (): void => {
    window.clearTimeout(vence)
    if (v.enVuelo.current?.id !== id) return
    v.enVuelo.current = null
    caja?.removeAttribute('data-en-vuelo')
  }
  caja?.setAttribute('data-en-vuelo', 'si')
  v.enVuelo.current = { id, destino: px, y, marca, cancelar: soltar }
  const detener = saltarA(y, ms, soltar, marca)
  if (v.enVuelo.current?.id === id) {
    if (!conElDefecto('vuelo-sin-dueno')) vence = window.setTimeout(soltar, ms + VUELO.margenMs)
    v.enVuelo.current = {
      id,
      destino: px,
      y,
      marca,
      cancelar: () => {
        detener()
        soltar()
      },
    }
  }
  // El destino, ya: la tira cambia en este cuadro y la página la sigue.
  publicar(caja, v.actual, v.setPaso, pasoEn(px, PANTALLAS_POR_PASO))
}
