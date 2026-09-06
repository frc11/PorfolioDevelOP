/**
 * CAPTURAR — el paso 5b de la receta, con las DOS reglas que la Fase 0 de este
 * bloque midió y que no estaban escritas en ningún lado.
 *
 * Vive aparte de `navegador.ts` porque ese archivo cruzaba las 300 líneas, y el
 * corte es por tema: allá está abrir, emular, navegar y verificar; acá, sacar la
 * foto. Ninguna de las dos mitades comparte estado con la otra.
 *
 * **Es `Page.captureScreenshot` y no una lectura del canvas.** El búfer de WebGL
 * no se puede leer desde la página —`ProbeStage` monta con `alpha: false` y sin
 * `preserveDrawingBuffer`, así que `toDataURL`, `drawImage` y `readPixels`
 * devuelven un cuadro rancio (`B2-DELTAS` §2.1)—. La única puerta al píxel de la
 * escena es la foto de lo compuesto.
 */

import { writeFileSync } from 'node:fs'

import { medir, scrollA, type Pagina } from './navegador'

export interface Recorte {
  readonly x: number
  readonly y: number
  readonly width: number
  readonly height: number
}

/**
 * PASO 5b — capturar. **Es `Page.captureScreenshot`, la foto de lo compuesto**,
 * que es la única puerta al píxel de la escena: el búfer de WebGL no se puede
 * leer desde la página (`B2-DELTAS` §2.1).
 *
 * ⚠️ `captureBeyondViewport` es lo que hace posible la captura por sección de la
 * receta: una sección de este sitio mide dos, tres o cuatro pantallas, y una
 * captura de viewport escondería justamente el aire que hay abajo del pliegue.
 *
 * ⚠️ Y **el recorte se acota a 16.384 px de alto**, que es el techo del
 * rasterizador. Más alto que eso Chrome devuelve una imagen truncada **sin
 * error**, que es la clase de falla que da un número plausible.
 */
export const ALTO_MAXIMO_DE_CAPTURA_PX = 16_384

export async function capturar(p: Pagina, destino: string, recorte?: Recorte): Promise<number> {
  if (recorte !== undefined && recorte.height > ALTO_MAXIMO_DE_CAPTURA_PX) {
    throw new Error(`recorte de ${recorte.height} px: el rasterizador trunca arriba de ${ALTO_MAXIMO_DE_CAPTURA_PX}`)
  }
  const parametros: Record<string, unknown> = { format: 'png', captureBeyondViewport: recorte !== undefined }
  if (recorte !== undefined) parametros.clip = { ...recorte, scale: 1 }
  const r = (await p.conexion.enviar('Page.captureScreenshot', parametros, p.sessionId)) as { data: string }
  const bytes = Buffer.from(r.data, 'base64')
  writeFileSync(destino, bytes)
  return bytes.length
}

/**
 * ⚠️ **LA ESCENA TARDA EN DIBUJAR SU PRIMER CUADRO, Y CAPTURAR ANTES MIENTE
 * POR 77 PUNTOS.** Medido con `diagnostico-captura.ts` a 1920, aire muerto del
 * hero contra el tiempo desde `load`:
 *
 *     t+   0 ms   77,59 %      t+ 700 ms   0,00 %
 *     t+ 300 ms   76,11 %      t+2000 ms   0,00 %
 *
 * El 0 % es el número que B1 publicó para el hero; el 77,59 % es la misma
 * pantalla fotografiada con el canvas todavía en negro. **No es un margen de
 * error: es la diferencia entre «esta sección está llena» y «esta sección está
 * vacía».** 1200 ms es el 700 medido con holgura, y se declara en cada tabla.
 */
export const GRACIA_DE_ESCENA_MS = 1200

export async function esperarElPrimerCuadro(p: Pagina, ms: number = GRACIA_DE_ESCENA_MS): Promise<void> {
  await medir<boolean>(p, `(async () => { await new Promise((r) => setTimeout(r, ${ms})); return true })()`)
}

export interface RegionCapturada {
  readonly bytes: number
  readonly scrollPedido: number
  readonly scrollLogrado: number
  /** `true` si el recorte es más alto que la ventana Y la página tiene escenario. Ver abajo. */
  readonly masAltoQueLaVentana: boolean
}

/**
 * ⚠️ **UN RECORTE SÓLO VALE SI EL SCROLL ESTÁ EN LA REGIÓN QUE RECORTA.**
 *
 * El escenario es `fixed inset-0` (`compuerta.ts`, `CLASES_FUERA_DE_FLUJO`), o
 * sea que Chrome lo compone **una sola vez, donde está la ventana**. Medido con
 * `diagnostico-captura.ts` sobre `por-que-develop`, que es `papel-transparente`
 * y arranca en el píxel 17.280 del documento:
 *
 *     recorte de esa región con el scroll en 0        →  95,09 % de aire
 *     viewport con el scroll en 17.280                →   0,00 %
 *     recorte de esa región con el scroll en 17.280   →   0,00 %
 *
 * **Noventa y cinco puntos de diferencia por dónde estaba el scroll**, con el
 * mismo recorte y el mismo instante. Por eso esta función scrollea primero.
 *
 * ⚠️ Y el corolario, que hay que tener escrito: **una captura más alta que la
 * ventana no puede representar lo que se ve en una página con capa fija.** El
 * escenario aparece en una pantalla y falta en las otras. Hoy el peligro está
 * desactivado por el layout —las dos secciones `papel-transparente` miden
 * exactamente una pantalla— pero la función lo devuelve marcado, no lo esconde.
 */
export async function capturarRegion(
  p: Pagina,
  destino: string,
  region: { readonly y: number; readonly alto: number; readonly ancho: number },
  opciones: { readonly graciaMs?: number } = {},
): Promise<RegionCapturada> {
  const scrollLogrado = await scrollA(p, region.y)
  await esperarElPrimerCuadro(p, opciones.graciaMs)
  const ventana = await medir<number>(p, 'window.innerHeight')
  const hayEscenario = await medir<boolean>(p, 'document.querySelector("canvas") !== null')
  const bytes = await capturar(p, destino, { x: 0, y: region.y, width: region.ancho, height: region.alto })
  return {
    bytes,
    scrollPedido: region.y,
    scrollLogrado,
    masAltoQueLaVentana: region.alto > ventana && hayEscenario,
  }
}
