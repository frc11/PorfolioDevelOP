/**
 * SPRINT INTERFAZ 2 · T3 — la onda de las portadas (`vida=si`): el clip lado a lado (el puntero entra a un libro, se
 * queda, pasa al siguiente) y una tira de capturas de cerca durante la onda.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, centroDe, correr, esperar, grabar, hastaElEstante, ladoALado, raton } from './banco'

const LIBRO = '[data-panel="trabajos"] a[data-pieza="libro"]'

correr(async () => {
  const dir = carpeta('t3-vida')
  const hechos: string[] = []
  for (const [pedido, rotulo] of [['producto', 'sin la bandera'], ['producto,vida=si', 'con vida=si']] as const) {
    const b = await abrir(1440, 900, { pedido })
    try {
      const fuera: [number, number] = [720, 860]
      await raton(b, [700, 840], fuera, 3, 30)
      if (!(await hastaElEstante(b))) throw new Error('no llegué al estante')
      const l2 = await centroDe(b, LIBRO, 2)
      const l3 = await centroDe(b, LIBRO, 3)
      if (l2 === null || l3 === null) throw new Error('sin libros')
      const cuadros = await grabar(b, `${dir}/_cuadros-portadas`, async () => {
        await esperar(500)
        await raton(b, fuera, [l2[0] - 30, l2[1] + 40], 14, 16)
        await esperar(1800)
        await raton(b, [l2[0] - 30, l2[1] + 40], [l3[0] + 10, l3[1] - 50], 8, 16)
        await esperar(1800)
      }, 1200)
      const destino = `${dir}/portadas-${pedido === 'producto' ? 'sin' : 'con'}.mp4`
      armarClip(`${dir}/_cuadros-portadas`, cuadros, destino, `portadas - ${rotulo} - ${b.placa.includes('NVIDIA') ? 'NVIDIA' : b.placa}`)
      hechos.push(destino)
      if (pedido !== 'producto') {
        // De cerca: la caja del libro en cuatro instantes de la onda (otro libro, para que nazca de nuevo).
        const l4 = await centroDe(b, LIBRO, 4)
        if (l4 !== null) {
          await raton(b, [l3[0] + 10, l3[1] - 50], fuera, 6, 16)
          await esperar(1200)
          await raton(b, fuera, [l4[0], l4[1] + 60], 6, 16)
          for (const ms of [60, 180, 330, 520, 800]) {
            await esperar(ms === 60 ? 60 : 120)
            const caja = await medir<{ x: number; y: number; w: number; h: number }>(b.p, `(() => { const r = document.querySelectorAll('${LIBRO}')[4].getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height } })()`)
            const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png', clip: { x: Math.max(0, caja.x - 40), y: Math.max(0, caja.y - 40), width: caja.w + 80, height: caja.h + 80, scale: 2 } }, b.p.sessionId)) as { data: string }
            writeFileSync(`${dir}/portada-${String(ms)}ms.png`, Buffer.from(c.data, 'base64'))
            await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false, screenWidth: 1440, screenHeight: 900 }, b.p.sessionId)
          }
        }
      }
    } finally {
      await b.cerrar()
    }
  }
  ladoALado(hechos[0], hechos[1], `${dir}/portadas-sin-y-con.mp4`, 540)
  console.log('listo')
})
