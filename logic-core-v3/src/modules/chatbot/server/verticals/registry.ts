/**
 * EV.1 — Registry de packs verticales.
 *
 * Punto único de resolución de packs por clave. Garantía de runtime:
 * nunca lanza — una clave desconocida devuelve el pack `base` y loguea
 * un warning, por lo que el motor nunca cae por un vertical mal configurado.
 *
 * Para añadir un pack (EV.2+):
 *   1. Crear `packs/<clave>.ts` que exporte el pack con `satisfies VerticalPack`.
 *   2. Añadir la clave a `VerticalPackKey` en types.ts.
 *   3. Añadir la entrada en `PACKS` abajo.
 */

import type { VerticalPack, VerticalPackKey } from './types'
import { BASE_PACK } from './packs/base'

/**
 * Registro de packs. Indexado por `VerticalPackKey`.
 *
 * Las claves `usados` y `agencia` usan BASE_PACK como placeholder hasta
 * que EV.2 cree sus packs específicos. `getVerticalPack` las resuelve
 * directamente (sin warning) — son claves conocidas, no errores.
 */
const PACKS = {
  base: BASE_PACK,
  usados: BASE_PACK,   // TODO EV.2: reemplazar con USADOS_PACK
  agencia: BASE_PACK,  // TODO EV.2: reemplazar con AGENCIA_PACK
} satisfies Record<VerticalPackKey, VerticalPack>

/**
 * Resuelve un pack por su clave.
 *
 * - Clave conocida → devuelve el pack correspondiente.
 * - Clave desconocida → devuelve `base` y emite console.warn.
 *   Nunca lanza: un pack desconocido nunca debe tirar el runtime.
 */
export function getVerticalPack(key: string): VerticalPack {
  if (Object.prototype.hasOwnProperty.call(PACKS, key)) {
    return PACKS[key as VerticalPackKey]
  }
  console.warn(
    `[verticals] Pack desconocido: "${key}" — usando "base" como fallback. ` +
    `Claves válidas: ${Object.keys(PACKS).join(', ')}.`,
  )
  return PACKS.base
}

/** Devuelve todos los packs registrados. */
export function listVerticalPacks(): VerticalPack[] {
  return Object.values(PACKS)
}
