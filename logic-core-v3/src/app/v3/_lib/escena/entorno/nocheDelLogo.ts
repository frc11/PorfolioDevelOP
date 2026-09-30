import { AMANECER } from '../amanecer/linea'

/**
 * [ESCENA 10] T1 · LA NOCHE EN EL LOGO — cuánta noche hay donde está el logo (0 de día, 1 de noche): la que decide la
 * luz y las sombras de abajo. De día, la sombra del logo con la principal y la mancha de contacto; de noche, sólo la
 * mancha dura del haz, que es la única luz; y el haz (E1) sólo de noche.
 *
 * Es la noche de la sala (`uNoche`), salvo en el amanecer: ahí la sala pasa a día de un cuadro al otro cuando empieza
 * el barrido, y lo que el frente del día todavía no alcanzó sigue de noche (se oscurece, y el logo guarda su gris de
 * noche hasta que lo alcanza). El logo está en el centro: es lo último que alcanza. Con esta noche, el haz, la mancha y
 * la sombra cambian cuando el frente pasa por el logo (en el ancho del frente), no al empezar el barrido: sin saltos.
 * Pura: el invariante la prueba sin navegador.
 */
export function nocheDelLogo(noche: number, barrido: number, frente: number): number {
  if (barrido < 0.5) return noche
  // `alcanzadoPorElDia` (`amanecer/luz.ts`) en el centro: el mismo `smoothstep` sobre el ancho del frente.
  const u = Math.min(1, Math.max(0, (0 - (frente - AMANECER.ancho)) / (2 * AMANECER.ancho)))
  const alcanzado = u * u * (3 - 2 * u)
  return 1 - (1 - noche) * alcanzado
}
