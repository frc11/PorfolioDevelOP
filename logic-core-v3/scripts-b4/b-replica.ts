/**
 * FRENTE B · la réplica — qué canvas ve `capturarRegion` a 1024, sección por
 * sección.
 *
 * `b-secciones.ts` marcó **las ocho** filas de 1024 con `masAltoQueLaVentana`,
 * que `capturarRegion` pone cuando el recorte pasa una pantalla **y**
 * `document.querySelector('canvas') !== null`. `b-compuerta.ts` (barrido
 * completo) y `b-vigilia.ts` (90 s de sondeo) cuentan cero canvas a 1024 y
 * **cero recursos de escena pedidos**, así que el escenario NO está montado.
 *
 * Este archivo replica la secuencia exacta de `capturarRegion` —scroll, gracia
 * de escena, lectura— y en vez del booleano pide **el detalle**: cuántos canvas,
 * de qué tamaño y de quién cuelgan. Es la diferencia entre «probablemente es el
 * canvas del intro» y haberlo medido.
 *
 * ⚠️ No captura a la carpeta del reporte: escribe en el scratchpad y lo borra.
 * Las capturas buenas son las de `b-secciones.ts`.
 */

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from './captura'
import { medir, scrollA } from './navegador'
import { perfilPorId } from './perfiles'
import { paneles } from './sitio'
import { conLaPagina, guardarJson, procedencia } from './b-comun'

const DETALLE = `(() => {
  const cs = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect()
    return { ancho: Math.round(r.width), alto: Math.round(r.height), clases: c.className, padre: c.parentElement === null ? '' : c.parentElement.className }
  })
  return {
    hayEscenario: document.querySelector('canvas') !== null,
    canvas: cs,
    introMontado: document.querySelector('[data-home-intro-overlay]') !== null,
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    scrollY: window.scrollY,
    perfNow: Math.round(performance.now()),
  }
})()`

interface Detalle {
  readonly hayEscenario: boolean
  readonly canvas: readonly { readonly ancho: number; readonly alto: number; readonly clases: string; readonly padre: string }[]
  readonly introMontado: boolean
  readonly innerWidth: number
  readonly innerHeight: number
  readonly scrollY: number
  readonly perfNow: number
}

async function principal(): Promise<void> {
  const temporal = mkdtempSync(path.join(tmpdir(), 'b-replica-'))
  const perfil = perfilPorId('1024')
  try {
    const filas = await conLaPagina(perfil, '/v3', async ({ pagina }) => {
      const pans = await paneles(pagina)
      const salida: (Detalle & { readonly seccion: string; readonly momento: string })[] = []
      for (const panel of pans) {
        const y = Math.round(panel.top)
        const alto = Math.round(panel.alto)
        await scrollA(pagina, y)
        await esperarElPrimerCuadro(pagina)
        const antes = await medir<Detalle>(pagina, DETALLE)
        await capturar(pagina, path.join(temporal, `${panel.id}.png`), { x: 0, y, width: perfil.ancho, height: alto })
        const despues = await medir<Detalle>(pagina, DETALLE)
        salida.push({ seccion: panel.id, momento: 'antes de capturar', ...antes })
        salida.push({ seccion: panel.id, momento: 'después de capturar', ...despues })
        console.log(
          `${panel.id.padEnd(16)} antes: canvas=${antes.canvas.length} intro=${antes.introMontado} ` +
            `hayEscenario=${antes.hayEscenario} perfNow=${antes.perfNow}  |  después: canvas=${despues.canvas.length} ` +
            `intro=${despues.introMontado} perfNow=${despues.perfNow}` +
            `${antes.canvas.length > 0 ? `  → ${JSON.stringify(antes.canvas)}` : ''}`,
        )
      }
      return salida
    })
    const ruta = guardarJson('replica-1024', {
      procedencia: procedencia(
        'scripts-b4/b-replica.ts',
        'réplica de la secuencia de `capturarRegion` a 1024, pidiendo el detalle del canvas en vez del booleano. Sin estrangular. Emulado.',
      ),
      filas,
    })
    console.log(`\n→ ${ruta}`)
  } finally {
    rmSync(temporal, { recursive: true, force: true })
  }
}

principal().catch((e: unknown) => {
  console.error(e instanceof Error ? e.message : String(e))
  process.exit(1)
})
