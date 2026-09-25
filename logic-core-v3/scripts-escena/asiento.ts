/**
 * SPRINT ESCENA — ¿por qué en el pie el logo salía más grande en V1? asiento.ts <variantes>
 *
 * Recorre los cinco momentos como `comparar.ts` y, en el pie, captura a los 0,5 · 2,5 · 5 · 10 · 15 s
 * de llegar, anotando el scroll: si la cámara todavía se está asentando, las capturas cambian con
 * el tiempo y convergen; si la variante la cambia, quedan distintas aunque pase el tiempo.
 */
import { mkdirSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, captura, esperar, scrollHasta } from '../scripts-viajes/banco'

const VARIANTES = (process.argv[2] ?? 'actual,v1').split(',')
/** `con-captura`: captura en cada momento antes de seguir, como `comparar.ts`. */
const CON_CAPTURA = process.argv[3] === 'con-captura'
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/escena/asiento'

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  for (const variante of VARIANTES) {
    const b = await abrirBanco(1440, 900, { perfil: 'escena', antesDeCargar: `window.__varianteDeLaEscena = '${variante}'` })
    try {
      for (const [id, pantallas] of [['quienes-somos', 0.15], ['trabajos', 0], ['por-que-develop', 0.7]] as const) {
        const y = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="${id}"]').getBoundingClientRect(); return Math.round(r.top + scrollY + ${String(pantallas)} * innerHeight) })()`)
        await scrollHasta(b, y)
        if (CON_CAPTURA) await captura(b, `${DIR}/paso-${variante}-${id}.png`)
      }
      const fin = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
      await scrollHasta(b, fin, 90, 22)
      let t = 2.5
      for (const hasta of [0.5, 2.5, 5, 10, 15]) {
        // `scrollHasta` ya esperó 2,5 s: las dos primeras marcas se toman sin espera extra.
        if (hasta > t) await esperar((hasta - t) * 1000)
        t = Math.max(t, hasta)
        const y = await medir<number>(b.p, 'scrollY')
        await captura(b, `${DIR}/pie-${variante}${CON_CAPTURA ? '-con-captura' : ''}-${String(hasta)}s.png`)
        console.log(JSON.stringify({ variante, segundos: hasta, y, fin }))
      }
    } finally {
      await b.cerrar()
    }
  }
}
principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
