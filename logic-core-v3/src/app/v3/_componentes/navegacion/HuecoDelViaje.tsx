'use client'

import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { faseDelViaje, suscribirAlViajeAlServicio } from '../../_lib/escena/ruta/viajeDelServicio'
import { Envoltorio } from '../layout/Envoltorio'
import { MarcoDeLaIntro } from '../pagina/ComposicionDeLaIntro'

import { defectoDelViaje } from './viajeAlServicio'

const enCurso = (): boolean => faseDelViaje() !== 'quieto'
const nunca = (): boolean => false

/**
 * [B12b] EL HUECO DEL LOGO DE LA PÁGINA DE DESTINO, MEDIDO EN EL HOME — mientras dura el viaje, el marco de la intro de una página
 * (`MarcoDeLaIntro`, el mismo, con la composición de la URL), invisible y fijo al cuadro: mide el hueco del logo y se lo da a la escena
 * como lo hace la página. Así la cámara baja directo a la composición de la página, con el logo en su hueco, y al navegar el marco de la
 * página lo vuelve a medir en el mismo commit (desde 1024, en la 2 y la 3, el hueco no depende del texto: es el mismo número). En la 1 y
 * abajo de 1024 el hueco va debajo del título y el marco vacío lo da más alto: la página lo corrige al llegar (un reencuadre corto).
 * Sin el viaje no pinta nada.
 */
export function HuecoDelViaje(): React.JSX.Element | null {
  const viajando = useSyncExternalStore(suscribirAlViajeAlServicio, enCurso, nunca)
  if (!viajando || defectoDelViaje() === 'sin-hueco') return null
  const raiz = document.querySelector('[data-v3]')
  if (raiz === null) return null
  return createPortal(
    <div aria-hidden="true" data-pieza="hueco-del-viaje" className="pointer-events-none invisible fixed inset-0">
      <Envoltorio>
        <MarcoDeLaIntro>{null}</MarcoDeLaIntro>
      </Envoltorio>
    </div>,
    raiz,
  )
}
