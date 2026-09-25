'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { Isotipo } from '../../_componentes/marca/Marca'
import { ENLACES_DE_MUESTRA } from '../../_lib/navegacion'
import { useMovimientoReducido } from '../../_lib/motion/reducido'
import { useDialogo } from '../../_secciones/trabajos/demos/dialogo'
import { abrirContacto, useContacto } from '../contacto/apertura'
import { vaInvertido } from './tono'
import { useTonoDebajo } from './useTonoDebajo'

/**
 * EL MENÚ MÓVIL — un círculo con el logo arriba al centro y un menú que flota. **[CONTACTO]**
 *
 * Se monta sólo cuando la barra de escritorio no entra entera (`modo === 'menu'`, lo mide
 * `NavegacionDelHome`). El tono sale de lo que hay debajo (`tono.ts`): sobre oscuro, claro;
 * sobre claro, dado vuelta. El menú es un diálogo con el foco atrapado; se cierra tocando
 * afuera, con el mismo botón o con Esc, y el foco vuelve al botón.
 *
 * Nace del botón con un resorte sin rebote (`transform-origin` en el centro del botón). Por
 * qué ésta y no el Genie de las demos, medido: `docs/rediseno/SPRINT-CONTACTO.md`, fase 4.
 */

export const MS_DEL_MENU = 380
export const ROTULO_DEL_MENU = { abrir: 'Abrir el menú', cerrar: 'Cerrar el menú', menu: 'Menú' } as const

/** El centro del botón, visto desde el borde de arriba del menú: de ahí nace. */
const ORIGEN = '50% calc((var(--spacing-3) + var(--spacing-6)) * -1)'

export function MenuMovil(): React.JSX.Element | null {
  const { modo } = useContacto()
  const [abierto, setAbierto] = useState(false)
  const boton = useRef<HTMLButtonElement>(null)
  const haciaElContacto = useRef(false)
  const enMenu = modo === 'menu'
  const invertido = vaInvertido(useTonoDebajo(boton, enMenu))
  const cerrar = useCallback(() => setAbierto(false), [])
  const irAlContacto = useCallback(() => {
    haciaElContacto.current = true
    setAbierto(false)
  }, [])

  // Si el chrome vuelve a la barra, el menú se cierra (ajuste durante el render, no en un efecto).
  const [enMenuAntes, setEnMenuAntes] = useState(enMenu)
  if (enMenuAntes !== enMenu) {
    setEnMenuAntes(enMenu)
    if (!enMenu) setAbierto(false)
  }

  // Al desmontarse el menú, con la trampa de foco y el bloqueo de scroll ya soltados.
  const alDesmontar = useCallback((): void => {
    if (haciaElContacto.current) {
      haciaElContacto.current = false
      abrirContacto([], boton.current)
    } else boton.current?.focus({ preventScroll: true })
  }, [])

  if (!enMenu) return null
  return (
    <div data-pieza="menu-movil" className="fixed inset-x-0 top-0 z-[var(--z-cabecera)]">
      <AnimatePresence>
        {abierto && <Menu key="menu" invertido={invertido} alCerrar={cerrar} alContacto={irAlContacto} alDesmontar={alDesmontar} />}
      </AnimatePresence>
      <button
        ref={boton}
        type="button"
        data-parte="boton-del-menu"
        data-seccion={invertido ? 'invertida' : undefined}
        aria-label={abierto ? ROTULO_DEL_MENU.cerrar : ROTULO_DEL_MENU.abrir}
        aria-expanded={abierto}
        aria-controls="menu-movil"
        onClick={() => setAbierto((a) => !a)}
        className="bg-fondo text-tinta border-borde fixed inset-x-0 top-[var(--spacing-4)] mx-auto grid size-[var(--spacing-12)] place-items-center rounded-full border shadow-[var(--shadow-flotante)] transition-colors duration-[var(--duracion-media)]"
      >
        <Isotipo className="h-[var(--spacing-5)]" />
      </button>
    </div>
  )
}

export function Menu({
  invertido,
  alCerrar,
  alContacto,
  alDesmontar,
}: {
  readonly invertido: boolean
  readonly alCerrar: () => void
  readonly alContacto: () => void
  readonly alDesmontar: () => void
}): React.JSX.Element {
  const caja = useRef<HTMLDivElement>(null)
  const reducido = useMovimientoReducido()
  useDialogo(caja, alCerrar)
  // Declarado después de `useDialogo`: su limpieza corre después de la de la trampa (onExitComplete corre antes y la trampa retiene el foco).
  useEffect(() => alDesmontar, [alDesmontar])
  const resorte = reducido ? { duration: 0 } : { type: 'spring' as const, bounce: 0, duration: MS_DEL_MENU / 1000 }

  return (
    <>
      <motion.div
        data-parte="velo-del-menu"
        aria-hidden="true"
        onClick={alCerrar}
        className="fixed inset-0 bg-[color-mix(in_srgb,var(--color-tinta)_20%,transparent)] backdrop-blur-[var(--blur-panel)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={reducido ? { duration: 0 } : { duration: MS_DEL_MENU / 1000 }}
      />
      <motion.div
        ref={caja}
        id="menu-movil"
        role="dialog"
        aria-modal="true"
        aria-label={ROTULO_DEL_MENU.menu}
        data-parte="menu"
        data-seccion={invertido ? 'invertida' : undefined}
        className="bg-fondo text-tinta border-borde fixed inset-x-0 top-[calc(var(--spacing-4)+var(--spacing-12)+var(--spacing-3))] mx-auto w-[min(calc(100%-var(--pad-lateral-compacto)*2),calc(var(--spacing-20)*4))] rounded-[var(--radius-fuerte)] border p-[var(--spacing-3)] shadow-[var(--shadow-flotante)] will-change-transform"
        style={{ transformOrigin: ORIGEN }}
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.4 }}
        transition={resorte}
      >
        <nav aria-label="Navegación principal">
          <ul className="flex flex-col">
            {ENLACES_DE_MUESTRA.map((enlace) => (
              <li key={enlace.id}>
                {enlace.destino === '#contacto' ? (
                  <button type="button" data-parte="item-del-menu" onClick={alContacto} className={CLASE_DEL_ITEM}>
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
      </motion.div>
    </>
  )
}

const CLASE_DEL_ITEM = cn(
  'text-titulo-s font-titulo leading-titulo tracking-titulo flex w-full rounded-[var(--radius-medio)] px-[var(--spacing-3)] py-[var(--spacing-3)] text-left',
  'hover:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)] focus-visible:bg-[color-mix(in_srgb,var(--color-tinta)_8%,transparent)]',
)
