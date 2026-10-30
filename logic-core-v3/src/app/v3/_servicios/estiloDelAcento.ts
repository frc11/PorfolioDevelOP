/**
 * [SERVICIOS S1b · S3b · M1] EL ACENTO DE LA PÁGINA — cómo entra el color del servicio, sin escribirlo en ningún componente.
 *
 * Una sola voz de acento por página, en los dos registros del contrato v4 §3 (en papel, el oscuro; sobre la noche, el claro), y los
 * DOS salen del tema, derivados del id del servicio en el home (`idEnElHome`). Ningún hex en todo `_servicios/`:
 *   · el CUERPO es papel: la raíz fija la custom property `--color-acento` con el token oscuro, `var(--color-acento-<id>)`;
 *   · la INTRO es noche: fija el mismo alias con el token claro, `var(--color-acento-<id>-claro)` ([M1] P-H2: los emitió B1.2c,
 *     `theme-develop.css:356-358`; hasta el M1 el claro era un hex en los datos).
 *
 * Todo lo demás consume las utilidades del alias (`bg-acento`, `text-acento`). Es la misma forma que usa el home en
 * `CtaDelServicio`, y la que el tema usa para sus contextos: el alias apunta al token, y quien pinta lee el alias. El alias claro
 * del tema (`--color-acento-claro`) no se usa: la intro lleva uno solo, `--color-acento`, el que ya leen la marca y el foco.
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

/** [M1] P-H2 · el token claro de un servicio (`--color-acento-<id>-claro`), con la misma derivación. */
export function tokenDelAcentoClaro(id: IdDeServicio): `--color-acento-${IdDeServicio}-claro` {
  return `--color-acento-${id}-claro`
}

/** La raíz, para el cuerpo en papel: el alias apunta al token oscuro del servicio. */
export function estiloDelAcentoSobrePapel(id: IdDeServicio): EstiloConVariables {
  return { [ALIAS_DE_ACENTO]: `var(${tokenDelAcento(id)})` }
}

/** La intro, sobre la noche: el alias apunta al token claro del servicio. */
export function estiloDelAcentoSobreNoche(id: IdDeServicio): EstiloConVariables {
  return { [ALIAS_DE_ACENTO]: `var(${tokenDelAcentoClaro(id)})` }
}

/** El envoltorio del CTA: el rótulo y su subrayado van en el acento (la tinta del botón es el alias). */
export const ESTILO_DEL_CTA: EstiloConVariables = {
  color: `var(${ALIAS_DE_ACENTO})`,
  '--color-tinta': `var(${ALIAS_DE_ACENTO})`,
}
