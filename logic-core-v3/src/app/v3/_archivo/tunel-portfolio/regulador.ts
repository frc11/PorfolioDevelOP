/**
 * EL REGULADOR DEL TÚNEL — lo que se muestra no corre más que el efecto. **[PORTFOLIO]**
 *
 * El pedido: con muchos scrolls seguidos el túnel no se puede disparar, y el motor
 * del scroll no se toca. Así que se regula el OBJETIVO que persiguen los dos
 * resortes, y una banda con dos rieles garantiza que al despinearse —para abajo o
 * para arriba— el efecto ya llegó a donde tenía que llegar. Vive aparte de
 * `tunel.ts` por la regla de las 300 líneas; las puntas de los rieles son lugares
 * de la sección y viven en `geometria.ts`.
 */

import {
  DT_MAXIMO_MS,
  RESORTE_DEL_ESCENARIO,
  RESORTE_DEL_TUNEL,
  avanzarElResorte,
  type EstadoDelResorte,
} from './tunel'

// ── El límite de velocidad: el túnel absorbe una ráfaga sin volverse violento ──

/**
 * ⚠️ **LA VELOCIDAD MÁXIMA DEL EFECTO — la del túnel, no la del scroll.** El
 * scroll no se toca: el gesto del visitante siempre gana y hay dos invariantes
 * que lo prohíben. Lo que se regula es el OBJETIVO que persiguen los resortes:
 * nunca avanza más rápido que esto, así que una ráfaga se reparte en el tiempo en
 * vez de dispararse. 500 px/s son cinco muescas por segundo: el túnel entero no
 * se cruza en menos de tres segundos.
 */
export const VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S = 500 // aflojarlo = subirlo

/**
 * Lo que el resorte del túnel se atrasa persiguiendo a un objetivo que va a la
 * velocidad máxima (v·c/k). Es el atraso que la banda tiene que tolerar sin tocar.
 */
export const ATRASO_DEL_RESORTE_PX = (VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S * RESORTE_DEL_TUNEL.amortiguamiento) / RESORTE_DEL_TUNEL.rigidez

/**
 * ⚠️ **LA BANDA — la garantía de que el efecto nunca queda a medio camino.**
 * Regulado el efecto y no la página, el visitante podría salir del pin con el
 * túnel a medio camino. No puede: lo mostrado vive entre dos RIELES, un piso y un
 * techo, que son funciones del scroll y pasan por los lugares de la sección
 * (`geometria.ts`). Un riel es una recta por tramos entre sus puntos y afuera
 * sigue al scroll 1:1; dos puntos con el mismo scroll son un salto, y sólo los
 * hay sobre tramos donde no se ve nada moverse.
 */
export interface PuntoDelRiel {
  readonly scroll: number
  readonly efecto: number
}

export interface BandaDelEfecto {
  readonly piso: readonly PuntoDelRiel[]
  readonly techo: readonly PuntoDelRiel[]
}

export function enElRiel(riel: readonly PuntoDelRiel[], scroll: number): number {
  const primero = riel[0]
  const ultimo = riel[riel.length - 1]
  if (primero === undefined || ultimo === undefined) return scroll
  if (scroll < primero.scroll) return primero.efecto + (scroll - primero.scroll)
  if (scroll >= ultimo.scroll) return ultimo.efecto + (scroll - ultimo.scroll)
  for (let i = 0; i + 1 < riel.length; i += 1) {
    const a = riel[i]
    const b = riel[i + 1]
    if (scroll < b.scroll) return a.efecto + ((b.efecto - a.efecto) * (scroll - a.scroll)) / (b.scroll - a.scroll)
  }
  return ultimo.efecto
}

export function enLaBanda(valor: number, scroll: number, banda: BandaDelEfecto): number {
  return Math.min(enElRiel(banda.techo, scroll), Math.max(enElRiel(banda.piso, scroll), valor))
}

/** Lo que el túnel muestra: el objetivo regulado y los dos resortes, en px de la sección. */
export interface EstadoDelTunelMostrado {
  /** El scroll que vio el cuadro anterior: de él sale a qué velocidad corre un riel. */
  readonly scroll: number
  /** El piso del foco como lo ve el efecto: se toma de un salto y se suelta a la velocidad máxima. */
  readonly levantado: number
  readonly objetivo: number
  readonly tunel: EstadoDelResorte
  readonly escenario: EstadoDelResorte
}

/** Todo quieto en un píxel: el arranque, la vuelta a la pantalla y el piso del foco. */
export function reposoEn(px: number, levantado = 0): EstadoDelTunelMostrado {
  return { scroll: px, levantado, objetivo: px, tunel: { posicion: px, velocidad: 0 }, escenario: { posicion: px, velocidad: 0 } }
}

/**
 * Un cuadro de lo que se muestra: el objetivo persigue al scroll a lo sumo a la
 * velocidad máxima, los dos resortes lo persiguen, y la banda acota a los tres.
 * ⚠️ Un resorte que toca un riel no queda en reposo: lo LLEVA el riel, con su
 * velocidad —acotada a la del scroll y a la velocidad máxima del efecto—. En
 * reposo, al soltarlo arrancaba de cero y el túnel hacía rápido → lento → medio en
 * una sola ráfaga; sin el tope, un scroll que salta en un cuadro (la barra,
 * buscar en la página) le daba 72.000 px/s y el túnel se pasaba y volvía.
 *
 * ⚠️ **EL PISO DEL FOCO NO SE SUELTA DE GOLPE.** Tomarlo es un salto —un foco que
 * aparece de a poco no es un foco—, pero bajarlo (del CTA a una captura, o a
 * nada) baja a la velocidad máxima: soltado de golpe, el scroll que ve la banda
 * saltaba en un cuadro y el túnel hacía un yo-yo.
 *
 * Mientras frena, el objetivo y los resortes quedan quietos y en reposo, así que
 * al soltar no hay salto. La banda gana siempre, freno incluido.
 */
export function avanzarLoMostrado(
  estado: EstadoDelTunelMostrado,
  scrollDeLaPagina: number,
  dtMs: number,
  banda: BandaDelEfecto,
  frenando: boolean,
  pisoDelFoco = 0,
  velocidadMaxima: number = VELOCIDAD_MAXIMA_DEL_EFECTO_PX_S,
): EstadoDelTunelMostrado {
  const segundos = Math.min(Math.max(dtMs, 0), DT_MAXIMO_MS) / 1000
  const paso = velocidadMaxima * segundos
  const levantado = Math.max(pisoDelFoco, estado.levantado - paso)
  const visto = Math.max(scrollDeLaPagina, levantado)
  const arrastre = (riel: readonly PuntoDelRiel[]): number => {
    if (!(segundos > 0)) return 0
    const delRiel = (enElRiel(riel, visto) - enElRiel(riel, estado.scroll)) / segundos
    const delScroll = (visto - estado.scroll) / segundos
    const v = delScroll >= 0 ? Math.min(Math.max(delRiel, 0), delScroll) : Math.max(Math.min(delRiel, 0), delScroll)
    return Math.max(-velocidadMaxima, Math.min(velocidadMaxima, v))
  }
  const acotado = (r: EstadoDelResorte): EstadoDelResorte => {
    const piso = enElRiel(banda.piso, visto)
    const techo = enElRiel(banda.techo, visto)
    if (r.posicion < piso) return { posicion: piso, velocidad: arrastre(banda.piso) }
    if (r.posicion > techo) return { posicion: techo, velocidad: arrastre(banda.techo) }
    return r
  }
  if (frenando) {
    const quieto = (r: EstadoDelResorte): EstadoDelResorte => acotado({ posicion: r.posicion, velocidad: 0 })
    const objetivo = enLaBanda(estado.objetivo, visto, banda)
    return { scroll: visto, levantado, objetivo, tunel: quieto(estado.tunel), escenario: quieto(estado.escenario) }
  }
  const objetivo = enLaBanda(estado.objetivo + Math.max(-paso, Math.min(paso, visto - estado.objetivo)), visto, banda)
  return {
    scroll: visto,
    levantado,
    objetivo,
    tunel: acotado(avanzarElResorte(estado.tunel, objetivo, dtMs)),
    escenario: acotado(avanzarElResorte(estado.escenario, objetivo, dtMs, RESORTE_DEL_ESCENARIO)),
  }
}
