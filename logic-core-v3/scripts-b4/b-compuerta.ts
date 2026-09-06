/**
 * FRENTE B · el discriminador empírico de la compuerta.
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 *
 * `b-secciones.ts` devolvió `masAltoQueLaVentana` marcado a **1024**, que está
 * ABAJO del umbral de 1025, y sin marcar a 375, 393 y 768. Esa marca la pone
 * `capturarRegion` cuando el recorte pasa una pantalla **y hay un `<canvas>` en
 * el documento**. O sea: a 1024 hay un canvas y a 768 no.
 *
 * `compuerta.ts` dice, textual, «abajo de 1025: sin canvas y sin coreografía».
 * Una de las dos cosas es falsa, y este archivo va a ver cuál **sin arreglar
 * nada**: cuenta los canvas, mide sus cajas, lee `matchMedia` con la misma
 * consulta que usa la compuerta, y mira si el módulo de la escena se descargó.
 *
 * Es el corolario de método del repo: cuando una lectura sorprende, **buscar un
 * discriminador empírico del entorno de medición antes de tocar código**.
 */

import { PERFILES } from './perfiles'
import { medir } from './navegador'
import { conLaPagina, guardarJson, procedencia } from './b-comun'

interface Canvas {
  readonly ancho: number
  readonly alto: number
  readonly clases: string
  readonly padre: string
  readonly posicion: string
  readonly visible: boolean
}

interface LecturaDeCompuerta {
  readonly consulta: string
  readonly matchMedia: boolean
  readonly innerWidth: number
  readonly canvas: readonly Canvas[]
  readonly marcaDeIntroPuesta: boolean
  readonly hayEscudoDeEscena: boolean
  readonly pedidosDeChunk: number
}

const FUENTE = `(() => {
  const consulta = '(min-width: 1025px)'
  const cs = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect()
    const e = getComputedStyle(c)
    return {
      ancho: Math.round(r.width),
      alto: Math.round(r.height),
      clases: c.className,
      padre: c.parentElement === null ? '(sin padre)' : c.parentElement.className,
      posicion: e.position,
      visible: e.display !== 'none' && e.visibility !== 'hidden' && Number(e.opacity) > 0,
    }
  })
  let marca = false
  try { marca = sessionStorage.getItem('home:intro') === '1' } catch (e) { marca = false }
  const recursos = performance.getEntriesByType('resource').map((r) => r.name)
  return {
    consulta,
    matchMedia: window.matchMedia(consulta).matches,
    innerWidth: window.innerWidth,
    canvas: cs,
    marcaDeIntroPuesta: marca,
    hayEscudoDeEscena: document.querySelector('[data-escena]') !== null,
    pedidosDeChunk: recursos.filter((n) => n.includes('escena') || n.includes('three')).length,
  }
})()`

/**
 * ⚠️ EL BARRIDO, que es la mitad que resuelve la contradicción.
 *
 * La primera lectura se toma con el scroll en 0. Si un `<canvas>` aparece
 * recién más abajo del recorrido, una lectura en 0 no lo ve y la contradicción
 * queda sin explicar. Se barre el documento y se cuenta en cada parada.
 */
async function barrer(pagina: Parameters<typeof medir>[0]): Promise<readonly { readonly y: number; readonly canvas: number }[]> {
  return medir<{ y: number; canvas: number }[]>(
    pagina,
    `(async () => {
      const out = []
      const alto = document.documentElement.scrollHeight
      const paso = Math.max(1, Math.round(window.innerHeight / 2))
      for (let y = 0; y <= alto; y += paso) {
        window.scrollTo(0, y)
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
        await new Promise((r) => setTimeout(r, 60))
        out.push({ y: window.scrollY, canvas: document.querySelectorAll('canvas').length })
      }
      window.scrollTo(0, 0)
      return out
    })()`,
  )
}

async function principal(): Promise<void> {
  const filas: (LecturaDeCompuerta & { readonly perfil: string; readonly barridoMaxCanvas: number; readonly barridoDondeAparece: number | null })[] = []
  for (const perfil of PERFILES) {
    const { lectura, barrido } = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      // La escena y el intro tardan en montar; se les da la misma gracia que a
      // una captura antes de contar lo que hay.
      await medir<boolean>(pagina, '(async () => { await new Promise((r) => setTimeout(r, 1500)); return true })()')
      const l = await medir<LecturaDeCompuerta>(pagina, FUENTE)
      return { lectura: l, barrido: await barrer(pagina) }
    })
    const max = barrido.reduce((a, b) => Math.max(a, b.canvas), 0)
    const aparece = barrido.find((b) => b.canvas > 0)
    filas.push({
      perfil: perfil.id,
      ...lectura,
      barridoMaxCanvas: max,
      barridoDondeAparece: aparece === undefined ? null : aparece.y,
    })
    console.log(
      `${perfil.id.padEnd(5)} innerWidth ${String(lectura.innerWidth).padStart(5)} · matchMedia(${lectura.consulta}) = ` +
        `${String(lectura.matchMedia).padEnd(5)} · canvas en y=0: ${lectura.canvas.length} · máximo en el barrido: ${max}` +
        `${aparece === undefined ? '' : ` (aparece en y=${aparece.y})`} · intro apagado: ${lectura.marcaDeIntroPuesta}`,
    )
    for (const c of lectura.canvas) {
      console.log(`      ${c.ancho}×${c.alto} pos=${c.posicion} visible=${c.visible} clases="${c.clases}" padre="${c.padre}"`)
    }
  }

  const ruta = guardarJson('compuerta', {
    procedencia: procedencia(
      'scripts-b4/b-compuerta.ts',
      'discriminador empírico de la compuerta de 1025: cuenta canvas y lee matchMedia con la misma consulta que usa `useAnchoMinimo`. Sin estrangular. Emulado.',
    ),
    afirmacionDelFuente: 'compuerta.ts: «Abajo de 1025: sin canvas y sin coreografía»',
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
