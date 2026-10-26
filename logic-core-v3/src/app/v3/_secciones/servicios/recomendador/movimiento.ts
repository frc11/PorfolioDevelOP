import { CURVA } from '../../../_componentes/formularios/EstadoDeEnvio'
import { fundidoDelEnvio } from '../../../_lib/formularios/estadoDeEnvio'
import { LENIS_DEL_SITIO } from '../../../_lib/lenisDelSitio'

/**
 * [C2-51] EL MOVIMIENTO DEL RECOMENDADOR — los efectos que ya usa el sitio, importados: el fundido de `EstadoDeEnvio` (su duración,
 * `fundidoDelEnvio`, y su curva) y el texto que se levanta al aparecer (el del mensaje del envío: unos px desde abajo, sin moverse al
 * irse). Con movimiento reducido, fundidos cortos y nada que se mueva.
 */

/** Lo que sube el texto al aparecer (px): el del mensaje del envío (`EstadoDeEnvio`). */
export const SUBIDA_DEL_TEXTO = 8

export interface FundidoQueSube {
  readonly initial: { readonly opacity: number; readonly y: number }
  readonly animate: { readonly opacity: number; readonly y: number; readonly transition: { readonly duration: number; readonly delay: number; readonly ease: typeof CURVA } }
  readonly exit: { readonly opacity: number; readonly transition: { readonly duration: number; readonly ease: typeof CURVA } }
}

/** Aparece levantándose con un fundido y se va con un fundido (para `AnimatePresence`). `factor` acorta los dos (las líneas del procesando). */
export function fundidoQueSube(reducido: boolean, retrasoS = 0, factor = 1): FundidoQueSube {
  const s = fundidoDelEnvio(reducido) * factor
  return {
    initial: { opacity: 0, y: reducido ? 0 : SUBIDA_DEL_TEXTO },
    animate: { opacity: 1, y: 0, transition: { duration: s, delay: retrasoS, ease: CURVA } },
    exit: { opacity: 0, transition: { duration: s, ease: CURVA } },
  }
}

/** Dónde se deja lo que se trae a la vista: esta fracción del alto del cuadro debajo del tope (la barra flota arriba). */
export const MARGEN_DE_LA_VISTA = 0.14

/**
 * Trae `el` a la vista si su tope quedó arriba, fuera del cuadro (o debajo de la barra): al cambiar de etapa en el teléfono, al empezar
 * de nuevo desde el pie del resultado. Si se ve, o si está más abajo, no mueve nada. Con Lenis (desde 1025) le pide el viaje a Lenis; sin él, el scroll nativo. Abajo de todo es el
 * tramo libre (después de los gatillos de Servicios): ningún gatillo lo ataja.
 */
export function llevarALaVista(el: HTMLElement | null, reducido: boolean): void {
  if (el === null || !(window.innerHeight > 0)) return
  const tope = el.getBoundingClientRect().top
  const margen = window.innerHeight * MARGEN_DE_LA_VISTA
  if (tope >= margen * 0.5) return
  const lenis = LENIS_DEL_SITIO.instancia
  if (lenis !== null) lenis.scrollTo(el, { offset: -margen, immediate: reducido })
  else window.scrollTo({ top: tope + window.scrollY - margen, behavior: reducido ? 'instant' : 'smooth' })
}
