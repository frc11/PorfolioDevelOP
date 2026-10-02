/**
 * SPRINT 3D Y SONIDO — lo que comparten los bancos de este sprint: la carpeta de entregas (una por ticket), la compuerta
 * de memoria antes de cada parte y la verificación del servidor. Abrir /v3, el mouse, la rueda, grabar y armar un clip
 * son los del navbar (y los de INTERFAZ 1 debajo): con un Chrome propio por CDP, con el vsync puesto y la NVIDIA
 * (`BANCO_GPU=alta`; la placa se lee en la página y va en cada resultado).
 *
 * La compuerta de memoria: antes de cada parte, 1,5 GB libres; si no, espera 2 minutos y reintenta hasta 5 veces, y si
 * sigue baja corre igual (y lo dice). Si el servidor no contesta, la parte se corta con `SERVIDOR CAIDO` (se levanta a
 * mano, se matan sus hijos y se repite una vez).
 */
import { mkdirSync } from 'node:fs'
import { freemem } from 'node:os'

import { esperar } from '../scripts-navbar/banco'

export { abrir, armarClip, correr, enCamaraLenta, esperar, grabar, ladoALado, placaCorta, raton, rueda, tecla, type Banco } from '../scripts-navbar/banco'

/** Las entregas de este sprint. */
export const DIR3 = 'C:/Users/Valentino/.cache/b4-medicion/3d-sonido'

/** La carpeta de un ticket (o una subcarpeta), creada si no está. */
export function carpeta(nombre: string): string {
  const dir = `${DIR3}/${nombre}`
  mkdirSync(dir, { recursive: true })
  return dir
}

const UMBRAL_GB = 1.5

/** Antes de cada parte: memoria y servidor. */
export async function antesDeLaParte(nombre: string): Promise<void> {
  for (let intento = 0; ; intento += 1) {
    const libre = freemem() / 1024 ** 3
    if (libre >= UMBRAL_GB) break
    if (intento >= 5) {
      console.log(`  ⚠ ${nombre}: ${libre.toFixed(2)} GB libres después de 5 esperas; corre igual`)
      break
    }
    console.log(`  … ${nombre}: ${libre.toFixed(2)} GB libres (< ${String(UMBRAL_GB)}); espera 2 min (${String(intento + 1)}/5)`)
    await esperar(120_000)
  }
  try {
    const r = await fetch('http://localhost:3000/v3', { signal: AbortSignal.timeout(90_000) })
    if (!r.ok) throw new Error(String(r.status))
  } catch (e) {
    throw new Error(`SERVIDOR CAIDO antes de ${nombre}: ${e instanceof Error ? e.message : String(e)}`)
  }
}
