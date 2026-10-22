'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { Titular } from '../../../_componentes/tipografia/Titular'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../../_lib/navegacion'
import { anotarTramo } from '../../../_lib/escena/tramoEstirado'
import { sonar } from '../../../_lib/sonido/bus'
import { MEZCLA_SOBRE_LA_ESCENA } from '../../../_lib/superficies'
import { usePrefiereMenosMovimiento } from '../../../_lib/usePrefiereMenosMovimiento'
import { RESENAS, TEXTO_DE_LAS_RESENAS, TITULO_DE_LAS_RESENAS, enlaceDelTrabajo } from './contenido'
import { ResenasParaElLector } from './ResenasParaElLector'
import { LARGO_SIN_ESTIRAR_PX } from './tramo'
import { CaraDeLaResena } from './TarjetaDeResena'

/**
 * [NOCTURNO B2] LAS RESEÑAS EN LA LISTA — abajo de 1024 y con movimiento reducido en cualquier ancho (la rama sin escenario): el título y un
 * carrusel PLANO del DOM, con flechas y el deslizamiento nativo (con encaje): en el teléfono y la tablet, una tarjeta de frente (las vecinas
 * asoman); desde 1024 (movimiento reducido), tres quietas. Cada tarjeta lleva al trabajo de su reseña (el deep link de B1). Lo que se ve es
 * del puntero y del dedo (sin enlaces ni botones en el marcado: nada interactivo queda fuera del orden del teclado); el lector y el teclado
 * tienen las reseñas enteras con sus enlaces (`ResenasParaElLector`, igual que en el escenario).
 *
 * REGLA DE ALTURAS: abajo de 1024 la sección mide su contenido y este bloque la alarga: se anota como tramo (la escena no lo ve). Desde 1024
 * la sección mide su escenario entero (el alto mínimo) y el bloque no la alarga: no se anota. Quién decide es el CSS (la variable
 * `--resenas-alargan`, 1 abajo de 1024 y 0 desde ahí), no una consulta de JS.
 */
export function ResenasEnLista(): React.JSX.Element {
  const bloque = useRef<HTMLDivElement>(null)
  const pista = useRef<HTMLUListElement>(null)
  const quieto = usePrefiereMenosMovimiento()

  useEffect(() => {
    const el = bloque.current
    const panel = el?.closest('[data-panel]') ?? null
    if (el === null || panel === null) return undefined
    let soltar: (() => void) | null = null
    const anotar = (): void => {
      soltar?.()
      soltar = null
      const escala = window.innerHeight / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
      const alto = el.offsetHeight
      if (getComputedStyle(el).getPropertyValue('--resenas-alargan').trim() !== '1' || !(escala > 0) || alto <= 0) return
      const arranque = (el.getBoundingClientRect().top - panel.getBoundingClientRect().top) / escala
      soltar = anotarTramo({ panel, k: (alto / escala + LARGO_SIN_ESTIRAR_PX) / LARGO_SIN_ESTIRAR_PX, arranque, largo: LARGO_SIN_ESTIRAR_PX })
    }
    anotar()
    const observador = new ResizeObserver(anotar)
    observador.observe(el)
    window.addEventListener('resize', anotar)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', anotar)
      soltar?.()
    }
  }, [])

  const correr = (sentido: 1 | -1): void => {
    const p = pista.current
    const una = p?.querySelector('li') ?? null
    if (p === null || una === null) return
    p.scrollBy({ left: sentido * una.getBoundingClientRect().width, behavior: quieto ? 'auto' : 'smooth' })
  }

  // El toque de una tarjeta: el clic de siempre y el deep link del trabajo (el escucha del Portfolio lo lleva al paso).
  const irAlTrabajo = (ancla: string): void => {
    sonar('clic')
    window.location.assign(ancla)
  }

  return (
    <div ref={bloque} data-pieza="resenas-en-lista" className="flex flex-col gap-[var(--spacing-8)] [--resenas-alargan:1] escritorio:[--resenas-alargan:0]">
      <ResenasParaElLector />
      <div aria-hidden="true">
        <Titular nivel="titulo-xl" como="p" className={MEZCLA_SOBRE_LA_ESCENA}>
          {`${TITULO_DE_LAS_RESENAS.izquierda} ${TITULO_DE_LAS_RESENAS.derecha}`}
        </Titular>
      </div>
      <div aria-hidden="true" className="w-full @container">
        <ul ref={pista} className="flex snap-x snap-mandatory gap-[var(--spacing-6)] overflow-x-auto pb-[var(--spacing-3)] escritorio:overflow-x-hidden">
          {RESENAS.map((r) => (
            <li key={r.clave} className="shrink-0 snap-center [--ancho-de-la-tarjeta:min(86cqw,calc(var(--spacing-20)*5))] escritorio:[--ancho-de-la-tarjeta:calc((100cqw-2*var(--spacing-6))/3)]">
              <div onClick={() => irAlTrabajo(enlaceDelTrabajo(r))} className="block h-[calc(var(--ancho-de-la-tarjeta)*0.672)] w-[var(--ancho-de-la-tarjeta)] cursor-pointer rounded-[calc(var(--ancho-de-la-tarjeta)*0.069)] shadow-flotante">
                <CaraDeLaResena resena={r} />
              </div>
              <span className={`mt-[var(--spacing-2)] block text-cuerpo ${MEZCLA_SOBRE_LA_ESCENA}`}>{TEXTO_DE_LAS_RESENAS.verTrabajo}</span>
            </li>
          ))}
        </ul>
      </div>
      <div aria-hidden="true" className="flex gap-[var(--spacing-3)]">
        <div onClick={() => correr(-1)} className="cursor-pointer rounded-circulo border border-borde-fuerte bg-fondo p-[var(--spacing-3)] text-tinta">
          <ChevronLeft strokeWidth={1.5} className="size-[var(--spacing-5)]" />
        </div>
        <div onClick={() => correr(1)} className="cursor-pointer rounded-circulo border border-borde-fuerte bg-fondo p-[var(--spacing-3)] text-tinta">
          <ChevronRight strokeWidth={1.5} className="size-[var(--spacing-5)]" />
        </div>
      </div>
    </div>
  )
}
