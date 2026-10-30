import { estaTodo, type EstadoDeLaCarga } from '../../_lib/carga'
import { CURVAS } from '../../_lib/motion/curvas'

import { TOPE_MS } from './decision'

/**
 * [B12c] LA LÍNEA DE TIEMPO DEL PRELOADER — pura (sin React ni DOM): `s78-preloader` la recorre cuadro a cuadro. El reloj es el de los
 * cuadros que se ven: con la pestaña oculta no corre, y quien vuelve ve la secuencia entera.
 *
 * [C2-81] Lo que se ve ya no lo pinta el hilo principal: son animaciones nativas en el compositor (`animaciones.ts`), y el reloj de la
 * capa es el `currentTime` de una animación maestra (se pausa con la pestaña oculta). Por eso el paso ya no acota el `dt` a 100 ms: con
 * el hilo ocupado el compositor sigue, y la línea tiene que seguir al mismo tiempo que lo que se ve.
 *
 * [L6 · ítem 81] La flecha punteada se fue. En su lugar, el botón del sonido aparece donde está y vibra: una onda fina que cruza todo el
 * fondo desde él, con el ritmo de un corazón (dos pulsos cercanos y una pausa: «tu-tu … tu-tu»). En el teléfono, los dos botones.
 *
 * El caso normal, 5,7 s (Valentino: de 5 a 6):
 *
 *   1. negro; «Bienvenido a una nueva experiencia.» entra con un fundido lento (0,9 s), se queda (1,1 s) y se va (0,6 s);
 *   2. el fondo pasa a blanco con un fundido simple (0,5 s) y entra la frase del sonido (0,4 s);
 *   3. aparece el botón y late UNA vez (`ondaMs`: los dos pulsos y su onda). Si todo está listo, sigue la salida. Si falta, el latido se
 *      repite cada `latidoPeriodoMs` hasta que esté (nunca queda quieto: la gente sigue la onda). Si la espera pasa de `iconoDesdeMs`,
 *      un ícono de carga discreto (la página resultó muy pesada);
 *   4. el blanco se desvanece (0,7 s) y aparece la página.
 *
 * Con movimiento reducido (~1 s, sin fundidos largos): el negro con la bienvenida 0,35 s, de golpe el blanco con la frase y el botón (sin
 * onda: late su opacidad) y un fundido corto (0,15 s). Si falta la carga, se queda quieto hasta que esté.
 *
 * El tope (`TOPE_MS`, 20 s): pasado, sale aunque no esté todo (nunca queda tapando).
 */
export const LINEA = {
  bienvenidaEntraMs: 900,
  bienvenidaQuedaMs: 1100,
  bienvenidaSaleMs: 600,
  blancoMs: 500,
  fraseEntraMs: 400,
  /** Lo que dura el primer latido (sus dos pulsos y su onda): lo mínimo que se ve el botón antes de salir. */
  ondaMs: 1500,
  /** Cada cuánto se repite el latido si falta la carga (el pulso, la pausa). */
  latidoPeriodoMs: 2800,
  salidaMs: 700,
  /** Desde el arranque: el ícono de carga (sólo si la espera se hizo muy larga). */
  iconoDesdeMs: 12000,
  topeMs: TOPE_MS,
} as const

export const LINEA_REDUCIDA = { bienvenidaMs: 350, fraseMs: 650, salidaMs: 150 } as const

/** Cuándo aparece el botón (el fin de la frase). */
export const INICIO_DEL_BOTON_MS = LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs + LINEA.bienvenidaSaleMs + LINEA.blancoMs + LINEA.fraseEntraMs
export const FIN_DE_LA_BIENVENIDA_MS = LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs + LINEA.bienvenidaSaleMs

/**
 * [C2-81] LOS RATOS QUIETOS: cuándo la escena se puede preparar (`entrada.ts`, `Precompilar`) sin trabar un fundido. La bienvenida ya
 * aparecida y quieta (con un margen antes de que se vaya: una parte del calentado puede tardar) y, desde que aparece el botón, siempre (el
 * latido es la espera). Con movimiento reducido no hay fundidos largos: siempre.
 */
export const MARGEN_DEL_RATO_QUIETO_MS = 200
export const ratoQuieto = (t: number, reducido: boolean): boolean =>
  reducido || (t >= LINEA.bienvenidaEntraMs && t < LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs - MARGEN_DEL_RATO_QUIETO_MS) || t >= INICIO_DEL_BOTON_MS

/** El caso normal entero, con la carga lista desde el principio. */
export const DURACION_NORMAL_MS = INICIO_DEL_BOTON_MS + LINEA.ondaMs + LINEA.salidaMs
export const DURACION_REDUCIDA_MS = LINEA_REDUCIDA.bienvenidaMs + LINEA_REDUCIDA.fraseMs + LINEA_REDUCIDA.salidaMs

export type Etapa = 'bienvenida' | 'blanco' | 'frase' | 'boton' | 'salida' | 'fuera'

export interface EstadoDeLaLinea {
  /** ms vistos desde el arranque. */
  t: number
  icono: boolean
  /** Cuándo arrancó la salida (`t`), o `null`. */
  salidaDesde: number | null
  etapa: Etapa
}

export const lineaNueva = (): EstadoDeLaLinea => ({ t: 0, icono: false, salidaDesde: null, etapa: 'bienvenida' })

/** Cuántos latidos (pares de pulsos) empezaron hasta `t`: el primero cuando aparece el botón, y uno más cada `latidoPeriodoMs`. */
export const latidosEn = (t: number, reducido = false): number => {
  const inicio = reducido ? LINEA_REDUCIDA.bienvenidaMs : INICIO_DEL_BOTON_MS
  return t < inicio ? 0 : 1 + Math.floor((t - inicio) / LINEA.latidoPeriodoMs)
}

const etapaDe = (e: EstadoDeLaLinea, reducido: boolean): Etapa => {
  if (e.salidaDesde !== null) return e.t - e.salidaDesde >= (reducido ? LINEA_REDUCIDA.salidaMs : LINEA.salidaMs) ? 'fuera' : 'salida'
  if (reducido) return e.t < LINEA_REDUCIDA.bienvenidaMs ? 'bienvenida' : 'boton'
  if (e.t < FIN_DE_LA_BIENVENIDA_MS) return 'bienvenida'
  if (e.t < FIN_DE_LA_BIENVENIDA_MS + LINEA.blancoMs) return 'blanco'
  if (e.t < INICIO_DEL_BOTON_MS) return 'frase'
  return 'boton'
}

/** Un cuadro (escribe en `e`). `dt` en ms: el tiempo visto desde el cuadro anterior (el reloj maestro de la capa, sin acotar). */
export function pasoDeLaLinea(e: EstadoDeLaLinea, dt: number, listo: boolean, reducido: boolean): void {
  e.t += Math.max(dt, 0)
  const listoYa = listo || e.t >= LINEA.topeMs
  if (e.salidaDesde === null) {
    e.icono = !listoYa && e.t >= LINEA.iconoDesdeMs && (reducido || e.t > INICIO_DEL_BOTON_MS)
    const salePasado = reducido ? LINEA_REDUCIDA.bienvenidaMs + LINEA_REDUCIDA.fraseMs : INICIO_DEL_BOTON_MS + LINEA.ondaMs
    if (listoYa && e.t >= salePasado) e.salidaDesde = e.t
  }
  e.etapa = etapaDe(e, reducido)
}

/** Lo que se pinta en un cuadro: opacidades (0 a 1) de lo que se funde. */
export interface VistaDeLaLinea {
  readonly bienvenida: number
  readonly blanco: number
  readonly frase: number
  readonly capa: number
  readonly icono: boolean
}

const tramo = (t: number, desde: number, dura: number): number => Math.min(1, Math.max(0, (t - desde) / dura))

export function vistaDeLaLinea(e: EstadoDeLaLinea, reducido: boolean): VistaDeLaLinea {
  const { t } = e
  if (reducido) {
    const blanco = t >= LINEA_REDUCIDA.bienvenidaMs ? 1 : 0
    const capa = e.salidaDesde === null ? 1 : 1 - tramo(t, e.salidaDesde, LINEA_REDUCIDA.salidaMs)
    return { bienvenida: 1 - blanco, blanco, frase: blanco, capa, icono: e.icono }
  }
  const entra = CURVAS.principal(tramo(t, 0, LINEA.bienvenidaEntraMs))
  const sale = CURVAS.entrada(tramo(t, LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs, LINEA.bienvenidaSaleMs))
  const blanco = CURVAS.simetrica(tramo(t, FIN_DE_LA_BIENVENIDA_MS, LINEA.blancoMs))
  const frase = CURVAS.principal(tramo(t, FIN_DE_LA_BIENVENIDA_MS + LINEA.blancoMs, LINEA.fraseEntraMs))
  const capa = e.salidaDesde === null ? 1 : 1 - CURVAS.simetrica(tramo(t, e.salidaDesde, LINEA.salidaMs))
  return { bienvenida: entra * (1 - sale), blanco, frase, capa, icono: e.icono }
}

/**
 * ¿Está todo para entrar? Lo del velo de carga del home (`estaTodo`: las fuentes, el primer cuadro y, desde 1024, el titular del hero
 * armado) y además la escena preparada (sus programas compilados y calentados) y ningún título urgente en camino (el de una página, a la
 * vista, armado y compilado). Con la escena caída, sólo las fuentes: no hay nada que esperar.
 */
export interface LoQueEsperaLaEntrada extends EstadoDeLaCarga {
  readonly preparada: boolean
  readonly urgentes: number
}

export const entradaLista = (e: LoQueEsperaLaEntrada): boolean => (e.caida ? e.fuentes : estaTodo(e) && e.preparada && e.urgentes === 0)
