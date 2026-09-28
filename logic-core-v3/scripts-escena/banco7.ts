/**
 * SPRINT ESCENA 7 — lo que comparten los bancos de este sprint: la carpeta de entregas y cómo se abre
 * la página (con el punto del cursor, el contador de dibujos, el espía de saltos y los errores).
 */
import { mkdirSync } from 'node:fs'

import { abrirBanco, type Banco } from '../scripts-viajes/banco'
import { CONTADOR, DIR7, ESPIA_DE_SALTOS, PUNTO_DEL_CURSOR } from './banco-escena'
import { ERRORES } from './formacion'

export { DIR7 }

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta7(nombre: string): string {
  const dir = `${DIR7}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

/** Abre /v3 con el pedido del banco y los instrumentos de siempre. */
export function abrir7(pedido: string, ancho = 1440, alto = 900): Promise<Banco> {
  return abrirBanco(ancho, alto, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${PUNTO_DEL_CURSOR}; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
}
