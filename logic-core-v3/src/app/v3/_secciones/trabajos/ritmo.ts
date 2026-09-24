/**
 * EL RITMO DEL TÚNEL POR ANCHO — la misma tabla, recorrida más despacio abajo de
 * 1024, y el techo que la baja entera al volver. **[MÓVIL 2]**
 *
 * La tabla no se toca (`tunel.ts`): cada capa sigue con sus puntas y sus distancias.
 * Lo que cambia por ancho es cuánto SCROLL cuesta recorrerla. Un teléfono barre una
 * pantalla con un dedo, así que con la tabla a su ritmo de escritorio cada proyecto
 * duraba medio gesto antes de que naciera el siguiente. Abajo de 1024 el túnel se
 * estira entero por un factor, la sección crece exactamente lo que el túnel se
 * estiró, y un reloj pasa el scroll de la página al píxel de la tabla: antes del
 * túnel es el mismo, adentro corre 1/k, y después va corrido. Así el cartel, la
 * espera, la salida y los demos no cambian de largo, y todo lo que ya habla en
 * píxeles de la tabla —rieles, regulador, histéresis, demos— sigue igual.
 */

import type { CSSProperties } from 'react'

import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'

import { BANDA_DEL_EFECTO, HUIDA_DEL_CARTEL, PX_DE_LA_SECCION, pxDeLaSeccion } from './geometria'
import type { BandaDelEfecto } from './regulador'
import { PX_DEL_TUNEL } from './tunel'

/**
 * ⚠️ **CUÁNTO SE ESTIRA EL TÚNEL EN CADA ANCHO.** Escritorio y portátil: 1, la
 * tabla a su ritmo. Tablet: una vez y media. Teléfono: el doble. Es el único
 * parámetro por ancho del túnel, y el alto que la sección suma sale de él.
 */
export const ESTIRAMIENTO_DEL_TUNEL = { escritorio: 1, tablet: 1.5, movil: 2 } as const

/** El arranque del túnel en px de la tabla: donde el cartel empieza a huir. */
export const PX_DEL_ARRANQUE_DEL_TUNEL = pxDeLaSeccion(HUIDA_DEL_CARTEL.bajando.desde)

/** Las pantallas que la sección suma para un estiramiento: lo que el túnel se alargó. */
export function pantallasExtra(estiramiento: number): number {
  return ((estiramiento - 1) * PX_DEL_TUNEL) / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
}

/**
 * Las variables que leen las clases de la sección animada (`Trabajos.tsx`): el
 * estiramiento de cada ancho y lo que dura el túnel en pantallas. La clase que elige
 * el ancho escribe `--estiramiento-en-uso`, y de ahí salen el alto y el reloj.
 */
export const ESTILO_DEL_RITMO = {
  '--estiramiento-tablet': String(ESTIRAMIENTO_DEL_TUNEL.tablet),
  '--estiramiento-movil': String(ESTIRAMIENTO_DEL_TUNEL.movil),
  '--tunel-en-pantallas': (PX_DEL_TUNEL / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA).toFixed(6),
} as CSSProperties

/**
 * EL RELOJ: un píxel de la sección estirada (contado contra 900, como todo) al píxel
 * de la tabla. Continuo y creciente, así que un scroll que baja nunca hace volver
 * al túnel.
 */
export function pxDeLaTabla(px: number, estiramiento: number): number {
  const k = estiramiento > 1 ? estiramiento : 1
  const a = PX_DEL_ARRANQUE_DEL_TUNEL
  if (px <= a) return px
  if (px <= a + k * PX_DEL_TUNEL) return a + (px - a) / k
  return px - (k - 1) * PX_DEL_TUNEL
}

/** El progreso de la sección estirada al progreso de la tabla. Con 1, la identidad. */
export function progresoDeLaTabla(progreso: number, estiramiento: number): number {
  if (!(estiramiento > 1)) return progreso
  const px = progreso * (PX_DE_LA_SECCION + (estiramiento - 1) * PX_DEL_TUNEL)
  return pxDeLaTabla(px, estiramiento) / PX_DE_LA_SECCION
}

/**
 * ⚠️ **EL TECHO ANGOSTO — subiendo, el túnel llega a 0 donde arranca, no arriba del pin.**
 *
 * El techo de escritorio (`geometria.ts`) garantiza lo mostrado recién donde el pin
 * se suelta arriba, y en el medio deja al túnel hasta 451 px por encima del scroll:
 * baja a 0,82 de la velocidad de la página. Con una rueda casi no se alcanza; con un
 * dedo la página siempre corre más que el regulador, así que se llegaba a la altura
 * del cartel con El Garage todavía grande y Esquina adentro. Abajo de 1024 el techo
 * suma UN punto: toca al scroll en el arranque del túnel. Nunca pasa por debajo del
 * scroll, así que bajando no ata a nadie; subiendo, en el túnel lo mostrado corre a
 * lo sumo 1,19 veces la página y en el arranque ya está en 0.
 */
export const BANDA_DEL_EFECTO_ANGOSTA: BandaDelEfecto = {
  piso: BANDA_DEL_EFECTO.piso,
  techo: [
    BANDA_DEL_EFECTO.techo[0],
    { scroll: PX_DEL_ARRANQUE_DEL_TUNEL, efecto: PX_DEL_ARRANQUE_DEL_TUNEL },
    ...BANDA_DEL_EFECTO.techo.slice(1),
  ],
}

/** Lo que el túnel lee del CSS en el que vive: el estiramiento de su ancho y su banda. */
export interface RitmoDelAncho {
  readonly estiramiento: number
  readonly banda: BandaDelEfecto
}

export const RITMO_DE_ESCRITORIO: RitmoDelAncho = { estiramiento: ESTIRAMIENTO_DEL_TUNEL.escritorio, banda: BANDA_DEL_EFECTO }

/**
 * El ritmo de un valor de `--estiramiento-en-uso`. La variable existe sólo abajo de
 * 1024 (la escriben dos variantes `max-`): vacía es escritorio. La sección no mide el
 * ancho —`s7-contrato` §5—; lee lo que el CSS ya decidió.
 */
export function ritmoDelValor(valor: string): RitmoDelAncho {
  const k = Number.parseFloat(valor)
  if (!Number.isFinite(k) || k < 1) return RITMO_DE_ESCRITORIO
  return { estiramiento: k, banda: BANDA_DEL_EFECTO_ANGOSTA }
}

/** El ritmo del ancho en que vive `el`: lee la variable que el CSS de su sección heredó. */
export function ritmoDe(el: Element): RitmoDelAncho {
  return ritmoDelValor(getComputedStyle(el).getPropertyValue('--estiramiento-en-uso'))
}
