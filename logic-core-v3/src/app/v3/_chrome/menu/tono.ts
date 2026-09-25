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

// [VIAJES] Vive con la extensión de las secciones: la usan también el viaje y la escena.
export { panelEn, type PanelEnElCuadro } from '../../_lib/escena/extensionDeLasSecciones'
