'use client'

import { X } from 'lucide-react'

import { cn } from '@/lib/utils'

import type { Caja } from '../../_secciones/trabajos/demos/genie'
import { ENLACES_DEL_HOME } from '../enlaces'

/**
 * [NAVBAR] T3 · EL PANEL DEL MENÚ, LO QUE NO SE MUEVE — su adentro (el botón de cerrar y los ítems, con sus clases) y la
 * geometría medida del panel y del botón, de la que sale el Genie y la copia plana que viaja en él. Separado de
 * `MenuMovil.tsx`, que lleva el botón, las fases y el Genie (el chrome no pasa de 300 líneas: `s8-montaje`).
 */

export const ROTULO_DEL_MENU = { abrir: 'Abrir el menú', cerrar: 'Cerrar el menú', menu: 'Menú' } as const

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

/** La cruz del botón de cerrar (la misma en la copia plana del Genie). */
export const CRUZ = <X aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-5)]" />

/** El adentro del panel: su botón de cerrar (arriba al centro, en el lugar del botón del menú) y los ítems. */
export function ContenidoDelMenu({ alCerrar, alContacto }: { readonly alCerrar: () => void; readonly alContacto: () => void }): React.JSX.Element {
  return (
    <div className="flex size-full flex-col">
      <button type="button" data-parte="cerrar-el-menu" aria-label={ROTULO_DEL_MENU.cerrar} onClick={alCerrar} className={CLASE_DEL_CERRAR}>
        {CRUZ}
      </button>
      <nav aria-label="Navegación principal" className="flex flex-1 flex-col justify-center px-[var(--spacing-6)] pb-[var(--spacing-12)]">
        <ul className="flex flex-col gap-[var(--spacing-1)]">
          {ENLACES_DEL_HOME.map((enlace) => (
            <li key={enlace.id}>
              {enlace.destino === '#contacto' ? (
                <button
                  type="button"
                  data-parte="item-del-menu"
                  onClick={() => {
                    alContacto()
                    alCerrar()
                  }}
                  className={CLASE_DEL_ITEM}
                >
                  {enlace.rotulo}
                </button>
              ) : (
                <a href={enlace.destino} data-parte="item-del-menu" onClick={alCerrar} className={CLASE_DEL_ITEM}>
                  {enlace.rotulo}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export const CLASE_DEL_CERRAR = 'bg-fondo text-tinta border-borde mx-auto grid size-[var(--spacing-12)] shrink-0 place-items-center rounded-full border'

export const CLASE_DEL_ITEM = cn(
  'text-titulo-m font-titulo leading-titulo tracking-titulo flex min-h-[var(--spacing-12)] w-full items-center rounded-[var(--radius-medio)] px-[var(--spacing-4)] py-[var(--spacing-2)] text-left',
  'hover:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)]',
)
