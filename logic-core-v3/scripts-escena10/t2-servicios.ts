/**
 * SPRINT ESCENA 10 — T2 · el video de Servicios, cuadros perdidos por pasada: t2-servicios.ts <rótulo> [dpr] [pasadas]
 *
 * Con vsync y la NVIDIA (`BANCO_GPU=alta`), a 1440: se recorre Servicios entero a la velocidad del banco del motor
 * (900 px/s, `__cuadrosDelBanco.recorrer`) varias veces, cada una después de 2,5 s quieto (el video andando), y se
 * cuentan los cuadros perdidos (los que tardan más de 1,5 refrescos). En cada cuadro se anota si el video está en pausa
 * (de los cuadros con el video en pantalla). Al final, la frenada: con un video entero en pantalla, andando, un scroll
 * corto (120 px) y cuánto tarda en volver a andar desde que el scroll frena. Va a
 * `escena10/t2-video/servicios-<rótulo>-<placa>-dpr<dpr>.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirMotor } from '../scripts-calidad/motor/abrir'
import { esperar } from '../scripts-viajes/banco'
import { PLACA, carpeta } from './banco'

const ROTULO = process.argv[2] ?? 'despues'
const DPR = Number(process.argv[3] ?? 1)
const PASADAS = Number(process.argv[4] ?? 3)
const [ANCHO, ALTO] = [1440, 900]
const VELOCIDAD = 900

/** En cada cuadro de la pasada, de los videos en pantalla: cuántos en pausa (lo lee un rAF propio, sin tocar el sitio). */
const ESPIA = `(() => { const vs = [...document.querySelectorAll('video[data-pieza="video-de-servicio"]')]; window.__videoEnLaPasada = []; const paso = () => { if (!window.__videoEnLaPasada) return; for (const v of vs) { const r = v.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) window.__videoEnLaPasada.push(v.paused ? 1 : 0) } requestAnimationFrame(paso) }; requestAnimationFrame(paso); return vs.length > 0 })()`
const JUNTAR = `(() => { const l = window.__videoEnLaPasada; window.__videoEnLaPasada = null; return l })()`
/** Cuánto tarda el video en volver a andar desde que el scroll frena (ms; -1 si no vuelve en 3 s). */
const VUELVE = `new Promise((listo) => { const v = window.__videoDeLaFrenada; const t0 = performance.now(); const mirar = () => { if (v === null) return listo(-1); if (!v.paused && v.currentTime > 0) return listo(Math.round(performance.now() - t0)); if (performance.now() - t0 > 3000) return listo(-1); requestAnimationFrame(mirar) }; mirar() })`

async function principal(): Promise<void> {
  const dir = carpeta('t2-video')
  const b = await abrirMotor(ANCHO, ALTO, { conVsync: true, dpr: DPR })
  try {
    const d = await medir<{ tope: number; alto: number; vh: number }>(b.p, `(() => { const p = document.querySelector('[data-panel="servicios"]'); const r = p.getBoundingClientRect(); return { tope: Math.round(r.top + scrollY), alto: Math.round(r.height), vh: innerHeight } })()`)
    const [desde, hasta] = [d.tope, d.tope + d.alto - d.vh]
    const pasadas: unknown[] = []
    for (let k = 0; k < PASADAS; k += 1) {
      await medir(b.p, `window.scrollTo(0, ${String(desde)})`)
      await esperar(2500)
      const hayVideo = await medir<boolean>(b.p, ESPIA)
      await medir(b.p, 'window.__cuadrosDelBanco.empezar()')
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(${String(desde)}, ${String(hasta)}, ${String(VELOCIDAD)})`)
      const r = await medir<{ t: number[] }>(b.p, 'window.__cuadrosDelBanco.parar()')
      const enPausa = await medir<number[]>(b.p, JUNTAR)
      const intervalos = r.t.slice(1).map((t, i) => t - r.t[i])
      const refresco = [...intervalos].sort((a, c) => a - c)[Math.floor(intervalos.length / 2)] ?? 13.3
      const perdidos = intervalos.filter((ms) => ms > refresco * 1.5).length
      const pausado = enPausa.length === 0 ? 0 : enPausa.filter((x) => x === 1).length / enPausa.length
      const fila = { pasada: k + 1, hayVideo, cuadros: r.t.length, perdidos, refresco: Math.round(refresco * 10) / 10, videosEnPausaEnPantalla: Math.round(pausado * 1000) / 1000 }
      pasadas.push(fila)
      console.log(JSON.stringify(fila))
    }
    // La frenada: Servicios va clavado mientras la página corre, así que se busca de a 150 px un lugar con un video entero
    // en pantalla y andando; ahí, un scroll corto (120 px) y cuánto tarda en volver a andar desde que el scroll frena.
    let puesto = -1
    for (let y = desde; y <= hasta && puesto < 0; y += 150) {
      await medir(b.p, `window.scrollTo(0, ${String(y)})`)
      await esperar(900)
      const hay = await medir<boolean>(b.p, `(() => { const v = [...document.querySelectorAll('video[data-pieza="video-de-servicio"]')].find((x) => { const r = x.getBoundingClientRect(); return !x.paused && r.top >= 0 && r.bottom + 120 <= innerHeight }); window.__videoDeLaFrenada = v ?? null; return v !== undefined })()`)
      if (hay) puesto = y
    }
    const andabaAntes = puesto >= 0
    if (andabaAntes) {
      await medir(b.p, ESPIA)
      await medir(b.p, `window.__cuadrosDelBanco.recorrer(${String(puesto)}, ${String(puesto + 120)}, ${String(VELOCIDAD)})`)
    }
    const enLaFrenada = andabaAntes ? await medir<number[]>(b.p, JUNTAR) : []
    const vuelveMs = andabaAntes ? await medir<number>(b.p, VUELVE) : -1
    const frenada = { puesto, andabaAntes, enPausaDuranteElScroll: enLaFrenada.length === 0 ? 0 : Math.round((enLaFrenada.filter((x) => x === 1).length / enLaFrenada.length) * 1000) / 1000, vuelveMs }
    console.log(JSON.stringify({ frenada }))
    const errores = await medir<string[]>(b.p, 'window.__errores ?? []')
    writeFileSync(`${dir}/servicios-${ROTULO}-${PLACA}-dpr${String(DPR)}.json`, JSON.stringify({ placa: PLACA, dpr: DPR, velocidad: VELOCIDAD, desde, hasta, pasadas, frenada, errores }, null, 1))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('t2-servicios.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
