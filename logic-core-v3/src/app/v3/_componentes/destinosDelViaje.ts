import { posicionDeAncla, type ParDeAnclas } from '../_lib/motion/anclas'
import {
  ANCLA_DE_LA_LLEGADA,
  ANCLA_DE_LA_MASCARA,
  ANCLA_DE_LA_VENTANA_VISIBLE,
  ANCLA_DEL_TRAZO,
} from '../_secciones/_contrato/bloqueAnimado'
import { MARCA_COREOGRAFIA_DEL_HOME } from '../_secciones/_contrato/marcaCoreografia'
import { VENTANA_DE_LA_SUBIDA_DE_LA_FRASE } from '../_secciones/por-que-develop/geometria'
import { destinoDelAncla } from './viajeSinLenis'

/**
 * A DÓNDE LLEVA CADA VIAJE — un nudo de la coreografía de la sección, no un píxel. **[VIAJES]**
 *
 * Cada destino se calcula en el click, sobre el documento de ese instante y con las mismas
 * anclas con nombre que usa la coreografía (`bloqueAnimado.ts`, `anclas.ts`), así que vale en
 * cualquier ancho y se mueve solo si la sección cambia:
 *
 *   · **Quiénes somos** — la pose de reposo: el primer píxel en que terminó de llegar TODO lo de
 *     la primera pantalla (título, subrayado y tachado, ≠ y cuerpo), que es el fin de la ventana
 *     más tardía de sus bloques; salvo que ahí el título ya esté debajo de la barra (1024 × 768:
 *     esa pose no entra en el cuadro), y entonces el último píxel con el título despejado.
 *   · **Trabajos** — el instante en que «Portfolio» terminó de subir a su lugar: el más tarde de
 *     dos, el fin de su máscara y el pin del cartel (hasta ahí el cartel sube con la página). La
 *     huida empieza una pantalla después.
 *   · **Servicios** — un píxel antes de que el 00 pase al 01: el 01 arranca con el primer píxel
 *     del pin (`fronterasDeEstado` da 0 en su primera frontera), así que el destino es el pin,
 *     hacia abajo.
 *   · **Por qué develOP** — la frase ya subida a su lugar y ningún valor en camino: el fin de
 *     `VENTANA_DE_LA_SUBIDA_DE_LA_FRASE`, que es por construcción el arranque del primer valor.
 *     Abajo de 1024 la sección es una lista sin pin y ese momento no existe: el primer valor
 *     arranca 112 px antes de que la frase termine de llegar, y ese punto deja la frase al pie
 *     del cuadro con Tu panel encima. Ahí el destino es la frase arriba: el tope de la sección.
 *
 * Donde la sección no tiene coreografía (movimiento reducido, o una rama quieta) el nudo no
 * existe y el destino es el del ancla, que es lo que hacía el enlace antes.
 */

/** Los rangos con nombre de un bloque animado, tal como los escribe su `data-rango`. */
const ANCLAS_DEL_RANGO: Readonly<Record<string, ParDeAnclas>> = {
  'ventana-visible': ANCLA_DE_LA_VENTANA_VISIBLE,
  'ventana-del-trazo': ANCLA_DEL_TRAZO,
  'ventana-de-la-mascara': ANCLA_DE_LA_MASCARA,
  'llegada-de-la-foto': ANCLA_DE_LA_LLEGADA,
}

const SELECTOR_DEL_BLOQUE_ANIMADO = `[data-arbol="${MARCA_COREOGRAFIA_DEL_HOME}"]`

/** El tope en el documento como si nada estuviera pegado: un `sticky` se mide en su lugar de reposo. */
function topeSinPegar(el: HTMLElement): number {
  const pegados: [HTMLElement, string][] = []
  for (let a: HTMLElement | null = el; a !== null; a = a.parentElement) {
    if (getComputedStyle(a).position === 'sticky') {
      pegados.push([a, a.style.position])
      a.style.position = 'static'
    }
  }
  const tope = el.getBoundingClientRect().top + window.scrollY
  for (const [a, antes] of pegados) a.style.position = antes
  return tope
}

/** Dónde termina la ventana de un bloque animado, en píxeles de scroll; `null` si su rango no tiene nombre. */
export function finDeLaVentana(bloque: HTMLElement, altoDeLaVentana: number): number | null {
  const par = ANCLAS_DEL_RANGO[bloque.getAttribute('data-rango') ?? '']
  if (par === undefined) return null
  return posicionDeAncla(par.fin, { topDoc: topeSinPegar(bloque), alto: bloque.getBoundingClientRect().height }, altoDeLaVentana)
}

const topeDe = (el: HTMLElement): number => el.getBoundingClientRect().top + window.scrollY

/** Lo que la barra tapa arriba: el `scroll-padding-top` de la hoja (`navegacion.css`), el mismo de las anclas. */
function despejeDeLaBarra(): number {
  const px = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)
  return Number.isFinite(px) ? px : 0
}

/** Quiénes somos: el fin de la entrada, sin pasar el punto en que el título se mete debajo de la barra. */
function reposoDeQuienesSomos(panel: HTMLElement, v: number): number {
  const titulo = panel.querySelector<HTMLElement>('[data-composicion="agencia"] > [data-arbol]')
  const conElTituloDespejado = titulo === null ? Number.POSITIVE_INFINITY : Math.floor(topeSinPegar(titulo) - despejeDeLaBarra())
  return Math.min(Math.ceil(finDeLaEntrada(panel, v) ?? topeDe(panel)), conElTituloDespejado)
}

/** El fin de la entrada de la primera pantalla: la ventana más tardía de sus bloques, o `null` sin coreografía. */
function finDeLaEntrada(panel: HTMLElement, v: number): number | null {
  const tope = topeDe(panel)
  const fines = [...panel.querySelectorAll<HTMLElement>(SELECTOR_DEL_BLOQUE_ANIMADO)]
    .filter((b) => topeSinPegar(b) < tope + v)
    .map((b) => finDeLaVentana(b, v))
    .filter((f): f is number => f !== null)
  return fines.length === 0 ? null : Math.max(...fines)
}

/**
 * El nudo de cada sección, en píxeles ENTEROS de scroll; `null` si en este árbol no existe.
 *
 * El redondeo es parte del nudo: «el primer píxel en que terminó» va hacia arriba (con el de
 * abajo la frase de Por qué quedaba 1,5 px antes de su lugar y el ≠ al 99,8 %), y «el último
 * píxel antes» va hacia abajo (con el de arriba Servicios ya estaría en el 01).
 */
const NUDOS: Readonly<Record<string, (panel: HTMLElement, v: number) => number | null>> = {
  hero: (panel) => Math.round(topeDe(panel)),
  'quienes-somos': reposoDeQuienesSomos,
  trabajos: (panel, v) => {
    const titulo = panel.querySelector<HTMLElement>(`[data-pieza="cartel"] ${SELECTOR_DEL_BLOQUE_ANIMADO}`)
    const subida = titulo === null ? null : finDeLaVentana(titulo, v)
    return Math.ceil(Math.max(topeDe(panel), subida ?? Number.NEGATIVE_INFINITY))
  },
  servicios: (panel) => Math.floor(topeDe(panel)),
  'por-que-develop': (panel, v) => {
    const escenario = panel.querySelector<HTMLElement>('[data-pieza="escenario-del-final"]')
    const pin = escenario?.closest<HTMLElement>(SELECTOR_DEL_BLOQUE_ANIMADO) ?? null
    if (pin !== null) return Math.ceil(topeDe(pin) + VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.hasta * (pin.getBoundingClientRect().height - v))
    return Math.ceil(topeDe(panel))
  },
}

/** Las secciones a las que se puede viajar: las que tienen nudo. */
export const DESTINOS_CON_NUDO: readonly string[] = Object.keys(NUDOS)

/** EL DESTINO DEL VIAJE, en píxeles enteros de scroll: el nudo de la sección, dentro del documento. */
export function destinoDelViaje(seccion: HTMLElement): number {
  const id = seccion.getAttribute('data-panel') ?? ''
  const nudo = NUDOS[id]?.(seccion, window.innerHeight) ?? null
  if (nudo === null) return Math.round(destinoDelAncla(seccion))
  const maximo = Math.floor(Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
  return Math.min(Math.max(nudo, 0), maximo)
}
