'use client'

import { cn } from '@/lib/utils'

import { EnlaceDeRuta } from '../_componentes/navegacion/EnlaceDeRuta'
import { Caption } from '../_componentes/tipografia/Textos'
import type { NivelDeTitular } from '../_componentes/tipografia/Titular'

import { fechaLarga, minutosDeLectura, rutaDeLaNota } from './_notas/indice'
import type { Nota } from './_notas/tipos'
import { TitularQueSeLevantaAlCruzar } from './_movimiento/TitularQueSeLevantaAlCruzar'
import { FotoDeNota } from './FotoDeNota'

/** Lo que tarda el título en levantarse después de que su tarjeta cruzó la línea: llega cuando la tarjeta ya subió casi entera. */
export const RETRASO_DEL_TITULO_MS = 260

/**
 * [M2] LA TARJETA DE UNA NOTA — «será la foto, y el título debajo del recuadro, tal como era panel antes»: la foto en su marco (con su
 * parallax) y, DEBAJO del marco, la fecha y los minutos como rótulo y el título, que se levanta al cruzar la línea. La tarjeta entera es el
 * enlace a la nota. La proporción del marco (`forma`) y el tamaño del título (`nivel`) los pone quien la ubica: así se arma la irregularidad.
 */
export function TarjetaDeNota({ nota, forma, nivel, sizes, className }: {
  readonly nota: Nota
  readonly forma: string
  readonly nivel: NivelDeTitular
  readonly sizes: string
  readonly className?: string
}): React.JSX.Element {
  return (
    <EnlaceDeRuta href={rutaDeLaNota(nota)} data-pieza="tarjeta-de-nota" className={cn('group flex flex-col gap-[var(--spacing-4)]', className)}>
      <FotoDeNota nota={nota} sizes={sizes} className={cn(forma, 'w-full transition-transform duration-media ease-salida group-hover:-translate-y-1 motion-reduce:transition-none')} />
      <span className="flex flex-col gap-[var(--spacing-2)]">
        <Caption como="span" interletrado="micro" className="font-codigo uppercase text-tinta-media">
          {fechaLarga(nota.fecha)} · {minutosDeLectura(nota)} min de lectura
        </Caption>
        <TitularQueSeLevantaAlCruzar nivel={nivel} como="h3" retrasoMs={RETRASO_DEL_TITULO_MS} className="group-hover:underline group-focus-visible:underline">
          {nota.titulo}
        </TitularQueSeLevantaAlCruzar>
      </span>
    </EnlaceDeRuta>
  )
}
