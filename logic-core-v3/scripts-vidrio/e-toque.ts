/**
 * E · EL TOQUE ABRE Y CIERRA — la comprobación de que el gesto existe.
 *
 *     npx tsx scripts-vidrio/e-toque.ts
 *
 * Una captura no puede decir si un toque abre y otro cierra: eso es una
 * secuencia. Acá se toca de verdad —`Input.dispatchMouseEvent`, que pasa por el
 * hit-test— y se lee, después de cada toque, las tres cosas que el pedido nombra:
 * el estado del marco, si el texto del puesto subió, y si el marcador se fue.
 */

import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { ASENTAMIENTO_MS, conLaPagina, esperar, scrollA } from './vidrio-comun'

const PRIMER_MARCO = '[data-panel="quienes-somos"] [data-marco="dos-tomas"]'

const LECTOR = [
  '(() => {',
  "  const m = document.querySelector('" + PRIMER_MARCO + "')",
  '  if (m === null) return { hay: false }',
  '  const r = m.getBoundingClientRect()',
  '  const texto = m.querySelector(\'p > span\')',
  '  const boton = m.querySelector(\'[data-toque="marco"]\')',
  '  return {',
  '    hay: true,',
  '    abierto: m.getAttribute("data-abierto"),',
  '    presionado: boton === null ? null : boton.getAttribute("aria-pressed"),',
  '    marcador: m.querySelectorAll(\'[data-marcador="toque"]\').length,',
  '    textoY: texto === null ? null : getComputedStyle(texto).translate + " | " + getComputedStyle(texto).transform,',
  '    capas: [...m.children].map((h) => { const cs = getComputedStyle(h); return cs.display + "/" + cs.opacity + "/" + (cs.clipPath || "-") }),',
  '    tomaSuelta: (() => { const d = m.querySelectorAll("div"); return d.length === 0 ? null : getComputedStyle(d[0]).clipPath })(),',
  '    centro: { x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) },',
  '    visible: r.top > 0 && r.bottom < window.innerHeight,',
  '  }',
  '})()',
].join(String.fromCharCode(10))

async function principal(): Promise<void> {
  await conLaPagina(perfilPorId('768'), async (s) => {
    await esperar(ASENTAMIENTO_MS)
    // Traer el primer marco al centro del cuadro.
    const donde = await medir<{ top: number }>(
      s.pagina,
      "(() => { const m = document.querySelector('" + PRIMER_MARCO + "'); const r = m.getBoundingClientRect(); return { top: Math.round(r.top + window.scrollY) } })()",
    )
    await scrollA(s.pagina, Math.max(0, donde.top - 200))
    await esperar(900)

    const tocar = async (): Promise<void> => {
      const antes = await medir<{ centro: { x: number; y: number } }>(s.pagina, LECTOR)
      for (const tipo of ['mousePressed', 'mouseReleased']) {
        await s.pagina.conexion.enviar(
          'Input.dispatchMouseEvent',
          { type: tipo, x: antes.centro.x, y: antes.centro.y, button: 'left', clickCount: 1 },
          s.pagina.sessionId,
        )
      }
      await esperar(1200)
    }

    console.log('  reposo :', JSON.stringify(await medir<Record<string, unknown>>(s.pagina, LECTOR)))
    await tocar()
    console.log('  toque 1:', JSON.stringify(await medir<Record<string, unknown>>(s.pagina, LECTOR)))
    await tocar()
    console.log('  toque 2:', JSON.stringify(await medir<Record<string, unknown>>(s.pagina, LECTOR)))
    return null
  })
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
