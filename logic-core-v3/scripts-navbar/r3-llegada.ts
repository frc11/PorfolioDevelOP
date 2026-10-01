/**
 * SPRINT NAVBAR V3 · RETOQUE 3 — la llegada a Portfolio y a Por qué develOP: r3-llegada.ts
 *
 * Desde el hero recién cargado, con la barra (1440) y con el menú (390): el clip de cada viaje (y a la mitad de
 * velocidad), y la traza —el scroll cuadro a cuadro, el velo y el progreso que el título muestra (la escala y la
 * opacidad del título)— para ver que el viaje dura lo de todos y que el título llega DESPUÉS, sin que la página se mueva.
 * Va a `navbar/retoque/3-llegada/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, enCamaraLenta, esperar, grabar, placaCorta, type Banco } from './banco'

const TITULO: Record<string, string> = {
  trabajos: '[data-pieza="cartel"] h2',
  'por-que-develop': '[data-pieza="frase-del-final"]',
}

async function tocar(b: Banco, id: string): Promise<void> {
  if (b.ancho >= 1024) {
    await medir(b.p, `document.querySelector('[data-pieza="barra"] a[href="#${id}"]').click()`)
    return
  }
  await medir(b.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
  await esperar(1200)
  await medir(b.p, `document.querySelector('[data-pieza="menu-movil"] a[href="#${id}"]').click()`)
}

const traza = (selector: string): string =>
  `(() => { window.__traza = []; const t0 = performance.now(); const main = document.querySelector('[data-v3] main'); const paso = () => { const t = document.querySelector('${selector}'); const s = t ? getComputedStyle(t) : null; const r = t ? t.getBoundingClientRect() : null; window.__traza.push([Math.round(performance.now() - t0), Math.round(scrollY), main.hasAttribute('data-v3-deslizando') ? 1 : 0, r ? Math.round(r.top) : null, r ? Math.round(r.height) : null]); window.__muestreo = requestAnimationFrame(paso) }; paso() })()`

correr(async () => {
  const dir = carpeta('retoque/3-llegada')
  const resumen: Record<string, unknown> = {}
  for (const [ancho, alto] of [[1440, 900], [390, 844]] as const) {
    const b = await abrir(ancho, alto)
    try {
      for (const id of ['trabajos', 'por-que-develop']) {
        await medir(b.p, 'location.reload()')
        await esperar(6000)
        await medir(b.p, traza(TITULO[id]))
        const cuadros = await grabar(b, `${dir}/_cuadros`, async () => {
          await esperar(300)
          await tocar(b, id)
          await esperar(5200)
        }, ancho >= 1024 ? 1200 : 540)
        const t = await medir<[number, number, number, number | null, number | null][]>(b.p, 'cancelAnimationFrame(window.__muestreo), window.__traza')
        armarClip(`${dir}/_cuadros`, cuadros, `${dir}/${id}-${String(ancho)}.mp4`, `hero -> ${id} - ${String(ancho)} - ${placaCorta(b)}`)
        enCamaraLenta(`${dir}/${id}-${String(ancho)}.mp4`, `${dir}/${id}-${String(ancho)}-a-la-mitad.mp4`, 2)
        const conVelo = t.filter((m) => m[2] === 1)
        const ultimoScroll = t.reduce((u, m, i) => (i > 0 && m[1] !== t[i - 1][1] ? m[0] : u), 0)
        resumen[`${id}-${String(ancho)}`] = { velo: conVelo.length === 0 ? null : [conVelo[0][0], conVelo[conVelo.length - 1][0]], ultimoMovimientoDelScroll: ultimoScroll, final: t[t.length - 1][1] }
        writeFileSync(`${dir}/traza-${id}-${String(ancho)}.json`, JSON.stringify(t))
      }
    } finally {
      await b.cerrar()
    }
  }
  writeFileSync(`${dir}/resumen.json`, JSON.stringify(resumen, null, 1))
  console.log(JSON.stringify(resumen))
})
