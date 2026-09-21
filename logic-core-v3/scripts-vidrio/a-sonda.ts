/**
 * A · LA SONDA — ¿se puede llegar al material del logo desde la página?
 *
 *     npx tsx scripts-vidrio/a-sonda.ts
 *
 * Antes de prototipar nada hay que saber tres cosas, y ninguna se supone:
 *   1. por dónde expone `react-three-fiber` su escena en ESTA versión,
 *   2. cuántas mallas tiene el logo y qué material comparten,
 *   3. dónde cae el titular de «Quiénes somos» sobre el logo, en scroll.
 */

import { medir } from '../scripts-b4/navegador'

import { CENSO_DE_MATERIALES, INSTALAR_LA_MANIJA } from './manija'
import { ASENTAMIENTO_MS, PERFILES, conLaPagina, esperar } from './vidrio-comun'

/** Busca la manija de r3f en el canvas y en sus ancestros, y en el global. */
export const SONDA_DE_LA_MANIJA = [
  '(() => {',
  "  const c = document.querySelector('canvas')",
  '  if (c === null) return { hay: false }',
  '  const mirar = (o) => {',
  '    if (o === null || o === undefined) return []',
  '    const propios = Object.getOwnPropertyNames(o).filter((k) => /r3f|fiber|three|__react/i.test(k))',
  '    const simbolos = Object.getOwnPropertySymbols(o).map((s) => String(s)).filter((k) => /r3f|fiber|three|react/i.test(k))',
  '    return propios.concat(simbolos)',
  '  }',
  '  const cadena = []',
  '  let n = c',
  '  for (let i = 0; i < 6 && n !== null; i += 1) {',
  "    cadena.push({ etiqueta: n.tagName ? n.tagName.toLowerCase() : '?', claves: mirar(n) })",
  '    n = n.parentElement',
  '  }',
  '  return {',
  '    hay: true,',
  '    cadena,',
  '    globales: Object.getOwnPropertyNames(window).filter((k) => /r3f|three|fiber|__REACT/i.test(k)),',
  '  }',
  '})()',
].join('\n')

/** Dónde cae el panel y su titular en el documento, para elegir el scroll. */
export const SONDA_DEL_CRUCE = [
  '(() => {',
  '  const panel = document.querySelector(\'[data-panel="quienes-somos"]\')',
  '  if (panel === null) return { hay: false }',
  '  const r = panel.getBoundingClientRect()',
  '  const t = document.querySelector(\'[data-panel="quienes-somos"] [data-composicion="agencia"]\')',
  '  const rt = t === null ? null : t.getBoundingClientRect()',
  '  return {',
  '    hay: true,',
  '    panelTop: Math.round(r.top + window.scrollY),',
  '    panelAlto: Math.round(r.height),',
  '    agenciaTop: rt === null ? null : Math.round(rt.top + window.scrollY),',
  '    agenciaAlto: rt === null ? null : Math.round(rt.height),',
  '    alto: window.innerHeight,',
  '    documento: document.documentElement.scrollHeight,',
  '  }',
  '})()',
].join('\n')

async function principal(): Promise<void> {
  for (const perfil of PERFILES) {
    await conLaPagina(perfil, async (s) => {
      await esperar(ASENTAMIENTO_MS)
      await medir<Record<string, unknown>>(s.pagina, INSTALAR_LA_MANIJA)
      const manija = await medir<Record<string, unknown>>(s.pagina, CENSO_DE_MATERIALES)
      const cruce = await medir<Record<string, unknown>>(s.pagina, SONDA_DEL_CRUCE)
      console.log(`\n=== ${perfil.id} (${perfil.ancho}x${perfil.alto})`)
      console.log('  manija:', JSON.stringify(manija))
      console.log('  cruce :', JSON.stringify(cruce))
      return null
    })
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
