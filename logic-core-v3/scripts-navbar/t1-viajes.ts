/**
 * SPRINT NAVBAR V3 · T1 — los viajes de cada ítem, desde el hero: t1-viajes.ts [trazas|clips] [ancho]
 *
 *   · `trazas`: por ancho, cada ítem desde el hero (con la barra arriba de 860, con el menú del teléfono abajo): el
 *     scroll cuadro a cuadro con el velo puesto o no, dónde frena el primer tramo y dónde termina. Va a
 *     `navbar/t1-destinos/trazas-<ancho>.json` con un resumen por ítem en la consola.
 *   · `clips`: el clip de cada viaje desde el hero a 1440 (y a 390 con el menú), a velocidad real.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, esperar, grabar, placaCorta, type Banco } from './banco'

const ITEMS = ['quienes-somos', 'trabajos', 'servicios', 'tu-panel', 'por-que-develop'] as const

/** El ítem de la barra (o del menú, abriéndolo) que lleva a `id`. */
async function tocar(b: Banco, id: string): Promise<void> {
  const enBarra = await medir<boolean>(b.p, `(() => { const h = document.querySelector('[data-pieza="barra"], [data-pieza="navegacion"]'); return !!h && h.getAttribute('data-modo') === 'barra' && getComputedStyle(h).visibility !== 'hidden' })()`)
  if (enBarra) {
    await medir(b.p, `document.querySelector('[data-pieza="barra"] a[href="#${id}"], [data-pieza="navegacion"] a[href="#${id}"]').click()`)
    return
  }
  await medir(b.p, `document.querySelector('[data-parte="boton-del-menu"]').click()`)
  await esperar(1200)
  await medir(b.p, `document.querySelector('[data-pieza="menu-movil"] a[href="#${id}"]').click()`)
}

/** Cada viaje sale de un hero recién cargado: volver de un salto desde la noche de Trabajos la deja puesta. */
async function desdeElHero(b: Banco): Promise<void> {
  await medir(b.p, 'location.reload()')
  await esperar(6000)
}

const MUESTREO = `(() => { window.__traza = []; const t0 = performance.now(); const main = document.querySelector('[data-v3] main'); const paso = () => { window.__traza.push([Math.round(performance.now() - t0), Math.round(scrollY), main.hasAttribute('data-v3-deslizando') ? 1 : 0]); window.__muestreo = requestAnimationFrame(paso) }; paso() })()`

interface Resumen {
  readonly id: string
  readonly final: number
  readonly frenoEn: number | null
  readonly msTapado: number
  readonly msTotal: number
}

async function trazas(ancho: number, alto: number): Promise<void> {
  const dir = carpeta('t1-destinos')
  const b = await abrir(ancho, alto)
  const salida: Record<string, unknown> = { placa: b.placa }
  const resumen: Resumen[] = []
  try {
    for (const id of ITEMS) {
      await desdeElHero(b)
      await medir(b.p, MUESTREO)
      await tocar(b, id)
      await esperar(id === 'trabajos' || id === 'por-que-develop' ? 7500 : 4500)
      const traza = await medir<[number, number, number][]>(b.p, 'cancelAnimationFrame(window.__muestreo), window.__traza')
      // El primer tramo frena donde el velo se va con el scroll quieto; el total, en el último cambio de scroll.
      const sinVelo = traza.findIndex((m, i) => i > 0 && traza[i - 1][2] === 1 && m[2] === 0)
      const ultimoCambio = traza.reduce((u, m, i) => (i > 0 && m[1] !== traza[i - 1][1] ? m[0] : u), 0)
      const primerVelo = traza.find((m) => m[2] === 1)?.[0] ?? 0
      const final = traza[traza.length - 1][1]
      const frenoEn = sinVelo > 0 && traza[sinVelo][1] !== final ? traza[sinVelo][1] : null
      resumen.push({ id, final, frenoEn, msTapado: sinVelo > 0 ? traza[sinVelo][0] - primerVelo : 0, msTotal: ultimoCambio - primerVelo })
      salida[id] = traza
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/trazas-${String(ancho)}.json`, JSON.stringify({ ...salida, resumen }, null, 0))
  console.log(ancho, placaCorta({ placa: String(salida.placa) } as Banco), JSON.stringify(resumen))
}

async function clips(ancho: number, alto: number): Promise<void> {
  const dir = carpeta('t1-destinos')
  const b = await abrir(ancho, alto)
  try {
    for (const id of ITEMS) {
      await desdeElHero(b)
      const cuadros = await grabar(b, `${dir}/_cuadros-${id}`, async () => {
        await esperar(400)
        await tocar(b, id)
        await esperar(id === 'trabajos' || id === 'por-que-develop' ? 7800 : 4800)
      }, ancho >= 1024 ? 1200 : 540)
      armarClip(`${dir}/_cuadros-${id}`, cuadros, `${dir}/${id}-${String(ancho)}.mp4`, `hero -> ${id} - ${String(ancho)} - ${placaCorta(b)}`)
    }
  } finally {
    await b.cerrar()
  }
}

correr(async () => {
  const que = process.argv[2] ?? 'trazas'
  const anchos: (readonly [number, number])[] = process.argv[3] === undefined ? [[1440, 900], [1024, 768], [390, 844]] : [[Number(process.argv[3]), Number(process.argv[4] ?? 900)]]
  for (const [ancho, alto] of anchos) {
    if (que === 'trazas') await trazas(ancho, alto)
    else await clips(ancho, alto)
  }
})
