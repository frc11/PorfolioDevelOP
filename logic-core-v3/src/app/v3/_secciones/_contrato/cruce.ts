/**
 * EL DISPARO POR LÍNEA — los cuatro cruces de una frontera, y qué gesto toca.
 *
 * ⚠️ SPRINT PANEL 3 · NO ES UN MECANISMO NUEVO: es `cruceDelTramo` y
 * `gestoDelCruce` de `trabajos/gota.ts`, que es como los objetos de la página
 * deciden su disparo, subidos al contrato. Una sección no puede importar de otra
 * (`s7-contrato`), y `trabajos/` es del otro lane, así que la copia vive acá hasta
 * el merge; `s6-tu-panel` afirma que las dos dan lo mismo en las cuatro entradas
 * para que no puedan separarse. Después del merge, `gota.ts` debería importarlas
 * de acá.
 *
 * Un `IntersectionObserver` con la línea de disparo como borde de abajo del
 * `rootMargin` sólo dice «ya sí» o «ya no». La caja que trae el evento dice por
 * dónde y hacia dónde:
 *
 *   · entra con el tope todavía abajo del cero → la alcanzó bajando.
 *   · entra con el tope ya pasado             → volvió a alcanzarla subiendo.
 *   · sale con el pie todavía abajo del cero   → volvió a quedar debajo: subiendo.
 *   · sale con el pie pasado                   → quedó atrás arriba: bajando.
 */

export const ENTRADAS_AL_TRAMO = ['arriba-bajando', 'arriba-subiendo', 'abajo-bajando', 'abajo-subiendo'] as const
export type EntradaAlTramo = (typeof ENTRADAS_AL_TRAMO)[number]

export type GestoDelCruce = 'ida' | 'vuelta' | 'nada'

export interface CruceObservado {
  readonly cruza: boolean
  /** `boundingClientRect.top`, en coordenadas del cuadro. */
  readonly tope: number
  /** `boundingClientRect.bottom`, en las mismas. */
  readonly pie: number
}

/** Qué cruce es, de los cuatro. Función total. */
export function cruceDelTramo(c: CruceObservado): EntradaAlTramo {
  if (c.cruza) return c.tope > 0 ? 'arriba-bajando' : 'abajo-subiendo'
  return c.pie > 0 ? 'arriba-subiendo' : 'abajo-bajando'
}

/** Bajando por la línea de disparo, la entrada; volviendo a subir por encima, la vuelta; lo demás, nada. */
export function gestoDelCruce(entrada: EntradaAlTramo): GestoDelCruce {
  if (entrada === 'arriba-bajando') return 'ida'
  if (entrada === 'arriba-subiendo') return 'vuelta'
  return 'nada'
}

/** El estado quieto que corresponde a un cruce: puesto en todos salvo cuando quedó debajo de la línea. */
export function puestoTras(entrada: EntradaAlTramo): boolean {
  return entrada !== 'arriba-subiendo'
}
