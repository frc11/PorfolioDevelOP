/**
 * SPRINT ESCENA 9 — T3 · el tono: t3-tono.ts <agx|aces> [ancho alto]
 *
 * Con la prueba prendida (`tono=<t>`: el tono propio instalado), en cada momento asentado y en una sola tarea, con el
 * polvo oculto (los colores «en reposo», como B9): el MISMO cuadro con Neutral (hoy), con el tono crudo (exposición 1),
 * con el crudo y la exposición compensada (la de B9: iguala la luminancia mediana del piso) y con el compensado de este
 * sprint (el color del tono con el brillo de Neutral, `tono.ts`). Mide el ΔE (CIEDE2000) de la mediana de las regiones
 * canónicas contra hoy (el cielo, el papel y el piso: las de B9) y cuánto del cuadro cambia más de 5 niveles. Guarda los
 * cuadros para las hojas. Va a `escena9/t3-material-y-luz/tono/`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { MOMENTOS, capturarMomento, selloDeCarga } from '../scripts-escena/banco-escena'
import { grilla, type Celda } from '../scripts-escena/hojas6'
import { deltaE2000 } from '../scripts-calidad/b9-tono'
import { abrir, carpeta } from './banco'

const TONO = process.argv[2] === 'aces' ? 'aces' : 'agx'
const [ANCHO, ALTO] = [Number(process.argv[3] ?? 1440), Number(process.argv[4] ?? 900)]
/** Los números de three: ACESFilmic = 4, Custom = 5, AgX = 6, Neutral = 7. */
const CRUDO = TONO === 'agx' ? 6 : 4

const MEDIR = `(async () => {
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
  const REGIONES = { cielo: [0.05, 0.25], papel: [0.38, 0.5], piso: [0.8, 0.95] }
  const mediana = (px, y0, y1) => {
    const rs = [], gs = [], bs = []
    for (let y = Math.floor(y0 * H); y < Math.floor(y1 * H); y += 2) for (let x = Math.floor(W * 0.08); x < Math.floor(W * 0.92); x += 2) {
      const i = ((H - 1 - y) * W + x) * 4
      rs.push(px[i]); gs.push(px[i + 1]); bs.push(px[i + 2])
    }
    const m = (a) => { a.sort((p, q) => p - q); return a[a.length >> 1] }
    return [m(rs), m(gs), m(bs)]
  }
  const materiales = new Set()
  escena.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; for (const m of ms) materiales.add(m) })
  const lienzo = document.createElement('canvas')
  lienzo.width = W
  lienzo.height = H
  const c2 = lienzo.getContext('2d')
  const png = (a) => { const img = c2.createImageData(W, H); for (let y = 0; y < H; y += 1) img.data.set(a.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4); c2.putImageData(img, 0, 0); return lienzo.toDataURL('image/png').split(',')[1] }
  const leer = (tono, exposicion) => {
    if (gl.toneMapping !== tono) { gl.toneMapping = tono; for (const m of materiales) m.needsUpdate = true }
    gl.toneMappingExposure = exposicion
    gl.render(escena, camara)
    const px = new Uint8Array(W * H * 4)
    ctx.readPixels(0, 0, W, H, ctx.RGBA, ctx.UNSIGNED_BYTE, px)
    const r = { px }
    for (const [n, [a, b]] of Object.entries(REGIONES)) r[n] = mediana(px, a, b)
    return r
  }
  const antes = { tono: gl.toneMapping, exposicion: gl.toneMappingExposure }
  const luma = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  const hoy = leer(7, 1)
  const crudo = leer(${String(CRUDO)}, 1)
  let [lo, hi] = [0.25, 4]
  for (let k = 0; k < 18; k += 1) { const e = Math.sqrt(lo * hi); if (luma(leer(${String(CRUDO)}, e).piso) < luma(hoy.piso)) lo = e; else hi = e }
  const exposicion = Math.sqrt(lo * hi)
  const conExposicion = leer(${String(CRUDO)}, exposicion)
  const compensado = leer(5, 1)
  gl.toneMapping = antes.tono
  for (const m of materiales) m.needsUpdate = true
  gl.toneMappingExposure = antes.exposicion
  for (const o of ocultos) o.visible = true
  const cambia = (a) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.max(Math.abs(a[i] - hoy.px[i]), Math.abs(a[i + 1] - hoy.px[i + 1]), Math.abs(a[i + 2] - hoy.px[i + 2])) > 5) n += 1; return +(n / (W * H)).toFixed(4) }
  const sinPx = (r) => ({ cielo: r.cielo, papel: r.papel, piso: r.piso })
  return {
    exposicion: +exposicion.toFixed(3),
    hoy: sinPx(hoy), crudo: sinPx(crudo), conExposicion: sinPx(conExposicion), compensado: sinPx(compensado),
    cambia: { crudo: cambia(crudo.px), conExposicion: cambia(conExposicion.px), compensado: cambia(compensado.px) },
    pngs: [png(hoy.px), png(crudo.px), png(conExposicion.px), png(compensado.px)],
  }
})()`

type Rgb = readonly [number, number, number]
interface Lectura { readonly cielo: Rgb; readonly papel: Rgb; readonly piso: Rgb }
interface Medida { readonly exposicion: number; readonly hoy: Lectura; readonly crudo: Lectura; readonly conExposicion: Lectura; readonly compensado: Lectura; readonly cambia: Record<string, number>; readonly pngs: readonly string[] }

const COLUMNAS = ['neutral', 'crudo', 'con-exposicion', 'compensado'] as const
const ROTULOS: Readonly<Record<(typeof COLUMNAS)[number], string>> = { neutral: 'Neutral (hoy)', crudo: `${TONO} crudo`, 'con-exposicion': `${TONO} con exposicion (B9)`, compensado: `${TONO} compensado` }

async function principal(): Promise<void> {
  const dir = carpeta('t3-material-y-luz/tono')
  const b = await abrir(`producto,tono=${TONO}`, ANCHO, ALTO)
  const tabla: Record<string, unknown> = {}
  const momentos = [...MOMENTOS, { nombre: 'amanecer-4_9', panel: 'tu-panel', y: MOMENTOS[3].y }]
  try {
    const sello = await selloDeCarga(b)
    for (const momento of momentos) {
      if (momento.nombre === 'amanecer-4_9') {
        // El pico de los rayos: el borde de Tu panel arriba del cuadro y el amanecer congelado en 4,9 s.
        const y = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - innerHeight * 0.12) })()`)
        await medir(b.p, `window.scrollTo(0, ${String(y)})`)
        await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
        await new Promise((r) => setTimeout(r, 2500))
      } else await capturarMomento(b, momento, sello)
      const r = await medir<Medida>(b.p, MEDIR)
      if (momento.nombre === 'amanecer-4_9') await medir(b.p, 'window.__amanecerDelBanco.congelar(null)')
      r.pngs.forEach((png, k) => writeFileSync(`${dir}/${momento.nombre}-${String(ANCHO)}-${TONO}-${COLUMNAS[k]}.png`, Buffer.from(png, 'base64')))
      const de = (x: Lectura): Record<string, number> => Object.fromEntries((['cielo', 'papel', 'piso'] as const).map((k) => [k, Math.round(deltaE2000(r.hoy[k], x[k]) * 100) / 100]))
      const fila = { hoy: r.hoy, exposicionB9: r.exposicion, crudo: de(r.crudo), conExposicion: de(r.conExposicion), compensado: de(r.compensado), fraccionQueCambiaMasDe5: r.cambia }
      tabla[momento.nombre] = fila
      console.log(JSON.stringify({ momento: momento.nombre, ...fila }))
    }
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${dir}/delta-e-${TONO}-${String(ANCHO)}.json`, JSON.stringify(tabla, null, 1))
  // La hoja: una fila por momento, una columna por variante.
  const filas: Celda[][] = momentos.map((m) => COLUMNAS.map((c) => ({ archivo: `${dir}/${m.nombre}-${String(ANCHO)}-${TONO}-${c}.png`, texto: `${m.nombre} - ${ROTULOS[c]}` })))
  grilla(filas, ANCHO < 1024 ? 300 : 480, `${carpeta('t3-material-y-luz')}/hoja-tono-${TONO}-${String(ANCHO)}.png`)
}

if (process.argv[1]?.endsWith('t3-tono.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
