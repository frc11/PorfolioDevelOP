/**
 * [PULIDO 3B] B1 · LA TRANSFORMACIÓN AL CTA DEL FINAL — de «Seis razones para elegirnos» al CTA, una sola (la de `cruce` en
 * PULIDO 2 ganó; `capas`, `relevo`, `giro` y `tipo` se borraron). Todo el CTA va en 3D y en la fuente del registro 1 del hero
 * (Archivo, en mayúsculas): la frase («ESTE SITIO EMPEZÓ CON UNA CHARLA. EL TUYO TAMBIÉN.») y el botón («HABLANOS»).
 *
 *   1 · LAS SEIS RAZONES SE VAN HACIA ATRÁS: cada letra se aleja de la cámara (en cascada, de izquierda a derecha).
 *   2 · ALLÁ ATRÁS, SE TRANSFORMAN EN LA FRASE: cada letra va a su lugar en la frase (`parejasDeLaFrase`): si es la misma
 *       letra, se reordena y se da vuelta sobre su eje horizontal (cambia de fuente); si no, se da vuelta sobre el vertical y
 *       del otro lado es la letra nueva. Las letras de la frase que nadie lleva (la frase es más larga) se despliegan de canto
 *       en su lugar. Letras enteras: nada de partículas ni de morph.
 *   3 · LA FRASE VUELVE HACIA ADELANTE y se coloca en su lugar (en cascada).
 *   4 · «HABLANOS» LLEGA CON EL CRUCE (se solapa con el final de la frase): la cámara sale de adentro de la contraforma de su
 *       «O» y la palabra, extruida hacia la cámara, se asienta en su lugar.
 *
 * FUNCIÓN PURA del progreso (0 a 1, que es función del scroll): reversible, igual a cualquier velocidad y en cualquier
 * dirección. En px CSS de la pantalla (x a la derecha, y hacia abajo, z hacia la cámara) y en el cuerpo de cada letra (px por
 * em): la escena lo lleva a un plano frente a la cámara (`EscenaDelCta.tsx`), detrás del logo, así ninguna letra pasa por
 * delante del logo negro.
 */

/** Una letra en la pantalla: su centro (px), su cuerpo (px por em), su caja (px), su renglón y qué letra es. */
export interface LetraEnPantalla {
  readonly x: number
  readonly y: number
  readonly cuerpo: number
  readonly ancho: number
  readonly alto: number
  readonly renglon: number
  readonly letra: string
}

export interface EscenaDeLaTransformacion {
  /** «Seis razones para elegirnos». */
  readonly origen: readonly LetraEnPantalla[]
  /** La frase del CTA, en sus dos renglones. */
  readonly frase: readonly LetraEnPantalla[]
  /** «HABLANOS». */
  readonly destino: readonly LetraEnPantalla[]
  /** Para cada letra de la frase, la del origen que la lleva (`parejasDeLaFrase`); −1: se despliega sola. */
  readonly parejas: readonly number[]
  readonly pantalla: { readonly ancho: number; readonly alto: number }
  /** La distancia del plano a la cámara, en px del plano (para alejar las letras). */
  readonly fondo: number
  /** Hacia dónde se achica lo que se aleja (px): el punto de fuga, el centro del cuadro. */
  readonly fuga: { readonly x: number; readonly y: number }
}

/** Cómo está una pieza: dónde (px), cuánto gira sobre X y sobre Y (rad), su cuerpo, cuánto se estira su espesor y cuánto se ve. */
export interface Pose {
  x: number
  y: number
  z: number
  rx: number
  ry: number
  escala: number
  profundidad: number
  aparece: number
}

export const nuevaPose = (): Pose => ({ x: 0, y: 0, z: 0, rx: 0, ry: 0, escala: 1, profundidad: 1, aparece: 0 })

/** Lo que la escena dibuja en un cuadro: una pose por letra del origen, de la frase y del destino. */
export interface PosesDeLaTransformacion {
  readonly origen: Pose[]
  readonly frase: Pose[]
  readonly destino: Pose[]
}

/**
 * Los tiempos (fracciones del progreso) y las medidas: cuándo y en cuánto se van (`seVa`, y cuánto se reparte la cascada),
 * hasta dónde (`atras`, veces la distancia del plano: allá se ven ~0,4 de su tamaño), cuándo se transforman allá (`cambia`),
 * cuándo vuelve la frase (`vuelve`) y el cruce de «HABLANOS» (desde, cuánto dura, cuánto se extruye, la contraforma de su
 * «O» en fracciones de su ancho y el tope del espesor en pantalla, en cuerpos).
 */
export const TRANSFORMACION = {
  seVa: [0, 0.2],
  cascada: 0.06,
  atras: 1.4,
  cambia: [0.24, 0.26],
  vuelve: [0.54, 0.18],
  cascadaDeLaFrase: 0.08,
  cruce: { desde: 0.7, dura: 0.26, profundo: 6, contraforma: 0.3, tope: 3 },
} as const

const acotar = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (p: number, desde: number, dura: number): number => acotar((p - desde) / dura)
/** De entrada y de salida, simétrica (cúbica): el gesto de la casa para un movimiento que arranca y frena quieto. */
const suave = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)
const frena = (u: number): number => 1 - (1 - u) ** 3
const entre = (a: number, b: number, u: number): number => a + (b - a) * u

function poner(p: Pose, x: number, y: number, z: number, rx: number, ry: number, escala: number, profundidad: number, aparece: number): void {
  p.x = x
  p.y = y
  p.z = z
  p.rx = rx
  p.ry = ry
  p.escala = escala
  p.profundidad = profundidad
  p.aparece = aparece
}

/** La letra sin acento y en mayúscula: así se reconoce la misma letra en las dos fuentes. */
const base = (c: string): string => c.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase()

/**
 * Qué letra del origen lleva a cada una de la frase: primero la misma letra (la más cercana en el orden de lectura), después
 * las que quedan, en orden. Cada letra del origen lleva a una sola; las de la frase que sobran (−1) se despliegan solas.
 */
export function parejasDeLaFrase(origen: readonly LetraEnPantalla[], frase: readonly LetraEnPantalla[]): number[] {
  const libre = origen.map(() => true)
  const parejas = frase.map(() => -1)
  const enOrden = (i: number, n: number): number => (n <= 1 ? 0 : i / (n - 1))
  frase.forEach((f, j) => {
    let mejor = -1
    let distancia = Infinity
    origen.forEach((o, i) => {
      if (!libre[i] || base(o.letra) !== base(f.letra)) return
      const d = Math.abs(enOrden(i, origen.length) - enOrden(j, frase.length))
      if (d < distancia) [mejor, distancia] = [i, d]
    })
    if (mejor >= 0) {
      parejas[j] = mejor
      libre[mejor] = false
    }
  })
  const quedan = origen.map((_, i) => i).filter((i) => libre[i])
  const sinPareja = frase.map((_, j) => j).filter((j) => parejas[j] < 0)
  // Las que quedan del origen, repartidas a lo largo de la frase (no todas al principio).
  quedan.forEach((i, k) => {
    const j = sinPareja[Math.floor(((k + 0.5) * sinPareja.length) / Math.max(1, quedan.length))]
    if (j !== undefined && parejas[j] < 0) parejas[j] = i
  })
  return parejas
}

/**
 * Lo que se aleja a `z` (negativo) se achica hacia el punto de fuga. Para que un bloque (un renglón, la frase) se vaya hacia
 * atrás EN SU LUGAR de la pantalla, cada letra se ve corrida hacia el centro del bloque en la razón con que se achica (así la
 * palabra se achica entera, sin separarse), y en el plano va corrida hacia afuera del punto de fuga en la razón contraria.
 */
function enLaPantalla(x: number, y: number, centro: { readonly x: number; readonly y: number }, z: number, e: EscenaDeLaTransformacion): { readonly x: number; readonly y: number } {
  const k = (e.fondo - z) / Math.max(1, e.fondo)
  const [vx, vy] = [centro.x + (x - centro.x) / k, centro.y + (y - centro.y) / k]
  return { x: e.fuga.x + (vx - e.fuga.x) * k, y: e.fuga.y + (vy - e.fuga.y) * k }
}

/** El centro de la caja de un grupo de letras (px). */
function centroDe(letras: readonly LetraEnPantalla[]): { readonly x: number; readonly y: number } {
  if (letras.length === 0) return { x: 0, y: 0 }
  let [x0, x1, y0, y1] = [Infinity, -Infinity, Infinity, -Infinity]
  for (const l of letras) {
    x0 = Math.min(x0, l.x - l.ancho / 2)
    x1 = Math.max(x1, l.x + l.ancho / 2)
    y0 = Math.min(y0, l.y - l.alto / 2)
    y1 = Math.max(y1, l.y + l.alto / 2)
  }
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 }
}

/** El orden de una letra en su grupo, de 0 (la primera) a 1 (la última). */
const orden = (i: number, n: number): number => (n <= 1 ? 0 : i / (n - 1))

/** `cruce`: cuántas veces se agranda «HABLANOS» alrededor de su «O» con el progreso `p`: de cubrir la pantalla a 1. */
export function zoomDelCruce(p: number, radio: number, pantalla: { readonly ancho: number; readonly alto: number }): number {
  const X = TRANSFORMACION.cruce
  const tope = Math.hypot(pantalla.ancho, pantalla.alto) / Math.max(1, radio)
  return tope ** (1 - suave(tramo(p, X.desde, X.dura)))
}

/** La «O» de «HABLANOS» (por la que sale la cámara) y el radio de su contraforma (px). */
function ojoDe(destino: readonly LetraEnPantalla[]): { readonly x: number; readonly y: number; readonly radio: number } {
  const o = destino.find((l) => l.letra === 'O') ?? destino[Math.floor(destino.length / 2)]
  return o === undefined ? { x: 0, y: 0, radio: 1 } : { x: o.x, y: o.y, radio: Math.max(1, TRANSFORMACION.cruce.contraforma * o.ancho) }
}

/**
 * Las poses del cuadro con el progreso `p` (las escribe en `s`, sin reservar). En 0, el origen en su lugar y lo demás sin
 * dibujar; en 1, la frase y «HABLANOS» en su lugar y el origen sin dibujar.
 */
export function posesDe(progreso: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const T = TRANSFORMACION
  const p = acotar(progreso)
  const atras = -T.atras * e.fondo
  const deLaFrase = e.frase.map(() => -1)
  e.parejas.forEach((i, j) => {
    if (i >= 0) deLaFrase[j] = i
  })
  const delOrigen = e.origen.map(() => -1)
  e.parejas.forEach((i, j) => {
    if (i >= 0) delOrigen[i] = j
  })
  // Los centros de los bloques: cada renglón del origen y la frase entera.
  const renglones = [...new Set(e.origen.map((l) => l.renglon))]
  const centros = new Map(renglones.map((r) => [r, centroDe(e.origen.filter((l) => l.renglon === r))]))
  const deLaFraseEntera = centroDe(e.frase)
  // 1 · el origen se va hacia atrás (en su lugar de la pantalla); 2 · allá va al lugar de su letra de la frase (primero sube o
  // baja, después corre: no cruza en diagonal) y se da vuelta (el origen, hasta el canto).
  e.origen.forEach((o, i) => {
    const seVa = suave(tramo(p, T.seVa[0] + T.cascada * orden(i, e.origen.length), T.seVa[1]))
    const j = delOrigen[i]
    const f = j >= 0 ? e.frase[j] : o
    const t = tramo(p, T.cambia[0] + 0.06 * orden(i, e.origen.length), T.cambia[1])
    const cambia = suave(t)
    const misma = j >= 0 && base(o.letra) === base(f.letra)
    const giro = Math.PI * cambia
    const z = atras * seVa
    const c = centros.get(o.renglon) ?? deLaFraseEntera
    const ve = enLaPantalla(entre(o.x, f.x, suave(tramo(t, 0.35, 0.65))), entre(o.y, f.y, suave(tramo(t, 0, 0.6))), { x: entre(c.x, deLaFraseEntera.x, suave(tramo(t, 0.35, 0.65))), y: entre(c.y, deLaFraseEntera.y, suave(tramo(t, 0, 0.6))) }, z, e)
    poner(s.origen[i], ve.x, ve.y, z, misma ? giro : 0, misma ? 0 : giro, entre(o.cuerpo, f.cuerpo, cambia), 1, giro < Math.PI / 2 ? 1 : 0)
  })
  // 2 y 3 · la frase: la cara de atrás del giro (o se despliega de canto la que nadie lleva); vuelve adelante en cascada.
  e.frase.forEach((f, j) => {
    const i = deLaFrase[j]
    const vuelve = frena(tramo(p, T.vuelve[0] + T.cascadaDeLaFrase * orden(j, e.frase.length), T.vuelve[1]))
    const z = atras * (1 - vuelve)
    if (i >= 0) {
      const o = e.origen[i]
      const t = tramo(p, T.cambia[0] + 0.06 * orden(i, e.origen.length), T.cambia[1])
      const cambia = suave(t)
      const misma = base(o.letra) === base(f.letra)
      const giro = Math.PI * cambia - Math.PI
      const c = centros.get(o.renglon) ?? deLaFraseEntera
      const ve = enLaPantalla(entre(o.x, f.x, suave(tramo(t, 0.35, 0.65))), entre(o.y, f.y, suave(tramo(t, 0, 0.6))), { x: entre(c.x, deLaFraseEntera.x, suave(tramo(t, 0.35, 0.65))), y: entre(c.y, deLaFraseEntera.y, suave(tramo(t, 0, 0.6))) }, z, e)
      poner(s.frase[j], ve.x, ve.y, z, misma ? giro : 0, misma ? 0 : giro, entre(o.cuerpo, f.cuerpo, cambia), 1, cambia >= 0.5 ? 1 : 0)
      return
    }
    const despliega = suave(tramo(p, T.cambia[0] + T.cambia[1] * 0.4 + 0.1 * orden(j, e.frase.length), T.cambia[1] * 0.6))
    const ve = enLaPantalla(f.x, f.y, deLaFraseEntera, z, e)
    poner(s.frase[j], ve.x, ve.y, z, (Math.PI / 2) * (1 - despliega), 0, f.cuerpo, 1, despliega > 0 ? 1 : 0)
  })
  // 4 · «HABLANOS» con el cruce: sale de adentro de su «O», extruida hacia la cámara, y se asienta.
  const X = T.cruce
  const ojo = ojoDe(e.destino)
  const zoom = zoomDelCruce(p, ojo.radio, e.pantalla)
  const llega = suave(tramo(p, X.desde, X.dura))
  const centro = { x: entre(e.pantalla.ancho / 2, ojo.x, llega), y: entre(e.pantalla.alto / 2, ojo.y, llega) }
  const espesor = 1 + (X.profundo - 1) * (1 - llega)
  e.destino.forEach((d, k) => {
    const profundidad = (espesor * Math.min(zoom, X.tope)) / zoom
    poner(s.destino[k], centro.x + (d.x - ojo.x) * zoom, centro.y + (d.y - ojo.y) * zoom, 0, 0, 0, d.cuerpo * zoom, profundidad, p >= X.desde ? 1 : 0)
  })
}

/**
 * En la lista, el recorrido del bloque clavado del CTA (0 a 1) no es todo transformación: al principio la cámara todavía
 * muestra el logo grande en el centro de la pantalla y las letras negras sobre el logo negro no se leen. La frase aparece
 * cuando el logo ya bajó (`aparece`) y la transformación corre en lo que queda (`desde`). [PULIDO 3B] B1 · con el bloque de
 * tres pantallas (dos de recorrido, antes una) la sección mide más y el logo baja más tarde: medido a 390 × 844, termina de
 * bajar en la mitad del recorrido; la transformación corre en la otra mitad (una pantalla: el doble que antes).
 */
export const LISTA_DEL_CTA = { aparece: [0.42, 0.08] as const, desde: 0.5 } as const

/** La transformación con el recorrido `r` de la lista. */
export const progresoEnLaLista = (r: number): number => tramo(r, LISTA_DEL_CTA.desde, 1 - LISTA_DEL_CTA.desde)

/** Cuánto se ve la frase antes de transformarse con el recorrido `r` de la lista. */
export const entradaEnLaLista = (r: number): number => suave(tramo(r, LISTA_DEL_CTA.aparece[0], LISTA_DEL_CTA.aparece[1]))

/** Sin la escena (sin WebGL), el texto del DOM llega al final, cuando la transformación ya terminó. */
export function llegadaDelTexto(p: number): number {
  return suave(tramo(p, 0.86, 0.14))
}

/** El CTA se puede tocar recién cuando llegó (antes, el botón está en su lugar pero la transformación no terminó). */
export const ctaTocable = (p: number): boolean => p >= 0.97
