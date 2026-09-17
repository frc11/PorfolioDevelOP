/**
 * TAPADO-1 · C — EMITE EL RECIBO que el invariante consume.
 *
 *     npx tsx scripts-tapado/c-recibo.ts
 *     npx tsx scripts-tapado/c-recibo.ts --centrado=texto2-centrado --hoy=texto2-hoy
 *
 * Lee las dos corridas de `a-verdad.ts` —`centrado` (la composición anterior) y
 * `hoy` (la actual)— y escribe el literal de `RECIBO_DEL_NAVEGADOR` de
 * `s10-logo-composicion.ts` por la salida estándar.
 *
 * ── ⚠️ POR QUÉ LAS ETIQUETAS SON UN ARGUMENTO, desde TEXTO-2 ─────────────
 *
 * Porque `a-verdad-hoy.json` NO es sólo el insumo de este recibo: es también la
 * referencia de la que `scripts-texto/texto-comun.ts` lee dónde están las masas
 * del logo, y de la que TEXTO-1 §4 y TEXTO-2 §4.3 sacaron su tabla de huecos.
 * Y esas bandas **se miden dentro de la columna del bloque de texto**
 * (`a-verdad.ts`: `bandasDeMasa(D, columna.x, columna.x + columna.ancho)`), así
 * que una composición que ensancha el bloque —como la de TEXTO-2 a 768 y 1024—
 * las mueve. Re-medir sobre `hoy` habría cambiado en silencio la tabla de dos
 * informes ya escritos.
 *
 * Lo que las etiquetas compran es poder emitir el recibo de una composición
 * nueva **sin pisar la referencia anterior**. Lo que NO arreglan: que
 * `a-verdad-hoy.json` siga llamándose «hoy» describiendo un árbol que ya cambió.
 * Re-basar esa etiqueta es una decisión del humano y está reportada.
 *
 * ⚠ La comprobación de que cada corrida DECLARA su composición no se toca: las
 * etiquetas eligen el archivo, y el archivo sigue teniendo que decir si es
 * `centrado` o `hoy`. Una etiqueta mal pasada da error, no un recibo dado vuelta.
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

import { RAIZ_DE_SALIDAS, argumento } from './tapado-comun'

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

const centrado = leer(argumento('centrado', 'centrado'))
const hoy = leer(argumento('hoy', 'hoy'))
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
