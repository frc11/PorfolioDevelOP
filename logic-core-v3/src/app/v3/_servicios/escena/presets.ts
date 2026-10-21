/**
 * [SERVICIOS V1] LOS PRESETS DE LAS TRES PÁGINAS — lo que cada página le declara a la escena (B12a-API §1; D1: lo declara la página). Una
 * constante por servicio, armada UNA vez al cargar el módulo: la escena arma la pista una vez por preset. Los declara la intro del home
 * (`IntroDeLaPagina`, que monta `PresetDeLaPagina`).
 *
 * Las tres, de noche, con la intro compartida (`PISTA_DE_LA_INTRO`: de la composición inicial a la pose 2), el acento de SU servicio (el
 * claro lo lee la ranura del token por el id: nunca un hex) y la intro como el tramo que despierta la escena (el pie llega con B13). La
 * variante, por su id en el registro (P-H29e): Páginas web la suya; Software e IA todavía ninguna (la ranura deja la luz de la composición).
 */

import { SELECTOR_DE_LA_INTRO } from '../../_componentes/pagina/IntroDeLaPagina'
import { PISTA_DE_LA_INTRO } from '../../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import type { IdDeServicio } from '../../_secciones/_contrato/acento'
import type { IdDeVariante } from '../../_variantes/registro'

/** La variante de cada página, por su id en el registro (`_variantes/registro.ts`). */
export const VARIANTE_DE_CADA_PAGINA: Readonly<Record<IdDeServicio, IdDeVariante | null>> = { web: 'web', software: null, 'ia-automatizacion': null }

function presetDe(id: IdDeServicio): PresetDeLaEscena {
  return { id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante: VARIANTE_DE_CADA_PAGINA[id] }
}

export const PRESETS_DE_LAS_PAGINAS: Readonly<Record<IdDeServicio, PresetDeLaEscena>> = {
  web: presetDe('web'),
  software: presetDe('software'),
  'ia-automatizacion': presetDe('ia-automatizacion'),
}
