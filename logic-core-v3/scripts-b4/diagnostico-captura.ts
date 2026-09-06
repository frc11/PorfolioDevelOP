/**
 * DIAGNÓSTICO — las dos preguntas que hay que cerrar ANTES de despachar.
 *
 * El humo dio 77,59 % de aire muerto en el hero a 1920 y B1 publicó **0 %**. Dos
 * números tan lejos con la misma definición no son una diferencia de sitio: son
 * una diferencia de instrumento. Hay dos sospechosos y este archivo los separa.
 *
 * **(1) ¿Hay que esperar a que la escena dibuje?** Se mide el aire muerto del
 * mismo viewport a los 0, 300, 1000 y 3000 ms después de `load`.
 *
 * **(2) ¿Una captura MÁS ALTA que la ventana ve la escena?** El escenario es
 * `fixed inset-0`. La pregunta no es retórica: las capturas por sección de B1 y
 * B2 —y las que van a tomar los tres frentes— son de dos, tres y cuatro
 * pantallas de alto. El discriminador es una sección `papel-transparente` que
 * NO es la primera: se captura de las dos formas y se comparan.
 */

import { readFileSync } from 'node:fs'

import { aireMuerto } from './aire-muerto'
import { cerrarChrome, lanzarChrome } from './cdp'
import { decodificarPng } from './png'
import { capturar } from './captura'
import { abrirPagina, emular, irA, medir, scrollA, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'

const PERFIL = perfilPorId('1920')
const TMP = process.env.TEMP ?? '.'

function aireDe(ruta: string): string {
  const img = decodificarPng(readFileSync(ruta))
  const a = aireMuerto(img)
  return `${img.ancho}×${img.alto}  aire ${a.porcentaje.toFixed(2)} %  banda ${a.bandaVaciaMaxPx} px`
}

const dormir = (ms: number): string =>
  `(async () => { await new Promise((r) => setTimeout(r, ${ms})); return true })()`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:\\Users\\Valentino\\.cache\\b4-medicion\\chrome-profile',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3002/v3')
    await verificarLaPagina(p, PERFIL)

    console.log('\n(1) EL AIRE MUERTO DEL HERO CONTRA EL TIEMPO DESDE `load`, captura de viewport')
    let acumulado = 0
    for (const ms of [0, 300, 700, 2000]) {
      if (ms > 0) await medir<boolean>(p, dormir(ms - acumulado))
      acumulado = ms
      await capturar(p, `${TMP}\\b4-t${ms}.png`)
      console.log(`  t+${String(ms).padStart(4)} ms   ${aireDe(`${TMP}\\b4-t${ms}.png`)}`)
    }

    const paneles = await medir<{ id: string; alto: number; top: number }[]>(
      p,
      `[...document.querySelectorAll('[data-panel]')].map((el) => {
        const r = el.getBoundingClientRect()
        return { id: el.dataset.panel, alto: r.height, top: r.top + window.scrollY }
      })`,
    )
    const pqd = paneles.find((s) => s.id === 'por-que-develop')
    if (pqd === undefined) throw new Error('no se encontró por-que-develop')

    console.log(`\n(2) \`por-que-develop\` — \`papel-transparente\`, top ${pqd.top}, alto ${pqd.alto}`)

    await capturar(p, `${TMP}\\b4-pqd-recorte.png`, {
      x: 0,
      y: pqd.top,
      width: PERFIL.ancho,
      height: pqd.alto,
    })
    console.log(`  A · recorte con el scroll en 0        ${aireDe(`${TMP}\\b4-pqd-recorte.png`)}`)

    const y = await scrollA(p, pqd.top)
    await medir<boolean>(p, dormir(1200))
    await capturar(p, `${TMP}\\b4-pqd-viewport.png`)
    console.log(`  B · viewport con el scroll en ${y}   ${aireDe(`${TMP}\\b4-pqd-viewport.png`)}`)

    await capturar(p, `${TMP}\\b4-pqd-recorte2.png`, {
      x: 0,
      y: pqd.top,
      width: PERFIL.ancho,
      height: pqd.alto,
    })
    console.log(`  C · recorte con el scroll EN la sección ${aireDe(`${TMP}\\b4-pqd-recorte2.png`)}`)

    const luzCanvas = await medir<{ dibuja: boolean; nota: string }>(
      p,
      `(() => {
        const c = document.querySelector('canvas')
        if (c === null) return { dibuja: false, nota: 'no hay canvas' }
        const r = c.getBoundingClientRect()
        return { dibuja: r.width > 0 && r.height > 0, nota: JSON.stringify({ w: r.width, h: r.height, top: r.top, pos: getComputedStyle(c.parentElement).position }) }
      })()`,
    )
    console.log(`  canvas: ${JSON.stringify(luzCanvas)}`)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
