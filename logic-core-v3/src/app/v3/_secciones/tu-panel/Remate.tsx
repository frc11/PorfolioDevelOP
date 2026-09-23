'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { FormularioDeNovedades } from '../../_componentes/chrome/Novedades'
import { Titular } from '../../_componentes/tipografia/Titular'
import { useCoreografiaActiva } from '../_contrato/coreografia'
import { NEWSLETTER, PUNTOS_DE_Y_MAS, Y_MAS } from './contenido'
import { cronogramaDelRemate, curvaComoLinear, salidaExponencial } from './entrada'
import { leerToken, milisegundosDe, pixelesDe } from './vuelo'

/**
 * EL REMATE — «Y más…» a la izquierda y el newsletter a la derecha (SPRINT PANEL 2).
 *
 * ── Llegan y SE VAN: la entrada se reproduce al revés al salir por abajo ──
 *
 * Se eligió invertir la misma animación por tiempo y no atarla al scroll. Atada
 * al scroll, la curva `expo.out` dejaría de ser una curva: la velocidad la
 * pondría la rueda, y un scroll lento la volvería lineal. Invertida, el gesto de
 * salida es EXACTAMENTE el de entrada en espejo —se van primero los puntos, que
 * llegaron últimos—, y cuesta un solo `IntersectionObserver`. Sale sólo cuando
 * el remate se va por ABAJO (se está subiendo); si se va por arriba, se queda.
 *
 * El newsletter es `FormularioDeNovedades`, el mismo componente que vivía en el
 * pie del Cierre, y sigue deshabilitado: no hay un destino al que mandarlo.
 *
 * Sin coreografía (abajo de 1025 o con movimiento reducido) está quieto desde el
 * principio y el newsletter va debajo, a todo el ancho.
 */
export function Remate(): React.JSX.Element {
  const anima = useCoreografiaActiva()
  const [estado, setEstado] = useState<'quieto' | 'espera' | 'vivo'>('quieto')
  const fila = useRef<HTMLDivElement>(null)
  const frase = useRef<HTMLSpanElement>(null)
  const puntos = useRef<(HTMLSpanElement | null)[]>([])
  const novedades = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raiz = fila.current
    if (!anima || raiz === null) return
    setEstado('espera')
    let animaciones: Animation[] = []
    const armar = (): void => {
      const curva = curvaComoLinear(salidaExponencial)
      const tramos = cronogramaDelRemate(milisegundosDe(leerToken('--duracion-muy-lenta')), milisegundosDe(leerToken('--duracion-rapida')), PUNTOS_DE_Y_MAS)
      const derecha = window.innerWidth
      const corrida = pixelesDe(leerToken('--spacing-8'))
      const piezas = [frase.current, ...puntos.current, novedades.current]
      animaciones = tramos.flatMap((t, i) => {
        const el = piezas[i]
        if (el === null || el === undefined) return []
        const desde = t.pieza === 'punto' ? corrida : derecha - el.getBoundingClientRect().left
        const opacidad = t.pieza === 'punto' ? [{ opacity: 0 }, { opacity: 1 }] : [{}, {}]
        return [
          el.animate(
            [
              { ...opacidad[0], transform: `translateX(${desde}px)` },
              { ...opacidad[1], transform: 'none' },
            ],
            { delay: t.delay, duration: t.duration, endDelay: t.endDelay, easing: curva, fill: 'both' },
          ),
        ]
      })
      setEstado('vivo')
    }
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          if (animaciones.length === 0) armar()
          else reproducir(animaciones, 1)
        } else if (entrada.boundingClientRect.top > 0) {
          reproducir(animaciones, -1)
        }
      },
      { threshold: 0.3 },
    )
    observador.observe(raiz)
    return () => {
      observador.disconnect()
      for (const a of animaciones) a.cancel()
    }
  }, [anima])

  const escondido = estado === 'espera' ? 'invisible' : ''

  return (
    <div ref={fila} data-pieza="remate-del-panel" data-estado={estado} className="flex flex-col gap-[var(--spacing-12)] overflow-x-clip escritorio:flex-row escritorio:items-end escritorio:justify-between">
      <Titular nivel="titulo-xl" como="p">
        <span data-pieza="y-mas" className={`inline-block ${escondido}`}>
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

      <div ref={novedades} data-pieza="newsletter-del-panel" className={`flex flex-col gap-[var(--spacing-4)] escritorio:w-2/5 ${escondido}`}>
        <Titular nivel="titulo-s" como="h3">
          {NEWSLETTER.titulo}
        </Titular>
        <FormularioDeNovedades
          id={NEWSLETTER.id}
          rotulo={NEWSLETTER.rotulo}
          placeholder={NEWSLETTER.placeholder}
          textoDeAyuda={NEWSLETTER.ayuda}
          rotuloDeEnvio={NEWSLETTER.rotuloDeEnvio}
          icono={<ArrowRight className="size-[var(--spacing-4)]" strokeWidth={1.5} aria-hidden="true" />}
          deshabilitado
        />
      </div>
    </div>
  )
}

/** Hacia adelante (1) o en espejo (−1), desde donde esté cada animación. */
function reproducir(animaciones: readonly Animation[], sentido: 1 | -1): void {
  for (const a of animaciones) {
    a.updatePlaybackRate(sentido)
    a.play()
  }
}
