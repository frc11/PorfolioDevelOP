/**
 * SPRINT NAVBAR V3 · RETOQUE 4 — el hover de la barra, en sus dos variantes: r4-hover.ts
 *
 * Por variante (`?interfaz=navhover=a` y `=b`), a 1440 con la barra pegada arriba: la pastilla en reposo, con el mouse
 * sobre «Portfolio» (a mitad del gesto y terminado), con el foco del teclado en «Panel», y el clip del mouse recorriendo
 * los seis ítems y después Tab. Va a `navbar/retoque/4-hover/<variante>/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, placaCorta, raton, tecla, type Banco } from './banco'

const PASTILLA = '[data-pieza="barra"] > [data-parte="pastilla"]'

async function foto(b: Banco, archivo: string): Promise<void> {
  const caja = await medir<number[]>(b.p, `(() => { const r = document.querySelector('${PASTILLA}').getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round) })()`)
  const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  const entero = `${archivo.replace(/\.png$/, '')}-entero.png`
  writeFileSync(entero, Buffer.from(c.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: false, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
  const [x, y, w, h] = caja
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', entero, '-vf', `crop=${String(w + 32)}:${String(h + 32)}:${String(x - 16)}:${String(Math.max(0, y - 16))},scale=iw*2:-2:flags=lanczos`, archivo])
}

const centroDe = (b: Banco, href: string): Promise<[number, number]> =>
  medir<[number, number]>(b.p, `(() => { const r = document.querySelector('[data-pieza="barra-enlace"][href="${href}"]').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] })()`)

correr(async () => {
  for (const variante of ['a', 'b'] as const) {
    const dir = carpeta(`retoque/4-hover/${variante}`)
    const b = await abrir(1440, 900, { consulta: `interfaz=navhover=${variante}` })
    try {
      console.log(variante, await medir<string>(b.p, `document.querySelector('[data-pieza="barra"]').getAttribute('data-navhover')`))
      await raton(b, [1400, 880], [1400, 880], 1, 0)
      await medir(b.p, `window.scrollTo(0, document.querySelector('[data-panel="quienes-somos"]').getBoundingClientRect().top + scrollY + 400)`)
      await esperar(2500)
      await foto(b, `${dir}/1-reposo.png`)
      const portfolio = await centroDe(b, '#trabajos')
      await raton(b, [1400, 880], portfolio, 20, 16)
      await esperar(180)
      await foto(b, `${dir}/2-hover-a-mitad.png`)
      await esperar(900)
      await foto(b, `${dir}/3-hover.png`)
      await raton(b, portfolio, [1400, 880], 10, 16)
      await esperar(1200)
      await medir(b.p, `document.querySelector('[data-pieza="barra-enlace"][href="#servicios"]').focus()`)
      await tecla(b, 'Tab')
      await esperar(1000)
      await foto(b, `${dir}/4-foco-en-panel.png`)
      await medir(b.p, 'document.activeElement.blur()')
      await esperar(800)
      const hrefs = ['#quienes-somos', '#trabajos', '#servicios', '#tu-panel', '#por-que-develop', '#contacto']
      const centros: [number, number][] = []
      for (const h of hrefs) centros.push(await centroDe(b, h))
      const cuadros = await grabar(b, `${dir}/_cuadros`, async () => {
        await esperar(400)
        let desde: [number, number] = [centros[0][0] - 120, centros[0][1] + 60]
        for (const c of [...centros, centros[2], centros[0]]) {
          await raton(b, desde, c, 18, 16)
          await esperar(700)
          desde = c
        }
        await raton(b, desde, [1400, 880], 12, 16)
        await esperar(900)
        await medir(b.p, 'document.querySelector(\'[data-pieza="salto"]\')?.focus()')
        for (let k = 0; k < 6; k += 1) {
          await tecla(b, 'Tab')
          await esperar(700)
        }
        await esperar(600)
      }, 1440)
      armarClip(`${dir}/_cuadros`, cuadros, `${dir}/hover-${variante}.mp4`, `la barra - hover ${variante} - el mouse y despues Tab - 1440 - ${placaCorta(b)}`)
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/hover-${variante}.mp4`, '-vf', 'crop=iw*0.5:ih*0.12:iw*0.25:0', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', `${dir}/hover-${variante}-de-cerca.mp4`])
      enCamaraLenta(`${dir}/hover-${variante}-de-cerca.mp4`, `${dir}/hover-${variante}-de-cerca-a-la-mitad.mp4`, 2)
    } finally {
      await b.cerrar()
    }
  }
})
