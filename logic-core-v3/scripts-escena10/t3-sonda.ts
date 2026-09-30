/**
 * SPRINT ESCENA 10 — T3 · la sonda de los títulos de volumen: t3-sonda.ts <negro|blanco> [ancho alto]
 *
 * Con la prueba, en la ventana de lectura de cada título (medida con `t3-lectura.ts`: su principio, su medio y su
 * final, en scroll): la caja del título 3D en el cuadro y la del lugar que el DOM le guarda (la del medio tiene que
 * coincidir), más una captura de cada una; y los errores de la consola. Va a `escena10/t3-titulos/sonda/`. Con
 * `PUNTERO=centro`, el puntero en el medio del cuadro (la cámara sin el corrimiento del mouse, que en una esquina llega a
 * 22° de órbita: la colocación se verifica así); sin él, en la esquina de siempre del banco.
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { foto, mover } from '../scripts-escena/banco-escena'
import { FUERA } from '../scripts-escena/clips6'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { DIR10, abrir, carpeta } from './banco'

const VARIANTE = process.argv[2] ?? 'negro'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]

async function principal(): Promise<void> {
  const dir = carpeta('t3-titulos/sonda')
  const lectura = JSON.parse(readFileSync(`${DIR10}/t3-titulos/lectura-1440.json`, 'utf8')) as { ventanas: Record<string, { scroll: [number, number] } | null> }
  const b = await abrir(`producto,titulos=${VARIANTE}`, ANCHO, ALTO)
  try {
    const centro = process.env.PUNTERO === 'centro'
    await (centro ? mover(b, ANCHO / 2, ALTO / 2) : mover(b, FUERA[0], FUERA[1]))
    for (const id of ['portfolio', 'frase-izquierda']) {
      const v = lectura.ventanas[id]
      if (v === null || v === undefined) continue
      const [a, z] = v.scroll
      const puntos: readonly (readonly [string, number])[] = [['principio', a], ['medio', Math.round((a + z) / 2)], ['final', z]]
      for (const [nombre, y] of puntos) {
        // Subiendo desde antes del principio, como quien lee (las piezas del DOM tienen histéresis).
        await scrollHasta(b, y - 400)
        await esperar(600)
        await scrollHasta(b, y)
        await esperar(2500)
        writeFileSync(`${dir}/${id}-${nombre}-${VARIANTE}-${String(ANCHO)}${centro ? '-centro' : ''}.png`, await foto(b))
        console.log(id, nombre, JSON.stringify(await medir<unknown>(b.p, `window.__titulosDelBanco.titulos().filter((t) => t.visible).map((t) => ({ id: t.id, llegada: t.llegada, salida: t.salida, enElCuadro: t.enElCuadro, dom: t.dom }))`)))
      }
    }
    const errores = await medir<string[]>(b.p, 'window.__errores.filter((e) => !e.includes("LCP"))')
    console.log(JSON.stringify({ errores: errores.slice(0, 8) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t3-sonda.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
