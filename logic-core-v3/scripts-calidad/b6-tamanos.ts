/**
 * SPRINT CALIDAD 1 — B6 · el tamaño de las motas: b6-tamanos.ts <ancho> <alto> [dpr]
 *
 * En los cinco momentos (asentados), la profundidad de cada mota visible del polvo (en la vista), ponderada por cuánto
 * se ve: un histograma de medio en medio (u). Con eso se calcula, fuera de la página, cuánta «tinta» (lado² × cuánto
 * se ve) pone el polvo con cada modelo de tamaño, para elegir uno que no cambie la imagen. Replica la cuenta del
 * shader como `saltos.ts` (el volumen que se repite, la física, el corte del aire mezclado por el peso).
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { NITIDEZ } from '../src/app/v3/_lib/escena/polvo/nitidez'
import { POLVO_PAREJO } from '../src/app/v3/_lib/escena/polvo/volumen'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const K = { L: POLVO_PAREJO.lado, atras: POLVO_PAREJO.atras, fundido: POLVO_PAREJO.fundido, alcance: POLVO_PAREJO.alcance, radio: POLVO_PAREJO.radio, piso: POLVO_PAREJO.piso, cerca: NITIDEZ.cerca }

/** En la página: el histograma de profundidades de las motas visibles del cuadro que se dibuja ahora. */
const HISTOGRAMA = `(async () => {
  const K = ${JSON.stringify(K)}
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const fisica = window.__fisicaDelBanco
  const e = fisica.estado()
  const aire = fisica.aire()
  const d = aire.uDeriva.value
  const lg = aire.uLogo.value.elements
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
  const cm = camara.matrixWorld.elements
  const [cx, cy, cz] = [cm[12], cm[13], cm[14]]
  const [ax, ay, az] = [-cm[8], -cm[9], -cm[10]]
  const vp = camara.projectionMatrix.clone().multiply(camara.matrixWorldInverse).elements
  const bins = new Array(64).fill(0)
  let [visibles, pesos] = [0, 0]
  escena.traverse((o) => {
    if (!o.isPoints || !o.visible || o.geometry.getAttribute('aIndice') === undefined) return
    const m = o.matrixWorld.elements
    const pos = o.geometry.getAttribute('position').array
    const ind = o.geometry.getAttribute('aIndice').array
    const n = Math.min(ind.length, o.geometry.drawRange.count)
    const rt = (x, y, z) => [m[0] * x + m[1] * y + m[2] * z, m[4] * x + m[5] * y + m[6] * z, m[8] * x + m[9] * y + m[10] * z]
    const [kx, ky, kz] = rt(cx - m[12], cy - m[13], cz - m[14])
    const [fx, fy, fz] = rt(ax, ay, az)
    const [dx, dy, dz] = rt(d.x, d.y, d.z)
    const h = K.L / 2
    const c = [kx + fx * (h - K.atras), ky + fy * (h - K.atras), kz + fz * (h - K.atras)]
    for (let j = 0; j < n; j += 1) {
      const i = ind[j]
      const t = [pos[j * 3] + dx, pos[j * 3 + 1] + dy, pos[j * 3 + 2] + dz]
      let borde = 0
      for (let a = 0; a < 3; a += 1) { const u = t[a] - c[a] + h; t[a] = c[a] + (u - K.L * Math.floor(u / K.L)) - h; borde = Math.max(borde, Math.abs(t[a] - c[a]) / h) }
      let wx = m[0] * t[0] + m[4] * t[1] + m[8] * t[2] + m[12]
      let wy = m[1] * t[0] + m[5] * t[1] + m[9] * t[2] + m[13]
      let wz = m[2] * t[0] + m[6] * t[1] + m[10] * t[2] + m[14]
      const [caras, piso] = [1 - ss(1 - K.fundido, 1, borde), ss(K.piso, K.piso + 0.3, wy)]
      const w = e[i * 4 + 3]
      const modo = Math.floor(w + 0.5)
      if (modo === 0) { wx += e[i * 4]; wy += e[i * 4 + 1]; wz += e[i * 4 + 2] }
      else if (modo === 3) { const [px, py, pz] = [e[i * 4], e[i * 4 + 1], e[i * 4 + 2]]; wx = lg[0] * px + lg[4] * py + lg[8] * pz + lg[12]; wy = lg[1] * px + lg[5] * py + lg[9] * pz + lg[13]; wz = lg[2] * px + lg[6] * py + lg[10] * pz + lg[14] }
      else { wx = e[i * 4]; wy = e[i * 4 + 1]; wz = e[i * 4 + 2] }
      const l = Math.hypot(wx - cx, wy - cy, wz - cz)
      const suelta = ss(0.8, K.cerca, l) * (1 - ss(K.alcance - 4, K.alcance, l)) * (1 - ss(K.radio - 1.5, K.radio, Math.hypot(wx, wz)))
      const peso = ss(0, 1, Math.min(1, Math.max(0, (w - modo) / 0.4)))
      const vis = suelta * (caras + (1 - caras) * (modo === 0 ? Math.min(peso, caras) : peso)) * (piso + (1 - piso) * peso)
      if (vis < 0.02) continue
      const cw = vp[3] * wx + vp[7] * wy + vp[11] * wz + vp[15]
      if (cw <= 0) continue
      const nx = (vp[0] * wx + vp[4] * wy + vp[8] * wz + vp[12]) / cw
      const ny = (vp[1] * wx + vp[5] * wy + vp[9] * wz + vp[13]) / cw
      if (Math.abs(nx) > 1 || Math.abs(ny) > 1) continue
      const profundidad = (wx - cx) * ax + (wy - cy) * ay + (wz - cz) * az
      bins[Math.min(63, Math.max(0, Math.floor(profundidad * 2)))] += vis
      visibles += 1
      pesos += vis
    }
  })
  const tam = { y: gl.getContext().drawingBufferHeight }
  return { visibles, pesos: +pesos.toFixed(1), bins: bins.map((v) => +v.toFixed(2)), escalaPx: tam.y / 2, dpr: gl.getPixelRatio() }
})()`

async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  const salida: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const r = await medir<{ visibles: number; pesos: number; escalaPx: number }>(b.p, HISTOGRAMA)
      salida[momento.nombre] = r
      console.log(JSON.stringify({ momento: momento.nombre, visibles: r.visibles, pesos: r.pesos, escalaPx: r.escalaPx }))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('b6-nitidez')}/profundidades-${String(ANCHO)}.json`, JSON.stringify(salida, null, 1))
}

if (process.argv[1]?.endsWith('b6-tamanos.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
