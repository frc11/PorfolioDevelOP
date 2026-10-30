'use client'

import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

import { sizesPorViewport } from '../_lib/imagen'
import { Gatillo } from '../_secciones/_contrato/Gatillo'

import { NOTAS } from './_notas/indice'
import { LUGARES } from './lugares'
import { TarjetaDeNota } from './TarjetaDeNota'

/**
 * [M2] TODAS LAS NOTAS, DISPERSAS — la galería del Panel viejo (`af4e53ca^:…/tu-panel/geometria.ts`: una TABLA escrita a mano, nada se sortea;
 * tarjetas de distinto ancho, proporción y altura, con mucho aire) con las notas. Valentino: «necesito más dispersión, más espacio».
 *
 *   · Desde 1024, dos columnas ESCALONADAS en una grilla de doce: cada tarjeta ocupa dos filas y la siguiente arranca en la segunda (la de la
 *     derecha empieza a mitad de la de la izquierda), así nunca se pisan y el orden del documento es el de la lectura. Cada una con su columna,
 *     su ancho, su proporción y un corrimiento propio hacia abajo.
 *   · Abajo de 1024 (la tablet como el teléfono), una columna que alterna los costados, con anchos y proporciones distintos.
 *
 * Llegan con el gatillo de siempre, desde abajo (sin el giro del prototipo); el título, después, se levanta (`TarjetaDeNota`). Los lugares
 * se repiten de a seis.
 */
/** La fila de cada tarjeta desde 1024: arranca en la suya y ocupa dos (la clase lee la variable). */
const CLASE_DE_LA_FILA = 'escritorio:[grid-row:var(--fila)/span_2]'

export function NotasEnDesorden(): React.JSX.Element {
  return (
    <ul data-pieza="notas-en-desorden" className="flex flex-col gap-y-[var(--spacing-20)] pt-[var(--spacing-8)] escritorio:grid escritorio:grid-cols-12 escritorio:gap-x-[var(--spacing-12)] escritorio:gap-y-[var(--spacing-16)]">
      {NOTAS.map((nota, i) => {
        const lugar = LUGARES[i % LUGARES.length] ?? LUGARES[0]
        if (lugar === undefined) return null
        return (
          <li key={nota.slug} data-lugar={i % LUGARES.length} className={cn('min-w-0 escritorio:w-auto escritorio:self-start', lugar.angosto, lugar.escritorio, CLASE_DE_LA_FILA)} style={{ '--fila': String(i + 1) } as CSSProperties}>
            <Gatillo desde="abajo">
              <TarjetaDeNota nota={nota} forma={lugar.forma} nivel={lugar.nivel} sizes={sizesPorViewport(lugar.vw, 92)} />
            </Gatillo>
          </li>
        )
      })}
    </ul>
  )
}
