'use client'

import { Suspense, lazy, useSyncExternalStore } from 'react'

import { entornoDeLaEscena } from '../../_lib/escena/entorno'

/**
 * [3D Y SONIDO] T2 · EL SONIDO DEL HOME — dos montajes perezosos, ninguno en el producto: el control del parlante con la
 * prueba (`?pruebas=sonido=si`, el sitio con sonido) y la página de prueba (`?sonidos=1`, un botón y un volumen por
 * sonido). Se deciden DESPUÉS de hidratar (el servidor no ve la URL): el primer render es el del producto, sin nada.
 */
const ControlDelSonido = lazy(() => import('./ControlDelSonido'))
const PruebaDeSonidos = lazy(() => import('./PruebaDeSonidos'))

const sinCambios = (): (() => void) => () => undefined
const conElControl = (): boolean => entornoDeLaEscena().pruebas.sonido === 'si'
const conLaPrueba = (): boolean => new URLSearchParams(window.location.search).get('sonidos') === '1'

export function SonidoDelHome(): React.JSX.Element {
  const control = useSyncExternalStore(sinCambios, conElControl, () => false)
  const prueba = useSyncExternalStore(sinCambios, conLaPrueba, () => false)
  return (
    <>
      {control && (
        <Suspense fallback={null}>
          <ControlDelSonido />
        </Suspense>
      )}
      {prueba && (
        <Suspense fallback={null}>
          <PruebaDeSonidos />
        </Suspense>
      )}
    </>
  )
}
