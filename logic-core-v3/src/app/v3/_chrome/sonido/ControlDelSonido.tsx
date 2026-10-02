'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { sonar } from '../../_lib/sonido/bus'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { guardarPrendido, leerPrendido, suscribirAlPrendido } from '../../_lib/sonido/preferencia'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { SELECTOR_DE_LOS_CTA } from '../escena/RespuestaDeLaEscena'
import { pedirElMotor, soltarElMotor } from './motorCompartido'

/**
 * [3D Y SONIDO] T2 · EL CONTROL DEL SONIDO — un parlante chico junto al infinito del recorrido (en escritorio a su izquierda;
 * en el teléfono encima, para no ocupar más ancho sobre el contenido), en su mismo lenguaje
 * (trazo fino, puntas redondas, el borde tenue del tono contrario) y con su mismo tono: copia el que el infinito leyó de
 * lo que hay debajo (`data-seccion`), así no hay una segunda lectura. [RETOQUE 3D] En el producto (era sólo con la prueba).
 *
 *   · **Apagado por defecto**, y la elección se recuerda (`preferencia.ts`, con try/catch).
 *   · **Nada suena sin una acción.** Prenderlo es un clic; si quedó prendido de otra visita, el motor (howler y el
 *     archivo) se carga recién con la primera acción en la página (un toque, una tecla): antes, ni se descarga.
 *   · Prendido: el clic de cualquier enlace o botón suena (uno solo, delegado en el documento; la barra y los CTA con el
 *     pestillo, [CIERRE RETOQUE 3D] S1), el hover de los CTA suena el tic de la barra y suena UN ambiente generativo para
 *     toda la página (S2: sin archivo), salvo con movimiento reducido o con la pestaña oculta.
 */
const ENLACES_Y_BOTONES = 'a[href], button, [role="button"], summary'
/** [RETOQUE 3D] La barra (la pastilla, la esquina y el menú del teléfono) y los CTA: [CIERRE RETOQUE 3D] S1 · su clic, el pestillo. */
const DE_LA_BARRA = '[data-pieza="barra"] a, [data-pieza="menu-movil"] [data-parte="item-del-menu"]'
const DE_LOS_CTA = `${SELECTOR_DE_LOS_CTA}, [data-pieza="empezar"], [data-abre-contacto]`

export default function ControlDelSonido(): React.JSX.Element {
  const boton = useRef<HTMLButtonElement>(null)
  const prendido = useSyncExternalStore(suscribirAlPrendido, leerPrendido, () => false)
  const reducido = useMovimientoReducido()
  const motor = useRef<MotorDelSonido | null>(null)

  // El tono: el del infinito, que ya lo lee de lo que hay debajo (los dos están en la misma esquina).
  useEffect(() => {
    const infinito = document.querySelector('[data-pieza="infinito-del-recorrido"]')
    const el = boton.current
    if (infinito === null || el === null) return undefined
    const copiar = (): void => {
      if (infinito.getAttribute('data-seccion') === 'invertida') el.setAttribute('data-seccion', 'invertida')
      else el.removeAttribute('data-seccion')
    }
    copiar()
    const espia = new MutationObserver(copiar)
    espia.observe(infinito, { attributes: true, attributeFilter: ['data-seccion'] })
    return () => espia.disconnect()
  }, [])

  // Prendido: el motor, con una acción de por medio (la del clic que lo prendió ya cuenta).
  useEffect(() => {
    if (!prendido) return undefined
    let vivo = true
    let pedido = false
    const cargar = (): void => {
      quitar()
      if (pedido) return
      pedido = true
      void pedirElMotor().then((m) => {
        if (vivo) motor.current = m
      })
    }
    const quitar = (): void => {
      window.removeEventListener('pointerdown', cargar, true)
      window.removeEventListener('keydown', cargar, true)
    }
    if ((navigator as Navigator & { readonly userActivation?: { readonly hasBeenActive: boolean } }).userActivation?.hasBeenActive === true) cargar()
    else {
      window.addEventListener('pointerdown', cargar, true)
      window.addEventListener('keydown', cargar, true)
    }
    return () => {
      vivo = false
      quitar()
      motor.current = null
      if (pedido) soltarElMotor()
    }
  }, [prendido])

  // Prendido: el clic (el de la barra y el de los CTA, el pestillo; el de siempre para lo demás), el tic del hover de los
  // CTA (el mismo de la barra) y [RETOQUE 3D] UN ambiente para toda la página (sin día ni noche); sin él con movimiento
  // reducido o con la pestaña oculta.
  useEffect(() => {
    if (!prendido) return undefined
    const alClic = (e: MouseEvent): void => {
      const blanco = e.target instanceof Element ? e.target : null
      if (blanco === null || blanco.closest('[data-pieza="control-del-sonido"]') !== null) return
      if (blanco.closest(DE_LA_BARRA) !== null || blanco.closest(DE_LOS_CTA) !== null) sonar('pestillo')
      else if (blanco.closest(ENLACES_Y_BOTONES) !== null) sonar('clic')
    }
    let ctaSenalado: Element | null = null
    const alPasar = (e: PointerEvent): void => {
      if (e.pointerType !== 'mouse') return
      const cta = e.target instanceof Element ? e.target.closest(DE_LOS_CTA) : null
      if (cta !== null && cta !== ctaSenalado) sonar('tic')
      ctaSenalado = cta
    }
    const ambiente = (): void => motor.current?.ambiente(!reducido && document.visibilityState === 'visible')
    document.addEventListener('click', alClic)
    document.addEventListener('pointerover', alPasar)
    document.addEventListener('visibilitychange', ambiente)
    const reintento = window.setInterval(ambiente, 1000)
    ambiente()
    return () => {
      document.removeEventListener('click', alClic)
      document.removeEventListener('pointerover', alPasar)
      document.removeEventListener('visibilitychange', ambiente)
      window.clearInterval(reintento)
      motor.current?.ambiente(false)
    }
  }, [prendido, reducido])

  return (
    <button
      ref={boton}
      type="button"
      data-pieza="control-del-sonido"
      aria-pressed={prendido}
      aria-label="Sonido"
      onClick={() => guardarPrendido(!prendido)}
      className="text-tinta fixed right-[calc(var(--spacing-4)+var(--spacing-2))] bottom-[calc(var(--spacing-4)+var(--spacing-12))] z-[var(--z-cabecera)] flex h-[var(--spacing-8)] w-[var(--spacing-8)] items-center justify-center rounded-[var(--radius-circulo)] transition-colors duration-[var(--duracion-media)] escritorio:right-[calc(var(--spacing-6)+var(--spacing-8)*2.6+var(--spacing-3))] escritorio:bottom-[var(--spacing-6)]"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="block h-[var(--spacing-5)] w-[var(--spacing-5)] overflow-visible" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* El borde del tono contrario, debajo (como el infinito): se lee sobre cualquier fondo. */}
        <g stroke="var(--color-fondo)" strokeWidth={3.5} opacity={0.35}>
          <path d={PARLANTE} />
          <path d={prendido ? ONDAS : CALLADO} />
        </g>
        <g stroke="currentColor" strokeWidth={1.5}>
          <path d={PARLANTE} />
          <path d={prendido ? ONDAS : CALLADO} />
        </g>
      </svg>
    </button>
  )
}

/** El parlante, las dos ondas (prendido) y la cruz (apagado), en una caja de 24. */
const PARLANTE = 'M4 9.5h3.2L12 5.5v13l-4.8-4H4z'
const ONDAS = 'M15.5 9.2a4 4 0 0 1 0 5.6M18.2 6.6a7.6 7.6 0 0 1 0 10.8'
const CALLADO = 'M16 9.5l4.5 5M20.5 9.5l-4.5 5'
