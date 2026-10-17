'use client'

import { useEffect, useRef } from 'react'

import { Imagen } from '../../../_componentes/medios/Imagen'

import type { ProyectoDelPortfolio } from '../proyectos'

import { ANCHO_DEL_MEDIO, MEDIDAS_DE_LOS_MEDIOS, PROPORCION_DEL_MEDIO, SIZES_DEL_LOMO } from './medios'

/** Qué hace el video de una tira, puro (s76 lo afirma sin navegador). */
export interface EstadoDelVideo {
  /** Si lleva `src` y póster: sólo la activa, y sólo con la sección cerca (nada se pide antes). */
  readonly cargado: boolean
  /** Si se reproduce: cargado, sin movimiento reducido y a la vista. */
  readonly reproduce: boolean
  readonly preload: 'auto' | 'none'
}

export function estadoDelVideo(activa: boolean, cerca: boolean, reducido: boolean, aLaVista: boolean): EstadoDelVideo {
  const cargado = activa && cerca
  return { cargado, reproduce: cargado && !reducido && aLaVista, preload: cargado && !reducido ? 'auto' : 'none' }
}

/**
 * [B1] EL MEDIO DE LA TIRA ACTIVA — el recorrido del sitio, 16:10 y contenido en su caja, con el mismo enlace que «Visitar sitio»
 * sólo para el mouse (fuera del orden del teclado y de los lectores: la parada es el enlace de la región).
 *
 * El video es `muted playsInline loop` y SÓLO el de la tira activa tiene `src` (y con la sección cerca: nada se pide antes); los
 * demás no tienen nada y `preload="none"`. Con movimiento reducido no hay autoplay: queda el póster. Se pausa fuera de cuadro y con
 * la pestaña oculta (`aLaVista`, `usePortfolio`). El video de escritorio va desde 768; abajo, las historias (B1.3).
 */
export function MedioDeLaTira({
  proyecto,
  activa,
  cerca,
  aLaVista,
  reducido,
}: {
  readonly proyecto: ProyectoDelPortfolio
  readonly activa: boolean
  readonly cerca: boolean
  readonly aLaVista: boolean
  readonly reducido: boolean
}): React.JSX.Element {
  const video = useRef<HTMLVideoElement | null>(null)
  const e = estadoDelVideo(activa, cerca, reducido, aLaVista)
  useEffect(() => {
    const v = video.current
    if (v === null) return
    if (e.reproduce) void v.play().catch(() => undefined)
    else v.pause()
  }, [e.reproduce, e.cargado])
  return (
    <figure aria-label={proyecto.alt} className="relative overflow-clip rounded-sutil bg-tinta/5" style={{ aspectRatio: PROPORCION_DEL_MEDIO, width: ANCHO_DEL_MEDIO }}>
      <video
        ref={video}
        data-video-del-portfolio={proyecto.slug}
        muted
        playsInline
        loop
        preload={e.preload}
        aria-hidden="true"
        className="h-full w-full object-contain"
        {...(e.cargado ? { src: proyecto.medios.video.escritorio, poster: proyecto.medios.poster.escritorio } : {})}
      />
      <a href={proyecto.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className="absolute inset-0" />
    </figure>
  )
}

/** El lomo de una tira inactiva: el póster del teléfono, en grises, detrás del nombre girado. Decorativo; sólo con la sección cerca. */
export function PosterDelLomo({ proyecto, cerca }: { readonly proyecto: ProyectoDelPortfolio; readonly cerca: boolean }): React.JSX.Element {
  const medida = MEDIDAS_DE_LOS_MEDIOS[proyecto.slug].movil
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {cerca ? <Imagen src={proyecto.medios.poster.movil} alt="" ancho={medida.ancho} alto={medida.alto} sizes={SIZES_DEL_LOMO} className="h-full w-full object-cover opacity-tenue grayscale" /> : null}
    </div>
  )
}
