/**
 * MOVIL-1 · B — CUÁNTO TRABAJA LA GPU POR CUADRO, que es lo que los fps NO
 * pueden decir acá.
 *
 *     npx tsx scripts-movil/b-gpu.ts --etiqueta=<nombre-del-corte>
 *
 * ── ⚠️ POR QUÉ ESTE INSTRUMENTO EXISTE: EL DE AL LADO SE SATURA ───────────
 *
 * `a-fps.ts` midió la escena SIN degradar, a 390×844 con `deviceScaleFactor` 3,
 * y dio **74,96 fps con p95 de 13,8 ms — en los dos regímenes de CPU, incluido
 * 4×**. El monitor de esta máquina va a **75 Hz**, o sea que la escena está
 * pegada al techo del refresco y no lo suelta ni frenando el hilo principal
 * cuatro veces.
 *
 * Eso es una buena noticia y es, a la vez, un instrumento inservible para lo que
 * el sprint pide: **si cada corte también va a dar 75, ninguno se puede
 * atribuir.** «Bajé el `dpr` y quedó en 75» y «no toqué nada y quedó en 75» son
 * la misma lectura, y elegir entre cortes con eso sería elegir a ciegas.
 *
 * Es exactamente el modo de falla que este repo ya nombró dos veces —un
 * invariante que fuerza la entrada que después afirma, un fix correcto en
 * estático que falla en runtime— y la regla de método que quedó escrita es
 * **buscar un discriminador empírico antes de seguir**. Éste es el
 * discriminador.
 *
 * ── Qué se mide, y qué significa ──────────────────────────────────────────
 *
 * Los eventos `GPUTask` de la traza de `devtools.timeline`: cuánto tiempo estuvo
 * **ocupado el proceso de GPU** durante una ventana de pared conocida. No se
 * satura con el vsync — si la escena le cuesta la mitad, el número baja a la
 * mitad aunque los fps no se muevan —, y es lo que en un teléfono decide si
 * llega o no: un dispositivo con una GPU N veces más lenta necesita que este
 * número entre N veces en el presupuesto de 13,3 ms.
 *
 * ⚠️ **Lo que NO es.** No es «los milisegundos que tarda un iPhone». Es el
 * trabajo de GPU de ESTA máquina, y sirve para **ordenar los cortes entre sí** y
 * para saber cuánto margen deja cada uno. La traducción a un teléfono real
 * necesita un teléfono real, y este banco no lo tiene.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { medir, scrollA } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  RAIZ_DE_SALIDAS,
  REGIMENES,
  VENTANA,
  argumento,
  asegurarCarpetas,
  conElHomeMovil,
  dos,
} from './movil-comun'

const REPOSO_MS = 4000
const BARRIDO_MS = 8000

interface EventoDeTraza {
  readonly name?: string
  readonly ph?: string
  readonly dur?: number
  readonly cat?: string
}

interface Ventana {
  readonly paredMs: number
  readonly tareas: number
  readonly gpuMs: number
  readonly ocupacion: number
  readonly cuadros: number
  readonly gpuPorCuadroMs: number
  readonly peorTareaMs: number
  /** `gpu | WebGL`: el proceso de GPU ejecutando los comandos del canvas. */
  readonly webglTareas: number
  readonly webglMs: number
  readonly webglPorCuadroMs: number
}

/** El contador de cuadros. Igual al de `a-fps.ts`; acá sólo hace falta el total. */
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
  return { cuadros: marcas.length, msTotal: marcas[marcas.length - 1] - marcas[0] }
})()`

async function main(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')

  // Un solo régimen: la CPU no mueve el trabajo de GPU, y `a-fps.ts` ya publica
  // los dos. Acá interesa el hardware sin frenar.
  const regimen = REGIMENES[0]

  const fila = await conElHomeMovil(regimen, async ({ pagina }) => {
    const { conexion } = pagina
    await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)

    async function conTraza(duracionMs: number, conScroll: boolean): Promise<Ventana> {
      await scrollA(pagina, 0)
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)

      const eventos: EventoDeTraza[] = []
      conexion.al('Tracing.dataCollected', (p) => {
        const lote = p.value
        if (Array.isArray(lote)) for (const e of lote) eventos.push(e as EventoDeTraza)
      })
      const completa = new Promise<void>((res) => {
        conexion.al('Tracing.tracingComplete', () => res())
      })
      await conexion.enviar('Tracing.start', {
        transferMode: 'ReportEvents',
        /**
         * ⚠️ `GPUTask` NO está en `devtools.timeline`: está en
         * `disabled-by-default-devtools.timeline`. Con la categoría de al lado la
         * primera corrida devolvió **0 tareas en 4.007 ms de pared** — o sea un
         * cero que se lee igual que «la GPU no trabajó». Se agrega además
         * `gpu`, que trae `WebGL`: el tiempo del proceso de GPU ejecutando los
         * comandos del canvas, que es la parte de la que esta escena es dueña.
         */
        traceConfig: {
          includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'gpu'],
        },
      })
      const pared = Date.now()
      const cuenta = await medir<{ cuadros: number; msTotal: number }>(pagina, CONTADOR(duracionMs, conScroll))
      const paredMs = Date.now() - pared
      await conexion.enviar('Tracing.end')
      await completa

      const tareas = eventos.filter((e) => e.name === 'GPUTask' && typeof e.dur === 'number')
      const gpuUs = tareas.reduce((n, e) => n + (e.dur ?? 0), 0)
      const peorUs = tareas.reduce((n, e) => Math.max(n, e.dur ?? 0), 0)
      const webgl = eventos.filter((e) => e.name === 'WebGL' && typeof e.dur === 'number')
      const webglUs = webgl.reduce((n, e) => n + (e.dur ?? 0), 0)
      return {
        paredMs,
        tareas: tareas.length,
        gpuMs: gpuUs / 1000,
        ocupacion: paredMs === 0 ? 0 : gpuUs / 1000 / paredMs,
        cuadros: cuenta.cuadros,
        gpuPorCuadroMs: cuenta.cuadros === 0 ? 0 : gpuUs / 1000 / cuenta.cuadros,
        peorTareaMs: peorUs / 1000,
        webglTareas: webgl.length,
        webglMs: webglUs / 1000,
        webglPorCuadroMs: cuenta.cuadros === 0 ? 0 : webglUs / 1000 / cuenta.cuadros,
      }
    }

    const lienzo = await medir<{ ancho: number; alto: number; factor: number }>(
      pagina,
      `(() => { const c = document.querySelector('canvas'); return c === null ? { ancho: 0, alto: 0, factor: 0 } : { ancho: c.width, alto: c.height, factor: c.clientWidth === 0 ? 0 : c.width / c.clientWidth } })()`,
    )
    const reposo = await conTraza(REPOSO_MS, false)
    const barrido = await conTraza(BARRIDO_MS, true)
    return { lienzo, reposo, barrido }
  })

  console.log(`\n  canvas ${fila.lienzo.ancho}×${fila.lienzo.alto} px (factor ${dos(fila.lienzo.factor)}) — ${fila.lienzo.ancho * fila.lienzo.alto} píxeles por cuadro`)
  for (const [nombre, v] of [
    ['reposo ', fila.reposo],
    ['barrido', fila.barrido],
  ] as const) {
    console.log(
      `  ${nombre}  GPU ${v.gpuPorCuadroMs.toFixed(3).padStart(6)} ms/cuadro · WebGL ${v.webglPorCuadroMs.toFixed(3).padStart(6)} ms/cuadro · ocupación ${(v.ocupacion * 100).toFixed(1).padStart(5)} % · ${v.tareas} tareas GPU / ${v.webglTareas} WebGL en ${v.paredMs} ms · ${v.cuadros} cuadros · peor tarea ${dos(v.peorTareaMs)} ms`,
    )
  }

  const salida = {
    etiqueta,
    ventana: VENTANA,
    devicePixelRatioEmulado: 3,
    regimen: regimen.id,
    cuando: new Date().toISOString(),
    ...fila,
  }
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, `b-gpu-${etiqueta}.json`)
  writeFileSync(destino, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  escrito: ${destino}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
