/**
 * FRENTE B · la vigilia — ¿cuándo aparece el `<canvas>` que la compuerta dice
 * que abajo de 1025 no existe?
 *
 * ── El hilo ───────────────────────────────────────────────────────────────
 *
 * `b-secciones.ts` marcó las ocho filas de **1024** con «hay escenario» (la
 * marca la pone `capturarRegion` con `document.querySelector('canvas') !==
 * null`). `b-compuerta.ts`, que mira lo mismo 1,5 s después de cargar y además
 * barre el documento entero, cuenta **cero** canvas a 1024.
 *
 * Las dos lecturas son del mismo sitio y no pueden ser las dos ciertas al mismo
 * tiempo, **pero pueden serlo en tiempos distintos**: la corrida de secciones
 * dura minutos y la del discriminador, segundos. Este archivo mira el mismo
 * número **contra el reloj**, que es la variable que las separa.
 *
 * No arregla nada. Sólo dice qué canvas es, cuándo aparece, y de quién cuelga.
 */

import { perfilPorId } from './perfiles'
import { medir } from './navegador'
import { conLaPagina, guardarJson, procedencia } from './b-comun'

const SEGUNDOS = 90

/**
 * ⚠️ Cuenta también adentro de los shadow roots abiertos. El overlay de
 * desarrollo de Next monta un custom element con shadow DOM, y un
 * `querySelector` pelado no lo ve: si el canvas fuera suyo, esta vigilia
 * daría cero para siempre y la contradicción quedaría sin explicar.
 */
const FUENTE = `(async () => {
  const contar = () => {
    let n = 0
    const detalle = []
    const visitar = (raiz, ruta) => {
      for (const c of raiz.querySelectorAll('canvas')) {
        n += 1
        const r = c.getBoundingClientRect()
        detalle.push({
          ruta,
          ancho: Math.round(r.width),
          alto: Math.round(r.height),
          clases: c.className,
          padre: c.parentElement === null ? '(sin padre)' : c.parentElement.tagName + '.' + c.parentElement.className,
          abuelo: c.parentElement === null || c.parentElement.parentElement === null ? '' : c.parentElement.parentElement.tagName + '.' + c.parentElement.parentElement.className,
        })
      }
      for (const el of raiz.querySelectorAll('*')) {
        if (el.shadowRoot !== null && el.shadowRoot !== undefined) visitar(el.shadowRoot, ruta + ' > ' + el.tagName.toLowerCase() + '#shadow')
      }
    }
    visitar(document, 'document')
    return { n, detalle }
  }
  return {
    canvas: contar(),
    matchMedia: window.matchMedia('(min-width: 1025px)').matches,
    innerWidth: window.innerWidth,
    // ⚠️ El reloj del DOCUMENTO. Si retrocede, la pestaña se recargó sola
    // (recompilación de \`next dev\`) y la aparición del canvas es un primer
    // paint nuevo, no un montaje espontáneo.
    perfNow: Math.round(performance.now()),
    navegaciones: performance.getEntriesByType('navigation').length,
    recursosConEscena: performance.getEntriesByType('resource').map((r) => r.name).filter((n) => /escena|three|EscenaDelHome/.test(n)).length,
  }
})()`

interface Muestra {
  readonly canvas: { readonly n: number; readonly detalle: readonly Record<string, unknown>[] }
  readonly matchMedia: boolean
  readonly innerWidth: number
  readonly perfNow: number
  readonly navegaciones: number
  readonly recursosConEscena: number
}

interface Vigilia {
  readonly perfil: string
  readonly serie: readonly { readonly t: number; readonly canvas: number; readonly perfNow: number }[]
  readonly recargasDetectadas: number
  readonly primeraAparicionMs: number | null
  readonly detalleDeLaAparicion: readonly Record<string, unknown>[]
  readonly matchMediaFinal: boolean
  readonly recursosConEscenaFinal: number
}

/**
 * ⚠️ **El sondeo va desde Node, un `Runtime.evaluate` por segundo, y no como un
 * bucle largo adentro de la página.** Un `evaluate` de 150 s murió con
 * «Inspected target navigated or closed»: en desarrollo el servidor puede
 * recompilar y recargar la pestaña, y una lectura larga se pierde entera.
 * Sondeando desde afuera, una recarga se ve como un dato (`navegaciones`) en vez
 * de tirar la corrida.
 */
async function principal(): Promise<void> {
  const filas: Vigilia[] = []
  for (const id of ['768', '1024']) {
    const perfil = perfilPorId(id)
    const fila = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const serie: { t: number; canvas: number; perfNow: number }[] = []
      let primera: number | null = null
      let detalle: readonly Record<string, unknown>[] = []
      let ultima: Muestra | null = null
      const t0 = Date.now()
      for (let i = 0; i <= SEGUNDOS; i += 1) {
        const m = await medir<Muestra>(pagina, FUENTE)
        ultima = m
        const t = Date.now() - t0
        serie.push({ t, canvas: m.canvas.n, perfNow: m.perfNow })
        if (m.canvas.n > 0 && primera === null) {
          primera = t
          detalle = m.canvas.detalle
        }
        if (i < SEGUNDOS) await new Promise((r) => setTimeout(r, 1000))
      }
      let recargas = 0
      for (let k = 1; k < serie.length; k += 1) if (serie[k].perfNow < serie[k - 1].perfNow) recargas += 1
      return {
        perfil: id,
        serie,
        recargasDetectadas: recargas,
        primeraAparicionMs: primera,
        detalleDeLaAparicion: detalle,
        matchMediaFinal: ultima === null ? false : ultima.matchMedia,
        recursosConEscenaFinal: ultima === null ? 0 : ultima.recursosConEscena,
      }
    })
    filas.push(fila)
    console.log(
      `${id}: matchMedia=${fila.matchMediaFinal} · máximo ${Math.max(...fila.serie.map((s) => s.canvas))} canvas · ` +
        `${fila.primeraAparicionMs === null ? `NUNCA apareció en ${SEGUNDOS} s` : `apareció a los ${fila.primeraAparicionMs} ms`} · ` +
        `recursos de escena pedidos: ${fila.recursosConEscenaFinal} · recargas solas: ${fila.recargasDetectadas}`,
    )
    if (fila.primeraAparicionMs !== null) console.log('   ', JSON.stringify(fila.detalleDeLaAparicion))
  }
  const ruta = guardarJson('vigilia-canvas', {
    procedencia: procedencia(
      'scripts-b4/b-vigilia.ts',
      `cuenta de <canvas> (document + shadow roots abiertos) una vez por segundo durante ${SEGUNDOS} s, a 768 y a 1024. Sin estrangular. Emulado.`,
    ),
    filas,
  })
  console.log(`\n→ ${ruta}`)
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
