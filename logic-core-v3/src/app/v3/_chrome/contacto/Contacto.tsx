'use client'

import { useAperturaDelContacto } from './apertura'
import { FormularioDeContacto } from './FormularioDeContacto'

/** El contacto del chrome: escucha los disparadores de todo el documento y monta el formulario. */
export function Contacto(): React.JSX.Element {
  useAperturaDelContacto()
  return <FormularioDeContacto />
}
