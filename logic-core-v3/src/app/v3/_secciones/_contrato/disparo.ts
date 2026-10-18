/**
 * [P-H18] EL GATILLO, PURO — qué estado toma una pieza que se dispara ENTERA al cruzar una línea y vuelve al subir.
 *
 * Es el revelado de tipo gatillo del home (el remate de Tu panel, `tu-panel/Remate.tsx`), subido al contrato para que lo usen las
 * páginas: servicios lo tenía copiado en `_servicios/movimiento/disparo.ts` y desde acá se reemplaza por el import. Cuál de los cuatro
 * cruces es y qué gesto toca lo decide `cruce.ts`; esto es sólo la máquina de cuatro estados y la línea.
 *
 * Las reglas son las del remate:
 *   · el PRIMER aviso del observador es el estado de carga, no un cruce: se posa donde toca, sin gesto;
 *   · bajando por la línea, entra; subiendo por encima de ella, se va en espejo; pasarla de largo no cambia nada;
 *   · un salto que pasó por encima de la línea sin cruzarla (A13 del home) se posa sin gesto si quedó del lado de «puesto»;
 *   · sin movimiento (movimiento reducido, o sin la coreografía instalada) está QUIETO: a la vista y sin transición.
 * Y la guarda en reposo (P-H25): con el scroll quieto, lo que está a la vista y no se disparó, se dispara.
 */

import { gestoDelCruce, puestoTras, type EntradaAlTramo } from './cruce'

/** `quieto`: a la vista, sin transición (el HTML servido y el movimiento reducido). `espera`: escondido, sin transición. `puesto` y
 * `ido`: a la vista y escondido, CON transición (la entrada y su espejo). */
export const ESTADOS_DEL_GATILLO = ['quieto', 'espera', 'puesto', 'ido'] as const
export type EstadoDelGatillo = (typeof ESTADOS_DEL_GATILLO)[number]

export type EventoDelGatillo =
  | { readonly tipo: 'carga'; readonly entrada: EntradaAlTramo }
  | { readonly tipo: 'cruce'; readonly entrada: EntradaAlTramo }
  | { readonly tipo: 'sin-movimiento' }
  | { readonly tipo: 'reposo'; readonly aLaVista: boolean }

export const estaALaVista = (estado: EstadoDelGatillo): boolean => estado === 'quieto' || estado === 'puesto'

export function siguienteEstado(estado: EstadoDelGatillo, evento: EventoDelGatillo): EstadoDelGatillo {
  if (evento.tipo === 'sin-movimiento') return 'quieto'
  // P-H25 · la guarda cubre la franja entre el borde del cuadro y la línea: ahí una pieza queda a la vista sin haber cruzado (al cargar,
  // o al parar el scroll después de irse). Lejos de la vista no toca nada: la salida al subir sigue.
  if (evento.tipo === 'reposo') return evento.aLaVista && !estaALaVista(estado) ? 'puesto' : estado
  if (evento.tipo === 'carga') return puestoTras(evento.entrada) ? 'quieto' : 'espera'
  const gesto = gestoDelCruce(evento.entrada)
  if (gesto === 'ida') return 'puesto'
  if (gesto === 'vuelta') return 'ido'
  return !estaALaVista(estado) && puestoTras(evento.entrada) ? 'quieto' : estado
}

/** Si la caja asoma en el cuadro. Con el alto en cero (la pestaña oculta no mide) no asoma nada: la guarda no dispara a ciegas. */
export function aLaVistaEn(borde: { readonly top: number; readonly bottom: number }, alto: number): boolean {
  return alto > 0 && borde.bottom > 0 && borde.top < alto
}

/**
 * La línea de disparo, en % del alto del cuadro desde abajo: la del remate (de 35 a 6 en el CIERRE RETOQUE 3D), para que la entrada
 * llegue ni bien asoma y la salida al subir pase bien abajo. Lo que queda quieto en la franja de debajo sin cruzarla lo dispara la guarda.
 */
export const LINEA_DEL_DISPARO = 6

/** El `rootMargin` que baja la línea de disparo: sólo el borde de abajo se mete `desdeAbajo` % del cuadro. */
export function margenDelDisparo(desdeAbajo: number): string {
  return [0, 0, -desdeAbajo, 0].map((v) => `${v}%`).join(' ')
}
