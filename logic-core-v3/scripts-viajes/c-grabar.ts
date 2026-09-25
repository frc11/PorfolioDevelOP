/**
 * SPRINT VIAJES — la grabación: una cadena de viajes por la barra (o el menú), en un solo video.
 * c-grabar.ts <ancho> <alto> <nombre> <destinos separados por coma>
 *
 * La barra no tiene «Inicio»: para viajar al Hero el instrumento pone un enlace OCULTO adentro de
 * la barra (con la misma marca que los ítems) y lo cliquea. La interfaz no cambia.
 */
import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar } from './banco'
import { clicEnElItem } from './b-humo'

const [ANCHO, ALTO, NOMBRE] = [Number(process.argv[2]), Number(process.argv[3]), process.argv[4]]
const CADENA = process.argv[5].split(',')
const RAIZ = 'C:/Users/Valentino/.cache/b4-medicion/viajes/grabaciones'

async function principal(): Promise<void> {
  const dir = `${RAIZ}/${NOMBRE}`
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO)
  const s = b.p.sessionId
  try {
    await medir(b.p, `(() => { const a = document.createElement('a'); a.href = '#hero'; a.setAttribute('data-pieza', 'nav-enlace'); a.setAttribute('data-instrumento', ''); a.style.display = 'none'; document.querySelector('[data-pieza="navegacion"]').appendChild(a); return 0 })()`)
    const cuadros: { t: number; data: string }[] = []
    b.p.conexion.al('Page.screencastFrame', (crudo) => {
      const params = crudo as unknown as { data: string; sessionId: number; metadata: { timestamp: number } }
      cuadros.push({ t: params.metadata.timestamp, data: params.data })
      void b.p.conexion.enviar('Page.screencastFrameAck', { sessionId: params.sessionId }, s)
    })
    await b.p.conexion.enviar('Page.startScreencast', { format: 'jpeg', quality: 80, everyNthFrame: 1 }, s)
    await esperar(1000)
    for (const id of CADENA) {
      if (id === 'hero') await medir(b.p, `(() => { document.querySelector('[data-instrumento]').click(); return 0 })()`)
      else await clicEnElItem(b, id)
      await esperar(5200)
    }
    await b.p.conexion.enviar('Page.stopScreencast', {}, s)
    const lista: string[] = []
    cuadros.forEach((c, i) => {
      const n = `c${String(i).padStart(5, '0')}.jpg`
      writeFileSync(`${dir}/${n}`, Buffer.from(c.data, 'base64'))
      const dur = i + 1 < cuadros.length ? cuadros[i + 1].t - c.t : 0.1
      lista.push(`file '${n}'`, `duration ${dur.toFixed(4)}`)
    })
    writeFileSync(`${dir}/lista.txt`, `${lista.join('\n')}\n`)
    const salida = `${RAIZ}/${NOMBRE}.mp4`
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', `${dir}/lista.txt`, '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', salida])
    console.log(JSON.stringify({ salida, cuadros: cuadros.length }))
  } finally {
    await b.cerrar()
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
