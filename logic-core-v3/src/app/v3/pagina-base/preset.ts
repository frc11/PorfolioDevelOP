import { SELECTOR_DE_LA_INTRO } from '../_componentes/pagina/atributoDeLaIntro'
import { PISTA_DE_LA_INTRO } from '../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../_lib/escena/ruta/preset'

/**
 * El preset de la página base, armado una vez: el mismo objeto en cada render (la escena arma la pista una vez por preset). [B12b] Aparte
 * de `page.tsx` (que no puede exportar nada más que lo de una página) porque lo lee también el viaje del CTA de un servicio del home
 * (`DESTINO_DEL_SERVICIO`, `_secciones/servicios/escenario/datos.ts`): la escena se entera de adónde va antes de navegar. Sin JSX: lo
 * importa un componente de cliente.
 */
export const PRESET: PresetDeLaEscena = {
  id: 'base',
  tramos: { intro: SELECTOR_DE_LA_INTRO, pie: null },
  pista: PISTA_DE_LA_INTRO,
  noche: 'noche',
  // El acento de web y la variante de ejemplo (el registro: `_variantes/registro.ts`), para ejercer la ranura.
  acento: 'web',
  variante: 'prueba',
}
