/**
 * [ESCENA 4] EL TÚNEL DE TRABAJOS, EN EL PROGRESO DE LA ESCENA — lo que no se dibuja ahí adentro.
 *
 * La escena no importa nada de las secciones, así que el túnel se trae como número y el invariante
 * (`s30-escena4`) lo re-deriva de la sección para que no envejezca callado:
 *
 * - el túnel arranca cuando el cartel empieza a huir: `ventanaDelTunel(3).desde` = 0,27154 del
 *   progreso de Trabajos (`_secciones/trabajos/geometria.ts`);
 * - ese progreso corre de `top bottom` a `bottom bottom` de una caja de 7,57 pantallas que empieza en
 *   la pantalla 4,6, así que cae en la pantalla 4,6 + 7,57 × 0,27154 = 6,6556;
 * - y los nudos del anclaje ponen ahí p = 0,5 + 0,125 × (6,6556 − 6) / 7,17 = 0,51143.
 *
 * Termina donde termina el tramo de Trabajos (0,625): después, Servicios y Tu panel tapan la sala y
 * la escena no dibuja. El túnel mostrado puede llegar más tarde que el scroll (lo regula un resorte),
 * nunca antes: esconder desde el arranque del scroll es lo prudente.
 */
export const TUNEL_EN_LA_ESCENA = { desde: 0.51143, hasta: 0.625 } as const

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
