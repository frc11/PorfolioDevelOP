/**
 * SPRINT CALIDAD 1 — B6 · el A/B del alfa premultiplicado: b6-ab.ts <ancho> <alto> [scroll] [espera]
 *
 * En la página, el MISMO cuadro (la misma tarea: nada se mueve entre los dos) dibujado dos veces con el polvo y el bokeh
 * sin y con alfa premultiplicado, leído del lienzo y comparado píxel a píxel (en niveles de 8 bits).
 */
import { medir } from '../scripts-b4/navegador'
import { esperar, scrollHasta } from '../scripts-viajes/banco'
import { abrir } from './banco'

const [ANCHO, ALTO, SCROLL, ESPERA] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 0), Number(process.argv[5] ?? 1500)]

const AB = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const materiales = []
  for (const grupo of ['polvo', 'bokeh']) escena.getObjectByName(grupo)?.traverse((o) => { if (o.isPoints) materiales.push(o.material) })
  const ctx = gl.getContext()
  const leer = () => { const a = new Uint8Array(ctx.drawingBufferWidth * ctx.drawingBufferHeight * 4); ctx.readPixels(0, 0, ctx.drawingBufferWidth, ctx.drawingBufferHeight, ctx.RGBA, ctx.UNSIGNED_BYTE, a); return a }
  const dibujar = (pre) => { for (const m of materiales) { m.premultipliedAlpha = pre; m.needsUpdate = true } gl.render(escena, camara); return leer() }
  const a = dibujar(false)
  const b = dibujar(true)
  let [distintos, maxima, suma] = [0, 0, 0]
  for (let i = 0; i < a.length; i += 4) {
    const d = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]))
    if (d > 0) distintos += 1
    maxima = Math.max(maxima, d)
    suma += d
  }
  return { materiales: materiales.length, pixeles: a.length / 4, distintos, maxima, media: +(suma / (a.length / 4)).toFixed(4) }
})()`

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  try {
    if (SCROLL > 0) await scrollHasta(b, SCROLL)
    await esperar(ESPERA)
    console.log(JSON.stringify({ ancho: ANCHO, scroll: SCROLL, ...(await medir<object>(b.p, AB)) }))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('b6-ab.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
