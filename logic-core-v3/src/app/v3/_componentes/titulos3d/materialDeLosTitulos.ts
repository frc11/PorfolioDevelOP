'use client'

import { createContext } from 'react'

import type { TitulosDeVolumen } from '../../_lib/escena/entorno'

/**
 * [B13] EL MATERIAL DE LOS TÍTULOS DE VOLUMEN DE UN TRAMO — sin proveedor, `undefined`: el del entorno (la tinta del home). El cierre de una
 * página de noche lo provee en `blanco` (el papel, como el título de la página: P-H33): la frase de Seis razones se lee sobre la sala de noche
 * sin tocar la pieza del home que la escribe.
 */
export const MaterialDeLosTitulos = createContext<TitulosDeVolumen | undefined>(undefined)
