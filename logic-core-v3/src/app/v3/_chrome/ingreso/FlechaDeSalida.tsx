'use client'

import { ArrowLeft } from 'lucide-react'
import { useCallback } from 'react'

import { botonDelIngreso } from './apertura'
import { ROTULOS_DEL_INGRESO } from './contenido'

/**
 * [C2 · 80] LA FLECHA PARA SALIR — arriba, en el lugar donde estaba el botón «Login» (centrada en su caja), para que se entienda cómo
 * cerrar. Hace lo mismo que «Volver al home» (`alTocar` es `alPedirElCierre`). Sin el botón a la vista (el teléfono con la barra
 * escondida) queda en la esquina de arriba a la derecha, donde la mano espera un «cerrar».
 *
 * El lugar se escribe en el elemento apenas se monta (una referencia de callback: antes del primer cuadro, sin un estado de React).
 */

/** Pone la flecha sobre el centro del botón `origen` (o del «Login» de la página) si está a la vista; si no, la deja en la esquina. */
function colocar(flecha: HTMLElement, origen: HTMLElement | null): void {
  const boton = origen ?? botonDelIngreso()
  const r = boton !== null && boton.isConnected && getComputedStyle(boton).visibility !== 'hidden' ? boton.getBoundingClientRect() : null
  const aLaVista = r !== null && r.width > 0 && r.height > 0 && r.right > 0 && r.bottom > 0 && r.left < window.innerWidth && r.top < window.innerHeight
  if (!aLaVista) {
    flecha.removeAttribute('data-colocada')
    flecha.style.removeProperty('left')
    flecha.style.removeProperty('top')
    return
  }
  flecha.setAttribute('data-colocada', '')
  flecha.style.setProperty('left', `${String(r.left + r.width / 2)}px`)
  flecha.style.setProperty('top', `${String(r.top + r.height / 2)}px`)
}

export function FlechaDeSalida({ origen, alTocar }: { readonly origen: HTMLElement | null; readonly alTocar: () => void }): React.JSX.Element {
  const alMontar = useCallback(
    (flecha: HTMLButtonElement | null): void => {
      if (flecha !== null) colocar(flecha, origen)
    },
    [origen],
  )
  return (
    <button
      ref={alMontar}
      type="button"
      data-parte="flecha-de-salida"
      aria-label={ROTULOS_DEL_INGRESO.cerrar}
      onClick={alTocar}
      className="text-tinta-media hover:text-tinta fixed top-[var(--spacing-4)] right-[var(--spacing-4)] flex size-[var(--spacing-12)] items-center justify-center transition-colors data-[colocada]:right-auto data-[colocada]:-translate-x-1/2 data-[colocada]:-translate-y-1/2"
    >
      <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-5)]" />
    </button>
  )
}
