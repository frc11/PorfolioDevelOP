'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { prototipo } from './prototipos'

/**
 * [L7e] La leyenda de un prototipo: qué es, qué mirar y de dónde sale, en una tarjeta de vidrio fija abajo a la derecha. Se pliega para
 * que no tape lo que se está mirando. No es una pieza del sitio: es la nota al margen del laboratorio.
 */
export function Leyenda({ slug }: { readonly slug: string }): React.JSX.Element | null {
  const [abierta, setAbierta] = useState(true)
  const p = prototipo(slug)
  if (p === undefined) return null
  return (
    <aside
      aria-label="Qué es este prototipo"
      className="fixed right-4 bottom-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 text-tinta shadow-lg backdrop-blur-[20px] backdrop-saturate-[180%]"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-codigo text-xs tracking-wide text-tinta-media uppercase">
            Laboratorio · {p.codigo} · {p.pagina}
          </p>
          <p className="mt-1 text-base font-semibold">{p.titulo}</p>
        </div>
        <button
          type="button"
          onClick={() => setAbierta((a) => !a)}
          aria-expanded={abierta}
          aria-label={abierta ? 'Plegar la leyenda' : 'Abrir la leyenda'}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-borde"
        >
          <ChevronDown strokeWidth={1.5} className={abierta ? 'size-4' : 'size-4 rotate-180'} aria-hidden="true" />
        </button>
      </div>
      {abierta ? (
        <div className="mt-2 space-y-2 text-sm leading-snug">
          <p>
            <span className="font-semibold">Mirá: </span>
            {p.mirar}
          </p>
          <p className="text-tinta-media">
            <span className="font-semibold">Sale de: </span>
            {p.sale}
          </p>
          <EnlaceDeRuta href="/v3/laboratorio" className="inline-block underline underline-offset-4">
            Todos los prototipos
          </EnlaceDeRuta>
        </div>
      ) : null}
    </aside>
  )
}
