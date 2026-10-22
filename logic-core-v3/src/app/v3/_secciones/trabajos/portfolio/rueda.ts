/**
 * [B1.2c] LA RUEDA EN EL PORTFOLIO — pura (plan §13, punto 5).
 *
 * El proyecto activo manda. Con el panel adentro, la rueda no corre la página de a píxeles: avanza o retrocede DE A UN PROYECTO desde
 * el activo, en orden. Después del último («la tuya») sigue a Demos; antes del primero, sale hacia arriba. Una muesca de la rueda o un
 * deslizamiento del trackpad (con su inercia) es UN gesto, y un gesto es UN paso: el gesto termina cuando la rueda se queda quieta
 * `quietoMs`. Mientras el salto vuela, la rueda no hace nada (sigue siendo el mismo gesto).
 *
 * Y mientras la rueda tiene el control el hover queda inerte hasta que el puntero se mueva de verdad (`seMovioDeVerdad`, 4 px): los
 * lomos que se reacomodan debajo de un mouse quieto no activan nada. Así, con el puntero sobre un lomo, la rueda sigue por los
 * proyectos en vez de pelear con él (B1.2b: con el mouse arriba de un lomo y la rueda a la vez, la página seguía de largo hasta Demos).
 */

import { destinoDelGesto, entradaDelGesto } from '../../../_componentes/gatillos/maquina'

import { CANTIDAD_DE_PASOS, PX_DE_LA_APROXIMACION, pxDelPaso } from './pasos'

/** [B4] El gesto de la rueda salió a la pieza común (`_componentes/gatillos/rueda.ts`): la misma para el Portfolio y Servicios. */
export { GESTO_QUIETO, RUEDA, gestoDeLaRueda, pxDeLaRueda, type GestoDeLaRueda } from '../../../_componentes/gatillos/rueda'

export type DestinoDeLaRueda = { readonly tipo: 'paso'; readonly indice: number } | { readonly tipo: 'demos' } | { readonly tipo: 'arriba' }

/** Adónde lleva un paso de la rueda desde la tira activa (0…3: los tres proyectos y «la tuya»). [B4] La regla es la de la máquina común. */
export function destinoDeLaRueda(activa: number, sentido: 1 | -1): DestinoDeLaRueda {
  const d = destinoDelGesto(activa, sentido, CANTIDAD_DE_PASOS)
  if (d.tipo === 'despues') return { tipo: 'demos' }
  return d.tipo === 'antes' ? { tipo: 'arriba' } : d
}

/**
 * Lo que la rueda deja hacer (para los tests y el arnés, el modelo entero en una función): desde la tira activa, con el puntero
 * sobre `hover` (o `null`) y una lista de muescas, dónde termina. El hover activa su lomo ANTES de la rueda (el proyecto activo
 * manda); después la rueda tiene el control y el hover queda inerte con el puntero quieto.
 */
export function recorridoDeLaRueda(activa: number, hover: number | null, muescas: readonly (1 | -1)[]): DestinoDeLaRueda {
  let tira = hover ?? activa
  let destino: DestinoDeLaRueda = { tipo: 'paso', indice: tira }
  for (const m of muescas) {
    if (destino.tipo !== 'paso') break
    destino = destinoDeLaRueda(tira, m)
    if (destino.tipo === 'paso') tira = destino.indice
  }
  return destino
}

// ─── [F2] La entrada atrapa la rueda ──────────────────────────────────────

/**
 * [F2] EL PORTFOLIO SE VE SIEMPRE — puro. Afuera del tramo, el evento de la rueda que lleva la página adentro (`hacia`: el destino de
 * Lenis con este evento, en px de la regla) la atrapa, sea una muesca, una ráfaga o la inercia del trackpad: bajando desde antes del pin
 * aterriza en El Garage; subiendo desde la cola, en «la tuya». Devuelve la tira de aterrizaje, o `null` si la rueda no entra. Lo que
 * queda del impulso se descarta mientras el Portfolio entra (`useRuedaDelPortfolio`). [B4] La regla es la de la máquina común, con el
 * tramo contado desde el pin (la aproximación queda antes).
 */
export function tiraDeLaEntrada(fase: 'antes' | 'adentro' | 'despues', hacia: number, sentido: 1 | -1, paso: number): number | null {
  return entradaDelGesto(fase, hacia - PX_DE_LA_APROXIMACION, sentido, { cantidad: CANTIDAD_DE_PASOS, pasoPx: pxDelPaso(paso) })
}
