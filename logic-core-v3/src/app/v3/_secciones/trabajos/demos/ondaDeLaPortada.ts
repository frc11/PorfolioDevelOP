/**
 * [INTERFAZ 2] T3 · LA ONDA QUE RECORRE LA PORTADA — al pasar el puntero por un libro del estante, un anillo nace donde
 * entró el puntero y cruza la portada como cruzan el piso vivo los anillos del pulso: el mismo frente (rápido al nacer y
 * frenando, `1 − (1 − p)^2,2`), la misma cola (`(1 − p)^1,5`) y la misma banda apenas oscura en el frente.
 *
 * Es un filtro SVG (`feDisplacementMap`) sobre la imagen de la cara, sólo mientras dura la onda (0,9 s), con UN mapa de
 * desplazamiento armado una vez (un anillo: empuja hacia afuera de un lado del frente y hacia adentro del otro) que se
 * agranda desde el punto de entrada. No promueve nada a una capa: la cara no puede llevar `will-change` (rompe el recorte
 * del vacío del túnel, `demos.css`); un filtro que cambia de atributos sólo repinta la imagen, de 160 px.
 *
 * Lo monta `OndaDeLasPortadas.tsx` con la bandera (`vida=si`), con puntero fino y sin movimiento reducido.
 */

export const ONDA_DE_LA_PORTADA = {
  duracionMs: 900,
  /** El empuje más grande (px de la imagen), al nacer; se apaga con la cola del frente. */
  empujePx: 18,
  /** La banda oscura del frente, como la de los anillos del piso (que mezcla un 7,5–12 % hacia la sombra). */
  banda: 0.2,
  /** Dónde está el anillo en su mapa (fracción del radio) y su ancho. */
  radioEnElMapa: 0.62,
  anchoEnElMapa: 0.1,
} as const

export const ID_DEL_FILTRO = 'onda-de-la-portada'
const LADO_DEL_MAPA = 256
const SVG = 'http://www.w3.org/2000/svg'

/** El frente y la cola en `p` (0 → 1): los del anillo del piso (`entorno/Pulso.tsx`). */
export function frenteDeLaOnda(p: number): number {
  return 1 - (1 - p) ** 2.2
}
export function colaDeLaOnda(p: number): number {
  const entrada = Math.min(1, p / 0.08)
  return (1 - p) ** 1.5 * entrada * entrada * (3 - 2 * entrada)
}

/** El mapa del anillo: R y G empujan en la dirección del radio (centrado en 0,5), B es la banda. */
export function pixelDelMapa(u: number, v: number): readonly [number, number, number] {
  const r = Math.hypot(u, v)
  const s = (r - ONDA_DE_LA_PORTADA.radioEnElMapa) / ONDA_DE_LA_PORTADA.anchoEnElMapa
  const campana = Math.exp(-s * s)
  const d = r < 1e-6 ? 0 : -s * campana * 1.6
  return [0.5 + 0.5 * d * (u / Math.max(r, 1e-6)), 0.5 + 0.5 * d * (v / Math.max(r, 1e-6)), campana]
}

function mapaDelAnillo(): string {
  const lienzo = document.createElement('canvas')
  lienzo.width = LADO_DEL_MAPA
  lienzo.height = LADO_DEL_MAPA
  const c = lienzo.getContext('2d')
  if (c === null) return ''
  const datos = c.createImageData(LADO_DEL_MAPA, LADO_DEL_MAPA)
  for (let y = 0; y < LADO_DEL_MAPA; y += 1) {
    for (let x = 0; x < LADO_DEL_MAPA; x += 1) {
      const [r, g, b] = pixelDelMapa(((x + 0.5) / LADO_DEL_MAPA) * 2 - 1, ((y + 0.5) / LADO_DEL_MAPA) * 2 - 1)
      const i = (y * LADO_DEL_MAPA + x) * 4
      datos.data[i] = Math.round(r * 255)
      datos.data[i + 1] = Math.round(g * 255)
      datos.data[i + 2] = Math.round(b * 255)
      datos.data[i + 3] = 255
    }
  }
  c.putImageData(datos, 0, 0)
  return lienzo.toDataURL('image/png')
}

interface ElFiltro {
  readonly imagen: SVGFEImageElement
  readonly desplazamiento: SVGFEDisplacementMapElement
  readonly banda: SVGFEColorMatrixElement
}

let filtro: ElFiltro | null = null

/** El `<svg>` con el filtro, una vez, adentro de `[data-v3]` (fuera del flujo, sin tamaño, mudo para el lector). */
function elFiltro(): ElFiltro | null {
  if (filtro !== null && filtro.imagen.isConnected) return filtro
  const raiz = document.querySelector('[data-v3]')
  if (raiz === null) return null
  const svg = document.createElementNS(SVG, 'svg')
  svg.setAttribute('aria-hidden', 'true')
  svg.setAttribute('width', '0')
  svg.setAttribute('height', '0')
  svg.style.position = 'absolute'
  const f = document.createElementNS(SVG, 'filter')
  f.setAttribute('id', ID_DEL_FILTRO)
  f.setAttribute('x', '0')
  f.setAttribute('y', '0')
  f.setAttribute('width', '1')
  f.setAttribute('height', '1')
  f.setAttribute('color-interpolation-filters', 'sRGB')
  const neutro = document.createElementNS(SVG, 'feFlood')
  neutro.setAttribute('flood-color', 'rgb(128,128,0)')
  neutro.setAttribute('result', 'neutro')
  const imagen = document.createElementNS(SVG, 'feImage')
  imagen.setAttribute('href', mapaDelAnillo())
  imagen.setAttribute('preserveAspectRatio', 'none')
  imagen.setAttribute('result', 'anillo')
  const mapa = document.createElementNS(SVG, 'feComposite')
  mapa.setAttribute('in', 'anillo')
  mapa.setAttribute('in2', 'neutro')
  mapa.setAttribute('operator', 'over')
  mapa.setAttribute('result', 'mapa')
  const desplazamiento = document.createElementNS(SVG, 'feDisplacementMap')
  desplazamiento.setAttribute('in', 'SourceGraphic')
  desplazamiento.setAttribute('in2', 'mapa')
  desplazamiento.setAttribute('xChannelSelector', 'R')
  desplazamiento.setAttribute('yChannelSelector', 'G')
  desplazamiento.setAttribute('scale', '0')
  desplazamiento.setAttribute('result', 'movida')
  const banda = document.createElementNS(SVG, 'feColorMatrix')
  banda.setAttribute('in', 'mapa')
  banda.setAttribute('type', 'matrix')
  banda.setAttribute('result', 'banda')
  const encima = document.createElementNS(SVG, 'feComposite')
  encima.setAttribute('in', 'banda')
  encima.setAttribute('in2', 'movida')
  encima.setAttribute('operator', 'over')
  f.append(neutro, imagen, mapa, desplazamiento, banda, encima)
  svg.append(f)
  raiz.append(svg)
  filtro = { imagen, desplazamiento, banda }
  return filtro
}

let enCurso: { readonly imagen: HTMLElement; readonly cuadro: number } | null = null

function soltar(): void {
  if (enCurso === null) return
  cancelAnimationFrame(enCurso.cuadro)
  enCurso.imagen.style.removeProperty('filter')
  enCurso = null
}

/**
 * Larga la onda sobre `imagen` desde el punto (`x`, `y`, en px de la imagen sin transformar). Una a la vez: un libro
 * nuevo corta la del anterior. Devuelve cómo cortarla.
 */
export function ondear(imagen: HTMLElement, x: number, y: number): () => void {
  soltar()
  const f = elFiltro()
  if (f === null) return soltar
  const [ancho, alto] = [imagen.offsetWidth, imagen.offsetHeight]
  // El frente termina pasando la esquina más lejana del punto de entrada.
  const alcance = Math.max(Math.hypot(x, y), Math.hypot(ancho - x, y), Math.hypot(x, alto - y), Math.hypot(ancho - x, alto - y)) * 1.1
  const inicio = performance.now()
  const pintar = (p: number): void => {
    const radio = Math.max(1, alcance * frenteDeLaOnda(p))
    const lado = (2 * radio) / ONDA_DE_LA_PORTADA.radioEnElMapa
    f.imagen.setAttribute('x', (x - lado / 2).toFixed(1))
    f.imagen.setAttribute('y', (y - lado / 2).toFixed(1))
    f.imagen.setAttribute('width', lado.toFixed(1))
    f.imagen.setAttribute('height', lado.toFixed(1))
    const cola = colaDeLaOnda(p)
    f.desplazamiento.setAttribute('scale', (ONDA_DE_LA_PORTADA.empujePx * 2 * cola).toFixed(2))
    f.banda.setAttribute('values', `0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 ${(ONDA_DE_LA_PORTADA.banda * cola).toFixed(3)} 0 0`)
  }
  const paso = (ahora: number): void => {
    const p = Math.min(1, (ahora - inicio) / ONDA_DE_LA_PORTADA.duracionMs)
    pintar(p)
    if (p >= 1) {
      soltar()
      return
    }
    if (enCurso !== null) enCurso = { imagen, cuadro: requestAnimationFrame(paso) }
  }
  // El primer cuadro ya con la onda naciendo (y no con lo que dejó la anterior).
  pintar(0)
  imagen.style.filter = `url(#${ID_DEL_FILTRO})`
  enCurso = { imagen, cuadro: requestAnimationFrame(paso) }
  return soltar
}
