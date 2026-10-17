/**
 * [B1] LAS MEDIDAS DE LOS MEDIOS DEL PORTFOLIO — las que dejó la codificación (`scripts-portfolio/codificar.ts`, el recibo en
 * `docs/rediseno/entregas/b1-portfolio/medios.json`). Son geometría y no contenido (`s5-contenido` no deja números en el contenido);
 * s76 las compara contra el recibo. El escritorio de El Garage y el teléfono de Esquina se codificaron más chicos para entrar en
 * el techo de peso: se baja la resolución antes que la calidad.
 */

import type { SlugDelProyecto } from '../proyectos'

export interface Medida {
  readonly ancho: number
  readonly alto: number
}

export const MEDIDAS_DE_LOS_MEDIOS: Readonly<Record<SlugDelProyecto, { readonly escritorio: Medida; readonly movil: Medida }>> = {
  'el-garage': { escritorio: { ancho: 1280, alto: 800 }, movil: { ancho: 780, alto: 1688 } },
  'esquina-estudio': { escritorio: { ancho: 1440, alto: 900 }, movil: { ancho: 690, alto: 1494 } },
  'banu-scents': { escritorio: { ancho: 1440, alto: 900 }, movil: { ancho: 780, alto: 1688 } },
}

/** La proporción del medio de la tira (la de los videos de escritorio, 16:10); va en línea, no en una clase arbitraria. */
export const PROPORCION_DEL_MEDIO = '16 / 10'

/** El `sizes` del medio de la tira activa: la mitad del cuadro desde 1024 (menos los lomos), el 60 % en tablet. */
export const SIZES_DEL_MEDIO = '(min-width: 1024px) 42vw, 52vw'
/** El lomo muestra el póster del teléfono (vertical, como el lomo) cubriendo una pantalla de alto. */
export const SIZES_DEL_LOMO = '420px'
