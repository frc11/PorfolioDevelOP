import { estaTodo, type EstadoDeLaCarga } from '../../_lib/carga'
import { CURVAS } from '../../_lib/motion/curvas'

import { TOPE_MS } from './decision'

/**
 * [B12c] LA LÍNEA DE TIEMPO DEL PRELOADER — pura (sin React ni DOM): `s78-preloader` la recorre cuadro a cuadro. El reloj es el de los
 * cuadros que se ven (la suma de los `dt` del rAF): con la pestaña oculta no corre, y quien vuelve ve la secuencia entera.
 *
 * El caso normal, 5,7 s (Valentino: de 5 a 6):
 *
 *   1. negro; «Bienvenido a una nueva experiencia.» entra con un fundido lento (0,9 s), se queda (1,1 s) y se va (0,6 s);
 *   2. el fondo pasa a blanco con un fundido simple (0,5 s) y entra la frase del sonido (0,4 s);
 *   3. la flecha punteada se dibuja en 1,5 s **si todo está listo**. Si falta, se frena en su último 20 % (no llega nunca sin la carga:
 *      se acerca a `frenoHasta`), y pasados 6 s desde el arranque se queda quieta con un pulso suave en la punta hasta que esté. Con la
 *      carga lista retoma a su ritmo. Si la espera pasa de `iconoDesdeMs`, un ícono de carga discreto (la página resultó muy pesada);
 *   4. completa la flecha, el blanco se desvanece (0,7 s) y aparece la página.
 *
 * Con movimiento reducido (~1 s, sin fundidos largos): el negro con la bienvenida 0,35 s, de golpe el blanco con la frase y la flecha ya
 * dibujada 0,65 s, y un fundido corto (0,15 s). Si falta la carga, se queda quieto (sin pulso) hasta que esté.
 *
 * El tope (`TOPE_MS`, 20 s): pasado, sale aunque no esté todo (nunca queda tapando).
 */
export const LINEA = {
  bienvenidaEntraMs: 900,
  bienvenidaQuedaMs: 1100,
  bienvenidaSaleMs: 600,
  blancoMs: 500,
  fraseEntraMs: 400,
  flechaMs: 1500,
  salidaMs: 700,
  /** Desde qué parte del trazo frena si falta la carga, y hacia dónde se acerca sin llegar. */
  frenoDesde: 0.8,
  frenoHasta: 0.97,
  /** Desde el arranque: la flecha quieta con el pulso en la punta. */
  pulsoDesdeMs: 6000,
  pulsoPeriodoMs: 1400,
  /** Desde el arranque: el ícono de carga (sólo si la espera se hizo muy larga). */
  iconoDesdeMs: 12000,
  topeMs: TOPE_MS,
} as const

export const LINEA_REDUCIDA = { bienvenidaMs: 350, fraseMs: 650, salidaMs: 150 } as const

/** Cuándo arranca la flecha (el fin de la frase). */
export const INICIO_DE_LA_FLECHA_MS = LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs + LINEA.bienvenidaSaleMs + LINEA.blancoMs + LINEA.fraseEntraMs
const FIN_DE_LA_BIENVENIDA_MS = LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs + LINEA.bienvenidaSaleMs

/** El caso normal entero, con la carga lista desde el principio. */
export const DURACION_NORMAL_MS = INICIO_DE_LA_FLECHA_MS + LINEA.flechaMs + LINEA.salidaMs
export const DURACION_REDUCIDA_MS = LINEA_REDUCIDA.bienvenidaMs + LINEA_REDUCIDA.fraseMs + LINEA_REDUCIDA.salidaMs

export type Etapa = 'bienvenida' | 'blanco' | 'frase' | 'flecha' | 'salida' | 'fuera'

export interface EstadoDeLaLinea {
  /** ms vistos desde el arranque. */
  t: number
  /** ms de la flecha: avanzan con el freno. */
  tau: number
  /** Lo dibujado de la flecha (0 a 1). */
  trazo: number
  pulsa: boolean
  icono: boolean
  /** Cuándo arrancó la salida (`t`), o `null`. */
  salidaDesde: number | null
  etapa: Etapa
}

export const lineaNueva = (): EstadoDeLaLinea => ({ t: 0, tau: 0, trazo: 0, pulsa: false, icono: false, salidaDesde: null, etapa: 'bienvenida' })

/** El dibujo de la flecha en el tiempo (de 0 a 1 en `flechaMs`): arranca y termina suave. */
export const trazoDeLaFlecha = (tau: number): number => CURVAS.simetrica(Math.min(1, Math.max(0, tau / LINEA.flechaMs)))

/**
 * A qué velocidad avanza la flecha (1 = su ritmo): con la carga lista, el suyo; si falta, el suyo hasta el 80 % del trazo y desde ahí
 * frena (se acerca a `frenoHasta` sin llegar); pasados `pulsoDesdeMs`, quieta. `sinFreno`: el control del banco.
 */
export function velocidadDeLaFlecha(trazo: number, listo: boolean, t: number, sinFreno = false): number {
  if (listo || sinFreno) return 1
  if (t >= LINEA.pulsoDesdeMs) return 0
  if (trazo < LINEA.frenoDesde) return 1
  return Math.max(0, (LINEA.frenoHasta - trazo) / (LINEA.frenoHasta - LINEA.frenoDesde)) ** 2
}

const etapaDe = (e: EstadoDeLaLinea, reducido: boolean): Etapa => {
  if (e.salidaDesde !== null) return e.t - e.salidaDesde >= (reducido ? LINEA_REDUCIDA.salidaMs : LINEA.salidaMs) ? 'fuera' : 'salida'
  if (reducido) return e.t < LINEA_REDUCIDA.bienvenidaMs ? 'bienvenida' : 'flecha'
  if (e.t < FIN_DE_LA_BIENVENIDA_MS) return 'bienvenida'
  if (e.t < FIN_DE_LA_BIENVENIDA_MS + LINEA.blancoMs) return 'blanco'
  if (e.t < INICIO_DE_LA_FLECHA_MS) return 'frase'
  return 'flecha'
}

/** Un cuadro (escribe en `e`). `dt` en ms (se acota a 100: un cuadro largo no se come la secuencia). */
export function pasoDeLaLinea(e: EstadoDeLaLinea, dt: number, listo: boolean, reducido: boolean, sinFreno = false): void {
  const paso = Math.min(Math.max(dt, 0), 100)
  const antes = e.t
  e.t += paso
  const listoYa = listo || e.t >= LINEA.topeMs
  if (e.salidaDesde === null) {
    if (reducido) {
      e.trazo = e.t >= LINEA_REDUCIDA.bienvenidaMs ? 1 : 0
      e.pulsa = false
      e.icono = !listoYa && e.t >= LINEA.iconoDesdeMs
      if (listoYa && e.t >= LINEA_REDUCIDA.bienvenidaMs + LINEA_REDUCIDA.fraseMs) e.salidaDesde = e.t
    } else if (e.t > INICIO_DE_LA_FLECHA_MS) {
      const deLaFlecha = Math.min(paso, e.t - Math.max(antes, INICIO_DE_LA_FLECHA_MS))
      e.tau = Math.min(LINEA.flechaMs, e.tau + deLaFlecha * velocidadDeLaFlecha(e.trazo, listoYa, e.t, sinFreno))
      e.trazo = trazoDeLaFlecha(e.tau)
      e.pulsa = !listoYa && e.t >= LINEA.pulsoDesdeMs
      e.icono = !listoYa && e.t >= LINEA.iconoDesdeMs
      if (listoYa && e.trazo >= 1) e.salidaDesde = e.t
    }
  }
  e.etapa = etapaDe(e, reducido)
}

/** Lo que se pinta en un cuadro: opacidades (0 a 1), lo dibujado de la flecha y el pulso de la punta (0 a 1). */
export interface VistaDeLaLinea {
  readonly bienvenida: number
  readonly blanco: number
  readonly frase: number
  readonly trazo: number
  readonly capa: number
  readonly pulso: number
  readonly icono: boolean
}

const tramo = (t: number, desde: number, dura: number): number => Math.min(1, Math.max(0, (t - desde) / dura))

export function vistaDeLaLinea(e: EstadoDeLaLinea, reducido: boolean): VistaDeLaLinea {
  const { t } = e
  if (reducido) {
    const blanco = t >= LINEA_REDUCIDA.bienvenidaMs ? 1 : 0
    const capa = e.salidaDesde === null ? 1 : 1 - tramo(t, e.salidaDesde, LINEA_REDUCIDA.salidaMs)
    return { bienvenida: 1 - blanco, blanco, frase: blanco, trazo: e.trazo, capa, pulso: 0, icono: e.icono }
  }
  const entra = CURVAS.principal(tramo(t, 0, LINEA.bienvenidaEntraMs))
  const sale = CURVAS.entrada(tramo(t, LINEA.bienvenidaEntraMs + LINEA.bienvenidaQuedaMs, LINEA.bienvenidaSaleMs))
  const blanco = CURVAS.simetrica(tramo(t, FIN_DE_LA_BIENVENIDA_MS, LINEA.blancoMs))
  const frase = CURVAS.principal(tramo(t, FIN_DE_LA_BIENVENIDA_MS + LINEA.blancoMs, LINEA.fraseEntraMs))
  const capa = e.salidaDesde === null ? 1 : 1 - CURVAS.simetrica(tramo(t, e.salidaDesde, LINEA.salidaMs))
  const pulso = e.pulsa ? 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - LINEA.pulsoDesdeMs)) / LINEA.pulsoPeriodoMs) : 0
  return { bienvenida: entra * (1 - sale), blanco, frase, trazo: e.trazo, capa, pulso, icono: e.icono }
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
