/**
 * [B1.2c] EL «?» DE «LA TUYA», ARMÁNDOSE — puro (plan §13, punto 6). En el lenguaje del preloader: se dibuja el trazo (el filo, de
 * punta a punta: `pathLength` nativo y `strokeDashoffset` de 1 a 0, como `IntroLogoStroke`), se rellena con el gris del logo, y el
 * punto cae y rebota como las piezas del pie (`final/reboteDelPie.ts`: la misma restitución y los mismos saltos). Después queda
 * quieto, con poco brillo, de fondo. Entra cuando «la tuya» se activa y al volver a entrar se rearma; con movimiento reducido,
 * aparece armado.
 *
 * Los números del preloader y del rebote viven en módulos que la sección no puede importar (el intro y la escena traen `three` o su
 * grupo de chunks): van acá con su origen, y s76 los compara contra los de allá.
 */

/** El trazo y el relleno del preloader (`HOME_INTRO_PHASES.strokeS` y `.fillS`, s). */
export const SIGNO = {
  trazoS: 0.85,
  rellenoS: 0.45,
  /** El punto: cae desde esto arriba de su lugar (unidades del dibujo) y en este tiempo (s). */
  caida: 300,
  caidaS: 0.35,
  /** El rebote de las piezas del pie (`REBOTE_DEL_PIE`): lo que conserva cada salto de la velocidad y cuántos saltos da. */
  restitucion: 0.45,
  saltos: 3,
  /** Armándose brilla más; armado, queda con el brillo de las marcas de agua (`OPACIDAD_DE_LA_MARCA`) en esto (s). */
  opacidadArmandose: 0.2,
  apagarseS: 0.6,
} as const

/** La gravedad del punto (unidades del dibujo por s²): la que lo baja `caida` en `caidaS`. */
export const GRAVEDAD_DEL_PUNTO = (2 * SIGNO.caida) / SIGNO.caidaS ** 2

/** Cuándo empieza a caer el punto (s, desde que entra): después del trazo y del relleno. */
export const ARRANQUE_DEL_PUNTO_S = SIGNO.trazoS + SIGNO.rellenoS

/** Lo que dura el punto, de la caída al último salto (s). */
export function duracionDelPunto(): number {
  const g = GRAVEDAD_DEL_PUNTO
  let v = Math.sqrt(2 * g * SIGNO.caida)
  let t = SIGNO.caidaS
  for (let k = 0; k < SIGNO.saltos; k += 1) {
    v *= SIGNO.restitucion
    t += (2 * v) / g
  }
  return t
}

/** Cuánto arriba de su lugar está el punto a los `t` s de empezar a caer (unidades del dibujo; 0 en su lugar). */
export function alturaDelPunto(t: number): number {
  const g = GRAVEDAD_DEL_PUNTO
  if (t <= 0) return SIGNO.caida
  if (t < SIGNO.caidaS) return SIGNO.caida - (g * t * t) / 2
  let v = Math.sqrt(2 * g * SIGNO.caida)
  let resto = t - SIGNO.caidaS
  for (let k = 0; k < SIGNO.saltos; k += 1) {
    v *= SIGNO.restitucion
    const dura = (2 * v) / g
    if (resto < dura) return v * resto - (g * resto * resto) / 2
    resto -= dura
  }
  return 0
}

/** Los cuadros clave del punto para Motion (la `y` en unidades del dibujo, hacia abajo positiva, y sus tiempos de 0 a 1). */
export function cuadrosDelPunto(n = 48): { readonly y: number[]; readonly times: number[]; readonly duracionS: number } {
  const duracionS = duracionDelPunto()
  const times = Array.from({ length: n + 1 }, (_, k) => k / n)
  return { y: times.map((f) => -alturaDelPunto(f * duracionS)), times, duracionS }
}

/** Cuándo termina de armarse (s, desde que entra) y empieza a apagarse. */
export const ARMADO_S = ARRANQUE_DEL_PUNTO_S + duracionDelPunto()
