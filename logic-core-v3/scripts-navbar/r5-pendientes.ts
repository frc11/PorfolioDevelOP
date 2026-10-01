/**
 * SPRINT NAVBAR V3 · RETOQUE 5 — el carrusel con movimiento reducido: r5-pendientes.ts
 *
 * A 390 y a 375, con y sin movimiento reducido: el ancho del cuadro y de la página (el renglón del carrusel se pasaba 6 px
 * del borde y la rama quieta medía 402), y el anillo de foco en la primera portada del carrusel (Tab), con una foto.
 * Va a `navbar/retoque/5-pendientes/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, correr, esperar, tecla } from './banco'

correr(async () => {
  const dir = carpeta('retoque/5-pendientes')
  const salida: Record<string, unknown> = {}
  for (const [ancho, alto] of [[390, 844], [375, 667]] as const) {
    for (const reducido of [true, false]) {
      const b = await abrir(ancho, alto, { reducido, anchoTolerado: 20 })
      const rotulo = `${String(ancho)}${reducido ? '-reducido' : ''}`
      try {
        salida[rotulo] = await medir(b.p, '({ cuadro: innerWidth, pagina: document.documentElement.scrollWidth })')
        // La primera portada del carrusel con el foco del teclado: Tab desde el elemento anterior.
        const listo = await medir<boolean>(b.p, `(() => { const p = document.querySelector('[data-pieza="carrusel"] [data-parte="portada"]'); if (!p) return false; p.scrollIntoView({ block: 'center' }); const todos = [...document.querySelectorAll('a[href], button')]; const i = todos.indexOf(p); if (i > 0) todos[i - 1].focus(); return true })()`)
        if (listo) {
          await esperar(1500)
          await tecla(b, 'Tab')
          await esperar(800)
          const caja = await medir<number[]>(b.p, `(() => { const r = document.activeElement.getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round) })()`)
          const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
          const entero = `${dir}/foco-${rotulo}-entero.png`
          writeFileSync(entero, Buffer.from(c.data, 'base64'))
          const [x, y, w, h] = caja
          execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', entero, '-vf', `crop=${String(Math.min(ancho, w + 40))}:${String(h + 40)}:0:${String(Math.max(0, y - 20))},scale=iw*2:-2:flags=lanczos`, `${dir}/foco-${rotulo}.png`])
          ;(salida[rotulo] as Record<string, unknown>).foco = { caja, enfocado: await medir<string>(b.p, `document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.tagName`) }
        }
      } finally {
        await b.cerrar()
      }
    }
  }
  writeFileSync(`${dir}/medida.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida))
})
