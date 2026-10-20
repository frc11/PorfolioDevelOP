'use client'

import { useEffect, useRef, useState } from 'react'

import { BotonPausa } from '../../../_componentes/medios/BotonPausa'
import { Imagen } from '../../../_componentes/medios/Imagen'

import type { ProyectoDelPortfolio } from '../proyectos'

import { ANCHO_DEL_MEDIO, MEDIDAS_DE_LOS_MEDIOS, PROPORCION_DEL_MEDIO, SIZES_DEL_LOMO } from './medios'

/** Qué hace el video de una tira, puro (s76 lo afirma sin navegador). */
export interface EstadoDelVideo {
  /** Si lleva `src` y póster: sólo la activa, y sólo con la sección cerca (nada se pide antes). */
  readonly cargado: boolean
  /** Si se reproduce: cargado, sin movimiento reducido, a la vista y [B1.2d B] sin la pausa pedida. */
  readonly reproduce: boolean
  readonly preload: 'auto' | 'none'
}

export function estadoDelVideo(activa: boolean, cerca: boolean, reducido: boolean, aLaVista: boolean, pausado = false): EstadoDelVideo {
  const cargado = activa && cerca
  return { cargado, reproduce: cargado && !reducido && aLaVista && !pausado, preload: cargado && !reducido ? 'auto' : 'none' }
}

/** El video del medio: se reproduce si su estado lo pide (y se pausa si no). */
function Video({ proyecto, e }: { readonly proyecto: ProyectoDelPortfolio; readonly e: EstadoDelVideo }): React.JSX.Element {
  const video = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const v = video.current
    if (v === null) return
    if (e.reproduce) void v.play().catch(() => undefined)
    else v.pause()
  }, [e.reproduce, e.cargado])
  return (
    <video
      ref={video}
      data-video-del-portfolio={proyecto.slug}
      data-cual="escritorio"
      muted
      playsInline
      loop
      preload={e.preload}
      aria-hidden="true"
      className="h-full w-full object-contain"
      {...(e.cargado ? { src: proyecto.medios.video.escritorio, poster: proyecto.medios.poster.escritorio } : {})}
    />
  )
}

/**
 * [B1] EL MEDIO DE LA TIRA ACTIVA — el recorrido del sitio, 16:10 y contenido en su caja, con el mismo enlace que «Visitar sitio»
 * sólo para el mouse (fuera del orden del teclado y de los lectores: la parada es el enlace de la región).
 *
 * El video es `muted playsInline loop` y SÓLO el de la tira activa tiene `src` (y con la sección cerca: nada se pide antes); los
 * demás no tienen nada y `preload="none"`. Con movimiento reducido no hay autoplay: queda el póster. Se pausa fuera de cuadro y con
 * la pestaña oculta (`aLaVista`, `usePortfolio`). [B1.2d B] Sólo el de escritorio: debajo de 1024 el video lo pinta la historia
 * (`HistoriaDelProyecto`). P-H21 · un video en bucle se puede pausar (WCAG 2.2.2): `BotonPausa`, en la esquina, mientras corre solo.
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
  const [pausado, setPausado] = useState(false)
  const estado = estadoDelVideo(activa, cerca, reducido, aLaVista, pausado)
  return (
    <figure aria-label={proyecto.alt} className="relative overflow-clip rounded-sutil bg-tinta/5" style={{ aspectRatio: PROPORCION_DEL_MEDIO, maxWidth: ANCHO_DEL_MEDIO, maxHeight: '100%' }}>
      <Video proyecto={proyecto} e={estado} />
      <a href={proyecto.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className="absolute inset-0" />
      {estado.cargado && !reducido ? <BotonPausa pausado={pausado} alCambiar={setPausado} de={`el video de ${proyecto.nombre}`} className="absolute right-3 bottom-3" /> : null}
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
