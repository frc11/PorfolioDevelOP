'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'

import { CARGA } from '../../_lib/carga'
import { laEscenaCayo, suscribirALaCaida } from '../../_lib/escena/caida'
import { entornoDeLaEscena } from '../../_lib/escena/entorno'

/**
 * [PASADA FINAL] A1 · EL TITULAR DEL HERO SIN PARPADEO 2D — hasta acá el texto del DOM se pintaba primero (era el LCP) y
 * se apagaba cuando la escena avisaba que sus letras de volumen estaban armadas: en cada carga se veía «TU NEGOCIO
 * VENDIENDO LAS 24 HS» plano y después el 3D. Desde 1024 (y sin movimiento reducido) el texto 2D ya no se pinta: queda
 * en el DOM, en su lugar y en el árbol accesible (es el `h1`), con opacidad cero desde el HTML del servidor
 * (`data-titular-2d="oculto"`), y lo que se ve es el título extruido de la escena, que se arma en los primeros cuadros
 * (`escena/titulos3d/sincronia.ts`, `precarga.ts`). Tres estados, escritos en el atributo y resueltos en la hoja
 * `_estilos/titular.css` (el corte de ancho y el de movimiento son de CSS, no una rama de JS):
 *
 *   · `oculto`       el de salida: invisible desde 1024 con movimiento; abajo de 1024 y con movimiento reducido no
 *                    cambia nada (el texto de siempre, visible);
 *   · `respaldo`     el 2D aparece con un fundido: si la escena se cayó (`caida.ts`: sin WebGL, el lienzo tiró), si en
 *                    esta carga no hay títulos de volumen (`titulos=no`) o si el 3D no llegó en `RESPALDO_2D_MS` desde
 *                    el arranque de la página;
 *   · `reemplazado`  el 3D está: el 2D se apaga (si el respaldo lo había mostrado, con un fundido).
 *
 * Sin JavaScript (o si nunca hidrata) la hoja `titular.css` hace lo del respaldo sola: una animación que, a los mismos
 * `RESPALDO_2D_MS`, lo deja visible. El plazo se cuenta desde el arranque de la página (`performance.now()`), no desde que
 * el hero monta: así la cuenta del DOM y la de la hoja son la misma.
 */
export const RESPALDO_2D_MS = 2500
/**
 * Si al vencer el plazo la escena YA está montada (su lienzo existe), el 3D viene en camino —el módulo de los títulos se
 * arma apenas la escena termina de montar— y mostrar el 2D sería el parpadeo al revés (2D un instante y después el 3D):
 * se le da hasta este plazo largo. Sin lienzo a los 2,5 s (una máquina o una red lentas, o sin JS), el 2D ya.
 */
export const RESPALDO_2D_CON_ESCENA_MS = CARGA.plazoMs // [AJUSTES FINALES] A4 · el mismo plazo que el velo de carga: el 2D aparece con el fundido del velo

export type EstadoDelTitular2D = 'oculto' | 'respaldo' | 'reemplazado'

/** El estado del texto 2D de un titular que espera a su volumen (`listo`: la escena lo armó y compiló). */
const sinCambios = (): (() => void) => () => undefined

/**
 * [AJUSTES FINALES] A4 · el plazo, vencido, queda vencido para toda la carga: el `h1` se vuelve a montar cuando llega la
 * coreografía y, con una máquina lenta (CPU ×4), su estado nuevo arrancaba en `oculto` y el respaldo que ya se veía
 * desaparecía un segundo hasta que sus relojes volvían a vencer.
 */
let plazoVencido = false

export function useTitular2D(listo: boolean): EstadoDelTitular2D {
  const caida = useSyncExternalStore(suscribirALaCaida, laEscenaCayo, () => false)
  // Si en esta carga no va a haber títulos de volumen, el 2D ya: `false` en el servidor y al hidratar (no lo sabe).
  const sinVolumen = useSyncExternalStore(sinCambios, () => entornoDeLaEscena().titulos === 'no', () => false)
  // Ya vencido (el `h1` remontado): arranca en el respaldo, sin pasar un render por `oculto`.
  const [vencido, setVencido] = useState(() => plazoVencido)
  useEffect(() => {
    const vencer = (): void => {
      plazoVencido = true
      setVencido(true)
    }
    if (plazoVencido) {
      vencer()
      return undefined
    }
    const desdeElArranque = (ms: number): number => Math.max(0, ms - performance.now())
    let reloj = window.setTimeout(() => {
      // Con la escena montada el 3D viene en camino: el plazo largo. Sin lienzo todavía, el 2D ya.
      if (document.querySelector('[data-escena] canvas') !== null) reloj = window.setTimeout(vencer, desdeElArranque(RESPALDO_2D_CON_ESCENA_MS))
      else vencer()
    }, desdeElArranque(RESPALDO_2D_MS))
    return () => window.clearTimeout(reloj)
  }, [])
  if (listo) return 'reemplazado'
  return caida || vencido || sinVolumen ? 'respaldo' : 'oculto'
}
