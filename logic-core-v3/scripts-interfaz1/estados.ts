/**
 * SPRINT INTERFAZ 1 · T3 — los estados que no son el anillo, comprobados en la página: estados.ts <rótulo>
 *
 *   · apretado — el botón del mouse SOSTENIDO por CDP (`mousePressed` sin soltar) sobre un link: la opacidad mientras
 *     se aprieta (COMPONENTS.md, hueco 1: chrome-devtools-mcp no podía sostener el botón; CDP crudo sí).
 *   · marco — el foco de teclado en el control de una foto de Quiénes somos: ¿se revela el texto? (el `translate` del
 *     revelado, que en reposo lo esconde abajo).
 *   · cta del final — el foco en el «Hablanos» de Por qué develOP antes de que llegue: ¿la página va adonde llega, y
 *     llega? (la opacidad de su pieza a los 3,5 s).
 *   · contacto — el formulario abierto y enviado vacío: cuántas regiones `alert` tienen texto, los `aria-invalid`, el
 *     borde de error y dónde quedó el foco.
 *   · demo — una demo abierta: `aria-busy` y lo que dice la región de estado mientras carga.
 *   · servicios con menos movimiento — a 1440 con la preferencia: cuántos CTA de servicio se ven.
 * Va a `interfaz1/t3-completitud/estados-<rótulo>.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, carpeta, correr, esperar, raton, rueda, type Banco } from './banco'

const ROTULO = process.argv[2] ?? 'despues'

const centroDe = (b: Banco, selector: string): Promise<[number, number] | null> =>
  medir<[number, number] | null>(b.p, `(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find((e) => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && r.top >= 0 && r.bottom <= innerHeight }); if (!el) return null; const r = el.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)] })()`)

async function irA(b: Banco, selector: string, fraccion = 0.4): Promise<void> {
  const y = await medir<number>(b.p, `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) return 0; const r = el.getBoundingClientRect(); return Math.max(0, Math.round(r.top + scrollY - innerHeight * ${String(fraccion)})) })()`)
  await medir(b.p, `window.scrollTo(0, ${String(Math.max(0, y - 1000))})`)
  await esperar(800)
  await rueda(b, 10, 80)
  await esperar(2200)
}

correr(async () => {
  const salida: Record<string, unknown> = { rotulo: ROTULO }
  const b = await abrir(1440, 900)
  try {
    // ── apretado ─────────────────────────────────────────────────────────
    await irA(b, '[data-panel="cierre"] h2')
    const mail = await centroDe(b, '[data-panel="cierre"] a[href^="mailto"]')
    if (mail !== null) {
      await raton(b, mail, mail)
      await esperar(300)
      const reposo = await medir<string>(b.p, `getComputedStyle(document.querySelector('[data-panel="cierre"] a[href^="mailto"]')).opacity`)
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mousePressed', x: mail[0], y: mail[1], button: 'left', buttons: 1, clickCount: 1 }, b.p.sessionId)
      await esperar(250)
      const apretado = await medir<string>(b.p, `getComputedStyle(document.querySelector('[data-panel="cierre"] a[href^="mailto"]')).opacity`)
      // Soltar AFUERA del link: no navega al mailto.
      await raton(b, mail, [mail[0], mail[1] + 220], 4, 16)
      await b.p.conexion.enviar('Input.dispatchMouseEvent', { type: 'mouseReleased', x: mail[0], y: mail[1] + 220, button: 'left', buttons: 0, clickCount: 1 }, b.p.sessionId)
      salida.apretado = { reposo, apretado }
    }

    // ── marco ────────────────────────────────────────────────────────────
    await irA(b, '[data-panel="quienes-somos"] [data-toque="marco"]', 0.3)
    salida.marco = await medir(b.p, `(async () => {
      const boton = [...document.querySelectorAll('[data-toque="marco"]')].find((e) => e.getBoundingClientRect().height > 2)
      const marco = boton.closest('[data-marco]')
      const texto = marco.querySelector('[data-parte="revelado-texto"] > span')
      const antes = getComputedStyle(texto).translate + ' ' + getComputedStyle(texto).transform
      boton.focus({ focusVisible: true })
      await new Promise((r) => setTimeout(r, 1600))
      const conFoco = getComputedStyle(texto).translate + ' ' + getComputedStyle(texto).transform
      return { focoVisible: boton.matches(':focus-visible'), reposo: antes, conFoco, revelado: antes !== conFoco }
    })()`)
    await medir(b.p, 'document.activeElement && document.activeElement.blur()')

    // ── el CTA del final ─────────────────────────────────────────────────
    await irA(b, '[data-panel="por-que-develop"]', 0)
    const antesDelFoco = await medir<number>(b.p, 'Math.round(scrollY)')
    salida.ctaDelFinal = await medir(b.p, `(async () => {
      const a = document.querySelector('[data-pieza="cta-del-final"] a')
      const pieza = a.closest('[data-pieza="cta-del-final"]')
      const opacidad = () => { let o = 1; for (let e = a; e && e !== pieza.parentElement; e = e.parentElement) o *= Number(getComputedStyle(e).opacity); return Math.round(o * 1000) / 1000 }
      const inicial = opacidad()
      a.focus({ focusVisible: true })
      await new Promise((r) => setTimeout(r, 3500))
      return { opacidadAlEnfocar: inicial, opacidadA35s: opacidad(), pointerEvents: getComputedStyle(pieza).pointerEvents, scrollY: Math.round(scrollY) }
    })()`)
    salida.ctaDelFinalScrollAntes = antesDelFoco
    await medir(b.p, 'document.activeElement && document.activeElement.blur()')

    // ── contacto ─────────────────────────────────────────────────────────
    salida.contacto = await medir(b.p, `(async () => {
      const abridor = document.querySelector('a[href="#contacto"]')
      abridor.click()
      await new Promise((r) => setTimeout(r, 1500))
      const hoja = document.querySelector('[data-pieza="contacto"]')
      if (!hoja) return { abierto: false }
      hoja.querySelector('form').requestSubmit()
      await new Promise((r) => setTimeout(r, 900))
      const alertas = [...hoja.querySelectorAll('[role="alert"]')].map((e) => e.textContent.trim()).filter((t) => t !== '')
      const r = {
        abierto: true,
        alertasConTexto: alertas.length,
        alertas,
        invalidos: hoja.querySelectorAll('[aria-invalid="true"]').length,
        chipsInvalidos: hoja.querySelectorAll('[data-pieza="chip-de-contacto"] input[aria-invalid="true"]').length,
        bordesPunteados: [...hoja.querySelectorAll('label')].filter((l) => getComputedStyle(l).borderTopStyle === 'dashed').length,
        foco: document.activeElement ? document.activeElement.tagName + (document.activeElement.getAttribute('name') ? '[' + document.activeElement.getAttribute('name') + ']' : '') : null,
        estado: hoja.querySelectorAll('[role="status"]').length,
      }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      return r
    })()`)
    await esperar(1200)

    // ── demo ─────────────────────────────────────────────────────────────
    await irA(b, '[data-panel="trabajos"] [data-pieza="estante"]', 0.5)
    salida.demo = await medir(b.p, `(async () => {
      const libro = [...document.querySelectorAll('[data-pieza="libro"]')].find((e) => e.getBoundingClientRect().height > 2)
      if (!libro) return { libro: false }
      libro.click()
      const muestras = []
      for (let k = 0; k < 12; k += 1) {
        await new Promise((r) => setTimeout(r, 150))
        const d = document.querySelector('[role="dialog"][data-demo]')
        if (!d) { muestras.push(null); continue }
        const s = d.querySelector('[role="status"]')
        muestras.push({ busy: d.getAttribute('aria-busy'), estado: s ? s.textContent : null })
      }
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
      return { muestras }
    })()`)
  } finally {
    await b.cerrar()
  }

  // ── Servicios con menos movimiento, a 1440 ───────────────────────────
  const r = await abrir(1440, 900, { reducido: true })
  try {
    salida.serviciosConMenosMovimiento = await medir(r.p, `(() => { const ctas = [...document.querySelectorAll('[data-pieza="cta-del-servicio"]')]; return { ctas: ctas.length, visibles: ctas.filter((c) => getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().height > 0).length } })()`)
  } finally {
    await r.cerrar()
  }
  writeFileSync(`${carpeta('t3-completitud')}/estados-${ROTULO}.json`, JSON.stringify(salida, null, 1))
  console.log(JSON.stringify(salida, null, 1))
})
