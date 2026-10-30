'use client'

import { Cta } from '../_componentes/chrome/Cta'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'
import { ResenasParaElLector } from '../_secciones/por-que-develop/resenas/ResenasParaElLector'
import { PistaDeLasResenas } from '../_secciones/por-que-develop/resenas/ResenasEnLista'
import { PROYECTOS } from '../_secciones/trabajos/proyectos'

import { CasoDelPortfolio } from './CasoDelPortfolio'
import { CASOS, CTA_DEL_PORTFOLIO, TESTIMONIOS, proyectoMostrable } from './contenido'
import { DemosEnConjunto } from './DemosEnConjunto'

/**
 * [L7b] EL CUERPO DEL PORTFOLIO — el papel después de la intro: cada caso con su ficha desplegada, las demos en conjunto, los testimonios
 * (planos, una fila quieta que se desliza a mano: las reseñas del home, sin la escena) y el CTA. El cierre lo monta `page.tsx`.
 */
const PROYECTOS_MOSTRABLES = PROYECTOS.map(proyectoMostrable)

export function CuerpoDelPortfolio(): React.JSX.Element {
  return (
    <CompuertaDelHome>
      <SeccionDePapel dato="casos" claseDeContenido="gap-[var(--spacing-20)]">
        <TituloQueSube titulo={CASOS.titulo} como="h2" nivel="titulo-l" bajada={CASOS.bajada} />
        {PROYECTOS_MOSTRABLES.map((proyecto, indice) => (
          <CasoDelPortfolio key={proyecto.slug} proyecto={proyecto} indice={indice} />
        ))}
      </SeccionDePapel>

      <SeccionDePapel dato="demos">
        <DemosEnConjunto />
      </SeccionDePapel>

      <SeccionDePapel dato="testimonios">
        <TituloQueSube titulo={TESTIMONIOS.titulo} como="h2" nivel="titulo-l" bajada={TESTIMONIOS.bajada} />
        <ResenasParaElLector />
        <Gatillo desde="abajo">
          <PistaDeLasResenas quieto />
        </Gatillo>
      </SeccionDePapel>

      <SeccionDePapel dato="cta">
        <Gatillo desde="abajo" claseDelContenido="flex flex-col items-start gap-[var(--spacing-4)]">
          <Titular nivel="titulo-l" como="h2">
            {CTA_DEL_PORTFOLIO.titulo}
          </Titular>
          <Cuerpo className="max-w-[48ch]">{CTA_DEL_PORTFOLIO.texto}</Cuerpo>
          <div data-pieza="cta-del-portfolio" data-abre-contacto="panel" className="self-start">
            <Cta rotulo={CTA_DEL_PORTFOLIO.rotulo} />
          </div>
        </Gatillo>
      </SeccionDePapel>
    </CompuertaDelHome>
  )
}
