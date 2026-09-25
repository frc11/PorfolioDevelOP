/**
 * SPRINT ESCENA 4 — ¿el logo sigue siendo, por lejos, lo más legible del cuadro? ¿y el texto?
 *
 * **El logo.** Tres tomas de la escena sola (`<main>` escondido), una detrás de otra en la misma
 * carga: A con todo, B sin la formación y C sin el logo, y otra vez las tres. El gancho es del banco
 * (`__formacionDelBanco`, sólo existe si el banco pisó el entorno). Las máscaras salen de la
 * DIFERENCIA y no de un umbral de color, y sólo cuentan los píxeles QUIETOS de una serie a la otra:
 * el polvo, los anillos del pulso y el giro de la mirada se mueven, y quedan afuera.
 *
 *   · logo = la componente conexa más grande de |A − C|; su entorno, el anillo de 6 a 40 px.
 *   · formación = |A − B| sin las manchas chicas (lo que el polvo movió no llega a 40 px conexos).
 *
 * Contraste = razón WCAG entre luminancias relativas. El del logo es la mediana del logo contra la
 * mediana de su anillo, con formación (A) y sin ella (B). El de la formación es, píxel a píxel, lo que
 * una copia se despega de lo que tapa (A contra B): mediana y percentil 95.
 *
 * **El texto.** Dos capturas completas con la formación y sin ella; por cada elemento de texto
 * visible, el glifo (el percentil 5 o 95 de su caja, el que más se aleje) contra el fondo local (la
 * mediana de la caja). Vale el peor elemento, y la peor caída de un elemento.
 *
 * A mano, sobre tomas guardadas: contraste-formacion.ts <base> [<base>...] (sin el `-escena.png`).
 */
import { readFileSync, writeFileSync } from 'node:fs'

import { medir } from '../scripts-b4/navegador'
import { codificarPngRgba, decodificarPng } from '../scripts-b4/png'
import type { Banco } from '../scripts-viajes/banco'

export interface Tomas {
  readonly a: Buffer
  readonly sinFormacion: Buffer
  readonly sinLogo: Buffer
}

const QUIETO = 3
/** El logo se balancea (la vira) y su sombreado cambia unos niveles de una serie a la otra: más holgura. */
const QUIETO_EL_LOGO = 20
const UMBRAL_LOGO = 12
const UMBRAL_FORMACION = 4
const MANCHA_MINIMA = 40
const ANILLO = { desde: 6, hasta: 40 } as const

interface Imagen {
  readonly ancho: number
  readonly alto: number
  /** Luminancia relativa (WCAG), 0–1. */
  readonly y: Float32Array
  /** Luma 0–255, para las diferencias. */
  readonly l: Float32Array
  readonly datos: Uint8Array
}

const lineal = (c: number): number => {
  const v = c / 255
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
}

function leer(png: Buffer): Imagen {
  const img = decodificarPng(png)
  const n = img.ancho * img.alto
  const y = new Float32Array(n)
  const l = new Float32Array(n)
  for (let p = 0; p < n; p += 1) {
    const [r, g, b] = [img.datos[p * 4], img.datos[p * 4 + 1], img.datos[p * 4 + 2]]
    y[p] = 0.2126 * lineal(r) + 0.7152 * lineal(g) + 0.0722 * lineal(b)
    l[p] = 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  return { ancho: img.ancho, alto: img.alto, y, l, datos: img.datos }
}

/** Dilatación cuadrada separable: uno si hay un uno a `r` px o menos, por fila y después por columna. */
function dilatar(m: Uint8Array, ancho: number, alto: number, r: number): Uint8Array {
  const pasada = (entrada: Uint8Array, largo: number, cuantas: number, indice: (linea: number, i: number) => number): Uint8Array => {
    const salida = new Uint8Array(entrada.length)
    const despues = new Int32Array(largo)
    for (let linea = 0; linea < cuantas; linea += 1) {
      let proximo = 2 ** 30
      for (let i = largo - 1; i >= 0; i -= 1) {
        if (entrada[indice(linea, i)] === 1) proximo = i
        despues[i] = proximo
      }
      let anterior = -(2 ** 30)
      for (let i = 0; i < largo; i += 1) {
        if (entrada[indice(linea, i)] === 1) anterior = i
        salida[indice(linea, i)] = i - anterior <= r || despues[i] - i <= r ? 1 : 0
      }
    }
    return salida
  }
  const filas = pasada(m, ancho, alto, (y, x) => y * ancho + x)
  return pasada(filas, alto, ancho, (x, y) => y * ancho + x)
}

/** Las componentes conexas (vecindad de 4): se queda con la mayor, o con las de `minima` px o más. */
function componentes(m: Uint8Array, ancho: number, alto: number, quedarse: 'mayor' | { readonly minima: number }): Uint8Array {
  const etiqueta = new Int32Array(m.length).fill(-1)
  const tamanos: number[] = []
  const pila: number[] = []
  for (let inicio = 0; inicio < m.length; inicio += 1) {
    if (m[inicio] === 0 || etiqueta[inicio] !== -1) continue
    const id = tamanos.length
    let n = 0
    etiqueta[inicio] = id
    pila.push(inicio)
    while (pila.length > 0) {
      const p = pila.pop() as number
      n += 1
      const x = p % ancho
      for (const q of [x > 0 ? p - 1 : -1, x < ancho - 1 ? p + 1 : -1, p >= ancho ? p - ancho : -1, p < ancho * (alto - 1) ? p + ancho : -1]) {
        if (q < 0 || m[q] === 0 || etiqueta[q] !== -1) continue
        etiqueta[q] = id
        pila.push(q)
      }
    }
    tamanos.push(n)
  }
  let mayor = 0
  for (let i = 1; i < tamanos.length; i += 1) if (tamanos[i] > tamanos[mayor]) mayor = i
  const salida = new Uint8Array(m.length)
  for (let p = 0; p < m.length; p += 1) {
    const id = etiqueta[p]
    if (id === -1) continue
    salida[p] = quedarse === 'mayor' ? (id === mayor ? 1 : 0) : tamanos[id] >= quedarse.minima ? 1 : 0
  }
  return salida
}

const ordenados = (xs: number[]): number[] => [...xs].sort((a, b) => a - b)
const mediana = (xs: number[]): number => (xs.length === 0 ? Number.NaN : ordenados(xs)[Math.floor(xs.length / 2)])
const percentil = (xs: number[], p: number): number => (xs.length === 0 ? Number.NaN : ordenados(xs)[Math.min(xs.length - 1, Math.floor(xs.length * p))])
const razon = (a: number, b: number): number => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
const r2 = (x: number): number => Math.round(x * 100) / 100

export interface ContrasteDeLaFormacion {
  /** Razón del logo contra su anillo, con la formación y sin ella. */
  readonly logoCon: number
  readonly logoSin: number
  readonly logoPx: number
  readonly anilloPx: number
  /** Qué parte del anillo del logo toca la formación, en %. */
  readonly formacionEnElAnillo: number
  /** Lo que una copia se despega de lo que tapa: mediana y percentil 95. */
  readonly copiasMediana: number
  readonly copiasP95: number
  /** Qué parte del cuadro cambia la formación, en %. */
  readonly copiasArea: number
}

interface Mascaras {
  readonly ancho: number
  readonly alto: number
  readonly logo: Uint8Array
  readonly anillo: Uint8Array
  readonly formacion: Uint8Array
  readonly base: Uint8Array
}

function mascaras(a: Imagen, b: Imagen, c: Imagen, a2: Imagen, b2: Imagen, c2: Imagen): Mascaras {
  const { ancho, alto } = a
  const n = ancho * alto
  const crudoLogo = new Uint8Array(n)
  const crudaFormacion = new Uint8Array(n)
  for (let p = 0; p < n; p += 1) {
    const logoQuieto = Math.abs(a.l[p] - a2.l[p]) <= QUIETO_EL_LOGO && Math.abs(c.l[p] - c2.l[p]) <= QUIETO_EL_LOGO
    crudoLogo[p] = logoQuieto && Math.abs(a.l[p] - c.l[p]) > UMBRAL_LOGO ? 1 : 0
    const quieto = Math.abs(a.l[p] - a2.l[p]) <= QUIETO && Math.abs(b.l[p] - b2.l[p]) <= QUIETO
    crudaFormacion[p] = quieto && Math.abs(a.l[p] - b.l[p]) > UMBRAL_FORMACION ? 1 : 0
  }
  const logo = componentes(crudoLogo, ancho, alto, 'mayor')
  const grandes = componentes(crudaFormacion, ancho, alto, { minima: MANCHA_MINIMA })
  const formacion = grandes.map((v, p) => (v === 1 && logo[p] === 0 ? 1 : 0))
  const cerca = dilatar(logo, ancho, alto, ANILLO.desde)
  const lejos = dilatar(logo, ancho, alto, ANILLO.hasta)
  const anillo = lejos.map((v, p) => (v === 1 && cerca[p] === 0 ? 1 : 0))
  return { ancho, alto, logo, anillo, formacion, base: a.datos }
}

export function contrasteDeLaFormacion(serie: Tomas, otra: Tomas, control?: string): ContrasteDeLaFormacion {
  const [a, b, c] = [leer(serie.a), leer(serie.sinFormacion), leer(serie.sinLogo)]
  const m = mascaras(a, b, c, leer(otra.a), leer(otra.sinFormacion), leer(otra.sinLogo))
  if (control !== undefined) writeFileSync(control, controlDeLasMascaras(m))
  const [yLogoA, yLogoB, yAnilloA, yAnilloB, copias] = [[], [], [], [], []] as number[][]
  let enElAnillo = 0
  for (let p = 0; p < m.ancho * m.alto; p += 1) {
    if (m.logo[p] === 1) {
      yLogoA.push(a.y[p])
      yLogoB.push(b.y[p])
    }
    if (m.anillo[p] === 1) {
      yAnilloA.push(a.y[p])
      yAnilloB.push(b.y[p])
      if (m.formacion[p] === 1) enElAnillo += 1
    }
    if (m.formacion[p] === 1) copias.push(razon(a.y[p], b.y[p]))
  }
  return {
    logoCon: r2(razon(mediana(yLogoA), mediana(yAnilloA))),
    logoSin: r2(razon(mediana(yLogoB), mediana(yAnilloB))),
    logoPx: yLogoA.length,
    anilloPx: yAnilloA.length,
    formacionEnElAnillo: r2((enElAnillo / Math.max(1, yAnilloA.length)) * 100),
    copiasMediana: r2(mediana(copias)),
    copiasP95: r2(percentil(copias, 0.95)),
    copiasArea: r2((copias.length / (m.ancho * m.alto)) * 100),
  }
}

/** El control a ojo: logo en azul, su anillo en verde, la formación en naranja. */
function controlDeLasMascaras(m: Mascaras): Buffer {
  const salida = new Uint8Array(m.base.length)
  for (let p = 0; p < m.ancho * m.alto; p += 1) {
    const gris = (m.base[p * 4] + m.base[p * 4 + 1] + m.base[p * 4 + 2]) / 6
    const color = m.logo[p] === 1 ? [40, 90, 255] : m.formacion[p] === 1 ? [255, 150, 0] : m.anillo[p] === 1 ? [60, 200, 60] : [gris, gris, gris]
    salida.set([color[0], color[1], color[2], 255], p * 4)
  }
  return codificarPngRgba(m.ancho, m.alto, salida)
}

interface CajaDeTexto {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
  readonly texto: string
}

/** Cada elemento de texto visible del cuadro, por separado: la formación cambia el fondo LOCAL. */
export function cajasDeTexto(b: Banco): Promise<CajaDeTexto[]> {
  return medir<CajaDeTexto[]>(
    b.p,
    `[...document.querySelectorAll('main :is(h1, h2, h3, p, a, li)')].filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 20 && r.height > 8 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && s.visibility !== 'hidden' && e.textContent.trim() !== '' && ![...e.children].some((h) => h.matches('p, h1, h2, h3, li')) && (() => { let o = 1; for (let a = e; a; a = a.parentElement) o *= Number(getComputedStyle(a).opacity); const c = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return o > 0.5 && c !== null && (c === e || e.contains(c)) })() }).map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), ancho: Math.round(r.width), alto: Math.round(r.height), texto: e.textContent.trim().slice(0, 28) } })`,
  )
}

/** El glifo contra el fondo local de una caja: el percentil 5 o 95, el que más se aleje de la mediana. */
function contrasteEn(img: Imagen, c: CajaDeTexto): number {
  const l: number[] = []
  for (let y = c.y; y < c.y + c.alto; y += 1) for (let x = c.x; x < c.x + c.ancho; x += 1) if (x >= 0 && y >= 0 && x < img.ancho && y < img.alto) l.push(img.y[y * img.ancho + x])
  const fondo = mediana(l)
  return Math.max(razon(percentil(l, 0.05), fondo), razon(percentil(l, 0.95), fondo))
}

export async function contrasteDelTexto(b: Banco, con: Buffer, sin: Buffer): Promise<{ con: number; sin: number; peorCaida: number; textos: number }> {
  const cajas = await cajasDeTexto(b)
  if (cajas.length === 0) return { con: Number.NaN, sin: Number.NaN, peorCaida: 0, textos: 0 }
  const [ic, is] = [leer(con), leer(sin)]
  const pares = cajas.map((c) => [contrasteEn(ic, c), contrasteEn(is, c)] as const)
  return {
    con: r2(Math.min(...pares.map(([x]) => x))),
    sin: r2(Math.min(...pares.map(([, y]) => y))),
    // La peor caída de un mismo elemento, en %.
    peorCaida: r2(Math.max(0, ...pares.map(([x, y]) => (1 - x / y) * 100))),
    textos: cajas.length,
  }
}

if (process.argv[1]?.endsWith('contraste-formacion.ts')) {
  for (const base of process.argv.slice(2)) {
    const serie = (sufijo: string): Tomas => ({
      a: readFileSync(`${base}-escena${sufijo}.png`),
      sinFormacion: readFileSync(`${base}-escena-sin-formacion${sufijo}.png`),
      sinLogo: readFileSync(`${base}-escena-sin-logo${sufijo}.png`),
    })
    console.log(JSON.stringify({ base: base.split('/').pop(), ...contrasteDeLaFormacion(serie(''), serie('-2'), `${base}-mascaras.png`) }))
  }
}
