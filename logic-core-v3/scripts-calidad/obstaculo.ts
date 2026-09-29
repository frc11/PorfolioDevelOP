/**
 * SPRINT CALIDAD 1 — A3, el obstáculo sin pegado: obstaculo.ts <etiqueta> [gesto]
 *
 * El scroll fuerte con el logo en cuadro, en las dos direcciones (el gesto `fuerte` de ESCENA 7 y 8: del hero a
 * Quiénes somos en 0,6 s, quieto, y de vuelta), grabado a velocidad real, con el recorte al doble del logo. Y el
 * mismo gesto `suave` (4,5 s de ida y de vuelta): con el aire lento es donde el polvo tiene tiempo de rodear al logo
 * y de pasar por sus huecos. Mientras graba, muestrea cada 100 ms cuántas motas hay en cada modo de la física.
 * Va a `calidad1/a3-obstaculo/` con la etiqueta (`antes`, `despues`); `lado` arma los lado a lado.
 */
import { existsSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { grabar, mover, topeMas } from '../scripts-escena/banco-escena'
import { FUERA, recorte } from '../scripts-escena/clips6'
import { GESTOS_DEL_OBSTACULO, ZONA_DEL_LOGO } from '../scripts-escena/clips7'
import { abrir, carpeta, ladoALado } from './banco'

const [ETIQUETA, GESTO] = [process.argv[2] ?? 'antes', (process.argv[3] ?? 'fuerte') as keyof typeof GESTOS_DEL_OBSTACULO]

const MUESTREAR = `(() => { window.__sondaDelObstaculo = []; const t0 = performance.now(); const id = setInterval(() => { if (!window.__sondaDelObstaculo) { clearInterval(id); return } const f = window.__fisicaDelBanco; window.__sondaDelObstaculo.push([Math.round(performance.now() - t0), Math.round(scrollY), f.modos()]) }, 100) })()`
const JUNTAR = `(() => { const l = window.__sondaDelObstaculo; window.__sondaDelObstaculo = null; return l })()`

async function grabarElGesto(): Promise<void> {
  const dir = carpeta('a3-obstaculo/clips')
  const b = await abrir('producto')
  try {
    const quienes = await topeMas('quienes-somos', 0.15)(b)
    await mover(b, FUERA[0], FUERA[1])
    await esperar(2500)
    await medir(b.p, MUESTREAR)
    const destino = `${dir}/scroll-${GESTO}-${ETIQUETA}`
    const r = await grabar(b, destino, () => GESTOS_DEL_OBSTACULO[GESTO](b, quienes), 1440)
    const sonda = await medir<[number, number, number[]][]>(b.p, JUNTAR)
    recorte(`${destino}.mp4`, `${destino}-logo-x2.mp4`, ...ZONA_DEL_LOGO)
    // Los modos: aire, cayendo, en el piso, sobre el logo, deslizando, levantada (y antes de A3, pegada).
    const pegadas = sonda.map((m) => m[2][6] ?? 0)
    writeFileSync(`${destino}-sonda.json`, JSON.stringify({ columnas: ['ms', 'scroll', 'modos'], quienes, muestras: sonda }))
    console.log(JSON.stringify({ gesto: GESTO, etiqueta: ETIQUETA, clip: r, modos: sonda[0]?.[2].length, pegadasMax: Math.max(...pegadas), sobreElLogoMax: Math.max(...sonda.map((m) => m[2][3])) }))
  } finally {
    await b.cerrar()
  }
}

/** Los lado a lado de cada gesto que tenga las dos corridas: el clip entero y el recorte del logo al doble. */
function lado(): void {
  const dir = `${carpeta('a3-obstaculo')}`
  for (const g of Object.keys(GESTOS_DEL_OBSTACULO)) {
    for (const cola of ['', '-logo-x2']) {
      const [a, d] = [`${dir}/clips/scroll-${g}-antes${cola}.mp4`, `${dir}/clips/scroll-${g}-despues${cola}.mp4`]
      if (!existsSync(a) || !existsSync(d)) continue
      ladoALado(a, d, `${dir}/scroll-${g}${cola}-antes-y-despues.mp4`, [`scroll ${g}${cola.replace('-', ' ')} - antes (con pegado)`, 'despues (solo el flujo)'], 720)
      console.log(`scroll-${g}${cola}`)
    }
  }
}

if (process.argv[1]?.endsWith('obstaculo.ts')) {
  const correr = ETIQUETA === 'lado' ? async () => lado() : grabarElGesto
  correr().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
}
