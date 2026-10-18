/**
 * [B1] LO QUE EL PORTFOLIO MIDE EN EL DOM — la regla de la página, el pin del escenario, el panel que existe sólo pegado y el paso
 * publicado con la compuerta del pin. [B1.2c] Salió de `usePortfolio.ts` (la regla de las 300 líneas), sin cambios.
 */

import { pasoConElPin } from './estado'
import { PANTALLAS_POR_PASO, pasoEn, pxDelScroll, scrollDelPx, type IndiceDePaso } from './pasos'
import { saltarA } from './saltar'

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

/** Un salto en vuelo: adónde va (px de la regla) y cómo cancelarlo; `id`, quién es (la llegada sólo suelta el suyo). */
export interface Vuelo {
  readonly id: symbol
  readonly destino: number
  readonly cancelar: () => void
}

/**
 * [B1] Lleva la página a un píxel de la regla en `ms` (0: en silencio) y pone ya el paso de destino; mientras vuela, los bordes del
 * camino no disparan nada y el diagnóstico de la carga (`?diag=carga`) no cuenta como desfasado su paso (`data-en-vuelo`).
 *
 * [B1.2c] El vuelo existe ANTES de lanzar el salto: uno inmediato (el hover, el clic, el tap) llega en el acto y su llegada lo lee. Armado
 * adentro de su propio inicializador, la llegada sincrónica pedía el vuelo antes de que existiera (el arnés: «Cannot access before
 * initialization» en cada hover) y la marca `data-en-vuelo` quedaba puesta para siempre.
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
  v.caja.current?.setAttribute('data-en-vuelo', 'si')
  const id = Symbol('vuelo')
  v.enVuelo.current = { id, destino: px, cancelar: () => undefined }
  const cancelar = saltarA(scrollDelPx(px, m.tope, m.alto) + scrollExtra, ms, () => {
    if (v.enVuelo.current?.id !== id) return
    v.enVuelo.current = null
    v.caja.current?.removeAttribute('data-en-vuelo')
  })
  if (v.enVuelo.current?.id === id) v.enVuelo.current = { id, destino: px, cancelar }
  // El destino, ya: la tira cambia en este cuadro y la página la sigue.
  publicar(v.caja.current, v.actual, v.setPaso, pasoEn(px, PANTALLAS_POR_PASO))
}
