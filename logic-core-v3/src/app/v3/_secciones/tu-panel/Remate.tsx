'use client'

import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { FormularioDeNovedades } from '../../_componentes/chrome/Novedades'
import { Titular } from '../../_componentes/tipografia/Titular'
import { useMovimientoEnTodoAncho } from '../_contrato/coreografia'
import { cruceDelTramo, gestoDelCruce, puestoTras } from '../_contrato/cruce'
import { NEWSLETTER, PUNTOS_DE_Y_MAS, Y_MAS } from './contenido'
import { DISPARO_DEL_REMATE, LENTITUD_DEL_REMATE, cronogramaDelRemate, curvaComoLinear, margenDelDisparo, salidaExponencial } from './entrada'
import { leerToken, milisegundosDe, pixelesDe } from './vuelo'

/**
 * EL REMATE — «Y más…» a la izquierda y el newsletter a la derecha (SPRINT PANEL 2).
 *
 * ── Se QUEDAN: el disparo es por LÍNEA, no por visibilidad (SPRINT PANEL 3) ─
 *
 * Como todos los objetos de la página: bajando, al cruzar la línea de disparo
 * (`DISPARO_DEL_REMATE`), entran; se quedan aunque salgan por arriba; y sólo si
 * se vuelve a SUBIR por encima de la línea hacen la entrada al revés —primero los
 * puntos, después la frase y el newsletter—. El discriminador de los cuatro
 * cruces es el de Trabajos (`_contrato/cruce.ts`); acá no hay uno propio.
 *
 * El newsletter es `FormularioDeNovedades`, el mismo componente que vivía en el
 * pie del Cierre, y sigue deshabilitado: no hay un destino al que mandarlo.
 *
 * Sin coreografía (abajo de 1025 o con movimiento reducido) está quieto desde el
 * principio y el newsletter va debajo, a todo el ancho.
 */
export function Remate(): React.JSX.Element {
  // MÓVIL 2: la misma llegada y regresión en todo ancho.
  const anima = useMovimientoEnTodoAncho()
  const [estado, setEstado] = useState<'quieto' | 'espera' | 'vivo'>('quieto')
  const fila = useRef<HTMLDivElement>(null)
  const frase = useRef<HTMLSpanElement>(null)
  const puntos = useRef<(HTMLSpanElement | null)[]>([])
  const novedades = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const raiz = fila.current
    // Sin movimiento queda a la vista: también si lo perdió (un ancho que cruza el umbral la dejaba invisible).
    if (!anima || raiz === null) {
      setEstado('quieto')
      return
    }
    setEstado('espera')
    let animaciones: Animation[] = []
    const armar = (): void => {
      const curva = curvaComoLinear(salidaExponencial)
      const tramos = cronogramaDelRemate(
        milisegundosDe(leerToken('--duracion-muy-lenta')) * LENTITUD_DEL_REMATE,
        milisegundosDe(leerToken('--duracion-rapida')) * LENTITUD_DEL_REMATE,
        PUNTOS_DE_Y_MAS,
      )
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
    let primero = true
    const observador = new IntersectionObserver(
      ([e]) => {
        const cruce = cruceDelTramo({ cruza: e.isIntersecting, tope: e.boundingClientRect.top, pie: e.boundingClientRect.bottom })
        // El primer aviso es el estado de carga, no un cruce: se posa donde toca, sin gesto.
        if (primero) {
          primero = false
          if (puestoTras(cruce)) {
            armar()
            for (const a of animaciones) a.finish()
          }
          return
        }
        const gesto = gestoDelCruce(cruce)
        if (gesto === 'ida') {
          if (animaciones.length === 0) armar()
          else reproducir(animaciones, 1)
        } else if (gesto === 'vuelta') {
          reproducir(animaciones, -1)
        }
      },
      { rootMargin: margenDelDisparo(DISPARO_DEL_REMATE) },
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
