/**
 * MOVIL-1 · D — LA SALA A 390×844, para que el humano juzgue el moiré.
 *
 *     npx tsx scripts-movil/d-captura.ts --etiqueta=<nombre-del-corte>
 *
 * ── Qué captura, y por qué esos tres progresos ────────────────────────────
 *
 * El moiré es el efecto central de la sala y no se ve igual en todo el
 * recorrido: las dos celosías baten por paralaje, así que **la cantidad de
 * batido depende de dónde está la cámara**. Se capturan tres posiciones de
 * scroll declaradas, y las tres en el mismo sitio en todas las corridas para que
 * las capturas de dos cortes se puedan poner una al lado de la otra.
 *
 * ── ⚠️ LO QUE ESTE SCRIPT NO HACE, Y ES A PROPÓSITO ───────────────────────
 *
 * **No juzga.** No cuenta píxeles del patrón, no calcula una métrica de
 * aliasing, no dice si el moiré «sobrevive». Eso lo decide el humano mirando,
 * porque es lo que la instrucción dice con esas palabras: *«Podés decir "con
 * pixelRatio 1 da 58 fps". No podés decir "el moiré se ve bien"»*.
 *
 * Lo único que sí publica es el dato duro que hace comparable la mirada: **a
 * cuántos píxeles FÍSICOS se está rasterizando el canvas** en cada corrida. Sin
 * ese número, dos capturas del mismo tamaño en pantalla pueden venir de dos
 * resoluciones distintas y nadie lo sabría.
 *
 * ⚠️ La captura sale con `deviceScaleFactor` 3, así que el PNG mide 1170×2532:
 * es el cuadro tal como lo ve el teléfono, con el canvas escalado por el
 * navegador desde donde sea que se haya rasterizado.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

import { capturar, esperarElPrimerCuadro } from '../scripts-b4/captura'
import { medir, scrollA } from '../scripts-b4/navegador'
import {
  ASENTAMIENTO_MS,
  CARPETA_DE_CAPTURAS,
  RAIZ_DE_SALIDAS,
  REGIMENES,
  VENTANA,
  argumento,
  asegurarCarpetas,
  conElHomeMovil,
  dos,
} from './movil-comun'

/**
 * Las tres paradas, en FRACCIÓN del recorrido y no en píxeles: el alto del
 * documento a 390 no es el mismo que a 1440 y un número absoluto no viajaría.
 */
const PARADAS = [
  { id: 'a-hero', fraccion: 0, que: 'el hero — la pose de entrada' },
  { id: 'b-medio', fraccion: 0.5, que: 'la mitad del recorrido' },
  { id: 'c-diferencial', fraccion: 0.75, que: 'el progreso 0,750, donde el diferencial llena el cuadro' },
] as const

async function main(): Promise<void> {
  asegurarCarpetas()
  const etiqueta = argumento('etiqueta', 'sin-etiqueta')
  mkdirSync(CARPETA_DE_CAPTURAS, { recursive: true })

  const fila = await conElHomeMovil(
    REGIMENES[0],
    async ({ pagina }) => {
      await medir<boolean>(pagina, `(async () => { await new Promise((r) => setTimeout(r, ${ASENTAMIENTO_MS})); return true })()`)

      const lienzo = await medir<{ ancho: number; alto: number; cssAncho: number; factor: number }>(
        pagina,
        `(() => { const c = document.querySelector('canvas'); return c === null ? { ancho: 0, alto: 0, cssAncho: 0, factor: 0 } : { ancho: c.width, alto: c.height, cssAncho: c.clientWidth, factor: c.clientWidth === 0 ? 0 : c.width / c.clientWidth } })()`,
      )
      if (lienzo.ancho === 0) throw new Error('no hay canvas en el DOM: la escena no montó, y capturar sin escena no dice nada')

      const alto = await medir<number>(pagina, 'document.documentElement.scrollHeight - window.innerHeight')
      const paradas: unknown[] = []
      for (const parada of PARADAS) {
        const y = Math.round(parada.fraccion * alto)
        // eslint-disable-next-line no-await-in-loop
        const logrado = await scrollA(pagina, y)
        // eslint-disable-next-line no-await-in-loop
        await esperarElPrimerCuadro(pagina, 1400)
        const destino = path.join(CARPETA_DE_CAPTURAS, `${etiqueta}-${parada.id}.png`)
        // eslint-disable-next-line no-await-in-loop
        const bytes = await capturar(pagina, destino)
        // eslint-disable-next-line no-await-in-loop
        const fase = await medir<string>(
          pagina,
          `(() => { const e = document.querySelector('[data-escena]'); return e === null ? '(sin escena)' : String(e.getAttribute('data-escena-fase')) })()`,
        )
        console.log(`  ${parada.id.padEnd(15)} y=${String(y).padStart(6)} (logrado ${logrado}) · fase «${fase}» · ${(bytes / 1024).toFixed(0)} KiB → ${destino}`)
        paradas.push({ ...parada, y, logrado, fase, bytes, archivo: destino })
      }
      return { lienzo, alto, paradas }
    },
    { quien: 'movil-captura' },
  )

  console.log(
    `\n  canvas ${fila.lienzo.ancho}×${fila.lienzo.alto} px físicos (css ${fila.lienzo.cssAncho}) — factor ${dos(fila.lienzo.factor)} · ${fila.lienzo.ancho * fila.lienzo.alto} píxeles rasterizados por cuadro`,
  )
  const salida = { etiqueta, ventana: VENTANA, devicePixelRatioEmulado: 3, cuando: new Date().toISOString(), ...fila }
  mkdirSync(RAIZ_DE_SALIDAS, { recursive: true })
  writeFileSync(path.join(RAIZ_DE_SALIDAS, `d-captura-${etiqueta}.json`), `${JSON.stringify(salida, null, 2)}\n`, 'utf8')
}

main().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
