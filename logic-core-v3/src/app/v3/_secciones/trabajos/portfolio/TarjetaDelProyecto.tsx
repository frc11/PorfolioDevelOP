'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import { CtaEnlace } from '../../../_componentes/chrome/Cta'
import { Caption } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'
import type { ProyectoDelPortfolio } from '../proyectos'

import { Ficha } from './Ficha'
import { MarcaDeAgua } from './MarcaDeAgua'
import { estiloDeLaMarca } from './Tira'
import { estadoDelVideo, type EstadoDelVideo } from './MedioDeLaTira'
import { PROPORCION_DEL_MEDIO } from './medios'

/**
 * [B1.2e] LA SUPERFICIE DE LO QUE FLOTA EN EL FLUJO DEL CARRUSEL (la tarjeta y «la tuya»): la hoja de vidrio de la tinta que ya pasó el AA
 * sobre el video y la escena en el teléfono (la ficha de las historias: el papel de la noche al 75 % con el desenfoque del panel), con el
 * radio fuerte y el borde fino. El texto va encima, en la tinta.
 */
export const SUPERFICIE_DEL_CARRUSEL = 'rounded-fuerte border border-tinta/10 bg-fondo/75 backdrop-blur-[var(--blur-panel)]'

/**
 * [L2] EL VIDEO CEDE: su caja (un contenedor de tamaño) se queda con el alto que le deja la ficha en la tarjeta, y el video la llena en 16:10
 * sin deformarse (lo que mande, el ancho o el alto de la caja). Antes, el 24 % del cuadro y la tarjeta crecía con la ficha.
 */
const CLASE_DE_LA_CAJA_DEL_MEDIO = 'relative flex min-h-0 flex-1 items-center justify-center [container-type:size] medio:h-full'
const ESTILO_DEL_MEDIO: React.CSSProperties = { aspectRatio: PROPORCION_DEL_MEDIO, width: 'min(100cqw, 100cqh * 16 / 10)' }

/**
 * El video de la tarjeta: el recorrido del sitio (el de escritorio, 16:10 y contenido: la tarjeta es apaisada en todo ancho). Sólo la tarjeta
 * activa lleva el video y sólo con la sección cerca; el póster, todas las que están cerca (entra sin un cuadro vacío). Se reproduce sólo
 * mientras el carrusel corre (a la vista y sin pausa: mantener apretado lo pausa) y, en cada cambio, arranca de cero. Sin el enlace al sitio
 * encima (el del panel de escritorio): mantener apretado sobre un enlace abre el menú del teléfono.
 */
function MedioDeLaTarjeta({ proyecto, e, cerca, reinicio }: { readonly proyecto: ProyectoDelPortfolio; readonly e: EstadoDelVideo; readonly cerca: boolean; readonly reinicio: number }): React.JSX.Element {
  const video = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const v = video.current
    if (v === null) return
    if (e.reproduce) void v.play().catch(() => undefined)
    else v.pause()
  }, [e.reproduce, e.cargado])
  useEffect(() => {
    const v = video.current
    if (v !== null && v.currentTime > 0) v.currentTime = 0
  }, [reinicio])
  return (
    <figure aria-label={proyecto.alt} className="relative mx-auto overflow-clip rounded-sutil bg-tinta/5" style={ESTILO_DEL_MEDIO}>
      <video
        ref={video}
        data-video-del-portfolio={proyecto.slug}
        data-cual="escritorio"
        muted
        playsInline
        loop
        preload={e.preload}
        aria-hidden="true"
        className="pointer-events-none h-full w-full object-contain"
        {...(cerca ? { poster: proyecto.medios.poster.escritorio } : {})}
        {...(e.cargado ? { src: proyecto.medios.video.escritorio } : {})}
      />
    </figure>
  )
}

/**
 * [B1.2e] LA TARJETA DE UN PROYECTO EN EL CARRUSEL (debajo de 1024) — el video y TODA la información de la tira de escritorio, con sus
 * mismas piezas: el nombre y el rubro, «Visitar sitio ↗» (en la misma fila, a la derecha), la ficha entera (`Ficha`: la fecha, qué hicimos,
 * el problema, lo que resolvimos y la reseña con su firma; el servicio y el resultado, ocultos como siempre) y la marca de agua del cliente.
 * Ningún texto se acortó: en el teléfono la ficha va en `caption` (`compacta`). La ficha entra con la secuencia de la tira cada vez que la
 * tarjeta se activa. Apilada hasta 860; desde ahí, el video a la izquierda y el texto a la derecha (la tablet acostada no tiene alto).
 * [L2] Sin la reseña (`sinResena`) y llenando el alto que le deja la pantalla: el video cede (`CLASE_DE_LA_CAJA_DEL_MEDIO`).
 */
export function TarjetaDelProyecto({ proyecto, activa, corre, reinicio, cerca, reducido }: {
  readonly proyecto: ProyectoDelPortfolio
  readonly activa: boolean
  /** El carrusel corre (la activa, a la vista y sin pausa): el video se reproduce. */
  readonly corre: boolean
  readonly reinicio: number
  readonly cerca: boolean
  readonly reducido: boolean
}): React.JSX.Element {
  const video = estadoDelVideo(activa, cerca, reducido, corre)
  return (
    <article
      data-pieza="tarjeta-del-proyecto"
      data-proyecto={proyecto.slug}
      className={cn(SUPERFICIE_DEL_CARRUSEL, 'relative flex h-full flex-col gap-3 overflow-clip p-3 tablet:gap-5 tablet:p-6 medio:grid medio:grid-cols-2 medio:items-center medio:gap-8')}
    >
      <MarcaDeAgua proyecto={proyecto} cerca={cerca} />
      <div data-parte="caja-del-medio" className={CLASE_DE_LA_CAJA_DEL_MEDIO}>
        <MedioDeLaTarjeta proyecto={proyecto} e={video} cerca={cerca} reinicio={reinicio} />
      </div>
      <div className="relative flex min-w-0 shrink-0 flex-col gap-3 tablet:gap-4">
        <div data-fila="nombre" className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col">
            <Titular nivel="titulo-m" como="h3">{proyecto.nombre}</Titular>
            {proyecto.rubro === null ? null : <Caption className="text-tinta/70">{proyecto.rubro}</Caption>}
          </div>
          <span className="shrink-0" style={estiloDeLaMarca(proyecto)}>
            <CtaEnlace href={proyecto.url} rotulo={`${CONTENIDO.ficha.visitar} ↗`} etiqueta={`${CONTENIDO.ficha.visitar} de ${proyecto.nombre}, ${CONTENIDO.ficha.abreAparte}`} externo />
          </span>
        </div>
        <Ficha proyecto={proyecto} visible={activa} reducido={reducido} desde={1} compacta sinResena />
      </div>
    </article>
  )
}
