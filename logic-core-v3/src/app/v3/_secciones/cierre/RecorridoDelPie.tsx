'use client'

import { cn } from '@/lib/utils'

import { EtiquetaDeSeccion } from '../../_componentes/tipografia/Textos'
import { EnlaceDeTexto } from '../../_componentes/volumen/EnlaceDeTexto'
import { TextoDelPie } from '../../_componentes/volumen/TextoDelPie'
import { COLUMNAS, DESTINOS_DE_LA_RUTA } from './contenido'

/** El rótulo de la columna del recorrido (la misma fila de `COLUMNAS` que usa el pie apilado). */
const ROTULO_DEL_RECORRIDO = COLUMNAS.find((c) => c.clase === 'recorrido')?.titulo ?? ''

/**
 * [PULIDO 10] J8 · EL RECORRIDO EN TEXTO, desde 1025 con el pie de volumen: el rótulo y los siete destinos como enlaces de
 * texto con el subrayado del sitio (`EnlaceDeTexto`), en dos columnas —cuatro y tres— o, con `?pie=menu-abajo`, en una fila.
 * Sigue siendo una lista de verdad y viaja como el menú (`data-pieza="destinos-del-pie"`: `SELECTOR_DE_LOS_VIAJES`).
 */
export function RecorridoDelPie({ enFila = false, className }: { readonly enFila?: boolean; readonly className?: string }): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-[var(--spacing-3)]', className)}>
      <TextoDelPie>
        <EtiquetaDeSeccion como="h3" sangria={false}>
          {ROTULO_DEL_RECORRIDO}
        </EtiquetaDeSeccion>
      </TextoDelPie>
      <ul
        data-pieza="destinos-del-pie"
        className={cn(
          'text-cuerpo leading-texto tracking-texto font-semi',
          enFila ? 'flex flex-wrap justify-center gap-x-[var(--spacing-8)] gap-y-[var(--spacing-2)]' : 'grid grid-flow-col grid-cols-[auto_auto] grid-rows-4 justify-start gap-x-[var(--spacing-6)] gap-y-[var(--spacing-1)]',
        )}
      >
        {DESTINOS_DE_LA_RUTA.map((destino) => (
          <li key={destino.ancla}>
            <EnlaceDeTexto href={destino.ancla} className="whitespace-nowrap">
              {destino.rotulo}
            </EnlaceDeTexto>
          </li>
        ))}
      </ul>
    </div>
  )
}
