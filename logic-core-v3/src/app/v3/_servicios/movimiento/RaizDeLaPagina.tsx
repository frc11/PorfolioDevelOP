'use client'

import { useState, type MouseEvent, type ReactNode } from 'react'

import { pedirLaSalidaDeLaVariante } from '../../_lib/escena/ruta/salidaDeLaVariante'
import type { EstiloConVariables } from '../estiloDelAcento'
import { manejadorDeLaSalida } from './salidaDeLaPagina'

/**
 * [SERVICIOS V1] LA RAÍZ DE LA PÁGINA, CON LA SALIDA DE LA VARIANTE — el mismo `div` de siempre (el acento del cuerpo y el contenido
 * arriba del lienzo: `PaginaDeServicio`), que además atiende, en la captura, el clic en CUALQUIER enlace de la página que se va de ella (el
 * logo, el Portfolio, el cierre): pide la salida de la variante (P-H29d), la espera, y deja pasar el mismo enlace (`salidaDeLaPagina.ts`).
 * La luz baja a la composición en `SALIDA_DE_LA_VARIANTE_MS` con la página quieta, y recién después se navega, con el `<a href>` y
 * recarga completa. Interino hasta `EnlaceDeRuta` (B12a.6), que la pedirá antes del velo.
 */
export function RaizDeLaPagina({ estilo, className, children }: { readonly estilo: EstiloConVariables; readonly className: string; readonly children: ReactNode }): React.JSX.Element {
  const [alClic] = useState(() => manejadorDeLaSalida(pedirLaSalidaDeLaVariante, () => window.location))
  const enLaCaptura = (e: MouseEvent<HTMLDivElement>): void => {
    const origen = e.target
    const enlace = origen instanceof Element ? origen.closest('a[href]') : null
    alClic({
      button: e.button,
      metaKey: e.metaKey,
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      defaultPrevented: e.defaultPrevented,
      enlace: enlace instanceof HTMLAnchorElement ? enlace : null,
      preventDefault: () => e.preventDefault(),
    })
  }
  return (
    <div style={estilo} className={className} onClickCapture={enLaCaptura}>
      {children}
    </div>
  )
}
