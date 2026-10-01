/**
 * SPRINT INTERFAZ 1 — el chequeo rápido: chequeo.ts [ancho] [alto] [consulta]
 *
 * Abre /v3, recorre el documento entero de a una pantalla (con pausa para que lo que entra termine de medirse), y dice:
 * los errores y avisos de la consola, cuántos divisores quedaron partidos o midiendo, cuántos títulos llevan la
 * inercia, y si el gancho de la inercia existe. No mide nada fino: es para no gastar un banco largo en una página rota.
 */
import { medir } from '../scripts-b4/navegador'
import { abrir, correr, esperar } from './banco'

const [ANCHO, ALTO] = [Number(process.argv[2] ?? 1440), Number(process.argv[3] ?? 900)]
const CONSULTA = process.argv[4] ?? ''

correr(async () => {
  const b = await abrir(ANCHO, ALTO, { consulta: CONSULTA })
  try {
    const fin = await medir<number>(b.p, 'document.documentElement.scrollHeight - innerHeight')
    for (let y = 0; y <= fin + ALTO; y += ALTO) {
      await medir(b.p, `window.scrollTo(0, ${String(Math.min(y, fin))})`)
      await esperar(450)
    }
    await esperar(1200)
    const r = await medir<Record<string, unknown>>(b.p, `(() => ({
      errores: window.__errores.filter((e) => !e.includes('[Fast Refresh]') && !e.includes('Download the React DevTools')),
      lineasPartidas: [...document.querySelectorAll('[data-lineas-piezas]')].filter((e) => String(e.getAttribute('class')).includes('flex')).length,
      lineasMidiendo: [...document.querySelectorAll('[data-lineas-piezas]')].filter((e) => String(e.getAttribute('class')).includes('invisible')).length,
      palabras: document.querySelectorAll('[data-palabras-piezas]').length,
      inercia: document.querySelectorAll('[data-inercia]').length,
      gancho: typeof window.__inerciaDelBanco,
      rollovers: document.querySelectorAll('[data-rollover]').length,
      subrayadoDelMail: (() => { const c = document.querySelector('[data-panel="cierre"] a[href^="mailto"] [data-copia="a"]'); return c ? getComputedStyle(c).textDecorationLine : null })(),
      cursor: (() => { const c = document.querySelector('[data-pieza="cursor-sala"], [data-pieza="cursor"]'); return c ? c.getAttribute('data-pieza') : null })(),
      vigia: window.__vigia,
    }))()`)
    console.log(JSON.stringify(r, null, 1))
  } finally {
    await b.cerrar()
  }
})
