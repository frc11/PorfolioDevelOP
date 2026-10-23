/**
 * [PULIDO 27] Y4 · LAS SALIDAS DEL PIE — lo que comparten el final (la escena), el pie de volumen y los viajes del DOM, sin three.
 *
 *   a) LA SALIDA AL SUBIR: al volver del pie con un scroll rápido el pie se iba hacia abajo de la pantalla y no se veía la salida de cada
 *      pieza. Ahora, con el final rebobinado (parado) y el pie entero, el primer gesto hacia arriba no sube la página: el final lo retiene
 *      (como retiene el del rebobinado), el pie corre la salida de cada pieza (su llegada al revés, en `LIBRE_DEL_PIE_S`) y recién al
 *      terminar suelta el scroll. Hasta que la persona vuelva a bajar o la página suba fuera del pie, el pie queda ido.
 *      [PULIDO 28] AA7 · UNA MÁQUINA DE ESTADOS (`fase`): presente → saliendo → ida → presente. La de PULIDO 27 dependía de que el
 *      gesto EMPEZARA con el final parado: desde el final entero el primer evento lo rebobinaba, el resto del mismo gesto se retenía
 *      sólo hasta el tope del gesto (0,8 s) y la página subía a mitad del rebobinado, sin salida (medido en el sitio con la rueda lenta,
 *      la rápida, el trackpad y el teclado: ninguna salía); y la salida recorría lo mostrado entero en medio segundo, con las piezas en
 *      menos de la mitad de eso (va rapidísimo). Ahora, con el pie a la vista, TODO evento hacia arriba al fondo se retiene: corriendo,
 *      rebobina; quieto en cero, pide la salida; saliendo, sigue; ida, suelta. La salida recorre las piezas en `salidaS`, en el orden
 *      inverso de sus llegadas (`salidaDelPie` en `coreografia.ts`).
 *   b) UN VIAJE DESDE EL PIE ACOSTADO (los enlaces del recorrido): todo desaparecía de golpe. Ahora las piezas se hunden en sus huecos y
 *      el piso se cierra (`hundeMs`) y recién ahí empieza el viaje, que dura eso menos: el mismo presupuesto del click a la llegada.
 *   c) [B10] EL FAQ DESPUÉS DEL PIE (`faqDelPie.ts`): mientras está al frente, el pie queda hundido en sus huecos (el mismo hundimiento).
 */
import { hundeDelFaq } from './faqDelPie'

export const SALIDAS_DEL_PIE = { hundeMs: 400, hundeHasta: 0.6, cierraDesde: 0.4, hundeDeMas: 0.2, sinViajeMs: 1500, salidaS: 0.8 } as const

/** [PULIDO 28] AA7 · a) presente (a la vista o llegando con el scroll), saliendo (un gesto hacia arriba al fondo) e ida (el scroll se soltó). */
export type FaseDeLaSalida = 'presente' | 'saliendo' | 'ida'

export const SALIDA_EN_VIVO = {
  /** a) [PULIDO 28] AA7 · la fase de la salida y si hay algo del pie a la vista (lo escribe el pie de volumen; sin él, nunca). */
  fase: 'presente' as FaseDeLaSalida,
  aLaVista: false,
  /** a) [PULIDO 28] AA7 · ida, el scroll más arriba al que llegó la página (px): si vuelve a bajar (también sin un gesto: la barra), el pie vuelve. */
  idaHasta: Number.POSITIVE_INFINITY,
  /** b) el pie está acostado en el piso con su DOM (lo escribe el pie de volumen). */
  acostado: false,
  /** b) desde cuándo se hunde para un viaje (ms de `performance.now`; sin hundirse, −∞) y si ya arrancó su viaje. */
  hundeDesde: Number.NEGATIVE_INFINITY,
  viajo: false,
  /** b) cuánto va el hundimiento de este cuadro (0 a 1; lo escribe el pie de volumen con `pasoDelHundimiento`). */
  hunde: 0,
  /** [C2-71] sus dos partes en este cuadro: la del viaje (b) y la del FAQ (c); `hunde` es la mayor. */
  delViaje: 0,
  delFaq: 0,
}

/**
 * [C2-71] c) EL PIE SE GUARDA PARA EL FAQ, POR COLUMNAS (ítem 22): cada columna del pie acostado (la izquierda entera, con sus textos; la
 * derecha, el rótulo y el formulario) tiene su BASE: el piso debajo de ella se abre (el hueco de la columna, desde su centro: `abre`) y
 * queda una plataforma al ras; la plataforma baja con todo lo de la columna tal como es (`baja`, de 0 a `hondo` de la columna: nada
 * atraviesa su fondo, ni los pozos de los campos, que era la «piel» de los inputs), y el piso se cierra encima. Con `h` (0 a 1: lo hundido
 * por el FAQ). Al volver, al revés. El viaje (b) sigue con su hundimiento de siempre.
 */
export const HUNDIMIENTO_EN_COLUMNAS = { abreHasta: 0.25, bajaDesde: 0.22, bajaHasta: 0.7, cierraDesde: 0.72, margen: 0.18, radio: 0.3, deMas: 0.35 } as const

const suaveEnColumnas = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * u * (u * (u * 6 - 15) + 10)
}

const COLUMNA = { abre: 0, baja: 0 }

/**
 * La columna en `h`: cuánto está abierta la silueta de su hueco (0 a 1) y cuánto bajó su plataforma (0 a 1 de su `hondo`). Sin reservas
 * por cuadro: el mismo registro (leerlo antes de volver a pedirlo).
 */
export function columnaDelHundimiento(h: number): { readonly abre: number; readonly baja: number } {
  const C = HUNDIMIENTO_EN_COLUMNAS
  COLUMNA.abre = suaveEnColumnas(h / C.abreHasta) * (1 - suaveEnColumnas((h - C.cierraDesde) / (1 - C.cierraDesde)))
  COLUMNA.baja = suaveEnColumnas((h - C.bajaDesde) / (C.bajaHasta - C.bajaDesde))
  return COLUMNA
}

/** [C2-71] ¿El hundimiento de este cuadro es el del FAQ (por columnas)? El del viaje, si es el mayor, sigue como siempre. */
export const hundePorColumnas = (): boolean => SALIDA_EN_VIVO.delFaq > 0 && SALIDA_EN_VIVO.delFaq >= SALIDA_EN_VIVO.delViaje

/** b) Si el enlace es del pie acostado: marca el hundimiento y devuelve cuánto esperar antes de viajar (ms); si no, 0. */
export function demoraDelViaje(enlace: Element): number {
  if (!SALIDA_EN_VIVO.acostado || enlace.closest('[data-pieza="destinos-del-pie"]') === null) return 0
  SALIDA_EN_VIVO.hundeDesde = performance.now()
  SALIDA_EN_VIVO.viajo = false
  return SALIDAS_DEL_PIE.hundeMs
}

const suave = (x: number): number => {
  const u = Math.min(1, Math.max(0, x))
  return u * u * (3 - 2 * u)
}

/**
 * b) Un cuadro del hundimiento (`enViaje`: hay un viaje en curso): cuánto va (0 a 1; sin hundimiento, 0). Termina cuando el viaje que
 * siguió terminó (el pie ya quedó lejos): de ahí vuelve como siempre, con su llegada.
 * c) [B10] Y el del FAQ después del pie: mientras el FAQ está al frente el pie queda hundido con el piso cerrado, y vuelve a subir cuando
 * el FAQ se va (por el reloj del FAQ). Gana el más hundido de los dos.
 */
export function pasoDelHundimiento(ahora: number, enViaje: boolean): number {
  const S = SALIDA_EN_VIVO
  S.delViaje = hundimientoDelViaje(ahora, enViaje)
  S.delFaq = hundeDelFaq(ahora)
  return Math.max(S.delViaje, S.delFaq)
}

function hundimientoDelViaje(ahora: number, enViaje: boolean): number {
  const S = SALIDA_EN_VIVO
  if (S.hundeDesde === Number.NEGATIVE_INFINITY) return 0
  if (enViaje) S.viajo = true
  // Terminó el viaje que siguió (o no arrancó nunca: se canceló antes): de vuelta como siempre.
  else if (S.viajo || ahora - S.hundeDesde > SALIDAS_DEL_PIE.hundeMs + SALIDAS_DEL_PIE.sinViajeMs) {
    S.hundeDesde = Number.NEGATIVE_INFINITY
    S.viajo = false
    return 0
  }
  return Math.min(1, Math.max(0, (ahora - S.hundeDesde) / SALIDAS_DEL_PIE.hundeMs))
}

/** a) [PULIDO 28] AA7 · un gesto pide la salida: sólo desde presente (saliendo o ida, nada). */
export function pedirLaSalida(): void {
  if (SALIDA_EN_VIVO.fase === 'presente') SALIDA_EN_VIVO.fase = 'saliendo'
}

/** a) Un gesto hacia abajo trae el pie de vuelta (con su llegada, por el scroll). */
export function volverElPie(): void {
  SALIDA_EN_VIVO.fase = 'presente'
}

/**
 * a) Un cuadro de la salida (con lo mostrado del pie, lo que pide el scroll y el scroll, px): saliendo, se fue cuando no queda nada a la
 * vista (ida: el scroll se suelta); ida, vuelve a presente cuando la página subió por encima del pie entero (no pide nada: antes volvía en
 * el primer tramo y el pie se asomaba un instante mientras la página subía) o cuando volvió a bajar. Y si queda algo a la vista.
 */
export function pasoDeLaSalida(mostrado: number, pedido: number, scroll: number): void {
  const S = SALIDA_EN_VIVO
  S.aLaVista = mostrado > 1e-3
  if (S.fase === 'saliendo' && mostrado <= 1e-3) {
    S.fase = 'ida'
    S.idaHasta = scroll
  } else if (S.fase === 'ida') {
    S.idaHasta = Math.min(S.idaHasta, scroll)
    if (pedido <= 1e-3 || scroll > S.idaHasta + 2) S.fase = 'presente'
  }
}

/** b) Cuánto se hundió la pieza (0 a 1) con el hundimiento `h`: en la primera parte (`hundeHasta`). */
export const hundidaParaElViaje = (h: number): number => suave(h / SALIDAS_DEL_PIE.hundeHasta)
/** b) Cuánto se cerró el piso sobre ella (0 a 1): en la segunda (desde `cierraDesde`). */
export const cerradoParaElViaje = (h: number): number => suave((h - SALIDAS_DEL_PIE.cierraDesde) / (1 - SALIDAS_DEL_PIE.cierraDesde))
