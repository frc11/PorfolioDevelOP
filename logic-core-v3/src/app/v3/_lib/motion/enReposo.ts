/**
 * [CIERRE A-ter] A13 · EL TOPE DE UN ELEMENTO EN EL DOCUMENTO, EN EL LAYOUT — lo que el motor de progreso necesita para resolver el ancla de
 * un bloque (`useProgresoDePatron`). Medía `getBoundingClientRect().top + scrollY`: al cargar arriba de todo da lo mismo, pero una época a
 * mitad de la página (una fuente que llega tarde, la página que crece, un salto del menú que llega antes) medía el bloque donde lo dejaban
 * un `sticky` pegado y las transformadas de sus ancestros (el paralaje de la galería de Tu panel lo corría hasta 226 px, medido en el
 * sitio) y su rango quedaba corrido para siempre: la animación ya no correspondía al scroll. Ahora es la cadena de `offsetTop` (el layout:
 * sin transformadas) menos lo que corren los `sticky` (su tope pegado menos el de su lugar, `position: static` un instante, sin pintar; una
 * vez por `sticky` por pasada de medición: los bloques de una época miden en la misma tarea, la cuenta se guarda hasta la próxima
 * microtarea). Medido en el sitio: arriba de todo da los mismos rangos que antes (los 45 bloques, a menos de 2 px).
 */

const CORRIDOS = new Map<HTMLElement, number>()
let limpiezaPedida = false

/** Lo que está corrido un `sticky` (px): su tope pegado menos el de su lugar. */
function corrido(el: HTMLElement): number {
  const ya = CORRIDOS.get(el)
  if (ya !== undefined) return ya
  if (!limpiezaPedida) {
    limpiezaPedida = true
    queueMicrotask(() => {
      CORRIDOS.clear()
      limpiezaPedida = false
    })
  }
  const pegado = el.getBoundingClientRect().top
  const antes = el.style.position
  el.style.position = 'static'
  const suelto = el.getBoundingClientRect().top
  el.style.position = antes
  CORRIDOS.set(el, pegado - suelto)
  return pegado - suelto
}

/**
 * El tope de `el` en el documento (px), en el layout y sin lo que corren los `sticky` de su cadena (él incluido). Con un `fixed` en la
 * cadena de `offsetParent` (su tope es del cuadro, no del documento), el de su caja de ahora.
 */
export function topeEnReposo(el: HTMLElement): number {
  let dy = 0
  for (let a: HTMLElement | null = el; a !== null; a = a.parentElement) if (getComputedStyle(a).position === 'sticky') dy += corrido(a)
  let y = 0
  for (let a: HTMLElement | null = el; a !== null; a = a.offsetParent instanceof HTMLElement ? a.offsetParent : null) {
    if (getComputedStyle(a).position === 'fixed') return el.getBoundingClientRect().top + window.scrollY - dy
    y += a.offsetTop
  }
  return y - dy
}
