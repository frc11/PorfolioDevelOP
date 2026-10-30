'use client'

import { Cta } from '../_componentes/chrome/Cta'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'

import { CTA_DE_NOSOTROS, PROCESO, VALORES } from './contenido'
import { HistoriaYEquipo } from './HistoriaYEquipo'

/**
 * [L7b] EL CUERPO DE NOSOTROS — el papel después de la intro: la historia, el equipo, cómo trabajamos, los valores y el CTA. Envuelto en la
 * compuerta del home (la coreografía se instala desde 1024 y con movimiento; sin ella, todo a la vista y quieto). El cierre (Seis razones,
 * CTA, pie y FAQ) lo monta `page.tsx`.
 */
export function CuerpoDeNosotros(): React.JSX.Element {
  return (
    <CompuertaDelHome>
      <HistoriaYEquipo />

      <SeccionDePapel dato="proceso">
        <TituloQueSube titulo={PROCESO.titulo} como="h2" nivel="titulo-l" bajada={PROCESO.bajada} />
        <ol className="grid grid-cols-1 gap-[var(--spacing-6)] tablet:grid-cols-2 escritorio:grid-cols-4">
          {PROCESO.pasos.map((paso) => (
            <li key={paso.numero} className="min-w-0">
              <Gatillo desde="abajo" className="h-full" claseDelContenido="flex h-full flex-col gap-[var(--spacing-3)] border-t border-borde pt-[var(--spacing-4)]">
                <Caption como="span" interletrado="micro" className="font-codigo text-tinta-media">
                  {paso.numero}
                </Caption>
                <Titular nivel="titulo-s" como="h3">
                  {paso.titulo}
                </Titular>
                <Cuerpo>{paso.texto}</Cuerpo>
              </Gatillo>
            </li>
          ))}
        </ol>
      </SeccionDePapel>

      <SeccionDePapel dato="valores">
        <TituloQueSube titulo={VALORES.titulo} como="h2" nivel="titulo-l" />
        <ul className="grid grid-cols-1 gap-x-[var(--spacing-12)] gap-y-[var(--spacing-8)] tablet:grid-cols-2">
          {VALORES.lista.map((valor) => (
            <li key={valor.nombre} className="min-w-0">
              <Gatillo desde="abajo" claseDelContenido="flex flex-col gap-[var(--spacing-2)] border-t border-borde pt-[var(--spacing-4)]">
                <Titular nivel="titulo-s" como="h3">
                  {valor.nombre}
                </Titular>
                <Cuerpo className="max-w-[56ch]">{valor.texto}</Cuerpo>
              </Gatillo>
            </li>
          ))}
        </ul>
      </SeccionDePapel>

      <SeccionDePapel dato="cta">
        <Gatillo desde="abajo" claseDelContenido="flex flex-col items-start gap-[var(--spacing-4)]">
          <Titular nivel="titulo-l" como="h2">
            {CTA_DE_NOSOTROS.titulo}
          </Titular>
          <Cuerpo className="max-w-[48ch]">{CTA_DE_NOSOTROS.texto}</Cuerpo>
          <div data-pieza="cta-de-nosotros" data-abre-contacto="panel" className="self-start">
            <Cta rotulo={CTA_DE_NOSOTROS.rotulo} />
          </div>
        </Gatillo>
      </SeccionDePapel>
    </CompuertaDelHome>
  )
}
