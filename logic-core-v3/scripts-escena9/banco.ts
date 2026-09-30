/**
 * SPRINT ESCENA 9 — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket) y cómo se
 * abre la página (la de ESCENA 7 y CALIDAD 1: el punto del cursor, el contador de dibujos, el espía de saltos y los
 * errores). Contra el servidor de desarrollo, con un Chrome propio por CDP y el candado de Chrome.
 */
import { mkdirSync } from 'node:fs'

export { abrir, ladoALado } from '../scripts-calidad/banco'

/** Las entregas de este sprint. */
export const DIR9 = 'C:/Users/Valentino/.cache/b4-medicion/escena9'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIR9}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}
