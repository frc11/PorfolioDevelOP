/**
 * [SERVICIOS M1] EL GATILLO, PURO — qué estado toma una pieza que se dispara entera al cruzar una línea y vuelve al subir.
 *
 * P-H18: reemplazar por el import de _contrato. El home tiene este gesto adentro de una sección (`tu-panel/Remate.tsx`), no como pieza
 * del contrato; del contrato sale lo que decide CUÁL de los cuatro cruces es y qué gesto toca (`_contrato/cruce.ts`), y eso se importa.
 * Lo propio de servicios es solo esta máquina de cuatro estados, una sola vez, y el componente que la monta (`Gatillo.tsx`).
 *
 * Las reglas son las del remate del home:
 *   · el PRIMER aviso del observador es el estado de carga, no un cruce: se posa donde toca, sin gesto;
 *   · bajando por la línea, entra; subiendo por encima de ella, se va en espejo; pasarla de largo no cambia nada;
 *   · un salto que pasó por encima de la línea sin cruzarla (A13 del home) se posa sin gesto si quedó del lado de «puesto»;
 *   · sin movimiento (movimiento reducido, o sin la coreografía instalada) está QUIETO: a la vista y sin transición.
 * Y una que el remate no tiene, la guarda en reposo: con el scroll quieto, lo que está a la vista y no se disparó, se dispara.
 */

import { gestoDelCruce, puestoTras, type EntradaAlTramo } from '../../_secciones/_contrato/cruce'

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
  // P-H25: el gatillo común del home trae esta guarda. Cubre la franja entre el borde del cuadro y la línea: ahí una pieza queda a la
  // vista sin haber cruzado (al cargar, o al parar el scroll después de irse). Lejos de la vista no toca nada: la salida al subir sigue.
  if (evento.tipo === 'reposo') return evento.aLaVista && !estaALaVista(estado) ? 'puesto' : estado
  if (evento.tipo === 'carga') return puestoTras(evento.entrada) ? 'quieto' : 'espera'
  const gesto = gestoDelCruce(evento.entrada)
  if (gesto === 'ida') return 'puesto'
  if (gesto === 'vuelta') return 'ido'
  return !estaALaVista(estado) && puestoTras(evento.entrada) ? 'quieto' : estado
}

/**
 * La línea de disparo, en % del alto del cuadro desde abajo: la del remate del home (`tu-panel/entrada.ts:71`), para que la salida al subir
 * pase a la vista, bien abajo. Lo que queda quieto en la franja de debajo sin cruzarla (medido a 1024: el CTA del precio con 44 px a la
 * vista y opacidad 0) lo dispara la guarda en reposo.
 */
export const LINEA_DEL_DISPARO = 6

/** El `rootMargin` que sube el borde de abajo del cuadro hasta la línea de disparo. */
export function margenDelDisparo(desdeAbajo: number): string {
  return `0% 0% -${desdeAbajo}% 0%`
}
