/**
 * SPRINT CALIDAD 1 — B11 · de dónde sale el tirón del cambio de dpr: b11-redimensionar.ts [ancho alto dpr]
 *
 * Con vsync, el amanecer congelado y la adaptativa apagada: los intervalos de los cuadros que siguen a un cambio de dpr
 * hecho DIRECTO en el renderer (`gl.setPixelRatio`, sin pasar por React ni por r3f), bajando y subiendo, y cuánto tarda
 * la llamada misma. Si el tirón está ahí, es el lienzo que se redimensiona (sus búferes); si no, es lo que r3f dispara.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { esperar } from '../scripts-viajes/banco'
import { carpeta } from './banco'
import { abrirMotor } from './motor/abrir'

const [ANCHO, ALTO, DPR] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900), Number(process.argv[4] ?? 1.5)]

const PRUEBA = `(async () => {
  const { gl } = window.__gpuDelBanco.tres()
  const cuadros = async (n) => { const d = []; let a = performance.now(); for (let i = 0; i < n; i += 1) { const t = await new Promise((r) => requestAnimationFrame(r)); d.push(+(t - a).toFixed(1)); a = t } return d }
  await cuadros(90)
  const salida = { antes: await cuadros(30), cambios: [] }
  for (const dpr of [1.35, 1.2, 1.05, 1.2, 1.35, 1.5, 1.35, 1.5]) {
    await cuadros(45)
    const t0 = performance.now()
    gl.setPixelRatio(dpr)
    const llamada = +(performance.now() - t0).toFixed(1)
    const despues = await cuadros(12)
    salida.cambios.push({ dpr, llamadaMs: llamada, peorMs: Math.max(...despues), despues })
  }
  return salida
})()`

async function principal(): Promise<void> {
  const b = await abrirMotor(ANCHO, ALTO, { dpr: DPR, conVsync: true })
  let r: unknown = null
  try {
    const pie = await medir<number>(b.p, `(() => { const r = document.querySelector('[data-panel="tu-panel"]').getBoundingClientRect(); return Math.round(r.bottom + scrollY - 0.12 * innerHeight) })()`)
    await medir(b.p, `window.__cuadrosDelBanco.recorrer(0, ${String(pie)}, 3000)`)
    await medir(b.p, 'window.__amanecerDelBanco.congelar(4.9)')
    await esperar(3000)
    r = await medir<unknown>(b.p, PRUEBA)
  } finally {
    await b.cerrar()
  }
  writeFileSync(`${carpeta('b11-adaptativa')}/redimensionar-${String(ANCHO)}@${String(DPR)}x.json`, JSON.stringify(r, null, 1))
  console.log(JSON.stringify(r))
}

if (process.argv[1]?.endsWith('b11-redimensionar.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
