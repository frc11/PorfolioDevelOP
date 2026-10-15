/**
 * [PULIDO 27] Y4 · LAS SALIDAS DEL PIE — lo que comparten el final (la escena), el pie de volumen y los viajes del DOM, sin three.
 *
 *   a) LA SALIDA AL SUBIR: al volver del pie con un scroll rápido el pie se iba hacia abajo de la pantalla y no se veía la salida de cada
 *      pieza. Ahora, con el final rebobinado (parado) y el pie entero, el primer gesto hacia arriba no sube la página: el final lo retiene
 *      (como retiene el del rebobinado), el pie corre la salida de cada pieza (su llegada al revés, en `LIBRE_DEL_PIE_S`) y recién al
 *      terminar suelta el scroll. Hasta que la persona vuelva a bajar o la página suba fuera del pie, el pie queda ido.
 *   b) UN VIAJE DESDE EL PIE ACOSTADO (los enlaces del recorrido): todo desaparecía de golpe. Ahora las piezas se hunden en sus huecos y
 *      el piso se cierra (`hundeMs`) y recién ahí empieza el viaje, que dura eso menos: el mismo presupuesto del click a la llegada.
 */
export const SALIDAS_DEL_PIE = { hundeMs: 400, hundeHasta: 0.6, cierraDesde: 0.4, hundeDeMas: 0.2, sinViajeMs: 1500 } as const

export const SALIDA_EN_VIVO = {
  /** a) el pie se está yendo (o ya se fue) por un gesto hacia arriba. */
  saliendo: false,
  /** a) ya se fue entero: el scroll se suelta. */
  seFue: false,
  /** b) el pie está acostado en el piso con su DOM (lo escribe el pie de volumen). */
  acostado: false,
  /** b) desde cuándo se hunde para un viaje (ms de `performance.now`; sin hundirse, −∞) y si ya arrancó su viaje. */
  hundeDesde: Number.NEGATIVE_INFINITY,
  viajo: false,
  /** b) cuánto va el hundimiento de este cuadro (0 a 1; lo escribe el pie de volumen con `pasoDelHundimiento`). */
  hunde: 0,
}

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
 */
export function pasoDelHundimiento(ahora: number, enViaje: boolean): number {
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

/**
 * a) Un cuadro de la salida (con lo mostrado del pie y lo que pide el scroll): se fue entera cuando no queda nada a la vista; y se olvida
 * cuando la página subió hasta antes del primer tramo (`desde`: ahí el pie no se ve igual).
 */
export function seFueElPie(mostrado: number, pedido: number, desde: number): void {
  const S = SALIDA_EN_VIVO
  if (mostrado <= 1e-3) S.seFue = true
  if (S.seFue && pedido < desde) {
    S.saliendo = false
    S.seFue = false
  }
}

/** b) Cuánto se hundió la pieza (0 a 1) con el hundimiento `h`: en la primera parte (`hundeHasta`). */
export const hundidaParaElViaje = (h: number): number => suave(h / SALIDAS_DEL_PIE.hundeHasta)
/** b) Cuánto se cerró el piso sobre ella (0 a 1): en la segunda (desde `cierraDesde`). */
export const cerradoParaElViaje = (h: number): number => suave((h - SALIDAS_DEL_PIE.cierraDesde) / (1 - SALIDAS_DEL_PIE.cierraDesde))
