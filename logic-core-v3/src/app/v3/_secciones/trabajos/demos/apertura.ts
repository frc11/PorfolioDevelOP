/**
 * LA APERTURA DE UNA DEMO — de la pieza a la ventana, en dos tiempos. **[DEMOS]**
 *
 * Todo es puro: cajas y curvas. Quien escribe estilo es `VentanaDeDemo`.
 *
 *   1. LÍQUIDO (180 ms): la pieza se desprende y se estira hacia el centro. Su
 *      centro recorre el 40 % del camino pero su tamaño sólo el 12 %: por eso se
 *      ESTIRA. El filtro de desplazamiento arranca fuerte y cae a cero, y se
 *      aplica sólo acá, con la ventana todavía chica: en una superficie grande
 *      un `feDisplacementMap` es caro.
 *   2. SÓLIDO (450 ms): un resorte CRÍTICO (ζ = 1, sin rebote) la lleva al tamaño
 *      final. Al asentarse aparece el cromo.
 *
 * Cerrar es la misma línea de tiempo al revés, hacia la caja de la pieza.
 *
 * ⚠️ **SE ANIMA LA CAJA, NO UNA ESCALA.** Una escala no uniforme de la ventana
 * final deformaría la portada; animando lado y posición, la portada con
 * `object-fit: cover` es la cara de la pieza en el primer cuadro y un recorte
 * cada vez más ancho después. Lo que no se redimensiona es la demo: el iframe
 * nace con su tamaño final y la ventana lo va descubriendo.
 */

export interface Caja {
  readonly x: number
  readonly y: number
  readonly ancho: number
  readonly alto: number
}

export const MS_DEL_LIQUIDO = 180
export const MS_DEL_SOLIDO = 450
/** Movimiento reducido: sin líquido ni resorte, un fundido con una escala corta. */
export const MS_DEL_FUNDIDO = 200
export const ESCALA_DEL_FUNDIDO = 0.96

/** Cuánto recorre el líquido: el centro va lejos y el tamaño poco, y eso es el estirón. */
const LIQUIDO = { centro: 0.4, tamano: 0.12 } as const
/** El desplazamiento del filtro al desprenderse, en px del mapa. Cae a cero. */
export const INTENSIDAD_DEL_LIQUIDO = 22

/** La proporción de la ventana: la de la ventana del CTA, 16:10. */
export const RELACION_DE_LA_VENTANA = 16 / 10
/** Grande pero no a pantalla completa: la escena atenuada se ve alrededor. */
export const FRACCION_DEL_ANCHO = 0.8
export const FRACCION_DEL_ALTO = 0.82

export function cajaFinal(anchoDeLaPantalla: number, altoDeLaPantalla: number): Caja {
  const ancho = Math.min(anchoDeLaPantalla * FRACCION_DEL_ANCHO, altoDeLaPantalla * FRACCION_DEL_ALTO * RELACION_DE_LA_VENTANA)
  const alto = ancho / RELACION_DE_LA_VENTANA
  return { x: (anchoDeLaPantalla - ancho) / 2, y: (altoDeLaPantalla - alto) / 2, ancho, alto }
}

const mezclar = (a: number, b: number, t: number): number => a + (b - a) * t

/** Una caja entre dos, moviendo el centro y el tamaño por separado. */
export function entre(a: Caja, b: Caja, centro: number, tamano: number): Caja {
  const cx = mezclar(a.x + a.ancho / 2, b.x + b.ancho / 2, centro)
  const cy = mezclar(a.y + a.alto / 2, b.y + b.alto / 2, centro)
  const ancho = mezclar(a.ancho, b.ancho, tamano)
  const alto = mezclar(a.alto, b.alto, tamano)
  return { x: cx - ancho / 2, y: cy - alto / 2, ancho, alto }
}

/** Resorte crítico normalizado: 0 → 1 sin pasarse nunca de 1. */
export function resorteCritico(t: number): number {
  const u = Math.min(1, Math.max(0, t))
  if (u >= 1) return 1
  const w = 10
  return 1 - (1 + w * u) * Math.exp(-w * u)
}

export interface PoseDeLaVentana {
  readonly caja: Caja
  /** Intensidad del filtro de desplazamiento; 0 = sin filtro. */
  readonly liquido: number
  /** Cuánto se ve la portada encima de la demo, de 1 a 0. */
  readonly portada: number
}

/**
 * La pose a los `ms` de la apertura. Cerrar la recorre al revés: se le pasa
 * `MS_DEL_LIQUIDO + MS_DEL_SOLIDO − ms`.
 */
export function poseDeLaApertura(ms: number, origen: Caja, destino: Caja): PoseDeLaVentana {
  const medio = entre(origen, destino, LIQUIDO.centro, LIQUIDO.tamano)
  if (ms <= MS_DEL_LIQUIDO) {
    const t = Math.max(0, ms) / MS_DEL_LIQUIDO
    const suave = t * t
    return {
      caja: entre(origen, medio, suave, suave),
      liquido: INTENSIDAD_DEL_LIQUIDO * (1 - t),
      portada: 1,
    }
  }
  const s = resorteCritico((ms - MS_DEL_LIQUIDO) / MS_DEL_SOLIDO)
  return { caja: entre(medio, destino, s, s), liquido: 0, portada: 1 - s }
}

export const MS_DE_LA_APERTURA = MS_DEL_LIQUIDO + MS_DEL_SOLIDO
