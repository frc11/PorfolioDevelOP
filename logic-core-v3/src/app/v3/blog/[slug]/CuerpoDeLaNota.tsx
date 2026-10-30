'use client'

import { Fragment } from 'react'

import { Cta } from '../../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { SeccionDePapel } from '../../_componentes/pagina/SeccionDePapel'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorViewport } from '../../_lib/imagen'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../../_secciones/_contrato/TituloQueSube'

import { fechaLarga, lugarDelDestacado, minutosDeLectura, notasRelacionadas } from '../_notas/indice'
import type { Nota } from '../_notas/tipos'
import { TitularQueSeLevantaAlCruzar } from '../_movimiento/TitularQueSeLevantaAlCruzar'
import { FotoDeNota } from '../FotoDeNota'
import { TarjetaDeNota } from '../TarjetaDeNota'

import { FraseDestacada } from './FraseDestacada'
import { HiloDeLectura } from './HiloDeLectura'

/**
 * [L7c] EL CUERPO DE UNA NOTA — una columna angosta de lectura con el tipo de cuerpo del sitio (título, fecha y tiempo de lectura, la foto, la
 * introducción, los subtítulos y el cierre), después las notas relacionadas y el CTA. El título de la nota es el `h2` de la columna: el `h1` de
 * la página es el título 3D de la intro («Blog», el mismo de todo el blog).
 *
 * [M2] Lo que Valentino eligió del prototipo de la nota: los subtítulos SE LEVANTAN al cruzar la línea, la frase destacada SE PINTA y el HILO
 * de lectura, ahora al costado del texto y bien a la vista (`HiloDeLectura`). El tiempo de lectura es información y nada más (sin el tachado).
 */
const COLUMNA = 'mx-auto flex w-full max-w-[68ch] flex-col gap-[var(--spacing-4)]'

function Parrafos({ parrafos, seccion, nota }: { readonly parrafos: readonly string[]; readonly seccion: number; readonly nota: Nota }): React.JSX.Element {
  const lugar = lugarDelDestacado(nota)
  return (
    <>
      {parrafos.map((p, i) => (
        <Fragment key={p}>
          <Cuerpo className="leading-relaxed">{p}</Cuerpo>
          {lugar !== null && lugar.seccion === seccion && lugar.parrafo === i ? <FraseDestacada frase={nota.destacado} /> : null}
        </Fragment>
      ))}
    </>
  )
}

export function CuerpoDeLaNota({ nota }: { readonly nota: Nota }): React.JSX.Element {
  const relacionadas = notasRelacionadas(nota)
  return (
    <CompuertaDelHome>
      <SeccionDePapel dato="nota">
        <article className={COLUMNA}>
          <header className="flex flex-col gap-[var(--spacing-3)] pb-[var(--spacing-4)]">
            <Caption como="p" interletrado="micro" className="font-codigo uppercase text-tinta-media">
              <time dateTime={nota.fecha}>{fechaLarga(nota.fecha)}</time> · {minutosDeLectura(nota)} min de lectura
            </Caption>
            <Titular nivel="titulo-l" como="h2">
              {nota.titulo}
            </Titular>
            <FotoDeNota nota={nota} sizes={sizesPorViewport(50, 92)} className="mt-[var(--spacing-4)] aspect-[3/2] w-full" />
          </header>
          <HiloDeLectura>
            <div className="flex flex-col gap-[var(--spacing-4)]">
              <Parrafos parrafos={nota.introduccion} seccion={-1} nota={nota} />
              {nota.secciones.map((s, i) => (
                <section key={s.subtitulo} data-hito="" className="flex flex-col gap-[var(--spacing-3)] pt-[var(--spacing-6)]">
                  <TitularQueSeLevantaAlCruzar nivel="titulo-s" como="h3">
                    {s.subtitulo}
                  </TitularQueSeLevantaAlCruzar>
                  <Parrafos parrafos={s.parrafos} seccion={i} nota={nota} />
                </section>
              ))}
              <Cuerpo className="pt-[var(--spacing-6)] font-semi leading-relaxed">{nota.cierre}</Cuerpo>
            </div>
          </HiloDeLectura>
          <div data-pieza="cta-de-la-nota" data-abre-contacto="panel" className="self-start pt-[var(--spacing-2)]">
            <Cta rotulo="Hablemos" />
          </div>
        </article>
      </SeccionDePapel>

      <SeccionDePapel dato="relacionadas">
        <TituloQueSube titulo="Notas relacionadas" como="h2" nivel="titulo-l" />
        <ul data-pieza="notas-relacionadas" className="grid grid-cols-1 gap-x-[var(--spacing-8)] gap-y-[var(--spacing-16)] tablet:grid-cols-3">
          {relacionadas.map((r) => (
            <li key={r.slug} className="min-w-0">
              <Gatillo desde="abajo">
                <TarjetaDeNota nota={r} forma="aspect-[4/3]" nivel="titulo-s" sizes={sizesPorViewport(30, 92)} />
              </Gatillo>
            </li>
          ))}
        </ul>
        <EnlaceDeRuta href="/v3/blog" className="self-start font-semi underline underline-offset-4">
          Ver todas las notas
        </EnlaceDeRuta>
      </SeccionDePapel>
    </CompuertaDelHome>
  )
}
