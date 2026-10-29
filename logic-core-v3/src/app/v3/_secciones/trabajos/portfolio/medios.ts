/**
 * [B1] LAS MEDIDAS DE LOS MEDIOS DEL PORTFOLIO — las que dejó la codificación (`scripts-portfolio/codificar.ts`, el recibo en
 * `docs/rediseno/entregas/b1-portfolio/medios.json`). Son geometría y no contenido (`s5-contenido` no deja números en el contenido);
 * s76 las compara contra el recibo. El escritorio de El Garage y el teléfono de Esquina se codificaron más chicos para entrar en
 * el techo de peso: se baja la resolución antes que la calidad. [B1.2b] P-H11 · el teléfono de El Garage, en la resolución de su
 * grabación (390 × 844): el `recordVideo` lo había dejado en el cuarto de arriba a la izquierda de un cuadro gris de 780 × 1688.
 */

import type { SlugDelProyecto } from '../proyectos'

export interface Medida {
  readonly ancho: number
  readonly alto: number
}

export const MEDIDAS_DE_LOS_MEDIOS: Readonly<Record<SlugDelProyecto, { readonly escritorio: Medida; readonly movil: Medida }>> = {
  'el-garage': { escritorio: { ancho: 1280, alto: 800 }, movil: { ancho: 390, alto: 844 } },
  'esquina-estudio': { escritorio: { ancho: 1440, alto: 900 }, movil: { ancho: 690, alto: 1494 } },
  'banu-scents': { escritorio: { ancho: 1440, alto: 900 }, movil: { ancho: 780, alto: 1688 } },
}

/** La proporción del medio de la tira (la de los videos de escritorio, 16:10); va en línea, no en una clase arbitraria. */
export const PROPORCION_DEL_MEDIO = '16 / 10'

/**
 * [B1.2b] El ancho del medio: el de la tira, sin pasar del 38 % del alto del cuadro (deja lugar a la ficha, que va siempre abajo).
 * [B1.2c] Abajo de 1024, el 28 %: las barras de progreso le sacan alto a la tira y en la tablet acostada la ficha no entraba (el
 * banco). El alto lo pone el panel (`--alto-del-medio`, su clase).
 */
export const ANCHO_DEL_MEDIO = 'min(100%, calc(var(--alto-del-medio) * 16 / 10))'
export const CLASE_DEL_ALTO_DEL_MEDIO = '[--alto-del-medio:38svh] max-escritorio:[--alto-del-medio:28svh]'

/** [L2] El alto del medio en la tarjeta del carrusel ya no es una fracción del cuadro: cede lo que deja la ficha (`TarjetaDelProyecto`). */

/**
 * [F4] Con el medio corrido por la píldora (`despejeDelMedio`, A2.1), el video queda del MISMO tamaño que a 1440, el de su columna (A2.1 lo
 * achicaba lo que bajaba: a 1024 quedaba en el 68 %). Lo que baja sale del aire de la ficha: el de antes de «Visitar sitio» (de
 * `--spacing-5` a `--spacing-2`: un margen negativo le saca la diferencia al `gap`) y el sobrante de abajo (de `--spacing-12` a `--spacing-4`).
 */
export const AIRE_CON_DESPEJE = { antesDeVisitar: 'calc(var(--spacing-2) - var(--spacing-5))', debajo: 'var(--spacing-4)' } as const

/** El `sizes` del medio de la tira activa: la mitad del cuadro desde 1024 (menos los lomos), el 60 % en tablet. */
export const SIZES_DEL_MEDIO = '(min-width: 1024px) 42vw, 52vw'
/** El lomo muestra el póster del teléfono (vertical, como el lomo) cubriendo una pantalla de alto. */
export const SIZES_DEL_LOMO = '420px'
