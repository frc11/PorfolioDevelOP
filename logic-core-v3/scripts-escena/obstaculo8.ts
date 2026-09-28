/**
 * SPRINT ESCENA 8 — T5, la colisión con el logo: obstaculo8.ts <clips|sonda> [variante]
 *
 * El scroll fuerte con el logo en cuadro, en las dos direcciones (el gesto `fuerte` de ESCENA 7: del hero a
 * Quiénes somos en 0,6 s, quieto, y de vuelta), grabado a velocidad real, con un recorte al doble del logo y
 * el lado a lado con el mismo gesto de ESCENA 7 (las formas aproximadas).
 * Mientras graba, muestrea en la página cuántas motas hay en cada modo de la física (pegadas: modo 6; sobre
 * el logo: modo 3) y cuánto se mueve el logo: `escena8/obstaculo/<gesto>-sonda.json`. `sonda` hace lo
 * mismo sin grabar.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, type Banco } from '../scripts-viajes/banco'
import { DIR7, grabar, mover, topeMas } from './banco-escena'
import { abrir8, carpeta8 } from './banco8'
import { FUERA, ladoALado, recorte } from './clips6'
import { GESTOS_DEL_OBSTACULO, ZONA_DEL_LOGO } from './clips7'

const [QUE, VARIANTE] = [process.argv[2] ?? 'clips', process.argv[3] ?? 'producto']

/** Cada 100 ms: el tiempo, el scroll, las motas en cada modo y cuánto se mueve el logo. */
const MUESTREAR = `(() => { window.__sondaDelObstaculo = []; const t0 = performance.now(); const id = setInterval(() => { if (!window.__sondaDelObstaculo) { clearInterval(id); return } const f = window.__fisicaDelBanco; window.__sondaDelObstaculo.push([Math.round(performance.now() - t0), Math.round(scrollY), f.modos(), Math.round(f.movimientoDelLogo() * 100) / 100]) }, 100) })()`
const JUNTAR = `(() => { const l = window.__sondaDelObstaculo; window.__sondaDelObstaculo = null; return l })()`

type Muestra = [number, number, number[], number]

/** El gesto: el `fuerte` de ESCENA 7, tal cual (bajando fuerte y quieto; subiendo fuerte y quieto), para el lado a lado. */
function gesto(b: Banco, quienes: number): Promise<void> {
  return GESTOS_DEL_OBSTACULO.fuerte(b, quienes)
}

async function principal(): Promise<void> {
  const dir = carpeta8('obstaculo')
  const b = await abrir8(VARIANTE)
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(2500)
    await medir(b.p, MUESTREAR)
    const destino = `${dir}/scroll-fuerte-ida-y-vuelta`
    const r = QUE === 'clips' ? await grabar(b, destino, () => gesto(b, quienes), 1440) : (await gesto(b, quienes), null)
    const sonda = await medir<Muestra[]>(b.p, JUNTAR)
    if (QUE === 'clips') {
      recorte(`${destino}.mp4`, `${destino}-logo-x2.mp4`, ...ZONA_DEL_LOGO)
      // Antes (ESCENA 7, las formas aproximadas; el mismo gesto) y después, al doble.
      ladoALado(`${DIR7}/obstaculo/fuerte-despues-logo-x2.mp4`, `${destino}-logo-x2.mp4`, `${dir}/antes-y-despues-logo-x2.mp4`, ['antes (ESCENA 7) - formas aproximadas', 'despues - la malla real'])
    }
    const pegadas = sonda.map((m) => m[2][6])
    const mas = Math.max(...pegadas)
    // Cuánto dura una tanda de pegadas: desde que aparecen hasta que no queda ninguna.
    const tandas: number[][] = []
    let desde = -1
    sonda.forEach((m, i) => {
      if (m[2][6] > 0 && desde < 0) desde = i
      if (m[2][6] === 0 && desde >= 0) {
        tandas.push([sonda[desde][0], m[0], (m[0] - sonda[desde][0]) / 1000])
        desde = -1
      }
    })
    writeFileSync(`${dir}/scroll-fuerte-sonda${VARIANTE === 'producto' ? '' : `-${VARIANTE.replace(/[^a-z0-9]+/gi, '-')}`}.json`, JSON.stringify({ columnas: ['ms', 'scroll', 'modos (aire, cayendo, piso, sobre el logo, deslizando, levantada, pegada)', 'movimiento del logo u/s'], quienes, muestras: sonda }))
    console.log(JSON.stringify({ variante: VARIANTE, clip: r, pegadasMax: mas, tandas, movimientoMax: Math.max(...sonda.map((m) => m[3])) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('obstaculo8.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
