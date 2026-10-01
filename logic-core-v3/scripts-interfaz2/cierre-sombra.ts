/**
 * SPRINT INTERFAZ 2 · cierre — la sombra de día: cierre-sombra.ts <rótulo> (la hoja: `cierre-sombra-hoja.py`)
 *
 * Captura Quiénes somos y Por qué develOP (los momentos asentados del banco de la escena, `capturarMomento`) del producto
 * que esté en el servidor: `antes` con las dos sombras de día (la mancha de contacto y la del logo), `despues` sólo con
 * la del logo.
 * Va a `interfaz2/cierre/sombra/`.
 */
import { writeFileSync } from 'node:fs'

import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { PLACA, abrir } from '../scripts-escena10/banco'
import { carpeta, correr } from './banco'

const ROTULO = process.argv[2] ?? 'despues'
const ELEGIDOS = ['quienes-somos', 'por-que-develop']
correr(async () => {
  const dir = carpeta('cierre/sombra')
  const b = await abrir('producto', 1440, 900)
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS.filter((m) => ELEGIDOS.includes(m.nombre))) {
      const c = await capturarMomento(b, momento, sello)
      writeFileSync(`${dir}/${momento.nombre}-${ROTULO}.png`, c.png)
      console.log(momento.nombre, ROTULO, PLACA)
    }
  } finally {
    await b.cerrar()
  }
})
