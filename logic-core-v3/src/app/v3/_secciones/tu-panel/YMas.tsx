'use client'

import { useEffect, useRef, useState } from 'react'

import { Titular } from '../../_componentes/tipografia/Titular'
import { useCoreografiaActiva } from '../_contrato/coreografia'
import { leerToken, milisegundosDe, pixelesDe } from './vuelo'
import { PUNTOS_DE_Y_MAS, Y_MAS } from './contenido'
import { arranqueDelPunto, curvaComoLinear, salidaExponencial } from './entrada'

/**
 * «Y MÁS…» — el cierre de la galería, a tamaño de titular.
 *
 * Con la coreografía activa, entra UNA vez cuando aparece en pantalla: la frase
 * desde el borde derecho con `expo.out`, y los tres puntos después, uno detrás
 * del otro, a la derecha de «más». Sin coreografía (abajo de 1025 o con
 * movimiento reducido) está quieta desde el principio: el marcado ya la muestra
 * entera, y no se esconde nada que después haya que mostrar.
 */
export function YMas(): React.JSX.Element {
  const anima = useCoreografiaActiva()
  const [estado, setEstado] = useState<'quieta' | 'espera' | 'entro'>('quieta')
  const raiz = useRef<HTMLParagraphElement>(null)
  const frase = useRef<HTMLSpanElement>(null)
  const puntos = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!anima || raiz.current === null) return
    setEstado('espera')
    const observador = new IntersectionObserver(
      (entradas) => {
        if (!entradas.some((e) => e.isIntersecting)) return
        observador.disconnect()
        const el = frase.current
        if (el === null) return
        const curva = curvaComoLinear(salidaExponencial)
        const duracion = milisegundosDe(leerToken('--duracion-muy-lenta'))
        const duracionDelPunto = milisegundosDe(leerToken('--duracion-rapida'))
        const desde = window.innerWidth - el.getBoundingClientRect().left
        el.animate([{ transform: `translateX(${desde}px)` }, { transform: 'none' }], { duration: duracion, easing: curva, fill: 'backwards' })
        const corrida = pixelesDe(leerToken('--spacing-8'))
        puntos.current.forEach((punto, k) => {
          punto?.animate([{ opacity: 0, transform: `translateX(${corrida}px)` }, { opacity: 1, transform: 'none' }], {
            duration: duracionDelPunto,
            easing: curva,
            delay: arranqueDelPunto(k, duracion, duracionDelPunto),
            fill: 'backwards',
          })
        })
        setEstado('entro')
      },
      { threshold: 0.5 },
    )
    observador.observe(raiz.current)
    return () => observador.disconnect()
  }, [anima])

  return (
    <Titular nivel="titulo-xl" como="p" className="overflow-hidden">
      <span ref={raiz} data-pieza="y-mas" data-estado={estado} className={estado === 'espera' ? 'inline-block opacity-0' : 'inline-block'}>
        <span ref={frase} className="inline-block">
          {Y_MAS}
        </span>
        {Array.from({ length: PUNTOS_DE_Y_MAS }, (_, k) => (
          <span
            key={k}
            ref={(el) => {
              puntos.current[k] = el
            }}
            className="inline-block"
          >
            .
          </span>
        ))}
      </span>
    </Titular>
  )
}
