/**
 * EL CAMBIO DE PLANO, MIRADO — una foto cada 100 px entre «nosotros» y Trabajos.
 *
 *     npx tsx scripts-b4/s10-cambio-de-plano.ts
 *
 * El pedido: Portfolio llega «ni bien pasa el cambio de plano», que es cuando la
 * cámara deja la sala con el logo negro de costado y queda en la sala oscura con
 * el logo gris grande y centrado. Antes de buscar ese nudo en el código se lo
 * MIRA: se baja de a una muesca, se deja posar la escena y se saca una foto.
 *
 * ⚠️ `Page.captureScreenshot` congela los pasos de render de la página: después
 * de cada foto se re-emula el viewport para destrabarlos (lección del repo).
 * ⚠️ Se baja de a una muesca y no de un salto: la noche es un DISPARO por cruce
 * de línea, y un salto por encima de la línea puede no dispararla.
 */

import { mkdirSync } from 'node:fs'

import { capturar } from './captura'
import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const PERFIL = perfilPorId('1440')
const SALIDA = 'C:/Users/Valentino/.cache/b4-medicion/s10-cambio-de-plano'
const DESDE = Number(process.env.DESDE ?? 3100)
const HASTA = Number(process.env.HASTA ?? 5600)
const PASO = Number(process.env.PASO ?? 100)
/** La escena tarda 300-700 ms en asentar un cuadro (B4-B): se le da de sobra. */
const POSADO_MS = 1400

async function principal(): Promise<void> {
  mkdirSync(SALIDA, { recursive: true })
  const chrome = await lanzarChrome({ perfil: 'C:/Users/Valentino/.cache/b4-medicion/s10-plano', ancho: PERFIL.ancho, alto: PERFIL.alto + 120 })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, 'http://localhost:3000/v3')
    await verificarLaPagina(p, PERFIL)
    const lista = await paneles(p)
    for (const s of lista) console.log(`  ${s.id.padEnd(14)} top ${s.top.toFixed(0).padStart(6)}  alto ${s.alto.toFixed(0)}`)
    // Se llega de a muescas desde un poco antes, para que los disparos crucen su línea.
    for (let y = DESDE - 1500; y < DESDE; y += 100) {
      await medir<number>(p, `(window.scrollTo(0, ${String(y)}), new Promise((r) => setTimeout(() => r(1), 120)))`)
    }
    for (let y = DESDE; y <= HASTA; y += PASO) {
      await medir<number>(
        p,
        `(async () => { const h = performance.now() + ${String(POSADO_MS)}; while (performance.now() < h) { window.scrollTo(0, ${String(y)}); await new Promise((r) => setTimeout(r, 40)) } return 1 })()`,
      )
      const archivo = `${SALIDA}/y${String(y).padStart(5, '0')}.png`
      await capturar(p, archivo)
      await emular(p, PERFIL)
      console.log(`  foto en y=${String(y)}`)
    }
    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTO: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
