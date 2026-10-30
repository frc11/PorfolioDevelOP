'use client'

import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { Caption, Cuerpo } from '../_componentes/tipografia/Textos'
import { Titular } from '../_componentes/tipografia/Titular'
import { Gatillo } from '../_secciones/_contrato/Gatillo'

import { NOTAS, fechaLarga, minutosDeLectura, rutaDeLaNota } from './_notas/indice'
import { PortadaDeNota } from './PortadaDeNota'

/**
 * [L7c] TODAS LAS NOTAS, en lugares irregulares — la idea de la galería vieja de «Tu panel» (tarjetas de distinto ancho y a distinta altura, no una
 * grilla rígida), sin su código: doce columnas desde 1024 con un ancho y un corrimiento por tarjeta; de a dos con la segunda corrida en la tablet;
 * una sola columna en el teléfono. Los lugares se repiten de a seis.
 */
const LUGARES: readonly string[] = [
  'escritorio:col-span-5',
  'escritorio:col-span-4 escritorio:mt-[var(--spacing-12)]',
  'escritorio:col-span-3',
  'escritorio:col-span-4 escritorio:col-start-2',
  'escritorio:col-span-3 escritorio:mt-[var(--spacing-20)]',
  'escritorio:col-span-4 escritorio:mt-[var(--spacing-8)]',
]

export function NotasEnDesorden(): React.JSX.Element {
  return (
    <ul data-pieza="notas-en-desorden" className="grid grid-cols-1 gap-x-[var(--spacing-8)] gap-y-[var(--spacing-12)] tablet:grid-cols-2 escritorio:grid-cols-12">
      {NOTAS.map((nota, i) => (
        <li key={nota.slug} className={`min-w-0 ${LUGARES[i % LUGARES.length] ?? ''} ${i % 2 === 1 ? 'tablet:mt-[var(--spacing-12)] escritorio:mt-0' : ''}`}>
          <Gatillo desde="abajo" claseDelContenido="h-full">
            <EnlaceDeRuta href={rutaDeLaNota(nota)} className="group flex h-full flex-col gap-[var(--spacing-3)]">
              <PortadaDeNota nota={nota} className="rounded-[var(--radius-fuerte)] transition-transform duration-media ease-salida group-hover:-translate-y-1 motion-reduce:transition-none" />
              <Caption como="span" interletrado="micro" className="font-codigo uppercase text-tinta-media">
                {fechaLarga(nota.fecha)} · {minutosDeLectura(nota)} min
              </Caption>
              <Titular nivel="titulo-s" como="h3" className="group-hover:underline group-focus-visible:underline">
                {nota.titulo}
              </Titular>
              <Cuerpo>{nota.resumen}</Cuerpo>
            </EnlaceDeRuta>
          </Gatillo>
        </li>
      ))}
    </ul>
  )
}
