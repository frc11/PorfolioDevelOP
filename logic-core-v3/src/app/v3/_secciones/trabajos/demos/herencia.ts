/**
 * [B1] LO QUE DEMOS HEREDÓ DEL TÚNEL — tres valores que vivían en `tunel.ts` y `angosto.ts` (hoy en el archivo,
 * `_archivo/tunel-portfolio/`) y que Demos sigue usando con el mismo número: el velo de la ventana de una demo y las dos clases de
 * su texto abajo de 1024. Se copian con su valor; el archivo guarda las suyas.
 */

/** Cuánto atenúa la sala el velo de una demo abierta (`bg-fondo` a esta opacidad): el del CTA del túnel, el mismo. */
export const VELO_DEL_CTA = 0.55

/** El titular de Demos abajo de 1024: el del cartel del Portfolio de antes (de margen a margen, sin pasarse del ancho). */
export const CLASE_DEL_TITULAR_DEL_CARTEL =
  'max-escritorio:text-[min(calc(var(--text-fluido-display-xl)*1.3),calc((100vw-2*var(--pad-lateral-compacto))/4.6))] max-movil:text-[min(var(--text-fluido-display-xl),calc((100vw-2*var(--pad-lateral-compacto))/4.6))]'

/** El cuerpo de Demos abajo de 1024: en tablet crece; en el teléfono, el `cuerpo`. */
export const CLASE_DEL_CUERPO_DE_DEMOS = 'max-escritorio:text-[length:var(--text-titulo-s)] max-movil:text-[length:var(--text-cuerpo)]'
