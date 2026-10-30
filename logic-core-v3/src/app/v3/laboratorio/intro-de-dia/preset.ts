import type { PresetDeLaEscena } from '../../_lib/escena/ruta/preset'

/** El bloque de la intro del prototipo: lo que despierta la escena (fuera de él, en el papel, duerme). */
export const SELECTOR_DE_LA_INTRO_DE_DIA = '[data-intro-del-laboratorio]'

/**
 * [L7e] El preset del prototipo de la intro de día: la escena del home quieta en su pose del hero (sin pista: el logo a la derecha, de
 * día, con el mouse), despierta sólo mientras la intro está en el cuadro. Usa el id del home porque `IdDePagina` es cerrado y el
 * laboratorio no puede sumar uno; ningún código distingue por el id `home` (lo mapeó el Explore de L7e). Constante del módulo: el mismo
 * objeto en cada render.
 */
export const PRESET_DE_LA_INTRO_DE_DIA: PresetDeLaEscena = {
  id: 'home',
  tramos: { intro: SELECTOR_DE_LA_INTRO_DE_DIA, pie: null },
  pista: null,
  noche: 'dia',
  acento: null,
  variante: null,
}
