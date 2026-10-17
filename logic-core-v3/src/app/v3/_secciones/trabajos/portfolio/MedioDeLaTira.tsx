'use client'

import { Imagen } from '../../../_componentes/medios/Imagen'

import type { ProyectoDelPortfolio } from '../proyectos'

import { MEDIDAS_DE_LOS_MEDIOS, PROPORCION_DEL_MEDIO, SIZES_DEL_LOMO, SIZES_DEL_MEDIO } from './medios'

/**
 * [B1] EL MEDIO DE LA TIRA ACTIVA — el recorrido del sitio en 16:10, contenido en su caja, con el mismo enlace que «Visitar sitio»
 * sólo para el mouse (fuera del orden del teclado y de los lectores: la parada es el enlace de la región). En B1.1b, el póster;
 * el video llega en B1.2 (sólo el de la tira activa, a color; los inactivos no se piden).
 */
export function MedioDeLaTira({ proyecto, activa }: { readonly proyecto: ProyectoDelPortfolio; readonly activa: boolean }): React.JSX.Element {
  const medida = MEDIDAS_DE_LOS_MEDIOS[proyecto.slug].escritorio
  return (
    <figure aria-label={proyecto.alt} className="relative w-full overflow-clip rounded-sutil bg-tinta/5" style={{ aspectRatio: PROPORCION_DEL_MEDIO }}>
      {activa ? (
        <Imagen src={proyecto.medios.poster.escritorio} alt="" ancho={medida.ancho} alto={medida.alto} sizes={SIZES_DEL_MEDIO} className="h-full w-full object-contain" />
      ) : null}
      <a href={proyecto.url} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true" className="absolute inset-0" />
    </figure>
  )
}

/** El lomo de una tira inactiva: el póster del teléfono, en grises, detrás del nombre girado. Decorativo. */
export function PosterDelLomo({ proyecto }: { readonly proyecto: ProyectoDelPortfolio }): React.JSX.Element {
  const medida = MEDIDAS_DE_LOS_MEDIOS[proyecto.slug].movil
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Imagen src={proyecto.medios.poster.movil} alt="" ancho={medida.ancho} alto={medida.alto} sizes={SIZES_DEL_LOMO} className="h-full w-full object-cover opacity-tenue grayscale" />
    </div>
  )
}
