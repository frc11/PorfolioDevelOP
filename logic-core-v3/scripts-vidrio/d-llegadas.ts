/**
 * D · ¿ESTÁN APAGADOS LOS EFECTOS DE LLEGADA ABAJO DE 1025?
 *
 *     npx tsx scripts-vidrio/d-llegadas.ts
 *
 * La respuesta estructural es que sí —abajo del umbral `CompuertaDelHome` no
 * instala las primitivas animadas, así que todo canal cae en su rama quieta—,
 * pero eso es un razonamiento sobre el código. Esto lo lee del DOM vivo:
 *
 *   · la marca del árbol quieto en los bloques,
 *   · cuántos nodos de la sección tienen una `transform` escrita,
 *   · y el estado de las dos piezas que sí se mueven arriba de 1025: la llegada
 *     en curva de los retratos y la máscara de renglón del titular.
 */

import { medir } from '../scripts-b4/navegador'
import { perfilPorId } from '../scripts-b4/perfiles'

import { ASENTAMIENTO_MS, conLaPagina, esperar } from './vidrio-comun'

const LECTOR = [
  '(() => {',
  '  const panel = document.querySelector(\'[data-panel="quienes-somos"]\')',
  '  if (panel === null) return { hay: false }',
  '  const nodos = [panel, ...panel.querySelectorAll("*")]',
  '  const conTransformada = nodos.filter((n) => {',
  '    const t = getComputedStyle(n).transform',
  '    return t !== "none" && t !== "matrix(1, 0, 0, 1, 0, 0)"',
  '  })',
  '  return {',
  '    hay: true,',
  '    ventana: window.innerWidth,',
  '    nodos: nodos.length,',
  '    arbolQuieto: panel.querySelectorAll("[data-arbol]").length,',
  '    conTransformada: conTransformada.length,',
  '    cuales: conTransformada.slice(0, 6).map((n) => (n.tagName.toLowerCase() + " " + (n.getAttribute("data-parte") ?? n.getAttribute("data-pieza-a") ?? "") + " -> " + getComputedStyle(n).transform).trim()),',
  '    marcadores: panel.querySelectorAll(\'[data-marcador="toque"]\').length,',
  '    botonesDeToque: panel.querySelectorAll(\'[data-toque="marco"]\').length,',
  // El control vive en el marcado de los dos lados: lo apaga `escritorio:hidden`.
  // Lo que separa un lado del otro es cuantos de esos botones PINTAN.
  '    botonesPintados: [...panel.querySelectorAll(\'[data-toque="marco"]\')].filter((b) => getComputedStyle(b).display !== "none").length,',
  '  }',
  '})()',
].join(String.fromCharCode(10))

async function principal(): Promise<void> {
  for (const id of ['768', '375', '1025']) {
    await conLaPagina(perfilPorId(id), async (s) => {
      await esperar(ASENTAMIENTO_MS)
      const l = await medir<Record<string, unknown>>(s.pagina, LECTOR)
      console.log(`\n=== ${id}`)
      console.log(JSON.stringify(l))
      return null
    })
  }
}

principal().catch((e: unknown) => {
  console.error(e)
  process.exitCode = 1
})
