'use client'

import { motion, useMotionValue, useTransform } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { CtaEnlace } from '../../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { Trazo } from '../../_secciones/_contrato/canales'
import { CoreografiaEnTodoAncho } from '../../_secciones/_contrato/coreografia'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { PRESENCIA_DEL_ENCABEZADO } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { TitularQueSeLevanta, usePresencia } from '../../_secciones/trabajos/portfolio/levantarse'
import { NOTAS } from '../_lab/notas'
import { useAlCruzar } from '../_lab/useAlCruzar'
import { PalabrasPintables, estiloDelBloquePintado, usePintadoDelBloque } from '../_lab/usePintadoDelBloque'
import { NOTA, type BloqueDeLaNota } from './texto'

/** Palabras por minuto para estimar la lectura (la cifra sale del texto, no se inventa). */
const PALABRAS_POR_MINUTO = 200
const PALABRAS = NOTA.bloques.reduce((n, b) => n + b.texto.split(' ').length, NOTA.titulo.split(' ').length)
const MINUTOS = Math.max(1, Math.round(PALABRAS / PALABRAS_POR_MINUTO))

/**
 * [L7e · L1 + L2] LA NOTA CON SU HILO — la página de una nota: la columna angosta de lectura y tres piezas del home puestas a leer.
 *   · El HILO: arriba de todo, la raya del `Trazo` (su grosor y su tinta) que se dibuja de izquierda a derecha a medida que leés.
 *   · Los SUBTÍTULOS se levantan al cruzar la línea (`TitularQueSeLevanta`), y la frase destacada se PINTA palabra por palabra.
 *   · El tiempo de lectura se TACHA al llegar al final y queda «Leída»: el tachado del titular de Quiénes somos (L2).
 * Al final, las notas relacionadas y el CTA al contacto. Con movimiento reducido, todo quieto y dibujado.
 */
export function Nota(): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const articulo = useRef<HTMLElement>(null)
  const hilo = useRef<HTMLSpanElement>(null)
  const lectura = useMotionValue(0)
  // El tachado del tiempo de lectura corre en el último 8 % de la nota (entra como 0,5 → 1: la mitad en la que el Trazo tacha).
  const tachado = useTransform(lectura, (v) => 0.5 + Math.min(1, Math.max(0, (v - 0.92) / 0.08)) * 0.5)
  const leida = useTransform(lectura, [0.97, 1], [0, 1])
  useEffect(() => {
    const el = articulo.current
    if (el === null) return undefined
    let pedido = 0
    const medir = (): void => {
      pedido = 0
      const caja = el.getBoundingClientRect()
      const recorrido = caja.height - window.innerHeight * 0.6
      const v = recorrido > 0 ? Math.min(1, Math.max(0, -caja.top / recorrido)) : 1
      lectura.set(v)
      if (hilo.current !== null) hilo.current.style.transform = `scaleX(${v.toFixed(4)})`
    }
    const pedir = (): void => {
      if (pedido === 0) pedido = requestAnimationFrame(medir)
    }
    window.addEventListener('scroll', pedir, { passive: true })
    window.addEventListener('resize', pedir)
    medir()
    return () => {
      window.removeEventListener('scroll', pedir)
      window.removeEventListener('resize', pedir)
      if (pedido !== 0) cancelAnimationFrame(pedido)
    }
  }, [lectura])

  const relacionadas = NOTAS.filter((n) => n.titulo !== NOTA.titulo).slice(0, 2)
  return (
    <CompuertaDelHome>
      <CoreografiaEnTodoAncho>
        {/* El hilo: la raya del Trazo, fija arriba de todo, del ancho de la pantalla. */}
        <span aria-hidden="true" className="fixed inset-x-0 top-0 z-40 block h-[calc(var(--border-hairline)*3)] origin-left bg-tinta-media" ref={hilo} style={{ transform: 'scaleX(0)' }} />
        <article ref={articulo} className="mx-auto max-w-[42rem] px-6 pt-36 pb-24 escritorio:pt-44">
          <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Blog · nota {NOTA.numero}</p>
          <h1 className="mt-4 text-titulo-m leading-titulo escritorio:text-titulo-l">{NOTA.titulo}</h1>
          <p className="mt-4 text-base leading-texto text-tinta-media">{NOTA.bajada}</p>
          <p className="mt-6 flex items-center gap-3 font-codigo text-caption text-tinta-media uppercase">
            <Trazo progreso={reducido ? null : tachado} tipo="tachado">
              {`${String(MINUTOS)} min de lectura`}
            </Trazo>
            <motion.span style={reducido ? { opacity: 0 } : { opacity: leida }} className="text-tinta">
              Leída
            </motion.span>
          </p>
          <div className="mt-14 space-y-6">
            {NOTA.bloques.map((b, i) => (
              <Bloque key={i} bloque={b} reducido={reducido} />
            ))}
          </div>
        </article>
        <aside aria-label="Seguí leyendo" className="mx-auto max-w-5xl px-6 pb-48">
          <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Seguí leyendo</p>
          <ul className="mt-4 grid gap-4 tablet:grid-cols-2">
            {relacionadas.map((n) => (
              <li key={n.id}>
                <EnlaceDeRuta href="/v3/laboratorio/notas-irregulares" className="group block h-full rounded-fuerte border border-borde bg-superficie-1 p-6 no-underline">
                  <span className="block text-titulo-s leading-titulo underline-offset-4 group-hover:underline">{n.titulo}</span>
                  <span className="mt-2 block text-cuerpo text-tinta-media">{n.bajada}</span>
                </EnlaceDeRuta>
              </li>
            ))}
          </ul>
          <div className="mt-16 flex flex-col items-start gap-4">
            <p className="text-titulo-s leading-titulo">¿Te quedó una duda sobre tu caso?</p>
            <CtaEnlace href="#contacto" rotulo="Hablemos" abreElContacto="panel" />
          </div>
        </aside>
      </CoreografiaEnTodoAncho>
    </CompuertaDelHome>
  )
}

function Bloque({ bloque, reducido }: { readonly bloque: BloqueDeLaNota; readonly reducido: boolean }): React.JSX.Element {
  if (bloque.tipo === 'subtitulo') return <Subtitulo texto={bloque.texto} reducido={reducido} />
  if (bloque.tipo === 'destacado') return <Destacado texto={bloque.texto} reducido={reducido} />
  return <p className="text-base leading-texto">{bloque.texto}</p>
}

function Subtitulo({ texto, reducido }: { readonly texto: string; readonly reducido: boolean }): React.JSX.Element {
  const caja = useRef<HTMLHeadingElement>(null)
  const [adentro, setAdentro] = useState(false)
  const alCambiar = useCallback((a: boolean) => setAdentro(a), [])
  useAlCruzar(caja, alCambiar, !reducido, 0.85, 0.95)
  const presencia = usePresencia(adentro || reducido, reducido, PRESENCIA_DEL_ENCABEZADO)
  return (
    <h2 ref={caja} className="overflow-hidden pt-8 font-display text-titulo-m leading-titulo font-fuerte tracking-display uppercase">
      <TitularQueSeLevanta presencia={presencia}>{texto}</TitularQueSeLevanta>
    </h2>
  )
}

function Destacado({ texto, reducido }: { readonly texto: string; readonly reducido: boolean }): React.JSX.Element {
  const caja = useRef<HTMLQuoteElement>(null)
  usePintadoDelBloque(caja, !reducido, 0.55)
  return (
    <blockquote ref={caja} className="my-10 border-l-[length:calc(var(--border-hairline)*3)] border-tinta pl-6 text-titulo-s leading-titulo escritorio:-mx-16 escritorio:text-titulo-m" style={estiloDelBloquePintado()}>
      <PalabrasPintables texto={texto} />
    </blockquote>
  )
}

