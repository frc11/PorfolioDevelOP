/**
 * MOVIL-1 · A — LOS CUADROS POR SEGUNDO A 390×844, en reposo y scrolleando el
 * sitio entero.
 *
 *     npx tsx scripts-movil/a-fps.ts --etiqueta=<nombre-del-corte>
 *
 * ── Qué se cuenta, y por qué ese contador y no otro ───────────────────────
 *
 * Se cuentan **los `requestAnimationFrame` de la página**, no un contador
 * interno de r3f. Dos razones:
 *
 *   · el de r3f vive adentro del store de la escena y no hay panel en el home
 *     que lo publique, así que no se puede leer desde afuera;
 *   · y sobre todo: lo que la pregunta del sprint quiere saber es si **la
 *     página** va a 60, no si el lazo de la escena cree que va. Los dos rAF
 *     cuelgan del mismo vsync, y si la GPU no llega, el navegador estira el
 *     intervalo de los dos por igual.
 *
 * Se publica la **mediana** y el **p95** del intervalo entre cuadros además del
 * promedio. Un promedio de 58 con un p95 de 90 ms no es lo mismo que 58 parejo,
 * y en una escena con scroll lo segundo es lo que se siente.
 *
 * ── ⚠️ EL RECIBO QUE HACE HONESTA LA MEDICIÓN DEL `dpr` ───────────────────
 *
 * Cada corrida publica `canvas.width / canvas.clientWidth`, que es **el factor
 * que el renderer aplicó de verdad**, no el que se le pidió. Sin eso, «bajé el
 * dpr» es una afirmación sobre el fuente; con eso es una medición. Es también lo
 * que detecta el modo de falla del banco: si el instrumento corriera con
 * `deviceScaleFactor` 1, este número daría 1 en TODAS las variantes y las cifras
 * de abajo serían la misma escena medida cinco veces.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { medir, scrollA } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  REGIMENES,
  RAIZ_DE_SALIDAS,
  VENTANA,
  argumento,
  asegurarCarpetas,
  conElHomeMovil,
  dos,
} from './movil-comun'

/** Cuánto dura cada ventana de conteo. 3 s son ~180 cuadros a 60. */
const DURACION_MS = 3000
/** El barrido del sitio entero. 8 s de recorrido continuo, de arriba a abajo. */
const BARRIDO_MS = 8000

interface Cuadros {
  readonly cuadros: number
  readonly msTotal: number
  readonly fps: number
  readonly p50Ms: number
  readonly p95Ms: number
  readonly peorMs: number
}

interface Lienzo {
  readonly hay: boolean
  readonly ancho: number
  readonly alto: number
  readonly cssAncho: number
  readonly cssAlto: number
  readonly factorAplicado: number
  readonly fase: string
}

/** El contador, como fuente para la página. `t` es el timestamp del rAF. */
const CONTADOR = (duracionMs: number, conScroll: boolean): string => `(async () => {
  const marcas = []
  const alto = document.documentElement.scrollHeight - window.innerHeight
  let t0 = null
  await new Promise((listo) => {
    function paso(t) {
      if (t0 === null) t0 = t
      marcas.push(t)
      const u = (t - t0) / ${duracionMs}
      ${conScroll ? 'window.scrollTo(0, Math.round(Math.min(1, u) * alto))' : ''}
      if (u < 1) requestAnimationFrame(paso)
      else listo()
    }
    requestAnimationFrame(paso)
  })
  const d = []
  for (let i = 1; i < marcas.length; i += 1) d.push(marcas[i] - marcas[i - 1])
  d.sort((a, b) => a - b)
  const msTotal = marcas[marcas.length - 1] - marcas[0]
  const q = (p) => d.length === 0 ? 0 : d[Math.min(d.length - 1, Math.floor(p * d.length))]
  return {
    cuadros: marcas.length,
    msTotal,
    fps: msTotal === 0 ? 0 : (marcas.length - 1) * 1000 / msTotal,
    p50Ms: q(0.5),
    p95Ms: q(0.95),
    peorMs: d.length === 0 ? 0 : d[d.length - 1],
  }
})()`

const LIENZO = `(() => {
  const c = document.querySelector('canvas')
  const env = document.querySelector('[data-escena]')
  return {
    hay: c !== null,
    ancho: c === null ? 0 : c.width,
    alto: c === null ? 0 : c.height,
    cssAncho: c === null ? 0 : c.clientWidth,
    cssAlto: c === null ? 0 : c.clientHeight,
    factorAplicado: c === null || c.clientWidth === 0 ? 0 : c.width / c.clientWidth,
    fase: env === null ? '(sin escena)' : String(env.getAttribute('data-escena-fase')),
  }
})()`

async function main(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  const filas: unknown[] = []

  for (const regimen of REGIMENES) {
    // eslint-disable-next-line no-await-in-loop
    const fila = await conElHomeMovil(regimen, async ({ pagina }) => {
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)
      await scrollA(pagina, 0)
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 1200)); return true })()`)

      const lienzo = await medir<Lienzo>(pagina, LIENZO)
      const alturaDoc = await medir<number>(pagina, 'document.documentElement.scrollHeight')
      const reposo = await medir<Cuadros>(pagina, CONTADOR(DURACION_MS, false))
      await scrollA(pagina, 0)
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 800)); return true })()`)
      const barrido = await medir<Cuadros>(pagina, CONTADOR(BARRIDO_MS, true))

      console.log(
        `  ${regimen.nombre.padEnd(24)} canvas ${lienzo.ancho}×${lienzo.alto} px (css ${lienzo.cssAncho}×${lienzo.cssAlto}, factor ${dos(lienzo.factorAplicado)}) · fase «${lienzo.fase}»`,
      )
      console.log(
        `    reposo   ${dos(reposo.fps).toFixed(2).padStart(6)} fps · p50 ${dos(reposo.p50Ms)} ms · p95 ${dos(reposo.p95Ms)} ms · peor ${dos(reposo.peorMs)} ms · ${reposo.cuadros} cuadros`,
      )
      console.log(
        `    barrido  ${dos(barrido.fps).toFixed(2).padStart(6)} fps · p50 ${dos(barrido.p50Ms)} ms · p95 ${dos(barrido.p95Ms)} ms · peor ${dos(barrido.peorMs)} ms · ${barrido.cuadros} cuadros`,
      )
      return { regimen: regimen.id, nombreDelRegimen: regimen.nombre, lienzo, alturaDoc, reposo, barrido }
    })
    filas.push(fila)
  }

  const salida = {
    etiqueta,
    ventana: VENTANA,
    devicePixelRatioEmulado: 3,
    duracionDeReposoMs: DURACION_MS,
    duracionDelBarridoMs: BARRIDO_MS,
    cuando: new Date().toISOString(),
    filas,
  }
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, `a-fps-${etiqueta}.json`)
  writeFileSync(destino, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  escrito: ${destino}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
