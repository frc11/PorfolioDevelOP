'use client'

import type { Ref } from 'react'

import { Isotipo } from '../../_componentes/marca/Marca'
import { Imagen } from '../../_componentes/medios/Imagen'
import { Micro } from '../../_componentes/tipografia/Textos'
import { Titular } from '../../_componentes/tipografia/Titular'
import { sizesPorColumnas } from '../../_lib/imagen'
import { CAPTURA, type Tarjeta as DatosDeTarjeta } from './contenido'
import { lugarDe } from './geometria'

/**
 * UNA TARJETA DE LA GALERÍA — marco con su imagen, y abajo el título con su
 * etiqueta. Es un botón: abre la ampliación.
 *
 * Tres capas adentro del marco, cada una con UNA transformada, para que no se
 * pisen: el marco no se mueve nunca; la capa del zoom escala 1,05 con el hover;
 * la del parallax la corre `Galeria` desde su única suscripción de scroll.
 *
 * El hover vive en `group-hover:` —Tailwind 4 lo emite adentro de
 * `@media (hover: hover)`, así que en táctil no existe— y `group-focus-visible:`
 * hace exactamente lo mismo con el teclado.
 */
export function Tarjeta({
  tarjeta,
  indice,
  alAbrir,
  refDelBoton,
  refDelMarco,
  refDelParallax,
}: {
  readonly tarjeta: DatosDeTarjeta
  readonly indice: number
  readonly alAbrir: (indice: number) => void
  readonly refDelBoton: Ref<HTMLButtonElement>
  readonly refDelMarco: Ref<HTMLSpanElement>
  readonly refDelParallax: Ref<HTMLSpanElement>
}): React.JSX.Element {
  const lugar = lugarDe(indice)
  const esPlaceholder = tarjeta.imagen === CAPTURA.fuente

  return (
    <li data-pieza="tarjeta-del-panel" className={lugar.clase}>
      <button
        ref={refDelBoton}
        type="button"
        aria-haspopup="dialog"
        onClick={() => alAbrir(indice)}
        className="group block w-full cursor-pointer text-left"
      >
        <span ref={refDelMarco} data-parte="marco" className="bg-superficie-2 relative block aspect-16/10 w-full overflow-hidden">
          <span className="absolute inset-0 block transition-transform duration-[var(--duracion-media)] ease-in-out group-hover:scale-105 group-focus-visible:scale-105 motion-reduce:transition-none">
            <span ref={refDelParallax} data-parte="parallax" className="absolute inset-x-0 top-0 block h-full escritorio:h-13/10">
              <Imagen
                src={tarjeta.imagen}
                alt={tarjeta.alt}
                ancho={CAPTURA.ancho}
                alto={CAPTURA.alto}
                sizes={sizesPorColumnas(lugar.columnas, 3)}
                className="h-full object-cover"
              />
            </span>
          </span>
          {/* El marcador se VE (es un placeholder) pero no se anuncia: repetido
              ocho veces le ensuciaría el nombre a cada botón. */}
          {esPlaceholder && (
            <span aria-hidden="true" className="bg-fondo absolute top-[var(--spacing-3)] left-[var(--spacing-3)] px-[var(--spacing-2)] py-[var(--spacing-1)]">
              <Micro como="span" peso="medio" className="uppercase">
                {CAPTURA.marcador}
              </Micro>
            </span>
          )}
        </span>

        <span className="mt-[var(--spacing-3)] flex flex-col items-start gap-[var(--spacing-2)]">
          <span className="relative block transition-transform duration-[var(--duracion-media)] ease-in-out group-hover:translate-x-[var(--spacing-8)] group-focus-visible:translate-x-[var(--spacing-8)] motion-reduce:transition-none">
            {/* La marca «qo» entra desde la izquierda donde nk pone su «/»: termina
                en el origen del título, que se corrió para hacerle lugar. */}
            <span
              aria-hidden="true"
              data-parte="marca-del-hover"
              className="text-acento absolute top-0 left-0 flex h-lh -translate-x-[var(--spacing-4)] scale-60 items-center opacity-0 transition duration-[var(--duracion-media)] ease-in-out group-hover:-translate-x-[var(--spacing-8)] group-hover:scale-100 group-hover:opacity-100 group-focus-visible:-translate-x-[var(--spacing-8)] group-focus-visible:scale-100 group-focus-visible:opacity-100 motion-reduce:transition-none"
            >
              <Isotipo className="h-[var(--spacing-4)]" />
            </span>
            <Titular nivel={lugar.nivel} como="span" className="block">
              {tarjeta.titulo}
            </Titular>
          </span>
          <Micro como="span" className="text-tinta-tenue uppercase">
            {tarjeta.etiqueta}
          </Micro>
        </span>
      </button>
    </li>
  )
}
