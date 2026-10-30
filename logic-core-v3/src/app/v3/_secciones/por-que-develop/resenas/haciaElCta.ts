/**
 * [NOCTURNO B3] RESEÑAS → CTA, PURO (lo recorre `s83`). Después del tramo de las reseñas sigue la transformación al CTA de siempre
 * (`ctaDelFinal/transformacion.ts`: el cartel se junta, gira sobre Y —de canto en la mitad— y del otro lado está «HABLANOS»; la cámara sube a
 * C como antes). Con las reseñas, su origen es el título de las reseñas (lo que se da vuelta y se vuelve el CTA) y, AL MISMO TIEMPO que ese
 * giro, en el piso se abre un anillo bajo el aro y las reseñas bajan por ahí. Todo función del progreso de la transformación `p` (0 a 1, el
 * del CTA): al subir, todo vuelve. Con `?resenas=gatillo`, la bajada (y su anillo) es una animación por tiempo que se dispara al empezar la
 * transformación y vuelve al subir.
 */

import { TRANSFORMACION } from '../../../_lib/escena/ctaDelFinal/transformacion'
import { TIEMPOS_DEL_FINAL } from '../../../_lib/escena/finalDelRecorrido'
import { INSERCION_DE_LAS_RESENAS, MOMENTOS_DE_LAS_RESENAS, PANTALLAS_DE_LAS_RESENAS } from './tramo'

const acotar01 = (x: number): number => Math.min(1, Math.max(0, x))
const tramo = (x: number, desde: number, dura: number): number => acotar01((x - desde) / dura)
const suave = (u: number): number => u * u * (3 - 2 * u)

/** El giro del cartel en la transformación (fracciones de `p`): de `desde` a `desde + gira`. La bajada termina con él. */
const GIRO = { desde: TRANSFORMACION.giro.desde, hasta: TRANSFORMACION.giro.desde + TRANSFORMACION.giro.gira }

export const HACIA_EL_CTA = {
  /** El anillo se abre un poco antes de que las placas empiecen a bajar, y se cierra cuando ya no queda ninguna. */
  // [L5] Abierto entero ANTES de que la primera placa se mueva (era desde 0,12: bajaban con el anillo a medio abrir).
  abre: [GIRO.desde - 0.2, 0.12],
  baja: [GIRO.desde - 0.06, GIRO.hasta - (GIRO.desde - 0.06)],
  cierra: [GIRO.hasta + 0.02, 0.14],
  /**
   * Con el gatillo: la animación (s) y dónde se dispara (p). [L5] Siempre (las dos variantes) y más lenta (era 2,2 s): primero la cámara
   * llega arriba, después el piso se abre, bajan, se cierra, y recién ahí la cámara suelta. `guardado`: la parte de la animación en que
   * corre la ventana del piso (abre, baja y cierra); antes, la cámara llega; después, suelta.
   */
  gatillo: { duracionS: 3.6, entra: 0.04, sale: 0.01, guardado: [0.12, 0.82] as const },
} as const

/** La bajada de las placas (0, en el aro; 1, se fueron por el hueco) con el progreso de la transformación (o la animación del gatillo). */
export function bajadaDeLasResenas(p: number): number {
  return suave(tramo(p, HACIA_EL_CTA.baja[0], HACIA_EL_CTA.baja[1]))
}

/** Cuánto está abierto el anillo del piso. */
export function aperturaDelHueco(p: number): number {
  return suave(tramo(p, HACIA_EL_CTA.abre[0], HACIA_EL_CTA.abre[1])) * (1 - suave(tramo(p, HACIA_EL_CTA.cierra[0], HACIA_EL_CTA.cierra[1])))
}

/** Con el gatillo, la animación por tiempo (0 a 1) lleva a `p` por la ventana entera de la bajada (abre, baja y cierra). */
// [L5] Sólo en su parte `guardado` (antes y después, la cámara llega y suelta con el piso quieto).
export const progresoDelGatillo = (t: number): number => {
  const [desde, hasta] = HACIA_EL_CTA.gatillo.guardado
  return HACIA_EL_CTA.abre[0] + tramo(t, desde, hasta - desde) * (HACIA_EL_CTA.cierra[0] + HACIA_EL_CTA.cierra[1] - HACIA_EL_CTA.abre[0])
}

/** El gatillo de la bajada: adónde va (1, la transformación empezó; 0, volvió a su arranque), con margen para no titilar. */
export function objetivoDeLaBajada(p: number, previo: 0 | 1): 0 | 1 {
  if (previo === 0) return p > HACIA_EL_CTA.gatillo.entra ? 1 : 0
  return p < HACIA_EL_CTA.gatillo.sale ? 0 : 1
}

/**
 * [C2-70e] LA CÁMARA ACOMPAÑA EL GUARDADO (con el gatillo): cuánto se queda en la pose de las reseñas y mira al hueco (el peso del desvío,
 * `_lib/escena/resenas/camaraDelGuardado.ts`), en fracciones de la animación de la bajada `t`: llega mientras se abre el anillo (antes de
 * que la primera placa baje), se sostiene mientras bajan y suelta cuando ya se fueron (la bajada pasó `suelta`), hasta 0 al cerrarse el
 * anillo: ahí la cámara pasa al CTA. `margen`: si el scroll ya pasó mucho de la llegada a C (el progreso de la transformación), el CTA
 * manda y el desvío se apaga con el scroll. Fuera de la animación, 0: antes y después del guardado la cámara es la de siempre.
 * [C2-70e, verificación] Y EL CTA ESPERA A LA CÁMARA (`esperaDelCta`): con la cámara en B, el cartel del CTA (anclado en el plano de C) se
 * veía grande y cortado arriba. Mientras dura el guardado la transformación no arranca (el título queda centrado, en su lugar) y suelta
 * un poco DESPUÉS que la cámara (`ctaSuelta`; la cámara suelta de `suelta` a `soltada`): con la inercia del rig la cámara llega detrás de
 * su objetivo, y así el cartel nunca se adelanta a ella (s83 §16 lo simula cuadro a cuadro). Primero se enfoca el guardado, después se
 * pasa al CTA.
 */
// [L5] Llega antes de que el piso se abra y suelta después de que se cerró (era suelta 0,66: las últimas placas bajaban con la cámara yéndose).
export const CAMARA_DEL_GUARDADO_EN_EL_GATILLO = { llega: 0.12, suelta: 0.83, soltada: 0.93, ctaSuelta: 0.88, margen: [0.4, 0.2] } as const

const C_G = CAMARA_DEL_GUARDADO_EN_EL_GATILLO
/** Con el scroll `p`: 1 hasta el margen (después de la llegada a C), 0 pasado. */
const enElMargen = (p: number): number => 1 - suave(tramo(p, C_G.margen[0], C_G.margen[1]))

/** El peso del desvío de la cámara con la animación de la bajada `t` y el progreso de la transformación `p` (0 a 1). */
export function pesoDeLaCamara(t: number, p: number): number {
  const u = acotar01(t)
  return suave(tramo(u, 0, C_G.llega)) * (1 - suave(tramo(u, C_G.suelta, C_G.soltada - C_G.suelta))) * enElMargen(p)
}

/**
 * [C2-70e] Cuánto espera el CTA (0 a 1; su progreso es `p · (1 − espera)`): entero desde antes del disparo (`disparada`: la bajada va hacia
 * 1) y mientras dura el guardado; suelta detrás de la cámara (de `ctaSuelta` al cierre del anillo) y con el mismo margen. Sin disparar y con
 * la animación en 0, sólo antes del gatillo (el CTA todavía no arrancó); pasado el gatillo sin disparo (no ocurre: se decide antes), nada.
 */
export function esperaDelCta(t: number, p: number, disparada: boolean): number {
  const u = acotar01(t)
  if (!disparada && u <= 0 && p > HACIA_EL_CTA.gatillo.entra) return 0
  return (1 - suave(tramo(u, C_G.ctaSuelta, 1 - C_G.ctaSuelta))) * enElMargen(p)
}

/**
 * [B9] EL MOMENTO EN QUE EL TÍTULO SE VUELVE EL CTA: el cartel de canto (la mitad de su giro). B9 (las grietas del cristal) todavía no existe:
 * acá queda el punto de enganche (`_lib/escena/resenas/enganches.ts`), que se llama al cruzarlo para un lado o para el otro.
 */
export const VUELTA_DEL_CTA = (GIRO.desde + GIRO.hasta) / 2

/** El cruce del momento entre dos progresos: `ida` (bajando), `vuelta` (subiendo) o `null`. */
export function cruceDeLaVuelta(antes: number, ahora: number): 'ida' | 'vuelta' | null {
  if (antes < VUELTA_DEL_CTA && ahora >= VUELTA_DEL_CTA) return 'ida'
  if (antes >= VUELTA_DEL_CTA && ahora < VUELTA_DEL_CTA) return 'vuelta'
  return null
}

/**
 * [L8b · 3] RESEÑAS → CTA, UN SOLO GATILLO — hasta acá el guardado era un gatillo pero la transformación al CTA seguía al scroll: un gesto
 * corto dejaba el CTA a medio camino. Ahora el paso entero es UN gatillo, en pantallas del pin del bloque (`PIN_CON_LAS_RESENAS`):
 *   · **ida:** el scroll cruza el fin de la lectura bajando (`lectura` + `umbral`) → un vuelo corto hasta `guardado` (la transformación en
 *     `previo`, pasado el disparo del guardado), espera a que la cámara suelte el guardado (`C_G.suelta`) y vuela al CTA armado (`cta`);
 *   · **vuelta:** el scroll cruza el CTA armado subiendo → vuela al fin de la lectura y espera a que las reseñas vuelvan a subir (el guardado
 *     al revés, que se dispara en el camino).
 * Mientras dura, los gestos se retienen (`useGatilloHaciaElCta`). Un salto que cruza el tramo entero (el foco que lleva al CTA, la barra) no
 * es un cruce: el gatillo sólo mira lo que entra en el tramo desde su borde.
 */
export const GATILLO_HACIA_EL_CTA = { umbral: 0.02, previo: 0.06, llegada: 0.03, vueloAlAsientoMs: 450, vueloAlGuardadoMs: 900, vueloAlCtaMs: 2400, vueloDeVueltaMs: 3000, esperaMaximaMs: 6000 } as const

/** Las pantallas del pin (con el tramo) en que la transformación al CTA vale `p` (0 a 1): el tramo de las reseñas va antes. */
export const pantallaDelCta = (p: number): number => TIEMPOS_DEL_FINAL.valores.hasta + p * (TIEMPOS_DEL_FINAL.cta.armado - TIEMPOS_DEL_FINAL.valores.hasta) + PANTALLAS_DE_LAS_RESENAS

/**
 * Los lugares del gatillo, en pantallas del pin: el asiento (el aro armado), el fin de la lectura, el guardado disparado y el CTA armado (con
 * su margen). [L9b · 3] El asiento es donde las reseñas se quedan: llegar bajando las asienta ahí, y desde ahí UN gesto hacia abajo es la ida
 * entera (antes había que scrollear la lectura entera, una pantalla y media, hasta su fin); la vuelta termina ahí, asentada.
 */
export const LUGARES_DEL_GATILLO = {
  asiento: INSERCION_DE_LAS_RESENAS + MOMENTOS_DE_LAS_RESENAS.entrada[1] * PANTALLAS_DE_LAS_RESENAS,
  lectura: INSERCION_DE_LAS_RESENAS + MOMENTOS_DE_LAS_RESENAS.lectura[1] * PANTALLAS_DE_LAS_RESENAS,
  guardado: pantallaDelCta(GATILLO_HACIA_EL_CTA.previo),
  cta: pantallaDelCta(1) + GATILLO_HACIA_EL_CTA.llegada,
} as const

/**
 * El cruce de un borde del tramo entre dos lecturas del scroll (pantallas del pin): `asiento` (llegó bajando a las reseñas armadas), `ida`
 * (bajó por el fin de la lectura: el respaldo si la página quedó adentro de la lectura sin asentarse, una recarga o la barra), `vuelta` (entró
 * subiendo por el CTA) o `null`.
 */
export function cruceDelGatillo(antes: number, ahora: number): 'asiento' | 'ida' | 'vuelta' | null {
  const { umbral } = GATILLO_HACIA_EL_CTA
  const desde = LUGARES_DEL_GATILLO.lectura + umbral
  const hasta = pantallaDelCta(1) - umbral
  const asiento = LUGARES_DEL_GATILLO.asiento
  if (antes < asiento && ahora >= asiento && ahora < LUGARES_DEL_GATILLO.guardado) return 'asiento'
  if (antes <= desde && antes >= asiento && ahora > desde && ahora < hasta) return 'ida'
  if (antes >= hasta && ahora < hasta && ahora > desde) return 'vuelta'
  return null
}

/**
 * [L9b · 3] Asentada, qué hace un gesto que EMPIEZA: hacia abajo, la ida entera; hacia arriba, suelta (la página sube libre). Lo que sigue de
 * un gesto ya visto (la cola de la inercia, la rueda que sigue) se retiene sin decidir nada.
 */
export function gestoAsentado(sentido: -1 | 1, nuevo: boolean, cola: boolean): 'retener' | 'ida' | 'soltar' {
  if (cola && !nuevo) return 'retener'
  return sentido === 1 ? 'ida' : 'soltar'
}

/** Cuándo sigue la ida (la cámara soltó el guardado: la animación de la bajada `t` pasó su `suelta`) y cuándo termina la vuelta (volvió a 0). */
export const guardadoSuelto = (t: number): boolean => t >= C_G.suelta
export const guardadoDeVuelta = (t: number): boolean => t <= 0.001

/**
 * [L8b · revisión] La secuencia se suelta si otro se lleva la página: un viaje del navbar, un vuelo pisado (Lenis con otra marca) o el scroll
 * afuera del tramo (más de media pantalla antes del asiento o después del CTA). Si no, una espera que vence la volvería a arrastrar.
 */
export const debeAbortar = (pantalla: number, conViaje: boolean, pisado: boolean): boolean => conViaje || pisado || pantalla < LUGARES_DEL_GATILLO.asiento - 0.5 || pantalla > LUGARES_DEL_GATILLO.cta + 0.5

/** [L9b · 3] Asentada, la página se movió sin un gesto (la barra, el foco que salta, un ancla): se suelta. */
export const seFueDelAsiento = (pantalla: number): boolean => Math.abs(pantalla - LUGARES_DEL_GATILLO.asiento) > 0.1
