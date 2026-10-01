'use client'

import { useSyncExternalStore } from 'react'

import { entornoDeLaEscena, type Pruebas } from './escena/entorno'

/**
 * [INTERFAZ 2] LAS PRUEBAS, VISTAS DESDE EL DOM — la misma lista que la escena (`entorno.ts`, `?pruebas=…` en la URL o
 * el pedido del banco), resuelta una vez por carga. En el servidor y en el primer render vale `no` (la hidratación no
 * se separa); en el cliente, lo pedido. Es la forma de `useTitulosDeVolumen` (`_lib/titulos3d/registro.ts`).
 */
const sinCambios = (): (() => void) => () => undefined

export function usePrueba<K extends keyof Pruebas>(clave: K): Pruebas[K] | 'no' {
  return useSyncExternalStore<Pruebas[K] | 'no'>(sinCambios, () => entornoDeLaEscena().pruebas[clave], () => 'no')
}
