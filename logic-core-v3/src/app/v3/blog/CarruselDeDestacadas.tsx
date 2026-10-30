'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'

import { NOTAS_DESTACADAS, fechaLarga, minutosDeLectura, rutaDeLaNota } from './_notas/indice'
import { PortadaDeNota } from './PortadaDeNota'

/**
 * [L7c] EL CARRUSEL DE NOTAS DESTACADAS — a todo el ancho: la nota ocupa la sección (la portada, el título y su bajada) y tocarla entra a la
 * nota. Cambia sola cada `MS_POR_NOTA`; se detiene con el puntero o el foco encima, y con movimiento reducido no avanza sola. Dos flechas
 * para pasarlo a mano y, abajo, una barra de progreso por nota (la de ahora se llena con el tiempo que le queda).
 */
const MS_POR_NOTA = 6500

export function CarruselDeDestacadas(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const [actual, setActual] = useState(0)
  const [detenido, setDetenido] = useState(false)
  const total = NOTAS_DESTACADAS.length
  const ir = (delta: number): void => setActual((a) => (a + delta + total) % total)

  // El reloj: un cuadro a la vez, sólo mientras corre (sin puntero ni foco encima y con movimiento). Escribe el relleno de la barra de la nota de ahora
  // directo en el DOM (sin renderizar por cuadro) y, al llegar al tiempo de la nota, pasa a la que sigue. Al detenerse conserva lo transcurrido.
  const barra = useRef<HTMLSpanElement>(null)
  const transcurrido = useRef(0)
  useEffect(() => {
    transcurrido.current = 0
    const mia = barra.current
    return () => {
      if (mia !== null) mia.style.transform = ''
    }
  }, [actual])
  useEffect(() => {
    const el = barra.current
    if (el !== null) el.style.transform = `scaleX(${reducido ? 1 : transcurrido.current / MS_POR_NOTA})`
    if (detenido || reducido) return undefined
    let cuadro = 0
    let antes = performance.now()
    const paso = (ahora: number): void => {
      transcurrido.current += ahora - antes
      antes = ahora
      if (transcurrido.current >= MS_POR_NOTA) {
        setActual((a) => (a + 1) % total)
        return
      }
      if (barra.current !== null) barra.current.style.transform = `scaleX(${transcurrido.current / MS_POR_NOTA})`
      cuadro = window.requestAnimationFrame(paso)
    }
    cuadro = window.requestAnimationFrame(paso)
    return () => window.cancelAnimationFrame(cuadro)
  }, [actual, detenido, reducido, total])

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Notas destacadas"
      data-pieza="carrusel-de-notas"
      onPointerEnter={() => setDetenido(true)}
      onPointerLeave={() => setDetenido(false)}
      onFocusCapture={() => setDetenido(true)}
      onBlurCapture={() => setDetenido(false)}
      className="flex flex-col gap-[var(--spacing-4)]"
    >
      <div className="relative overflow-hidden">
        <ul className="flex transition-transform duration-[var(--duracion-muy-lenta)] ease-[var(--ease-salida)] motion-reduce:transition-none" style={{ transform: `translateX(-${actual * 100}%)` }}>
          {NOTAS_DESTACADAS.map((nota, i) => (
            <li key={nota.slug} aria-roledescription="diapositiva" aria-label={`${i + 1} de ${total}`} aria-hidden={i !== actual} className="w-full shrink-0">
              <EnlaceDeRuta href={rutaDeLaNota(nota)} tabIndex={i === actual ? 0 : -1} className="group grid grid-cols-1 gap-[var(--spacing-6)] escritorio:grid-cols-[3fr_2fr] escritorio:items-center">
                <PortadaDeNota nota={nota} className="rounded-[var(--radius-fuerte)]" />
                <span className="flex min-w-0 flex-col gap-[var(--spacing-3)]">
                  <Caption como="span" interletrado="micro" className="font-codigo uppercase text-tinta-media">
                    {fechaLarga(nota.fecha)} · {minutosDeLectura(nota)} min de lectura
                  </Caption>
                  <Titular nivel="titulo-m" como="h3" className="group-hover:underline group-focus-visible:underline">
                    {nota.titulo}
                  </Titular>
                  <Cuerpo className="max-w-[48ch]">{nota.resumen}</Cuerpo>
                  <span className="font-semi underline underline-offset-4">Leer la nota</span>
                </span>
              </EnlaceDeRuta>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-[var(--spacing-4)]">
        <button type="button" aria-label="Nota anterior" onClick={() => ir(-1)} className="inline-flex size-11 items-center justify-center rounded-circulo border border-borde text-tinta hover:bg-tinta/5">
          <ArrowLeft aria-hidden="true" strokeWidth={1.5} className="size-5" />
        </button>
        <button type="button" aria-label="Nota siguiente" onClick={() => ir(1)} className="inline-flex size-11 items-center justify-center rounded-circulo border border-borde text-tinta hover:bg-tinta/5">
          <ArrowRight aria-hidden="true" strokeWidth={1.5} className="size-5" />
        </button>
        <ol className="flex flex-1 gap-[var(--spacing-2)]" aria-label="Progreso">
          {NOTAS_DESTACADAS.map((nota, i) => (
            <li key={nota.slug} className="h-1 flex-1 overflow-hidden rounded-circulo bg-tinta/15">
              <button type="button" aria-label={`Ir a la nota ${i + 1}`} aria-current={i === actual} onClick={() => setActual(i)} className="relative block h-full w-full">
                <span ref={i === actual ? barra : undefined} className={cn('absolute inset-y-0 left-0 w-full origin-left bg-tinta', i < actual ? 'scale-x-100' : i > actual && 'scale-x-0')} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
