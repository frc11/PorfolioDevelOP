/**
 * [PULIDO 4] C1 · LA TRANSFORMACIÓN AL CTA DEL FINAL — dos movimientos a la vez, sobre el mismo progreso (0 a 1, función del
 * scroll), que terminan juntos:
 *
 *   [PULIDO 5] D1 · EL GIRO (el de `?cta=giro` de PULIDO 2, recuperado de `2411371a`; reemplaza al cruce, que se borró) ·
 *     «Seis razones para elegirnos» se junta en un cartel de dos caras, del ancho del CTA, que gira sobre Y: en el medio del
 *     giro sólo se ve el canto y del otro lado está «HABLANOS», que se asienta en su lugar.
 *   LA METAMORFOSIS · los seis valores se van un poco hacia atrás, se desarman y se rearman en la frase del CTA («Este sitio
 *     empezó con una charla. El tuyo también.»), que vuelve adelante y se acomoda arriba de «HABLANOS» (`contorno.ts`; [PULIDO 6]
 *     E1 · `fusion` y su bandera se borraron: `contorno` es el producto). Acá, sus tiempos.
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
  /**
   * Dónde se arma el cartel del giro (px de alto: su centro). [PULIDO 5] D1 · en las dos ramas, sobre el lugar del CTA
   * (`armadoSobreElCta`; en `2411371a` el escenario lo armaba a 0,27 del alto y bajaba: hoy ahí se arma la frase).
   */
  readonly armado: number
  /**
   * [PULIDO 6] E1 · lo más alto que puede ser el cartel (px): la franja de «HABLANOS», debajo de la de la frase. Del ancho del
   * CTA, sus dos renglones subían hasta la franja de la frase y, entre 0,3 y 0,5, el giro y la frase que se arma se pisaban.
   * Sin él, el cartel es del ancho del CTA (el de `2411371a`).
   */
  readonly altoDelCartel?: number
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

/** Lo que la escena dibuja del giro en un cuadro: una pose por letra del origen y del destino. */
export interface PosesDeLaTransformacion {
  readonly origen: Pose[]
  readonly destino: Pose[]
}

/**
 * [PULIDO 5] D1 · los tiempos del GIRO (los de PULIDO 2, `2411371a`): lo que tarda en juntarse el cartel, cuándo gira y cuánto,
 * cuánto tarda en asentarse la cara de atrás («HABLANOS», que llega de atrás del cartel), el espesor del cartel (cuerpos del
 * CTA) y el interlineado de sus renglones. Lo único que cambió: `baja` dura 0,34 (era 0,18) y termina en 1, con la frase.
 */
export const TRANSFORMACION = {
  giro: { junta: 0.28, desde: 0.28, gira: 0.4, baja: [0.66, 0.34] as const, espesor: 0.35, renglon: 1.12 },
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

/**
 * [PULIDO 6] E1 · la escala del cartel (de los renglones del origen): del ancho del CTA y, con `altoDelCartel`, no más alta que
 * esa franja (el renglón de arriba con su interlineado y el de abajo con su caja). La comparten el giro y `armadoSobreElCta`.
 */
function cartelDe(origen: readonly LetraEnPantalla[], destino: readonly LetraEnPantalla[], altoDelCartel: number | undefined): { readonly renglones: number[]; readonly cajas: CajaEnPantalla[]; readonly k: number; readonly alto: number } {
  const G = TRANSFORMACION.giro
  const c = cajaDe(destino)
  const renglones = [...new Set(origen.map((l) => l.renglon))].sort((a, b) => a - b)
  const cajas = renglones.map((r) => cajaDe(origen.filter((l) => l.renglon === r)))
  const cuerpo = origen[0]?.cuerpo ?? 1
  const porAncho = c.ancho / Math.max(1, ...cajas.map((b) => b.ancho))
  const ultimo = cajas[cajas.length - 1]
  // Alto del cartel con la escala `k`: (n − 1) interlineados y la caja del último renglón.
  const altoCon = (k: number): number => ((renglones.length - 1) * cuerpo * G.renglon + (ultimo?.alto ?? 0)) * k
  const k = altoDelCartel === undefined ? porAncho : Math.min(porAncho, altoDelCartel / Math.max(1e-6, altoCon(1)))
  return { renglones, cajas, k, alto: cuerpo * k * G.renglon }
}

/**
 * Las poses del giro con el progreso `p` (las escribe en `s`, sin reservar): la de `2411371a`. En 0, el origen en su lugar y el
 * destino sin dibujar; en 1, el destino en su lugar y el origen sin dibujar.
 */
export function posesDe(progreso: number, e: EscenaDeLaTransformacion, s: PosesDeLaTransformacion): void {
  const G = TRANSFORMACION.giro
  const p = acotar(progreso)
  const c = cajaDe(e.destino)
  // El cartel: los renglones del origen, uno abajo del otro y centrados en el CTA, del ancho del CTA ([PULIDO 6] E1 · y no más
  // alto que su franja).
  const { renglones, cajas, k, alto } = cartelDe(e.origen, e.destino, e.altoDelCartel)
  const junta = suave(tramo(p, 0, G.junta))
  const angulo = Math.PI * suave(tramo(p, G.desde, G.gira))
  const baja = suave(tramo(p, G.baja[0], G.baja[1]))
  const [cos, sin] = [Math.cos(angulo), Math.sin(angulo)]
  // El cartel se arma en `armado` y gira ahí; al final la cara de atrás se asienta (y, si se armó en otro lugar, baja al del CTA).
  const corrido = (e.armado - c.y) * (1 - baja)
  e.origen.forEach((l, i) => {
    const r = renglones.indexOf(l.renglon)
    const b = cajas[r]
    const enElCartel = { x: c.x + (l.x - b.x) * k, y: e.armado + (r - (renglones.length - 1) / 2) * alto + (l.y - b.y) * k }
    const dx = entre(l.x, enElCartel.x, junta) - c.x
    poner(s.origen[i], c.x + dx * cos, entre(l.y, enElCartel.y, junta), -dx * sin, 0, angulo, entre(l.cuerpo, l.cuerpo * k, junta), 1, angulo < Math.PI / 2 ? 1 : 0)
  })
  // La cara de atrás: el CTA espejado y detrás del cartel; con el giro entero queda derecho y adelante.
  e.destino.forEach((d, j) => {
    const dx = -(d.x - c.x)
    const dz = -G.espesor * d.cuerpo
    poner(s.destino[j], c.x + dx * cos + dz * sin, d.y + corrido, (-dx * sin + dz * cos) * (1 - baja), 0, angulo + Math.PI, d.cuerpo, 1, angulo >= Math.PI / 2 ? 1 : 0)
  })
}

/**
 * [PULIDO 5] D1 · dónde se arma el cartel (el `armado` del giro, px de alto): con su borde de abajo en el de «HABLANOS». El
 * cartel tiene dos renglones del ancho del CTA y, centrado en él, su renglón de abajo pisaba en la pantalla la cabeza del logo
 * (que en la pose C arranca debajo del lugar del CTA); al girar, la mitad que viene hacia la cámara le pasaba por delante.
 * Así nada del cartel baja del CTA: «HABLANOS» aparece un poco más arriba y baja a su lugar con `baja` (el gesto de
 * `2411371a` para el cartel armado en otro lugar).
 */
export function armadoSobreElCta(origen: readonly LetraEnPantalla[], destino: readonly LetraEnPantalla[], altoDelCartel?: number): number {
  const c = cajaDe(destino)
  const { renglones, cajas, k, alto } = cartelDe(origen, destino, altoDelCartel)
  const ultimo = cajas[cajas.length - 1]
  return c.y + c.alto / 2 - ((renglones.length - 1) / 2) * alto - ((ultimo?.alto ?? 0) * k) / 2
}

/**
 * [PULIDO 5] D1 · el ancho de Archivo en la frase y el CTA: wdth 100. [PULIDO 6] E1 · `?ancho=expandido` (120) se borró.
 * [PULIDO 4] C1 · LA METAMORFOSIS: `contorno` (`contorno.ts`); [PULIDO 6] E1 · `fusion` y `?meta=` se borraron.
 */

/**
 * Los tiempos de la metamorfosis (fracciones del progreso; `[desde, dura]`). Los valores se van atrás (`atras`, hasta `ATRAS`
 * de la distancia del plano: «poco»), cambian (`cambia`: se derriten o cambian de contorno), se cruzan con la frase (`corte`, el
 * disolvente de `fusion`), la frase se limpia (`limpia`) y vuelve adelante (`adelante`), y en `contorno` crece su espesor
 * (`espesor`). Lo último termina en 1, como «HABLANOS» (`TRANSFORMACION.giro.baja`): todo junto. [PULIDO 5] D1 · `contorno`: la
 * turbulencia es una campana suave (`turbulencia`: sube y baja y es CERO exacto desde 0,6, antes de que termine el cambio);
 * los agujeros de la frase se abren al llegar cada letra y, los que faltan, en `limpia`. Formada, la frase queda rígida: lo
 * que sigue es venir adelante y crecer en espesor, sin ondular.
 */
export const METAMORFOSIS = {
  atras: [0, 0.25],
  contorno: { cambia: [0.06, 0.58], turbulencia: [0.08, 0.52], limpia: [0.6, 0.16], adelante: [0.62, 0.38], espesor: [0.64, 0.36] },
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
  /** Cuánto le falta a la frase para quedar limpia (1: la masa; 0: limpia). */
  readonly sucia: number
  /** Cuánto volvió adelante la frase (0: allá atrás; 1: en su lugar). */
  readonly adelante: number
  /** El espesor de la frase (0 a 1). */
  readonly espesor: number
  /** La turbulencia (0 a 1): sube y baja con el cambio. */
  readonly turbulencia: number
}

const [ATRAS_DESDE, ATRAS_DURA] = METAMORFOSIS.atras

/** El estado de la metamorfosis con el progreso `p`. Pura y continua: en 0, los valores en su lugar; en 1, la frase limpia. */
export function estadoDeLaMetamorfosis(progreso: number): EstadoDeLaMetamorfosis {
  const p = acotar(progreso)
  const atras = suave(tramo(p, ATRAS_DESDE, ATRAS_DURA))
  const C = METAMORFOSIS.contorno
  const cambia = tramo(p, C.cambia[0], C.cambia[1])
  // La campana: sin² sobre su tramo (sube y baja con derivada cero en las dos puntas) y cero exacto afuera.
  const t = tramo(p, C.turbulencia[0], C.turbulencia[1])
  const turbulencia = t <= 0 || t >= 1 ? 0 : Math.sin(Math.PI * t) ** 2
  return { atras, cambia, sucia: 1 - suave(tramo(p, C.limpia[0], C.limpia[1])), adelante: frena(tramo(p, C.adelante[0], C.adelante[1])), espesor: suave(tramo(p, C.espesor[0], C.espesor[1])), turbulencia }
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
