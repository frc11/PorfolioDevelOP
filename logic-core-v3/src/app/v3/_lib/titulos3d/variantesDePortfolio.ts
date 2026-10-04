'use client'

import { useSyncExternalStore } from 'react'

import { entornoDeLaEscena, type VarianteDePortfolio } from '../escena/entorno'
import type { Lectura } from '../escena/titulos3d/colocacion'
import type { FormaDeLaLlegada } from '../escena/titulos3d/llegada'

/**
 * [PASADA FINAL] 0 · LAS LLEGADAS DE PORTFOLIO DE ANTES, para elegir en vivo (`?pruebas=portfolio=e9|e10|3ds|lejos`; sin
 * la bandera, la de hoy). Sacadas del historial tal cual:
 *   · la DISTANCIA y el giro (`forma`: de dónde sale cada letra, cuánto gira y sobre qué),
 *   · la CURVA (la misma cúbica de salida en las cuatro, con su escalonado: `forma.dura`),
 *   · la DURACIÓN (`minimoS`: lo mínimo que tarda lo mostrado de punta a punta; sin él, va con el scroll),
 *   · y la CÁMARA: con cualquiera de las cuatro la cámara se mueve como entonces en el tramo de Portfolio
 *     (`escena/camaraDeEntonces.ts`: la de entonces iba ~0,03 de progreso atrás, todavía girando hacia Números cuando
 *     llegaban las letras), y el título se coloca como entonces (`colocacion` y `lectura`).
 * Todas con lo robusto de F2 (`mostradoDelScroll`): se dan vuelta con el scroll, al frenar terminan armadas o
 * desarmadas, y en un viaje del menú se desarman y repiten la llegada al terminar. Se van con la huida del cartel, como
 * entonces (la de hoy se queda hasta que la tapa el túnel).
 *
 *   e9     ESCENA 9 T5 (64bb4a96), la variante WebGL: cada letra acostada hacia atrás sobre su base (84°), de 3 alturas
 *          de letra más atrás y 0,3 más abajo, se levanta como una tapa; escalonado 0,5; se disuelve en toda su llegada
 *          (era una opacidad); va con el scroll, pegada a su lugar de la pantalla.
 *   e10    ESCENA 10 T3 (eec0b4e3): de 16 em atrás y 1,2 arriba, girando una vuelta y cuarto y un poco inclinada;
 *          escalonado 0,6; 1,4 s de mínimo; quieta en el mundo, colocada con la cámara de 0,4718.
 *   3ds    3D Y SONIDO T1 (92d345e8): la MISMA de ESCENA 10 (ese sprint la pasó al producto sin tocar estas cifras ni la
 *          cámara; lo que agregó —los viajes del menú y el texto 2D que se esconde recién con el 3D armado— hoy lo
 *          tienen todas).
 *   lejos  la de ESCENA 10 naciendo el doble de lejos (32 em atrás y 2,4 arriba) y un poco más lenta (1,8 s).
 *
 * Las cifras van escritas (no importadas de la escena): son las de cada commit, y `s47` las ata.
 */
export interface LlegadaDePortfolio {
  readonly commit: string
  readonly forma: FormaDeLaLlegada
  readonly minimoS: number | null
  readonly salidaMinimaS: number | null
  readonly colocacion: 'lectura' | 'pantalla'
  readonly lectura: Lectura
}

/** La de ESCENA 10 (`LLEGADA_DE_LAS_LETRAS` en eec0b4e3): la de siempre. */
const DE_ESCENA_10: FormaDeLaLlegada = { id: 'letras', desde: [0, 1.2, -16], porAlto: false, vueltas: 1.25, inclinacion: 0.12, dura: 0.6, aparece: 0.35, pivote: 'centro' }
/** Con la cámara de 0,4718 se colocaba Portfolio en ESCENA 10 (`LECTURA.portfolio` en eec0b4e3 y en 92d345e8). */
const LECTURA_DE_ENTONCES = 0.4718

export const LLEGADAS_DE_PORTFOLIO: Readonly<Record<VarianteDePortfolio, LlegadaDePortfolio>> = {
  e9: {
    commit: '64bb4a96',
    // `LLEGADA_3D` y `TITULOS_3D` de 64bb4a96: giro 84°, 3 alturas atrás, 0,3 abajo, escalonado 0,5; la opacidad, toda la llegada.
    forma: { id: 'tapa-de-escena-9', desde: [0, -0.3, -3], porAlto: true, vueltas: 0, inclinacion: -84 / 360, dura: 0.5, aparece: 1, pivote: 'base' },
    minimoS: null,
    salidaMinimaS: null,
    colocacion: 'pantalla',
    lectura: LECTURA_DE_ENTONCES,
  },
  e10: { commit: 'eec0b4e3', forma: DE_ESCENA_10, minimoS: 1.4, salidaMinimaS: 1.4, colocacion: 'lectura', lectura: LECTURA_DE_ENTONCES },
  '3ds': { commit: '92d345e8', forma: DE_ESCENA_10, minimoS: 1.4, salidaMinimaS: 1.4, colocacion: 'lectura', lectura: LECTURA_DE_ENTONCES },
  lejos: {
    commit: 'eec0b4e3 × 2',
    forma: { ...DE_ESCENA_10, id: 'lejos', desde: [0, 2.4, -32] },
    minimoS: 1.8,
    salidaMinimaS: 1.8,
    colocacion: 'lectura',
    lectura: LECTURA_DE_ENTONCES,
  },
}

const sinCambios = (): (() => void) => () => undefined

/** La prueba de esta carga: `no` en el servidor y al hidratar (no la conoce); la pedida, después. */
export function useVarianteDePortfolio(): VarianteDePortfolio | 'no' {
  return useSyncExternalStore(sinCambios, () => entornoDeLaEscena().pruebas.portfolio, () => 'no')
}
