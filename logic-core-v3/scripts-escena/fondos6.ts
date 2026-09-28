/**
 * SPRINT ESCENA 6 · 1 — los "fondos" detrás del texto. fondos6.ts <antes|despues> [ancho]
 *
 * En cada momento espera un anillo del pulso, detiene el reloj de la escena (`__relojDelBanco`, sólo
 * existe con banco) y lo fotografía en cinco fases de su vida, más una toma sin anillo (el anillo ya
 * se apagó y el próximo todavía no nació). `antes` se corre con el código que tiene la máscara de
 * texto; `despues`, con el que no. La hoja y el contraste los arma `hojas6.ts fondos`.
 *
 * El contraste del texto: por cada fase, cada elemento de texto contra el mismo elemento en la toma
 * sin anillo (`contrasteDelTexto`). Vale el peor elemento y la peor caída.
 */
import { mkdirSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrirBanco, esperar, type Banco } from '../scripts-viajes/banco'
import { CONTADOR, DIR6, ESPIA_DE_SALTOS, MOMENTOS, capturarMomento, escenaViva, mover, selloDeCarga } from './banco-escena'
import { contrasteDelTexto } from './contraste-formacion'

const CUAL = process.argv[2] ?? ''
const ANCHO = Number(process.argv[3] ?? 1440)
const ALTO = ANCHO === 375 ? 812 : 900
/** Segundos después del nacimiento del anillo de reposo (vive 3,6 s). */
export const FASES = [0.5, 0.9, 1.4, 2.0, 2.7] as const
const SIN_ANILLO = 3.66

async function tomaCompleta(b: Banco): Promise<Buffer> {
  await medir(b.p, 'new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => r(0)))))')
  const s = (await b.p.conexion.enviar('Page.captureScreenshot', { format: 'png' }, b.p.sessionId)) as { data: string }
  await b.emular()
  return Buffer.from(s.data, 'base64')
}

/** Cada elemento de texto del cuadro con su color de CSS (para el contraste WCAG de `wcag6.ts`). */
export function cajasConColor(b: Banco): Promise<unknown[]> {
  return medir<unknown[]>(
    b.p,
    `[...document.querySelectorAll('main :is(h1, h2, h3, h4, p, a, li, span), nav a, footer :is(p, a, span)')].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 12 && r.height > 8 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && s.visibility !== 'hidden' && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim() !== '') && (() => { let o = 1; for (let a = e; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return o > 0.5 && c !== null && (c === e || e.contains(c) || c.contains(e)) })() }).map((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return { x: Math.round(r.left), y: Math.round(r.top), ancho: Math.round(r.width), alto: Math.round(r.height), texto: e.textContent.trim().slice(0, 32), color: s.color, px: parseFloat(s.fontSize), peso: Number(s.fontWeight) || 400 } })`,
  )
}

/** Espera a que nazca un anillo de reposo nuevo y devuelve cuándo nació (reloj de la escena). */
async function anilloNuevo(b: Banco): Promise<number> {
  const inicio = (await escenaViva(b))?.t ?? 0
  for (let i = 0; i < 80; i += 1) {
    const v = await medir<{ t: number; anillos: string[]; nacen: number[] } | null>(b.p, 'window.__escenaViva ?? null')
    if (v !== null) {
      const k = v.anillos.findIndex((c, j) => c === 'reposo' && v.nacen[j] > inicio)
      if (k >= 0) return v.nacen[k]
    }
    await esperar(100)
  }
  throw new Error('no nació ningún anillo de reposo en 8 s')
}

async function principal(): Promise<void> {
  if (CUAL !== 'antes' && CUAL !== 'despues') throw new Error('fondos6.ts <antes|despues> [ancho]')
  const dir = `${DIR6}/fondos-texto/cuadros`
  mkdirSync(dir, { recursive: true })
  const b = await abrirBanco(ANCHO, ALTO, { perfil: 'escena3', antesDeCargar: `window.__entornoDeLaEscena = 'producto'; ${CONTADOR}; ${ESPIA_DE_SALTOS}` })
  const medidas: Record<string, unknown> = {}
  try {
    const sello = await selloDeCarga(b)
    for (const momento of MOMENTOS) {
      await capturarMomento(b, momento, sello)
      await mover(b, ANCHO - 30, ALTO - 20)
      await esperar(600)
      const nace = await anilloNuevo(b)
      const base = `${dir}/${momento.nombre}-${String(ANCHO)}-${CUAL}`
      const tomas: Buffer[] = []
      for (const fase of FASES) {
        await medir(b.p, `window.__relojDelBanco = { detenido: true, t: ${String(nace + fase)} }`)
        const png = await tomaCompleta(b)
        writeFileSync(`${base}-${fase.toFixed(1)}.png`, png)
        tomas.push(png)
      }
      await medir(b.p, `window.__relojDelBanco = { detenido: true, t: ${String(nace + SIN_ANILLO)} }`)
      const sin = await tomaCompleta(b)
      writeFileSync(`${base}-sin-anillo.png`, sin)
      // El ruido: otra toma sin anillo, con el reloj igual (el polvo y la trama siguen moviéndose).
      const otra = await tomaCompleta(b)
      const ruido = (await contrasteDelTexto(b, otra, sin)).peorCaida
      const porFase = []
      for (const [i, png] of tomas.entries()) porFase.push({ fase: FASES[i], ...(await contrasteDelTexto(b, png, sin)) })
      medidas[momento.nombre] = { ruido, porFase, cajas: await cajasConColor(b) }
      await medir(b.p, 'window.__relojDelBanco = { detenido: false }')
      console.log(JSON.stringify({ momento: momento.nombre, ruido, porFase }))
    }
    writeFileSync(`${DIR6}/fondos-texto/contraste-${String(ANCHO)}-${CUAL}.json`, JSON.stringify(medidas, null, 1))
  } finally {
    await b.cerrar()
  }
}

if (process.argv[1]?.endsWith('fondos6.ts')) principal().then(() => process.exit(0), (e: unknown) => { console.error(`SE CORTO: ${e instanceof Error ? e.message : String(e)}`); process.exit(1) })
