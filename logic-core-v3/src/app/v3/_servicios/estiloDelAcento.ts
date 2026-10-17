/**
 * [SERVICIOS S1b] EL ACENTO DE LA PÁGINA — cómo entra el color del servicio, sin escribirlo en ningún componente.
 *
 * La raíz fija la custom property `--color-acento` con el claro del servicio (plan §4.2) y todo lo demás consume las
 * utilidades del alias (`bg-acento`, `text-acento`). Es la misma forma que usa el home en `CtaDelServicio`. El hex vive
 * en un solo lugar: el campo `acento.claro` de los datos (P-H2).
 *
 * ⚠ NO se usa `data-servicio` (P-S1): ese atributo es el contexto del acento del TEMA, con otro vocabulario (`web`,
 * `software`, `ia-automatizacion`), y la página no lo emite en ninguna parte.
 */

import { ALIAS_DE_ACENTO } from '../_secciones/_contrato/acento'

/** Un `style` que acepta custom properties (`--algo`) sin un cast: la firma de índice es de plantilla. */
export type EstiloConVariables = React.CSSProperties & { readonly [variable: `--${string}`]: string }

/** La raíz: fija el alias con el claro del servicio. */
export function estiloDelAcento(claro: string): EstiloConVariables {
  return { [ALIAS_DE_ACENTO]: claro }
}

/** El envoltorio del CTA: el rótulo y su subrayado van en el acento (la tinta del botón es el alias). */
export const ESTILO_DEL_CTA: EstiloConVariables = {
  color: `var(${ALIAS_DE_ACENTO})`,
  '--color-tinta': `var(${ALIAS_DE_ACENTO})`,
}
