/**
 * B7 · FRENTE C — LA LUPA DEL DESBORDE. **No es un gate.**
 *
 * ── Por qué vive aparte de `c-tipografia.ts` ──────────────────────────────
 *
 * Porque hace lo contrario que un instrumento del banco, y mezclarlos en un
 * archivo invitaría a confundirlos: `conLaPagina` verifica `innerWidth`,
 * `visibilityState` y que `rAF` corra, y **tira** si algo no da. Con `D7` vivo,
 * esa verificación ERA el defecto —«innerWidth=638, se pidió 375»—, así que por
 * la puerta del banco no se podía mirar qué lo causaba.
 *
 * Esta lupa abre con el MISMO Chrome, el MISMO `setDeviceMetricsOverride` y los
 * MISMOS scripts pre-pintado, y **no verifica nada**. Por eso tampoco afirma
 * nada: devuelve números —`innerWidth`, `docWidth`, y qué elementos se pasan del
 * ancho pedido— para que una persona los lea. La afirmación la hace el gate de
 * `c-tipografia.ts`, que sí usa la receta entera.
 *
 * ⚠️ **Un número de acá no puede cerrar un defecto.** Si aparece en un reporte,
 * aparece como diagnóstico y dice de dónde salió.
 */

import { cerrarChrome, lanzarChrome, perfilDeChrome } from '../scripts-b4/cdp'
import { abrirPagina, cerrarPagina, emular, medir } from '../scripts-b4/navegador'
import type { Perfil } from '../scripts-b4/perfiles'

import { MARCA_DE_INTRO, ORIGEN, PUENTE_DE_AUTOMATIZACION } from './b7-comun'

const ANTES = [MARCA_DE_INTRO, PUENTE_DE_AUTOMATIZACION]

/**
 * Un elemento «desborda» si su borde derecho pasa del viewport, **o** si su
 * contenido pide más ancho del que su caja tiene. La segunda mitad es la que
 * encuentra al culpable real: el `<p>` del alfabeto no se pasa del viewport
 * —está adentro de una caja de 311 px— pero pide 606, y es eso lo que empuja el
 * viewport de layout hacia afuera.
 */
const LECTOR_DE_DESBORDE = `(() => {
  const w = window.innerWidth
  const culpables = []
  for (const el of document.querySelectorAll('*')) {
    const r = el.getBoundingClientRect()
    if (r.width <= 0) continue
    const desborda = Math.round(r.right) > w + 1 || Math.round(el.scrollWidth) > Math.round(r.width) + 1
    if (!desborda) continue
    culpables.push({
      etiqueta: el.tagName.toLowerCase(),
      muestra: el.getAttribute('data-muestra') ?? el.getAttribute('data-muestra-minusculas') ?? '',
      clase: String(el.className).slice(0, 70),
      derecha: Math.round(r.right),
      ancho: Math.round(r.width),
      scrollWidth: Math.round(el.scrollWidth),
      overflowX: getComputedStyle(el).overflowX,
      texto: (el.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 34),
    })
  }
  return {
    innerWidth: w,
    outerWidth: window.outerWidth,
    visualWidth: window.visualViewport === null ? -1 : Math.round(window.visualViewport.width),
    docWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    culpables: culpables.sort((a, b) => b.derecha - a.derecha).slice(0, 14),
  }
})()`

export interface Desborde {
  readonly innerWidth: number
  readonly outerWidth: number
  readonly visualWidth: number
  readonly docWidth: number
  readonly bodyWidth: number
  readonly culpables: readonly Record<string, string | number>[]
}

/** ⚠️ Abre igual que la receta pero NO verifica. Ver el docblock del archivo. */
export async function diagnosticarElDesborde(perfil: Perfil, ruta: string): Promise<Desborde> {
  const chrome = await lanzarChrome({
    perfil: perfilDeChrome('b7-c'),
    ancho: perfil.ancho,
    alto: perfil.alto + 120,
    limpiarPerfil: false,
  })
  try {
    const pagina = await abrirPagina(chrome)
    try {
      await emular(pagina, perfil, {})
      for (const fuente of ANTES) {
        await pagina.conexion.enviar(
          'Page.addScriptToEvaluateOnNewDocument',
          { source: fuente },
          pagina.sessionId,
        )
      }
      const cargada = new Promise<void>((resolver) => {
        pagina.conexion.al('Page.loadEventFired', () => resolver())
      })
      await pagina.conexion.enviar('Page.navigate', { url: `${ORIGEN}${ruta}` }, pagina.sessionId)
      await Promise.race([cargada, new Promise((r) => setTimeout(r, 90_000))])
      await medir(pagina, '(async () => { await new Promise((r) => setTimeout(r, 1200)); return true })()')
      return await medir<Desborde>(pagina, LECTOR_DE_DESBORDE)
    } finally {
      await cerrarPagina(pagina)
    }
  } finally {
    await cerrarChrome(chrome)
    await new Promise((r) => setTimeout(r, 900))
  }
}
