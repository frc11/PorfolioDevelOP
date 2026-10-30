'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

import { CtaEnlace } from '../_componentes/chrome/Cta'
import { Imagen } from '../_componentes/medios/Imagen'
import { Caption } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { Ficha } from '../_secciones/trabajos/portfolio/Ficha'
import type { ProyectoDelPortfolio } from '../_secciones/trabajos/proyectos'

import { CASOS } from './contenido'

/**
 * [L7b] UN CASO DEL PORTFOLIO — una banda con el recorrido del sitio (el video, o su póster con movimiento reducido) de un lado y, del otro,
 * la ficha ENTERA ya desplegada (`Ficha`, la del home: fecha, qué hicimos, el problema, lo que resolvimos, la reseña si es real) con
 * «Visitar sitio» en el color de la marca. En escritorio alterna el lado de la imagen. El `id` es el deep link de las reseñas (`#portfolio-<slug>`).
 */
const ALTO_DEL_POSTER = 1000
const ANCHO_DEL_POSTER = 1600
const SIZES_DEL_CASO = '(min-width: 1024px) 50vw, 100vw'

function RecorridoDelCaso({ proyecto }: { readonly proyecto: ProyectoDelPortfolio }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const video = useRef<HTMLVideoElement>(null)
  // El video sólo corre mientras está a la vista (si no, pausa): ahorra decodificación fuera de pantalla.
  useEffect(() => {
    const el = video.current
    if (el === null || reducido) return undefined
    const observador = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting === true) void el.play().catch(() => undefined)
      else el.pause()
    })
    observador.observe(el)
    return () => observador.disconnect()
  }, [reducido])
  return (
    <div data-parte="recorrido" className="overflow-hidden rounded-[var(--radius-fuerte)] border border-borde bg-tinta/5 shadow-flotante">
      {reducido ? (
        <Imagen src={proyecto.medios.poster.escritorio} alt={proyecto.alt} ancho={ANCHO_DEL_POSTER} alto={ALTO_DEL_POSTER} sizes={SIZES_DEL_CASO} />
      ) : (
        <video ref={video} muted loop playsInline preload="none" poster={proyecto.medios.poster.escritorio} aria-label={proyecto.alt} className="aspect-[16/10] h-auto w-full object-cover" src={proyecto.medios.video.escritorio} />
      )}
    </div>
  )
}

export function CasoDelPortfolio({ proyecto, indice }: { readonly proyecto: ProyectoDelPortfolio; readonly indice: number }): React.JSX.Element {
  const alaDerecha = indice % 2 === 1
  const marca = { '--color-tinta': proyecto.colorDeMarca } as React.CSSProperties
  return (
    <article id={`portfolio-${proyecto.slug}`} data-caso={proyecto.slug} className="grid scroll-mt-[var(--spacing-20)] grid-cols-1 items-center gap-[var(--spacing-8)] escritorio:grid-cols-2 escritorio:gap-[var(--spacing-12)]">
      <Gatillo desde="abajo" className={cn('min-w-0', alaDerecha && 'escritorio:order-2')}>
        <RecorridoDelCaso proyecto={proyecto} />
      </Gatillo>
      <Gatillo desde="abajo" className="min-w-0" claseDelContenido="flex flex-col gap-[var(--spacing-5)]">
        <header className="flex flex-col gap-[var(--spacing-1)]">
          <Titular nivel="titulo-m" como="h3">
            {proyecto.nombre}
          </Titular>
          {proyecto.rubro === null ? null : (
            <Caption como="p" interletrado="micro" className="font-codigo uppercase text-tinta-media">
              {proyecto.rubro}
            </Caption>
          )}
        </header>
        <div className="[&_dt_span]:text-tinta-media">
          <Ficha proyecto={proyecto} visible reducido desde={0} />
        </div>
        <div style={marca} className="self-start">
          <CtaEnlace href={proyecto.url} externo rotulo={`${CASOS.visitar} ↗`} etiqueta={CASOS.visitarDe(proyecto.nombre)} />
        </div>
      </Gatillo>
    </article>
  )
}
