'use client'

import { useEffect } from 'react'

import { getIntroStage } from '@/components/layout/home-intro/introHandoff'

import { destinoDelViaje } from '../../_componentes/destinosDelViaje'
import { deberiaDeslizar } from '../../_componentes/deslizamiento'
import { planDeLaAnticipacion } from '../../_lib/escena/interfaz/anticipacion'
import { ANTICIPACION_PEDIDA } from '../../_lib/escena/interfaz/pedidos'
import { NIVEL_NATURAL } from '../../_lib/escena/nocheDisparada'
import { planDelViaje } from '../../_lib/escena/planDelViaje'
import { viajeEnCurso } from '../../_lib/escena/viaje'

/**
 * [INTERFAZ 2] T2 · LA VISTA PREVIA DEL DESTINO, del lado del DOM (en el producto desde el cierre).
 *
 * El puntero (fino) o el foco del teclado sobre un ítem de la barra: se arma el plan de la anticipación con LA MISMA
 * cuenta que hace el clic (el nudo del destino, `destinosDelViaje.ts`, y la clase de luz del viaje, `planDelViaje.ts`)
 * y la sala lo anticipa (`escena/interfaz/anticipacion.ts`). Si después llega el clic, el viaje sale de ahí.
 *
 * Sólo donde el clic viaja: la barra de escritorio (la pastilla compartida no se toca: un escucha delegado en el
 * documento, como el de los viajes), con la compuerta del intro, sin un viaje en curso y sin movimiento reducido.
 * «Contacto» no viaja (abre el formulario): no anticipa nada.
 */
export const SELECTOR_DE_LOS_ITEMS = '[data-pieza="navegacion"] a[data-pieza="nav-enlace"]'

const PUNTERO_FINO = '(hover: hover) and (pointer: fine)'
const MOVIMIENTO_REDUCIDO = '(prefers-reduced-motion: reduce)'

function itemDe(objetivo: EventTarget | null): HTMLAnchorElement | null {
  return objetivo instanceof Element ? objetivo.closest<HTMLAnchorElement>(SELECTOR_DE_LOS_ITEMS) : null
}

export function AnticipacionDelMenu(): null {
  useEffect(() => {
    const fino = window.matchMedia(PUNTERO_FINO)
    const reducido = window.matchMedia(MOVIMIENTO_REDUCIDO)
    let actual: HTMLAnchorElement | null = null

    const soltar = (): void => {
      actual = null
      ANTICIPACION_PEDIDA.plan = null
    }
    const anticipar = (item: HTMLAnchorElement): void => {
      actual = item
      ANTICIPACION_PEDIDA.plan = null
      if (reducido.matches || viajeEnCurso() !== null || !deberiaDeslizar(getIntroStage())) return
      const ancla = item.getAttribute('href') ?? ''
      const seccion = ancla.startsWith('#') ? document.getElementById(ancla.slice(1)) : null
      if (seccion === null) return
      const y1 = destinoDelViaje(seccion)
      const viaje = planDelViaje(seccion.id, y1)
      ANTICIPACION_PEDIDA.plan = planDeLaAnticipacion(seccion.id, viaje.clase, NIVEL_NATURAL.valor, viaje.luz?.hasta ?? null, window.scrollY, y1, performance.now())
    }

    const alPasar = (e: PointerEvent): void => {
      if ((e.pointerType !== 'mouse' && e.pointerType !== 'pen') || !fino.matches) return
      const item = itemDe(e.target)
      if (item === actual) return
      if (item === null) soltar()
      else anticipar(item)
    }
    const alSalir = (e: PointerEvent): void => {
      if (e.relatedTarget === null && actual !== null) soltar()
    }
    const alEnfocar = (e: FocusEvent): void => {
      const item = itemDe(e.target)
      if (item !== null && item.matches(':focus-visible') && item !== actual) anticipar(item)
    }
    const alDesenfocar = (e: FocusEvent): void => {
      if (itemDe(e.target) !== null && itemDe(e.relatedTarget) === null) soltar()
    }

    document.addEventListener('pointerover', alPasar, { passive: true })
    document.addEventListener('pointerout', alSalir, { passive: true })
    document.addEventListener('focusin', alEnfocar)
    document.addEventListener('focusout', alDesenfocar)
    return () => {
      document.removeEventListener('pointerover', alPasar)
      document.removeEventListener('pointerout', alSalir)
      document.removeEventListener('focusin', alEnfocar)
      document.removeEventListener('focusout', alDesenfocar)
      soltar()
    }
  }, [])

  return null
}
