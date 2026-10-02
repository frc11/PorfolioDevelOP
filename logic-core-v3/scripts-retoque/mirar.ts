/**
 * SPRINT RETOQUE 3D — mirar en vivo con lo mínimo: UN Chrome propio por CDP con una pestaña, una lista de pasos y se
 * cierra al terminar. Contra el servidor de desarrollo, con la NVIDIA (`BANCO_GPU=alta`) y la compuerta de memoria del
 * sprint (1,5 GB; 2 min entre reintentos, hasta 5, después corre igual).
 *
 *   npx tsx scripts-retoque/mirar.ts <pasos.json>
 *
 * El archivo: `{ ancho, alto, consulta?, entorno?, reducido?, pasos: Paso[] }`. Cada paso, uno de:
 *   { "y": 5973 }                      scroll de una vez (window.scrollTo) y 1,5 s de espera
 *   { "rueda": 10, "cadaMs": 30 }      muescas de la rueda (negativas: para arriba)
 *   { "esperar": 1000 }
 *   { "medir": "expresión" }           imprime el resultado
 *   { "captura": "nombre" }            PNG en la carpeta `salida` (por defecto, la de entregas del sprint `_mirar/`)
 *   { "viajar": "trabajos" }           el viaje de la barra
 *   { "raton": [x, y] }
 *   { "recargar": "?consulta" }       vuelve a cargar /v3 (con esa consulta) y sigue sin esperar
 *   { "clic": [x, y] }                un clic de verdad (CDP): cuenta como acción del usuario (el audio lo pide)
 */
import { readFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirCon, antesDeLaParte, capturar, esperar, raton, rueda, viajarA } from '../scripts-3d-sonido/banco'

type Paso =
  | { readonly y: number }
  | { readonly rueda: number; readonly cadaMs?: number }
  | { readonly esperar: number }
  | { readonly medir: string }
  | { readonly captura: string }
  | { readonly viajar: string }
  | { readonly raton: readonly [number, number] }
  | { readonly recargar: string }
  | { readonly clic: readonly [number, number] }

interface Pedido {
  readonly ancho: number
  readonly alto: number
  readonly consulta?: string
  readonly entorno?: string | null
  readonly reducido?: boolean
  readonly salida?: string
  readonly pasos: readonly Paso[]
}

async function main(): Promise<void> {
  const archivo = process.argv[2]
  if (archivo === undefined) throw new Error('falta el archivo de pasos')
  const pedido = JSON.parse(readFileSync(archivo, 'utf8')) as Pedido
  const salida = pedido.salida ?? 'C:/Users/Valentino/.cache/b4-medicion/retoque-3d/_mirar'
  const { mkdirSync } = await import('node:fs')
  mkdirSync(salida, { recursive: true })
  await antesDeLaParte('mirar')
  const b = await abrirCon(pedido.entorno === undefined ? 'producto' : pedido.entorno, pedido.ancho, pedido.alto, pedido.consulta ?? '', pedido.reducido === true)
  console.log(`placa: ${b.placa}`)
  try {
    for (const paso of pedido.pasos) {
      if ('y' in paso) {
        await medir(b.p, `window.scrollTo(0, ${String(paso.y)})`)
        await esperar(1500)
      } else if ('rueda' in paso) await rueda(b, paso.rueda, paso.cadaMs ?? 40)
      else if ('esperar' in paso) await esperar(paso.esperar)
      else if ('medir' in paso) console.log(JSON.stringify(await medir<unknown>(b.p, paso.medir)))
      else if ('captura' in paso) {
        await capturar(b, `${salida}/${paso.captura}.png`)
        console.log(`captura: ${salida}/${paso.captura}.png`)
      } else if ('viajar' in paso) await viajarA(b, paso.viajar)
      else if ('recargar' in paso) await b.p.conexion.enviar('Page.navigate', { url: `http://localhost:3000/v3${paso.recargar}` }, b.p.sessionId)
      else if ('clic' in paso) {
        const [x, y] = paso.clic
        await raton(b, [x, y], [x, y])
        for (const type of ['mousePressed', 'mouseReleased'] as const) await b.p.conexion.enviar('Input.dispatchMouseEvent', { type, x, y, button: 'left', buttons: type === 'mousePressed' ? 1 : 0, clickCount: 1 }, b.p.sessionId)
      }
      else await raton(b, paso.raton, paso.raton)
    }
  } finally {
    await b.cerrar()
  }
}

main().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
