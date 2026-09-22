/**
 * ¿POR QUÉ NO SE VE EL CARTEL DE PORTFOLIO? — la sonda, no la lectura del fuente.
 *
 *     npx tsx scripts-b4/s4-cartel.ts
 *
 * La grabación a 1440 devolvió ~150 cuadros en blanco justo donde el cartel
 * tendría que estar llegando. Esto pregunta, adentro de su ventana y píxel a
 * píxel, qué le está pasando: si la CAJA está escondida (asunto de
 * `poseDelGesto`) o si la caja está puesta y lo que no sube son los RENGLONES
 * (asunto del progreso que recibe P1).
 */

import { cerrarChrome, lanzarChrome } from './cdp'
import { abrirPagina, cerrarPagina, emular, irA, medir, verificarLaPagina } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'

const URL_BASE = 'http://localhost:3000'
const PERFIL = perfilPorId('1440')

interface Lectura {
  readonly y: number
  readonly cajaVisible: string
  readonly cajaOpacidad: string
  readonly cajaTransform: string
  readonly cajaRect: readonly number[]
  readonly renglones: number
  readonly transformadasDeRenglon: readonly string[]
  readonly textoDelTitular: string
}

const SONDA = `(() => {
  const caja = document.querySelector('[data-pieza="cartel"]')
  if (caja === null) return null
  const e = getComputedStyle(caja)
  const r = caja.getBoundingClientRect()
  const titular = caja.querySelector('[data-texto-por-lineas], h2')
  const piezas = caja.querySelectorAll('[data-pieza-de-linea], [data-texto-por-lineas] span, h2 span')
  return {
    y: window.scrollY,
    cajaVisible: e.visibility,
    cajaOpacidad: e.opacity,
    cajaTransform: e.transform,
    cajaRect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)],
    renglones: piezas.length,
    transformadasDeRenglon: [...piezas].slice(0, 6).map((p) => getComputedStyle(p).transform),
    textoDelTitular: titular === null ? '(sin titular)' : titular.textContent.slice(0, 60),
  }
})()`

async function principal(): Promise<void> {
  const chrome = await lanzarChrome({
    perfil: 'C:/Users/Valentino/.cache/b4-medicion/s4-cartel',
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
    console.log(`\ntrabajos: top ${trabajos.top.toFixed(0)} · alto ${trabajos.alto.toFixed(0)}`)

    for (const px of [-300, 0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000, 2200]) {
      const y = trabajos.top + px
      await medir<number>(
        p,
        `(async () => {
          const hasta = performance.now() + 900
          while (performance.now() < hasta) {
            window.scrollTo(0, ${String(y)})
            await new Promise((r) => setTimeout(r, 60))
          }
          return window.scrollY
        })()`,
      )
      const l = await medir<Lectura | null>(p, SONDA)
      if (l === null) {
        console.log(`  ${String(px).padStart(5)} px  — NO HAY [data-pieza="cartel"] en el DOM`)
        continue
      }
      console.log(
        `  ${String(px).padStart(5)} px  y=${String(l.y).padStart(6)}  vis=${l.cajaVisible.padEnd(7)} op=${l.cajaOpacidad.padEnd(6)} rect=${JSON.stringify(l.cajaRect).padEnd(26)} renglones=${l.renglones}`,
      )
      console.log(`            caja: ${l.cajaTransform}`)
      console.log(`            renglones: ${l.transformadasDeRenglon.join(' | ') || '(ninguno)'}`)
      console.log(`            titular: "${l.textoDelTitular}"`)
    }

    await cerrarPagina(p)
  } finally {
    await cerrarChrome(chrome)
  }
}

principal().then(
  () => process.exit(0),
  (e: unknown) => {
    console.error(`\nSE CORTÓ: ${e instanceof Error ? e.message : String(e)}`)
    process.exit(1)
  },
)
