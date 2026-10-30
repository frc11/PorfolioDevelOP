/**
 * [SERVICIOS V1 · L7a] LOS PRESETS DE LAS TRES PÁGINAS — lo que cada página le declara a la escena (B12a-API §1; D1: lo declara la página).
 * Una constante por servicio, armada UNA vez al cargar el módulo: la escena arma la pista una vez por preset. Los declara la intro del home
 * (`IntroDeLaPagina`) y [L7a] los lee también el viaje del home (`PRESET_DEL_DESTINO`, `_secciones/servicios/escenario/datos.ts`): el
 * MISMO objeto. Por eso este módulo no tiene JSX (P-S): los selectores salen de los módulos de cadenas, no de los componentes.
 *
 * Las tres, de noche, con la intro compartida (`PISTA_DE_LA_INTRO`), el cierre común (`SELECTOR_DEL_CIERRE`, B13) y el acento de SU servicio
 * (el claro lo lee la ranura del token por el id: nunca un hex). [L7a] Una página, tres colores: las tres usan la misma variante (`web`, la
 * de Desarrollo web), que tiñe la luz con el `acento` que le da la ranura: celeste, violeta o verde. Ninguna variante nueva.
 */

import { SELECTOR_DE_LA_INTRO } from '../../_componentes/pagina/atributoDeLaIntro'
import { SELECTOR_DEL_CIERRE } from '../../_lib/escena/ruta/atributoDelCierre'
import { PISTA_DE_LA_INTRO } from '../../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'
import type { IdDeServicio } from '../../_secciones/_contrato/acento'
import type { IdDeVariante } from '../../_variantes/registro'

/** La variante de las tres páginas, por su id en el registro (`_variantes/registro.ts`). */
export const VARIANTE_DE_LAS_PAGINAS: IdDeVariante = 'web'

function presetDe(id: IdDeServicio): PresetDeLaEscena {
  return { id, tramos: { intro: SELECTOR_DE_LA_INTRO, pie: SELECTOR_DEL_CIERRE }, pista: PISTA_DE_LA_INTRO, noche: 'noche', acento: id, variante: VARIANTE_DE_LAS_PAGINAS }
}

export const PRESETS_DE_LAS_PAGINAS: Readonly<Record<IdDeServicio, PresetDeLaEscena>> = {
  web: presetDe('web'),
  software: presetDe('software'),
  'ia-automatizacion': presetDe('ia-automatizacion'),
}
