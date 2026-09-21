/**
 * K — QUÉ TEXTO QUEDA ANGOSTO EN LA BANDA MÓVIL, Y QUÉ LO ACOTA.
 *
 *     npx tsx scripts-blend/k-anchos.ts [--anchos=320,375,425]
 *
 * El pedido dice «una columna angosta pegada a la izquierda con medio viewport
 * vacío a la derecha». Antes de mover una medida hay que saber CUÁL de los
 * textos es y QUÉ lo acota, porque las causas posibles son tres y se arreglan
 * distinto:
 *
 *   · un `max-width` propio (una medida declarada) — se acota por ancho;
 *   · una celda de grilla más angosta que el contenedor — se cambia el reparto;
 *   · o **nada**: el renglón simplemente no llega al margen, que es el caso de
 *     la bajada del hero (COMPO-2 la dejó en una frase de 243,34 px medida en
 *     los ocho anchos). Ahí no hay nada que ensanchar.
 *
 * Por eso se publica, para cada pieza: su caja, el ancho útil del contenedor que
 * la envuelve, el `max-width` computado y cuánto sobra a la derecha.
 */

import { medir } from '../scripts-b4/navegador'
import { VENTANAS, conChrome, enLaVentana, type Ventana } from '../scripts-tapado/tapado-comun'

import { argumento, guardarJson } from './blend-comun'

const PIEZAS: readonly { readonly que: string; readonly sel: string }[] = [
  { que: 'hero titular', sel: '[data-panel="hero"] h1' },
  { que: 'hero bajada', sel: '[data-panel="hero"] [data-nivel]' },
  { que: 'qs titular', sel: '[data-panel="quienes-somos"] [data-composicion="agencia"] div[aria-hidden="true"]' },
  { que: 'qs bajada', sel: '[data-panel="quienes-somos"] [data-composicion="agencia"] p' },
  { que: 'equipo caja', sel: '[data-composicion="equipo"]' },
  { que: 'equipo titulo', sel: '[data-composicion="equipo"] h3, [data-composicion="equipo"] h2' },
  { que: 'equipo persona', sel: '[data-pieza-a="persona"]' },
  { que: 'equipo nombre', sel: '[data-marco="dos-tomas"] ~ * span, [data-pieza-a="persona"] span' },
  { que: 'equipo foto', sel: '[data-marco="dos-tomas"]' },
]

function lector(): string {
  return [
    '(() => {',
    '  const util = (el) => {',
    '    let n = el.parentElement',
    '    while (n !== null) {',
    '      const cs = getComputedStyle(n)',
    '      const r = n.getBoundingClientRect()',
    '      const dentro = r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight)',
    '      if (dentro > 1) return { ancho: Math.round(dentro), x: Math.round(r.x + parseFloat(cs.paddingLeft)), quien: n.tagName.toLowerCase() + [...n.attributes].filter((a) => a.name.startsWith("data-")).map((a) => "[" + a.name + "]").join("") }',
    '      n = n.parentElement',
    '    }',
    '    return null',
    '  }',
    '  const leer = (sel) => {',
    '    const el = document.querySelector(sel)',
    '    if (el === null) return { hay: false }',
    '    const r = el.getBoundingClientRect()',
    '    const cs = getComputedStyle(el)',
    '    const c = util(el)',
    '    return {',
    '      hay: true,',
    '      texto: (el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 30),',
    '      x: Math.round(r.x),',
    '      ancho: Math.round(r.width),',
    '      alto: Math.round(r.height),',
    '      maxWidth: cs.maxWidth,',
    '      contenedor: c,',
    '      sobraDerecha: c === null ? null : Math.round(c.x + c.ancho - (r.x + r.width)),',
    '    }',
    '  }',
    '  const salida = {}',
    `  for (const p of ${JSON.stringify(PIEZAS)}) salida[p.que] = leer(p.sel)`,
    '  return { ventana: window.innerWidth, piezas: salida }',
    '})()',
  ].join('\n')
}

interface Pieza {
  readonly hay: boolean
  readonly texto?: string
  readonly x?: number
  readonly ancho?: number
  readonly alto?: number
  readonly maxWidth?: string
  readonly contenedor?: { readonly ancho: number; readonly x: number; readonly quien: string } | null
  readonly sobraDerecha?: number | null
}

interface Lectura {
  readonly ventana: number
  readonly piezas: Readonly<Record<string, Pieza>>
}

async function principal(): Promise<void> {
  const pedidos = argumento('anchos', '320,375,425').split(',')
  const ventanas: readonly Ventana[] = VENTANAS.filter((v) => pedidos.includes(String(v.ancho)))
  const salida: Lectura[] = []
  await conChrome('blend-anchos', async (chrome) => {
    for (const v of ventanas) {
      const l = await enLaVentana(chrome, v, async (s) => medir<Lectura>(s.pagina, lector()), { asentamientoMs: 4500 })
      console.log(`\n  === ${v.ancho}x${v.alto}`)
      console.log('    pieza            x  ancho   alto  | contenedor útil  sobra der | max-width')
      for (const p of PIEZAS) {
        const d = l.piezas[p.que]
        if (d === undefined || !d.hay) {
          console.log(`    ${p.que.padEnd(14)}  (no está)`)
          continue
        }
        const c = d.contenedor ?? null
        console.log(
          `    ${p.que.padEnd(14)} ${String(d.x).padStart(3)} ${String(d.ancho).padStart(6)} ${String(d.alto).padStart(6)}  | ${String(c === null ? '-' : c.ancho).padStart(6)} en x=${String(c === null ? '-' : c.x).padStart(3)} ${String(d.sobraDerecha ?? '-').padStart(6)} | ${d.maxWidth}`,
        )
      }
      salida.push(l)
    }
    return null
  })
  console.log(`\n  ${guardarJson('k-anchos', { anchos: salida })}`)
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
