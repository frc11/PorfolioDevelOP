'use client'

import { Cta } from '../_componentes/chrome/Cta'
import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { CompuertaDelHome } from '../_secciones/CompuertaDelHome'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'

import { ComoTrabajamos } from './ComoTrabajamos'
import { CTA_DE_NOSOTROS, VALORES } from './contenido'
import { Equipo } from './Equipo'
import { Historia } from './Historia'

/**
 * [L7b] EL CUERPO DE NOSOTROS — el papel después de la intro: la historia, el equipo, cómo trabajamos, los valores y el CTA. Envuelto en la
 * compuerta del home (la coreografía se instala desde 1024 y con movimiento; sin ella, todo a la vista y quieto). El cierre (Seis razones,
 * CTA, pie y FAQ) lo monta `page.tsx`. [M1] La historia sube y pinta sólo tres frases, el equipo es el de las dos tomas (con la facultad
 * al final) y cómo trabajamos es la línea que baja y subraya cada paso.
 */
export function CuerpoDeNosotros(): React.JSX.Element {
  return (
    <CompuertaDelHome>
      <Historia />
      <Equipo />
      <ComoTrabajamos />

      <SeccionDePapel dato="valores">
        <TituloQueSube titulo={VALORES.titulo} como="h2" nivel="titulo-l" />
        <ul className="grid grid-cols-1 gap-x-[var(--spacing-12)] gap-y-[var(--spacing-8)] tablet:grid-cols-2 escritorio:grid-cols-3">
          {VALORES.lista.map((valor) => (
            <li key={valor.nombre} className="min-w-0">
              <Gatillo desde="abajo" claseDelContenido="flex flex-col gap-[var(--spacing-2)] border-t border-borde pt-[var(--spacing-4)]">
                <Titular nivel="titulo-s" como="h3">
                  {valor.nombre}
                </Titular>
                <Cuerpo>{valor.texto}</Cuerpo>
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
          <EnlaceDeRuta href="/v3/portfolio" className="self-start font-semi underline underline-offset-4">
            Ver nuestros trabajos
          </EnlaceDeRuta>
        </Gatillo>
      </SeccionDePapel>
    </CompuertaDelHome>
  )
}
