/**
 * SPRINT ESCENA 9 — T3 · el antialiasing de las aristas en movimiento: t3-titileo.ts [ancho alto]
 *
 * La medida de B7 (`scripts-calidad/b7-titileo.ts`): en cada momento asentado, con el polvo y el bokeh ocultos y el tiempo
 * QUIETO (todo en una sola tarea), la cámara se corre de costado de a 0,003 u por cuadro durante 40 cuadros y se suma en
 * cada píxel la segunda diferencia de su luminancia en el tiempo |L(t+1) − 2 L(t) + L(t−1)|: un borde bien filtrado que
 * se corre cambia parejo (casi cero), uno que titila salta. Por franjas (la trama arriba, el logo en el medio, el piso
 * abajo), en niveles de 8 bits por cuadro, y un mapa de calor. Tres pasadas en el MISMO cuadro, todas por el posproceso
 * (con la prueba `aa=taa` prendida): 4 muestras (lo de hoy), 8 muestras y 4 muestras con el TAA. Guarda también el
 * último cuadro de cada una (para la nitidez). Va a `escena9/t3-material-y-luz/aa/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const [PASO, CUADROS] = [0.003, 40]
export const PASADAS_DEL_AA = [['msaa4', 4, false], ['msaa8', 8, false], ['taa', 4, true]] as const

const TITILEO = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  const pp = window.__posprocesoDelBanco
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const ocultos = ['polvo', 'bokeh'].map((n) => escena.getObjectByName(n)).filter(Boolean)
  for (const o of ocultos) o.visible = false
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const crudo = new Uint8Array(W * H * 4)
  const luma = () => { ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, crudo); const l = new Float32Array(W * H); for (let i = 0; i < W * H; i += 1) l[i] = 0.2126 * crudo[i * 4] + 0.7152 * crudo[i * 4 + 1] + 0.0722 * crudo[i * 4 + 2]; return l }
  const pose = camara.position.clone()
  const derecha = camara.position.clone().set(camara.matrixWorld.elements[0], camara.matrixWorld.elements[1], camara.matrixWorld.elements[2])
  const aPng = (datos, fn) => { const lienzo = document.createElement('canvas'); lienzo.width = W; lienzo.height = H; const c2 = lienzo.getContext('2d'); const img = c2.createImageData(W, H); fn(img.data); c2.putImageData(img, 0, 0); return lienzo.toDataURL('image/png').split(',')[1] }
  const pasada = (muestras, taa) => {
    pp.muestras(muestras)
    pp.taa = taa
    // Que el TAA arranque con historial: unos cuadros quietos antes de medir.
    for (let k = 0; k < 8; k += 1) pp.dibujar()
    const suma = new Float32Array(W * H)
    let [a, b] = [null, null]
    for (let k = 0; k < ${String(CUADROS)}; k += 1) {
      camara.position.copy(pose).addScaledVector(derecha, k * ${String(PASO)})
      camara.updateMatrixWorld()
      pp.dibujar()
      const c = luma()
      if (a !== null) for (let i = 0; i < W * H; i += 1) suma[i] += Math.abs(c[i] - 2 * b[i] + a[i])
      a = b
      b = c
    }
    camara.position.copy(pose)
    camara.updateMatrixWorld()
    const n = ${String(CUADROS)} - 2
    const franjas = { trama: [0.62, 1.0], medio: [0.38, 0.62], piso: [0.0, 0.38] }
    const salida = {}
    for (const [nombre, [y0, y1]] of Object.entries(franjas)) {
      let [s, cuenta, fuertes] = [0, 0, 0]
      for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y += 1) for (let x = 0; x < W; x += 1) { const v = suma[y * W + x] / n; s += v; cuenta += 1; if (v > 4) fuertes += 1 }
      salida[nombre] = { media: +(s / cuenta).toFixed(3), pixelesQueTitilan: fuertes }
    }
    const mapa = aPng(null, (d) => { for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const v = Math.min(255, (suma[y * W + x] / n) * 32); const o = ((H - 1 - y) * W + x) * 4; d[o] = v; d[o + 1] = v; d[o + 2] = v; d[o + 3] = 255 } })
    const cuadro = aPng(null, (d) => { for (let y = 0; y < H; y += 1) d.set(crudo.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4) })
    return { ...salida, mapa, cuadro }
  }
  const r = {}
  for (const [nombre, muestras, taa] of ${JSON.stringify(PASADAS_DEL_AA)}) r[nombre] = pasada(muestras, taa)
  pp.muestras(4)
  pp.taa = true
  for (const o of ocultos) o.visible = true
  return r
})()`

type Pasada = { mapa: string; cuadro: string } & Record<string, unknown>

async function medirMomento(b: Awaited<ReturnType<typeof abrir>>, nombre: string, dir: string, tabla: Record<string, unknown>): Promise<void> {
  const r = await medir<Record<string, Pasada>>(b.p, TITILEO)
  const fila: Record<string, unknown> = {}
  for (const [rotulo] of PASADAS_DEL_AA) {
    const x = r[rotulo]
    writeFileSync(`${dir}/${nombre}-${String(ANCHO)}-${rotulo}-titileo.png`, Buffer.from(x.mapa, 'base64'))
    writeFileSync(`${dir}/${nombre}-${String(ANCHO)}-${rotulo}.png`, Buffer.from(x.cuadro, 'base64'))
    const sin: Record<string, unknown> = { ...x }
    delete sin.mapa
    delete sin.cuadro
    fila[rotulo] = sin
  }
  tabla[nombre] = fila
  console.log(JSON.stringify({ momento: nombre, ...fila }))
}

async function principal(): Promise<void> {
  const dir = carpeta('t3-material-y-luz/aa/cuadros')
  const b = await abrir('producto,aa=taa', ANCHO, ALTO)
  const tabla: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      await medirMomento(b, momento.nombre, dir, tabla)
    }
    const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
    await scrollHasta(b, pie)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    await esperar(2500)
    await medirMomento(b, 'amanecer', dir, tabla)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('t3-material-y-luz/aa')}/titileo-${String(ANCHO)}.json`, JSON.stringify(tabla, null, 1))
}

if (process.argv[1]?.endsWith('t3-titileo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
