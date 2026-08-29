import { EnlaceDeNavegacionFlotante } from '../../_componentes/chrome/Navegacion'
import { Cuerpo } from '../../_componentes/tipografia/Textos'
import {
  ALTO_DE_VIEWPORT_DE_LA_REFERENCIA,
  ALTO_PASTILLA_PX,
  DESCUENTO_UMBRAL_PX,
  ENLACES_DE_MUESTRA,
  UMBRAL_DE_LA_REFERENCIA,
  umbralPx,
} from '../../_lib/navegacion'

import { Estado, Ficha } from './Ficha'

/**
 * LA NAVEGACIÓN — el enlace suelto, y el umbral en números.
 *
 * ── Por qué la pastilla entera no está en una ficha ───────────────────────
 *
 * Porque su envoltorio es `sticky` con alto CERO y su `top` depende de
 * `100svh`: metida en una ficha de 200px no haría nada visible, o peor, haría
 * algo distinto de lo que hace en una página. Se muestra montada de verdad al
 * final de esta ruta, donde hay documento suficiente para que viaje.
 *
 * ── Los números no están escritos a mano ──────────────────────────────────
 *
 * Salen de `_lib/navegacion.ts`, que es el mismo módulo que consume el
 * invariante. El de la referencia está al lado para poder comparar, y
 * etiquetado como suyo.
 */
export function GaleriaNavegacion() {
  const nuestro = umbralPx(ALTO_DE_VIEWPORT_DE_LA_REFERENCIA)

  return (
    <>
      <Ficha
        titulo="Enlace de la pastilla flotante"
        nota="El enlace se corre 8px y el marcador entra desde scale(0.8) y −16px, los dos en 0,5s con --ease-principal. Todo medido."
      >
        <Estado rotulo="vivo">
          <EnlaceDeNavegacionFlotante enlace={ENLACES_DE_MUESTRA[0]} />
        </Estado>
        <Estado rotulo="reposo">
          <EnlaceDeNavegacionFlotante enlace={ENLACES_DE_MUESTRA[1]} />
        </Estado>
        <Estado rotulo="hover, forzado">
          <EnlaceDeNavegacionFlotante enlace={ENLACES_DE_MUESTRA[2]} forzado="hover" />
        </Estado>
        <Estado rotulo="foco, forzado">
          <EnlaceDeNavegacionFlotante enlace={ENLACES_DE_MUESTRA[3]} forzado="foco" />
        </Estado>
      </Ficha>

      <Ficha titulo="El umbral de la pastilla — de dónde sale">
        <Cuerpo>
          {`Nuestro umbral es 100svh − ${DESCUENTO_UMBRAL_PX}px, con una pastilla de ${ALTO_PASTILLA_PX}px. ` +
            `A un viewport de ${ALTO_DE_VIEWPORT_DE_LA_REFERENCIA}px eso da ${nuestro}px.`}
        </Cuerpo>
        <Cuerpo className="opacity-casi">
          {`La referencia mide ${UMBRAL_DE_LA_REFERENCIA.umbralPx}px, con nacimiento en ` +
            `${UMBRAL_DE_LA_REFERENCIA.nacimientoPx} y reposo en ${UMBRAL_DE_LA_REFERENCIA.reposoPx}. ` +
            `Ese ${UMBRAL_DE_LA_REFERENCIA.nacimientoPx} es el alto de SU héroe con SU pastilla: no entra al repo. La diferencia contra el ` +
            `nuestro es de ${nuestro - UMBRAL_DE_LA_REFERENCIA.umbralPx}px, y se descompone entera: 8px ` +
            `porque su pastilla mide 56 y la nuestra ${ALTO_PASTILLA_PX}, y 4px porque ella deja 28 al ` +
            `pie y la nuestra deja 24.`}
        </Cuerpo>
      </Ficha>
    </>
  )
}
