'use client'

import { lazy, Suspense } from 'react'

import { useAperturaDelIngreso, useIngreso } from './apertura'

/**
 * [B7] EL LOGIN DEL CHROME — escucha a «Login» (y a la URL) y monta la hoja cuando se pide.
 *
 * La hoja (`IngresoAbierto`, con el formulario y las acciones del login de siempre) viaja en su propio pedazo de código: no pesa en
 * la carga del home. Se pide al acercarse al botón (el puntero o el foco), así el clic casi nunca la espera; si la espera, el
 * despliegue arranca apenas llega. Cerrado, esto no pinta nada (tampoco en el servidor).
 */
const IngresoAbierto = lazy(() => import('./IngresoAbierto'))

const precargar = (): void => {
  void import('./IngresoAbierto')
}

export function Ingreso(): React.JSX.Element | null {
  useAperturaDelIngreso(precargar)
  const { abierto, montado, origen } = useIngreso()
  if (!montado) return null
  return (
    <Suspense fallback={null}>
      <IngresoAbierto abierto={abierto} origen={origen} />
    </Suspense>
  )
}
