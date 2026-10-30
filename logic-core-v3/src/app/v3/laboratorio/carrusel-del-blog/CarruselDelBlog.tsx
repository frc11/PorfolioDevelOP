'use client'

import { ContenidoDelCta } from '../../_componentes/chrome/Cta'
import { CarruselDeTarjetas, type EstadoDeLaTarjeta } from '../../_componentes/carrusel/CarruselDeTarjetas'
import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import { usePrefiereMenosMovimiento } from '../../_lib/usePrefiereMenosMovimiento'
import { PRESENCIA_DEL_ENCABEZADO } from '../../_secciones/trabajos/portfolio/EncabezadoDelPortfolio'
import { TitularQueSeLevanta, usePresencia } from '../../_secciones/trabajos/portfolio/levantarse'
import { DESTACADAS, NOTAS, type NotaDelBlog } from '../_lab/notas'

/**
 * [L7e · B1] EL CARRUSEL DE LAS DESTACADAS — el carrusel común del Portfolio y de Demos (`CarruselDeTarjetas`, importado: su reloj de
 * 10 s, su pausa al mantener, sus flechas, el dedo y sus líneas, llenas las ya vistas como en las historias), a todo el ancho,
 * con las tres notas destacadas. Lo propio es la tarjeta: sin foto todavía (las notas no tienen imagen), una tapa tipográfica con su número
 * enorme y el titular que SE LEVANTA al entrar (el de los títulos del teléfono, `TitularQueSeLevanta`), no que se desliza.
 */
export function CarruselDelBlog(): React.JSX.Element {
  return (
    <>
      <header className="mx-auto max-w-7xl px-6 pt-36 pb-10 escritorio:pt-44">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Blog · las destacadas</p>
        <h1 className="mt-4 text-titulo-l leading-titulo escritorio:text-titulo-xl">
          <span className="block font-display font-fuerte tracking-display uppercase">Notas para</span>
          <span className="block font-liviano tracking-titulo italic uppercase">tu negocio</span>
        </h1>
      </header>
      <section aria-label="Notas destacadas" className="mx-auto max-w-7xl px-6">
        <CarruselDeTarjetas
          items={DESTACADAS}
          etiqueta="Notas destacadas"
          nombreDe={(n) => n.titulo}
          rotulos={{ anterior: 'Nota anterior', siguiente: 'Nota siguiente' }}
          vistasLlenas
          renderItem={(nota, estado) => <Tapa nota={nota} estado={estado} />}
        />
      </section>
      <section className="mx-auto max-w-7xl px-6 pt-24 pb-48">
        <p className="font-codigo text-caption tracking-wide text-tinta-media uppercase">Y todas las demás</p>
        <ul className="mt-4 divide-y divide-borde border-y border-borde">
          {NOTAS.slice(DESTACADAS.length).map((n) => (
            <li key={n.id} className="py-4 text-titulo-s leading-titulo">
              {n.titulo}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}

function Tapa({ nota, estado }: { readonly nota: NotaDelBlog; readonly estado: EstadoDeLaTarjeta }): React.JSX.Element {
  const reducido = usePrefiereMenosMovimiento()
  const presencia = usePresencia(estado.activa, reducido, PRESENCIA_DEL_ENCABEZADO)
  const numero = String(NOTAS.indexOf(nota) + 1).padStart(2, '0')
  return (
    <article data-seccion="invertida" className="relative grid min-h-[60svh] overflow-hidden rounded-fuerte bg-fondo text-tinta max-tablet:min-h-[70svh]">
      {/* La tapa: el número de la nota, enorme y hueco, del lado de afuera (la marca de agua de las tiras del Portfolio, en tipografía). */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-[0.06em] -bottom-[0.22em] font-display text-[length:min(48vw,34rem)] leading-none font-fuerte tracking-display text-transparent [-webkit-text-stroke:1px_color-mix(in_srgb,var(--color-tinta)_35%,transparent)]">
        {numero}
      </span>
      <div className="relative flex flex-col justify-end gap-5 p-6 tablet:p-10 escritorio:max-w-[62%] escritorio:p-14">
        <p className="font-codigo text-caption tracking-wide uppercase opacity-70">Nota {numero}</p>
        <h2 className="overflow-hidden text-titulo-m leading-titulo escritorio:text-titulo-l">
          <TitularQueSeLevanta presencia={presencia}>{nota.titulo}</TitularQueSeLevanta>
        </h2>
        <p className="max-w-xl text-cuerpo leading-texto opacity-80">{nota.bajada}</p>
        <EnlaceDeRuta href="/v3/laboratorio/nota" tabIndex={estado.activa ? 0 : -1} data-pieza="cta" data-variante="linea" data-registro="cuerpo" className="self-start text-base no-underline">
          <ContenidoDelCta rotulo="Leer la nota" />
        </EnlaceDeRuta>
      </div>
    </article>
  )
}
