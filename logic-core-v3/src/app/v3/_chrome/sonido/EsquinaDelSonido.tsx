'use client'

import { useLaBarraSeVe } from '../contacto/apertura'
import { useCabeceraAlFondo } from '../recorrido/cabeceraAlFondo'
import { SonidoDelHome } from './SonidoDelHome'

/**
 * [CIERRE A] A6 · LA ESQUINA DEL SONIDO — el indicador del recorrido (el infinito con el porcentaje) se sacó, en escritorio y en el
 * teléfono, y la esquina de abajo a la derecha quedó libre (ahí va a ir el chatbot). El parlante: en escritorio, arriba a la izquierda,
 * en la fila de la barra (enfrente de Contacto y Login, del mismo vidrio y del mismo alto); abajo de 1024, la cabecera: el parlante a la
 * izquierda y el menú al centro. Con la cabecera del teléfono, al fondo y con el pie más alto que la pantalla, se retira (`K5`).
 */
export function EsquinaDelSonido(): React.JSX.Element {
  const conLaBarra = useLaBarraSeVe()
  useCabeceraAlFondo(!conLaBarra)
  return (
    <div data-pieza="esquina-del-sonido" className="pointer-events-none fixed top-[max(var(--spacing-4),env(safe-area-inset-top))] left-[max(var(--spacing-4),env(safe-area-inset-left))] z-[var(--z-cabecera)] hasta-tablet:top-[var(--spacing-6)] escritorio:left-[var(--pad-lateral-compacto)]">
      <div data-parte="lugar-del-parlante">
        <SonidoDelHome />
      </div>
    </div>
  )
}
