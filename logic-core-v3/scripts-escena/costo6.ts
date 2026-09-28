/**
 * SPRINT ESCENA 6 — la tabla de costo. costo6.ts
 *
 * Cada efecto contra el producto, en el momento donde se ve: llamadas de dibujo y triángulos del
 * último cuadro (`CONTADOR`), puntos mandados a dibujar (polvo, bokeh, estrellas) y, donde hay una
 * pasada que no es la escena (las dos simulaciones, la pasada extra de 6f), su tiempo de GPU con una
 * consulta de tiempo. Escribe `escena6/costo.json` y `escena6/costo.txt`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar } from '../scripts-viajes/banco'
import { CONTADOR, DIR6, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, selloDeCarga } from './banco-escena'
import { ERRORES } from './formacion'

interface Caso {
  readonly efecto: string
  readonly pedido: string
  readonly momento: string
  /** Una expresión que devuelve la medida de la pasada que no es la escena. */
  readonly pasada?: string
}

const CASOS: readonly Caso[] = [
  { efecto: 'producto (hero)', pedido: 'producto', momento: 'hero' },
  { efecto: 'producto sin 5a, 5c ni 5d', pedido: 'producto,obstaculo=no,sombra=blanda,motas=no', momento: 'hero' },
  { efecto: '2 formacion', pedido: 'producto,formacion', momento: 'hero' },
  { efecto: '2 formacion, sin fallas visibles', pedido: 'producto,formacion,fallas=no', momento: 'hero' },
  { efecto: 'producto (noche)', pedido: 'producto', momento: 'trabajos-de-noche' },
  { efecto: '3 estrellas (con la formacion)', pedido: 'producto,formacion,estrellas', momento: 'trabajos-de-noche' },
  { efecto: '4 polvo que se posa (fisica)', pedido: 'producto,posarse', momento: 'hero', pasada: 'window.__fisicaDelBanco.medir(60)' },
  { efecto: '5 piso vivo', pedido: 'producto,piso', momento: 'hero', pasada: 'window.__pisoDelBanco.medir(60)' },
  { efecto: '5 piso vivo con el pulso', pedido: 'producto,piso=pulso', momento: 'hero', pasada: 'window.__pisoDelBanco.medir(60)' },
  { efecto: '6a inercia del aire', pedido: 'producto,inercia', momento: 'hero' },
  { efecto: '6b remolinos (fisica)', pedido: 'producto,remolinos', momento: 'hero', pasada: 'window.__fisicaDelBanco.medir(60)' },
  { efecto: '6c niebla rasante (con la formacion)', pedido: 'producto,formacion,rasante', momento: 'quienes-somos' },
  { efecto: '2 formacion (quienes, para 6c)', pedido: 'producto,formacion', momento: 'quienes-somos' },
  { efecto: '6d niebla con la velocidad', pedido: 'producto,formacion,velocidad', momento: 'hero' },
  { efecto: '6e haz encendido', pedido: 'producto,encendido', momento: 'trabajos-de-noche' },
  { efecto: '6f aire caliente', pedido: 'producto,calor', momento: 'trabajos-de-noche', pasada: 'window.__calorDelBanco.medir(60)' },
  { efecto: '6g dia desde afuera (con la formacion)', pedido: 'producto,formacion,dia=afuera', momento: 'hero' },
]

async function principal(): Promise<void> {
  const filas: Record<string, unknown>[] = []
  for (const caso of CASOS) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = '${caso.pedido}'; ${CONTADOR}; ${ESPIA_DE_SALTOS}; ${ERRORES}` })
    try {
      const sello = await selloDeCarga(b)
      for (const momento of MOMENTOS) {
        await capturarMomento(b, momento, sello)
        if (momento.nombre !== caso.momento) continue
        await esperar(800)
        const dibujos = await medir<{ ultimo: number; ultimosTriangulos: number }>(b.p, 'window.__dibujos')
        const puntos = await medir<number>(b.p, 'window.__polvoDelBanco.puntos()')
        const pasada = caso.pasada === undefined ? null : await medir<unknown>(b.p, caso.pasada)
        const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
        const fila = { ...caso, llamadas: dibujos.ultimo, triangulos: Math.round(dibujos.ultimosTriangulos), puntos, pasada, errores: errores.slice(0, 3) }
        filas.push(fila)
        console.log(JSON.stringify(fila))
        break
      }
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${DIR6}/costo.json`, JSON.stringify(filas, null, 1))
}

if (process.argv[1]?.endsWith('costo6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
