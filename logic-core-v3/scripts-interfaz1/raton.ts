/**
 * SPRINT INTERFAZ 1 · T2 — el mouse sobre lo que se toca: raton.ts <rótulo> [consulta]
 *
 * Cuatro escenas a 1440 × 900, cada una un clip: el mouse real por CDP (`mouseMoved`, puntero de mouse) recorre texto,
 * se queda 1,6 s sobre cada control y se va. Se ven el rollover (o su falta) y el cursor propio (o su falta): el cursor
 * es DOM y sale en el screencast; el nativo no. Los blancos se buscan por medición (selector y texto), no por número.
 *   · hero: el titular, los dos CTA, un link del menú y el logo.
 *   · trabajos: la sala oscura, un libro de las demos.
 *   · tu-panel: una tarjeta.
 *   · cierre: el mail, WhatsApp, un link del pie y una red.
 * Al final de cada escena, el estado del cursor (`data-*` de su raíz) sobre cada blanco, si existe.
 * Va a `interfaz1/t2-rollover-cursor/raton-<escena>-<rótulo>.mp4` y `raton-<rótulo>.json`.
 */
import { writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { abrir, armarClip, carpeta, correr, esperar, grabar, raton, rueda, type Banco } from './banco'

const ROTULO = process.argv[2] ?? 'antes'
const CONSULTA = process.argv[3] ?? ''

interface Blanco {
  readonly nombre: string
  /** Un selector; con `texto`, el primero visible que lo contenga. */
  readonly selector: string
  readonly texto?: string
}

interface Escena {
  readonly id: string
  /** Dónde se para el scroll: el tope de un panel más una fracción de pantalla, o un selector a centrar. */
  readonly centrar: string
  readonly blancos: readonly Blanco[]
}

const ESCENAS: readonly Escena[] = [
  {
    id: 'hero',
    centrar: '[data-panel="hero"] h1',
    blancos: [
      { nombre: 'titular', selector: '[data-panel="hero"] h1' },
      { nombre: 'cta-trabajos', selector: '[data-panel="hero"] a[data-pieza="cta"]', texto: 'trabajos' },
      { nombre: 'cta-hablemos', selector: '[data-panel="hero"] a[data-pieza="cta"]', texto: 'Hablemos' },
      { nombre: 'menu-trabajos', selector: 'a[data-pieza="nav-enlace"]', texto: 'Trabajos' },
      { nombre: 'logo', selector: 'LOGO' },
    ],
  },
  {
    id: 'trabajos',
    centrar: '[data-panel="trabajos"] a[data-pieza="libro"]',
    blancos: [
      { nombre: 'titulo-demos', selector: '[data-panel="trabajos"] h3' },
      { nombre: 'libro', selector: '[data-panel="trabajos"] a[data-pieza="libro"]' },
    ],
  },
  {
    id: 'tu-panel',
    centrar: '[data-panel="tu-panel"] h2',
    blancos: [
      { nombre: 'titulo', selector: '[data-panel="tu-panel"] h2' },
      { nombre: 'tarjeta', selector: '[data-panel="tu-panel"] button' },
    ],
  },
  {
    id: 'cierre',
    centrar: '[data-panel="cierre"] h2',
    blancos: [
      { nombre: 'titulo', selector: '[data-panel="cierre"] h2' },
      { nombre: 'mail', selector: '[data-panel="cierre"] a', texto: '@' },
      { nombre: 'whatsapp', selector: '[data-panel="cierre"] a', texto: 'WhatsApp' },
      { nombre: 'pie-enlace', selector: '[data-panel="cierre"] a', texto: 'Servicios' },
      { nombre: 'red', selector: '[data-panel="cierre"] a', texto: 'Instagram' },
    ],
  },
]

/** El centro del blanco en la pantalla (o null). `LOGO`: el centro del lienzo de la escena, donde está el logo del hero. */
const CENTRO = (bl: Blanco): string => `(() => {
  if (${JSON.stringify(bl.selector)} === 'LOGO') return [Math.round(innerWidth * 0.5), Math.round(innerHeight * 0.48)]
  const todos = [...document.querySelectorAll(${JSON.stringify(bl.selector)})]
  const el = todos.find((e) => { const r = e.getBoundingClientRect(); const t = (e.textContent || '') + ' ' + (e.getAttribute('aria-label') || ''); return r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < innerHeight && (${JSON.stringify(bl.texto ?? '')} === '' || t.includes(${JSON.stringify(bl.texto ?? '')})) })
  if (!el) return null
  const r = el.getBoundingClientRect()
  return [Math.round(r.left + Math.min(r.width / 2, 60)), Math.round(r.top + r.height / 2)]
})()`

const ESTADO_DEL_CURSOR = `(() => { const c = document.querySelector('[data-pieza="cursor-sala"], [data-pieza="cursor"]'); if (!c) return null; const o = {}; for (const a of c.getAttributeNames()) if (a.startsWith('data-')) o[a] = c.getAttribute(a); const h = c.querySelector('[data-capa="halo"], [data-parte="halo"]') || c.firstElementChild; const r = h ? h.getBoundingClientRect() : null; o.halo = r ? Math.round(r.width) : 0; o.opacidad = h ? getComputedStyle(h).opacity : ''; return o })()`

async function escena(b: Banco, dir: string, e: Escena): Promise<Record<string, unknown>> {
  // Se llega con la rueda (las últimas 12 muescas), como una persona: un salto con `scrollTo` no dispara la noche de
  // Trabajos (cae con la gota al cruzar la frontera) y deja la sala de día.
  const destino = await medir<number>(b.p, `(() => { const el = [...document.querySelectorAll(${JSON.stringify(e.centrar)})].find((x) => x.getBoundingClientRect().height > 2); if (!el) return 0; const r = el.getBoundingClientRect(); return Math.max(0, Math.round(r.top + scrollY - innerHeight * 0.4)) })()`)
  await medir(b.p, `window.scrollTo(0, ${String(Math.max(0, destino - 1200))})`)
  await esperar(1200)
  await rueda(b, destino >= 1200 ? 12 : Math.round(destino / 100), 90)
  await esperar(3000)
  const centros: { nombre: string; punto: [number, number] | null }[] = []
  for (const bl of e.blancos) centros.push({ nombre: bl.nombre, punto: await medir<[number, number] | null>(b.p, CENTRO(bl)) })
  let donde: [number, number] = [Math.round(b.ancho * 0.08), Math.round(b.alto * 0.9)]
  await raton(b, donde, donde)
  const estados: Record<string, unknown> = {}
  const base = `${dir}/raton-${e.id}-${ROTULO}`
  const cuadros = await grabar(b, `${base}.cuadros`, async () => {
    await esperar(400)
    for (const c of centros) {
      if (c.punto === null) continue
      await raton(b, donde, c.punto, 30, 16)
      donde = c.punto
      await esperar(1600)
      estados[c.nombre] = await medir(b.p, ESTADO_DEL_CURSOR)
      // Salir a un costado vacío, para ver cómo se deshace.
      const afuera: [number, number] = [donde[0], Math.min(b.alto - 20, donde[1] + 70)]
      await raton(b, donde, afuera, 12, 16)
      donde = afuera
      await esperar(700)
    }
  })
  armarClip(`${base}.cuadros`, cuadros, `${base}.mp4`, `T2 raton · ${e.id} · ${ROTULO}`)
  return { escena: e.id, centros, estados }
}

correr(async () => {
  const dir = carpeta('t2-rollover-cursor')
  const b = await abrir(1440, 900, { consulta: CONSULTA })
  try {
    const salida: Record<string, unknown>[] = []
    for (const e of ESCENAS) salida.push(await escena(b, dir, e))
    writeFileSync(`${dir}/raton-${ROTULO}.json`, JSON.stringify({ rotulo: ROTULO, placa: b.placa, escenas: salida }, null, 1))
    console.log(JSON.stringify(salida))
  } finally {
    await b.cerrar()
  }
})
