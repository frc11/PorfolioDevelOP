/**
 * COMPO-2 · EL BANCO DE LOS CINCO AJUSTES — la columna entera, pieza por pieza.
 *
 * ── Qué mide que los tres bancos anteriores NO miden ──────────────────────
 *
 * `scripts-texto/texto-comun.ts` abre el BLOQUE DE TEXTO (titular + bajada +
 * CTA) y por eso su `bloque` deja afuera la marca, que vive arriba del `h1`.
 * `scripts-papel/d-alto.ts` sí mide la columna entera, pero publica cada pieza
 * como un rectángulo y **no cuenta sus renglones**, que es justamente la
 * pregunta de la regla global de este sprint —«¿la bajada entra en UN renglón?»—
 * y la del §4 —«¿el registro 1 sigue en DOS?»—.
 *
 * Acá van las dos cosas juntas: la columna de la primera pieza dibujada a la
 * última, y cada pieza con sus cajas de línea contadas con un `Range` sobre los
 * NODOS DE TEXTO (la corrección de COMPO-1: un rango sobre el contenido de un
 * elemento con hijos devuelve además la caja de borde de cada hijo).
 *
 * ── ⚠️ SE MIDE LO QUE SE DIBUJA ──────────────────────────────────────────
 *
 * La marca está en el HTML de los ocho anchos y se ve en dos: de 390 para arriba
 * es `display:none` y su rectángulo devuelve ceros. La columna se arma con las
 * piezas cuyo rectángulo TIENE alto, que es la definición de «lo que se dibuja».
 * En los anchos sin marca la cuenta tiene que dar el bloque de texto y nada más,
 * y eso es una comprobación y no un supuesto.
 *
 * ── ⚠️ LA PESTAÑA, VISIBLE ───────────────────────────────────────────────
 *
 * Se reusa entera la apertura de `scripts-tapado/tapado-comun.ts` —una pestaña
 * nueva por ancho, métricas antes de navegar, `[data-escena]` esperado y
 * `verificarVentana` que TIRA— por la lección de agosto: con la pestaña ocluida
 * `innerWidth` da 0 y todo rectángulo de layout es basura.
 */

export const RAIZ_DE_SALIDAS = 'docs/rediseno/outputs/compo2'
export const CARPETA_DE_CAPTURAS = 'docs/rediseno/capturas/compo2'

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
  readonly clave: string
  readonly caja: Caja | null
  readonly renglones: Renglones | null
  readonly fontSize: number
  readonly lineHeight: number
  readonly familia: string
  readonly peso: string
}

export interface Lectura {
  readonly ventana: { readonly ancho: number; readonly alto: number }
  readonly pantalla: Caja | null
  readonly relleno: { readonly arriba: number; readonly abajo: number }
  readonly justificado: string
  readonly piezas: readonly Pieza[]
  /** La unión de TODO lo que se dibuja, marca incluida. */
  readonly columna: Caja | null
  /** Sólo titular + bajada + CTA: lo comparable con los bancos de TEXTO. */
  readonly bloqueDeTexto: Caja | null
  /** El ancho de la CELDA del titular y el de la de la bajada. */
  readonly celdaDelTitular: number
  readonly celdaDeLaBajada: number
  readonly pastillaVisible: boolean
  readonly fondoDelPanel: string
}

/**
 * EL LECTOR, como expresión de página.
 *
 * Las piezas se buscan por `data-*`, por rol o por posición estructural adentro
 * del `h1`, nunca por clase de Tailwind: una clase cambia con el sprint y un
 * `data-pieza` es un handle. Los dos registros del titular son los dos hijos
 * ELEMENTO del `h1` —el envoltorio del registro 1 y el canal del registro 2—,
 * que es el mismo criterio que `scripts-texto/texto-comun.ts` ya usa.
 */
export const LECTOR = `(() => {
  const pantalla = document.querySelector('[data-pantalla="hero"]')
  if (pantalla === null) return null
  const panel = pantalla.closest('[data-panel]') ?? pantalla
  const h1 = pantalla.querySelector('h1')
  const hijosDelH1 = h1 === null ? [] : [...h1.children]
  const envoltorioR1 = hijosDelH1[0] ?? null
  const registro2 = hijosDelH1[1] ?? null
  const filasDelR1 = envoltorioR1 === null ? [] : [...envoltorioR1.children]
  const bajada = pantalla.querySelector('[data-nivel="base"]') ?? pantalla.querySelector('[data-nivel="cuerpo"]') ?? pantalla.querySelector('p')
  const cta = pantalla.querySelector('a')
  const nav = document.querySelector('[data-parte="pastilla"]')

  const caja = (el) => {
    if (el === null || el === undefined) return null
    const r = el.getBoundingClientRect()
    return { x: r.x, y: r.y, ancho: r.width, alto: r.height }
  }
  const renglones = (el) => {
    if (el === null || el === undefined) return null
    const caminante = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
    const rects = []
    for (let n = caminante.nextNode(); n !== null; n = caminante.nextNode()) {
      if ((n.textContent ?? '').trim() === '') continue
      const rango = document.createRange()
      rango.selectNodeContents(n)
      for (const r of rango.getClientRects()) if (r.width > 0.5 && r.height > 0.5) rects.push(r)
    }
    if (rects.length === 0) return null
    const topes = [...new Set(rects.map((r) => Math.round(r.top * 100) / 100))]
    return { cantidad: topes.length, anchoMaximo: Math.max(...rects.map((r) => r.width)), altoDeLinea: rects[0].height }
  }
  const pieza = (clave, el) => {
    if (el === null || el === undefined) {
      return { clave, caja: null, renglones: null, fontSize: 0, lineHeight: 0, familia: 'n/d', peso: 'n/d' }
    }
    const s = getComputedStyle(el)
    return {
      clave,
      caja: caja(el),
      renglones: renglones(el),
      fontSize: parseFloat(s.fontSize),
      lineHeight: parseFloat(s.lineHeight),
      familia: s.fontFamily,
      peso: s.fontWeight,
    }
  }

  const piezas = [
    pieza('logotipo', pantalla.querySelector('[data-pieza="logotipo"]')),
    pieza('isotipo', pantalla.querySelector('[data-pieza="isotipo"]')),
    pieza('registro1', envoltorioR1),
    pieza('fila1', filasDelR1[0] ?? null),
    pieza('fila2', filasDelR1[1] ?? null),
    pieza('registro2', registro2),
    pieza('titular', h1),
    pieza('bajada', bajada),
    pieza('cta', cta),
  ]

  const unir = (claves) => {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity
    for (const p of piezas) {
      if (!claves.includes(p.clave)) continue
      if (p.caja === null || p.caja.alto <= 0.5 || p.caja.ancho <= 0.5) continue
      x0 = Math.min(x0, p.caja.x); y0 = Math.min(y0, p.caja.y)
      x1 = Math.max(x1, p.caja.x + p.caja.ancho); y1 = Math.max(y1, p.caja.y + p.caja.alto)
    }
    return Number.isFinite(x0) ? { x: x0, y: y0, ancho: x1 - x0, alto: y1 - y0 } : null
  }

  const sp = getComputedStyle(pantalla)
  const celda = (el) => (el === null || el === undefined ? 0 : el.getBoundingClientRect().width)
  return {
    ventana: { ancho: window.innerWidth, alto: window.innerHeight },
    pantalla: caja(pantalla),
    relleno: { arriba: parseFloat(sp.paddingTop), abajo: parseFloat(sp.paddingBottom) },
    justificado: sp.justifyContent,
    piezas,
    columna: unir(['logotipo', 'isotipo', 'titular', 'bajada', 'cta']),
    bloqueDeTexto: unir(['titular', 'bajada', 'cta']),
    celdaDelTitular: celda(h1 === null ? null : h1.parentElement),
    celdaDeLaBajada: celda(bajada === null ? null : bajada.parentElement),
    pastillaVisible: nav !== null && nav.getBoundingClientRect().height > 0.5,
    fondoDelPanel: getComputedStyle(panel).backgroundColor,
  }
})()`

/** La hoja con la que se prueba una configuración simulada. `!important` por lo
 *  mismo que `tapado-comun.ts`: el árbol de React vuelve a commitear y pisa
 *  cualquier `style` inline. */
export const HOJA_DE_CONFIGURACION = 'compo2-configuracion'

export function PONER_CONFIGURACION(regla: string): string {
  return `(async () => {
  const id = ${JSON.stringify(HOJA_DE_CONFIGURACION)}
  let hoja = document.getElementById(id)
  if (hoja === null) { hoja = document.createElement('style'); hoja.id = id; document.head.appendChild(hoja) }
  hoja.textContent = ${JSON.stringify(regla)}
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return true
})()`
}

/** Los selectores de las piezas que las simulaciones mueven. Escritos una vez:
 *  una simulación que apunta a otra pieza no simula el cambio. */
export const SEL = {
  pantalla: '[data-pantalla="hero"]',
  registro1: '[data-pantalla="hero"] h1 > span:first-child',
  registro2: '[data-pantalla="hero"] h1 > span:last-child',
  bajada: '[data-pantalla="hero"] [data-nivel="base"]',
  isotipo: '[data-pantalla="hero"] [data-pieza="isotipo"]',
  logotipo: '[data-pantalla="hero"] [data-pieza="logotipo"]',
} as const

export const dos = (n: number): number => Number(n.toFixed(2))
export const cuatro = (n: number): number => Number(n.toFixed(4))
