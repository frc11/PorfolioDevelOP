import { SELECTOR_DE_LA_INTRO } from '../_componentes/pagina/atributoDeLaIntro'
import { SELECTOR_DEL_CIERRE } from '../_lib/escena/ruta/atributoDelCierre'
import { PISTA_DE_LA_INTRO } from '../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../_lib/escena/ruta/preset'

/**
 * El preset de la página base, armado una vez: el mismo objeto en cada render (la escena arma la pista una vez por preset). [B12b] Aparte
 * de `page.tsx` (que no puede exportar nada más que lo de una página), sin JSX. [L7a] El viaje del CTA de un servicio del home ya no
 * viene acá: va a la página de su servicio (`PRESET_DEL_DESTINO`, con los presets de `_servicios/escena/presets.ts`).
 */
export const PRESET: PresetDeLaEscena = {
  id: 'base',
  // [B13] El pie es el cierre de la página (`CierreDeLaPagina`): Seis razones, el CTA, la resolución y el pie, con la escena.
  tramos: { intro: SELECTOR_DE_LA_INTRO, pie: SELECTOR_DEL_CIERRE },
  pista: PISTA_DE_LA_INTRO,
  noche: 'noche',
  // El acento de web y la variante de ejemplo (el registro: `_variantes/registro.ts`), para ejercer la ranura.
  acento: 'web',
  variante: 'prueba',
}
