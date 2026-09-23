/**
 * LA CINTA DE DEMOS, MIRADA — abajo de 1025, a 375 y a 768.
 *
 *     npx tsx scripts-b4/demos-cinta.ts
 *
 * Lleva la cinta al centro del cuadro y saca dos fotos con un segundo de
 * diferencia: la segunda tiene que mostrar la pista corrida (pasa sola, en CSS).
 * ⚠️ Usa Chrome: tomar el candado antes.
 */
import { mkdirSync } from 'node:fs'

import { capturar } from './captura'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'

const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/demos-cinta'

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  for (const id of ['375', '768'] as const) {
    const perfil = perfilPorId(id)
    const chrome = await lanzarChrome({ perfil: `C:/Users/Valentino/.cache/b4-medicion/demos-cinta-${id}`, ancho: perfil.ancho, alto: perfil.alto + 120 })
    try {
      const p = await abrirPagina(chrome)
      await emular(p, perfil)
      await irA(p, 'http://localhost:3000/v3')
      await verificarLaPagina(p, perfil)
      // De a muescas desde arriba: la noche sólo se dispara si se cruza su línea.
      await medir<number>(p, `(async () => { const c = document.querySelector('[data-pieza="cinta"]'); const destino = c.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.6; for (let y = 0; y < destino; y += 150) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)) } window.scrollTo(0, destino); await new Promise((r) => setTimeout(r, 1500)); return 1 })()`)
      const x0 = await medir<string>(p, `getComputedStyle(document.querySelector('[data-pieza="cinta"] > [data-parte="pista"]')).transform`)
      await capturar(p, `${SALIDA}/cinta-${id}-a.png`)
      await emular(p, perfil)
      await new Promise((r) => setTimeout(r, 1000))
      const x1 = await medir<string>(p, `getComputedStyle(document.querySelector('[data-pieza="cinta"] > [data-parte="pista"]')).transform`)
      await capturar(p, `${SALIDA}/cinta-${id}-b.png`)
      console.log(`  ${id}: la pista pasa de ${x0} a ${x1}`)
      await cerrarPagina(p)
    } finally {
      await cerrarChrome(chrome)
    }
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
