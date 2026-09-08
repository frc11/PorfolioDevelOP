/**
 * LOS LECTORES DE LAYOUT — pines, areas de toque, desborde y titular.
 *
 * Separados de `lectores.ts` porque aquel mide MOVIMIENTO y este mide CAJAS, y
 * porque juntos pasaban las 300 lineas que el repo parte. La huella de un
 * elemento la comparten y sale de `huella.ts`, una sola vez.
 */

import { HUELLA } from './huella'

export interface FichaDeSticky {
  readonly huella: string
  readonly top: string
  readonly altoPropio: number
  readonly altoDelPadre: number
  readonly huellaDelPadre: string
  /** `alto del contenedor − alto propio`: el recorrido que el `sticky` PUEDE hacer. */
  readonly recorridoDisponible: number
  readonly ancestroQueRecorta: string | null
}

/**
 * ⚠️ **EL CENSO MIRA AL HIJO Y AL PADRE, Y ÉSA ES TODA LA LECCIÓN DE D2.**
 *
 * Un `sticky` tiene **dos** elementos: el que se pega y el que le da recorrido.
 * `recorridoDisponible = alto del padre − alto propio` es cero cuando el hijo
 * llena a su contenedor, y ahí **no se pega ni un píxel sin que nada esté
 * roto**. Medir sólo la posición del hijo devuelve el mismo cero en los dos
 * casos: el que está roto y el que nunca tuvo recorrido.
 */
export const CENSO_DE_STICKIES = `(() => {
  const huella = ${HUELLA}
  const recorta = (el) => {
    let n = el.parentElement
    while (n !== null && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      if (['auto', 'hidden', 'scroll', 'clip'].includes(cs.overflowY) || ['auto', 'hidden', 'scroll', 'clip'].includes(cs.overflowX)) return huella(n)
      n = n.parentElement
    }
    return null
  }
  return [...document.querySelectorAll('*')]
    .filter((el) => getComputedStyle(el).position === 'sticky')
    .map((el) => {
      const padre = el.parentElement
      const altoPropio = el.getBoundingClientRect().height
      const altoDelPadre = padre === null ? 0 : padre.getBoundingClientRect().height
      return {
        huella: huella(el),
        top: getComputedStyle(el).top,
        altoPropio: Math.round(altoPropio * 100) / 100,
        altoDelPadre: Math.round(altoDelPadre * 100) / 100,
        huellaDelPadre: padre === null ? '(sin padre)' : huella(padre),
        recorridoDisponible: Math.round((altoDelPadre - altoPropio) * 100) / 100,
        ancestroQueRecorta: recorta(el),
      }
    })
})()`

/**
 * Una parada del barrido: para cada `sticky`, si está pegado AHORA.
 *
 * «Pegado» es: su borde superior está en su `top` declarado **y** su padre ya
 * cruzó por encima. Las dos condiciones juntas, porque la primera sola la
 * cumple cualquier elemento que justo pase por ahí.
 */
export const LECTURA_DE_PEGADO = `(() => {
  return [...document.querySelectorAll('*')]
    .filter((el) => getComputedStyle(el).position === 'sticky')
    .map((el) => {
      const cs = getComputedStyle(el)
      const declarado = cs.top === 'auto' ? 0 : parseFloat(cs.top)
      const r = el.getBoundingClientRect()
      const padre = el.parentElement
      const rp = padre === null ? r : padre.getBoundingClientRect()
      return {
        top: Math.round(r.top * 100) / 100,
        pegado: Math.abs(r.top - declarado) < 1 && rp.top < declarado - 1 && rp.bottom > r.top + 1,
      }
    })
})()`

export interface ObjetivoDeToque {
  readonly huella: string
  readonly ancho: number
  readonly alto: number
  readonly texto: string
}

/** Las cajas tocables, contra los 24 × 24 px de WCAG 2.5.8. */
export const CENSO_DE_TOQUE = `(() => {
  const huella = ${HUELLA}
  return [...document.querySelectorAll('a[href], button, input, select, textarea, [role="button"]')]
    .map((el) => {
      const r = el.getBoundingClientRect()
      return {
        huella: huella(el),
        ancho: Math.round(r.width * 100) / 100,
        alto: Math.round(r.height * 100) / 100,
        texto: (el.textContent ?? '').replace(/\\s+/g, ' ').trim().slice(0, 30),
      }
    })
    .filter((o) => o.ancho > 0 && o.alto > 0)
})()`

/** El desborde horizontal, con las tres anchuras que lo discriminan. */
export const LECTURA_DE_DESBORDE = `({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  visualViewport: window.visualViewport === null ? null : Math.round(window.visualViewport.width),
  outerWidth: window.outerWidth,
})`

/** La identidad del `<h1>` del hero — D-B5.2, los dos estados que no se cruzan. */
export const LECTURA_DEL_TITULAR = `(() => {
  const h1 = document.querySelector('h1')
  const div = document.querySelector('[data-panel="hero"] .font-titulo')
  const caja = (el) => {
    if (el === null) return null
    const r = el.getBoundingClientRect()
    return { ancho: Math.round(r.width * 100) / 100, alto: Math.round(r.height * 100) / 100, area: Math.round(r.width * r.height) }
  }
  return {
    h1Clase: h1 === null ? null : h1.getAttribute('class'),
    h1Caja: caja(h1),
    divTitularCaja: caja(div),
  }
})()`

