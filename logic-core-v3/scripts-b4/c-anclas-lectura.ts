/**
 * FRENTE C · 1-bis — LO QUE `c-anclas.ts` LEE ADENTRO DE LA PÁGINA.
 *
 * Vive aparte porque `c-anclas.ts` cruzaba las 300 líneas del repo, y el corte
 * es por naturaleza: allá está el manejo del navegador —clickear, esperar,
 * capturar—, acá el código que corre DENTRO del documento y los tipos de lo que
 * devuelve. Ninguna de las dos mitades comparte estado con la otra.
 */

import type { Caja } from './c-comun'
import { medir, type Pagina } from './navegador'

export interface Contenido {
  readonly descripcion: string
  /** La caja del ELEMENTO. Ver la advertencia de abajo: puede ser mucho más alta que la tinta. */
  readonly caja: Caja
  /** La caja de texto de la primera línea, por `Range.getClientRects()`: es la caja de la FUENTE (ascenso+descenso), no el glifo. */
  readonly tinta: Caja
  /** La caja del GLIFO dentro de esa línea, por `TextMetrics`. Es la que decide el solape. */
  readonly glifo: Caja
  readonly metricas: { readonly font: string; readonly ascensoDeLaFuente: number; readonly ascensoDelGlifo: number; readonly descensoDelGlifo: number }
  readonly opacidadEfectiva: number
  readonly transform: string
}

export interface LecturaDelAncla {
  readonly clickeado: boolean
  readonly hash: string
  readonly elDestinoEsElPanel: boolean
  readonly panel: Caja
  readonly pastilla: Caja | null
  readonly posicionDeLaPastilla: string
  readonly contenido: Contenido | null
  readonly candidatosDescartados: number
  readonly ventana: number
  readonly scrollY: number
  readonly scrollPaddingTop: string
  readonly scrollBehavior: string
}

/**
 * La lectura, adentro de la página. Devuelve TODO de una: la caja del panel, la
 * de la pastilla y la del primer contenido con tinta, en el mismo cuadro. Tres
 * llamadas separadas podrían leer tres cuadros distintos y el solape saldría de
 * una composición que nunca existió.
 */
export function fuenteDeLaLectura(id: string): string {
  return `(() => {
    const caja = (el) => {
      const r = el.getBoundingClientRect()
      return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, ancho: r.width, alto: r.height }
    }
    /**
     * ⚠️ EL GLIFO, NO LA CAJA DE LA FUENTE. \`Range.getClientRects()\` devuelve la
     * caja tipográfica (ascenso + descenso de la fuente), que para un dígito de
     * 10 px es 12 px de alto y sobresale por arriba de la letra. La caja del
     * glifo se saca de \`TextMetrics\`: \`fontBoundingBoxAscent\` ubica la línea de
     * base dentro de la caja y \`actualBoundingBoxAscent\` dice dónde arranca la
     * tinta. Es medición de texto en 2D, no lectura del búfer de WebGL.
     */
    const lienzo = document.createElement('canvas').getContext('2d')
    const metricasDelGlifo = (fuente, texto) => {
      lienzo.font = fuente
      const m = lienzo.measureText(texto)
      return {
        ascensoDeLaFuente: m.fontBoundingBoxAscent,
        ascensoDelGlifo: m.actualBoundingBoxAscent,
        descensoDelGlifo: m.actualBoundingBoxDescent,
      }
    }
    const panel = document.querySelector('[data-panel="${id}"]')
    const destino = document.getElementById('${id}')
    const nav = document.querySelector('nav[data-parte="pastilla"]')
    /**
     * ⚠️ LA TINTA, NO LA CAJA. Un ítem de grilla se estira a la fila entera
     * (\`align-items: stretch\`), así que el <p> del número de sección mide la
     * sección ENTERA y su \`top\` no dice dónde está la letra. Es la misma
     * distinción que B1 pagó midiendo contraste: la caja del renglón contra el
     * glifo. \`Range.getClientRects()\` sobre los nodos de texto propios
     * devuelve las líneas reales.
     */
    const primeraLinea = (el) => {
      let mejor = null
      for (const n of el.childNodes) {
        if (n.nodeType !== 3 || n.nodeValue.trim().length === 0) continue
        const rango = document.createRange()
        rango.selectNodeContents(n)
        for (const r of rango.getClientRects()) {
          if (r.width <= 0 || r.height <= 0) continue
          if (mejor === null || r.top < mejor.top) mejor = r
        }
        rango.detach()
      }
      return mejor
    }
    let descartados = 0
    let mejor = null
    for (const el of panel.querySelectorAll('*')) {
      let propio = ''
      for (const n of el.childNodes) if (n.nodeType === 3) propio += n.nodeValue
      if (propio.trim().length === 0) continue
      const r = el.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0 || r.bottom <= 0) { descartados += 1; continue }
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none') { descartados += 1; continue }
      let opacidad = 1
      let n = el
      while (n !== null && n !== panel.parentElement) {
        opacidad *= Number(getComputedStyle(n).opacity)
        n = n.parentElement
      }
      if (!(opacidad > 0.01)) { descartados += 1; continue }
      const linea = primeraLinea(el)
      if (linea === null || linea.bottom <= 0) { descartados += 1; continue }
      const fuente = cs.font !== '' ? cs.font : cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontFamily
      const m = metricasDelGlifo(fuente, propio.trim())
      const glifoTop = linea.top + (m.ascensoDeLaFuente - m.ascensoDelGlifo)
      const glifoBottom = linea.top + m.ascensoDeLaFuente + m.descensoDelGlifo
      if (mejor === null || glifoTop < mejor.glifo.top) {
        mejor = {
          descripcion: el.tagName.toLowerCase() + ' · ' + propio.trim().slice(0, 48),
          caja: caja(el),
          tinta: { top: linea.top, bottom: linea.bottom, left: linea.left, right: linea.right, ancho: linea.width, alto: linea.height },
          glifo: { top: glifoTop, bottom: glifoBottom, left: linea.left, right: linea.right, ancho: linea.width, alto: glifoBottom - glifoTop },
          metricas: { font: cs.font, ascensoDeLaFuente: m.ascensoDeLaFuente, ascensoDelGlifo: m.ascensoDelGlifo, descensoDelGlifo: m.descensoDelGlifo },
          opacidadEfectiva: Math.round(opacidad * 1000) / 1000,
          transform: cs.transform,
        }
      }
    }
    return {
      clickeado: true,
      hash: location.hash,
      elDestinoEsElPanel: destino === panel,
      panel: caja(panel),
      pastilla: nav === null ? null : caja(nav),
      posicionDeLaPastilla: nav === null ? '(no hay pastilla)' : getComputedStyle(nav).position,
      contenido: mejor,
      candidatosDescartados: descartados,
      ventana: window.innerHeight,
      scrollY: window.scrollY,
      scrollPaddingTop: getComputedStyle(document.documentElement).scrollPaddingTop,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }
  })()`
}

/**
 * ⚠️ EL DOCUMENTO EN TRES MOMENTOS — la sonda que una corrida obligó a agregar.
 *
 * Dos aterrizajes a 1920 dieron `top` de 1.230 y de −1.174 px donde la corrida
 * anterior había dado 72, con el mismo script: el documento **cambia de alto
 * entre el click y la lectura**, así que el navegador salta a una posición que
 * después deja de ser la correcta. Sin estas tres fotos, eso se publica como
 * «el `scroll-padding-top` falla», que es otra cosa.
 */
export interface FotoDelDocumento {
  readonly momento: string
  readonly alturaDelDocumento: number
  readonly topsEnElDocumento: Readonly<Record<string, number>>
}

export const FOTO_DEL_DOCUMENTO = `(() => {
  const tops = {}
  for (const el of document.querySelectorAll('[data-panel]')) tops[el.dataset.panel] = el.getBoundingClientRect().top + window.scrollY
  return { alturaDelDocumento: document.documentElement.scrollHeight, topsEnElDocumento: tops }
})()`

export async function foto(p: Pagina, momento: string): Promise<FotoDelDocumento> {
  const f = await medir<Omit<FotoDelDocumento, 'momento'>>(p, FOTO_DEL_DOCUMENTO)
  return { momento, ...f }
}
