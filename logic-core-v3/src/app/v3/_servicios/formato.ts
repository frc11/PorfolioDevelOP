/**
 * [SERVICIOS S1a] EL FORMATO — cómo se escribe un precio y cómo se ve un dato que falta (plan §8.4).
 *
 * Funciones puras con el modo inyectado: el template calcula `enDesarrollo` UNA vez y lo pasa, así los tests no
 * tocan `process.env`.
 *   · En desarrollo, el marcador se ve donde falta el dato.
 *   · En producción, `null`: el ítem que depende del dato no se monta. Nunca aparece un número inventado.
 *
 * No usa la llave del contenido inventado (`_contrato/llave.ts`): «[a definir]» no es relleno, es un dato que falta.
 */

import type { Usd } from './tipos'

export const MARCADOR_A_DEFINIR = '[a definir]'

/** `always` fuerza el punto de miles también en cuatro cifras: el SPEC escribe «USD 1.000». */
const MILES = new Intl.NumberFormat('es-AR', { useGrouping: 'always', maximumFractionDigits: 0 })

/** «USD 200», «USD 1.000». */
export function usd(n: number): string {
  return `USD ${MILES.format(n)}`
}

/** «500», «3.000»: un entero con el punto de miles del SPEC (las conversaciones de un plan). */
export function numero(n: number): string {
  return MILES.format(n)
}

/** El texto, o el marcador en desarrollo, o `null` (no se monta) en producción. */
export function textoOMarcador(valor: string | null, enDesarrollo: boolean): string | null {
  if (valor !== null) return valor
  return enDesarrollo ? MARCADOR_A_DEFINIR : null
}

/** El precio formateado, o el marcador en desarrollo, o `null` (no se monta) en producción. */
export function usdOMarcador(n: Usd, enDesarrollo: boolean): string | null {
  if (n !== null) return usd(n)
  return enDesarrollo ? MARCADOR_A_DEFINIR : null
}
