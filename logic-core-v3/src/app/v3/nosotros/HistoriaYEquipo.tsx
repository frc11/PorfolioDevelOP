'use client'

import { cn } from '@/lib/utils'

import { SeccionDePapel } from '../_componentes/pagina/SeccionDePapel'
import { Cuerpo } from '../_componentes/tipografia/Textos'
import { CLASE_DE_RELACION, GEOMETRIA, SIZES_DEL_RETRATO, SIZES_DE_LA_FOTO } from '../_secciones/quienes-somos/geometria'
import { MarcoDeDosTomas } from '../_secciones/quienes-somos/marco'
import { CONTENIDO as PERSONAS } from '../_secciones/quienes-somos/contenido'
import { TituloQueSube } from '../_secciones/_contrato/TituloQueSube'
import { Gatillo } from '../_secciones/_contrato/Gatillo'

import { EQUIPO, HISTORIA } from './contenido'

/**
 * [L7b] LA HISTORIA Y EL EQUIPO de Nosotros, con las piezas del home: el título que sube (`TituloQueSube`), el cuerpo que entra desde
 * abajo (`Gatillo`) y el marco de dos tomas de «Quiénes somos» (`MarcoDeDosTomas`: la foto seria en reposo, la suelta en el hover). El
 * equipo NO va en 3D: un párrafo largo por persona, con su foto al costado, alternando los lados.
 * La foto de la facultad no estaba en `l7-assets`: el marco de la historia lleva la foto del equipo del home hasta que Valentino pase la real.
 */
const FILA = 'grid grid-cols-1 items-center gap-[var(--spacing-8)] escritorio:grid-cols-2 escritorio:gap-[var(--spacing-16)]'

export function HistoriaYEquipo(): React.JSX.Element {
  const [franco, valentino] = PERSONAS.personas
  return (
    <>
      <SeccionDePapel dato="historia">
        <div className={FILA}>
          <div className="flex min-w-0 flex-col gap-[var(--spacing-6)]">
            <TituloQueSube titulo={HISTORIA.titulo} como="h2" nivel="titulo-l" />
            <Gatillo desde="abajo" className="flex flex-col gap-[var(--spacing-4)]" claseDelContenido="flex flex-col gap-[var(--spacing-4)]">
              {HISTORIA.parrafos.map((p) => (
                <Cuerpo key={p} className="max-w-[60ch]">
                  {p}
                </Cuerpo>
              ))}
            </Gatillo>
          </div>
          <Gatillo desde="abajo" className="min-w-0">
            <MarcoDeDosTomas
              seria={PERSONAS.equipo.seria}
              suelta={PERSONAS.equipo.suelta}
              texto={PERSONAS.equipo.leyendaEnMovil}
              registro="cuerpo"
              relacion={CLASE_DE_RELACION.foto}
              ancho={GEOMETRIA.foto.ancho}
              alto={GEOMETRIA.foto.alto}
              sizes={SIZES_DE_LA_FOTO}
            />
          </Gatillo>
        </div>
      </SeccionDePapel>

      <SeccionDePapel dato="equipo">
        <TituloQueSube titulo={EQUIPO.titulo} como="h2" nivel="titulo-l" />
        <div className="flex flex-col gap-[var(--spacing-16)]">
          {[
            { persona: franco, texto: EQUIPO.franco.texto, alaDerecha: false },
            { persona: valentino, texto: EQUIPO.valentino.texto, alaDerecha: true },
          ].map(({ persona, texto, alaDerecha }) => (
            <article key={persona.nombre} data-persona={persona.nombre} className={FILA}>
              <Gatillo desde="abajo" className={cn('min-w-0', alaDerecha && 'escritorio:order-2')}>
                <MarcoDeDosTomas
                  seria={persona.seria}
                  suelta={persona.suelta}
                  etiqueta={{ texto: persona.nombre, lado: alaDerecha ? 'derecha' : 'izquierda' }}
                  texto={persona.rol}
                  registro="rotulo"
                  relacion={CLASE_DE_RELACION.retrato}
                  ancho={GEOMETRIA.retrato.ancho}
                  alto={GEOMETRIA.retrato.alto}
                  sizes={SIZES_DEL_RETRATO}
                />
              </Gatillo>
              <Gatillo desde="abajo" className="min-w-0">
                <h3 className="sr-only">{persona.nombre}</h3>
                <Cuerpo className="max-w-[60ch]">{texto}</Cuerpo>
              </Gatillo>
            </article>
          ))}
        </div>
      </SeccionDePapel>
    </>
  )
}
