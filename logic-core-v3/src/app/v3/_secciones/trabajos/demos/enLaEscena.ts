'use client'

import { useEffect, type RefObject } from 'react'

import { PORTFOLIO_EN_LA_ESCENA } from '../../../_lib/escena/portfolioEnLaEscena'

import { conElDefectoDeDemos } from './defectos'
import { preconectarLasDemos } from './precarga'

/**
 * [C2-41e] DEMOS A LA VISTA — lo que la capa le avisa a la escena y a la red mientras Demos se ve: la llegada pedida por el scroll
 * pasó de 0 (el título arrancó) y la sección todavía ocupa la mitad de arriba del cuadro (después entra Servicios, opaco). Desde 1024
 * (con el escenario pegado del Portfolio; abajo de 1024 la escena no se toca).
 *
 *   · **La escena se queda en la pose del Portfolio** (`PORTFOLIO_EN_LA_ESCENA.demos`): el logo en su hueco, en la columna de la
 *     izquierda, de frente. Portfolio y Demos son espejos: el título, la bajada y debajo el logo de un lado; el título, la bajada y
 *     debajo el abanico del otro. Antes, al salir el panel la cámara volvía a la pose del scroll y abajo del cuadro asomaba la franja
 *     clara del piso (captura `lote1/13`); con la pose del Portfolio la primera pantalla de Demos es la sala sola, como en el
 *     Portfolio. El oscurecido no: es del panel (`pesoDelOscurecido`). Cuando la sección se va (Servicios la tapa), la pose se suelta.
 *   · **Las demos se preconectan** (`preconectarLasDemos`): los cinco orígenes, una vez.
 *
 * ⚠️ `mostrado` se satura en 1 pasada la cola: lo pedido sigue en 1 en Servicios y en todo lo de abajo. Por eso la vista se cierra con
 * la sección en el cuadro (un `IntersectionObserver`), no sólo con lo pedido.
 */
const ESTADO = { pedida: 0, escritorio: false, enElCuadro: false }

function actualizar(): void {
  const aLaVista = ESTADO.pedida > 0 && ESTADO.enElCuadro && ESTADO.escritorio
  PORTFOLIO_EN_LA_ESCENA.demos = aLaVista && !conElDefectoDeDemos('franja')
  if (aLaVista) preconectarLasDemos()
}

/** Lo pedido por el scroll (0…1) y si hay escenario pegado de escritorio. */
export function anunciarDemos(pedida: number, escritorio: boolean): void {
  ESTADO.pedida = pedida
  ESTADO.escritorio = escritorio
  actualizar()
}

/** Si la sección ocupa todavía la mitad de arriba del cuadro. */
export function seccionDeDemosEnElCuadro(adentro: boolean): void {
  ESTADO.enElCuadro = adentro
  actualizar()
}

/** Al desmontarse la capa: la escena deja de saber de Demos. */
export function olvidarDemos(): void {
  Object.assign(ESTADO, { pedida: 0, escritorio: false, enElCuadro: false })
  PORTFOLIO_EN_LA_ESCENA.demos = false
}

/** La mitad de arriba del cuadro: la sección está a la vista mientras la toca. */
export const MARGEN_DE_LA_VISTA = '0px 0px -50% 0px'

/** Mira la sección de la capa (la de Trabajos) contra la mitad de arriba del cuadro. */
export function useSeccionDeDemosEnElCuadro(capa: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const seccion = capa.current?.closest('section') ?? null
    if (seccion === null) return undefined
    const observador = new IntersectionObserver(([e]) => seccionDeDemosEnElCuadro(e?.isIntersecting === true), { rootMargin: MARGEN_DE_LA_VISTA })
    observador.observe(seccion)
    return () => {
      observador.disconnect()
      seccionDeDemosEnElCuadro(false)
    }
  }, [capa])
}
