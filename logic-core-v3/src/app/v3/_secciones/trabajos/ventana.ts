/**
 * LA VENTANA DEL CTA DESDE 1024 — su frase y «Hablemos» miden lo que mide la
 * VENTANA, no el viewport. **[MÓVIL 2]**
 *
 * ── El defecto, medido (layout, sin transformadas) ─────────────────────────
 *
 *     ancho   ventana     contenido   «Hablemos» termina en
 *     1024    635 × 397   513 px      481  → afuera 84 px
 *     1280    794 × 496   542 px      510  → afuera 14 px
 *     1440    893 × 558   560 px      528  → adentro
 *
 * La ventana es una fracción del ancho (0,62) y la frase un nivel fluido en `vw` que
 * crece más despacio: al angostar, la caja se achica más rápido que su texto. A 1440
 * entra —es la composición de referencia— y hacia abajo se sale.
 *
 * ── El arreglo: cada medida vertical del cuerpo es una recta del ancho de la ventana ─
 *
 * La frase, «Hablemos» y el aire que los separa del cromo y del borde se escriben en
 * `cqw` de la ventana (`@container`): `medida(W) = medida₁₄₄₀ · (P · W / W₁₄₄₀ − (P − 1))`.
 * Vale lo mismo que hoy a 1440 y cae con pendiente `P` por debajo. La pendiente se
 * despeja de 1024: el cromo (66 px) no escala, así que las cuatro medidas tienen que
 * caer más rápido que la ventana. Con los números de arriba el piso es 1,1435; con
 * `P = 1,2` a 1024 sobran 8 px y a 1280, 2. Todo va con `min()` contra la medida de
 * siempre, así que arriba de 1440 —donde la recta pasa por encima— no cambia nada.
 */

import type { CSSProperties } from 'react'

import { ANCHO_DEL_CTA } from './tunel'

/** El ancho de LAYOUT de la ventana en la composición de referencia (1440 × 0,62). */
export const ANCHO_DE_LA_VENTANA_DE_REFERENCIA = 1440 * ANCHO_DEL_CTA

/** Cuánto más rápido que la ventana caen las medidas del cuerpo. Despejada de 1024. */
export const PENDIENTE_DEL_CUERPO = 1.2

/**
 * Las medidas de 1440 que se escalan: la frase es `display-xl` fluido a 1440
 * (3,3732 rem + 3,4742 vw = 104 px); «Hablemos» es `titulo-m` (32 px); el aire de
 * arriba del CTA y el de abajo de la ventana son `pt-12` y `pb-8`.
 */
export const MEDIDAS_DE_REFERENCIA = { frase: 104, cta: 32, aireArriba: 48, aireAbajo: 32 } as const

/** Una medida de 1440 como recta del ancho de la ventana, en `cqw` menos un fijo. */
export function enLaVentana(px: number): string {
  const porCqw = (px * PENDIENTE_DEL_CUERPO * 100) / ANCHO_DE_LA_VENTANA_DE_REFERENCIA
  return `calc(${porCqw.toFixed(5)}cqw - ${(px * (PENDIENTE_DEL_CUERPO - 1)).toFixed(3)}px)`
}

/** Las variables que leen las clases `escritorio:` de la ventana (`VentanaDelCta`). */
export const ESTILO_DEL_CUERPO_QUE_ESCALA = {
  '--frase-en-la-ventana': enLaVentana(MEDIDAS_DE_REFERENCIA.frase),
  '--cta-en-la-ventana': enLaVentana(MEDIDAS_DE_REFERENCIA.cta),
  '--aire-arriba-del-cta': enLaVentana(MEDIDAS_DE_REFERENCIA.aireArriba),
  '--aire-abajo-de-la-ventana': enLaVentana(MEDIDAS_DE_REFERENCIA.aireAbajo),
} as CSSProperties
