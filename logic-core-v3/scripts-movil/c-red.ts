/**
 * MOVIL-1 · C — QUÉ DESCARGA UN TELÉFONO AL ABRIR `/v3`.
 *
 *     npx tsx scripts-movil/c-red.ts --etiqueta=<antes|despues> [--origen=…]
 *
 * ── Por qué se mide en el navegador y no sobre el build ───────────────────
 *
 * Porque la pregunta del sprint no es «cuánto pesa la carga inicial» —eso lo
 * mide `s5-peso` sobre los `<script src>` del HTML y **no se mueve por este
 * cambio**, porque el chunk de la escena sigue siendo diferido—. La pregunta es
 * **cuántos bytes baja un teléfono que abre la página**, y eso incluye lo que el
 * `import()` pide DESPUÉS de hidratar, que ningún instrumento del repo miraba.
 *
 * Son dos cifras distintas y las dos son ciertas. Confundirlas es lo que haría
 * que este montaje pareciera gratis.
 *
 * ── Cómo se cuenta ────────────────────────────────────────────────────────
 *
 * `performance.getEntriesByType('resource')` más la entrada de navegación, con
 * `transferSize` — que es lo que viajó por el cable, comprimido y con cabeceras.
 * Se reparte por tipo y se marca cuáles son de la escena, identificándolos por
 * **contenido** (la marca de la escena) y no por el nombre del chunk, que lleva
 * un hash que cambia en cada build.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { medir } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  ORIGEN,
  RAIZ_DE_SALIDAS,
  REGIMENES,
  argumento,
  asegurarCarpetas,
  conElHomeMovil,
} from './movil-comun'

interface Recurso {
  readonly url: string
  readonly tipo: string
  readonly transferido: number
  readonly descomprimido: number
}

const RECURSOS = `(() => {
  const nav = performance.getEntriesByType('navigation')[0]
  const rec = performance.getEntriesByType('resource').map((r) => ({
    url: r.name,
    tipo: r.initiatorType,
    transferido: r.transferSize || 0,
    descomprimido: r.decodedBodySize || 0,
  }))
  return [{ url: location.href, tipo: 'document', transferido: nav ? nav.transferSize || 0 : 0, descomprimido: nav ? nav.decodedBodySize || 0 : 0 }, ...rec]
})()`

const HAY_CANVAS = `(() => {
  const c = document.querySelector('canvas')
  const env = document.querySelector('[data-escena]')
  return { canvas: c !== null, escena: env !== null, marca: env === null ? '' : String(env.getAttribute('data-escena')) }
})()`

async function main(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  const origen = argumento('origen', ORIGEN)

  // Un solo régimen alcanza: los bytes no dependen de la CPU.
  const regimen = REGIMENES[0]
  const fila = await conElHomeMovil(
    regimen,
    async ({ pagina }) => {
      await medir<boolean>(
        pagina,
        `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`,
      )
      const presencia = await medir<{ canvas: boolean; escena: boolean; marca: string }>(pagina, HAY_CANVAS)
      const recursos = await medir<Recurso[]>(pagina, RECURSOS)
      return { presencia, recursos }
    },
    { origen, quien: 'movil-red' },
  )

  const total = fila.recursos.reduce((n, r) => n + r.transferido, 0)
  const js = fila.recursos.filter((r) => /\.js(\?|$)/.test(r.url))
  const totalJs = js.reduce((n, r) => n + r.transferido, 0)

  console.log(`\n  /v3 a 390×844 — ${fila.recursos.length} pedidos · ${(total / 1024).toFixed(1)} KiB transferidos`)
  console.log(`    de los cuales JavaScript: ${js.length} archivos · ${(totalJs / 1024).toFixed(1)} KiB`)
  console.log(`    canvas en el DOM: ${fila.presencia.canvas ? 'SÍ' : 'NO'} · envoltorio de escena: ${fila.presencia.escena ? 'SÍ' : 'NO'}`)
  console.log('\n  los 12 pedidos más pesados:')
  for (const r of [...fila.recursos].sort((a, b) => b.transferido - a.transferido).slice(0, 12)) {
    console.log(`    ${(r.transferido / 1024).toFixed(1).padStart(8)} KiB  ${r.tipo.padEnd(10)} ${r.url.replace(origen, '')}`)
  }

  const salida = {
    etiqueta,
    origen,
    cuando: new Date().toISOString(),
    presencia: fila.presencia,
    pedidos: fila.recursos.length,
    transferidoTotal: total,
    transferidoJs: totalJs,
    archivosJs: js.length,
    recursos: fila.recursos,
  }
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  const destino = path.join(RAIZ_DE_SALIDAS, `c-red-${etiqueta}.json`)
  writeFileSync(destino, `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
  console.log(`\n  escrito: ${destino}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
