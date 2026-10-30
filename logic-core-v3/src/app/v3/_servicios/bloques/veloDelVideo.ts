/**
 * [SERVICIOS M3] EL VELO DEL VIDEO DE TRABAJOS (D4) — tinta en degradé, de abajo hacia arriba, con el texto en `text-fondo` encima.
 *
 * Datos puros (sin react ni next): la sección pinta el velo con `CLASES_DEL_VELO`, `scripts-servicios/velo.ts` mide el contraste del
 * texto con `alfaBajoElTexto` sobre todos los cuadros del video, y `pagina.invariant.tsx` afirma que las clases dicen estos números.
 *
 *   · al pie, la tinta al 90 %;
 *   · hasta el 45 % del alto (donde vive el texto), al 75 % o más: con la tinta del tema, 4,5:1 está garantido sobre cualquier píxel,
 *     también uno blanco (M0 §4.7: 0,7 da 6,59:1 en el peor píxel);
 *   · de ahí para arriba se abre hasta transparente: el video se ve.
 * Las opacidades interpolan premultiplicadas, así que entre dos paradas el alfa va en línea recta.
 */
export const VELO_DEL_VIDEO = { alfaAlPie: 0.9, alfaBajoElTexto: 0.75, altoDelTexto: 0.45 } as const

/** Las clases del velo. Tailwind las lee de este archivo tal cual: no se arman con los números. */
export const CLASES_DEL_VELO = 'bg-linear-to-t from-tinta/90 via-tinta/75 via-45% to-transparent'
