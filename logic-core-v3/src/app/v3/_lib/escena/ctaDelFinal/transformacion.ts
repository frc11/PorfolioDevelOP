/**
 * [PULIDO 4] C1 · LA TRANSFORMACIÓN AL CTA DEL FINAL — dos movimientos a la vez, sobre el mismo progreso (0 a 1, función del
 * scroll), que terminan juntos:
 *
 *   [PULIDO 5] D1 · EL GIRO (el de `?cta=giro` de PULIDO 2, recuperado de `2411371a`; reemplaza al cruce, que se borró) ·
 *     «Seis razones para elegirnos» se junta en un cartel de dos caras, del ancho del CTA, que gira sobre Y: en el medio del
 *     giro sólo se ve el canto y del otro lado está «HABLANOS», que se asienta en su lugar.
 *   LOS VALORES · los seis valores se vuelven la frase del CTA («Este sitio empezó con una charla. El tuyo también.»), arriba
 *     de «HABLANOS» ([PULIDO 8] G1 · el volteo, `volteo.ts`; la metamorfosis `contorno` se borró con su código).
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
  const [cos, sin] = [Math.cos(angulo), Math.sin(angulo)]
  // El cartel se arma en `armado` y gira ahí; al final la cara de atrás se asienta (y, si se armó en otro lugar, baja al del CTA).
  e.origen.forEach((l, i) => {
    const r = renglones.indexOf(l.renglon)
    const b = cajas[r]
    const enElCartel = { x: c.x + (l.x - b.x) * k, y: e.armado + (r - (renglones.length - 1) / 2) * alto + (l.y - b.y) * k }
    const dx = entre(l.x, enElCartel.x, junta) - c.x
    poner(s.origen[i], c.x + dx * cos, entre(l.y, enElCartel.y, junta), -dx * sin, 0, angulo, entre(l.cuerpo, l.cuerpo * k, junta), 1, angulo < Math.PI / 2 ? 1 : 0)
  })
  // La cara de atrás: el CTA espejado y detrás del cartel; con el giro entero queda derecho y adelante.
  e.destino.forEach((d, j) => {
    enLaCaraDelCta(p, c, e.armado, d, d.cuerpo, PUNTO)
    poner(s.destino[j], PUNTO.x, PUNTO.y, PUNTO.z, 0, angulo + Math.PI, d.cuerpo, 1, angulo >= Math.PI / 2 ? 1 : 0)
  })
}

const PUNTO = { x: 0, y: 0, z: 0 }

/**
 * [PULIDO 8] G2 · DÓNDE VA UN PUNTO DE LA CARA DE «HABLANOS» con el giro (px; y hacia abajo, z hacia la cámara): `d` es su lugar
 * final, `c` la caja del CTA y `cuerpo` el suyo. La misma cuenta para sus letras, su subrayado y las esquinas del enlace del DOM.
 */
export function enLaCaraDelCta(progreso: number, c: CajaEnPantalla, armado: number, d: { readonly x: number; readonly y: number }, cuerpo: number, salida: { x: number; y: number; z: number }): void {
  const G = TRANSFORMACION.giro
  const p = acotar(progreso)
  const angulo = Math.PI * suave(tramo(p, G.desde, G.gira))
  const baja = suave(tramo(p, G.baja[0], G.baja[1]))
  const [cos, sin] = [Math.cos(angulo), Math.sin(angulo)]
  const dx = -(d.x - c.x)
  const dz = -G.espesor * cuerpo
  salida.x = c.x + dx * cos + dz * sin
  salida.y = d.y + (armado - c.y) * (1 - baja)
  salida.z = (-dx * sin + dz * cos) * (1 - baja)
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

/** [PULIDO 5] D1 · el ancho de Archivo en la frase y el CTA: wdth 100. [PULIDO 6] E1 · `?ancho=expandido` (120) se borró. */

/**
 * El relevo de los valores (fracción del progreso): el DOM se apaga y la escena los prende con su tramado, en el mismo lugar
 * (el CSS 3D del DOM y el volumen de la escena no se ven idénticos: cambiar de golpe se notaba). `aPlano`: en ese tiempo la
 * escena los lleva de donde se ven (con la columna en el plano del título) a su lugar plano, pegado a la pantalla.
 */
export const RELEVO_DE_LOS_VALORES = { tramado: 0.03, aPlano: 0.18 } as const
export const apareceDeLosValores = (p: number): number => tramo(p, 0, RELEVO_DE_LOS_VALORES.tramado)
export const valoresAPlano = (p: number): number => suave(tramo(p, 0, RELEVO_DE_LOS_VALORES.aPlano))

/**
 * En la lista, el recorrido del bloque clavado del CTA (0 a 1) no es todo transformación: al principio la cámara todavía
 * muestra el logo grande en el centro de la pantalla y las letras negras sobre el logo negro no se leen. El origen aparece
 * cuando el logo ya bajó (`aparece`) y la transformación corre en lo que queda (`desde`). [PULIDO 3B] B1 · con el bloque de
 * tres pantallas (dos de recorrido) el logo termina de bajar en la mitad: la transformación corre en la otra mitad.
 * [PULIDO 11] A4 · J9 e · sin la transformación (el deslizamiento): el logo ya está abajo a r ≈ 0,1 (medido a 390 y a 768), así
 * que el tramo arranca en 0,2 (era 0,5: una pantalla de scroll con el logo solo) y el deslizamiento corre de 0,2 a 0,6.
 */
export const LISTA_DEL_CTA = { aparece: [0.12, 0.08] as const, desde: 0.2 } as const

/** La transformación con el recorrido `r` de la lista. */
export const progresoEnLaLista = (r: number): number => tramo(r, LISTA_DEL_CTA.desde, 1 - LISTA_DEL_CTA.desde)

/** Cuánto se ve el origen antes de transformarse con el recorrido `r` de la lista. */
export const entradaEnLaLista = (r: number): number => suave(tramo(r, LISTA_DEL_CTA.aparece[0], LISTA_DEL_CTA.aparece[1]))

/** Sin la escena (sin WebGL), el texto del DOM llega al final, cuando la transformación ya terminó. */
export function llegadaDelTexto(p: number): number {
  return suave(tramo(p, 0.86, 0.14))
}

/** [PULIDO 8] G2 · cuánto de su ancho le muestra a la cámara la cara de «HABLANOS» en el giro (−1, de espaldas; 0, de canto; 1, de frente). */
export const caraDelCta = (p: number): number => -Math.cos(Math.PI * suave(tramo(acotar(p), TRANSFORMACION.giro.desde, TRANSFORMACION.giro.gira)))

/**
 * [PULIDO 11] A4 · J9 e · ABAJO DE 1024 (la lista) EL CTA SE DESLIZA: sin «Seis razones» que reaparezcan, sin volteo y sin giro.
 * La frase («Este sitio empezó con una charla. El tuyo también.») entra desde la izquierda y «HABLANOS» desde la derecha, en
 * volumen, ya formados y anclados en la sala; en el mismo tramo del recorrido (terminan juntos: el progreso de la lista hasta
 * `hasta`, de 0,2 a 0,6 del recorrido del bloque clavado), función del scroll y reversibles. «HABLANOS» se puede tocar apenas
 * se lee (`tocable` del deslizamiento).
 */
export const DESLIZAMIENTO_EN_LA_LISTA = { hasta: 0.5, tocable: 0.9 } as const
export const deslizadoEnLaLista = (p: number): number => suave(tramo(acotar(p), 0, DESLIZAMIENTO_EN_LA_LISTA.hasta))
export const tocableEnLaLista = (p: number): boolean => deslizadoEnLaLista(p) >= DESLIZAMIENTO_EN_LA_LISTA.tocable

/** [PULIDO 8] G2 · desde cuánto de su ancho se lee: pasó el canto y mira a la cámara. */
export const CARA_LEGIBLE = 0.3

/** El CTA se puede tocar apenas su cara se lee en el giro, aunque todavía se mueva ([PULIDO 8] G2; era recién al llegar, en 0,97). */
export const ctaTocable = (p: number): boolean => caraDelCta(p) >= CARA_LEGIBLE
