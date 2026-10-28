'use client'

import { useEffect, useState, type RefObject } from 'react'

import { DERIVA, laMovioElUsuario, pasoDeLaDeriva, velocidadDeLaDeriva } from './deriva'

export interface DerivaDelCarrusel {
  /** La pista está en pantalla (el aviso aparece). */
  readonly enPantalla: boolean
  /** El usuario ya la deslizó una vez (el aviso se va). */
  readonly deslizado: boolean
}

/**
 * [C2-70t] LA DERIVA EN LA PISTA (lo puro está en `deriva.ts`). `[data-copia]` marca la primera tarjeta de la copia: su distancia a la
 * primera es el ancho de una copia (el bucle). Corre sólo con la pista en pantalla (IntersectionObserver) y la pestaña visible; se queda
 * quieta mientras el dedo la toca, el mouse está encima o el foco del teclado está adentro, y retoma desde donde la dejó el usuario
 * (`DERIVA.espera` después de su último movimiento, con la curva de `DERIVA.retoma`). Con movimiento reducido no corre: sólo avisa.
 */
export function useDerivaDelCarrusel(pista: RefObject<HTMLElement | null>, quieto: boolean): DerivaDelCarrusel {
  const [enPantalla, setEnPantalla] = useState(false)
  const [deslizado, setDeslizado] = useState(false)

  useEffect(() => {
    const el = pista.current
    if (el === null) return undefined
    const ahora = (): number => performance.now() / 1000
    let ancho = 0
    const medir = (): void => {
      const primera = el.firstElementChild
      const copia = el.querySelector('[data-copia]')
      ancho = primera instanceof HTMLElement && copia instanceof HTMLElement ? copia.offsetLeft - primera.offsetLeft : 0
    }
    let visto = false
    let tocando = false
    let encima = false
    let enfocado = false
    // Un deslizamiento cuenta sólo después de un gesto de entrada (el dedo, la rueda, el puntero, el foco): un ajuste del navegador no.
    let intervino = false
    let avisado = false
    let ultimoGesto = Number.NEGATIVE_INFINITY
    let escrita = el.scrollLeft
    let posicion = escrita
    let anterior: number | null = null
    let cuadro = 0

    const gesto = (): void => {
      ultimoGesto = ahora()
    }
    const leer = (): void => {
      const leida = el.scrollLeft
      if (!laMovioElUsuario(leida, escrita)) return
      posicion = leida
      escrita = leida
      gesto()
      if (intervino && !avisado) {
        avisado = true
        setDeslizado(true)
      }
    }
    const corre = (): boolean => !quieto && visto && document.visibilityState === 'visible'
    const paso = (ms: number): void => {
      cuadro = 0
      const t = ms / 1000
      const dt = anterior === null ? 0 : Math.min(0.1, Math.max(0, t - anterior))
      anterior = t
      leer()
      if (tocando || encima || enfocado) gesto()
      const v = velocidadDeLaDeriva(t - ultimoGesto, quieto)
      if (v > 0) {
        posicion = pasoDeLaDeriva(posicion, v, dt, ancho)
        el.scrollTo({ left: posicion, behavior: 'instant' })
        escrita = el.scrollLeft
      }
      seguir()
    }
    const seguir = (): void => {
      if (cuadro === 0 && corre()) cuadro = requestAnimationFrame(paso)
    }
    const parar = (): void => {
      if (cuadro !== 0) cancelAnimationFrame(cuadro)
      cuadro = 0
      anterior = null
    }
    // Al (re)arrancar, la deriva sube desde 0 con su curva (sin pisar un gesto reciente).
    const arrancar = (): void => {
      ultimoGesto = Math.max(ultimoGesto, ahora() - DERIVA.espera)
      seguir()
    }

    const alTocar = (): void => {
      intervino = true
      tocando = true
      gesto()
    }
    const alSoltar = (): void => {
      tocando = false
      gesto()
    }
    const alIntervenir = (): void => {
      intervino = true
      gesto()
    }
    const alEntrar = (e: PointerEvent): void => {
      if (e.pointerType === 'mouse') encima = true
    }
    const alSalir = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return
      encima = false
      gesto()
    }
    const alEnfocar = (): void => {
      intervino = true
      enfocado = true
    }
    const alDesenfocar = (e: FocusEvent): void => {
      enfocado = e.relatedTarget instanceof Node && el.contains(e.relatedTarget)
      gesto()
    }
    const alCambiarLaPestana = (): void => {
      if (document.visibilityState === 'visible') arrancar()
      else parar()
    }

    medir()
    const tamano = new ResizeObserver(medir)
    tamano.observe(el)
    const vista = new IntersectionObserver((entradas) => {
      const e = entradas[entradas.length - 1]
      if (e === undefined) return
      visto = e.isIntersecting
      setEnPantalla(visto)
      if (visto) arrancar()
      else parar()
    })
    vista.observe(el)
    el.addEventListener('scroll', leer, { passive: true })
    el.addEventListener('touchstart', alTocar, { passive: true })
    el.addEventListener('touchend', alSoltar, { passive: true })
    el.addEventListener('touchcancel', alSoltar, { passive: true })
    el.addEventListener('wheel', alIntervenir, { passive: true })
    el.addEventListener('pointerdown', alIntervenir, { passive: true })
    el.addEventListener('pointerenter', alEntrar)
    el.addEventListener('pointerleave', alSalir)
    el.addEventListener('focusin', alEnfocar)
    el.addEventListener('focusout', alDesenfocar)
    document.addEventListener('visibilitychange', alCambiarLaPestana)
    return () => {
      parar()
      tamano.disconnect()
      vista.disconnect()
      el.removeEventListener('scroll', leer)
      el.removeEventListener('touchstart', alTocar)
      el.removeEventListener('touchend', alSoltar)
      el.removeEventListener('touchcancel', alSoltar)
      el.removeEventListener('wheel', alIntervenir)
      el.removeEventListener('pointerdown', alIntervenir)
      el.removeEventListener('pointerenter', alEntrar)
      el.removeEventListener('pointerleave', alSalir)
      el.removeEventListener('focusin', alEnfocar)
      el.removeEventListener('focusout', alDesenfocar)
      document.removeEventListener('visibilitychange', alCambiarLaPestana)
    }
  }, [pista, quieto])

  return { enPantalla, deslizado }
}
