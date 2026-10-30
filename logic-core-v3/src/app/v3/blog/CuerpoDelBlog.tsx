'use client'

import { Cta } from '../_componentes/chrome/Cta'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'

import { CarruselDeDestacadas } from './CarruselDeDestacadas'
import { NotasEnDesorden } from './NotasEnDesorden'

/**
 * [L7c] EL CUERPO DEL BLOG — el papel después de la intro: el carrusel de destacadas a todo el ancho, todas las notas en lugares irregulares y el
 * CTA. Sin categorías. El cierre (Seis razones, CTA, pie y FAQ) lo monta `page.tsx`.
 */
export function CuerpoDelBlog(): React.JSX.Element {
  return (
    <CompuertaDelHome>
      <SeccionDePapel dato="destacadas">
        <TituloQueSube titulo="Notas destacadas" como="h2" nivel="titulo-l" />
        <CarruselDeDestacadas />
      </SeccionDePapel>

      <SeccionDePapel dato="todas">
        <TituloQueSube titulo="Todas las notas" como="h2" nivel="titulo-l" bajada="Guías cortas y concretas para dueños de negocios, sin tecnicismos." />
        <NotasEnDesorden />
      </SeccionDePapel>

      <SeccionDePapel dato="cta">
        <Gatillo desde="abajo" claseDelContenido="flex flex-col items-start gap-[var(--spacing-4)]">
          <Titular nivel="titulo-l" como="h2">
            ¿Tenés una duda para tu negocio?
          </Titular>
          <Cuerpo className="max-w-[48ch]">Contanos qué estás pensando y te respondemos nosotros, sin compromiso.</Cuerpo>
          <div data-pieza="cta-del-blog" data-abre-contacto="panel" className="self-start">
            <Cta rotulo="Hablemos" />
          </div>
        </Gatillo>
      </SeccionDePapel>
    </CompuertaDelHome>
  )
}
