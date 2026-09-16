/**
 * TEXTO-1 · A — DE DÓNDE SALE EL ALTO DEL BLOQUE, línea por línea.
 *
 *     npx tsx scripts-texto/a-desglose.ts --etiqueta=hoy
 *     npx tsx scripts-texto/a-desglose.ts --etiqueta=despues --ancho=375
 *
 * Contesta el PASO 1 del sprint: cuántas líneas ocupa cada registro del titular,
 * cuántas la bajada, cuánto mide el CTA y cuánto suman los huecos y el relleno,
 * en los ocho anchos del banco de TAPADO-1.
 *
 * Y publica al lado la cuenta que decide el sprint: **cuánto sobra** el bloque
 * contra el hueco que el logo deja, con las DOS lecturas del objetivo —la del
 * texto de la instrucción, que lleva el bloque hasta el borde de abajo del
 * viewport, y la que respeta `pb-20`, que es la que el árbol tiene hoy—.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { medir, scrollA } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  VENTANAS,
  argumento,
  conChrome,
  enLaVentana,
} from '../scripts-tapado/tapado-comun'
import {
  LECTOR,
  RAIZ_DE_SALIDAS,
  dos,
  finDeLaMasaDelLogo,
  type Desglose,
} from './texto-comun'

interface Fila {
  readonly ancho: number
  readonly alto: number
  readonly desglose: Desglose
  readonly cuenta: Record<string, number | null>
}

async function main(): Promise<void> {
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  const soloAncho = argumento('ancho', '')
  const ventanas = soloAncho === '' ? VENTANAS : VENTANAS.filter((v) => String(v.ancho) === soloAncho)
  if (ventanas.length === 0) throw new Error(`ningun ancho coincide con --ancho=${soloAncho}`)

  const masa = finDeLaMasaDelLogo('hoy')
  const filas: Fila[] = []

  for (const v of ventanas) {
    const desglose = await conChrome(`texto-a-${v.ancho}`, async (chrome) =>
      enLaVentana(
        chrome,
        v,
        async ({ pagina }) => {
          await scrollA(pagina, 0)
          await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, 900)); return true })()`)
          const d = await medir<Desglose | null>(pagina, LECTOR)
          if (d === null) throw new Error(`a ${v.ancho}: no hay [data-pantalla="hero"] en el DOM`)
          return d
        },
        { asentamientoMs: ASENTAMIENTO_MS },
      ),
    )

    const m = masa.find((x) => x.ancho === v.ancho) ?? null
    const altoDelBloque = desglose.bloque?.alto ?? null
    const rellenoAbajo = desglose.relleno.abajo
    const cuenta: Record<string, number | null> = {
      altoDelBloque: altoDelBloque === null ? null : dos(altoDelBloque),
      ultimaFilaDeLaMasa: m === null ? null : m.ultimaFila,
      fraccionDeLaMasa: m === null ? null : m.fraccion,
      // LECTURA 1 — la del texto de la instrucción: el bloque llega al borde.
      huecoHastaElBorde: m === null ? null : m.huecoHastaElBorde,
      sobraHastaElBorde:
        m === null || altoDelBloque === null ? null : dos(altoDelBloque - m.huecoHastaElBorde),
      // LECTURA 2 — con `pb-20` intacto, que es lo que el árbol hace hoy.
      huecoConPbIntacto: m === null ? null : m.huecoHastaElBorde - rellenoAbajo,
      sobraConPbIntacto:
        m === null || altoDelBloque === null
          ? null
          : dos(altoDelBloque - (m.huecoHastaElBorde - rellenoAbajo)),
    }
    filas.push({ ancho: v.ancho, alto: v.alto, desglose, cuenta })

    const p = (x: number | null): string => (x === null ? '  n/d' : x.toFixed(1).padStart(7))
    console.log(
      `  ${String(v.ancho).padStart(4)}x${String(v.alto).padEnd(4)}` +
        `  L1 ${desglose.linea1.renglones?.cantidad ?? 0}x${desglose.linea1.fontSize.toFixed(2).padStart(6)}px` +
        `  L2 ${desglose.linea2.renglones?.cantidad ?? 0}x${desglose.linea2.fontSize.toFixed(2).padStart(6)}px` +
        `  bajada ${desglose.bajada.renglones?.cantidad ?? 0}x${desglose.bajada.fontSize.toFixed(0)}px` +
        `  cta ${dos(desglose.cta.caja?.alto ?? 0)}` +
        `  | bloque ${p(cuenta.altoDelBloque)}  sobra(borde) ${p(cuenta.sobraHastaElBorde)}  sobra(pb) ${p(cuenta.sobraConPbIntacto)}`,
    )
  }

  const salida = {
    etiqueta,
    cuando: new Date().toISOString(),
    instrumento:
      'scripts-texto/a-desglose.ts — Range.getClientRects() por pieza + getBoundingClientRect, sobre la pagina en reposo',
    referenciaDeLaMasa: 'docs/rediseno/outputs/tapado/a-verdad-hoy.json (bandasDeMasaEnLaColumna, banda mayor)',
    filas,
  }
  const ruta = path.join(RAIZ_DE_SALIDAS, `a-desglose-${etiqueta}.json`)
  writeFileSync(ruta, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  -> ${ruta}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
