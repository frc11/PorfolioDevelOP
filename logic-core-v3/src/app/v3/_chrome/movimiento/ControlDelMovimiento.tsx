'use client'

import { Smartphone } from 'lucide-react'
import { motion } from 'motion/react'
import { useState, useSyncExternalStore } from 'react'

import { estadoDelGiroscopio, suscribirAlGiroscopio } from '../../_lib/escena/giroscopio'
import { activarElMovimiento, desactivarElMovimiento } from '../../_lib/escena/movimiento'
import { useMovimientoReducido } from '../../_lib/motion/reducido'

/**
 * [C2-81] EL BOTÓN DEL MOVIMIENTO — en el teléfono y la tablet, arriba a la derecha (el del sonido queda arriba a la izquierda), el mismo
 * disco de la cabecera. Prende y apaga el giroscopio (`movimiento.ts`): inclinar el teléfono mueve la cámara como el mouse y maneja el
 * moiré. El ícono es un teléfono (lucide `Smartphone`, trazo 1,5) que se inclina cuando está prendido; apagado, derecho y tenue.
 *
 *   · `aria-label`: «Activar movimiento» / «Desactivar movimiento» (05-TEXTOS); el estado real en `data-estado` y el cambio, anunciado.
 *   · El permiso de iOS se pide en este toque. Negado o sin sensor: queda apagado y no pasa nada más (no se vuelve a pedir).
 */
export const INCLINACION_DEL_ICONO_GRADOS = -18
const RESORTE_DEL_ICONO = { type: 'spring', stiffness: 400, damping: 15 } as const

export function ControlDelMovimiento(): React.JSX.Element {
  const estado = useSyncExternalStore(suscribirAlGiroscopio, estadoDelGiroscopio, () => 'apagado' as const)
  const reducido = useMovimientoReducido()
  const [tocado, setTocado] = useState(false)
  const prendido = estado === 'prendido'
  const sinSalida = estado === 'negado' || estado === 'sin-sensor'

  const tocar = (): void => {
    if (sinSalida) return
    setTocado(true)
    if (prendido) desactivarElMovimiento()
    else activarElMovimiento()
  }

  return (
    <>
      <span role="status" data-pieza="anuncio-del-movimiento" className="sr-only">
        {tocado && estado !== 'pidiendo' ? (prendido ? 'Movimiento activado' : 'Movimiento desactivado') : ''}
      </span>
      <button
        type="button"
        data-pieza="control-del-movimiento"
        data-control-fijo=""
        data-estado={estado}
        aria-label={prendido ? 'Desactivar movimiento' : 'Activar movimiento'}
        aria-disabled={sinSalida ? true : undefined}
        onClick={tocar}
        className="pointer-events-auto flex size-[var(--spacing-12)] cursor-pointer items-center justify-center rounded-full border border-borde bg-fondo text-tinta shadow-[var(--shadow-flotante)] transition-colors duration-[var(--duracion-media)] aria-disabled:cursor-default"
      >
        <motion.span
          aria-hidden="true"
          className={prendido ? 'flex text-tinta' : 'flex text-tinta-tenue'}
          initial={false}
          animate={{ rotate: prendido ? INCLINACION_DEL_ICONO_GRADOS : 0 }}
          transition={reducido ? { duration: 0 } : RESORTE_DEL_ICONO}
        >
          <Smartphone size={20} strokeWidth={1.5} />
        </motion.span>
      </button>
    </>
  )
}
