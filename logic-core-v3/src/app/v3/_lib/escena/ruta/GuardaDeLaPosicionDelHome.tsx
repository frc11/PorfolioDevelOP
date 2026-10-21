'use client'

import { useLayoutEffect } from 'react'

import { RUTA_DEL_HOME } from '../../veloDeNavegacion'

import { claveDeLaEntrada, guardarLaPosicionDelHome, posicionDeAhora } from './posicionDelHome'

type ConNavegacion = { readonly navigation?: Pick<EventTarget, 'addEventListener' | 'removeEventListener'> }

/**
 * [B12a.7] GUARDA DÓNDE ESTABA EL HOME AL IRSE, por cualquier camino (un enlace, la flecha, el menú): en la limpieza de un efecto de
 * layout, que React corre al desmontar el home ANTES de sacar su DOM, con el scroll y la noche todavía suyos (después, el documento de la
 * página acorta el scroll y la gota apaga la noche en su limpieza pasiva). La monta sólo el home; sin DOM propio.
 *
 * [B12a.8] Bajo la clave de SU entrada del historial: la de la última entrada en la que se estuvo en el home (el viaje de la barra suma
 * entradas con el ancla, y la que queda es la de la última). Al irse, la entrada de ahora ya puede ser la de la página (la flecha, o el
 * enlace que ya empujó la suya): por eso se sigue mientras el home está y sólo con la ruta del home.
 */
export function GuardaDeLaPosicionDelHome(): null {
  useLayoutEffect(() => {
    let clave = claveDeLaEntrada()
    const navegacion = (window as Window & ConNavegacion).navigation
    const alCambiarLaEntrada = (): void => {
      if (window.location.pathname === RUTA_DEL_HOME) clave = claveDeLaEntrada()
    }
    navegacion?.addEventListener('currententrychange', alCambiarLaEntrada)
    return () => {
      navegacion?.removeEventListener('currententrychange', alCambiarLaEntrada)
      guardarLaPosicionDelHome(posicionDeAhora(), clave)
    }
  }, [])
  return null
}
