/**
 * TEXTO-1 · EL BANCO DEL BLOQUE DE TEXTO DEL HERO — de dónde sale el alto.
 *
 * ── Qué mide, y por qué NO mide el logo ───────────────────────────────────
 *
 * `scripts-tapado/` ya contesta dónde está la masa negra del logo y qué
 * fracción de la tinta del titular cae encima. Lo que ese banco NO desarma es
 * **el alto del bloque de texto**: publica `bloque.caja.alto` como un número
 * solo. Este banco lo abre pieza por pieza —cuántas líneas ocupa cada registro
 * del titular, cuántas la bajada, cuánto suman los huecos y el relleno— porque
 * la pregunta del sprint es qué achicar, y un total no la contesta.
 *
 * La posición de la masa del logo se toma de `a-verdad-hoy.json`, MEDIDA allá,
 * y no se vuelve a medir acá: es la escena, que este sprint no toca.
 *
 * ── LAS LÍNEAS SE CUENTAN CON UN `Range`, NO CON UNA DIVISIÓN ─────────────
 *
 * `alto / interlineado` da el número correcto sólo mientras el interlineado sea
 * el que uno cree y no haya un margen adentro. `Range.getClientRects()` devuelve
 * **un rectángulo por caja de línea**, que es la cosa que se está contando, y de
 * paso entrega el ancho REAL de cada renglón —el dato que decide si envuelve—.
 * Los `<span>` del titular son ítems de un contenedor flex, o sea cajas de
 * bloque: `el.getClientRects()` sobre ellos devolvería UNO solo y contaría 1
 * línea siempre. Por eso el rango va sobre el CONTENIDO y no sobre el elemento.
 *
 * ── ⚠️ SE MIDE CON LA PESTAÑA VISIBLE, Y LO VERIFICA `enLaVentana` ───────
 *
 * Reusa la apertura de `scripts-tapado/tapado-comun.ts` entera —una pestaña
 * nueva por ancho, métricas puestas antes de navegar, `[data-escena]` esperado y
 * `verificarVentana` que tira— porque la lección de agosto vale igual acá: con
 * la pestaña ocluida `innerWidth` da 0 y todo rectángulo de layout es basura.
 */

import { readFileSync } from 'node:fs'
import path from 'node:path'

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/texto'

/**
 * Las capturas de ESTE banco, en su propia carpeta.
 *
 * No van a `capturas/tapado/`: aquéllas son el ANTES contra el que se compara
 * —`hoy-*` y `centrado-*`, dos estados del árbol— y éstas son simulaciones que
 * nunca estuvieron en el árbol. Mezclarlas haría que «la captura a 375» dejara
 * de identificar un estado.
 */
export const CARPETA_DE_CAPTURAS_DEL_TEXTO = 'docs/rediseno/capturas/texto'

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Renglones {
  /** Cuántas cajas de línea dibuja el contenido. */
  readonly cantidad: number
  /** El ancho del renglón más largo — el que decide si envuelve. */
  readonly anchoMaximo: number
  /** El alto de la primera caja de línea: el interlineado aplicado, medido. */
  readonly altoDeLinea: number
}

export interface Pieza {
  readonly caja: Caja | null
  readonly renglones: Renglones | null
  readonly fontSize: number
  readonly lineHeight: number
  readonly letterSpacing: number
  readonly familia: string
  readonly peso: string
}

export interface Desglose {
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly pantalla: Caja | null
  readonly relleno: { readonly arriba: number; readonly abajo: number }
  readonly justificado: string
  readonly linea1: Pieza
  readonly linea2: Pieza
  readonly titular: Caja | null
  readonly bajada: Pieza
  readonly cta: Pieza
  readonly bloque: Caja | null
  /** Los dos huecos declarados, MEDIDOS entre cajas y no leídos del `gap`. */
  readonly huecos: {
    readonly titularABajada: number
    readonly bajadaACta: number
  }
}

/**
 * EL LECTOR, como expresión de página. Se usa igual desde el desglose y desde el
 * barrido de palancas, así que vive una sola vez.
 *
 * ⚠ `bajada` se busca por `[data-nivel="cuerpo"]` y cae a `p`: es el mismo
 * selector que usa `scripts-tapado/a-verdad.ts`, para que las dos mediciones
 * hablen de la misma pieza.
 */
export const LECTOR = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const h1 = pantalla.querySelector('h1')
  const piezas = h1 === null ? [] : [...h1.children]
  const bajada = pantalla.querySelector('[data-nivel="cuerpo"]') ?? pantalla.querySelector('p')
  const cta = pantalla.querySelector('a')
  const caja = (el) => {
    if (el === null || el === undefined) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, ancho: r.width, alto: r.height }
  }
  const renglones = (el) => {
    if (el === null || el === undefined) return null
    const rango = document.createRange()
    rango.selectNodeContents(el)
    const rects = [...rango.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5)
    if (rects.length === 0) return null
    const topes = [...new Set(rects.map((r) => Math.round(r.top * 100) / 100))]
    return {
      cantidad: topes.length,
      anchoMaximo: Math.max(...rects.map((r) => r.width)),
      altoDeLinea: rects[0].height,
    }
  }
  const pieza = (el) => {
    if (el === null || el === undefined) {
      return { caja: null, renglones: null, fontSize: 0, lineHeight: 0, letterSpacing: 0, familia: 'n/d', peso: 'n/d' }
    }
    const s = getComputedStyle(el)
    return {
      caja: caja(el),
      renglones: renglones(el),
      fontSize: parseFloat(s.fontSize),
      lineHeight: parseFloat(s.lineHeight),
      letterSpacing: parseFloat(s.letterSpacing),
      familia: s.fontFamily,
      peso: s.fontWeight,
    }
  }
  const sp = getComputedStyle(pantalla)
  const todos = [h1, bajada, cta].filter((e) => e !== null && e !== undefined)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
  for (const el of todos) {
    const r = el.getBoundingClientRect()
    if (r.width === 0 || r.height === 0) continue
    x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y)
    x1 = Math.max(x1, r.x + r.width); y1 = Math.max(y1, r.y + r.height)
  }
  const cajaH1 = caja(h1)
  const cajaBajada = caja(bajada)
  const cajaCta = caja(cta)
  return {
    ventana: { ancho: window.innerWidth, alto: window.innerHeight },
    pantalla: caja(pantalla),
    relleno: { arriba: parseFloat(sp.paddingTop), abajo: parseFloat(sp.paddingBottom) },
    justificado: sp.justifyContent,
    linea1: pieza(piezas[0]),
    linea2: pieza(piezas[1]),
    titular: cajaH1,
    bajada: pieza(bajada),
    cta: pieza(cta),
    bloque: Number.isFinite(x0) ? { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 } : null,
    huecos: {
      titularABajada: cajaH1 === null || cajaBajada === null ? 0 : cajaBajada.y - (cajaH1.y + cajaH1.alto),
      bajadaACta: cajaBajada === null || cajaCta === null ? 0 : cajaCta.y - (cajaBajada.y + cajaBajada.alto),
    },
  }
})()`

/** La hoja con la que se prueba una palanca. `!important` por lo mismo que
 *  `tapado-comun.ts`: el árbol de React vuelve a commitear y pisa `style`. */
export const HOJA_DE_PALANCAS = 'texto-palancas'

/**
 * LO QUE MIDIÓ TAPADO-1 SOBRE EL LOGO, leído de su JSON y no transcrito.
 *
 * Devuelve, por ancho, la fila en la que termina la masa grande del logo dentro
 * de la columna del texto. Es **el** dato del que cuelga todo este sprint y no
 * se vuelve a medir: es escena, y la escena no se toca.
 */
export interface FinDeLaMasa {
  readonly ancho: number
  readonly alto: number
  readonly ultimaFila: number
  readonly fraccion: number
  /** Cuánto alto queda entre esa fila y el borde de abajo del viewport. */
  readonly huecoHastaElBorde: number
}

export function finDeLaMasaDelLogo(etiqueta = 'hoy'): readonly FinDeLaMasa[] {
  const ruta = path.join('docs/rediseno/outputs/tapado', `a-verdad-${etiqueta}.json`)
  const crudo = JSON.parse(readFileSync(ruta, 'utf8')) as {
    filas: readonly {
      ancho: number
      alto: number
      bandasDeMasaEnLaColumna: readonly { desde: number; hasta: number; alto: number }[]
    }[]
  }
  return crudo.filas.map((f) => {
    // La masa GRANDE, no las motas: la banda más alta de la columna. Las de 1 a
    // 5 px son partículas sueltas y `s10-logo` ya declara que un punto de 3 px
    // no vuelve ilegible un renglón.
    const mayor = f.bandasDeMasaEnLaColumna.reduce<{ desde: number; hasta: number; alto: number } | null>(
      (a, b) => (a === null || b.alto > a.alto ? b : a),
      null,
    )
    const ultimaFila = mayor === null ? 0 : mayor.hasta
    return {
      ancho: f.ancho,
      alto: f.alto,
      ultimaFila,
      fraccion: Number((ultimaFila / f.alto).toFixed(4)),
      huecoHastaElBorde: f.alto - (ultimaFila + 1),
    }
  })
}

export const dos = (n: number): number => Number(n.toFixed(2))
