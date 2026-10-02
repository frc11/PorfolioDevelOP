'use client'

import { SELECTOR_DE_LOS_VIAJES } from '../../_componentes/deslizamiento'
import { useAperturaDelContacto } from './apertura'
import { FormularioDeContacto } from './FormularioDeContacto'

/**
 * El contacto del chrome: escucha los disparadores de todo el documento y monta el panel (la hoja). [RETOQUE 3D] 3I: lo
 * que lleva a contacto viaja al formulario del pie (`_secciones/cierre/FormularioDelPie.tsx`). [CIERRE RETOQUE 3D] N1:
 * menos «Contacto» (la esquina de la barra y el menú del teléfono), que abre el panel de SPRINT CONTACTO.
 */
export function Contacto(): React.JSX.Element {
  useAperturaDelContacto(SELECTOR_DE_LOS_VIAJES)
  return <FormularioDeContacto />
}
