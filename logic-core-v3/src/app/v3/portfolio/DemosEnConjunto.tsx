'use client'

import { Imagen } from '../_componentes/medios/Imagen'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Gatillo } from '../_secciones/_contrato/Gatillo'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'
import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA } from '../_secciones/trabajos/demos/catalogo'

import { DEMOS } from './contenido'

/**
 * [L7b] LAS DEMOS EN CONJUNTO — un bloque que explica qué son (sitios de ejemplo para negocios ficticios, adaptables a cualquier rubro) y
 * cómo se abren, con las cinco portadas del catálogo del home. Cada una abre su demo en una pestaña nueva, como la rama táctil del home
 * (la ventana con el efecto vive en la escena del home y no existe en una página de papel).
 */
export function DemosEnConjunto(): React.JSX.Element {
  return (
    <>
      <div className="flex max-w-[64ch] flex-col gap-[var(--spacing-4)]">
        <TituloQueSube titulo={DEMOS.titulo} como="h2" nivel="titulo-l" />
        <Gatillo desde="abajo" claseDelContenido="flex flex-col gap-[var(--spacing-3)]">
          {DEMOS.parrafos.map((p) => (
            <Cuerpo key={p}>{p}</Cuerpo>
          ))}
        </Gatillo>
      </div>
      <ul data-pieza="demos-en-conjunto" className="grid grid-cols-2 gap-[var(--spacing-5)] tablet:grid-cols-3 escritorio:grid-cols-5">
        {CATALOGO_DE_DEMOS.map((demo) => (
          <li key={demo.slug} className="min-w-0">
            <Gatillo desde="abajo" claseDelContenido="flex flex-col gap-[var(--spacing-2)]">
              <a
                href={demo.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${demo.nombre}, ${demo.rubro} (${DEMOS.abreAparte})`}
                data-demo={demo.slug}
                className="block overflow-hidden rounded-[var(--radius-fuerte)] border border-borde shadow-flotante transition-transform duration-media ease-salida hover:-translate-y-1 focus-visible:-translate-y-1 motion-reduce:transition-none"
              >
                <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 46vw" />
              </a>
              <Caption como="p">{demo.nombre}</Caption>
              <Caption como="p" className="text-tinta-media">
                {demo.rubro}
              </Caption>
            </Gatillo>
          </li>
        ))}
      </ul>
    </>
  )
}
