/**
 * SPRINT ESCENA 6 · 6g — el contraste del texto de «Por qué develOP» mientras el día entra desde
 * afuera. dia6.ts
 *
 * Baja despacio de Tu panel a «Por qué develOP» con la variante; cuando la compuerta prende el día
 * (`__diaDelBanco`), toma una captura cada 0,35 s mientras dura el barrido y mide cada elemento de
 * texto a la vista con la cuenta WCAG de `wcag6.ts`. Deja las capturas en `dia-desde-afuera/cuadros/`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, scrollHasta } from '../scripts-viajes/banco'
import { DIR6, PUNTO_DEL_CURSOR, topeMas } from './banco-escena'
import { scrollSuave } from './clips6'
import { cajasConColor } from './fondos6'
import { wcag } from './wcag6'

async function principal(): Promise<void> {
  const dir = `${DIR6}/dia-desde-afuera/cuadros`
  mkdirSync(dir, { recursive: true })
  const b = await abrirBanco(1440, 900, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = 'producto,formacion,dia=afuera'; ${PUNTO_DEL_CURSOR}` })
  const filas: unknown[] = []
  try {
    const desde = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 1.12) })()`)
    const hasta = await topeMas('por-que-develop', 0.25)(b)
    await scrollHasta(b, desde)
    await esperar(2500)
    void scrollSuave(b, desde, hasta, 3500)
    for (let i = 0; i < 80; i += 1) {
      const e = await medir<{ activo: boolean }>(b.p, 'window.__diaDelBanco.barrido()')
      if (e.activo) break
      await esperar(50)
    }
    for (let k = 0; k < 9; k += 1) {
      const barrido = await medir<{ frente: number }>(b.p, 'window.__diaDelBanco.barrido()')
      const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      const png = Buffer.from(s.data, 'base64')
      await b.emular()
      writeFileSync(`${dir}/barrido-${String(k)}.png`, png)
      const cajas = (await cajasConColor(b)) as Parameters<typeof wcag>[1]
      const r = wcag(png, cajas)
      const peor = r.reduce((a, c) => (c.razon < a.razon ? c : a), { texto: '-', razon: Infinity, aa: 4.5 })
      filas.push({ captura: k, frente: Math.round(barrido.frente * 10) / 10, textos: r.length, peor: peor.texto, razon: peor.razon, bajoAA: r.filter((e) => e.razon < e.aa).map((e) => `${e.texto} ${String(e.razon)}`) })
      console.log(JSON.stringify(filas[filas.length - 1]))
      await esperar(250)
    }
    writeFileSync(`${DIR6}/dia-desde-afuera/contraste-durante-el-barrido.json`, JSON.stringify(filas, null, 1))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('dia6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
