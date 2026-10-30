import { SELECTOR_DE_LA_INTRO } from '../_componentes/pagina/atributoDeLaIntro'
import { SELECTOR_DEL_CIERRE } from '../_lib/escena/ruta/atributoDelCierre'
import { PISTA_DE_LA_INTRO } from '../_lib/escena/ruta/pistaDeLaIntro'
import type { PresetDeLaEscena } from '../_lib/escena/ruta/preset'

/** [L7b] El preset de Nosotros: de día, sin acento ni variante. Una constante del módulo (el mismo objeto en cada render). */
export const PRESET: PresetDeLaEscena = {
  id: 'nosotros',
  tramos: { intro: SELECTOR_DE_LA_INTRO, pie: SELECTOR_DEL_CIERRE },
  pista: PISTA_DE_LA_INTRO,
  noche: 'dia',
  acento: null,
  variante: null,
}
