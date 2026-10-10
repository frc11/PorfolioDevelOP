'use client'

import { useEffect, useState } from 'react'

/**
 * [PULIDO 12] 3 · el alto del formulario al enviar, que la carga y la tarjeta del resultado guardan (la placa no cambia de caja y
 * el volteo comparte el eje). Si la ventana cambia de ANCHO mientras tanto (el teléfono rota), ese alto es el de otro formulario:
 * se suelta y la tarjeta toma el suyo (el del formulario a ese ancho no se puede medir: no está montado). Un cambio sólo de alto
 * (la barra del navegador del teléfono que se esconde) no lo suelta.
 */
export function sigueValiendo(anchoAlGuardar: number, anchoAhora: number): boolean {
  return anchoAhora === anchoAlGuardar
}

export function useAltoGuardado(): readonly [number | undefined, (alto: number | undefined) => void] {
  const [alto, setAlto] = useState<number | undefined>(undefined)
  useEffect(() => {
    if (alto === undefined) return undefined
    // El ancho del diseño (no el de la vista visual: en Safari del iPhone el zoom de dos dedos lo cambia).
    const ancho = document.documentElement.clientWidth
    const alCambiar = (): void => {
      if (!sigueValiendo(ancho, document.documentElement.clientWidth)) setAlto(undefined)
    }
    window.addEventListener('resize', alCambiar)
    return () => window.removeEventListener('resize', alCambiar)
  }, [alto])
  return [alto, setAlto] as const
}
