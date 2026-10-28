import type { Tono } from '../../_chrome/menu/tono'

/**
 * [C2 · 71t] EL ACORDEÓN DEL FAQ EN LISTA (el teléfono, la tablet y menos movimiento) — lo puro, sin React: qué respuesta queda abierta al
 * tocar una pregunta, a qué pregunta lleva cada tecla y el tono del vidrio. Lo usa `FaqEnLista`; lo prueba `s71-faq-telefono`.
 */

/** Una sola abierta a la vez (como en el escenario, donde se ve una respuesta por vez): tocar la abierta la cierra; otra, la reemplaza. */
export function alternarLaRespuesta(abierta: number | null, tocada: number): number | null {
  return abierta === tocada ? null : tocada
}

/** Las flechas recorren las preguntas en ronda; Inicio y Fin van a la primera y a la última. Otra tecla: `null` (la del navegador). */
export function preguntaConLaTecla(tecla: string, actual: number, cuantas: number): number | null {
  if (cuantas <= 0) return null
  if (tecla === 'ArrowDown') return (actual + 1) % cuantas
  if (tecla === 'ArrowUp') return (actual - 1 + cuantas) % cuantas
  if (tecla === 'Home') return 0
  if (tecla === 'End') return cuantas - 1
  return null
}

/**
 * El tono del vidrio de la lista: el de lo que continúa (el pie, justo arriba: `useTonoDebajo` con una sonda en su borde) y, si cuelga
 * de una sala invertida (el cierre de una página de noche), oscuro. Se escribe en el propio vidrio: `vidrio.css` da vuelta el filo y el
 * reflejo sólo con `data-seccion` en el elemento del material.
 */
export function tonoDeLaLista(debajo: Tono, enLaSalaInvertida: boolean): Tono {
  return enLaSalaInvertida ? 'oscuro' : debajo
}
