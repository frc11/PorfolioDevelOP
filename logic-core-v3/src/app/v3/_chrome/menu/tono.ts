/**
 * EL TONO DE LO QUE HAY DEBAJO DEL BOTÓN — sale de la superficie declarada y de la noche. **[CONTACTO]**
 *
 * No hay un corte de scroll escrito a mano: la sección que queda bajo el botón dice su
 * superficie en `secciones.ts`, y si deja ver la sala, la sala está de noche o de día según
 * `nocheEfectiva()`, el mismo estado que lee la escena. Sobre oscuro, el botón y el menú van
 * claros; sobre claro, dados vuelta.
 */

import { SUPERFICIES, type ModoSuperficie } from '../../_lib/superficies'

export type Tono = 'claro' | 'oscuro'

/** A partir de cuánta noche la sala se lee oscura. */
export const NOCHE_QUE_OSCURECE = 0.5

export function tonoDebajo(superficie: ModoSuperficie, noche: number): Tono {
  const s = SUPERFICIES[superficie]
  if (s.invertida) return 'oscuro'
  return s.dejaVerElCanvas && noche >= NOCHE_QUE_OSCURECE ? 'oscuro' : 'claro'
}

/** El botón y el menú se dan vuelta (`data-seccion="invertida"`) cuando lo de abajo es claro. */
export const vaInvertido = (debajo: Tono): boolean => debajo === 'claro'

export interface PanelEnElCuadro {
  readonly id: string
  readonly tope: number
  readonly pie: number
}

/**
 * La sección que se ve en la altura `y` del cuadro. Si dos se pisan (el solape de Trabajos
 * sobre Números), gana la que va después en el documento, que es la que se pinta encima.
 */
export function panelEn(paneles: readonly PanelEnElCuadro[], y: number): string | null {
  let visto: string | null = null
  for (const p of paneles) if (p.tope <= y && y < p.pie) visto = p.id
  return visto
}
