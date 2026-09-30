/**
 * SPRINT CALIDAD 1 — B7 · el titileo: b7-titileo.ts <etiqueta> [ancho alto] [todo|sol|logo]
 *
 * En cada uno de los cinco momentos (asentado), con el polvo y el bokeh ocultos y el tiempo QUIETO (todo pasa en una
 * sola tarea: la escena no corre entre cuadro y cuadro), corre la cámara de costado de a `PASO` por cuadro durante
 * `CUADROS` cuadros, dibuja y lee el lienzo, y suma en cada píxel la segunda diferencia de su luminancia en el tiempo
 * |L(t+1) − 2 L(t) + L(t−1)|: un borde bien filtrado que se corre de a un cuarto de píxel cambia parejo (casi cero),
 * uno que titila salta. Da la media por franja del cuadro (arriba: la trama; medio: el logo; abajo: el piso), en
 * niveles de 8 bits por cuadro, y un mapa de calor (PNG) de qué titila.
 *
 * Es un A/B en el MISMO cuadro: primero con lo de antes de B7 (el logo con las normales por cara que deja
 * `ExtrudeGeometry`, y la sombra de la trama en el piso sin prefiltro), después con B7. Así el mar del piso vivo, que se
 * mueve con el reloj, es el mismo en las dos mediciones.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const ETIQUETA = process.argv[2] ?? 'antes'
/** Qué se alterna en el A/B: todo B7, sólo el sol en el piso, o sólo las normales del logo. */
const QUE = (process.argv[5] ?? 'todo') as 'todo' | 'sol' | 'logo'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]
const [PASO, CUADROS] = [0.003, 40]

const TITILEO = `(async (que) => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const ocultos = ['polvo', 'bokeh'].map((n) => escena.getObjectByName(n)).filter(Boolean)
  for (const o of ocultos) o.visible = false
  const pasada = (conCambio) => {
  // Lo de antes de B7: el logo con las normales por cara (las de ExtrudeGeometry) y el piso sin prefiltro.
  const cambiados = []
  if (!conCambio) {
    if (que !== 'sol') escena.getObjectByName('logo')?.traverse((o) => { if (o.isMesh) { const plana = o.geometry.clone(); plana.computeVertexNormals(); cambiados.push([o, o.geometry]); o.geometry = plana } })
    if (que !== 'logo') window.__amanecerDelBanco?.tramaFiltrada(0)
  }
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const crudo = new Uint8Array(W * H * 4)
  const luma = () => { ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, crudo); const l = new Float32Array(W * H); for (let i = 0; i < W * H; i += 1) l[i] = 0.2126 * crudo[i * 4] + 0.7152 * crudo[i * 4 + 1] + 0.0722 * crudo[i * 4 + 2]; return l }
  const pose = camara.position.clone()
  const derecha = camara.position.clone().set(camara.matrixWorld.elements[0], camara.matrixWorld.elements[1], camara.matrixWorld.elements[2])
  const suma = new Float32Array(W * H)
  let [a, b] = [null, null]
  for (let k = 0; k < ${String(CUADROS)}; k += 1) {
    camara.position.copy(pose).addScaledVector(derecha, k * ${String(PASO)})
    camara.updateMatrixWorld()
    gl.render(escena, camara)
    const c = luma()
    if (a !== null) for (let i = 0; i < W * H; i += 1) suma[i] += Math.abs(c[i] - 2 * b[i] + a[i])
    a = b; b = c
  }
  camara.position.copy(pose)
  camara.updateMatrixWorld()
  for (const [o, g] of cambiados) { o.geometry.dispose(); o.geometry = g }
  window.__amanecerDelBanco?.tramaFiltrada(1)
  const n = ${String(CUADROS)} - 2
  // Las franjas (de arriba hacia abajo; readPixels da la fila 0 abajo).
  const franjas = { trama: [0.62, 1.0], medio: [0.38, 0.62], piso: [0.0, 0.38] }
  const salida = {}
  for (const [nombre, [y0, y1]] of Object.entries(franjas)) {
    let [s, cuenta, fuertes] = [0, 0, 0]
    for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y += 1) for (let x = 0; x < W; x += 1) { const v = suma[y * W + x] / n; s += v; cuenta += 1; if (v > 4) fuertes += 1 }
    salida[nombre] = { media: +(s / cuenta).toFixed(3), pixelesQueTitilan: fuertes }
  }
  // El mapa de calor: 0 negro, 8 niveles por cuadro o más, blanco.
  const lienzo = document.createElement('canvas')
  lienzo.width = W; lienzo.height = H
  const c2 = lienzo.getContext('2d')
  const img = c2.createImageData(W, H)
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) { const v = Math.min(255, (suma[y * W + x] / n) * 32); const o = ((H - 1 - y) * W + x) * 4; img.data[o] = v; img.data[o + 1] = v; img.data[o + 2] = v; img.data[o + 3] = 255 }
  c2.putImageData(img, 0, 0)
  return { ...salida, mapa: lienzo.toDataURL('image/png').split(',')[1] }
  }
  // Las dos en la misma tarea: entre una y otra la escena no corre (el mar, la vira, el reloj quedan iguales).
  const r = { antes: pasada(false), despues: pasada(true) }
  for (const o of ocultos) o.visible = true
  return r
})`

async function principal(): Promise<void> {
  const dir = carpeta('b7-antialias/titileo')
  const b = await abrir('producto', ANCHO, ALTO)
  const tabla: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const fila: Record<string, unknown> = {}
      // El mismo cuadro, quieto: primero como era antes de B7, después con B7 (las dos en una sola tarea).
      const dos = await medir<Record<'antes' | 'despues', { mapa: string } & Record<string, unknown>>>(b.p, `${TITILEO}('${QUE}')`)
      for (const rotulo of ['antes', 'despues'] as const) {
        const r = dos[rotulo]
        writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${rotulo}.png`, Buffer.from(r.mapa, 'base64'))
        const sinMapa: Record<string, unknown> = { ...r }
        delete sinMapa.mapa
        fila[rotulo] = sinMapa
      }
      tabla[momento.nombre] = fila
      console.log(JSON.stringify({ momento: momento.nombre, ...fila }))
    }
    // El amanecer en el pico de los rayos (4,9 s), con el borde de Tu panel arriba del cuadro: la sombra de la trama en el piso.
    const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
    await scrollHasta(b, pie)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    await esperar(2500)
    const dos = await medir<Record<'antes' | 'despues', { mapa: string } & Record<string, unknown>>>(b.p, `${TITILEO}('${QUE}')`)
    const fila: Record<string, unknown> = {}
    for (const rotulo of ['antes', 'despues'] as const) {
      const r = dos[rotulo]
      writeFileSync(`${dir}/amanecer-${String(ANCHO)}-${rotulo}.png`, Buffer.from(r.mapa, 'base64'))
      const sinMapa: Record<string, unknown> = { ...r }
      delete sinMapa.mapa
      fila[rotulo] = sinMapa
    }
    tabla.amanecer = fila
    console.log(JSON.stringify({ momento: 'amanecer', ...fila }))
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/titileo-${String(ANCHO)}-${ETIQUETA}-${QUE}.json`, JSON.stringify(tabla, null, 1))
}

if (process.argv[1]?.endsWith('b7-titileo.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
