/**
 * SPRINT ESCENA 2 — ¿el logo queda IDÉNTICO? logo.ts <nombre> [variante] [ancho] [alto]
 *
 * Recorre los momentos como `comparar.ts` (Hero → Quiénes → Trabajos → Por qué → pie, por scroll a
 * pasos) y en Por qué develOP y en el pie mide el logo sobre la escena sola (`<main>` escondido):
 * la caja y el centro de la tinta negra (luminancia < 60, fuera de la barra), en tres tomas a 1 s.
 * Con `variante` pisa `_lib/escena/entorno.ts` (`base`, `producto`, …); sin ella, el producto
 * como está. Guarda las capturas y un JSON por nombre en `~/.cache/b4-medicion/escena2/logo/`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { decodificarPng } from '../scripts-b4/png'
import { abrirBanco, esperar, scrollHasta, type Banco } from '../scripts-viajes/banco'

const [NOMBRE, VARIANTE, ANCHO, ALTO] = [process.argv[2] ?? 'base', process.argv[3] ?? '', Number(process.argv[4] ?? 1440), Number(process.argv[5] ?? 900)]
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/escena2/logo'

export interface CajaDelLogo {
  readonly x0: number
  readonly y0: number
  readonly x1: number
  readonly y1: number
  readonly cx: number
  readonly cy: number
  readonly pixeles: number
}

/** La tinta del logo: píxeles con luminancia < 60, debajo de la barra (y > 90). */
export function cajaDelLogo(png: Buffer): CajaDelLogo {
  const img = decodificarPng(png)
  let [x0, y0, x1, y1, sx, sy, n] = [Infinity, Infinity, -Infinity, -Infinity, 0, 0, 0]
  for (let y = 90; y < img.alto; y += 1) {
    for (let x = 0; x < img.ancho; x += 1) {
      const i = (y * img.ancho + x) * 4
      if (0.2126 * img.datos[i] + 0.7152 * img.datos[i + 1] + 0.0722 * img.datos[i + 2] >= 60) continue
      x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y)
      sx += x; sy += y; n += 1
    }
  }
  return { x0, y0, x1, y1, cx: Math.round((sx / n) * 10) / 10, cy: Math.round((sy / n) * 10) / 10, pixeles: n }
}

/** La escena sola: el `<main>` escondido dos cuadros, captura, y todo de vuelta. */
export async function escenaSola(b: Banco): Promise<Buffer> {
  await medir(b.p, `(() => { document.querySelector('[data-v3] main').style.visibility = 'hidden'; return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))) })()`)
  const shot = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  await medir(b.p, `(() => { document.querySelector('[data-v3] main').style.visibility = ''; return 0 })()`)
  return Buffer.from(shot.data, 'base64')
}

/** Un píxel ida y vuelta: vuelve a disparar el scroll por si una captura dejó la página congelada. */
export async function empujon(b: Banco): Promise<void> {
  await medir(b.p, 'new Promise((r) => { const y = scrollY; window.scrollTo(0, y - 1); setTimeout(() => { window.scrollTo(0, y); setTimeout(() => r(0), 150) }, 150) })')
}

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena2', antesDeCargar: VARIANTE === '' ? undefined : `window.__entornoDeLaEscena = '${VARIANTE}'` })
  const salida: Record<string, CajaDelLogo[]> = {}
  try {
    const topeMas = (id: string, pantallas: number): Promise<number> => medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return Math.round(r.top + scrollY + ${String(pantallas)} * innerHeight) })()`)
    await scrollHasta(b, await topeMas('quienes-somos', 0.15))
    await scrollHasta(b, await topeMas('trabajos', 0))
    for (const [momento, y] of [['por-que-develop', await topeMas('por-que-develop', 0.7)], ['pie', -1]] as const) {
      await scrollHasta(b, y < 0 ? await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight') : y)
      await empujon(b)
      await esperar(2500)
      salida[momento] = []
      for (let toma = 0; toma < 3; toma += 1) {
        const png = await escenaSola(b)
        writeFileSync(`${DIR}/${NOMBRE}-${momento}-${String(ANCHO)}-${String(toma)}.png`, png)
        salida[momento].push(cajaDelLogo(png))
        await esperar(1000)
      }
      console.log(JSON.stringify({ nombre: NOMBRE, momento, y: await medir<number>(b.p, 'scrollY'), cajas: salida[momento] }))
    }
    writeFileSync(`${DIR}/${NOMBRE}-${String(ANCHO)}.json`, JSON.stringify(salida, null, 2))
  } finally {
    await b.cerrar()
  }
}
if (process.argv[1]?.endsWith('logo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
