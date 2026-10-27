/**
 * [B12c] EL TRAZADO DE LA FLECHA — puro: de los renglones de la frase y la caja del botón (las reales, medidas en el cliente) a un camino.
 * [C2-81] Rehecho con el dibujo de Valentino (`lote2/05`): **a trazos (rayas)**, sale desde el costado del texto, sube por encima de la
 * frase y hace **tres bucles grandes encadenados** antes de terminar en el borde del botón, apuntando a su centro: la punta queda
 * EXACTAMENTE donde está el botón (el disco), sin dibujarlo. `s78-preloader` lo prueba a 1440, 1024, 768 y 390.
 *
 *   · **De dónde sale** (`origenDeLaFlecha`): en escritorio, de la derecha del último renglón (donde termina «sonido.»); en el teléfono con
 *     movimiento (dos flechas), de las dos puntas del primer renglón: la del sonido por la izquierda, la del movimiento por la derecha.
 *     Antes de los bucles sube por encima de todo el bloque, así nunca cruza el texto.
 *   · **Los bucles:** sobre el camino base (de la subida a la recta final), en tres puntos fijos; del lado que se aleja de la frase, salvo
 *     que ahí no entren en la ventana (pegado a un borde, en el teléfono): entonces del otro lado.
 *   · **Las rayas** (`rayasDeLaFlecha`): el camino muestreado (`muestrearElCamino`) partido en rayas rectas de un largo y un hueco que
 *     siguen al lado corto de la ventana; la última termina justo antes de la punta.
 *
 * Se arma con puntos de paso y una Catmull-Rom (uniforme) pasada a cúbicas: continua en la tangente, y la del final es la dirección de la
 * punta (el último tramo va derecho al centro del botón).
 */
export interface Punto {
  readonly x: number
  readonly y: number
}

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

/** El camino muestreado: los puntos y el largo acumulado hasta cada uno (px). */
export interface Polilinea {
  readonly puntos: readonly Punto[]
  readonly largos: readonly number[]
  readonly largo: number
}

export interface Trazado {
  /** Los puntos de paso de la Catmull-Rom. */
  readonly puntos: readonly Punto[]
  readonly camino: Polilinea
  /** Dónde termina (en el borde del botón) y hacia dónde apunta (unitario, hacia el centro). */
  readonly punta: Punto
  readonly direccion: Punto
  /** El centro del botón y su radio (el disco). */
  readonly centro: Punto
  readonly radio: number
  /** El radio de los bucles (px). */
  readonly bucle: number
}

/** Una raya: dónde empieza, su largo y su ángulo (grados), y desde qué largo del camino (px) la cubre. */
export interface Raya {
  readonly x: number
  readonly y: number
  readonly largo: number
  readonly angulo: number
  readonly desde: number
}

/** De qué punta del texto sale: la derecha o la izquierda, del primer renglón o del último. */
export type Lado = 'derecha' | 'izquierda'
export type Renglon = 'primero' | 'ultimo'

export const TRAZADO = {
  /** Lo más cerca que pasa de un borde de la ventana (px). */
  margen: 12,
  /** El aire con la frase: una parte del lado corto de la ventana, entre dos topes (px). */
  aire: { parte: 0.035, min: 12, max: 28 },
  /** El radio de los bucles, igual; y como mucho una parte del camino base (los tres entran encadenados sin pisarse). */
  bucle: { parte: 0.075, min: 16, max: 72, delLargo: 1 / 7.5 },
  /** Dónde caen los tres bucles, en partes del camino base. */
  dondeLosBucles: [0.22, 0.49, 0.76],
  /** Cuánto se cruza cada bucle consigo mismo (en radios). */
  cruce: 0.25,
  /** El último tramo derecho antes de la punta (px como mucho, y una parte del camino). */
  recta: { max: 60, parte: 0.12 },
  /** Las rayas: el largo y el hueco (px), una parte del lado corto entre topes; el grosor; lo que queda libre antes de la punta. */
  raya: { largo: { parte: 0.016, min: 9, max: 15 }, hueco: { parte: 0.0105, min: 6, max: 9 }, grosor: 2.5, antesDeLaPunta: 4 },
  /** Muestras por tramo de cúbica. */
  muestrasPorTramo: 28,
} as const

const acotar = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))
const mas = (a: Punto, b: Punto): Punto => ({ x: a.x + b.x, y: a.y + b.y })
const menos = (a: Punto, b: Punto): Punto => ({ x: a.x - b.x, y: a.y - b.y })
const por = (a: Punto, k: number): Punto => ({ x: a.x * k, y: a.y * k })
const largoDe = (a: Punto): number => Math.hypot(a.x, a.y)
const unitario = (a: Punto): Punto => {
  const l = largoDe(a)
  return l === 0 ? { x: 0, y: -1 } : por(a, 1 / l)
}
const parte = (p: { readonly parte: number; readonly min: number; readonly max: number }, corto: number): number => acotar(p.parte * corto, p.min, p.max)

/** El centro y el radio del disco del botón (redondo: la mitad del lado corto). */
export const discoDelBoton = (b: Caja): { readonly centro: Punto; readonly radio: number } => ({ centro: { x: b.x + b.ancho / 2, y: b.y + b.alto / 2 }, radio: Math.min(b.ancho, b.alto) / 2 })

/** La caja que abarca todos los renglones. */
export const cajaDeLosRenglones = (r: readonly Caja[]): Caja => {
  const x = Math.min(...r.map((c) => c.x))
  const y = Math.min(...r.map((c) => c.y))
  return { x, y, ancho: Math.max(...r.map((c) => c.x + c.ancho)) - x, alto: Math.max(...r.map((c) => c.y + c.alto)) - y }
}

/**
 * Junta los rectángulos de un `Range` (uno o varios por renglón, en el orden del texto) en un rectángulo por renglón: los que se pisan en
 * altura son del mismo renglón.
 */
export function renglonesDe(rects: readonly Caja[]): Caja[] {
  const renglones: Caja[] = []
  for (const r of rects) {
    if (r.ancho <= 0 || r.alto <= 0) continue
    const i = renglones.findIndex((c) => Math.min(c.y + c.alto, r.y + r.alto) - Math.max(c.y, r.y) > 0.5 * Math.min(c.alto, r.alto))
    if (i < 0) renglones.push(r)
    else renglones[i] = cajaDeLosRenglones([renglones[i], r])
  }
  return renglones.sort((a, b) => a.y - b.y)
}

/** De dónde sale (`sale`, al costado del renglón) y por dónde sube por encima del bloque antes de los bucles (`sube`). */
export function origenDeLaFlecha(renglones: readonly Caja[], lado: Lado, renglon: Renglon, ventana: { readonly ancho: number; readonly alto: number }): { readonly sale: Punto; readonly sube: Punto } {
  const corto = Math.min(ventana.ancho, ventana.alto)
  const g = parte(TRAZADO.aire, corto)
  const m = TRAZADO.margen
  const adentro = (q: Punto): Punto => ({ x: acotar(q.x, m, ventana.ancho - m), y: acotar(q.y, m, ventana.alto - m) })
  const bloque = cajaDeLosRenglones(renglones)
  const r = renglon === 'primero' ? renglones[0] : renglones[renglones.length - 1]
  const y = r.y + 0.4 * r.alto
  const sale = adentro(lado === 'derecha' ? { x: r.x + r.ancho + 0.6 * g, y } : { x: r.x - 0.6 * g, y })
  const sube = adentro({ x: lado === 'derecha' ? bloque.x + bloque.ancho + 1.2 * g : bloque.x - 1.2 * g, y: bloque.y - 1.5 * g })
  return { sale, sube }
}

/** Catmull-Rom uniforme a cúbicas: cada tramo, sus cuatro puntos de control. */
export function cubicasPorLosPuntos(p: readonly Punto[]): (readonly [Punto, Punto, Punto, Punto])[] {
  const tramos: (readonly [Punto, Punto, Punto, Punto])[] = []
  for (let i = 0; i < p.length - 1; i += 1) {
    const p0 = p[Math.max(0, i - 1)]
    const p1 = p[i]
    const p2 = p[i + 1]
    const p3 = p[Math.min(p.length - 1, i + 2)]
    tramos.push([p1, mas(p1, por(menos(p2, p0), 1 / 6)), menos(p2, por(menos(p3, p1), 1 / 6)), p2])
  }
  return tramos
}

/** El camino muestreado (puntos y largo acumulado). */
export function muestrearElCamino(puntos: readonly Punto[], porTramo: number = TRAZADO.muestrasPorTramo): Polilinea {
  const salida: Punto[] = []
  const largos: number[] = []
  let acumulado = 0
  for (const [a, b, c, d] of cubicasPorLosPuntos(puntos)) {
    for (let k = salida.length === 0 ? 0 : 1; k <= porTramo; k += 1) {
      const t = k / porTramo
      const u = 1 - t
      const q = { x: u * u * u * a.x + 3 * u * u * t * b.x + 3 * u * t * t * c.x + t * t * t * d.x, y: u * u * u * a.y + 3 * u * u * t * b.y + 3 * u * t * t * c.y + t * t * t * d.y }
      if (salida.length > 0) acumulado += largoDe(menos(q, salida[salida.length - 1]))
      salida.push(q)
      largos.push(acumulado)
    }
  }
  return { puntos: salida, largos, largo: acumulado }
}

/** El punto del camino a `s` px del principio (interpolado entre muestras). */
export function puntoEn(c: Polilinea, s: number): Punto {
  const v = acotar(s, 0, c.largo)
  let lo = 0
  let hi = c.largos.length - 1
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1
    if (c.largos[mid] <= v) lo = mid
    else hi = mid
  }
  const tramo = c.largos[hi] - c.largos[lo]
  const k = tramo <= 0 ? 0 : (v - c.largos[lo]) / tramo
  return { x: c.puntos[lo].x + (c.puntos[hi].x - c.puntos[lo].x) * k, y: c.puntos[lo].y + (c.puntos[hi].y - c.puntos[lo].y) * k }
}

/** La dirección del camino en `s` (grados, como `atan2` en la pantalla). */
export function anguloEn(c: Polilinea, s: number): number {
  const a = puntoEn(c, Math.max(0, s - 1.5))
  const b = puntoEn(c, Math.min(c.largo, s + 1.5))
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI
}

/** Cuántas veces el camino se cruza consigo mismo (cada bucle, una). Los tramos vecinos no cuentan. */
export function crucesDelCamino(c: Polilinea): number {
  const p = c.puntos
  const cruza = (a: Punto, b: Punto, q: Punto, r: Punto): boolean => {
    const d1 = (b.x - a.x) * (q.y - a.y) - (b.y - a.y) * (q.x - a.x)
    const d2 = (b.x - a.x) * (r.y - a.y) - (b.y - a.y) * (r.x - a.x)
    const d3 = (r.x - q.x) * (a.y - q.y) - (r.y - q.y) * (a.x - q.x)
    const d4 = (r.x - q.x) * (b.y - q.y) - (r.y - q.y) * (b.x - q.x)
    return d1 * d2 < 0 && d3 * d4 < 0
  }
  let n = 0
  for (let i = 0; i < p.length - 1; i += 1) for (let j = i + 2; j < p.length - 1; j += 1) if (cruza(p[i], p[i + 1], p[j], p[j + 1])) n += 1
  return n
}

export function trazarLaFlecha(renglones: readonly Caja[], boton: Caja, ventana: { readonly ancho: number; readonly alto: number }, lado: Lado, renglon: Renglon): Trazado {
  const { margen } = TRAZADO
  const corto = Math.min(ventana.ancho, ventana.alto)
  const g = parte(TRAZADO.aire, corto)
  const adentro = (q: Punto): Punto => ({ x: acotar(q.x, margen, ventana.ancho - margen), y: acotar(q.y, margen, ventana.alto - margen) })
  const { sale, sube } = origenDeLaFlecha(renglones, lado, renglon, ventana)
  const { centro, radio } = discoDelBoton(boton)
  // La punta: en el borde del disco, apuntando a su centro; antes, un tramo derecho.
  const direccion = unitario(menos(centro, sube))
  const punta = menos(centro, por(direccion, radio))
  const recta = Math.min(TRAZADO.recta.max, TRAZADO.recta.parte * largoDe(menos(punta, sube)))
  const llega = menos(punta, por(direccion, recta))
  // El camino base, de la subida a la recta final, y los tres bucles encima.
  const base = menos(llega, sube)
  const largo = largoDe(base)
  const u = unitario(base)
  const rho = Math.min(parte(TRAZADO.bucle, corto), largo * TRAZADO.bucle.delLargo)
  const bloque = cajaDeLosRenglones(renglones)
  const centroDelBloque = { x: bloque.x + bloque.ancho / 2, y: bloque.y + bloque.alto / 2 }
  const normal = { x: -u.y, y: u.x }
  const medio = mas(sube, por(base, 0.5))
  const lejos = normal.x * (medio.x - centroDelBloque.x) + normal.y * (medio.y - centroDelBloque.y) >= 0 ? normal : por(normal, -1)
  const bucles = (n: Punto): Punto[] =>
    TRAZADO.dondeLosBucles.flatMap((f) => {
      const b = mas(sube, por(u, f * largo))
      const k = mas(b, por(n, rho))
      const cruce = por(u, TRAZADO.cruce * rho)
      return [menos(b, cruce), mas(k, por(u, rho)), mas(k, por(n, rho)), menos(k, por(u, rho)), mas(b, cruce)]
    })
  const entran = (pts: readonly Punto[]): boolean =>
    pts.every((q) => q.x >= margen && q.x <= ventana.ancho - margen && q.y >= margen && q.y <= ventana.alto - margen && (q.x < bloque.x - g / 2 || q.x > bloque.x + bloque.ancho + g / 2 || q.y < bloque.y - g / 2 || q.y > bloque.y + bloque.alto + g / 2))
  const delLado = entran(bucles(lejos)) || !entran(bucles(por(lejos, -1))) ? lejos : por(lejos, -1)
  const puntos = [sale, sube, ...bucles(delLado).map(adentro), llega, punta]
  return { puntos, camino: muestrearElCamino(puntos), punta, direccion, centro, radio, bucle: rho }
}

/** Las rayas del camino: rectas de `largo` con `hueco` entre ellas; la última termina `antesDeLaPunta` px antes de la punta. */
export function rayasDeLaFlecha(t: Trazado, ventana: { readonly ancho: number; readonly alto: number }): Raya[] {
  const corto = Math.min(ventana.ancho, ventana.alto)
  const largo = parte(TRAZADO.raya.largo, corto)
  const hueco = parte(TRAZADO.raya.hueco, corto)
  const fin = t.camino.largo - TRAZADO.raya.antesDeLaPunta
  const n = Math.max(0, Math.floor((fin + hueco) / (largo + hueco)))
  const desde0 = Math.max(0, fin - (n * (largo + hueco) - hueco))
  const rayas: Raya[] = []
  for (let i = 0; i < n; i += 1) {
    const desde = desde0 + i * (largo + hueco)
    const a = puntoEn(t.camino, desde)
    const b = puntoEn(t.camino, desde + largo)
    rayas.push({ x: a.x, y: a.y, largo: largoDe(menos(b, a)), angulo: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, desde })
  }
  return rayas
}
