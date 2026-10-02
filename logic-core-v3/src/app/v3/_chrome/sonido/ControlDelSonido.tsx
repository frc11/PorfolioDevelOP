'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'

import { sonar } from '../../_lib/sonido/bus'
import type { MotorDelSonido } from '../../_lib/sonido/motor'
import { guardarPrendido, leerPrendido, suscribirAlPrendido } from '../../_lib/sonido/preferencia'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { nocheQueSeVe } from '../cursor/estado'
import { pedirElMotor, soltarElMotor } from './motorCompartido'

/**
 * [3D Y SONIDO] T2 · EL CONTROL DEL SONIDO — un parlante chico junto al infinito del recorrido (en escritorio a su izquierda;
 * en el teléfono encima, para no ocupar más ancho sobre el contenido), en su mismo lenguaje
 * (trazo fino, puntas redondas, el borde tenue del tono contrario) y con su mismo tono: copia el que el infinito leyó de
 * lo que hay debajo (`data-seccion`), así no hay una segunda lectura. Sólo con la prueba (`?pruebas=sonido=si`).
 *
 *   · **Apagado por defecto**, y la elección se recuerda (`preferencia.ts`, con try/catch).
 *   · **Nada suena sin una acción.** Prenderlo es un clic; si quedó prendido de otra visita, el motor (howler y el
 *     archivo) se carga recién con la primera acción en la página (un toque, una tecla): antes, ni se descarga.
 *   · Prendido: el clic de cualquier enlace o botón suena (uno solo, delegado en el documento), y el ambiente sigue a la
 *     noche que se ve (la de día y la de noche se funden), salvo con movimiento reducido o con la pestaña oculta.
 */
const CADA_MS_DEL_AMBIENTE = 500
const ENLACES_Y_BOTONES = 'a[href], button, [role="button"], summary'

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

  // Prendido: el clic de los enlaces y botones, y el ambiente con la noche que se ve.
  useEffect(() => {
    if (!prendido) return undefined
    const alClic = (e: MouseEvent): void => {
      const blanco = e.target instanceof Element ? e.target : null
      if (blanco !== null && blanco.closest(ENLACES_Y_BOTONES) !== null && blanco.closest('[data-pieza="control-del-sonido"]') === null) sonar('clic')
    }
    document.addEventListener('click', alClic)
    const ambiente = window.setInterval(() => {
      motor.current?.ambiente(reducido || document.visibilityState !== 'visible' ? null : nocheQueSeVe())
    }, CADA_MS_DEL_AMBIENTE)
    return () => {
      document.removeEventListener('click', alClic)
      window.clearInterval(ambiente)
      motor.current?.ambiente(null)
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
      className="text-tinta fixed right-[calc(var(--spacing-4)+var(--spacing-2))] bottom-[calc(var(--spacing-4)+var(--spacing-12))] z-[var(--z-cabecera)] flex h-[var(--spacing-8)] w-[var(--spacing-8)] items-center justify-center rounded-[var(--radius-circulo)] transition-colors duration-[var(--duracion-media)] escritorio:right-[calc(var(--spacing-6)+var(--spacing-8)*2+var(--spacing-3))] escritorio:bottom-[var(--spacing-6)]"
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
