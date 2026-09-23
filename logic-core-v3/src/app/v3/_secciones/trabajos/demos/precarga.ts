/**
 * LA PRECARGA POR INTENCIÓN — con el puntero quieto sobre una pieza, su demo
 * empieza a bajar antes del clic. **[PORTFOLIO · DEMOS]**
 *
 * 150 ms es la frontera entre pasar por encima y detenerse: un puntero que
 * recorre el estante no dispara nada, uno que se queda sí.
 *
 * ⚠️ **UNA SOLA POR VEZ, y no es un iframe escondido.** Precargar montando un
 * iframe fuera de pantalla serían dos demos vivas; acá es un `<link rel=prefetch>`
 * del documento —más su `preconnect`— que el navegador guarda en su caché. Hay
 * UN par de enlaces en el `<head>` y cambia de destino: nunca se acumulan.
 */
export const MS_DE_INTENCION = 150

const MARCA = 'data-demos-precarga'

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
  const previa = enlace('prefetch')
  if (previa.href === url) return
  enlace('preconnect').href = new URL(url).origin
  previa.href = url
}

/** Cuántas precargas hay en el documento. Para el invariante: nunca más de una. */
export function precargasEnElDocumento(): number {
  return document.head.querySelectorAll(`link[${MARCA}="prefetch"]`).length
}
