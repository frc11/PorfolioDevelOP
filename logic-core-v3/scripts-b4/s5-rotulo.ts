/**
 * CU\u00c1NTO DE SU CAPTURA OCUPA EL R\u00d3TULO — la raz\u00f3n, medida y no elegida.
 *
 *     npx tsx scripts-b4/s5-rotulo.ts
 *
 * El punto pide que el r\u00f3tulo escale con su proyecto y que **empiece a aparecer
 * reci\u00e9n cuando entra adentro de la captura**. Las dos cosas necesitan el mismo
 * n\u00famero: cu\u00e1nto mide el r\u00f3tulo comparado con su captura.
 *
 * ── \u26a0\ufe0f POR QU\u00c9 `offsetWidth` Y NO `getBoundingClientRect()` ──────────────
 *
 * Porque las dos cajas viven bajo transformadas vivas \u2014la captura lleva su
 * escala y el r\u00f3tulo, hoy, la contra-escala\u2014 y el rect las incluye: la raz\u00f3n
 * medida as\u00ed dar\u00eda distinta en cada cuadro. `offsetWidth` es la caja de LAYOUT,
 * que es donde la raz\u00f3n vive de verdad y donde no depende de la escala. Es la
 * misma leccci\u00f3n que el repo ya tiene anotada sobre el rect con transformadas
 * activas, aplicada al rev\u00e9s: ac\u00e1 lo que se quiere es justamente ignorarlas.
 *
 * Se miden los TRES r\u00f3tulos: la constante es el m\u00e1s ancho, porque la afirmaci\u00f3n
 * que sale de ac\u00e1 tiene que valer para los tres.
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')

interface Medida {
  readonly nombre: string
  readonly rotulo: number
  readonly captura: number
  readonly razon: number
}

const SONDA = `[...document.querySelectorAll('[data-captura]')].map((caja) => {
  const rotulo = caja.querySelector('[data-rotulo]')
  return {
    nombre: caja.dataset.captura,
    rotulo: rotulo === null ? 0 : rotulo.offsetWidth,
    captura: caja.offsetWidth,
    razon: rotulo === null ? 0 : rotulo.offsetWidth / caja.offsetWidth,
  }
})`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s5-rotulo',
    ancho: PERFIL.ancho,
    alto: PERFIL.alto + 120,
  })
  try {
    const p = await abrirPagina(chrome)
    await emular(p, PERFIL)
    await irA(p, `${URL_BASE}/v3`)
    await verificarLaPagina(p, PERFIL)

    const trabajos = (await paneles(p)).find((s) => s.id === 'trabajos')
    if (trabajos === undefined) throw new Error('falta el panel de trabajos')

    // Adentro del t\u00fanel, para que las tres cajas est\u00e9n montadas y con layout.
    await medir<number>(
      p,
      `(async () => {
        const hasta = performance.now() + 1500
        while (performance.now() < hasta) {
          window.scrollTo(0, ${String(trabajos.top + 2500)})
          await new Promise((r) => setTimeout(r, 60))
        }
        return window.scrollY
      })()`,
    )

    const medidas = await medir<Medida[]>(p, SONDA)
    console.log(`\n  ${'proyecto'.padEnd(16)} ${'rotulo'.padStart(8)} ${'captura'.padStart(8)} ${'razon'.padStart(9)}`)
    for (const m of medidas) {
      console.log(`  ${m.nombre.padEnd(16)} ${m.rotulo.toFixed(1).padStart(8)} ${m.captura.toFixed(1).padStart(8)} ${m.razon.toFixed(4).padStart(9)}`)
    }
    const mayor = medidas.reduce((a, b) => (b.razon > a.razon ? b : a))
    console.log(`\n  el mas ancho es "${mayor.nombre}": FRACCION_DEL_ROTULO = ${mayor.razon.toFixed(4)}`)
    console.log(`  o sea que el rotulo entra adentro de su captura a partir del ${(mayor.razon * 100).toFixed(2)} % del cuadro`)

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORT\u00d3: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
