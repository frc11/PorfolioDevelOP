'use client'

import { Cta } from '../../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { SeccionDePapel } from '../../_componentes/pagina/SeccionDePapel'
import { Caption, Cuerpo } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { CompuertaDelHome } from '../../_secciones/CompuertaDelHome'
import { Gatillo } from '../../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../../_secciones/_contrato/TituloQueSube'

import { fechaLarga, minutosDeLectura, notasRelacionadas, rutaDeLaNota } from '../_notas/indice'
import type { Nota } from '../_notas/tipos'
import { PortadaDeNota } from '../PortadaDeNota'

/**
 * [L7c] EL CUERPO DE UNA NOTA — una columna angosta de lectura con el tipo de cuerpo del sitio (título, fecha y tiempo de lectura, la introducción,
 * los subtítulos y el cierre), después las notas relacionadas y el CTA. El título de la nota es el `h2` de la columna: el `h1` de la página es el
 * título 3D de la intro («Blog», el mismo de todo el blog).
 */
const COLUMNA = 'mx-auto flex w-full max-w-[68ch] flex-col gap-[var(--spacing-4)]'

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
            <PortadaDeNota nota={nota} className="mt-[var(--spacing-4)] rounded-[var(--radius-fuerte)]" />
          </header>
          {nota.introduccion.map((p) => (
            <Cuerpo key={p} className="leading-relaxed">
              {p}
            </Cuerpo>
          ))}
          {nota.secciones.map((s) => (
            <section key={s.subtitulo} className="flex flex-col gap-[var(--spacing-3)] pt-[var(--spacing-6)]">
              <Titular nivel="titulo-s" como="h3">
                {s.subtitulo}
              </Titular>
              {s.parrafos.map((p) => (
                <Cuerpo key={p} className="leading-relaxed">
                  {p}
                </Cuerpo>
              ))}
            </section>
          ))}
          <Cuerpo className="pt-[var(--spacing-6)] font-semi leading-relaxed">{nota.cierre}</Cuerpo>
          <div data-pieza="cta-de-la-nota" data-abre-contacto="panel" className="self-start pt-[var(--spacing-2)]">
            <Cta rotulo="Hablemos" />
          </div>
        </article>
      </SeccionDePapel>

      <SeccionDePapel dato="relacionadas">
        <TituloQueSube titulo="Notas relacionadas" como="h2" nivel="titulo-l" />
        <ul data-pieza="notas-relacionadas" className="grid grid-cols-1 gap-[var(--spacing-8)] tablet:grid-cols-3">
          {relacionadas.map((r) => (
            <li key={r.slug} className="min-w-0">
              <Gatillo desde="abajo" claseDelContenido="h-full">
                <EnlaceDeRuta href={rutaDeLaNota(r)} className="group flex h-full flex-col gap-[var(--spacing-3)]">
                  <PortadaDeNota nota={r} className="rounded-[var(--radius-fuerte)]" />
                  <Titular nivel="titulo-s" como="h3" className="group-hover:underline group-focus-visible:underline">
                    {r.titulo}
                  </Titular>
                  <Cuerpo>{r.resumen}</Cuerpo>
                </EnlaceDeRuta>
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
