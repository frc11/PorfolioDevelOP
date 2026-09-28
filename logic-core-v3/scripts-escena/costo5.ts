/**
 * SPRINT ESCENA 5 — lo que cuesta cada efecto. costo5.ts
 *
 * Una carga por variante, en el hero (por scroll, asentado y verificado): las llamadas de dibujo y
 * los triángulos del último cuadro completo (`CONTADOR`), y los puntos que se mandan a dibujar (la
 * suma de los `drawRange` de todos los `Points` de la escena). La fila de la base es la escena de
 * antes de este sprint (el moiré y el polvo de la base).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco } from '../scripts-viajes/banco'
import { CONTADOR, DIR5, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'

const VARIANTES = [
  ['antes (moiré y polvo de la base)', 'producto,moire=hoy,polvo=antes'],
  ['producto (moiré vivo + polvo parejo)', 'producto'],
  ['+ formación', 'producto,formacion'],
  ['+ estrellas', 'producto,estrellas'],
  ['+ 5a obstáculo', 'producto,obstaculo'],
  ['+ 5b se posa', 'producto,posarse'],
  ['+ 5c sombra según el haz', 'producto,sombra=haz'],
  ['+ 5d motas', 'producto,motas'],
  ['+ 5e R1', 'producto,R1'],
  ['+ 5e R2 (con la formación)', 'producto,formacion,R2'],
] as const

/** Cuenta los puntos que la escena manda a dibujar: la suma de los `drawRange` de cada `Points`. */
const PUNTOS = `(() => {
  const hook = window.__polvoDelBanco
  return hook ? hook.puntos() : null
})()`

async function principal(): Promise<void> {
  const filas: unknown[] = []
  for (const [nombre, pedido] of VARIANTES) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${pedido}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}` })
    try {
      const sello = await selloDeCarga(b)
      await capturarMomento(b, MOMENTOS[0], sello)
      const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
      const puntos = await medir<unknown>(b.p, PUNTOS)
      const formacion = await medir<unknown>(b.p, 'window.__formacionDelBanco ? { copias: window.__formacionDelBanco.copias, instancias: window.__formacionDelBanco.instancias, triangulos: window.__formacionDelBanco.triangulos } : null')
      const fila = { efecto: nombre, pedido, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos), puntos, formacion }
      filas.push(fila)
      console.log(JSON.stringify(fila))
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${DIR5}/costo.json`, JSON.stringify(filas, null, 2))
}

principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
