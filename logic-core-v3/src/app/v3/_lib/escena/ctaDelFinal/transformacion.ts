/**
 * [PULIDO 4] C1 · LA TRANSFORMACIÓN AL CTA DEL FINAL — dos movimientos a la vez, sobre el mismo progreso (0 a 1, función del
 * scroll), que terminan juntos:
 *
 *   EL CRUCE (el de `?cta=cruce` de PULIDO 2, recuperado tal cual: `2411371a`) · «Seis razones para elegirnos» se extruye
 *     hacia la cámara y se agranda alrededor de la contraforma de su «o» hasta que la cubre entera: del otro lado está
 *     «HABLANOS», que se asienta en su lugar.
 *   LA METAMORFOSIS (lo nuevo) · los seis valores se van un poco hacia atrás, se desarman y se rearman en la frase del CTA
 *     («Este sitio empezó con una charla. El tuyo también.»), que vuelve adelante y se acomoda arriba de «HABLANOS».
 *     Dos técnicas, con `?meta=` (`fusion`, la del producto, y `contorno`): `fusion.ts` y `contorno.ts`. Acá, sus tiempos.
 *
 * FUNCIÓN PURA del progreso: reversible, igual a cualquier velocidad y en cualquier dirección (`s55` lo recorre en pasos
 * chicos, ida y vuelta). En px CSS de la pantalla (x a la derecha, y hacia abajo, z hacia la cámara) y en el cuerpo de cada
 * letra (px por em): la escena lo lleva a un plano frente a la cámara (`EscenaDelCta.tsx`), detrás del logo.
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

/** Una caja de la pantalla por su centro (px). */
export interface CajaEnPantalla {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export interface EscenaDeLaTransformacion {
  /** «Seis razones para elegirnos». */
  readonly origen: readonly LetraEnPantalla[]
  /** «HABLANOS». */
  readonly destino: readonly LetraEnPantalla[]
  readonly pantalla: { readonly ancho: number; readonly alto: number }
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

/** Lo que la escena dibuja del cruce en un cuadro: una pose por letra del origen y del destino. */
export interface PosesDeLaTransformacion {
  readonly origen: Pose[]
  readonly destino: Pose[]
}

/**
 * Los tiempos del cruce (los de PULIDO 2, `2411371a`): la extrusión hacia la cámara (hasta cuántas veces su espesor), el viaje
 * por la «o», su contraforma (fracción del ancho de la «o»), cuándo la contraforma cubre la pantalla, el tope del espesor en
 * pantalla (cuerpos) y el asiento de «HABLANOS». [PULIDO 4] C1 · `seVa`: la frase se apaga (con el tramado) mientras su
 * contraforma pasa de cubrir el `seVa[0]` al `seVa[1]` de la diagonal: con la «o» centrada, ya no queda tinta en la pantalla
 * (antes se apagaba de golpe en el 0,5: el mismo cuadro, sin el salto que `s55` no deja).
 */
export const TRANSFORMACION = {
  cruce: { extruye: 0.22, profundo: 6, desde: 0.16, dura: 0.54, contraforma: 0.3, seVa: [0.42, 0.5] as const, topeDelEspesor: 3, asienta: 0.3 },
} as const

const acotar = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (p: number, desde: number, dura: number): number => acotar((p - desde) / dura)
/** De entrada y de salida, simétrica (cúbica): el gesto de la casa para un movimiento que arranca y frena quieto. */
export const suave = (u: number): number => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2)
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

/**
 * Las poses del cruce con el progreso `p` (las escribe en `s`, sin reservar). En 0, el origen en su lugar y el destino sin
 * dibujar; en 1, el destino en su lugar y el origen sin dibujar.
 */
export function posesDe(progreso: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const X = TRANSFORMACION.cruce
  const p = acotar(progreso)
  const c = cajaDe(e.destino)
  const ojo = ojoDe(e.origen)
  const extruye = suave(tramo(p, 0, X.extruye))
  const zoom = zoomDelCruce(p, ojo.radio, e.pantalla)
  const viaje = suave(tramo(p, X.desde, X.dura))
  const centro = { x: entre(ojo.x, c.x, viaje), y: entre(ojo.y, c.y, viaje) }
  const hueco = ojo.radio * zoom
  const diagonal = Math.hypot(e.pantalla.ancho, e.pantalla.alto)
  // La frase se va cuando la contraforma ya cubre la pantalla entera (la cámara pasó del otro lado).
  const queda = 1 - tramo(hueco / diagonal, X.seVa[0], X.seVa[1] - X.seVa[0])
  const espesor = 1 + (X.profundo - 1) * extruye
  e.origen.forEach((l, i) => {
    const escala = l.cuerpo * zoom
    // El espesor crece hacia la cámara (la cara de adelante se acerca), con un tope en pantalla: nunca llega a la cámara.
    const profundidad = (espesor * Math.min(zoom, X.topeDelEspesor)) / zoom
    const z = (espesor - 1) * 0.14 * l.cuerpo * Math.min(zoom, X.topeDelEspesor)
    poner(s.origen[i], centro.x + (l.x - ojo.x) * zoom, centro.y + (l.y - ojo.y) * zoom, z, 0, 0, escala, profundidad, queda)
  })
  // El CTA, detrás: se ve recién cuando la contraforma lo contiene entero, y se asienta (viene un poco de atrás).
  const radioDelCta = Math.hypot(c.ancho, c.alto) / 2
  const revela = suave(acotar((hueco - 0.8 * radioDelCta) / (0.5 * radioDelCta)))
  const asienta = frena(tramo(p, 1 - X.asienta, X.asienta))
  e.destino.forEach((d, j) => {
    poner(s.destino[j], d.x, d.y, -(1 - asienta) * 1.2 * d.cuerpo, 0, 0, d.cuerpo * entre(0.86, 1, asienta), 1, revela)
  })
}

/**
 * [PULIDO 4] C1 · LA METAMORFOSIS, sus variantes (`?meta=`): `fusion` (la del producto) — las mallas de los valores se derriten
 * con ruido hacia la zona de la frase y la frase nace de ese estado deformado, con un disolvente de umbral de ruido entre las
 * dos (en el medio son una sola masa); `contorno` — los contornos de las letras de los valores se interpolan con turbulencia
 * hasta los de la frase (remuestreados a la misma cantidad de puntos) y la frase crece en espesor al asentarse.
 */
export const VARIANTES_DE_LA_METAMORFOSIS = ['fusion', 'contorno'] as const
export type VarianteDeLaMetamorfosis = (typeof VARIANTES_DE_LA_METAMORFOSIS)[number]

/**
 * Los tiempos de la metamorfosis (fracciones del progreso; `[desde, dura]`). Los valores se van atrás (`atras`, hasta `ATRAS`
 * de la distancia del plano: «poco»), cambian (`cambia`: se derriten o cambian de contorno), se cruzan con la frase (`corte`, el
 * disolvente de `fusion`), la frase se limpia (`limpia`) y vuelve adelante (`adelante`), y en `contorno` crece su espesor
 * (`espesor`). Lo último termina en 1, como «HABLANOS» (`TRANSFORMACION.cruce.asienta`): todo junto.
 */
export const METAMORFOSIS = {
  atras: [0, 0.25],
  fusion: { derrite: [0.06, 0.16], cambia: [0.12, 0.36], corte: [0.32, 0.26], limpia: [0.44, 0.44], adelante: [0.6, 0.4] },
  contorno: { cambia: [0.08, 0.56], limpia: [0.64, 0.24], adelante: [0.64, 0.36], espesor: [0.66, 0.34] },
} as const

/**
 * El relevo de los valores (fracción del progreso): el DOM se apaga y la escena los prende con su tramado, en el mismo lugar
 * (el CSS 3D del DOM y el volumen de la escena no se ven idénticos: cambiar de golpe se notaba). `aPlano`: en ese tiempo la
 * escena los lleva de donde se ven (con la columna en el plano del título) a su lugar plano, pegado a la pantalla.
 */
export const RELEVO_DE_LOS_VALORES = { tramado: 0.03, aPlano: 0.18 } as const
export const apareceDeLosValores = (p: number): number => tramo(p, 0, RELEVO_DE_LOS_VALORES.tramado)
export const valoresAPlano = (p: number): number => suave(tramo(p, 0, RELEVO_DE_LOS_VALORES.aPlano))

/** Hasta dónde se van atrás los valores (y dónde se arma la masa): fracción de la distancia del plano a la cámara. */
export const ATRAS = 0.22

export interface EstadoDeLaMetamorfosis {
  /** Cuánto se fueron atrás los valores (0 a 1). */
  readonly atras: number
  /** Cuánto cambiaron (0 a 1; cada vértice o contorno con su demora). */
  readonly cambia: number
  /** El umbral del disolvente (0: todo valores; 1: toda frase). En `contorno`, el cambio entero. */
  readonly corte: number
  /** Cuánto le falta a la frase para quedar limpia (1: la masa; 0: limpia). */
  readonly sucia: number
  /** Cuánto volvió adelante la frase (0: allá atrás; 1: en su lugar). */
  readonly adelante: number
  /** El espesor de la frase (0 a 1; en `fusion`, siempre 1). */
  readonly espesor: number
  /** La turbulencia (0 a 1): sube y baja con el cambio. */
  readonly turbulencia: number
}

const [ATRAS_DESDE, ATRAS_DURA] = METAMORFOSIS.atras

/** El estado de la metamorfosis `v` con el progreso `p`. Pura y continua: en 0, los valores en su lugar; en 1, la frase limpia. */
export function estadoDeLaMetamorfosis(v: VarianteDeLaMetamorfosis, progreso: number): EstadoDeLaMetamorfosis {
  const p = acotar(progreso)
  const atras = suave(tramo(p, ATRAS_DESDE, ATRAS_DURA))
  if (v === 'fusion') {
    const F = METAMORFOSIS.fusion
    const cambia = tramo(p, F.cambia[0], F.cambia[1])
    const sucia = 1 - tramo(p, F.limpia[0], F.limpia[1])
    // Se derriten en su lugar antes de irse y siguen derretidos hasta el cruce con la frase (la frase se limpia por su cuenta).
    const derrite = suave(tramo(p, F.derrite[0], F.derrite[1])) * (1 - suave(tramo(p, F.corte[0], F.corte[1] + 0.1)))
    return { atras, cambia, corte: suave(tramo(p, F.corte[0], F.corte[1])), sucia, adelante: frena(tramo(p, F.adelante[0], F.adelante[1])), espesor: 1, turbulencia: derrite }
  }
  const C = METAMORFOSIS.contorno
  const cambia = tramo(p, C.cambia[0], C.cambia[1])
  return { atras, cambia, corte: cambia >= 1 ? 1 : 0, sucia: 1 - tramo(p, C.limpia[0], C.limpia[1]), adelante: frena(tramo(p, C.adelante[0], C.adelante[1])), espesor: suave(tramo(p, C.espesor[0], C.espesor[1])), turbulencia: cambia >= 1 ? 0 : Math.sin(Math.PI * cambia) }
}

/**
 * En la lista, el recorrido del bloque clavado del CTA (0 a 1) no es todo transformación: al principio la cámara todavía
 * muestra el logo grande en el centro de la pantalla y las letras negras sobre el logo negro no se leen. El origen aparece
 * cuando el logo ya bajó (`aparece`) y la transformación corre en lo que queda (`desde`). [PULIDO 3B] B1 · con el bloque de
 * tres pantallas (dos de recorrido) el logo termina de bajar en la mitad: la transformación corre en la otra mitad.
 */
export const LISTA_DEL_CTA = { aparece: [0.42, 0.08] as const, desde: 0.5 } as const

/** La transformación con el recorrido `r` de la lista. */
export const progresoEnLaLista = (r: number): number => tramo(r, LISTA_DEL_CTA.desde, 1 - LISTA_DEL_CTA.desde)

/** Cuánto se ve el origen antes de transformarse con el recorrido `r` de la lista. */
export const entradaEnLaLista = (r: number): number => suave(tramo(r, LISTA_DEL_CTA.aparece[0], LISTA_DEL_CTA.aparece[1]))

/** Sin la escena (sin WebGL), el texto del DOM llega al final, cuando la transformación ya terminó. */
export function llegadaDelTexto(p: number): number {
  return suave(tramo(p, 0.86, 0.14))
}

/** El CTA se puede tocar recién cuando llegó (antes, el botón está en su lugar pero la transformación no terminó). */
export const ctaTocable = (p: number): boolean => p >= 0.97
