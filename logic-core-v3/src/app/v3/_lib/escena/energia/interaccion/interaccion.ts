/**
 * [PULIDO 16] N2 · LA INTERACCIÓN CON EL PLASMA (`docs/rediseno/PLASMA.md`), la máquina pura del gesto (los oyentes del DOM,
 * `puntero.ts`). El puntero es una carga, siempre (el mouse sobre la página; el dedo mientras toca). Además:
 *   · CLIC o TOQUE corto: un pulso (una onda que empuja y calienta) con arcos cortos alrededor.
 *   · MANTENER apretado: el puntero se CARGA (su carga, más fuerte: junta y calienta lo que tiene cerca) y al SOLTAR dispara un
 *     arco grande al grupo más denso a su alcance o al logo.
 *   · En el teléfono el arrastre es el scroll: un dedo que se mueve más de `mueveCancela` px cancela el gesto (no pelea con la
 *     página); el gesto es el toque (pulso) o mantener quieto (cargar y soltar).
 *   · Sobre un texto o algo que se cliquea, nada: el gesto es de la página.
 * Pura (la prueba la corre en Node): recibe los tiempos y las posiciones; no lee el reloj ni el DOM.
 */
export const INTERACCION = {
  /** Apretado más de esto (s), empieza a cargar; menos, al soltar es un pulso. */
  mantener: 0.26,
  /** En cuánto se carga del todo (s), y cuánto más fuerte es el puntero cargado (veces su carga). */
  carga: 1.4,
  cargaMaxima: 3,
  /** Un dedo que se mueve más que esto (px) está desplazando la página: se cancela. */
  mueveCancela: 10,
} as const

export interface EstadoDelPuntero {
  /** Dónde (NDC), si es un mouse sobre la página, un dedo que toca, o se fue. */
  x: number
  y: number
  mouse: boolean
  dedo: boolean
  fuera: boolean
  /** El gesto: apretado desde cuándo (ms) y dónde (px); si empezó sobre un texto (no cuenta); si ya carga y cuánto (0 a 1). */
  apretado: boolean
  desde: number
  x0: number
  y0: number
  sobreTexto: boolean
  cargando: boolean
  carga: number
  /** Lo que el cuadro tiene que hacer (y limpia): un pulso, o una descarga con su fuerza (0 a 1). */
  pulso: boolean
  descarga: boolean
  fuerza: number
}

export function crearPuntero(): EstadoDelPuntero {
  return { x: 9, y: 9, mouse: false, dedo: false, fuera: true, apretado: false, desde: 0, x0: 0, y0: 0, sobreTexto: false, cargando: false, carga: 0, pulso: false, descarga: false, fuerza: 0 }
}

/** Aprieta (el botón del mouse o el dedo) en (px, py) a los `ahora` ms; sobre un texto o algo que se cliquea no cuenta. */
export function apretar(e: EstadoDelPuntero, ahora: number, px: number, py: number, sobreTexto: boolean): void {
  e.apretado = true
  e.desde = ahora
  e.x0 = px
  e.y0 = py
  e.sobreTexto = sobreTexto
  e.cargando = false
  e.carga = 0
}

/** El gesto se cancela (el dedo desplaza la página, la ventana pierde el foco): sin pulso ni descarga. */
export function cancelar(e: EstadoDelPuntero): void {
  e.apretado = false
  e.cargando = false
  e.carga = 0
}

/** Se mueve apretado: un dedo que se fue más de `mueveCancela` px está haciendo scroll. */
export function moverApretado(e: EstadoDelPuntero, px: number, py: number, esDedo: boolean): void {
  if (e.apretado && esDedo && Math.hypot(px - e.x0, py - e.y0) > INTERACCION.mueveCancela) cancelar(e)
}

/** Suelta: si cargaba, una descarga con su fuerza; si fue corto, un pulso. */
export function soltar(e: EstadoDelPuntero, ahora: number): void {
  if (!e.apretado) return
  if (!e.sobreTexto) {
    if (e.cargando) {
      e.descarga = true
      e.fuerza = e.carga
    } else if (ahora - e.desde < INTERACCION.mantener * 1000) e.pulso = true
  }
  cancelar(e)
}

/** Un cuadro: apretado más de `mantener`, carga (hasta 1). Devuelve la carga del puntero (veces la suya). */
export function avanzar(e: EstadoDelPuntero, ahora: number, dt: number): number {
  if (e.apretado && !e.sobreTexto && ahora - e.desde >= INTERACCION.mantener * 1000) {
    e.cargando = true
    e.carga = Math.min(1, e.carga + dt / INTERACCION.carga)
  }
  return 1 + (INTERACCION.cargaMaxima - 1) * e.carga
}
