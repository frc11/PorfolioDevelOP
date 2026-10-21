'use client'

import { ChevronDown, Menu as TresBarras } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { EnlaceDeRuta } from '../../_componentes/navegacion/EnlaceDeRuta'
import type { Caja } from '../../_secciones/trabajos/demos/genie'
import { ITEMS_DEL_DESPLEGABLE } from '../barra/DesplegableDeServicios'
import { ENLACES_DE_SECCION, ENLACE_DE_CONTACTO } from '../enlaces'
import { SERVICIOS_DEL_HOME, destinoDesde } from '../paginas'

/**
 * [NAVBAR] T3 · EL PANEL DEL MENÚ, LO QUE NO SE MUEVE — su adentro (el botón de cerrar y los ítems, con sus clases) y la
 * geometría medida del panel y del botón, de la que sale el Genie y la copia plana que viaja en él. Separado de
 * `MenuMovil.tsx`, que lleva el botón, las fases y el Genie (el chrome no pasa de 300 líneas: `s8-montaje`).
 */

/** [NOCTURNO FINAL] C5 · `franja`: lo que dice la franja de cerrar (su nombre accesible lo contiene: «… el menú»). */
export const ROTULO_DEL_MENU = { abrir: 'Abrir el menú', cerrar: 'Cerrar el menú', menu: 'Menú', franja: 'Click para cerrar' } as const

/** Una pieza del panel medida en su lugar (relativa al panel): lo que la copia plana del Genie repite. */
export interface PiezaMedida {
  readonly cerrar: boolean
  readonly texto: string
  readonly caja: Caja
}

export interface Geometria {
  readonly ventana: Caja
  readonly destino: Caja
  readonly radio: number
  readonly piezas: readonly PiezaMedida[]
}

export function cajaDe(el: Element | null): Caja {
  const r = el?.getBoundingClientRect()
  return r === undefined ? { x: 0, y: 0, ancho: 0, alto: 0 } : { x: r.left, y: r.top, ancho: r.width, alto: r.height }
}

/** El panel (en su lugar, escondido) y el botón: de dónde sale el Genie y adónde va, y el radio del panel para la lente. */
export function medirLaGeometria(panel: HTMLElement | null, boton: HTMLElement | null): Geometria {
  const radio = panel === null ? 0 : Number.parseFloat(getComputedStyle(panel).borderTopLeftRadius) || 0
  const ventana = cajaDe(panel)
  const piezas = panel === null ? [] : [...panel.querySelectorAll<HTMLElement>('[data-parte="cerrar-el-menu"], [data-parte="item-del-menu"]')].map((el) => {
    const c = cajaDe(el)
    return { cerrar: el.getAttribute('data-parte') === 'cerrar-el-menu', texto: el.textContent ?? '', caja: { x: c.x - ventana.x, y: c.y - ventana.y, ancho: c.ancho, alto: c.alto } }
  })
  return { ventana, destino: cajaDe(boton), radio, piezas }
}

const mismaCaja = (a: Caja, b: Caja): boolean => a.x === b.x && a.y === b.y && a.ancho === b.ancho && a.alto === b.alto
export const mismaGeometria = (a: Geometria, b: Geometria): boolean =>
  mismaCaja(a.ventana, b.ventana) && mismaCaja(a.destino, b.destino) && a.radio === b.radio && a.piezas.length === b.piezas.length && a.piezas.every((p, i) => mismaCaja(p.caja, b.piezas[i].caja))

/** [NOCTURNO FINAL] C5 · las tres barras del botón del menú: las mismas en el círculo de la franja y en el Genie. */
export const TRES_BARRAS = <TresBarras aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-5)]" />

/**
 * El adentro del panel. [NOCTURNO FINAL] C5 · Arriba, LA FRANJA DE CERRAR: el círculo del botón del menú, que con el panel
 * abierto se estira a lo ancho y se vuelve la franja de arriba del vidrio, con «Click para cerrar» y un brillo que la
 * recorre (`vidrio.css`); al tocarla se recoge en el círculo y el panel se va en él (`MenuDeVidrio`). Nada de cruz. Después,
 * las secciones y, como una más debajo de «Por qué develOP», Contacto: un botón que cierra el menú y abre el panel de
 * contacto (`MenuMovil`). Sin Login.
 *
 * [B12a.5] «Servicios» es un acordeón (D5, en el teléfono). Sus ítems cuentan como piezas del panel (`item-del-menu`: el Genie los copia)
 * sólo abiertos, y al terminar de abrirse o cerrarse el menú vuelve a medirse (el `resize` que escucha `MenuDeVidrio`). Desde una página,
 * las anclas llevan al home (`destinoDesde`).
 *
 * [B12a.8] «Home» va primero. «Servicios» NAVEGA (a la sección del home) y la flechita de al lado abre el acordeón, con las páginas de
 * servicio (sin «Todos los servicios»: es «Servicios» mismo).
 */
export function ContenidoDelMenu({ alCerrar, alContacto }: { readonly alCerrar: () => void; readonly alContacto: () => void }): React.JSX.Element {
  const ruta = usePathname()
  const [servicios, setServicios] = useState(false)
  return (
    <div className="flex size-full flex-col">
      <button type="button" data-parte="cerrar-el-menu" onClick={alCerrar} className="text-tinta">
        <span data-parte="franja" aria-hidden="true" />
        <span data-parte="circulo" aria-hidden="true" className={CLASE_DEL_CIRCULO}>
          {TRES_BARRAS}
        </span>
        <span data-parte="rotulo-de-la-franja" className="text-caption leading-texto tracking-texto font-medio">
          {ROTULO_DEL_MENU.franja}
          <span className="sr-only"> el menú</span>
        </span>
      </button>
      <nav aria-label="Navegación principal" className="flex flex-1 flex-col justify-center px-[var(--spacing-6)] pb-[var(--spacing-6)]">
        <ul className="flex flex-col gap-[var(--spacing-1)]">
          {ENLACES_DE_SECCION.map((enlace) =>
            enlace.id === SERVICIOS_DEL_HOME.id ? (
              <li key={enlace.id}>
                <div className="flex items-center gap-[var(--spacing-1)]">
                  <EnlaceDeRuta href={destinoDesde(ruta, enlace.destino)} data-parte="item-del-menu" onClick={alCerrar} className={cn(CLASE_DEL_ITEM, 'flex-1')}>
                    {enlace.rotulo}
                  </EnlaceDeRuta>
                  <button type="button" data-parte="abrir-el-acordeon" aria-label="Las páginas de servicio" aria-expanded={servicios} aria-controls={ID_DEL_ACORDEON} onClick={() => setServicios((a) => !a)} className={CLASE_DE_LA_FLECHITA}>
                    <ChevronDown aria-hidden="true" strokeWidth={1.5} className={cn('size-[var(--spacing-5)] transition-transform duration-[var(--duracion-media)] ease-[var(--ease-principal)] motion-reduce:transition-none', servicios && 'rotate-180')} />
                  </button>
                </div>
                <div
                  id={ID_DEL_ACORDEON}
                  data-parte="acordeon-de-servicios"
                  inert={!servicios}
                  onTransitionEnd={(e) => {
                    if (e.target === e.currentTarget) window.dispatchEvent(new Event('resize'))
                  }}
                  className={cn('grid transition-[grid-template-rows] duration-[var(--duracion-media)] ease-[var(--ease-principal)] motion-reduce:transition-none', servicios ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <ul className="flex min-h-0 flex-col gap-[var(--spacing-1)] overflow-hidden pl-[var(--spacing-4)]">
                    {ITEMS_DEL_DESPLEGABLE.map((p) => (
                      <li key={p.id}>
                        <EnlaceDeRuta href={destinoDesde(ruta, p.destino)} data-parte={servicios ? 'item-del-menu' : 'item-del-acordeon'} onClick={alCerrar} className={CLASE_DEL_SUBITEM}>
                          {p.rotulo}
                        </EnlaceDeRuta>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ) : (
              <li key={enlace.id}>
                <EnlaceDeRuta href={destinoDesde(ruta, enlace.destino)} data-parte="item-del-menu" onClick={alCerrar} className={CLASE_DEL_ITEM}>
                  {enlace.rotulo}
                </EnlaceDeRuta>
              </li>
            ),
          )}
          <li>
            <button
              type="button"
              data-parte="item-del-menu"
              onClick={() => {
                alContacto()
                alCerrar()
              }}
              className={CLASE_DEL_ITEM}
            >
              {ENLACE_DE_CONTACTO.rotulo}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  )
}

/** [NOCTURNO FINAL] C5 · el círculo del botón del menú (el mismo papel y borde): adentro de la franja y en el Genie. */
export const CLASE_DEL_CIRCULO = 'bg-fondo text-tinta border-borde grid size-[var(--spacing-12)] place-items-center rounded-full border'

/** [B12a.5] El acordeón de «Servicios» en el menú del teléfono. */
const ID_DEL_ACORDEON = 'acordeon-de-servicios'

export const CLASE_DEL_ITEM = cn(
  'text-titulo-m font-titulo leading-titulo tracking-titulo flex min-h-[var(--spacing-12)] w-full items-center rounded-[var(--radius-medio)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-left',
  'hover:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)]',
)

/** [B12a.8] La flechita de «Servicios»: un blanco táctil cuadrado (48 px) con el mismo hover que los ítems. */
const CLASE_DE_LA_FLECHITA = cn(
  'grid size-[var(--spacing-12)] shrink-0 place-items-center rounded-[var(--radius-medio)]',
  'hover:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)]',
)

/** [B12a.5] Un ítem del acordeón: un paso más chico que los de las secciones, con el mismo hover. */
const CLASE_DEL_SUBITEM = cn(
  'text-titulo-s font-titulo leading-titulo tracking-titulo flex min-h-[var(--spacing-12)] w-full items-center rounded-[var(--radius-medio)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-left',
  'hover:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)]',
)
