/** SPRINT NAVBAR V3 · T1 — el viaje hero → Por qué develOP con el instrumento del destello: la fracción de celdas de cada pico (geometría o luz) y las miniaturas alrededor. t1-sonda-destello.ts [ítem] */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirMotor } from '../scripts-calidad/motor/abrir'
import { grabarCuadros, irAlControl } from '../scripts-escena10/destello'
import { BANDAS, COLUMNAS, INSTRUMENTO, MINI, bandasALaVista, destellosEn, type Cuadro, type Pico } from '../scripts-escena10/destello-instrumento'
import { clicEnElItem } from '../scripts-viajes/b-humo'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { carpeta } from './banco'

/** Qué fracción de las celdas a la vista se sale, cada una, del rango de sus vecinos en la dirección del pico. */
function fraccion(cuadros: readonly Cuadro[], p: Pico): number {
  const v = cuadros.slice(p.i - 1, p.i + p.cuadros + 1)
  const vistas = v.map(bandasALaVista)
  const sube = p.luminancias[1] > p.luminancias[0]
  let [n, fuera] = [0, 0]
  for (let b = 0; b < BANDAS; b += 1) {
    if (!vistas.every((x) => x[b])) continue
    for (let c = 0; c < COLUMNAS; c += 1) {
      const k = b * COLUMNAS + c
      const [a, z] = [v[0].celdas[k], v[v.length - 1].celdas[k]]
      const medio = v.slice(1, -1).map((x) => x.celdas[k])
      const d = sube ? Math.min(...medio) - Math.max(a, z) : Math.min(a, z) - Math.max(...medio)
      n += 1
      if (d > 0.0125) fuera += 1
    }
  }
  return fuera / Math.max(1, n)
}

async function principal(): Promise<void> {
  const dir = carpeta('_exploracion/destello')
  const b = await abrirMotor(1440, 900, { conVsync: true })
  try {
    for (let i = 0; i < 60 && !(await medir<boolean>(b.p, 'typeof window.__gpuDelBanco?.tres === "function"')); i += 1) await esperar(500)
    await medir(b.p, INSTRUMENTO)
    for (let k = 0; k < 2; k += 1) {
      await scrollHasta(b, 0)
      await esperar(2500)
      const r = await grabarCuadros(b, async () => {
        await clicEnElItem(b, process.argv[2] ?? 'por-que-develop')
        await esperar(8200)
      })
      const picos = destellosEn(r.cuadros, 0.025)
      console.log(k, 'picos', JSON.stringify(picos.map((p) => ({ i: p.i, y: Math.round(r.cuadros[p.i].y), fuera: p.fuera, celdas: Number(fraccion(r.cuadros, p).toFixed(2)) }))))
      for (const p of picos) {
        const desde = Math.max(0, p.i - 3)
        const hasta = Math.min(r.n, p.i + 4)
        const b64 = await medir<string>(b.p, `window.__destello.minis(${String(desde)}, ${String(hasta)})`)
        const crudo = `${dir}/_crudo.rgb`
        writeFileSync(crudo, Buffer.from(b64, 'base64'))
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${String(MINI.ancho)}x${String(MINI.alto)}`, '-i', crudo, '-vf', `scale=384:-1:flags=neighbor,tile=${String(hasta - desde)}x1`, '-frames:v', '1', `${dir}/pico-${String(k)}-${String(p.i)}.png`])
        console.log('  y por cuadro', r.cuadros.slice(desde, hasta).map((c) => Math.round(c.y)).join(' '), ' luz', r.cuadros.slice(desde, hasta).map((c) => (c.celdas.reduce((s, x) => s + x, 0) / c.celdas.length).toFixed(3)).join(' '))
      }
    }
    await irAlControl(b)
    const c = await grabarCuadros(b, async () => {
      await esperar(500)
      await medir(b.p, 'window.__amanecerDelBanco.destello()')
      await esperar(600)
    })
    console.log('control', JSON.stringify(destellosEn(c.cuadros, 0.025).map((p) => ({ i: p.i, fuera: p.fuera, celdas: Number(fraccion(c.cuadros, p).toFixed(2)) }))))
  } finally {
    await b.cerrar()
  }
}

principal().catch((e: unknown) => {
  console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`)
  process.exit(1)
})
