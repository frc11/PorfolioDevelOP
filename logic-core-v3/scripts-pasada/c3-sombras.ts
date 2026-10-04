/**
 * PASADA FINAL · C3 — LA SOMBRA DE LOS TÍTULOS, CON Y SIN: npx tsx scripts-pasada/c3-sombras.ts [ancho alto]
 *
 * Con `?pruebas=sombratitulos=si`, recorre las secciones y, donde hay un título de volumen armado a la vista, captura el
 * mismo cuadro con la sombra y sin ella (el banco la apaga en la misma tarea) y anota cuánto oscurece de día y cuánto le
 * quita al haz de noche. Las dos capturas van lado a lado en `~/.cache/b4-medicion/pasada-final/c3/`. Pide el servidor.
 */
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { mover } from '../scripts-escena/banco-escena'
import { abrir } from '../scripts-escena10/banco'
import { captura, esperar } from '../scripts-viajes/banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? '1440'), Number(process.argv[3] ?? '900')]
const SALIDA = `C:/Users/Valentino/.cache/b4-medicion/pasada-final/c3/${String(ANCHO)}`

interface Titulo { readonly id: string; readonly visible: boolean; readonly mostrado: { readonly llegada: number } }

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const b = await abrir('producto,sombratitulos=si', ANCHO, ALTO)
  const informe: Record<string, unknown>[] = []
  try {
    await mover(b, 8, Math.round(ALTO / 2))
    const conSombra = await medir<boolean>(b.p, '!!window.__sombraDeLosTitulosDelBanco')
    if (!conSombra) throw new Error('sin __sombraDeLosTitulosDelBanco (¿la prueba no montó?)')
    // Dónde mirar: el comienzo de cada sección y un poco más abajo.
    const lugares = await medir<{ id: string; y: number }[]>(b.p, `Array.from(document.querySelectorAll('[data-panel]')).map((s) => ({ id: s.getAttribute('data-panel'), y: Math.round(s.getBoundingClientRect().top + scrollY) }))`)
    const pedidos: { id: string; y: number }[] = [{ id: 'hero', y: 0 }]
    for (const l of lugares) for (const k of [0.15, 0.6]) pedidos.push({ id: `${l.id}-${String(k)}`, y: Math.max(0, l.y + Math.round(k * ALTO)) })
    for (const { id, y } of pedidos) {
      await medir(b.p, `scrollTo(0, ${String(y)})`)
      await esperar(3200)
      const titulos = (await medir<Titulo[] | null>(b.p, '(window.__titulosDelBanco ? window.__titulosDelBanco.titulos() : null)')) ?? []
      const aLaVista = titulos.filter((t) => t.visible && t.mostrado.llegada > 0.95).map((t) => t.id)
      const estado = await medir<{ dia: number; noche: number; copias: number; radio: number }>(b.p, 'window.__sombraDeLosTitulosDelBanco.estado()')
      if (aLaVista.length === 0) {
        informe.push({ id, y, aLaVista, estado })
        continue
      }
      // El mismo cuadro, con y sin: se apaga, se espera un cuadro, se captura; se prende y se captura.
      await medir(b.p, `new Promise((r) => { window.__sombraDeLosTitulosDelBanco.poner(false); requestAnimationFrame(() => requestAnimationFrame(r)) })`)
      await captura(b, `${SALIDA}/${id}-sin.png`)
      await medir(b.p, `new Promise((r) => { window.__sombraDeLosTitulosDelBanco.poner(true); requestAnimationFrame(() => requestAnimationFrame(r)) })`)
      await captura(b, `${SALIDA}/${id}-con.png`)
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${SALIDA}/${id}-sin.png`, '-i', `${SALIDA}/${id}-con.png`, '-filter_complex', `[0:v]scale=${String(Math.round(ANCHO / 2))}:-2[a];[1:v]scale=${String(Math.round(ANCHO / 2))}:-2[b];[a][b]hstack=inputs=2`, `${SALIDA}/${id}-lado-a-lado.png`])
      informe.push({ id, y, aLaVista, estado })
      console.log(JSON.stringify(informe[informe.length - 1]))
    }
  } finally {
    writeFileSync(`${SALIDA}/informe.json`, JSON.stringify(informe, null, 1))
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('c3-sombras.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
