import { CATALOGO_DE_DEMOS } from './catalogo'
import { conElDefectoDeDemos } from './defectos'

/**
 * LA PRECARGA — las demos empiezan a bajar antes del clic. **[PORTFOLIO · DEMOS]**
 *
 * Dos escalones:
 *   · [C2-41e] **Demos a la vista** (la llegada pedida por el scroll arranca: `enLaEscena.ts`): una preconexión a cada demo (DNS,
 *     TCP y TLS de los cinco orígenes), una sola vez por página. Es barata y es lo primero que paga el iframe al abrirse.
 *   · **La intención**: con el puntero quieto sobre una pieza (150 ms es la frontera entre pasar por encima y detenerse) su documento
 *     se precarga (`<link rel=prefetch>`), y el iframe lo toma de la caché.
 *
 * ⚠️ **UNA SOLA POR VEZ, y no es un iframe escondido.** Precargar montando un
 * iframe fuera de pantalla serían dos demos vivas; acá es un `<link rel=prefetch>`
 * del documento —más su `preconnect`— que el navegador guarda en su caché. Hay
 * UN par de enlaces en el `<head>` y cambia de destino: nunca se acumulan. (Las preconexiones de «a la vista» son aparte: una por
 * origen, fijas.) El iframe sí arranca antes: con el clic, durante el Genie (`VentanaDeDemo`).
 */
export const MS_DE_INTENCION = 150

const MARCA = 'data-demos-precarga'
/** [C2-41e] Las preconexiones de Demos a la vista: una por origen. */
const MARCA_A_LA_VISTA = 'data-demos-preconexion'

function enlace(rel: 'preconnect' | 'prefetch'): HTMLLinkElement {
  const existente = document.head.querySelector<HTMLLinkElement>(`link[${MARCA}="${rel}"]`)
  if (existente !== null) return existente
  const nuevo = document.createElement('link')
  nuevo.rel = rel
  nuevo.setAttribute(MARCA, rel)
  if (rel === 'prefetch') nuevo.as = 'document'
  document.head.appendChild(nuevo)
  return nuevo
}

export function precargar(url: string): void {
  if (conElDefectoDeDemos('sin-precarga')) return
  const previa = enlace('prefetch')
  if (previa.href === url) return
  enlace('preconnect').href = new URL(url).origin
  previa.href = url
}

/** [C2-41e] Los orígenes de las demos, sin repetir (en el orden del catálogo). */
export const ORIGENES_DE_LAS_DEMOS: readonly string[] = [...new Set(CATALOGO_DE_DEMOS.map((d) => new URL(d.url).origin))]

let preconectadas = false

/** [C2-41e] Demos a la vista: una preconexión a cada origen, una sola vez (las que ya están no se repiten). */
export function preconectarLasDemos(): void {
  if (preconectadas || typeof document === 'undefined' || conElDefectoDeDemos('sin-precarga')) return
  preconectadas = true
  for (const origen of ORIGENES_DE_LAS_DEMOS) {
    if (document.head.querySelector(`link[${MARCA_A_LA_VISTA}="${origen}"]`) !== null) continue
    const l = document.createElement('link')
    l.rel = 'preconnect'
    l.href = origen
    l.setAttribute(MARCA_A_LA_VISTA, origen)
    document.head.appendChild(l)
  }
}

/** Cuántas precargas hay en el documento. Para el invariante: nunca más de una. */
export function precargasEnElDocumento(): number {
  return document.head.querySelectorAll(`link[${MARCA}="prefetch"]`).length
}

/** [C2-41e] Cuántas preconexiones de «a la vista» hay. Para el invariante: una por origen, nunca más. */
export function preconexionesEnElDocumento(): number {
  return document.head.querySelectorAll(`link[${MARCA_A_LA_VISTA}]`).length
}
