/**
 * 3D Y SONIDO · T0 — el hover de las fotos del equipo arrancando desde un punto: t0-fotos.ts
 *
 * A 1440 × 900, sobre Valentino y sobre Franco: el mouse entra al centro del retrato, se queda, sale; después una
 * entrada y salida rápida (se revierte desde donde va). Una toma, a tiempo real y a un cuarto. Va a `3d-sonido/t0-fotos/`.
 */
import { execFileSync } from 'node:child_process'
import { rmSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, antesDeLaParte, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, placaCorta, raton } from './banco'

correr(async () => {
  const dir = carpeta('t0-fotos')
  await antesDeLaParte('t0-fotos')
  const b = await abrir(1440, 900)
  try {
    // El orden del contenido: Franco primero, Valentino segundo.
    for (const [persona, indice] of [['Valentino', 1], ['Franco', 0]] as const) {
      // El retrato centrado en el cuadro y ya llegado (su llegada es por scroll y en curva: tres pasadas).
      for (let pasada = 0; pasada < 3; pasada += 1) {
        await medir(b.p, `(() => { const h = document.querySelectorAll('[data-pieza-a="persona"]')[${String(indice)}]; const m = h.querySelector('[data-marco="dos-tomas"]'); window.scrollTo(0, m.getBoundingClientRect().top + scrollY - (innerHeight - m.getBoundingClientRect().height) / 2) })()`)
        await esperar(1800)
      }
      const caja = await medir<[number, number, number, number]>(b.p, `(() => { const h = document.querySelectorAll('[data-pieza-a="persona"]')[${String(indice)}]; const r = h.querySelector('[data-marco="dos-tomas"]').getBoundingClientRect(); return [r.left, r.top, r.width, r.height] })()`)
      const centro: [number, number] = [caja[0] + caja[2] / 2, caja[1] + caja[3] / 2]
      const afuera: [number, number] = [caja[0] - 60, caja[1] + caja[3] / 2]
      await raton(b, afuera, afuera)
      await esperar(300)
      const crudo = `${dir}/_cuadros-${persona}`
      const cuadros = await grabar(b, crudo, async () => {
        await esperar(400)
        await raton(b, afuera, centro, 6)
        await esperar(1500)
        await raton(b, centro, afuera, 6)
        await esperar(1200)
        // Entrar y salir rápido: se revierte desde donde va.
        await raton(b, afuera, centro, 3)
        await esperar(180)
        await raton(b, centro, afuera, 3)
        await esperar(1000)
      }, 1440)
      const nombre = persona.toLowerCase()
      armarClip(crudo, cuadros, `${dir}/_pagina-${nombre}.mp4`, `T0 hover desde un punto - ${persona} - 1440 - ${placaCorta(b)}`)
      // La tarjeta con aire, para verla de cerca.
      const [x, y, w, h] = [caja[0] - 80, caja[1] - 60, caja[2] + 160, caja[3] + 120].map((v) => Math.max(0, Math.round(v / 2) * 2))
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', `${dir}/_pagina-${nombre}.mp4`, '-vf', `crop=${String(w)}:${String(h)}:${String(x)}:${String(y)}`, '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', `${dir}/hover-${nombre}.mp4`])
      rmSync(`${dir}/_pagina-${nombre}.mp4`)
      enCamaraLenta(`${dir}/hover-${nombre}.mp4`, `${dir}/hover-${nombre}-a-un-cuarto.mp4`, 4)
    }
  } finally {
    await b.cerrar()
  }
})
