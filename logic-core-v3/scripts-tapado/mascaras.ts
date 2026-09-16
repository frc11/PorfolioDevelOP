/**
 * LAS DOS MÁSCARAS, y la cifra que sale de cruzarlas.
 *
 * Sale de `tapado-comun.ts` por la regla de 300 líneas, y el corte es real:
 * allá se abre el navegador, acá se leen píxeles. Ninguna de las dos mitades
 * sabe de la otra.
 *
 * ── ⚠️ EL PRIMER INTENTO DE ESTE ARCHIVO TENÍA LA MISMA ENFERMEDAD QUE VIENE A
 *    CAZAR, Y HAY QUE DEJARLO ESCRITO ────────────────────────────────────────
 *
 * La máscara del glifo se sacaba restando dos capturas del mismo cuadro —una con
 * el texto y otra con el texto en `visibility: hidden`— y quedándose con los
 * píxeles que cambiaban. **Donde el texto cae sobre el logo eso NO cambia**: la
 * tinta del texto y la del logo son el mismo negro, así que esconder el texto
 * mueve el píxel dos o tres niveles y el umbral lo descarta. Resultado medido a
 * 390: la línea 1 del titular publicaba **13,0 % de tinta sobre el logo con el
 * 79,3 % de su caja sobre masa negra**, y la luz media debajo de sus glifos daba
 * 217 sobre 255 — o sea que el instrumento sólo veía los glifos que caen sobre
 * el fondo claro, que son exactamente los que NO son el problema.
 *
 * **Un instrumento que se vuelve ciego justo donde el defecto ocurre publica un
 * número bajo y tranquilizador.** Es la misma falla que este sprint audita un
 * piso más arriba, así que la salida es la misma: separar las dos tintas en
 * capturas donde no se puedan confundir.
 *
 * ── LAS TRES CAPTURAS, y qué aporta cada una ──────────────────────────────
 *
 *   · **A** — la página como se ve. Es la que mira el humano; no se mide.
 *   · **C** — el texto SIN la escena: la escena en `visibility: hidden` y el
 *     texto puesto. El fondo queda plano, así que la tinta dibujada se separa
 *     por umbral y **la máscara del glifo no depende de lo que haya detrás**.
 *   · **D** — la escena SOLA: todo lo que no es escena escondido. La masa negra
 *     que quede ahí es del logo y de nada más — ni de la pastilla de navegación,
 *     ni de la insignia del dev server, ni del propio texto.
 *
 * `visibility` no mueve el layout, así que los tres cuadros comparten píxel por
 * píxel el mismo sistema de coordenadas que `getBoundingClientRect`.
 *
 * ── ⚠ EL UMBRAL DE «ESTO ES LOGO» NO ES UN GUSTO: SALE DE LOS DOS COLORES ─
 *
 * `probeScene.ts` declara el papel de la sala en `#F7F7F5` (247) y la tinta del
 * logo en `#0F0F0F` (15). Entre los dos hay 232 niveles, así que cualquier corte
 * bien adentro de ese hueco separa las dos poblaciones sin tocar ninguna. El que
 * se usa está a la MITAD, y `a-verdad.ts` publica además el histograma para que
 * se vea que la elección no está apoyada en el borde de una campana.
 *
 * ⚠ **La sala no es papel plano: es un gradiente con luces y una celosía.** Por
 * eso el umbral se pone al medio y no arriba — lo que se busca es la MASA NEGRA
 * del logo, no «lo que está un poco más oscuro que el promedio». Un umbral alto
 * contaría la sombra de la celosía como logo; el del medio puede dejar afuera el
 * borde antialiaseado, que es el lado conservador (subestima).
 *
 * ⚠️ **Y ESE UMBRAL SÓLO VALE CON LA SALA CLARA.** El arco de luz baja a noche a
 * mitad del recorrido y ahí el cuadro ENTERO cae debajo del corte: el primer
 * barrido de scroll publicó por eso «trabajos 100 %» y «servicios 100 %», con una
 * masa negra que era la noche y no el logo. Para todo lo que no sea el hero en
 * reposo, la máscara del logo se le pide al instrumento analítico
 * (`logo-analitico.ts`), que sabe distinguir «acá hay logo» de «acá está
 * oscuro». `UMBRAL_DE_MASA` se queda para la lectura de CAJA del hero, donde la
 * sala es mañana y las dos poblaciones son disjuntas.
 *
 * ── ⚠ EL GLIFO SE SEPARA POR AMPLITUD, NO POR OSCURIDAD ───────────────────
 *
 * Trabajos es la sección INVERTIDA: su tinta es el papel sobre un panel oscuro.
 * Un umbral que diga «glifo = más oscuro que el fondo» no ve un solo píxel suyo.
 * Lo que se busca es **lo que se aparta del fondo plano**, en el sentido que
 * sea: la moda del rectángulo es el fondo, el valor más lejano de esa moda con
 * masa suficiente es la tinta, y el corte va a mitad de camino. La misma función
 * mide las dos polaridades sin saber cuál es cuál, y el color de tinta con el
 * que calcula el contraste es el MEDIDO, no uno supuesto.
 */

import { readFileSync } from 'node:fs'

import { decodificarPng, type Imagen } from '../scripts-b4/png'

/** Luminancia percibida 0..255, la misma ponderación que usa `cuadro.ts`. */
export function luz(datos: Uint8Array, i: number): number {
  return 0.2126 * datos[i] + 0.7152 * datos[i + 1] + 0.0722 * datos[i + 2]
}

/** El papel y la tinta del logo, copiados de `probeScene.ts` con su luminancia. */
export const PAPEL_255 = 0.2126 * 0xf7 + 0.7152 * 0xf7 + 0.0722 * 0xf5
export const TINTA_255 = 0.2126 * 0x0f + 0.7152 * 0x0f + 0.0722 * 0x0f

/** El corte, a mitad de camino entre los dos. Derivado, no escrito. */
export const UMBRAL_DE_MASA = (PAPEL_255 + TINTA_255) / 2

export interface Rect {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** Razón de contraste WCAG entre dos luminancias 0..255 de gris. */
export function razon(a255: number, b255: number): number {
  const lin = (v: number): number => {
    const s = Math.min(1, Math.max(0, v / 255))
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const l1 = lin(Math.max(a255, b255))
  const l2 = lin(Math.min(a255, b255))
  return (l1 + 0.05) / (l2 + 0.05)
}

export interface Cruce {
  /** Píxeles de tinta DIBUJADA dentro del rectángulo, leídos de C. */
  readonly glifos: number
  /** De ésos, cuántos caen sobre la masa negra del logo (leída de D). */
  readonly sobreElLogo: number
  /** La cifra del sprint: `sobreElLogo / glifos`. NaN si no hay glifos. */
  readonly fraccionDeTinta: number
  /** El área del rectángulo, y cuánta de ella es masa negra. La lectura de CAJA. */
  readonly areaDeLaCaja: number
  readonly cajaSobreElLogo: number
  readonly fraccionDeCaja: number
  /** La luminancia de la escena DEBAJO de los glifos: mediana y peor decil. */
  readonly luzMedianaBajoElGlifo: number
  /** La razón de contraste de la tinta contra la mediana de abajo. */
  readonly contrasteMediano: number
  /**
   * La fracción de la tinta cuyo contraste LOCAL contra lo que tiene debajo no
   * llega a AA (4,5:1). Es la cifra que una mediana esconde: con una población
   * bimodal —parte sobre papel, parte sobre masa negra— la mediana cae de un
   * lado y no describe al otro. Medido a 320: mediana 16,18:1 con el 30,6 % de
   * la tinta sobre el logo.
   */
  readonly fraccionBajoAA: number
  /** El fondo plano contra el que se leyó C. Se publica para poder auditar el umbral. */
  readonly fondoDeC: number
  /** La luminancia MEDIDA de la tinta de este texto. No se supone: se lee de C. */
  readonly tintaDeC: number
}

/** El umbral de AA para texto normal. */
export const AA = 4.5

/** Mediana de un array ya llenado. */
function mediana(v: number[]): number {
  if (v.length === 0) return Number.NaN
  const o = [...v].sort((a, b) => a - b)
  return o[Math.floor(o.length / 2)]
}

/**
 * CRUZA LAS DOS MÁSCARAS SOBRE UN RECTÁNGULO.
 *
 * `soloTexto` es la captura C (texto sobre fondo plano) y `soloEscena` la D
 * (la escena sola). El rectángulo viene de `getBoundingClientRect`, o sea en
 * píxeles de CSS; con `deviceScaleFactor` 1 esa unidad y la del PNG son la misma.
 */
export function cruzar(
  soloTexto: Imagen,
  soloEscena: Imagen,
  r: Rect,
  /**
   * La máscara ANALÍTICA del logo, un byte por píxel del viewport. Cuando se
   * pasa, «sobre el logo» sale de ella y no de la luminancia — que es lo único
   * correcto donde la sala se pone de noche. Ver `logo-analitico.ts`.
   */
  mascaraDelLogo?: Uint8Array,
): Cruce {
  if (soloTexto.ancho !== soloEscena.ancho || soloTexto.alto !== soloEscena.alto) {
    throw new Error(
      `las capturas no miden lo mismo: ${soloTexto.ancho}x${soloTexto.alto} contra ${soloEscena.ancho}x${soloEscena.alto}`,
    )
  }
  const x0 = Math.max(0, Math.floor(r.x))
  const y0 = Math.max(0, Math.floor(r.y))
  const x1 = Math.min(soloTexto.ancho, Math.ceil(r.x + r.ancho))
  const y1 = Math.min(soloTexto.alto, Math.ceil(r.y + r.alto))

  // El fondo plano de C dentro del rectángulo: su valor MÁS FRECUENTE. Con el
  // texto ocupando una fracción chica de su caja, la moda es el fondo.
  const cubetas = new Map<number, number>()
  let area = 0
  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const v = Math.round(luz(soloTexto.datos, (y * soloTexto.ancho + x) * 4))
      cubetas.set(v, (cubetas.get(v) ?? 0) + 1)
      area += 1
    }
  }
  let fondoDeC = 255
  let mejor = -1
  for (const [v, n] of cubetas) {
    if (n > mejor) {
      mejor = n
      fondoDeC = v
    }
  }
  // La tinta: el valor más LEJANO de la moda con masa suficiente para no ser un
  // borde antialiaseado suelto. Sirve para las dos polaridades, que es lo que la
  // sección invertida obliga.
  const piso = Math.max(4, area * 0.002)
  let tintaDeC = fondoDeC
  let lejos = 0
  for (const [v, n] of cubetas) {
    if (n < piso) continue
    const d = Math.abs(v - fondoDeC)
    if (d > lejos) {
      lejos = d
      tintaDeC = v
    }
  }
  /** El corte del glifo: a mitad de camino entre el fondo medido y la tinta medida. */
  const umbralDeGlifo = lejos / 2

  let glifos = 0
  let sobreElLogo = 0
  let areaDeLaCaja = 0
  let cajaSobreElLogo = 0
  const debajo: number[] = []

  for (let y = y0; y < y1; y += 1) {
    for (let x = x0; x < x1; x += 1) {
      const i = (y * soloTexto.ancho + x) * 4
      const c = luz(soloTexto.datos, i)
      const d = luz(soloEscena.datos, i)
      const esMasa =
        mascaraDelLogo === undefined ? d < UMBRAL_DE_MASA : mascaraDelLogo[y * soloTexto.ancho + x] === 1
      areaDeLaCaja += 1
      if (esMasa) cajaSobreElLogo += 1
      if (umbralDeGlifo > 0 && Math.abs(c - fondoDeC) >= umbralDeGlifo) {
        glifos += 1
        debajo.push(d)
        if (esMasa) sobreElLogo += 1
      }
    }
  }

  const med = mediana(debajo)
  let bajoAA = 0
  for (const d of debajo) if (razon(tintaDeC, d) < AA) bajoAA += 1
  return {
    glifos,
    sobreElLogo,
    fraccionDeTinta: glifos === 0 ? Number.NaN : sobreElLogo / glifos,
    areaDeLaCaja,
    cajaSobreElLogo,
    fraccionDeCaja: areaDeLaCaja === 0 ? Number.NaN : cajaSobreElLogo / areaDeLaCaja,
    luzMedianaBajoElGlifo: med,
    contrasteMediano: Number.isNaN(med) ? Number.NaN : razon(tintaDeC, med),
    fraccionBajoAA: glifos === 0 ? Number.NaN : bajoAA / glifos,
    fondoDeC,
    tintaDeC,
  }
}

/** El histograma de luminancia de una captura, en 16 cubetas. Para ver el hueco. */
export function histograma(img: Imagen): readonly number[] {
  const cubetas = new Array<number>(16).fill(0)
  for (let i = 0; i < img.datos.length; i += 4) {
    const v = luz(img.datos, i)
    cubetas[Math.min(15, Math.floor((v / 256) * 16))] += 1
  }
  return cubetas
}

/**
 * LA BANDA VERTICAL DE LA MASA NEGRA en una columna de la pantalla: en qué filas
 * hay logo y en cuáles no. Es lo que dice si el hueco que el texto necesita
 * existe y dónde está.
 */
export function bandasDeMasa(
  soloEscena: Imagen,
  x0: number,
  x1: number,
  minimoPorFila = 0.02,
): readonly { readonly desde: number; readonly hasta: number }[] {
  const a = Math.max(0, Math.floor(x0))
  const b = Math.min(soloEscena.ancho, Math.ceil(x1))
  const ancho = Math.max(1, b - a)
  const bandas: { desde: number; hasta: number }[] = []
  let abierta: { desde: number; hasta: number } | null = null
  for (let y = 0; y < soloEscena.alto; y += 1) {
    let masa = 0
    for (let x = a; x < b; x += 1) {
      if (luz(soloEscena.datos, (y * soloEscena.ancho + x) * 4) < UMBRAL_DE_MASA) masa += 1
    }
    const hay = masa / ancho >= minimoPorFila
    if (hay && abierta === null) abierta = { desde: y, hasta: y }
    else if (hay && abierta !== null) abierta.hasta = y
    else if (!hay && abierta !== null) {
      bandas.push(abierta)
      abierta = null
    }
  }
  if (abierta !== null) bandas.push(abierta)
  return bandas
}

export function leer(ruta: string): Imagen {
  return decodificarPng(readFileSync(ruta))
}
