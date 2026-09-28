/**
 * SPRINT ESCENA 8 — lo que comparten los bancos de este sprint: la carpeta de entregas. La página se abre
 * como en ESCENA 7 (`abrir7`: el punto del cursor, el contador de dibujos, el espía de saltos y los errores).
 */
import { mkdirSync } from 'node:fs'

export { abrir7 as abrir8 } from './banco7'

/** Las entregas de este sprint. */
export const DIR8 = 'C:/Users/Valentino/.cache/b4-medicion/escena8'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta8(nombre: string): string {
  const dir = `${DIR8}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}
