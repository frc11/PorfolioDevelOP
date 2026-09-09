/**
 * EL BORDE DE ARRIBA DE LA VENTANA DEL DIFERENCIAL — dónde el fondo deja de
 * llegar a AA, buscado sobre un contraste que YA NO ES MONÓTONO.
 *
 * Sale de `s13b-diferencial.ts` en B8, por la regla de las 300 líneas y por
 * tema: es la única función de ese archivo que depende de la FORMA del arco.
 *
 * ── ⚠️ B8 · QUÉ CUSTODIABA Y POR QUÉ CAMBIÓ ──────────────────────────────────
 *
 * Hasta B8 `cruceDeAA` bisecaba sobre [0, 1] suponiendo que el contraste del
 * peor píxel BAJABA de punta a punta —era la forma del arco viejo, una tarde
 * que se apagaba hasta 0,34 en p=1— y encontraba el cruce en 0,878, después del
 * ancla. B8 pone una noche en Trabajos y sostiene la mañana (0,643) desde el
 * ancla hasta el final (`lightArc.ts`): sobre [0, 1] esa bisección cae en el
 * ATARDECER (0,4882), que es un cruce real pero no es el borde de arriba de la
 * ventana del diferencial —el diferencial ni siquiera está en cuadro ahí—.
 *
 * Lo que se busca ahora es lo que la ventana siempre quiso decir: **desde donde
 * el titular puede quedar limpio, el PRIMER progreso en que el fondo cae bajo
 * AA después de haber estado arriba.** Si no cae, la ventana termina con el
 * recorrido, en 1 — que es lo que pasa desde B8, y lo que `s13b-diferencial`
 * §4 y `s16-anclaje` §5 publican con su consecuencia: el reparto cuantizado
 * de arriba (0,9167) cae adentro por contraste y lo descarta el corrimiento de
 * `tu-panel`, no el fondo.
 */

import { contrasteSobreElFondo } from './s10-logo-lectura'

/** El paso del barrido grueso: 1/128 de progreso, más fino que cualquier pantalla. */
const PASO = 1 / 128

/**
 * El progreso, desde `desde`, en el que el peor píxel del fondo deja de llegar
 * a `umbral` después de haberlo pasado. Devuelve 1 si no vuelve a caer.
 */
export function cruceDeAA(umbral: number, desde: number): number {
  let lo = Number.NaN
  for (let i = 0; ; i += 1) {
    const p = Math.min(1, desde + PASO * i)
    if (contrasteSobreElFondo(p) >= umbral) lo = p
    else if (Number.isFinite(lo)) {
      let hi = p
      for (let k = 0; k < 12; k += 1) {
        const m = (lo + hi) / 2
        if (contrasteSobreElFondo(m) >= umbral) lo = m
        else hi = m
      }
      return (lo + hi) / 2
    }
    if (p >= 1) return 1
  }
}
