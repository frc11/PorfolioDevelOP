/**
 * [CIERRE A-ter] A13 · EL TOPE DE UN ELEMENTO EN EL DOCUMENTO, COMO SI NADA ESTUVIERA PEGADO — lo que el motor de progreso necesita para
 * resolver el ancla de un bloque (`useProgresoDePatron`). Medía `getBoundingClientRect().top + scrollY`: al cargar arriba de todo es lo
 * mismo (ningún `sticky` está pegado), pero una época a mitad de una sección clavada (las fuentes que llegan tarde, la página que crece, un
 * salto del menú que llega antes) medía el bloque donde lo dejaba el `sticky` y su rango quedaba corrido para siempre: la animación ya no
 * correspondía al scroll. Ahora a cada `sticky` de la cadena se le descuenta lo que está corrido: su tope pegado menos el de su lugar
 * (`position: static` un instante, sin pintar). Una vez por `sticky` por pasada de medición (los bloques de una época miden en la misma
 * tarea: la cuenta se guarda hasta la próxima microtarea). Lo transformado no se toca (es el estado de la coreografía).
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

/** El tope de `el` en el documento (px) sin lo que corren los `sticky` de su cadena (él incluido). */
export function topeEnReposo(el: HTMLElement): number {
  let dy = 0
  for (let a: HTMLElement | null = el; a !== null; a = a.parentElement) if (getComputedStyle(a).position === 'sticky') dy += corrido(a)
  return el.getBoundingClientRect().top + window.scrollY - dy
}
