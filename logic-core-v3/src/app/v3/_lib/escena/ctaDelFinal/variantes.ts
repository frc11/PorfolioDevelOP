import type { VarianteDelCta } from '../entorno'

/**
 * [PULIDO 2] 5 · LAS TRANSFORMACIONES DEL CTA DEL FINAL — de «Seis razones» al CTA («HABLANOS», en la fuente del registro 1
 * del hero), cada una FUNCIÓN PURA del progreso (0 a 1, que es función del scroll): reversible, igual a cualquier velocidad
 * y en cualquier dirección (F2). Nada de partículas: letras enteras que se mueven, giran y cambian.
 *
 *   capas  · «seis razones, una acción»: los seis valores se pliegan (en el DOM, `plegadoDelValor`) y de cada pliegue sale
 *            una capa del CTA que vuela al centro; se apilan y la pila ES la extrusión del CTA (seis capas de espesor).
 *   relevo · cada letra de «Seis razones» gira 180° sobre X (un cartel de aeropuerto, en 3D) y en su cara de atrás está la
 *            letra del CTA, en cascada de izquierda a derecha; las letras del CTA vuelan a su lugar. Las que sobran se
 *            acuestan y se van.
 *   giro   · la frase se junta en un cartel de dos caras que gira sobre Y: en el medio del giro sólo se ve el canto (una
 *            línea) y del otro lado está el CTA.
 *   cruce  · «Seis razones» se extruye hacia la cámara y la cámara entra por la contraforma de la «o»: del otro lado está el CTA.
 *   tipo   · la fuente es variable (`wght` de 100 a 900, las dos): cada letra se afina hasta el peso 100 mientras viaja, se
 *            cambia por la del CTA en ese peso y la del CTA engorda hasta 700.
 *
 * Todo en px CSS de la pantalla (x a la derecha, y hacia abajo, z hacia la cámara) y en el cuerpo de cada letra (px por em):
 * la escena lo lleva a un plano frente a la cámara (`EscenaDelCta.tsx`), así que el giro de la cámara entre los valores y el
 * CTA no la deforma.
 */

/** Una letra (o una capa) en la pantalla: su centro (px), su cuerpo (px por em), su caja (px), su renglón y qué letra es. */
export interface LetraEnPantalla {
  readonly x: number
  readonly y: number
  readonly cuerpo: number
  readonly ancho: number
  readonly alto: number
  readonly renglon: number
  readonly letra: string
}

/** Una caja de la pantalla por su centro (px): un valor de `capas`. */
export interface CajaEnPantalla {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface EscenaDeLaTransformacion {
  readonly origen: readonly LetraEnPantalla[]
  readonly destino: readonly LetraEnPantalla[]
  /** Para cada letra del destino, la del origen que la lleva (`parejas`); −1: ninguna. */
  readonly parejas: readonly number[]
  readonly valores: readonly CajaEnPantalla[]
  readonly pantalla: { readonly ancho: number; readonly alto: number }
  /**
   * Dónde se arma lo que se arma antes de llegar (el cartel de `giro`, la pila de `capas`), px de alto: en el escenario, arriba
   * (en la altura de la frase, donde no está el logo, que en la mitad de la ventana todavía está en el centro); en la lista,
   * en el lugar del CTA. Ahí se arma y al final baja al lugar del CTA.
   */
  readonly armado: number
}

/**
 * Cómo está una pieza: dónde (px), cuánto gira sobre X y sobre Y (rad, alrededor de su centro), su cuerpo (px por em), cuánto
 * se estira su espesor (1: el de siempre), cuánto se ve (0 a 1: el tramado de la escena; 0, no se dibuja) y cuánto se afinó
 * (`tipo`: 0 su peso, 1 el 100).
 */
export interface Pose {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  escala: number
  profundidad: number
  aparece: number
  fino: number
}

export const nuevaPose = (): Pose => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, escala: 1, profundidad: 1, aparece: 0, fino: 0 })

/** Lo que la escena dibuja en un cuadro: una pose por letra del origen, del destino y por capa (`capas`). */
export interface PosesDeLaTransformacion {
  readonly origen: Pose[]
  readonly destino: Pose[]
  readonly capas: Pose[]
}

/** Cuántas capas tiene la pila de `capas` (una por valor). */
export const CAPAS_DEL_CTA = 6

/**
 * Los tiempos de cada una (fracciones del progreso) y sus medidas. `relevo`: cuándo arranca la cascada, cuánto se reparte
 * entre la primera letra y la última, cuánto dura un giro, cuánto el vuelo al lugar del CTA, cuánto se levanta en el vuelo
 * (fracción de su recorrido) y cuántos cuerpos se van las que sobran.
 */
export const TRANSFORMACION = {
  relevo: { inicio: 0.04, cascada: 0.3, giro: 0.24, vuelo: 0.32, arco: 0.18, seVan: 3 },
  /** `giro`: lo que tarda en juntarse el cartel, cuándo gira y cuánto, cuánto tarda en asentarse y el espesor del cartel (em del CTA). */
  giro: { junta: 0.28, desde: 0.28, gira: 0.4, baja: [0.66, 0.18] as const, espesor: 0.35, renglon: 1.12 },
  /** `cruce`: la extrusión hacia la cámara (hasta cuántas veces su espesor), el viaje por la «o» y el tope del espesor en pantalla (cuerpos). */
  cruce: { extruye: 0.22, profundo: 6, desde: 0.16, dura: 0.54, contraforma: 0.3, cubre: 0.5, topeDelEspesor: 3, asienta: 0.3 },
  /** `tipo`: la cascada, lo que tarda en afinarse, el viaje, en qué parte del viaje se cambian las letras y lo que tarda en engordar. */
  tipo: { inicio: 0.04, cascada: 0.3, afina: 0.24, demora: 0.1, vuelo: 0.44, cambio: [0.42, 0.58] as const, engorda: 0.3 },
  /** `capas`: el pliegue de cada valor (y el paso entre uno y otro), el vuelo de cada capa, el aire entre capas (cuerpos) y el giro final. */
  capas: { pliega: 0.22, paso: 0.035, desde: 0.22, pasoDeVuelo: 0.035, vuela: 0.34, aire: 0.5, junta: [0.64, 0.12] as const, gira: [0.6, 0.2] as const, giro: 0.5, baja: [0.68, 0.16] as const },
  /**
   * El texto del DOM que acompaña al CTA («Este sitio empezó con una charla. El tuyo también.») llega al final, cuando el CTA
   * ya está en su lugar (todas lo dejan ahí antes de 0,9): nada le pasa por encima.
   */
  texto: { desde: 0.86, dura: 0.14 },
} as const

const acotar = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (p: number, desde: number, dura: number): number => acotar((p - desde) / dura)
/** De entrada y de salida, simétrica (cúbica): el gesto de la casa para un movimiento que arranca y frena quieto. */
const suave = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)
const frena = (u: number): number => 1 - (1 - u) ** 3
const entre = (a: number, b: number, u: number): number => a + (b - a) * u

function poner(p: Pose, x: number, y: number, z: number, rx: number, ry: number, escala: number, profundidad: number, aparece: number, fino: number): void {
  p.x = x
  p.y = y
  p.z = z
  p.rx = rx
  p.ry = ry
  p.escala = escala
  p.profundidad = profundidad
  p.aparece = aparece
  p.fino = fino
}

const enReposo = (p: Pose, l: LetraEnPantalla, aparece: number): void => poner(p, l.x, l.y, 0, 0, 0, l.cuerpo, 1, aparece, 0)

/** La caja de un grupo de letras: su centro y su ancho y alto (px). */
export function cajaDe(letras: readonly LetraEnPantalla[]): CajaEnPantalla {
  if (letras.length === 0) return { x: 0, y: 0, ancho: 0, alto: 0 }
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const l of letras) {
    x0 = Math.min(x0, l.x - l.ancho / 2)
    x1 = Math.max(x1, l.x + l.ancho / 2)
    y0 = Math.min(y0, l.y - l.alto / 2)
    y1 = Math.max(y1, l.y + l.alto / 2)
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2, ancho: x1 - x0, alto: y1 - y0 }
}

/**
 * Qué letra del origen lleva a cada una del destino (`relevo` y `tipo`): las más cercanas al CTA (en el escenario, las de
 * los dos lados del logo: las últimas de «razones» y las primeras de «para»), de izquierda a derecha.
 */
export function parejas(origen: readonly LetraEnPantalla[], destino: readonly LetraEnPantalla[]): number[] {
  const c = cajaDe(destino)
  const cercanas = origen
    .map((l, i) => ({ i, d: Math.hypot(l.x - c.x, (l.y - c.y) * 0.5) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, destino.length)
    .map((q) => q.i)
    .sort((a, b) => origen[a].x - origen[b].x || origen[a].renglon - origen[b].renglon)
  return destino.map((_, j) => cercanas[j] ?? -1)
}

/** El orden de la cascada de una letra del origen: su x en la frase, de 0 (la primera de la izquierda) a 1 (la última). */
function ordenes(origen: readonly LetraEnPantalla[]): (i: number) => number {
  let [x0, x1] = [Infinity, -Infinity]
  for (const l of origen) {
    x0 = Math.min(x0, l.x)
    x1 = Math.max(x1, l.x)
  }
  const ancho = Math.max(1e-6, x1 - x0)
  return (i) => (origen[i].x - x0) / ancho
}

/** De cada letra del origen, a qué letra del destino lleva (−1: ninguna, sobra). */
function delOrigen(e: EscenaDeLaTransformacion): number[] {
  const m = e.origen.map(() => -1)
  e.parejas.forEach((i, j) => {
    if (i >= 0) m[i] = j
  })
  return m
}

/** El destino que no tiene quién lo lleve llega solo, en su lugar, al final. */
const llegaSolo = (pose: Pose, d: LetraEnPantalla, p: number): void => enReposo(pose, d, suave(tramo(p, 0.6, 0.3)))

function relevo(p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const R = TRANSFORMACION.relevo
  const orden = ordenes(e.origen)
  const pareja = delOrigen(e)
  e.origen.forEach((l, i) => {
    const a = R.inicio + R.cascada * orden(i)
    const j = pareja[i]
    if (j < 0) {
      // Sobra: se acuesta hacia atrás sobre su base y se va (hacia el fondo), desvaneciéndose al final.
      const u = suave(tramo(p, a, R.giro + 0.08))
      const angulo = (-Math.PI / 2) * u
      const medio = l.alto / 2
      poner(s.origen[i], l.x, l.y + medio - medio * Math.cos(angulo), medio * Math.sin(angulo) - u * R.seVan * l.cuerpo, angulo, 0, l.cuerpo, 1, 1 - suave(tramo(u, 0.5, 0.5)), 0)
      return
    }
    // El cartel: la letra gira sobre su eje horizontal; pasado el canto se ve su cara de atrás, que es la del CTA.
    const giro = Math.PI * suave(tramo(p, a, R.giro))
    poner(s.origen[i], l.x, l.y, 0, giro, 0, l.cuerpo, 1, giro < Math.PI / 2 ? 1 : 0, 0)
    const d = e.destino[j]
    const vuelo = suave(tramo(p, a + R.giro, R.vuelo))
    const z = Math.sin(Math.PI * vuelo) * R.arco * Math.hypot(d.x - l.x, d.y - l.y)
    poner(s.destino[j], entre(l.x, d.x, vuelo), entre(l.y, d.y, vuelo), z, giro - Math.PI, 0, entre(l.cuerpo, d.cuerpo, vuelo), 1, giro >= Math.PI / 2 ? 1 : 0, 0)
  })
  e.destino.forEach((d, j) => {
    if ((e.parejas[j] ?? -1) < 0) llegaSolo(s.destino[j], d, p)
  })
}

function giro(p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const G = TRANSFORMACION.giro
  const c = cajaDe(e.destino)
  // El cartel: los renglones del origen, uno abajo del otro y centrados en el CTA, del ancho del CTA.
  const renglones = [...new Set(e.origen.map((l) => l.renglon))].sort((a, b) => a - b)
  const cajas = renglones.map((r) => cajaDe(e.origen.filter((l) => l.renglon === r)))
  const k = c.ancho / Math.max(1, ...cajas.map((b) => b.ancho))
  const cuerpo = e.origen[0]?.cuerpo ?? 1
  const alto = cuerpo * k * G.renglon
  const junta = suave(tramo(p, 0, G.junta))
  const angulo = Math.PI * suave(tramo(p, G.desde, G.gira))
  const baja = suave(tramo(p, G.baja[0], G.baja[1]))
  const [cos, sin] = [Math.cos(angulo), Math.sin(angulo)]
  // El cartel se arma arriba (en `armado`) y gira ahí; al final baja al lugar del CTA (y la cara de atrás se asienta).
  const corrido = (e.armado - c.y) * (1 - baja)
  e.origen.forEach((l, i) => {
    const r = renglones.indexOf(l.renglon)
    const b = cajas[r]
    const enElCartel = { x: c.x + (l.x - b.x) * k, y: e.armado + (r - (renglones.length - 1) / 2) * alto + (l.y - b.y) * k }
    const dx = entre(l.x, enElCartel.x, junta) - c.x
    poner(s.origen[i], c.x + dx * cos, entre(l.y, enElCartel.y, junta), -dx * sin, 0, angulo, entre(l.cuerpo, l.cuerpo * k, junta), 1, angulo < Math.PI / 2 ? 1 : 0, 0)
  })
  // La cara de atrás: el CTA espejado y detrás del cartel; con el giro entero queda derecho y adelante.
  e.destino.forEach((d, j) => {
    const dx = -(d.x - c.x)
    const dz = -G.espesor * d.cuerpo
    poner(s.destino[j], c.x + dx * cos + dz * sin, d.y + corrido, (-dx * sin + dz * cos) * (1 - baja), 0, angulo + Math.PI, d.cuerpo, 1, angulo >= Math.PI / 2 ? 1 : 0, 0)
  })
}

/** La «o» por la que entra la cámara (la primera de la frase) y el radio de su contraforma (px). */
function ojoDe(origen: readonly LetraEnPantalla[]): { readonly x: number; readonly y: number; readonly radio: number } {
  const o = origen.find((l) => l.letra === 'o') ?? origen[Math.floor(origen.length / 2)]
  return o === undefined ? { x: 0, y: 0, radio: 1 } : { x: o.x, y: o.y, radio: Math.max(1, TRANSFORMACION.cruce.contraforma * o.ancho) }
}

/** `cruce`: cuántas veces se agranda la frase (alrededor de la «o») con el progreso `p`: hasta que la contraforma cubre la pantalla. */
export function zoomDelCruce(p: number, radio: number, pantalla: { readonly ancho: number; readonly alto: number }): number {
  const X = TRANSFORMACION.cruce
  const tope = Math.hypot(pantalla.ancho, pantalla.alto) / radio
  return tope ** suave(tramo(p, X.desde, X.dura))
}

function cruce(p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const X = TRANSFORMACION.cruce
  const c = cajaDe(e.destino)
  const ojo = ojoDe(e.origen)
  const extruye = suave(tramo(p, 0, X.extruye))
  const zoom = zoomDelCruce(p, ojo.radio, e.pantalla)
  const viaje = suave(tramo(p, X.desde, X.dura))
  const centro = { x: entre(ojo.x, c.x, viaje), y: entre(ojo.y, c.y, viaje) }
  const hueco = ojo.radio * zoom
  // La frase se va cuando la contraforma ya cubre la pantalla entera (la cámara pasó del otro lado).
  const cubierta = hueco >= X.cubre * Math.hypot(e.pantalla.ancho, e.pantalla.alto)
  const espesor = 1 + (X.profundo - 1) * extruye
  e.origen.forEach((l, i) => {
    const escala = l.cuerpo * zoom
    // El espesor crece hacia la cámara (la cara de adelante se acerca), con un tope en pantalla: nunca llega a la cámara.
    const profundidad = (espesor * Math.min(zoom, X.topeDelEspesor)) / zoom
    const z = (espesor - 1) * 0.14 * l.cuerpo * Math.min(zoom, X.topeDelEspesor)
    poner(s.origen[i], centro.x + (l.x - ojo.x) * zoom, centro.y + (l.y - ojo.y) * zoom, z, 0, 0, escala, profundidad, cubierta ? 0 : 1, 0)
  })
  // El CTA, detrás: se ve recién cuando la contraforma lo contiene entero, y se asienta (viene un poco de atrás).
  const radioDelCta = Math.hypot(c.ancho, c.alto) / 2
  const revela = suave(acotar((hueco - 0.8 * radioDelCta) / (0.5 * radioDelCta)))
  const asienta = frena(tramo(p, 1 - X.asienta, X.asienta))
  e.destino.forEach((d, j) => {
    poner(s.destino[j], d.x, d.y, -(1 - asienta) * 1.2 * d.cuerpo, 0, 0, d.cuerpo * entre(0.86, 1, asienta), 1, revela, 0)
  })
}

function tipo(p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const T = TRANSFORMACION.tipo
  const orden = ordenes(e.origen)
  const pareja = delOrigen(e)
  e.origen.forEach((l, i) => {
    const a = T.inicio + T.cascada * orden(i)
    const fino = suave(tramo(p, a, T.afina))
    const j = pareja[i]
    if (j < 0) {
      // Sobra: se afina hasta el hilo y se apaga en su lugar.
      poner(s.origen[i], l.x, l.y, 0, 0, 0, l.cuerpo, 1, 1 - suave(tramo(p, a + T.afina * 0.6, 0.25)), fino)
      return
    }
    const d = e.destino[j]
    const vuelo = suave(tramo(p, a + T.demora, T.vuelo))
    const cambio = suave(tramo(vuelo, T.cambio[0], T.cambio[1] - T.cambio[0]))
    const [x, y, escala] = [entre(l.x, d.x, vuelo), entre(l.y, d.y, vuelo), entre(l.cuerpo, d.cuerpo, vuelo)]
    poner(s.origen[i], x, y, 0, 0, 0, escala, 1, 1 - cambio, fino)
    // La del CTA nace en el peso 100 y engorda hasta el suyo después del cambio.
    const engorda = suave(tramo(p, a + T.demora + T.vuelo * 0.5, T.engorda))
    poner(s.destino[j], x, y, 0, 0, 0, escala, 1, cambio, 1 - engorda)
  })
  e.destino.forEach((d, j) => {
    if ((e.parejas[j] ?? -1) < 0) llegaSolo(s.destino[j], d, p)
  })
}

/** `capas`: cuánto se plegó el valor `k` (0 a 1: de frente a de canto, 90° sobre X). Lo aplica el DOM. */
export function plegadoDelValor(k: number, p: number): number {
  const C = TRANSFORMACION.capas
  return suave(tramo(p, C.paso * k, C.pliega))
}

function capas(p: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const C = TRANSFORMACION.capas
  const c = cajaDe(e.destino)
  const cuerpo = e.destino[0]?.cuerpo ?? 1
  const anchoEnEm = c.ancho / cuerpo
  const aire = (1 - suave(tramo(p, C.junta[0], C.junta[1]))) * C.aire * cuerpo
  const vuelta = C.giro * Math.sin(Math.PI * tramo(p, C.gira[0], C.gira[1]))
  // La pila se arma arriba (en `armado`) y al final baja al lugar del CTA.
  const pila = entre(e.armado, c.y, suave(tramo(p, C.baja[0], C.baja[1])))
  for (let k = 0; k < CAPAS_DEL_CTA; k += 1) {
    const v = e.valores[k] ?? { x: c.x, y: pila, ancho: c.ancho, alto: c.alto }
    const t = tramo(p, C.desde + C.pasoDeVuelo * k, C.vuela)
    const u = suave(t)
    // Sale de canto del pliegue de su valor, del ancho del valor; se abre de frente mientras vuela a la pila y se apila.
    const z = (CAPAS_DEL_CTA - 1 - k) * aire * u
    poner(s.capas[k], entre(v.x, c.x, u), entre(v.y, pila, u), z, entre(-Math.PI / 2, 0, frena(t)), vuelta, entre(v.ancho / Math.max(1e-6, anchoEnEm), cuerpo, u), 1, t > 0 ? 1 : 0, 0)
  }
}

/**
 * Las poses del cuadro para la variante `v` con el progreso `p` (lo escribe en `s`, sin reservar). En 0, el origen en su
 * lugar y el destino sin dibujar; en 1, el destino en su lugar y el origen sin dibujar (en `capas`, la pila entera).
 */
export function posesDe(v: VarianteDelCta, progreso: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const p = acotar(progreso)
  // Las piezas que la variante no usa, sin dibujar.
  for (const pose of s.capas) pose.aparece = 0
  if (v === 'capas') {
    // La frase se va como hoy (sus títulos de volumen); el CTA son las capas.
    for (const pose of s.origen) pose.aparece = 0
    for (const pose of s.destino) pose.aparece = 0
    capas(p, e, s)
    return
  }
  if (v === 'relevo') relevo(p, e, s)
  else if (v === 'giro') giro(p, e, s)
  else if (v === 'cruce') cruce(p, e, s)
  else tipo(p, e, s)
}

/**
 * En la lista, el recorrido del bloque clavado del CTA (0 a 1) no es todo transformación: al principio la cámara todavía
 * muestra el logo grande en el centro de la pantalla (baja entre el 30 y el 45 % del recorrido, medido a 390 × 844), y las
 * letras negras sobre el logo negro no se leen. La copia de la frase aparece cuando el logo ya bajó (`aparece`) y la
 * transformación corre en lo que queda (`desde`).
 */
export const LISTA_DEL_CTA = { aparece: [0.38, 0.12] as const, desde: 0.5 } as const

/** La transformación con el recorrido `r` de la lista. */
export const progresoEnLaLista = (r: number): number => tramo(r, LISTA_DEL_CTA.desde, 1 - LISTA_DEL_CTA.desde)

/** Cuánto se ve la frase antes de transformarse con el recorrido `r` de la lista. */
export const entradaEnLaLista = (r: number): number => suave(tramo(r, LISTA_DEL_CTA.aparece[0], LISTA_DEL_CTA.aparece[1]))

/** El texto del DOM que acompaña al CTA: cuánto llegó (0 a 1). */
export function llegadaDelTexto(p: number): number {
  return suave(tramo(p, TRANSFORMACION.texto.desde, TRANSFORMACION.texto.dura))
}

/** El CTA se puede tocar recién cuando llegó (antes, el botón está en su lugar pero la transformación no terminó). */
export const ctaTocable = (p: number): boolean => p >= 0.97
