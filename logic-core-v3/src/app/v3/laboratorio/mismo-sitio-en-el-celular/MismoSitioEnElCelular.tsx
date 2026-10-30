'use client'

import { useEffect, useRef, useState } from 'react'

import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { TEXTO_DEL_MEDIO, TITULO_DEL_SERVICIO } from '../../_secciones/servicios/escenario/datos'
import { PROYECTOS, type ProyectoDelPortfolio } from '../../_secciones/trabajos/proyectos'

/** Las proporciones de las dos pantallas: la de los videos de escritorio (16:10) y la de un teléfono (9:19,5). */
const ESCRITORIO = 16 / 10
const TELEFONO = 9 / 19.5
/** Dónde se cruzan los dos videos (en el avance del angostamiento). */
const CRUCE = { desde: 0.45, hasta: 0.62 } as const

/** Una curva suave para el angostamiento: arranca y termina despacio, como la `simetrica` del sitio. */
const suave = (t: number): number => t * t * (3 - 2 * t)

/**
 * [L7e · W2] EL MISMO SITIO EN EL CELULAR — «Pensamos cada pantalla para que … se vea bien en el celular, que es donde te van a
 * encontrar». La pantalla de escritorio de un trabajo real se ANGOSTA con el scroll hasta ser un teléfono, y en el medio el video de
 * escritorio cede al video móvil del mismo sitio (los dos ya existen por trabajo: `mediosDe`). Es la tira del acordeón del Portfolio
 * que cambia de ancho, usada para decir una cosa: es el mismo sitio. El escenario queda clavado mientras se angosta; se puede elegir el
 * trabajo. Con movimiento reducido, los dos lado a lado, quietos.
 */
export function MismoSitioEnElCelular(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const [proyecto, setProyecto] = useState<ProyectoDelPortfolio>(PROYECTOS[0])
  const recorrido = useRef<HTMLDivElement>(null)
  const marco = useRef<HTMLDivElement>(null)
  const movil = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const caja = recorrido.current
    const m = marco.current
    const v = movil.current
    if (caja === null || m === null || v === null || reducido) return undefined
    let pedido = 0
    const dibujar = (): void => {
      pedido = 0
      const r = caja.getBoundingClientRect()
      const total = r.height - window.innerHeight
      const t = suave(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1)
      // La pantalla: de un escritorio que entra en el cuadro a un teléfono del 74 % del alto.
      const altoTelefono = window.innerHeight * 0.74
      const anchoEscritorio = Math.min(window.innerWidth * 0.88, 1080, altoTelefono * ESCRITORIO)
      const anchoTelefono = altoTelefono * TELEFONO
      const ancho = anchoEscritorio + (anchoTelefono - anchoEscritorio) * t
      const alto = anchoEscritorio / ESCRITORIO + (altoTelefono - anchoEscritorio / ESCRITORIO) * t
      m.style.width = `${ancho.toFixed(1)}px`
      m.style.height = `${alto.toFixed(1)}px`
      m.style.borderRadius = `${(10 + 26 * t).toFixed(1)}px`
      v.style.opacity = Math.min(1, Math.max(0, (t - CRUCE.desde) / (CRUCE.hasta - CRUCE.desde))).toFixed(3)
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(dibujar)
    }
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    dibujar()
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [reducido, proyecto.slug])

  const titulo = TITULO_DEL_SERVICIO.web
  const medios = proyecto.medios
  return (
    <div data-servicio="web">
      <header className="mx-auto max-w-6xl px-6 pt-36 pb-8 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-acento uppercase">Desarrollo web · en el celular</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">{titulo.derecho}</span>
          <span className="block font-liviano tracking-titulo italic uppercase">{titulo.cursiva}</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base leading-texto">{TEXTO_DEL_MEDIO.web[1]}</p>
        <div role="group" aria-label="Elegí el trabajo" className="mt-6 flex flex-wrap gap-2">
          {PROYECTOS.map((p) => (
            <button
              key={p.slug}
              type="button"
              aria-pressed={p.slug === proyecto.slug}
              onClick={() => setProyecto(p)}
              className={`rounded-full border px-4 py-1.5 text-cuerpo transition-colors duration-[var(--duracion-rapida)] ease-[var(--ease-salida)] ${p.slug === proyecto.slug ? 'border-tinta bg-tinta text-fondo' : 'border-borde text-tinta'}`}
            >
              {p.nombre}
            </button>
          ))}
        </div>
      </header>
      {reducido ? (
        <div className="mx-auto flex max-w-6xl flex-wrap items-end gap-6 px-6 pb-40">
          <video key={`e-${proyecto.slug}`} muted loop playsInline poster={medios.poster.escritorio} className="aspect-[16/10] w-full max-w-3xl rounded-medio object-cover" aria-label={proyecto.alt}>
            <source src={medios.video.escritorio} type="video/mp4" />
          </video>
          <video key={`m-${proyecto.slug}`} muted loop playsInline poster={medios.poster.movil} className="aspect-[9/19.5] w-40 rounded-fuerte object-cover" aria-label={proyecto.alt}>
            <source src={medios.video.movil} type="video/mp4" />
          </video>
        </div>
      ) : (
        <div ref={recorrido} className="h-[300svh]">
          <div className="sticky top-0 flex h-svh items-center justify-center">
            <div ref={marco} className="relative overflow-hidden bg-tinta shadow-2xl shadow-tinta/30 ring-[6px] ring-tinta" style={{ width: '88vw', height: '55vw', borderRadius: 10, willChange: 'width, height' }}>
              <video key={`e-${proyecto.slug}`} autoPlay muted loop playsInline poster={medios.poster.escritorio} className="absolute inset-0 size-full object-cover object-top" aria-label={proyecto.alt}>
                <source src={medios.video.escritorio} type="video/mp4" />
              </video>
              <video ref={movil} key={`m-${proyecto.slug}`} autoPlay muted loop playsInline poster={medios.poster.movil} className="absolute inset-0 size-full object-cover object-top" style={{ opacity: 0 }} aria-hidden="true">
                <source src={medios.video.movil} type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
      <p className="mx-auto max-w-2xl px-6 pb-48 text-center text-titulo-s leading-titulo">
        El mismo sitio. Pensado para las dos pantallas desde el principio, no achicado después.
      </p>
    </div>
  )
}
