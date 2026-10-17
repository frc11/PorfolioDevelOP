/**
 * [ESCENA 4] EL TÚNEL DE TRABAJOS, EN EL PROGRESO DE LA ESCENA — lo que no se dibuja ahí adentro (estrellas, fugaces, formación).
 *
 * [B1] El túnel se fue al archivo y su lugar lo ocupa el selector del Portfolio. La ventana conserva el nombre y ahora arranca en
 * el PIN del selector (decisión de la aprobación de B1: estrellas, fugaces y la formación se apagan desde que entra el panel). La
 * escena no importa nada de las secciones, así que el número se trae y el invariante (`s30-escena4`) lo re-deriva de la sección:
 *
 * - el pin cae a una pantalla del arranque del progreso de Trabajos (900 px de la regla, `portfolio/pasos.ts`);
 * - ese progreso arranca una pantalla antes de la caja, que empieza el solape antes de la pantalla de su nudo (0,5): el pin queda
 *   en la pantalla del nudo menos el solape, y los nudos ponen ahí p = 0,475 (la escena descuenta el selector desde el pin, así que
 *   el número no depende del paso).
 *
 * Termina donde termina el tramo de Trabajos (0,625): después, Servicios y Tu panel tapan la sala y la escena no dibuja.
 */
export const TUNEL_EN_LA_ESCENA = { desde: 0.475, hasta: 0.625 } as const

/** Cuánto antes del túnel empieza a irse lo que no va adentro. */
export const FUNDIDO_ANTES_DEL_TUNEL = 0.006

/** 1 fuera del túnel, 0 adentro, con un fundido corto antes de entrar. */
export function fueraDelTunel(progreso: number): number {
  const { desde, hasta } = TUNEL_EN_LA_ESCENA
  if (progreso > hasta || progreso < desde - FUNDIDO_ANTES_DEL_TUNEL) return 1
  if (progreso >= desde) return 0
  const u = (desde - progreso) / FUNDIDO_ANTES_DEL_TUNEL
  return u * u * (3 - 2 * u)
}
