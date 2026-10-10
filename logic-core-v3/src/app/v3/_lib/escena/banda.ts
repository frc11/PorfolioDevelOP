/**
 * [PULIDO 10] J1 · LA BANDA PORTÁTIL — pura, sin `three` (la lee también el DOM).
 *
 * El campo de visión de la cámara es VERTICAL: el logo mide en píxeles una fracción fija del alto de la pantalla, y todo lo
 * que el DOM le reserva está en `svh`. Se calibró a 1440 × 900 y 1920 × 1080 (aspecto 1,6–1,78). Desde 1024 de ancho el texto
 * se reparte en columnas del ANCHO, así que en una pantalla más angosta que 1,6 (1024 × 824 es 1,24) el logo ocupa del ancho
 * más de lo calibrado y choca con el texto: tapaba «LAS 24 HS», cruzaba el párrafo de Quiénes somos, empujaba la frase de Por
 * qué develOP a los bordes y quedaba debajo de HABLANOS.
 *
 * La banda abre el campo de visión vertical lo justo para que el HORIZONTAL no baje del de aspecto 1,6 (con un tope): el logo
 * ocupa del ancho lo mismo que a 1440 × 900. No se mueve la cámara (la pared de la sala está a radio 44 y la pose del pie ya
 * la pone a 40), así que la cinemática, la órbita y lo que se ve detrás quedan iguales: sólo se ve todo un poco más chico.
 * Todo lo que está a la profundidad del logo se achica por el mismo `factor`, y las medidas del DOM en `svh` que dependen
 * del logo se escriben con `enUnidadesDelLogo` (la misma cuenta en CSS). Abajo de 1024, nada: es otra composición.
 *
 * El factor tiene dos términos (el mayor, con tope): el del ASPECTO (1,6 / aspecto) y el del ANCHO (1440 / ancho), porque los
 * márgenes del DOM son píxeles fijos: a 1280 × 800, con el aspecto de 1440 × 900, el texto llega relativamente más a la
 * derecha y «LAS 24 HS» pisaba la «c» del logo. 1440 × 900 y 1920 × 1080 (lo aprobado) quedan en 1. El DOM usa sólo el del
 * aspecto (en CSS no hay producto de anchos por altos): le reserva al logo un poco más de lo que ocupa, nunca menos.
 */
export const BANDA = { aspecto: 1.6, ancho: 1440, tope: 1.45, desde: 1024 } as const

/** Cuánto más chico se ve lo que está a la profundidad del logo (1 = como siempre). */
export function factorDeLaBanda(ancho: number, alto: number): number {
  if (!(ancho >= BANDA.desde) || !(alto > 0)) return 1
  return Math.min(BANDA.tope, Math.max(1, (BANDA.aspecto * alto) / ancho, BANDA.ancho / ancho))
}

/**
 * El factor del cuadro de ahora, que el rig escribe en cada cuadro: lo leen las cámaras que se calculan aparte (la de la
 * lectura de los títulos, la de los planos del CTA), así ven exactamente lo que la viva. Sin escena (los invariantes), 1.
 */
export const BANDA_EN_VIVO = { factor: 1 }

/** El campo de visión vertical (grados) con la banda: `tan` de su mitad, por el factor. */
export function fovDeLaBanda(fovBase: number, ancho: number, alto: number): number {
  return fovConFactor(fovBase, factorDeLaBanda(ancho, alto))
}

export function fovConFactor(fovBase: number, factor: number): number {
  if (factor === 1) return fovBase
  return (2 * Math.atan(factor * Math.tan((fovBase * Math.PI) / 360)) * 180) / Math.PI
}

const n = (v: number): string => String(Math.round(v * 1000) / 1000)

/**
 * Una medida del logo en `svh` (la de factor 1) como CSS, con la banda: `max(q/tope svh, min(q svh, q/aspecto vw))`, que es
 * `q / factor` con el factor de `factorDeLaBanda` (desde 1024: abajo, quien la use la pone en una regla de escritorio).
 */
export function enUnidadesDelLogo(qSvh: number): string {
  return `max(${n(qSvh / BANDA.tope)}svh,min(${n(qSvh)}svh,${n(qSvh / BANDA.aspecto)}vw))`
}
