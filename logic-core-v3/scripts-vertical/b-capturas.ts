/**
 * VERTICAL-1 · B — LAS SIETE CAPTURAS, una por keyframe, a 390×844.
 *
 *     npx tsx scripts-vertical/b-capturas.ts --etiqueta=<antes|despues>
 *
 * ── ⚠️ POR QUÉ NO ALCANZA CON SCROLLEAR A UNA FRACCIÓN DEL DOCUMENTO ──────
 *
 * Es lo que hacía `scripts-movil/d-captura.ts`, y para «mirá la sala» estaba
 * bien. Acá no: **el progreso del recorrido NO es lineal en el scroll**. Lo mapea
 * el anclaje (`anclaje.ts` → `recorrido.ts`), con nudos por sección y ritmos
 * distintos por segmento. Capturar en `0,375 × alturaDelDocumento` no captura el
 * keyframe que vive en el progreso 0,375; captura otra cosa parecida, y dos
 * corridas de este script compararían dos poses distintas creyendo que son la
 * misma.
 *
 * ── Cómo se resuelve, sin escribir una segunda aritmética ─────────────────
 *
 * Se **invierte la función de producción**. `progresoDelScroll(scrollY, arriba,
 * abajo, ventana)` es pura y se puede importar en Node; lo único que necesita del
 * navegador son sus tres parámetros, que se leen UNA vez con la misma medición
 * que usa la escena (`medirLasSecciones` sobre `[data-panel]`, más `innerHeight`).
 * Con eso, una búsqueda binaria de 40 pasos da el `scrollY` de cada progreso al
 * píxel.
 *
 * El progreso alcanzado se recalcula y se publica junto a la captura: si la
 * inversión fallara, la diferencia se ve en el reporte en vez de esconderse.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import { CHOREO_KEYFRAMES } from '../src/app/v3/_lib/escena/choreography'
import { progresoDelScroll } from '../src/app/v3/_lib/escena/recorrido'
import {
  ASENTAMIENTO_MS,
  REGIMENES,
  argumento,
  asegurarCarpetas,
  conElHomeMovil,
} from '../scripts-movil/movil-comun'
import { CARPETA_DE_CAPTURAS, RAIZ_DE_SALIDAS, VENTANA } from './vertical-comun'

interface Extension {
  readonly arriba: number
  readonly abajo: number
  readonly ventana: number
  readonly alturaDoc: number
  readonly paneles: number
}

/** La MISMA medición que hace `medirLasSecciones`, escrita para la página. */
const EXTENSION = `(() => {
  const y = window.scrollY
  const nodos = document.querySelectorAll('[data-panel]')
  let arriba = Infinity
  let abajo = -Infinity
  for (const n of nodos) {
    const c = n.getBoundingClientRect()
    if (c.top + y < arriba) arriba = c.top + y
    if (c.bottom + y > abajo) abajo = c.bottom + y
  }
  return {
    arriba,
    abajo,
    ventana: window.innerHeight,
    alturaDoc: document.documentElement.scrollHeight,
    paneles: nodos.length,
  }
})()`

/** El `scrollY` que produce un progreso, por bisección sobre la función de producción. */
function scrollDeProgreso(objetivo: number, e: Extension): { y: number; logrado: number } {
  let lo = 0
  let hi = Math.max(0, e.alturaDoc - e.ventana)
  for (let i = 0; i < 40; i += 1) {
    const medio = (lo + hi) / 2
    if (progresoDelScroll(medio, e.arriba, e.abajo, e.ventana) < objetivo) lo = medio
    else hi = medio
  }
  const y = Math.round((lo + hi) / 2)
  return { y, logrado: progresoDelScroll(y, e.arriba, e.abajo, e.ventana) }
}

async function main(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })

  const fila = await conElHomeMovil(
    REGIMENES[0],
    async ({ pagina }) => {
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)
      const e = await medir<Extension>(pagina, EXTENSION)
      if (!Number.isFinite(e.arriba) || e.paneles === 0) {
        throw new Error(`no se pudo medir la extensión de las secciones (paneles=${e.paneles})`)
      }
      console.log(
        `  extensión de los ${e.paneles} paneles: [${e.arriba.toFixed(0)} … ${e.abajo.toFixed(0)}] · ventana ${e.ventana} · documento ${e.alturaDoc}\n`,
      )
      console.log('   #  keyframe            progreso    scrollY   progreso logrado    Δ        fase        archivo')
      console.log('   ──────────────────────────────────────────────────────────────────────────────────────────────')

      const paradas: unknown[] = []
      for (const [i, k] of CHOREO_KEYFRAMES.entries()) {
        const { y, logrado } = scrollDeProgreso(k.at, e)
        // eslint-disable-next-line no-await-in-loop
        const puesto = await scrollA(pagina, y)
        // eslint-disable-next-line no-await-in-loop
        await esperarElPrimerCuadro(pagina, 1500)
        const archivo = path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${String(i + 1).padStart(2, '0')}-${k.name.replace(/[^a-z0-9]+/gi, '-')}.png`)
        // eslint-disable-next-line no-await-in-loop
        const bytes = await capturar(pagina, archivo)
        // eslint-disable-next-line no-await-in-loop
        const fase = await medir<string>(
          pagina,
          `(() => { const n = document.querySelector('[data-escena]'); return n === null ? '(sin escena)' : String(n.getAttribute('data-escena-fase')) })()`,
        )
        console.log(
          `  ${String(i + 1).padStart(2)}  ${k.name.padEnd(18)} ${k.at.toFixed(3).padStart(7)}  ${String(puesto).padStart(8)}   ${logrado.toFixed(6).padStart(9)}   ${(logrado - k.at).toFixed(6).padStart(9)}  ${fase.padEnd(11)} ${path.basename(archivo)}`,
        )
        paradas.push({ indice: i + 1, keyframe: k.name, progreso: k.at, scrollY: puesto, progresoLogrado: logrado, fase, bytes, archivo })
      }
      return { extension: e, paradas }
    },
    { quien: 'vertical-captura' },
  )

  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  writeFileSync(
    path.join(RAIZ_DE_SALIDAS, `b-capturas-${etiqueta}.json`),
    `${JSON.stringify({ etiqueta, ventana: VENTANA, cuando: new Date().toISOString(), ...fila }, null, 2)}\n`,
    'utf8',
  )
  console.log(`\n  escrito: ${path.join(RAIZ_DE_SALIDAS, `b-capturas-${etiqueta}.json`)}`)
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
