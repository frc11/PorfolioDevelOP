'use client'

import { useEffect } from 'react'

import { pedirElPulso, pedirLaOnda } from '../../_lib/escena/interfaz/pedidos'

/**
 * [INTERFAZ 2] T1 · LA ESCENA RESPONDE A LA INTERFAZ — lo que el DOM le pide a la sala (en el producto desde el cierre).
 *
 *   · **un CTA con el puntero encima** (o con el foco del teclado): el logo larga su pulso PRINCIPAL, el de E4, por la
 *     misma máquina (`maquinaDelPulso.ts`, el pedido): no se duplica nada y la máquina decide si hay lugar;
 *   · **un valor de «Por qué develOP»** con el puntero encima: el piso vivo ondea desde el logo hacia él
 *     (`piso/ondaDirigida.ts`). Son las piezas que dicen qué ofrecemos y están sobre la sala, a los dos lados del logo:
 *     Servicios no tiene tarjetas y tapa la escena (es papel opaco y la sala está suspendida detrás);
 *   · el menú del teléfono lo atiende el menú (`menu/MenuMovil.tsx`).
 *
 * Un escucha en el documento, delegado (como el de los viajes): no toca ninguna pieza compartida. El puntero cuenta
 * sólo si es fino (un toque no tiene «encima»).
 */

/** Los que piden el pulso: los CTA del sistema y la ventana de «Hablemos» del final del túnel (que no es un `cta`). */
export const SELECTOR_DE_LOS_CTA = '[data-pieza="cta"], [data-pieza="ventana-del-cta"]'
/** El formulario de contacto tapa la sala: su envío no pide nada. */
const ADENTRO_DEL_CONTACTO = '[data-pieza="contacto"]'
export const SELECTOR_DE_LOS_VALORES = '[data-pieza="valor"]'

const PUNTERO_FINO = '(hover: hover) and (pointer: fine)'

/** El centro de una pieza en coordenadas normalizadas del cuadro (el lienzo de la escena lo cubre entero). */
export function centroNormalizado(caja: { left: number; top: number; width: number; height: number }, ancho: number, alto: number): [number, number] {
  const x = ((caja.left + caja.width / 2) / ancho) * 2 - 1
  const y = 1 - ((caja.top + caja.height / 2) / alto) * 2
  return [x, y]
}

function ctaDe(objetivo: EventTarget | null): Element | null {
  if (!(objetivo instanceof Element)) return null
  const cta = objetivo.closest(SELECTOR_DE_LOS_CTA)
  return cta !== null && cta.closest(ADENTRO_DEL_CONTACTO) === null ? cta : null
}

export function RespuestaDeLaEscena(): null {
  useEffect(() => {
    const fino = window.matchMedia(PUNTERO_FINO)
    let ctaActual: Element | null = null
    let valorActual: Element | null = null

    const alPasar = (e: PointerEvent): void => {
      if ((e.pointerType !== 'mouse' && e.pointerType !== 'pen') || !fino.matches) return
      const cta = ctaDe(e.target)
      if (cta !== ctaActual) {
        ctaActual = cta
        if (cta !== null) pedirElPulso(performance.now())
      }
      const valor = e.target instanceof Element ? e.target.closest(SELECTOR_DE_LOS_VALORES) : null
      if (valor !== valorActual) {
        valorActual = valor
        if (valor !== null) {
          const [x, y] = centroNormalizado(valor.getBoundingClientRect(), window.innerWidth, window.innerHeight)
          pedirLaOnda(x, y, performance.now())
        }
      }
    }
    const alSalir = (e: PointerEvent): void => {
      if (e.relatedTarget === null) [ctaActual, valorActual] = [null, null]
    }
    // El teclado: el foco VISIBLE en un CTA pide lo mismo que el puntero.
    const alEnfocar = (e: FocusEvent): void => {
      const cta = ctaDe(e.target)
      if (cta !== null && e.target instanceof Element && e.target.matches(':focus-visible')) pedirElPulso(performance.now())
    }

    document.addEventListener('pointerover', alPasar, { passive: true })
    document.addEventListener('pointerout', alSalir, { passive: true })
    document.addEventListener('focusin', alEnfocar)
    return () => {
      document.removeEventListener('pointerover', alPasar)
      document.removeEventListener('pointerout', alSalir)
      document.removeEventListener('focusin', alEnfocar)
    }
  }, [])

  return null
}
