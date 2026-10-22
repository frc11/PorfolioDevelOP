'use client'

import { ACCIONES_DEL_INGRESO } from './acciones'
import { FormularioDelIngreso } from './FormularioDelIngreso'
import { HojaDelIngreso } from './HojaDelIngreso'

/**
 * [B7] EL LOGIN ABIERTO — la hoja con el formulario y las acciones de siempre. Es el pedazo de código que `Ingreso.tsx` pide
 * perezoso (`export default` por eso): el formulario y las acciones del login no viajan en la carga del home.
 */
export default function IngresoAbierto({ abierto, origen }: { readonly abierto: boolean; readonly origen: HTMLElement | null }): React.JSX.Element {
  return (
    <HojaDelIngreso abierto={abierto} origen={origen}>
      <FormularioDelIngreso acciones={ACCIONES_DEL_INGRESO} />
    </HojaDelIngreso>
  )
}
