'use client'

import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { CONTENIDO } from '../../_secciones/trabajos/contenido'
import { Ficha, piezasDeLaFicha } from '../../_secciones/trabajos/portfolio/Ficha'
import { enLaSecuencia } from '../../_secciones/trabajos/portfolio/secuencia'
import { estiloDeLaMarca } from '../../_secciones/trabajos/portfolio/Tira'
import { PROYECTOS, type ProyectoDelPortfolio } from '../../_secciones/trabajos/proyectos'
import { useAlCruzar } from '../_lab/useAlCruzar'

/**
 * [L7e · P1] CADA CASO, UNA FICHA ABIERTA — la tira activa del acordeón del Portfolio, abierta para siempre: el video del trabajo
 * clavado a un costado mientras la ficha (la del home, `Ficha`, importada) entra fila por fila al otro. Cada caso es una franja de
 * NOCHE sobre el papel del día (la sección invertida): en el sitio la noche es donde se muestra el trabajo. Una raya del color de la
 * marca del cliente dice de quién es. Abajo de 1024, uno debajo del otro, sin clavar.
 */
export function FichasAbiertas(): React.JSX.Element {
  return (
    <>
      <header className="mx-auto max-w-6xl px-6 pt-36 pb-20 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Portfolio · los casos</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Lo que hicimos</span>
          <span className="block font-liviano tracking-titulo italic uppercase">y para quién</span>
        </h1>
        <p className="mt-6 max-w-xl text-cuerpo leading-texto">{CONTENIDO.bajada}</p>
      </header>
      {PROYECTOS.map((p, i) => (
        <Caso key={p.slug} proyecto={p} indice={i} />
      ))}
      <div className="h-[40svh]" />
    </>
  )
}

function Caso({ proyecto, indice }: { readonly proyecto: ProyectoDelPortfolio; readonly indice: number }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const ficha = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const alCambiar = useCallback((adentro: boolean) => setVisible(adentro), [])
  useAlCruzar(ficha, alCambiar, true, 0.8, 0.95)
  const piezas = piezasDeLaFicha(proyecto)
  return (
    <section data-seccion="invertida" aria-labelledby={`caso-${proyecto.slug}`} className="relative bg-fondo text-tinta">
      {/* La raya de la marca: de punta a punta del caso, a la izquierda. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5" style={{ background: proyecto.colorDeMarca }} />
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 escritorio:h-[160svh] escritorio:grid-cols-[1.35fr_1fr] escritorio:gap-16">
        <div className="escritorio:sticky escritorio:top-[16svh] escritorio:self-start">
          <Video proyecto={proyecto} />
        </div>
        <div ref={ficha} className="escritorio:sticky escritorio:top-[16svh] escritorio:self-start">
          <p className="font-codigo text-caption text-tinta-media">{String(indice + 1).padStart(2, '0')} / {String(PROYECTOS.length).padStart(2, '0')}</p>
          <h2 id={`caso-${proyecto.slug}`} className="mt-2 font-display text-titulo-l font-fuerte leading-titulo tracking-display uppercase">
            {proyecto.nombre}
          </h2>
          {proyecto.rubro === null ? null : <p className="mt-1 mb-8 text-cuerpo text-tinta-media">{proyecto.rubro}</p>}
          <Ficha proyecto={proyecto} visible={visible} reducido={reducido} desde={0} />
          <motion.div className="mt-10" style={estiloDeLaMarca(proyecto)} {...enLaSecuencia(visible, piezas, reducido)}>
            <CtaEnlace href={proyecto.url} rotulo={`${CONTENIDO.ficha.visitar} ↗`} etiqueta={`${CONTENIDO.ficha.visitar} de ${proyecto.nombre}, ${CONTENIDO.ficha.abreAparte}`} externo />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/** El recorrido del sitio del cliente: corre sólo mientras se ve (el resto del tiempo, quieto en su póster). */
function Video({ proyecto }: { readonly proyecto: ProyectoDelPortfolio }): React.JSX.Element {
  const video = useRef<HTMLVideoElement>(null)
  const reducido = usePrefiereMenosMovimiento()
  useEffect(() => {
    const v = video.current
    if (v === null || reducido) return undefined
    const mira = new IntersectionObserver(([e]) => {
      if (e?.isIntersecting === true) void v.play().catch(() => undefined)
      else v.pause()
    }, { threshold: 0.25 })
    mira.observe(v)
    return () => mira.disconnect()
  }, [reducido])
  return (
    <video
      ref={video}
      muted
      loop
      playsInline
      preload="metadata"
      poster={proyecto.medios.poster.escritorio}
      aria-label={proyecto.alt}
      className="block aspect-[16/10] w-full rounded-medio bg-superficie-1 object-cover"
    >
      <source src={proyecto.medios.video.escritorio} type="video/mp4" />
    </video>
  )
}
