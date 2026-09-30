/**
 * SPRINT CALIDAD 1 — B7 · la costura del medio: b7-costura.ts [ancho alto] [segundo]
 *
 * En el amanecer congelado (o, con `segundo` < 0, en Por qué develOP ya de día), mide el salto de luminancia entre las dos
 * columnas del medio del cuadro contra el de las columnas vecinas, y lo vuelve a medir apagando cada objeto con nombre
 * de a uno: el que al apagarlo se lleva el salto es el que tiene la costura.
 */
import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { abrirMotor } from './motor/abrir'

const [ANCHO, ALTO, SEGUNDO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 4.9)]

const COSTURA = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const px = new Uint8Array(W * H * 4)
  const medio = Math.floor(W / 2)
  // El salto entre dos columnas: la media, en la franja del medio para abajo, de |L(x) − L(x−1)|.
  const salto = (x) => { let s = 0; for (let y = Math.floor(H * 0.05); y < Math.floor(H * 0.75); y += 1) { const i = (y * W + x) * 4, j = (y * W + x - 1) * 4; s += Math.abs((px[i] + px[i + 1] + px[i + 2]) - (px[j] + px[j + 1] + px[j + 2])) / 3 } return s / (H * 0.7) }
  const medir = () => { gl.render(escena, camara); ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px); const vecinos = []; for (let d = 3; d <= 12; d += 1) { vecinos.push(salto(medio - d), salto(medio + d)) } vecinos.sort((a, b) => a - b); const alMedio = Math.max(salto(medio - 1), salto(medio), salto(medio + 1)); return { alMedio: +alMedio.toFixed(2), vecinos: +vecinos[Math.floor(vecinos.length / 2)].toFixed(2) } }
  const salida = { todo: medir() }
  const nombres = new Set()
  escena.traverse((o) => { if (o.name !== '' && o.visible) nombres.add(o.name) })
  for (const n of nombres) {
    const o = escena.getObjectByName(n)
    if (!o) continue
    o.visible = false
    salida[n] = medir()
    o.visible = true
  }
  return salida
})()`

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO)
  try {
    const d = await medir<{ pie: number; vh: number; fin: number; por: number }>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); const p = document.querySelector('[data-panel="por-que-develop"]').getBoundingClientRect(); return { pie: Math.round(r.bottom + scrollY), vh: innerHeight, fin: document.documentElement.scrollHeight - innerHeight, por: Math.round(p.top + scrollY) } })()`)
    const y = SEGUNDO >= 0 ? d.pie - Math.round(0.12 * d.vh) : d.por + Math.round(0.7 * d.vh)
    await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(y)}, 3000)`)
    if (SEGUNDO >= 0) await medir(b.p, `window.__amanecerDelBanco.congelar(${String(SEGUNDO)})`)
    await esperar(2500)
    const r = await medir<Record<string, { alMedio: number; vecinos: number }>>(b.p, COSTURA)
    for (const [k, v] of Object.entries(r)) console.log(`${k.padEnd(36)} al medio ${String(v.alMedio).padStart(6)}   vecinos ${String(v.vecinos)}`)
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b7-costura.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
