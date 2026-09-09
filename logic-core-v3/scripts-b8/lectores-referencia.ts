/**
 * LOS LECTORES DE LA REFERENCIA — lo que corre ADENTRO de su página, por PROPIEDAD.
 *
 * Ni un selector suyo, ni una clase, ni un asset. Lo que se lee es lo que el
 * navegador computa: qué elementos llevan una transformación 3D (`matrix3d`),
 * a qué profundidad están (`translateZ`, el 15.º valor de la matriz), con qué
 * escala y opacidad, qué contienen (imagen, video, texto y a qué cuerpo) y qué
 * `perspective` declara el ancestro que les da el punto de fuga. Son medidas,
 * escritas con nuestras palabras.
 *
 * La identidad de cada plano entre lecturas la da un atributo NUESTRO que el
 * lector le pega la primera vez que lo ve: así una traza de profundidad contra
 * el scroll sigue al mismo elemento sin adivinar por su texto.
 */

export const ATRIBUTO_DE_PLANO = 'data-b8-plano'

export interface PlanoLeido {
  readonly id: number
  readonly etiqueta: string
  readonly z: number
  readonly escala: number
  readonly opacidad: number
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly enCuadro: boolean
  readonly medios: number
  readonly caracteres: number
  readonly cuerpoMaximoPx: number
  readonly perspectivaPx: number | null
  readonly perspectivaEnAncestro: boolean
}

/**
 * Todos los elementos con `matrix3d` en el documento que NO tienen un ancestro
 * también transformado en 3D (el plano exterior es el que viaja). Se marcan con
 * `ATRIBUTO_DE_PLANO` la primera vez.
 */
export const LECTOR_DE_PLANOS_3D = `(() => {
  const marca = ${JSON.stringify(ATRIBUTO_DE_PLANO)}
  if (window.__b8Siguiente === undefined) window.__b8Siguiente = 0
  const tieneM3d = (el) => getComputedStyle(el).transform.startsWith('matrix3d(')
  const opacidadEfectiva = (el) => { let o = 1; let n = el; while (n !== null && n !== document.documentElement) { o *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement } return o }
  const salida = []
  for (const el of document.querySelectorAll('body *')) {
    if (!tieneM3d(el)) continue
    let a = el.parentElement, anidado = false
    while (a !== null && a !== document.body) { if (tieneM3d(a)) { anidado = true; break } a = a.parentElement }
    if (anidado) continue
    const m = (getComputedStyle(el).transform.match(/-?[0-9.e+-]+/g) || []).map(Number)
    if (m.length !== 16) continue
    const r = el.getBoundingClientRect()
    if (r.width < 40 || r.height < 40) continue
    if (!el.hasAttribute(marca)) { el.setAttribute(marca, String(window.__b8Siguiente)); window.__b8Siguiente += 1 }
    let p = el.parentElement, persp = null, enAncestro = false
    while (p !== null && p !== document.documentElement) { const v = getComputedStyle(p).perspective; if (v !== 'none') { persp = parseFloat(v); enAncestro = true; break } p = p.parentElement }
    if (persp === null) { const propia = getComputedStyle(el).perspective; if (propia !== 'none') persp = parseFloat(propia) }
    let cuerpo = 0
    for (const t of el.querySelectorAll('*')) { const fs = parseFloat(getComputedStyle(t).fontSize); if (fs > cuerpo && (t.textContent || '').trim().length > 0) cuerpo = fs }
    salida.push({
      id: Number(el.getAttribute(marca)),
      etiqueta: el.tagName.toLowerCase(),
      z: m[14], escala: m[0], opacidad: opacidadEfectiva(el),
      x: r.left, y: r.top, ancho: r.width, alto: r.height,
      enCuadro: r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth,
      medios: el.querySelectorAll('img, video, picture, canvas').length,
      caracteres: (el.innerText || '').trim().length,
      cuerpoMaximoPx: cuerpo,
      perspectivaPx: persp, perspectivaEnAncestro: enAncestro,
    })
  }
  return salida
})()`

/** Los canvas GRANDES (≥ un cuarto del viewport): los chicos son logos o medidores. */
export const CANVASES = `[...document.querySelectorAll('canvas')].filter((c) => { const r = c.getBoundingClientRect(); return r.width * r.height >= 0.25 * innerWidth * innerHeight })`

export interface PanelInventariado {
  readonly etiqueta: string
  readonly alfa: number
  readonly luminanciaDelFondo: number
  readonly backdrop: string
  readonly top: number
  readonly alto: number
  readonly ancho: number
  readonly caracteres: number
}

export interface Inventario {
  readonly altoDelDocumento: number
  readonly ventana: number
  readonly canvases: { readonly ancho: number; readonly alto: number; readonly top: number; readonly position: string; readonly positionDelPadre: string }[]
  readonly paneles: PanelInventariado[]
}

/** Todo elemento grande con un fondo pintado o un desenfoque: claro u oscuro, opaco o no. (B6-A) */
export const INVENTARIO = `(() => {
  const canvases = [...document.querySelectorAll('canvas')].map((c) => {
    const r = c.getBoundingClientRect()
    return { ancho: r.width, alto: r.height, top: r.top + scrollY, position: getComputedStyle(c).position, positionDelPadre: c.parentElement ? getComputedStyle(c.parentElement).position : '' }
  })
  const paneles = []
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el)
    const m = cs.backgroundColor.match(/[\\d.]+/g)
    if (m === null) continue
    const alfa = m.length > 3 ? Number(m[3]) : 1
    if (alfa === 0 && cs.backdropFilter === 'none') continue
    const r = el.getBoundingClientRect()
    if (r.width * r.height < 0.2 * innerWidth * innerHeight) continue
    const lum = (0.2126 * Number(m[0]) + 0.7152 * Number(m[1]) + 0.0722 * Number(m[2])) / 255
    paneles.push({ etiqueta: el.tagName.toLowerCase(), alfa, luminanciaDelFondo: lum, backdrop: cs.backdropFilter, top: r.top + scrollY, alto: r.height, ancho: r.width, caracteres: (el.innerText || '').trim().length })
  }
  paneles.sort((a, b) => a.top - b.top)
  return { altoDelDocumento: document.documentElement.scrollHeight, ventana: innerHeight, canvases, paneles }
})()`
