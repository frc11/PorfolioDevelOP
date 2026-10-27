/**
 * [B8] EL COSTO DEL MOIRÉ POR CUADRO, antes y después — contra el dev server de `http://localhost:3000` (el de `scripts-viajes/banco`),
 * con un Chrome propio por CDP. Una corrida por rama:
 *
 *   PEDIDOS="producto" ROTULO=antes npx tsx scripts-carga/moire-costo.ts      (la integración: el moiré vivo, la fina en 38 y la gruesa en 44)
 *   ROTULO=despues npx tsx scripts-carga/moire-costo.ts                         (nocturno/2026-10-22-b8: `producto` y las cuatro variantes)
 *   ANCHO=1440 ALTO=900 · BANCO_GPU=alta para la NVIDIA (la placa se rotula con lo que dice la página, no con la bandera)
 *
 * Por pedido (`__entornoDeLaEscena`; varios, separados por `;`), en tres momentos del home (arriba, Quiénes somos y Trabajos, de noche):
 * el tiempo de GPU de todos los dibujos por cuadro durante 2 s (`__gpuDelBanco.grabar`) y la parte de la trama (una consulta por objeto
 * durante 60 cuadros: `trama gruesa`, `trama fina` y `zócalo`, cada una con sus dos dibujos: el del cuadro y el del fondo del cristal).
 * El criterio: con cada variante, la trama cuesta lo mismo o menos que antes y el total no sube más que el ruido entre corridas.
 * EL CONTROL: con `moire=0` el perfil no tiene ni la trama ni el zócalo; con `2`, las dos capas. Si no, el instrumento no ve la trama
 * y la corrida se marca `controlRojo`. Sale a `C:/Users/Valentino/.cache/b4-medicion/b8-moire/costo-<rotulo>-<ancho>.json`.
 *
 * [C2-31m] Las variantes se borraron (queda la de `mouse`, sin bandera): por defecto mide el producto y `fondo=cristal` (sin la trama),
 * y el control pasa a ser ése (sin la trama, ningún objeto de la trama; con ella, la gruesa y nunca la fina). El banco del moiré de
 * ahora (las líneas, las fotos, la entrada y el costo) es `scripts-carga/moire.ts`.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { abrir } from '../scripts-calidad/banco'
import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta, topeDe } from '../scripts-viajes/banco'

const ANCHO = Number(process.env.ANCHO ?? 1440)
const ALTO = Number(process.env.ALTO ?? 900)
const ROTULO = process.env.ROTULO ?? 'despues'
const PEDIDOS = (process.env.PEDIDOS ?? 'producto;producto,fondo=cristal').split(';').map((p) => p.trim()).filter(Boolean)
const DIR = 'C:/Users/Valentino/.cache/b4-medicion/b8-moire'
const TRAMA = ['trama gruesa', 'trama fina', 'zócalo']

const COSTO = `(async () => {
  const g = window.__gpuDelBanco
  if (!g || !g.extension) return { sinExtension: true }
  let cuadros = 0
  let sigue = true
  const contar = () => { if (!sigue) return; cuadros += 1; requestAnimationFrame(contar) }
  requestAnimationFrame(contar)
  g.grabar()
  await new Promise((r) => setTimeout(r, 2000))
  sigue = false
  const lista = await g.parar()
  const total = lista.reduce((s, [, ms]) => s + (Number.isFinite(ms) ? ms : 0), 0)
  const objetos = await g.medir(60, 'objetos')
  const trama = {}
  for (const n of ${JSON.stringify(TRAMA)}) { const p = objetos && objetos.pasadas[n]; trama[n] = p ? { ms: +p.ms.toFixed(4), veces: p.veces } : null }
  const moire = window.__moireDelBanco ? window.__moireDelBanco.estado() : null
  return { cuadros, gpuMsPorCuadro: +(total / Math.max(1, cuadros)).toFixed(3), disjunto: objetos ? objetos.disjunto : null, trama, moire }
})()`

const PLACA = `(() => { const gl = document.createElement('canvas').getContext('webgl2'); const e = gl && gl.getExtension('WEBGL_debug_renderer_info'); return e ? gl.getParameter(e.UNMASKED_RENDERER_WEBGL) : 'sin dato' })()`

interface Medida {
  readonly sinExtension?: boolean
  readonly gpuMsPorCuadro?: number
  readonly trama?: Record<string, { ms: number; veces: number } | null>
}

async function principal(): Promise<void> {
  mkdirSync(DIR, { recursive: true })
  const salida: Record<string, unknown> = { rotulo: ROTULO, ancho: ANCHO, alto: ALTO, cuando: new Date().toISOString() }
  let controlRojo = false
  for (const pedido of PEDIDOS) {
    const b = await abrir(pedido, ANCHO, ALTO)
    const fila: Record<string, unknown> = {}
    try {
      fila.placa = await medir<string>(b.p, PLACA)
      const momentos: readonly (readonly [string, number])[] = [
        ['arriba', 0],
        ['quienes-somos', (await topeDe(b, 'quienes-somos')) + ALTO],
        ['trabajos (noche)', (await topeDe(b, 'trabajos')) + ALTO],
      ]
      for (const [nombre, y] of momentos) {
        await scrollHasta(b, y)
        await esperar(2500)
        const m = await medir<Medida>(b.p, COSTO)
        fila[nombre] = m
        // El control: sin trama no hay objetos de la trama; con las dos, las dos.
        const t = m.trama ?? {}
        const hay = (n: string): boolean => t[n] !== null && t[n] !== undefined
        if ((pedido.includes('moire=0') || pedido.includes('fondo=cristal')) && TRAMA.some(hay)) controlRojo = true
        if (pedido.includes('moire=2') && m.sinExtension !== true && !(hay('trama gruesa') && hay('trama fina'))) controlRojo = true
        if (pedido === 'producto' && ROTULO !== 'antes' && m.sinExtension !== true && !(hay('trama gruesa') && !hay('trama fina'))) controlRojo = true
      }
    } finally {
      await b.cerrar()
    }
    salida[pedido] = fila
    console.log(pedido, JSON.stringify(fila))
  }
  salida.controlRojo = controlRojo
  const archivo = `${DIR}/costo-${ROTULO}-${String(ANCHO)}.json`
  writeFileSync(archivo, JSON.stringify(salida, null, 2))
  console.log(controlRojo ? 'CONTROL ROJO: el instrumento no ve la trama como debería' : 'control verde', '→', archivo)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exit(1)
})
