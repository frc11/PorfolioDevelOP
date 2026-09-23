'use client'

import { useEffect, type RefObject } from 'react'

import { cabezaDelTipeo } from './tunel'

/**
 * LA VENTANA DEL CTA SE ENTIENDE COMO APRETABLE — lo que pasa con el puntero o el
 * foco encima. **[PORTFOLIO]**
 *
 * Tres señales juntas, y las tres dicen lo mismo: esto se aprieta.
 *
 *   · la ventana se ELEVA un paso del espaciado y gana la sombra flotante;
 *   · en la barra, después de la dirección, se TIPEA la ruta; al salir se borra;
 *   · el rollover de «Hablemos» lo pone el propio `CtaEnlace` con su `:hover` y su
 *     `:focus-visible`, porque su zona de clic cubre la ventana entera.
 *
 * ⚠️ **EL TIPEO ES EL MISMO MECANISMO QUE EL DE LA FRASE**: un recorte de
 * izquierda a derecha sobre la palabra, con la cabeza calculada por
 * `cabezaDelTipeo`. La diferencia es el reloj: la frase cuelga del crecimiento de
 * la ventana y la ruta cuelga del tiempo que el puntero lleva encima, porque no
 * hay scroll que la mueva. La barra usa la mono, así que cada letra mide lo mismo
 * y la fracción de la palabra ES la fracción de letras.
 *
 * El puntero y el foco son dos banderas y no una: salir con el puntero mientras
 * el foco sigue adentro no baja la ventana.
 */

/** La ruta que se escribe en la barra, después de la dirección. */
export const RUTA_DEL_CTA = '/hablemos'

/** Cada cuánto se escribe y se borra una letra, en ms. Borrar es más rápido: es un retroceso. */
export const MS_POR_LETRA = { escribe: 55, borra: 25 } as const

/** Cuánto sube la ventana: un paso del espaciado, en el espacio que ya termina en escala 1. */
export const ELEVACION_DE_LA_VENTANA = 'translateY(calc(-1 * var(--spacing-2)))'

/** La transición de la elevación, con los tokens del sistema. */
export const TRANSICION_DE_LA_ELEVACION = 'transform var(--duracion-media) var(--ease-salida), box-shadow var(--duracion-media) var(--ease-salida)'

/** El recorte de la ruta con `letras` escritas: la fracción de la palabra, de izquierda a derecha. */
export function recorteDeLaRuta(letras: number): string {
  const { fraccion } = cabezaDelTipeo(letras, [RUTA_DEL_CTA.length])
  const vista = letras <= 0 ? 0 : fraccion
  return `inset(0 ${(100 * (1 - vista)).toFixed(2)}% 0 0)`
}

export function useEncimaDelCta(ventana: RefObject<HTMLDivElement | null>, reducido: boolean): void {
  useEffect(() => {
    const caja = ventana.current
    const enlace = caja?.querySelector<HTMLAnchorElement>('a[href]') ?? null
    const ruta = caja?.querySelector<HTMLElement>('[data-pieza="ruta-del-cta"]') ?? null
    if (caja === null || enlace === null || ruta === null) return

    const total = RUTA_DEL_CTA.length
    let letras = 0
    let objetivo = 0
    let cuadro = 0
    let anterior = 0
    let acumulado = 0
    let puntero = false
    let foco = false

    const paso = (ahora: number): void => {
      acumulado += anterior === 0 ? 0 : ahora - anterior
      anterior = ahora
      const ms = objetivo > letras ? MS_POR_LETRA.escribe : MS_POR_LETRA.borra
      while (acumulado >= ms && letras !== objetivo) {
        letras += Math.sign(objetivo - letras)
        acumulado -= ms
      }
      ruta.style.setProperty('clip-path', recorteDeLaRuta(letras))
      if (letras === objetivo) {
        cuadro = 0
        return
      }
      cuadro = requestAnimationFrame(paso)
    }

    const actualizar = (): void => {
      const encima = puntero || foco
      // Al salir se QUITAN, no se ponen en `none`: la caja no tiene que quedar con
      // una transformada propia cuando el vacío la recorta.
      if (encima) {
        caja.style.setProperty('transform', ELEVACION_DE_LA_VENTANA)
        caja.style.setProperty('box-shadow', 'var(--shadow-flotante)')
      } else {
        caja.style.removeProperty('transform')
        caja.style.removeProperty('box-shadow')
      }
      objetivo = encima ? total : 0
      if (reducido) {
        letras = objetivo
        ruta.style.setProperty('clip-path', recorteDeLaRuta(letras))
        return
      }
      if (cuadro === 0 && letras !== objetivo) {
        anterior = 0
        acumulado = 0
        cuadro = requestAnimationFrame(paso)
      }
    }

    const alEntrar = (): void => {
      puntero = true
      actualizar()
    }
    const alSalir = (): void => {
      puntero = false
      actualizar()
    }
    const alEnfocar = (): void => {
      foco = enlace.matches(':focus-visible')
      actualizar()
    }
    const alDesenfocar = (): void => {
      foco = false
      actualizar()
    }

    enlace.addEventListener('pointerenter', alEntrar)
    enlace.addEventListener('pointerleave', alSalir)
    enlace.addEventListener('focus', alEnfocar)
    enlace.addEventListener('blur', alDesenfocar)
    return () => {
      enlace.removeEventListener('pointerenter', alEntrar)
      enlace.removeEventListener('pointerleave', alSalir)
      enlace.removeEventListener('focus', alEnfocar)
      enlace.removeEventListener('blur', alDesenfocar)
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
    }
  }, [ventana, reducido])
}
