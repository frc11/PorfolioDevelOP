/**
 * [C2-70t] LA DERIVA DEL CARRUSEL DE RESEÑAS (abajo de 1024) — lo puro: la velocidad después de un gesto, el paso en bucle, quién movió la
 * pista y el aviso «Deslizá para ver más». El carrusel se corre solo, despacio y parejo, con el scroll NATIVO de la pista (así el dedo y la
 * rueda siguen andando, y la deriva toma la posición donde la dejaron; un `transform` en la pista, además, cortaría la mezcla de sus
 * textos), y en bucle: la pista lleva dos copias y, al pasar el ancho de una, vuelve ese ancho (las dos se ven iguales: no hay costura).
 * Con movimiento reducido no deriva. El hook que la corre en el navegador es `useDerivaDelCarrusel.ts`.
 */

export const DERIVA = {
  /** px/s: despacio (una tarjeta de ~340 px cruza en ~14 s). */
  velocidad: 24,
  /** s: quieta después del último gesto del usuario (el dedo, la rueda, la inercia, el mouse encima, el foco adentro). */
  espera: 1.2,
  /** s: de 0 a su velocidad, en una curva suave (sin escalón al arrancar ni al llegar). */
  retoma: 1.2,
  /** px: lo que el navegador redondea al escribir el scroll (a píxeles de pantalla) sin que cuente como un gesto del usuario. */
  tolerancia: 1.5,
} as const

/** La velocidad (px/s) a `t` s del último gesto: 0 durante la espera; después sube con una curva suave hasta la de crucero. Quieta con movimiento reducido. */
export function velocidadDeLaDeriva(t: number, quieto: boolean): number {
  if (quieto || !(t > DERIVA.espera)) return 0
  const x = Math.min(1, (t - DERIVA.espera) / DERIVA.retoma)
  return DERIVA.velocidad * x * x * (3 - 2 * x)
}

/** Un paso de `dt` s a `velocidad` px/s, en bucle: la posición vuelve a [0, ancho de una copia). Sin el ancho medido, no envuelve. */
export function pasoDeLaDeriva(posicion: number, velocidad: number, dt: number, anchoDeLaCopia: number): number {
  const siguiente = posicion + velocidad * dt
  if (!(anchoDeLaCopia > 0)) return siguiente
  return ((siguiente % anchoDeLaCopia) + anchoDeLaCopia) % anchoDeLaCopia
}

/** Si la pista no está donde la dejó la deriva (por más de lo que redondea el navegador), la movió el usuario. */
export const laMovioElUsuario = (leida: number, escrita: number): boolean => Math.abs(leida - escrita) > DERIVA.tolerancia

/** El aviso: espera fuera de pantalla, se ve con el carrusel en pantalla y se va con el primer deslizamiento del usuario (para siempre). */
export type EstadoDelAviso = 'esperando' | 'visible' | 'ido'

export function estadoDelAviso(enPantalla: boolean, deslizado: boolean): EstadoDelAviso {
  if (deslizado) return 'ido'
  return enPantalla ? 'visible' : 'esperando'
}
