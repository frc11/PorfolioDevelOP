'use client'

import { useEffect, useRef } from 'react'

import { CtaEnlace } from '../../../_componentes/chrome/Cta'
import { Caption } from '../../../_componentes/tipografia/Textos'
import { Titular } from '../../../_componentes/tipografia/Titular'

import { CONTENIDO } from '../contenido'
import type { ProyectoDelPortfolio } from '../proyectos'

/**
 * [B1.2d B] T4 · LA FICHA DE LA HISTORIA — lo más abajo posible (respetando el área segura) y en el último cuarto de la pantalla como
 * mucho: el nombre y el rubro a la izquierda y el problema a la derecha; qué hicimos a la izquierda y «Visitar sitio» a la derecha.
 * Nada más: sin rótulos, sin fecha, sin lo que resolvimos, sin la reseña y sin la marca de agua. Si un texto no entra, va su versión
 * corta (los mismos textos, condensados; se agregan sólo si la medida lo pide). Sobre el video, la hoja de vidrio de la tinta (AA medido).
 */
export const CLASE_DE_LA_FICHA_DE_LA_HISTORIA =
  'absolute inset-x-0 bottom-0 flex flex-col gap-3 rounded-t-[var(--radius-fuerte)] bg-fondo/75 px-5 pt-4 pb-[calc(var(--spacing-5)+env(safe-area-inset-bottom))] backdrop-blur-[var(--blur-panel)]'

export function FichaDeLaHistoria({ proyecto }: { readonly proyecto: ProyectoDelPortfolio }): React.JSX.Element {
  const problema = proyecto.problemaCliente
  const hicimos = proyecto.queHicimos
  return (
    <div data-pieza="ficha-de-la-historia" className={CLASE_DE_LA_FICHA_DE_LA_HISTORIA}>
      <div data-fila="uno" className="grid grid-cols-2 items-start gap-4">
        <div className="flex min-w-0 flex-col">
          <Titular nivel="titulo-s" como="h3">{proyecto.nombre}</Titular>
          {proyecto.rubro === null ? null : <Caption className="text-tinta/70">{proyecto.rubro}</Caption>}
        </div>
        {problema === null ? null : <Caption className="text-right">{problema}</Caption>}
      </div>
      <div data-fila="dos" className="flex items-end justify-between gap-4">
        {hicimos === null ? <span /> : <Caption className="min-w-0">{hicimos}</Caption>}
        <CtaEnlace href={proyecto.url} rotulo={`${CONTENIDO.ficha.visitar} ↗`} etiqueta={`${CONTENIDO.ficha.visitar} de ${proyecto.nombre}, ${CONTENIDO.ficha.abreAparte}`} externo className="shrink-0" />
      </div>
    </div>
  )
}

/**
 * [B1.2d B] UNA HISTORIA DEL PORTFOLIO — el video del teléfono a pantalla completa (en bucle mientras dura la historia; cada historia
 * lo arranca de cero, porque se vuelve a montar) y la ficha abajo. Mantener apretado lo pausa (`pausada`). Sin la sección cerca no pide
 * nada; con movimiento reducido, el póster.
 */
export function HistoriaDelProyecto({ proyecto, pausada, cerca, aLaVista, reducido }: {
  readonly proyecto: ProyectoDelPortfolio
  readonly pausada: boolean
  readonly cerca: boolean
  readonly aLaVista: boolean
  readonly reducido: boolean
}): React.JSX.Element {
  const video = useRef<HTMLVideoElement | null>(null)
  const reproduce = cerca && aLaVista && !reducido && !pausada
  useEffect(() => {
    const v = video.current
    if (v === null) return
    if (reproduce) void v.play().catch(() => undefined)
    else v.pause()
  }, [reproduce])
  return (
    <div data-historia={proyecto.slug} className="absolute inset-0 bg-tinta/5">
      <video
        ref={video}
        data-video-del-portfolio={proyecto.slug}
        data-cual="movil"
        muted
        playsInline
        loop
        preload={cerca && !reducido ? 'auto' : 'none'}
        aria-hidden="true"
        className="h-full w-full object-cover"
        {...(cerca ? { src: proyecto.medios.video.movil, poster: proyecto.medios.poster.movil } : {})}
      />
      <FichaDeLaHistoria proyecto={proyecto} />
    </div>
  )
}
