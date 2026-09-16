/**
 * TAPADO-1 · C — EMITE EL RECIBO que el invariante consume.
 *
 *     npx tsx scripts-tapado/c-recibo.ts
 *
 * Lee las dos corridas de `a-verdad.ts` —`centrado` (la composición anterior) y
 * `hoy` (la actual)— y escribe el literal de `RECIBO_DEL_NAVEGADOR` de
 * `s10-logo-composicion.ts` por la salida estándar.
 *
 * ⚠ **Existe para que nadie transcriba a mano.** Un recibo copiado con los dedos
 * es un número que el instrumento afirma y nadie midió: el modo de falla que
 * este sprint entero viene a cerrar, un piso más abajo.
 *
 * ⚠ **Y NO escribe el archivo.** Pegar el literal es una decisión del humano que
 * cierra el sprint, no un efecto de correr una medición: un script que se
 * reescribe su propia vara puede dejar el gate verde contra lo que acaba de
 * medir, sin que nadie lo mire.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { RAIZ_DE_SALIDAS } from './tapado-comun'

interface Caja {
  readonly y: number
}
interface Medida {
  readonly caja: Caja
  readonly tintaSobreLogo: number
}
interface Fila {
  readonly ancho: number
  readonly titular: Medida
  readonly bloque: Medida
}
interface Corrida {
  readonly composicion?: string
  readonly filas: readonly Fila[]
}

function leer(etiqueta: string): Corrida {
  return JSON.parse(readFileSync(path.join(RAIZ_DE_SALIDAS, `a-verdad-${etiqueta}.json`), 'utf8')) as Corrida
}

const centrado = leer('centrado')
const hoy = leer('hoy')
if (centrado.composicion !== 'centrado' || hoy.composicion !== 'hoy') {
  throw new Error(
    `las dos corridas tienen que declarar su composicion: leí «${String(centrado.composicion)}» y «${String(hoy.composicion)}»`,
  )
}

const tres = (n: number): string => n.toFixed(3)
const uno = (n: number): string => n.toFixed(1)

console.log('export const RECIBO_DEL_NAVEGADOR: readonly ReciboDelNavegador[] = [')
for (const c of centrado.filas) {
  const h = hoy.filas.find((f) => f.ancho === c.ancho)
  if (h === undefined) throw new Error(`falta el ancho ${c.ancho} en la corrida «hoy»`)
  console.log(
    `  { ancho: ${c.ancho}, tintaCentrado: ${tres(c.titular.tintaSobreLogo)}, tintaHoy: ${tres(h.titular.tintaSobreLogo)},` +
      ` arribaCentrado: ${uno(c.bloque.caja.y)}, arribaHoy: ${uno(h.bloque.caja.y)} },`,
  )
}
console.log(']')
