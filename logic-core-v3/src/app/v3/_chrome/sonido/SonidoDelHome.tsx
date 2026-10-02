'use client'

import { Suspense, lazy, useSyncExternalStore } from 'react'

/**
 * [3D Y SONIDO] T2 · EL SONIDO DEL HOME — dos montajes perezosos: el control del parlante y la página de prueba
 * (`?sonidos=1`, un botón y un volumen por sonido, y los candidatos para elegir). [RETOQUE 3D] El parlante pasó al producto
 * (apagado por defecto: nada suena ni se descarga hasta que se prende); la bandera `sonido=si` se borró. Se deciden
 * DESPUÉS de hidratar (el servidor no ve la URL ni el almacenamiento): el primer render es sin nada.
 */
const ControlDelSonido = lazy(() => import('./ControlDelSonido'))
const PruebaDeSonidos = lazy(() => import('./PruebaDeSonidos'))

const sinCambios = (): (() => void) => () => undefined
const conLaPrueba = (): boolean => new URLSearchParams(window.location.search).get('sonidos') === '1'

export function SonidoDelHome(): React.JSX.Element {
  const control = useSyncExternalStore(sinCambios, () => true, () => false)
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
