'use client'

import { SELECTOR_DE_LOS_VIAJES } from '../../_componentes/deslizamiento'
import { useAperturaDelContacto } from './apertura'

/**
 * El contacto del chrome: escucha los disparadores de todo el documento. [RETOQUE 3D] 3I: ya no monta la hoja (que enviaba
 * por WhatsApp): todo lo que lleva a contacto viaja al formulario del pie (`_secciones/cierre/FormularioDelPie.tsx`).
 */
export function Contacto(): null {
  useAperturaDelContacto(SELECTOR_DE_LOS_VIAJES)
  return null
}
