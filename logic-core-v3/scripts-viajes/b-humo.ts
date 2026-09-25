/* SPRINT VIAJES — humo: desde el hero, clic en cada ítem de la barra (o del menú); dónde llega, cuánto tarda y cómo se ve a mitad de camino y al llegar. b-humo.ts <ancho> <alto> */
import { medir } from '../scripts-b4/navegador'
import { abrirBanco, captura, esperar, scrollHasta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/viajes/humo'
const DESTINOS = ['quienes-somos', 'trabajos', 'servicios', 'por-que-develop']

/** Clic en el ítem: el de la barra si se ve, si no el del menú (que antes hay que abrir). */
export async function clicEnElItem(b: Awaited<ReturnType<typeof abrirBanco>>, id: string): Promise<string> {
  return medir<string>(
    b.p,
    `(async () => {
      const barra = document.querySelector('[data-pieza="navegacion"]')
      const enBarra = barra?.getAttribute('data-modo') !== 'menu' ? barra.querySelector('a[data-pieza="nav-enlace"][href="#${id}"]') : null
      if (enBarra) { enBarra.click(); return 'barra' }
      document.querySelector('[data-parte="boton-del-menu"]').click()
      await new Promise((r) => setTimeout(r, 600))
      const item = document.querySelector('[data-parte="item-del-menu"][href="#${id}"]')
      if (!item) return 'sin ítem'
      item.click()
      return 'menú'
    })()`,
  )
}

async function principal(): Promise<void> {
  const { mkdirSync } = await import('node:fs')
  mkdirSync(DIR, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO)
  try {
    for (const id of DESTINOS) {
      await scrollHasta(b, 0)
      const t0 = Date.now()
      const via = await clicEnElItem(b, id)
      await esperar(1500)
      await captura(b, `${DIR}/${String(ANCHO)}-hero-a-${id}-medio.png`)
      // Llega cuando el velo se fue.
      let llego = 0
      for (let i = 0; i < 60; i += 1) {
        const velo = await medir<boolean>(b.p, `document.querySelector('[data-v3] main').hasAttribute('data-v3-deslizando')`)
        if (!velo) { llego = Date.now() - t0; break }
        await esperar(50)
      }
      await esperar(1200)
      const y = await medir<number>(b.p, 'scrollY')
      const tope = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return r.top + scrollY })()`)
      await captura(b, `${DIR}/${String(ANCHO)}-hero-a-${id}.png`)
      console.log(JSON.stringify({ ancho: ANCHO, id, via, llegoMs: llego, y, tope: Math.round(tope), desdeElTope: Math.round(y - tope) }))
    }
  } finally {
    await b.cerrar()
  }
}
if (process.argv[1]?.endsWith('b-humo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
