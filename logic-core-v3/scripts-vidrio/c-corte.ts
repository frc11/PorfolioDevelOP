/**
 * C · DÓNDE ESTÁ HOY EL CORTE DE «EL EQUIPO».
 *
 *     npx tsx scripts-vidrio/c-corte.ts
 *
 * El pedido dice que a 1024 la sección se comporta como tablet y que el corte
 * «está mal puesto». Eso es una afirmación sobre el píxel, así que se mide en
 * vez de discutirse: a 1024 y a 1025 se lee, del DOM, cuál de las dos
 * composiciones está puesta.
 *
 * Las tres preguntas que separan «tablet» de «portátil»:
 *   · la CALLE DERECHA — ¿el bloque ocupa la mitad del ancho o todo?
 *   · la FILA de una persona — ¿es una grilla de 4 columnas o una pila?
 *   · el ZIGZAG — ¿las dos filas ponen la foto de lados distintos?
 */

import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { ASENTAMIENTO_MS, conLaPagina, esperar } from './vidrio-comun'

const LECTOR = [
  '(() => {',
  '  const equipo = document.querySelector(\'[data-composicion="equipo"]\')',
  '  if (equipo === null) return { hay: false }',
  '  const calle = equipo.parentElement',
  '  const filas = [...document.querySelectorAll(\'[data-pieza-a="persona"]\')]',
  '  const leer = (el) => {',
  '    const cs = getComputedStyle(el)',
  '    const r = el.getBoundingClientRect()',
  '    return { display: cs.display, columnas: cs.gridTemplateColumns, ancho: Math.round(r.width), x: Math.round(r.x) }',
  '  }',
  '  return {',
  '    hay: true,',
  '    ventana: window.innerWidth,',
  '    calle: calle === null ? null : leer(calle),',
  '    equipo: leer(equipo),',
  '    filas: filas.map((f) => {',
  '      const hijos = [...f.children].map((h) => {',
  '        const cs = getComputedStyle(h)',
  '        const r = h.getBoundingClientRect()',
  '        return { columna: cs.gridColumnStart, x: Math.round(r.x), ancho: Math.round(r.width) }',
  '      })',
  '      return { ...leer(f), hijos }',
  '    }),',
  '  }',
  '})()',
].join('\n')

async function principal(): Promise<void> {
  for (const id of ['1024', '1025']) {
    await conLaPagina(perfilPorId(id), async (s) => {
      await esperar(ASENTAMIENTO_MS)
      const l = await medir<Record<string, unknown>>(s.pagina, LECTOR)
      console.log(`\n=== ${id}`)
      console.log(JSON.stringify(l, null, 1))
      return null
    })
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
