'use client'

import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { CtaEnlace } from '../_componentes/chrome/Cta'
import { Imagen } from '../_componentes/medios/Imagen'
import { useAlCruzar } from '../_componentes/pagina/alCruzar'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { usePrefiereMenosMovimiento } from '../_lib/usePrefiereMenosMovimiento'
import { enLaSecuencia } from '../_secciones/trabajos/portfolio/secuencia'
import type { ProyectoDelPortfolio } from '../_secciones/trabajos/proyectos'

import { CASOS, MARCA_SOBRE_EL_PAPEL, RELATOS } from './contenido'

const ALTO_DEL_POSTER = 1000
const ANCHO_DEL_POSTER = 1600
const SIZES_DEL_CASO = '(min-width: 1024px) 55vw, 100vw'

/** [M1] De qué lado va el medio: el primer caso a la izquierda, el segundo a la derecha, el tercero a la izquierda (Valentino). */
export const ladoDelMedio = (indice: number): 'izquierda' | 'derecha' => (indice % 2 === 0 ? 'izquierda' : 'derecha')

/** El recorrido del sitio del cliente: corre sólo mientras se ve (el resto del tiempo, quieto en su póster); con movimiento reducido, el póster. */
function RecorridoDelCaso({ proyecto }: { readonly proyecto: ProyectoDelPortfolio }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const video = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    const el = video.current
    if (el === null || reducido) return undefined
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting === true) void el.play().catch(() => undefined)
        else el.pause()
      },
      { threshold: 0.25 },
    )
    observador.observe(el)
    return () => observador.disconnect()
  }, [reducido])
  return (
    <div data-parte="recorrido" className="overflow-hidden rounded-[var(--radius-fuerte)] border border-borde bg-tinta/5 shadow-flotante">
      {reducido ? (
        <Imagen src={proyecto.medios.poster.escritorio} alt={proyecto.alt} ancho={ANCHO_DEL_POSTER} alto={ALTO_DEL_POSTER} sizes={SIZES_DEL_CASO} />
      ) : (
        <video ref={video} muted loop playsInline preload="metadata" poster={proyecto.medios.poster.escritorio} aria-label={proyecto.alt} className="aspect-[16/10] h-auto w-full object-cover" src={proyecto.medios.video.escritorio} />
      )}
    </div>
  )
}

/**
 * [L7b] UN CASO DEL PORTFOLIO. [M1] El mecanismo del prototipo 3 (`fichas-abiertas`) sin su contenido: desde 1024 el recorrido del sitio
 * queda CLAVADO con su texto mientras el caso pasa (las dos columnas, fijas arriba, en una caja más alta que la pantalla), y el texto entra
 * con el ritmo de la ficha del home (`enLaSecuencia`: el encabezado y, escalonados, los párrafos, los detalles y el enlace) cuando su
 * encabezado cruza la línea. En el PAPEL, como el resto de la página (la franja de noche se fue), con los lados alternados, y en vez de la
 * ficha del home, un título propio, un texto escrito y dos detalles (rubro y fecha), más «Visitar sitio» en el color de la marca pasado a
 * AA sobre el papel. La reseña, sólo si es real (hoy ninguna lo es: no se muestra nada). El `id` es el deep link de las reseñas.
 */
export function CasoDelPortfolio({ proyecto, indice, total }: { readonly proyecto: ProyectoDelPortfolio; readonly indice: number; readonly total: number }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const encabezado = useRef<HTMLElement>(null)
  const [visible, setVisible] = useState(false)
  const alCambiar = useCallback((adentro: boolean) => setVisible(adentro), [])
  useAlCruzar(encabezado, alCambiar, true, 0.85, 0.97)
  const relato = RELATOS[proyecto.slug]
  const marca = { '--color-tinta': MARCA_SOBRE_EL_PAPEL[proyecto.slug] } as React.CSSProperties
  const aLaDerecha = ladoDelMedio(indice) === 'derecha'
  const detalles = [proyecto.rubro, proyecto.fecha].filter((d): d is string => d !== null)
  // El orden de la secuencia: 0 el encabezado, después los párrafos, la reseña (si hay) y los detalles con el enlace.
  const ordenDeLaResena = relato.parrafos.length + 1
  const ordenDelFinal = ordenDeLaResena + (proyecto.resena === null ? 0 : 1)
  return (
    <article
      id={`portfolio-${proyecto.slug}`}
      data-caso={proyecto.slug}
      data-lado-del-medio={ladoDelMedio(indice)}
      aria-labelledby={`caso-${proyecto.slug}`}
      className="grid scroll-mt-[var(--spacing-20)] grid-cols-1 gap-[var(--spacing-8)] escritorio:h-[150svh] escritorio:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] escritorio:gap-[var(--spacing-16)]"
    >
      <div className={cn('min-w-0 escritorio:sticky escritorio:top-[14svh] escritorio:self-start', aLaDerecha && 'escritorio:order-2')}>
        <RecorridoDelCaso proyecto={proyecto} />
      </div>
      <div className={cn('flex min-w-0 flex-col gap-[var(--spacing-5)] escritorio:sticky escritorio:top-[14svh] escritorio:self-start', aLaDerecha && 'escritorio:order-1')}>
        <motion.header ref={encabezado} className="flex flex-col gap-[var(--spacing-2)]" {...enLaSecuencia(visible, 0, reducido)}>
          <Caption como="p" interletrado="micro" className="font-codigo uppercase text-tinta-media">
            {`${String(indice + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')} · ${proyecto.nombre}`}
          </Caption>
          <Titular nivel="titulo-m" como="h3" id={`caso-${proyecto.slug}`}>
            {relato.titulo}
          </Titular>
        </motion.header>
        {relato.parrafos.map((p, i) => (
          <motion.div key={p.slice(0, 32)} {...enLaSecuencia(visible, i + 1, reducido)}>
            <Cuerpo>{p}</Cuerpo>
          </motion.div>
        ))}
        {proyecto.resena === null ? null : (
          <motion.figure className="border-l border-borde pl-[var(--spacing-4)]" {...enLaSecuencia(visible, ordenDeLaResena, reducido)}>
            <blockquote>
              <Cuerpo>{`«${proyecto.resena.texto}»`}</Cuerpo>
            </blockquote>
            <figcaption>
              <Caption como="span" className="text-tinta-media">
                {proyecto.resena.autor}
              </Caption>
            </figcaption>
          </motion.figure>
        )}
        <motion.div className="flex flex-wrap items-center gap-x-[var(--spacing-6)] gap-y-[var(--spacing-3)]" {...enLaSecuencia(visible, ordenDelFinal, reducido)}>
          {detalles.length === 0 ? null : (
            <Caption como="p" interletrado="micro" className="font-codigo uppercase text-tinta-media">
              {detalles.join(' · ')}
            </Caption>
          )}
          <div style={marca}>
            <CtaEnlace href={proyecto.url} externo rotulo={`${CASOS.visitar} ↗`} etiqueta={CASOS.visitarDe(proyecto.nombre)} />
          </div>
        </motion.div>
      </div>
    </article>
  )
}
