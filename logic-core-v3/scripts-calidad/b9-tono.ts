/**
 * SPRINT CALIDAD 1 — B9 · el tone mapping: b9-tono.ts [ancho alto]
 *
 * En cada momento (asentado), en una sola tarea y con el polvo oculto (los colores «en reposo»): dibuja el cuadro con el
 * tone mapping de hoy (Neutral, Khronos PBR) y con ACES y AgX, cada uno también con la exposición COMPENSADA (la que
 * iguala la luminancia mediana del piso a la de hoy, buscada por bisección: la exposición es un uniform, no recompila).
 * Mide el ΔE (CIEDE2000) de la mediana de cada región canónica contra hoy: el cielo (la franja de arriba, a través de
 * la trama), el papel (la franja del horizonte) y el piso (la franja de abajo). La condición del sprint: ΔE < 2.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { abrir, carpeta } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

const TONO = `(async () => {
  const { gl, escena } = window.__gpuDelBanco.tres()
  let camara = null
  const render = gl.render
  gl.render = function (s, c) { if (s === escena) camara = c; return render.apply(this, arguments) }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  gl.render = render
  const ocultos = ['polvo', 'bokeh'].map((n) => escena.getObjectByName(n)).filter(Boolean)
  for (const o of ocultos) o.visible = false
  const ctx = gl.getContext()
  const [W, H] = [ctx.drawingBufferWidth, ctx.drawingBufferHeight]
  const px = new Uint8Array(W * H * 4)
  // Las regiones canónicas, en fracción del cuadro desde ARRIBA: [y0, y1] con todo el ancho del medio (sin los bordes).
  const REGIONES = { cielo: [0.05, 0.25], papel: [0.38, 0.5], piso: [0.8, 0.95] }
  const mediana = (y0, y1) => {
    const rs = [], gs = [], bs = []
    for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y += 2) for (let x = Math.floor(W * 0.08); x < Math.floor(W * 0.92); x += 2) {
      const i = ((H - 1 - y) * W + x) * 4
      rs.push(px[i]); gs.push(px[i + 1]); bs.push(px[i + 2])
    }
    const m = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1] }
    return [m(rs), m(gs), m(bs)]
  }
  const leer = () => { gl.render(escena, camara); ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px); const r = {}; for (const [n, [a, b]] of Object.entries(REGIONES)) r[n] = mediana(a, b); return r }
  const materiales = new Set()
  escena.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) materiales.add(m) })
  const conTono = (tono, exposicion) => { if (gl.toneMapping !== tono) { gl.toneMapping = tono; for (const m of materiales) m.needsUpdate = true } gl.toneMappingExposure = exposicion; return leer() }
  const antes = { tono: gl.toneMapping, exposicion: gl.toneMappingExposure }
  const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  const hoy = conTono(antes.tono, antes.exposicion)
  const salida = { hoy }
  // Los números de three: ACESFilmic = 4, AgX = 6, Neutral = 7.
  for (const [nombre, tono] of [['aces', 4], ['agx', 6]]) {
    const crudo = conTono(tono, 1)
    let [lo, hi] = [0.25, 4]
    for (let k = 0; k < 18; k += 1) { const e = Math.sqrt(lo * hi); if (luma(conTono(tono, e).piso) < luma(hoy.piso)) lo = e; else hi = e }
    const e = Math.sqrt(lo * hi)
    salida[nombre] = { crudo, compensado: conTono(tono, e), exposicion: +e.toFixed(3) }
  }
  conTono(antes.tono, antes.exposicion)
  for (const o of ocultos) o.visible = true
  return salida
})()`

type Rgb = readonly [number, number, number]
/** sRGB (0–255) a Lab (D65). */
function lab([r8, g8, b8]: Rgb): [number, number, number] {
  const lin = (v: number): number => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  const [r, g, b] = [lin(r8), lin(g8), lin(b8)]
  const [x, y, z] = [(0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, 0.2126 * r + 0.7152 * g + 0.0722 * b, (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883]
  const f = (t: number): number => (t > 216 / 24389 ? Math.cbrt(t) : (24389 / 27 * t + 16) / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}
/** CIEDE2000. */
function deltaE2000(c1: Rgb, c2: Rgb): number {
  const [L1, a1, b1] = lab(c1)
  const [L2, a2, b2] = lab(c2)
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2
  const G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)))
  const a1p = (1 + G) * a1, a2p = (1 + G) * a2
  const C1p = Math.hypot(a1p, b1), C2p = Math.hypot(a2p, b2)
  const h = (b: number, a: number): number => { const v = (Math.atan2(b, a) * 180) / Math.PI; return v < 0 ? v + 360 : v }
  const h1p = h(b1, a1p), h2p = h(b2, a2p)
  const dLp = L2 - L1, dCp = C2p - C1p
  let dhp = h2p - h1p
  if (C1p * C2p === 0) dhp = 0
  else if (dhp > 180) dhp -= 360
  else if (dhp < -180) dhp += 360
  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp * Math.PI) / 360)
  const Lmp = (L1 + L2) / 2, Cmp = (C1p + C2p) / 2
  let hmp = h1p + h2p
  if (C1p * C2p !== 0) hmp = Math.abs(h1p - h2p) > 180 ? (h1p + h2p + (h1p + h2p < 360 ? 360 : -360)) / 2 : (h1p + h2p) / 2
  const T = 1 - 0.17 * Math.cos(((hmp - 30) * Math.PI) / 180) + 0.24 * Math.cos((2 * hmp * Math.PI) / 180) + 0.32 * Math.cos(((3 * hmp + 6) * Math.PI) / 180) - 0.2 * Math.cos(((4 * hmp - 63) * Math.PI) / 180)
  const dTheta = 30 * Math.exp(-(((hmp - 275) / 25) ** 2))
  const Rc = 2 * Math.sqrt(Cmp ** 7 / (Cmp ** 7 + 25 ** 7))
  const Sl = 1 + (0.015 * (Lmp - 50) ** 2) / Math.sqrt(20 + (Lmp - 50) ** 2), Sc = 1 + 0.045 * Cmp, Sh = 1 + 0.015 * Cmp * T
  const Rt = -Math.sin((2 * dTheta * Math.PI) / 180) * Rc
  return Math.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh))
}

interface Lectura { readonly cielo: Rgb; readonly papel: Rgb; readonly piso: Rgb }
async function principal(): Promise<void> {
  const b = await abrir('producto', ANCHO, ALTO)
  const tabla: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      const r = await medir<{ hoy: Lectura; aces: { crudo: Lectura; compensado: Lectura; exposicion: number }; agx: { crudo: Lectura; compensado: Lectura; exposicion: number } }>(b.p, TONO)
      const de = (x: Lectura): Record<string, number> => Object.fromEntries((['cielo', 'papel', 'piso'] as const).map((k) => [k, Math.round(deltaE2000(r.hoy[k], x[k]) * 100) / 100]))
      const fila = { hoy: r.hoy, aces: { exposicion: r.aces.exposicion, crudo: de(r.aces.crudo), compensado: de(r.aces.compensado) }, agx: { exposicion: r.agx.exposicion, crudo: de(r.agx.crudo), compensado: de(r.agx.compensado) } }
      tabla[momento.nombre] = fila
      console.log(JSON.stringify({ momento: momento.nombre, ...fila }))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('b9-tono')}/delta-e-${String(ANCHO)}.json`, JSON.stringify(tabla, null, 1))
}

if (process.argv[1]?.endsWith('b9-tono.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
