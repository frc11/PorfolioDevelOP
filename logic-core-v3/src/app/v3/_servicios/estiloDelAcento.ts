/**
 * [SERVICIOS S1b · S3b] EL ACENTO DE LA PÁGINA — cómo entra el color del servicio, sin escribirlo en ningún componente.
 *
 * Una sola voz de acento por página, en los dos registros del contrato v4 §3 (en papel, el oscuro; sobre la noche, el claro):
 *   · el CUERPO es papel: la raíz fija la custom property `--color-acento` con el token oscuro del servicio en el tema,
 *     `var(--color-acento-<id>)`, derivado del id del servicio en el home (`idEnElHome`). Ningún hex.
 *   · la INTRO es noche: fija el mismo alias con el claro del servicio, el único hex de la página, que vive en un solo lugar,
 *     el campo `acento.claro` de los datos (P-H2), hasta que el tema emita los claros.
 *
 * Todo lo demás consume las utilidades del alias (`bg-acento`, `text-acento`). Es la misma forma que usa el home en
 * `CtaDelServicio`, y la que el tema usa para sus contextos: el alias apunta al token, y quien pinta lee el alias.
 *
 * ⚠ NO se usa `data-servicio` (P-S1): ese atributo es el contexto del acento del TEMA, con otro vocabulario (`web`,
 * `software`, `ia-automatizacion`), y la página no lo emite en ninguna parte.
 */

import { ALIAS_DE_ACENTO, type IdDeServicio } from '../_secciones/_contrato/acento'

/** Un `style` que acepta custom properties (`--algo`) sin un cast: la firma de índice es de plantilla. */
export type EstiloConVariables = React.CSSProperties & { readonly [variable: `--${string}`]: string }

/** El token oscuro de un servicio en `theme-develop.css`. Se deriva del id del home (`--color-acento-<id>`): no se escribe. */
export function tokenDelAcento(id: IdDeServicio): `--color-acento-${IdDeServicio}` {
  return `--color-acento-${id}`
}

/** La raíz, para el cuerpo en papel: el alias apunta al token oscuro del servicio. */
export function estiloDelAcentoSobrePapel(id: IdDeServicio): EstiloConVariables {
  return { [ALIAS_DE_ACENTO]: `var(${tokenDelAcento(id)})` }
}

/** La intro, sobre la noche: el alias con el claro del servicio (P-H2). */
export function estiloDelAcentoSobreNoche(claro: string): EstiloConVariables {
  return { [ALIAS_DE_ACENTO]: claro }
}

/** El envoltorio del CTA: el rótulo y su subrayado van en el acento (la tinta del botón es el alias). */
export const ESTILO_DEL_CTA: EstiloConVariables = {
  color: `var(${ALIAS_DE_ACENTO})`,
  '--color-tinta': `var(${ALIAS_DE_ACENTO})`,
}
