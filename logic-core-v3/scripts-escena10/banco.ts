/**
 * SPRINT ESCENA 10 — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket) y cómo se abre
 * la página (la de ESCENA 7, CALIDAD 1 y ESCENA 9). Contra el servidor de desarrollo, con un Chrome propio por CDP y el
 * candado de Chrome. Desde este sprint todo se mide con la NVIDIA (`BANCO_GPU=alta`); la integrada, sólo como referencia.
 */
import { mkdirSync } from 'node:fs'

export { abrir, ladoALado } from '../scripts-calidad/banco'

/** Las entregas de este sprint. */
export const DIR10 = 'C:/Users/Valentino/.cache/b4-medicion/escena10'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIR10}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

/**
 * La placa pedida (va en cada resultado). Sin `BANCO_GPU=alta`, la que elija Chrome: en ESCENA 9 era la integrada, pero
 * después de un reinicio (ESCENA 10) Chrome usa la NVIDIA también por defecto (lo dice `scripts-escena9/t4-gpu.ts`), así
 * que «por defecto» no quiere decir la integrada: se verifica con ese banco antes de rotular una medición.
 */
export const PLACA = process.env.BANCO_GPU === 'alta' ? 'nvidia' : 'por-defecto'
