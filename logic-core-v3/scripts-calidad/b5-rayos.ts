/**
 * SPRINT CALIDAD 1 — B5 · los rayos del amanecer: b5-rayos.ts <etiqueta> [ancho alto] [dpr]
 *
 * Llega recorriendo al amanecer (el borde de Tu panel arriba del cuadro: la sala entera), congela el guion en dos
 * segundos de los rayos (4,9, su pico, y 5,8) y en cada uno captura el cuadro y mide el tiempo de GPU por pasada (sin
 * vsync). Va a `calidad1/b5-rayos/cuadros/rayos-<s>-<ancho>-<etiqueta>.png` y a `rayos-<ancho>-<etiqueta>.json`.
 *
 * Con la etiqueta `comparar`, en cada segundo dibuja la escena de los haces (el mismo cuadro, los mismos uniforms) a
 * resolución completa y a la del producto, agranda la segunda como la agranda el cuadrado (bilineal) y mide la
 * diferencia en niveles de 8 bits: lo único que cambió en B5.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'

const ETIQUETA = process.argv[2] ?? 'antes'
const [ANCHO, ALTO, DPR] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900), Number(process.argv[5] ?? 1)]
const SEGUNDOS = [4.9, 5.8]

/** En la página: los haces a resolución completa contra los del búfer agrandados, en niveles de 8 bits. */
const COMPARAR = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const h = window.__amanecerDelBanco.haces()
  const medio = (u) => { const e = (u >> 10) & 31, m = u & 1023, s = u >> 15 ? -1 : 1; return e === 0 ? s * m * 5.960464477539063e-8 : e === 31 ? 0 : s * (1 + m / 1024) * Math.pow(2, e - 15) }
  const leer = (rt) => { const a = new Uint16Array(rt.width * rt.height * 4); gl.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, a); return a }
  gl.getDrawingBufferSize(h.lienzo)
  const [W, H] = [h.lienzo.x, h.lienzo.y]
  const lleno = new h.bufer.constructor(W, H, { type: h.bufer.texture.type, depthBuffer: false, stencilBuffer: false })
  const previo = gl.getRenderTarget()
  gl.setRenderTarget(lleno); gl.render(h.escena, camara)
  gl.setRenderTarget(h.bufer); gl.render(h.escena, camara)
  gl.setRenderTarget(previo)
  const [a, b] = [leer(lleno), leer(h.bufer)]
  const [w, hh] = [h.bufer.width, h.bufer.height]
  const en = (x, y, c) => medio(b[(Math.min(hh - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4 + c])
  const difs = []
  // Lo estructural: las dos imágenes promediadas en bloques de 4×4 (el grano del tramado se va) y comparadas.
  const B = 4
  const [bw, bh] = [Math.ceil(W / B), Math.ceil(H / B)]
  const bloqueLleno = new Float64Array(bw * bh)
  const bloqueAgrandado = new Float64Array(bw * bh)
  let [suma, sumaDif, maxima, pico, fuertes, enElCentro] = [0, 0, 0, 0, 0, 0]
  for (let y = 0; y < H; y += 1) for (let x = 0; x < W; x += 1) {
    const [u, v] = [((x + 0.5) / W) * w - 0.5, ((y + 0.5) / H) * hh - 0.5]
    const [x0, y0] = [Math.floor(u), Math.floor(v)]
    const [fu, fv] = [u - x0, v - y0]
    let d = 0, l3 = 0, a3 = 0
    for (let c = 0; c < 3; c += 1) {
      const agrandado = (en(x0, y0, c) * (1 - fu) + en(x0 + 1, y0, c) * fu) * (1 - fv) + (en(x0, y0 + 1, c) * (1 - fu) + en(x0 + 1, y0 + 1, c) * fu) * fv
      const l = medio(a[(y * W + x) * 4 + c])
      l3 += l / 3
      a3 += agrandado / 3
      d += Math.abs(agrandado - l) / 3
    }
    suma += l3; sumaDif += d; maxima = Math.max(maxima, d); pico = Math.max(pico, l3)
    const kb = Math.floor(y / B) * bw + Math.floor(x / B)
    bloqueLleno[kb] += l3 / (B * B)
    bloqueAgrandado[kb] += a3 / (B * B)
    if (d * 255 > 4) { fuertes += 1; if (Math.abs(x - W / 2) <= 3) enElCentro += 1 }
    if ((x + y * 7) % 13 === 0) difs.push(d)
  }
  const estructura = []
  for (let k = 0; k < bw * bh; k += 1) estructura.push(Math.abs(bloqueLleno[k] - bloqueAgrandado[k]))
  estructura.sort((p, q) => p - q)
  difs.sort((p, q) => p - q)
  lleno.dispose()
  const n = W * H
  return { ancho: W, alto: H, bufer: [w, hh], rayosMedia8: +(suma / n * 255).toFixed(2), rayosPico8: +(pico * 255).toFixed(1), difMedia8: +(sumaDif / n * 255).toFixed(3), dif99_8: +(difs[Math.floor(difs.length * 0.99)] * 255).toFixed(2), difMax8: +(maxima * 255).toFixed(2), estructuraMedia8: +(estructura.reduce((p, q) => p + q, 0) / estructura.length * 255).toFixed(3), estructura99_8: +(estructura[Math.floor(estructura.length * 0.99)] * 255).toFixed(2), estructuraMax8: +(estructura[estructura.length - 1] * 255).toFixed(2), pixelesDeMasDe4: fuertes, deEllosEnElCentro: enElCentro }
})()`

async function principal(): Promise<void> {
  const dir = carpeta('b5-rayos/cuadros')
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR })
  const salida: Record<string, unknown> = {}
  try {
    const d = await medir<{ pie: number; vh: number }>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return { pie: Math.round(r.bottom + scrollY), vh: innerHeight } })()`)
    const y = d.pie - Math.round(0.12 * d.vh)
    await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(y)}, 3000)`)
    for (const s of SEGUNDOS) {
      await medir(b.p, `window.__amanecerDelBanco.congelar(${String(s)})`)
      await esperar(2500)
      if (ETIQUETA === 'comparar') {
        const r = await medir<unknown>(b.p, COMPARAR)
        salida[String(s)] = r
        console.log(JSON.stringify({ s, ...(r as object) }))
        continue
      }
      const perfil = await medir<{ totalMs: number; pasadas: Record<string, { ms: number; veces: number }> }>(b.p, 'window.__gpuDelBanco.medir(150)')
      const rayos = Object.entries(perfil.pasadas).filter(([k]) => k.startsWith('rayos')).map(([k, v]) => [k, Math.round(v.ms * 1000) / 1000] as const)
      const png = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
      writeFileSync(`${dir}/rayos-${String(s)}-${String(ANCHO)}${DPR === 1 ? '' : `@${String(DPR)}x`}-${ETIQUETA}.png`, Buffer.from(png.data, 'base64'))
      await b.emular()
      salida[String(s)] = { totalObjetosMs: Math.round(perfil.totalMs * 100) / 100, rayos }
      console.log(JSON.stringify({ s, totalObjetosMs: Math.round(perfil.totalMs * 100) / 100, rayos }))
    }
    await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('b5-rayos')}/rayos-${String(ANCHO)}${DPR === 1 ? '' : `@${String(DPR)}x`}-${ETIQUETA}.json`, JSON.stringify({ ancho: ANCHO, dpr: DPR, momentos: salida }, null, 1))
}

if (process.argv[1]?.endsWith('b5-rayos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
