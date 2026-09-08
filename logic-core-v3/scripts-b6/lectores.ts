/**
 * LOS LECTORES DE B6-A — lo que corre ADENTRO de la página.
 *
 * Cadenas de JavaScript que `Runtime.evaluate` ejecuta en el documento. Viven
 * separadas de lo que decide y compara (`c-las-seis.ts`, `d-velo.ts`) por la
 * misma razón que `scripts-b5/vitales-lectores.ts`: lo que se ejecuta en el
 * navegador y lo que se lee para juzgar son dos cosas.
 *
 * ── ⚠️ TODA CAJA DE TEXTO, NO UNA MUESTRA ──────────────────────────────────
 *
 * La instrucción pide medir CADA bloque de texto de cada sección, y el pie es la
 * sección con más superficie de texto del sitio. El lector no busca selectores
 * conocidos: recorre la raíz entera y saca UN bloque por elemento que tenga
 * nodos de texto propios. Un instrumento que mira sólo lo que el sistema marcó
 * no ve lo que el sistema no marcó, que es justo donde vive un defecto
 * (`s10-acceso-color.ts` lo aprendió con el `<p>` de ayuda del formulario).
 *
 * Y el placeholder de un campo también es texto pintado: entra como bloque.
 *
 * ── Apagar la TINTA, no el elemento ───────────────────────────────────────
 *
 * Para fotografiar el fondo detrás del texto B5 escondía el titular con
 * `visibility: hidden`. Acá no alcanza: un campo del formulario tiene su propio
 * fondo, y esconder el campo esconde también ese fondo — el contraste saldría
 * contra la escena y no contra la caja donde el texto vive. Así que la captura
 * de fondo apaga la TINTA (`color: transparent`) y deja todo lo demás pintado.
 *
 * ── Las raíces son una expresión ──────────────────────────────────────────
 *
 * Los lectores reciben la RAÍZ como expresión de JavaScript y no como id de
 * panel, para que el mismo lector que mide nuestras ocho mida el panel de la
 * referencia sin copiarle un selector: allá la raíz es un elemento que el
 * inventario marcó con un atributo nuestro.
 */

export const ATRIBUTO_DE_BLOQUE = 'data-b6-bloque'
export const ATRIBUTO_DE_CAMPO = 'data-b6-campo'
const ID_DEL_ESTILO = 'b6-sin-tinta'

export interface CajaDeBloque {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface Bloque {
  readonly n: number
  readonly etiqueta: string
  readonly pieza: string | null
  readonly nivel: string | null
  readonly texto: string
  readonly cajas: readonly CajaDeBloque[]
  /** El color computado del texto, en sRGB 0–255. */
  readonly tinta: readonly [number, number, number]
  /** La alfa del propio `color`, si es un `rgba()`. */
  readonly alfaDeColor: number
  /** El producto de los `opacity` del elemento y sus ancestros. */
  readonly opacidad: number
  readonly tamanoPx: number
  readonly peso: number
  /** Texto grande según WCAG: ≥ 24 px, o ≥ 18,66 px en negrita. */
  readonly grande: boolean
  /** Alguna de sus cajas toca el viewport. */
  readonly enCuadro: boolean
}

/** La expresión de las raíces de un panel nuestro: el panel, y el `<footer>` si vive afuera del Cierre. */
export function raicesDelPanel(idPanel: string): string {
  return `(() => {
    const panel = document.querySelector('[data-panel=' + ${JSON.stringify(JSON.stringify(idPanel))} + ']')
    if (panel === null) throw new Error('no existe el panel ' + ${JSON.stringify(idPanel)})
    const raices = [panel]
    if (${JSON.stringify(idPanel)} === 'cierre') {
      const pie = document.querySelector('footer')
      if (pie !== null && !panel.contains(pie)) raices.push(pie)
    }
    return raices
  })()`
}

/**
 * Lee TODOS los bloques de texto bajo unas raíces, marcándolos con
 * `data-b6-bloque` para poder apagarles la tinta después. Salta lo recortado
 * con `clip-path` (sr-only), igual que `lectorDeCajasDeTexto` de B5.
 */
export function LECTOR_DE_BLOQUES_EN(expresionDeRaices: string): string {
  return `(() => {
  const raices = ${expresionDeRaices}
  const recortado = (el) => {
    let n = el
    while (n !== null && n !== document.documentElement) {
      if (getComputedStyle(n).clipPath !== 'none') return true
      n = n.parentElement
    }
    return false
  }
  const opacidadEfectiva = (el) => {
    let o = 1
    let n = el
    while (n !== null && n !== document.documentElement) {
      o *= parseFloat(getComputedStyle(n).opacity)
      n = n.parentElement
    }
    return o
  }
  const canales = (color) => (color.match(/-?[0-9.]+/g) || ['0', '0', '0']).map(Number)
  const enCuadro = (cajas) => cajas.some((c) => c.y < innerHeight && c.y + c.alto > 0 && c.x < innerWidth && c.x + c.ancho > 0)
  const bloques = []
  let n = 0
  const armar = (el, cajas, etiqueta, texto, cs) => {
    const rgb = canales(cs.color)
    const fs = parseFloat(cs.fontSize)
    const fw = parseInt(cs.fontWeight, 10) || 400
    const pieza = el.closest('[data-pieza]')
    const nivel = el.closest('[data-nivel]')
    return {
      n, etiqueta,
      pieza: pieza === null ? null : pieza.getAttribute('data-pieza'),
      nivel: nivel === null ? null : nivel.getAttribute('data-nivel'),
      texto: texto.replace(/\\s+/g, ' ').trim().slice(0, 50),
      cajas,
      tinta: [rgb[0], rgb[1], rgb[2]],
      alfaDeColor: rgb.length > 3 ? rgb[3] : 1,
      opacidad: opacidadEfectiva(el),
      tamanoPx: fs, peso: fw,
      grande: fs >= 24 || (fs >= 18.66 && fw >= 700),
      enCuadro: enCuadro(cajas),
    }
  }
  const visitar = (el) => {
    const propios = [...el.childNodes].filter((c) => c.nodeType === 3 && c.nodeValue.trim().length > 0)
    if (propios.length > 0 && !recortado(el)) {
      const cajas = []
      for (const t of propios) {
        const r = document.createRange()
        r.selectNodeContents(t)
        for (const c of r.getClientRects()) {
          if (c.width > 0 && c.height > 0) cajas.push({ x: c.left, y: c.top, ancho: c.width, alto: c.height })
        }
      }
      if (cajas.length > 0) {
        el.setAttribute(${JSON.stringify(ATRIBUTO_DE_BLOQUE)}, String(n))
        bloques.push(armar(el, cajas, el.tagName.toLowerCase(), propios.map((t) => t.nodeValue).join(' '), getComputedStyle(el)))
        n += 1
      }
    }
    for (const h of el.children) visitar(h)
  }
  for (const raiz of raices) visitar(raiz)
  for (const raiz of raices) {
    for (const campo of raiz.querySelectorAll('input, textarea')) {
      if (!campo.placeholder || campo.value !== '') continue
      const r = campo.getBoundingClientRect()
      if (r.width <= 0 || r.height <= 0) continue
      campo.setAttribute(${JSON.stringify(ATRIBUTO_DE_CAMPO)}, String(n))
      const cs = getComputedStyle(campo, '::placeholder')
      const caja = { x: r.left, y: r.top, ancho: r.width, alto: r.height }
      bloques.push(armar(campo, [caja], campo.tagName.toLowerCase() + '::placeholder', campo.placeholder, cs))
      n += 1
    }
  }
  return bloques
})()`
}

export function LECTOR_DE_BLOQUES(idPanel: string): string {
  return LECTOR_DE_BLOQUES_EN(raicesDelPanel(idPanel))
}

export interface TintaApagada {
  /** Si TODOS los bloques marcados quedaron con el color pedido. */
  readonly tomo: boolean
  /** Los que no obedecieron (un `color` inline con `!important`, un `<text>` de SVG…), con lo que pintan. */
  readonly rebeldes: readonly { readonly n: number; readonly etiqueta: string; readonly color: string }[]
}

/**
 * Apaga (o vuelve a prender) la tinta de todos los bloques marcados. Devuelve
 * si tomó y QUIÉNES no obedecieron: sobre nuestro sitio tiene que ser nadie;
 * sobre la referencia, lo que no se apague se excluye de la cuenta y se dice.
 */
export function APAGAR_LA_TINTA(apagar: boolean): string {
  const regla = [
    `[${ATRIBUTO_DE_BLOQUE}], [${ATRIBUTO_DE_BLOQUE}] *, [${ATRIBUTO_DE_CAMPO}] {`,
    '  color: transparent !important; -webkit-text-fill-color: transparent !important;',
    '  text-decoration-color: transparent !important; caret-color: transparent !important; text-shadow: none !important }',
    `[${ATRIBUTO_DE_CAMPO}]::placeholder { color: transparent !important; -webkit-text-fill-color: transparent !important }`,
  ].join('\n')
  return `(async () => {
  const viejo = document.getElementById(${JSON.stringify(ID_DEL_ESTILO)})
  if (viejo !== null) viejo.remove()
  if (${apagar}) {
    const estilo = document.createElement('style')
    estilo.id = ${JSON.stringify(ID_DEL_ESTILO)}
    estilo.textContent = ${JSON.stringify(regla)}
    document.head.appendChild(estilo)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  const bloques = [...document.querySelectorAll('[${ATRIBUTO_DE_BLOQUE}], [${ATRIBUTO_DE_CAMPO}]')]
  if (bloques.length === 0) return { tomo: false, rebeldes: [] }
  const transparente = (el) => getComputedStyle(el).color === 'rgba(0, 0, 0, 0)'
  const rebeldes = bloques
    .filter((el) => (${apagar} ? !transparente(el) : transparente(el)))
    .map((el) => ({ n: Number(el.getAttribute('${ATRIBUTO_DE_BLOQUE}') ?? el.getAttribute('${ATRIBUTO_DE_CAMPO}')), etiqueta: el.tagName.toLowerCase(), color: getComputedStyle(el).color }))
  return { tomo: rebeldes.length === 0, rebeldes: rebeldes.slice(0, 20) }
})()`
}

export interface FondoDelPanel {
  readonly superficie: string | null
  readonly backgroundColor: string
  readonly backgroundImage: string
  readonly backdropFilter: string
  readonly velo: string
  /** Si el panel declara su franja desnuda (`--velo-borde`), lo que declara; vacío si no. */
  readonly veloBorde: string
  /** Los tokens de layout de los que sale la frontera del velo, resueltos en px por el navegador. */
  readonly tokens: { readonly pad: number; readonly columna: number; readonly canal: number; readonly medio: number; readonly tope: number }
  readonly rect: CajaDeBloque
}

/** Lo que el navegador pintó como fondo de un nodo — el velo, si tomó, se lee acá. */
export function FONDO_DE(expresionDelNodo: string): string {
  return `(() => {
  const nodo = ${expresionDelNodo}
  if (nodo === null || nodo === undefined) throw new Error('no existe el nodo')
  const cs = getComputedStyle(nodo)
  const raiz = getComputedStyle(document.documentElement)
  const px = (token) => parseFloat(raiz.getPropertyValue(token)) || 0
  const r = nodo.getBoundingClientRect()
  return {
    superficie: nodo.getAttribute('data-superficie'),
    backgroundColor: cs.backgroundColor,
    backgroundImage: cs.backgroundImage,
    backdropFilter: cs.backdropFilter,
    velo: cs.getPropertyValue('--color-velo-denso').trim(),
    veloBorde: cs.getPropertyValue('--velo-borde').trim(),
    tokens: { pad: px('--pad-lateral-compacto'), columna: px('--columna-lateral'), canal: px('--grilla-canal-amplio'), medio: px('--breakpoint-medio'), tope: px('--container-tope') },
    rect: { x: r.left, y: r.top, ancho: r.width, alto: r.height },
  }
})()`
}

export function FONDO_DEL_PANEL(idPanel: string): string {
  return FONDO_DE(`${raicesDelPanel(idPanel)}[0]`)
}

/**
 * LA PERILLA — estilos inline sobre el panel, sólo mientras se mide. `null`
 * borra la propiedad. No toca el producto: es la entrada del instrumento.
 */
export function ESTILAR_EL_PANEL(idPanel: string, estilos: Readonly<Record<string, string | null>>): string {
  return `(async () => {
  const panel = ${raicesDelPanel(idPanel)}[0]
  for (const [prop, valor] of Object.entries(${JSON.stringify(estilos)})) {
    if (valor === null) panel.style.removeProperty(prop)
    else panel.style.setProperty(prop, valor)
  }
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
  return getComputedStyle(panel).backgroundColor
})()`
}

/** Las ocho, con su posición en el documento. `data-panel` lo emite `Panel.tsx`. */
export const LECTOR_DE_PANELES = `[...document.querySelectorAll('[data-panel]')].map((el) => {
  const r = el.getBoundingClientRect()
  return { id: el.dataset.panel, superficie: el.dataset.superficie, alto: r.height, top: r.top + window.scrollY }
})`

export const LECTOR_DEL_DOCUMENTO = `({ altoDelDocumento: document.documentElement.scrollHeight, ventana: window.innerHeight, ancho: window.innerWidth })`
