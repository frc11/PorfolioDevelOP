import { posicionDeAncla, type ParDeAnclas } from '../_lib/motion/anclas'
import {
  ANCLA_DE_LA_DEMO,
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
 *
 * ── [NAVBAR] LO QUE CAMBIÓ CON EL MENÚ PROPIO ─────────────────────────────
 *
 *   · **Quiénes somos, un poco antes**: la primera pantalla (del título al cuerpo) CENTRADA en el cuadro que la barra
 *     deja libre, nunca antes de que el título termine de llegar ni después del reposo de antes (que dejaba el título
 *     pegado a la barra). A 1440 × 900, 917 en lugar de 1035; a 1024 × 768, el tope de la sección en lugar de 805.
 *   · **Panel** (Tu panel, nuevo en la barra): la cabecera entera a la vista —el título, la bajada y el panel en vivo—,
 *     centrada en el cuadro libre si sobra lugar, sin mostrar la sección de arriba.
 *   · **Portfolio y Por qué develOP**: [NAVBAR] Retoque 3 · el viaje va derecho a su nudo, con la duración de todos;
 *     al llegar, el TÍTULO repite su llegada, aislado (`llegadaDelTitulo.ts`). La llegada «a la vista» de T1 (frenar
 *     antes y recorrerla sin velo, ~5,5 s) se borró: el sitio no espera al texto.
 */

/** Los rangos con nombre de un bloque animado, tal como los escribe su `data-rango`. */
const ANCLAS_DEL_RANGO: Readonly<Record<string, ParDeAnclas>> = {
  'ventana-visible': ANCLA_DE_LA_VENTANA_VISIBLE,
  'ventana-del-trazo': ANCLA_DEL_TRAZO,
  'ventana-de-la-mascara': ANCLA_DE_LA_MASCARA,
  'llegada-de-la-foto': ANCLA_DE_LA_LLEGADA,
  'ventana-de-la-demo': ANCLA_DE_LA_DEMO,
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

/**
 * [NAVBAR] Un tramo del documento (`arriba` → `abajo`) centrado en el cuadro que la barra deja libre; si no entra, su
 * tope apenas debajo de la barra. Nunca antes del tope de la sección: la de arriba no asoma.
 */
export function centradoDebajoDeLaBarra(topeDeLaSeccion: number, arriba: number, abajo: number, v: number, despeje: number): number {
  const sobra = Math.max(0, v - despeje - (abajo - arriba))
  return Math.max(topeDeLaSeccion, arriba - despeje - sobra / 2)
}

/**
 * Quiénes somos: [NAVBAR] la primera pantalla centrada debajo de la barra, sin adelantarse al título (sus ventanas
 * terminadas) ni pasarse del reposo de antes: el fin de la entrada, sin pasar el punto en que el título se mete debajo
 * de la barra.
 */
function reposoDeQuienesSomos(panel: HTMLElement, v: number): number {
  const titulo = panel.querySelector<HTMLElement>('[data-composicion="agencia"] > [data-arbol]')
  const despeje = despejeDeLaBarra()
  const conElTituloDespejado = titulo === null ? Number.POSITIVE_INFINITY : Math.floor(topeSinPegar(titulo) - despeje)
  const reposo = Math.min(Math.ceil(finDeLaEntrada(panel, v) ?? topeDe(panel)), conElTituloDespejado)
  const primera = bloquesDeLaPrimeraPantalla(panel, v)
  if (titulo === null || primera.length === 0) return reposo
  const arriba = Math.min(...primera.map(topeSinPegar))
  const abajo = Math.max(...primera.map((b) => topeSinPegar(b) + b.getBoundingClientRect().height))
  const delTitulo = [titulo, ...titulo.querySelectorAll<HTMLElement>(SELECTOR_DEL_BLOQUE_ANIMADO)]
    .map((b) => finDeLaVentana(b, v))
    .filter((f): f is number => f !== null)
  const llegoElTitulo = delTitulo.length === 0 ? Number.NEGATIVE_INFINITY : Math.max(...delTitulo)
  return Math.min(reposo, Math.ceil(Math.max(centradoDebajoDeLaBarra(topeDe(panel), arriba, abajo, v, despeje), llegoElTitulo)))
}

/** Los bloques animados que arrancan en la primera pantalla de la sección. */
function bloquesDeLaPrimeraPantalla(panel: HTMLElement, v: number): HTMLElement[] {
  const tope = topeDe(panel)
  return [...panel.querySelectorAll<HTMLElement>(SELECTOR_DEL_BLOQUE_ANIMADO)].filter((b) => topeSinPegar(b) < tope + v)
}

/** El fin de la entrada de la primera pantalla: la ventana más tardía de sus bloques, o `null` sin coreografía. */
function finDeLaEntrada(panel: HTMLElement, v: number): number | null {
  const fines = bloquesDeLaPrimeraPantalla(panel, v)
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
  // [NAVBAR] Panel: la cabecera entera a la vista (el título, la bajada y el panel en vivo).
  'tu-panel': (panel, v) => {
    const cabecera = panel.querySelector<HTMLElement>('[data-pieza="encabezado-del-panel"]')
    if (cabecera === null) return null
    const arriba = topeSinPegar(cabecera)
    return Math.ceil(centradoDebajoDeLaBarra(topeDe(panel), arriba, arriba + cabecera.getBoundingClientRect().height, v, despejeDeLaBarra()))
  },
  'por-que-develop': (panel, v) => {
    const escenario = panel.querySelector<HTMLElement>('[data-pieza="escenario-del-final"]')
    const pin = escenario?.closest<HTMLElement>(SELECTOR_DEL_BLOQUE_ANIMADO) ?? null
    if (pin !== null) return Math.ceil(topeDe(pin) + VENTANA_DE_LA_SUBIDA_DE_LA_FRASE.hasta * (pin.getBoundingClientRect().height - v))
    return Math.ceil(topeDe(panel))
  },
}

/** Las secciones a las que se puede viajar: las que tienen nudo. */
export const DESTINOS_CON_NUDO: readonly string[] = Object.keys(NUDOS)

/**
 * [PULIDO 10] J8 · LOS DESTINOS QUE VIVEN ADENTRO DE UNA SECCIÓN (el ancla, no su sección): Demos, al final del pin de Trabajos,
 * con las demos ya llegadas (la ventana de las demos se cuenta desde el final del pin y su llegada termina una muesca antes
 * del despineado: `trabajos/geometria.ts`). El pin abarca la sección entera (el hijo pegado mide una pantalla), así que el
 * final es el de la sección menos una pantalla, dos píxeles antes (todavía clavada: la de abajo no asoma). Sin coreografía
 * (la rama quieta), el tope del ancla.
 */
const SUBNUDOS: Readonly<Record<string, (ancla: HTMLElement, v: number) => number | null>> = {
  demos: (ancla, v) => {
    const seccion = ancla.closest<HTMLElement>('[data-panel]')
    if (seccion === null || ancla.closest(SELECTOR_DEL_BLOQUE_ANIMADO) === null) return null
    const alto = seccion.getBoundingClientRect().height
    return alto <= v ? null : Math.floor(topeSinPegar(seccion) + alto - v - 2)
  },
}

/** Los anclas con destino propio adentro de su sección. */
export const SUBDESTINOS: readonly string[] = Object.keys(SUBNUDOS)

/**
 * EL DESTINO DEL VIAJE, en píxeles enteros de scroll: el nudo de la sección, dentro del documento. [PULIDO 10] J8 · con
 * `ancla` (un ancla adentro de la sección), su subnudo si lo tiene.
 */
export function destinoDelViaje(seccion: HTMLElement, ancla: HTMLElement | null = null): number {
  const id = seccion.getAttribute('data-panel') ?? ''
  const sub = ancla === null ? undefined : SUBNUDOS[ancla.id]
  const nudo = sub !== undefined && ancla !== null ? (sub(ancla, window.innerHeight) ?? Math.round(destinoDelAncla(ancla))) : (NUDOS[id]?.(seccion, window.innerHeight) ?? null)
  if (nudo === null) return Math.round(destinoDelAncla(seccion))
  const maximo = Math.floor(Math.max(0, document.documentElement.scrollHeight - window.innerHeight))
  return Math.min(Math.max(nudo, 0), maximo)
}
