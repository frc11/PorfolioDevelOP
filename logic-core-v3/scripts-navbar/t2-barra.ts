/**
 * SPRINT NAVBAR V3 · T2 — la barra propia del home: t2-barra.ts
 *
 *   · el modo en cada ancho (la barra desde `medio` si entra; abajo, el menú del teléfono), con la caja de la pastilla;
 *   · a 1440, la barra pegada arriba: en reposo, con el mouse sobre «Portfolio» (el rollover a mitad y terminado), con
 *     el foco del teclado en «Panel», y con el activo en Tu panel (el subrayado);
 *   · el clip: el mouse recorre los seis ítems despacio y después el teclado los recorre con Tab.
 * Va a `navbar/t2-barra/`.
 */
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, placaCorta, raton, tecla, type Banco } from './banco'

const PASTILLA = '[data-pieza="barra"] > [data-parte="pastilla"]'

/** La pastilla ampliada ×2 (la captura entera y el recorte: una captura con `clip` sale negra en este entorno). */
async function foto(b: Banco, archivo: string): Promise<void> {
  const caja = await medir<number[]>(b.p, `(() => { const r = document.querySelector('${PASTILLA}').getBoundingClientRect(); return [r.left, r.top, r.width, r.height].map(Math.round) })()`)
  const c = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  const entero = archivo.replace(/\.png$/, '-entero.png')
  writeFileSync(entero, Buffer.from(c.data, 'base64'))
  await b.p.conexion.enviar('Emulation.setDeviceMetricsOverride', { width: b.ancho, height: b.alto, deviceScaleFactor: 1, mobile: b.ancho < 1024, screenWidth: b.ancho, screenHeight: b.alto }, b.p.sessionId)
  const [x, y, w, h] = caja
  const m = 16
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', entero, '-vf', `crop=${String(w + 2 * m)}:${String(h + 2 * m)}:${String(Math.max(0, x - m))}:${String(Math.max(0, y - m))},scale=iw*2:-2:flags=lanczos`, archivo])
}

const centroDelItem = (b: Banco, id: string): Promise<[number, number]> =>
  medir<[number, number]>(b.p, `(() => { const r = document.querySelector('[data-pieza="barra-enlace"][href="#${id}"]').getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] })()`)

correr(async () => {
  const dir = carpeta('t2-barra')
  const modos: Record<string, unknown> = {}
  for (const [ancho, alto] of [[1440, 900], [1024, 768], [900, 900], [860, 900], [859, 900], [768, 1024], [390, 844]] as const) {
    const b = await abrir(ancho, alto)
    try {
      modos[String(ancho)] = await medir(b.p, `(() => { const h = document.querySelector('[data-pieza="barra"]'); const p = h.querySelector('[data-parte="pastilla"]'); const r = p.getBoundingClientRect(); const boton = document.querySelector('[data-parte="boton-del-menu"]'); return { modo: h.getAttribute('data-modo'), barraVisible: getComputedStyle(p).visibility, pastilla: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], lista: [p.scrollWidth, p.clientWidth], botonDelMenu: !!boton } })()`)
    } finally {
      await b.cerrar()
    }
  }
  console.log(JSON.stringify(modos))

  const b = await abrir(1440, 900)
  try {
    await raton(b, [1400, 880], [1400, 880], 1, 0)
    await medir(b.p, `window.scrollTo(0, document.querySelector('[data-panel="quienes-somos"]').getBoundingClientRect().top + scrollY + 400)`)
    await esperar(2500)
    await foto(b, `${dir}/1-reposo.png`)
    const portfolio = await centroDelItem(b, 'trabajos')
    await raton(b, [1400, 880], portfolio, 20, 16)
    await esperar(450)
    await foto(b, `${dir}/2-hover-a-mitad.png`)
    await esperar(1400)
    await foto(b, `${dir}/3-hover.png`)
    await raton(b, portfolio, [1400, 880], 10, 16)
    await esperar(1500)
    await medir(b.p, `document.querySelector('[data-pieza="barra-enlace"][href="#trabajos"]').focus()`)
    await tecla(b, 'Tab')
    await tecla(b, 'Tab')
    await esperar(1500)
    await foto(b, `${dir}/4-foco-en-panel.png`)
    await medir(b.p, 'document.activeElement.blur()')
    await medir(b.p, `window.scrollTo(0, document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect().top + scrollY + 200)`)
    await esperar(2500)
    await foto(b, `${dir}/5-activo-panel.png`)
    console.log('activo en Tu panel:', await medir<string>(b.p, `document.querySelector('[data-pieza="barra-enlace"][data-activo="true"]')?.textContent ?? 'ninguno'`))

    await medir(b.p, `window.scrollTo(0, document.querySelector('[data-panel="quienes-somos"]').getBoundingClientRect().top + scrollY + 400)`)
    await esperar(2500)
    const ids = ['quienes-somos', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop', 'cierre']
    const centros: [number, number][] = []
    for (const id of ids) centros.push(await centroDelItem(b, id === 'cierre' ? 'contacto' : id))
    const cuadros = await grabar(b, `${dir}/_cuadros`, async () => {
      await esperar(400)
      let desde: [number, number] = [centros[0][0] - 120, centros[0][1] + 60]
      for (const c of centros) {
        await raton(b, desde, c, 18, 16)
        await esperar(1100)
        desde = c
      }
      await raton(b, desde, [1400, 880], 12, 16)
      await esperar(800)
      await medir(b.p, 'document.querySelector(\'[data-pieza="salto"]\')?.focus()')
      for (let k = 0; k < 6; k += 1) {
        await tecla(b, 'Tab')
        await esperar(1000)
      }
      await esperar(600)
    }, 1440)
    armarClip(`${dir}/_cuadros`, cuadros, `${dir}/barra.mp4`, `la barra del home - el mouse y despues Tab - 1440 - ${placaCorta(b)}`)
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/barra.mp4`, '-vf', 'crop=iw*0.5:ih*0.12:iw*0.25:0,scale=trunc(iw*2/2)*2:-2', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', `${dir}/barra-de-cerca.mp4`])
    enCamaraLenta(`${dir}/barra-de-cerca.mp4`, `${dir}/barra-de-cerca-a-la-mitad.mp4`, 2)
  } finally {
    await b.cerrar()
  }
})
