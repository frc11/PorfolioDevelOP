/**
 * SPRINT INTERFAZ 1 — la sonda: qué títulos, párrafos, etiquetas y controles tiene /v3 y dónde están (en px del
 * documento), para que los otros bancos los ubiquen por medición y no por número escrito. sonda.ts [ancho] [alto]
 * Va a `interfaz1/sonda-<ancho>.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, correr } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]

const LEER = `(() => {
  const panelDe = (el) => { const p = el.closest('[data-panel]'); return p ? p.getAttribute('data-panel') : null }
  const caja = (el) => { const r = el.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), x: Math.round(r.left), w: Math.round(r.width), h: Math.round(r.height) } }
  const texto = (el) => (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 60)
  const visible = (el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0 }
  const titulos = [...document.querySelectorAll('h1, h2, h3, h4')].map((el) => ({ tag: el.tagName, panel: panelDe(el), texto: texto(el), srOnly: el.classList.contains('sr-only'), visible: visible(el), ...caja(el) }))
  const controles = [...document.querySelectorAll('a[href], button, input, textarea, select, [tabindex]')].filter((el) => el.getAttribute('tabindex') !== '-1').map((el) => ({ tag: el.tagName, panel: panelDe(el), texto: texto(el) || el.getAttribute('aria-label') || '', pieza: el.getAttribute('data-pieza'), visible: visible(el), ...caja(el) }))
  const paneles = [...document.querySelectorAll('[data-panel]')].map((el) => ({ id: el.getAttribute('data-panel'), seccion: el.getAttribute('data-seccion'), ...caja(el) }))
  return { fin: document.documentElement.scrollHeight - innerHeight, paneles, titulos, controles }
})()`

correr(async () => {
  const b = await abrir(ANCHO, ALTO)
  try {
    const r = await medir<Record<string, unknown>>(b.p, LEER)
    writeFileSync(`${carpeta('')}/sonda-${String(ANCHO)}.json`, JSON.stringify({ placa: b.placa, ...r }, null, 1))
    console.log(`placa: ${b.placa}`)
  } finally {
    await b.cerrar()
  }
})
