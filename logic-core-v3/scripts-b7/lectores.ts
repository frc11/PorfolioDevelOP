/**
 * LOS FUENTES QUE CORREN ADENTRO DE LA PÁGINA — uno por pregunta.
 *
 * Viven acá y no pegados en cada instrumento por la razón de siempre: dos
 * definiciones de «qué es una transformada» o de «qué es estar pegado» producen
 * dos cifras que no se pueden comparar, y la comparación es todo el bloque.
 *
 * Son cadenas y no funciones porque cruzan al proceso del navegador por
 * `Runtime.evaluate`. La firma de lo que devuelven está declarada al lado, en
 * TypeScript, para que el consumidor no adivine.
 */

import { HUELLA } from './huella'

export interface CensoDeMovimiento {
  readonly matchMedia: boolean
  /** Elementos con `style="…transform…"` ESCRITO EN LÍNEA. La cifra de B4-B. */
  readonly transformadasEnLinea: number
  /** Elementos con `will-change` en línea: la promoción de capa del sistema. */
  readonly willChangeEnLinea: number
  /** Piezas de texto partido — el divisor de líneas. */
  readonly piezasDeLinea: number
  /** Elementos con `opacity` escrita en línea, y cuántas de ellas valen 0. */
  readonly opacidadesEnLinea: number
  readonly opacidadesEnCero: number
  /** El árbol entero, para saber si «menos transformadas» es «menos página». */
  readonly elementos: number
  readonly paneles: number
  readonly encabezados: number
  /** Los caracteres de texto visible del documento. La prueba de que el contenido está. */
  readonly caracteresVisibles: number
  /** Nodos de texto con caja que quedaron en opacidad efectiva 0. */
  readonly textoInvisiblePorOpacidad: number
  readonly ejemplosInvisibles: readonly string[]
}

/**
 * ⚠️ **EL CONTENIDO, NO SÓLO LA AUSENCIA DE MOVIMIENTO.**
 *
 * Un patrón que no se monta puede dejar su elemento en `opacity: 0` para
 * siempre, y «cero transformadas» sería verde con la página en blanco. Por eso
 * este censo cuenta las dos cosas en la misma pasada: lo que el sistema
 * escribió, y **cuánto texto queda efectivamente visible**.
 *
 * La opacidad efectiva se acumula por la cadena de ancestros —una opacidad de 0
 * en un padre apaga al hijo aunque el hijo diga 1— y el texto se cuenta sólo si
 * tiene caja y no está recortado por `clip-path`, que es el filtro que B5 dejó
 * escrito para no contar los `sr-only`.
 */
export const CENSO_DE_MOVIMIENTO = `(() => {
  const huella = ${HUELLA}
  const todos = [...document.querySelectorAll('*')]
  const enLinea = (el, prop) => (el.getAttribute('style') ?? '').includes(prop)
  const opacidadEfectiva = (el) => {
    let n = el, o = 1
    while (n !== null && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      o *= Number(cs.opacity)
      if (cs.visibility === 'hidden' || cs.display === 'none') return 0
      n = n.parentElement
    }
    return o
  }
  const recortado = (el) => {
    let n = el
    while (n !== null && n !== document.documentElement) {
      if (getComputedStyle(n).clipPath !== 'none') return true
      n = n.parentElement
    }
    return false
  }
  let caracteres = 0
  let invisibles = 0
  const ejemplos = []
  const anda = (nodo) => {
    for (const n of nodo.childNodes) {
      if (n.nodeType === 3 && n.nodeValue.trim().length > 0) {
        const padre = n.parentElement
        if (padre === null || recortado(padre)) continue
        const r = document.createRange()
        r.selectNodeContents(n)
        const caja = r.getBoundingClientRect()
        if (caja.width <= 0 || caja.height <= 0) continue
        if (opacidadEfectiva(padre) < 0.01) {
          invisibles += 1
          if (ejemplos.length < 12) ejemplos.push(huella(padre) + ' :: ' + n.nodeValue.trim().slice(0, 40))
        } else {
          caracteres += n.nodeValue.trim().length
        }
      } else if (n.nodeType === 1) anda(n)
    }
  }
  anda(document.body)
  const opacidades = todos.filter((el) => enLinea(el, 'opacity'))
  return {
    matchMedia: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    transformadasEnLinea: todos.filter((el) => enLinea(el, 'transform')).length,
    willChangeEnLinea: todos.filter((el) => enLinea(el, 'will-change')).length,
    piezasDeLinea: document.querySelectorAll('[data-lineas-piezas]').length,
    opacidadesEnLinea: opacidades.length,
    opacidadesEnCero: opacidades.filter((el) => Number(getComputedStyle(el).opacity) < 0.01).length,
    elementos: todos.length,
    paneles: document.querySelectorAll('[data-panel]').length,
    encabezados: document.querySelectorAll('h1,h2,h3,h4,h5,h6').length,
    caracteresVisibles: caracteres,
    textoInvisiblePorOpacidad: invisibles,
    ejemplosInvisibles: ejemplos,
  }
})()`

export interface CensoBarrido {
  readonly matchMedia: boolean
  /**
   * ⚠️ **LA DEFINICIÓN ES LA DE B4-B, LITERAL, Y POR ESO SE PUEDE COMPARAR.**
   * `c-reducido-discriminador.ts` **acumula** la cuenta de elementos con
   * `transform` en el atributo `style` en cada parada de un barrido de media
   * pantalla. No es una foto: es una suma sobre el documento entero. Un censo
   * en `scrollY = 0` da 70 y no 2.380, y comparar los dos sería comparar dos
   * cosas distintas.
   */
  readonly conTransform: number
  readonly piezasDeLineas: number
  readonly paradas: number
  /** El contenido, en la MISMA pasada: caracteres de texto con caja y opacidad. */
  readonly caracteresVisibles: number
  readonly caracteresInvisibles: number
  readonly nodosInvisibles: number
  readonly ejemplosInvisibles: readonly string[]
}

/**
 * ⚠️ **EL BARRIDO CUENTA LAS DOS MITADES A LA VEZ, Y ESO NO ES COMODIDAD.**
 *
 * «Con la preferencia no hay transformadas» pasa en verde con la página en
 * blanco. La única forma de que la afirmación signifique algo es que el mismo
 * recorrido que cuenta las transformadas cuente **cuánto texto queda
 * legible** — y que un nodo de texto con caja y opacidad efectiva cero se
 * cuente como INVISIBLE, no como ausente.
 *
 * Un texto se cuenta una sola vez por documento (se marca el nodo), así que
 * `caracteresVisibles` es el contenido del sitio y no la suma de las paradas.
 */
export const CENSO_BARRIDO = `(async () => {
  const huella = ${HUELLA}
  const raf2 = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
  const opacidadEfectiva = (el) => {
    let n = el, o = 1
    while (n !== null && n !== document.documentElement) {
      const cs = getComputedStyle(n)
      o *= Number(cs.opacity)
      if (cs.visibility === 'hidden' || cs.display === 'none') return 0
      n = n.parentElement
    }
    return o
  }
  const recortado = (el) => {
    let n = el
    while (n !== null && n !== document.documentElement) {
      if (getComputedStyle(n).clipPath !== 'none') return true
      n = n.parentElement
    }
    return false
  }
  const vistos = new Set()
  const invisibles = new Map()
  let visibles = 0
  const ejemplos = []
  const anda = (nodo) => {
    for (const n of nodo.childNodes) {
      if (n.nodeType === 3 && n.nodeValue.trim().length > 0) {
        const padre = n.parentElement
        if (padre === null || recortado(padre)) continue
        const r = document.createRange()
        r.selectNodeContents(n)
        const caja = r.getBoundingClientRect()
        if (caja.width <= 0 || caja.height <= 0) continue
        const largo = n.nodeValue.trim().length
        if (opacidadEfectiva(padre) >= 0.01) {
          if (!vistos.has(n)) { vistos.add(n); visibles += largo; invisibles.delete(n) }
        } else if (!vistos.has(n) && !invisibles.has(n)) {
          invisibles.set(n, largo)
        }
      } else if (n.nodeType === 1) anda(n)
    }
  }
  const paso = Math.round(window.innerHeight / 2)
  const fin = document.documentElement.scrollHeight - window.innerHeight
  let conTransform = 0
  let paradas = 0
  for (let y = 0; y <= fin; y += paso) {
    window.scrollTo(0, y)
    await raf2()
    await dormir(200)
    paradas += 1
    for (const el of document.querySelectorAll('*')) {
      const s = el.getAttribute('style')
      if (s !== null && s.includes('transform')) conTransform += 1
    }
    anda(document.body)
  }
  window.scrollTo(0, 0)
  await raf2()
  let invisiblesChars = 0
  for (const [n, largo] of invisibles) {
    invisiblesChars += largo
    if (ejemplos.length < 12) ejemplos.push(huella(n.parentElement) + ' :: ' + n.nodeValue.trim().slice(0, 40))
  }
  return {
    matchMedia: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    conTransform,
    piezasDeLineas: document.querySelectorAll('[data-lineas-piezas]').length,
    paradas,
    caracteresVisibles: visibles,
    caracteresInvisibles: invisiblesChars,
    nodosInvisibles: invisibles.size,
    ejemplosInvisibles: ejemplos,
  }
})()`
