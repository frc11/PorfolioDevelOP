'use client'

import { useLayoutEffect, useRef, useSyncExternalStore } from 'react'

import { COMPOSICION_EN_LA_ESCENA, COMPOSICION_POR_DEFECTO, composicionDeLaBandera, huecoEnElCuadro, type IdDeComposicion } from '../../_lib/escena/ruta/composicion'
import { LEGIBILIDAD_POR_DEFECTO, legibilidadDeLaUrl } from '../titulos3d/legibilidad'

/**
 * [B12a.8] LA COMPOSICIÓN DE LA INTRO, EN EL DOM (`_lib/escena/ruta/composicion.ts`) — el marco de la intro (una pantalla, fijo arriba
 * mientras dura el tramo del título) con la columna del texto y el HUECO del logo, y la fila de «de qué se trata» con la misma columna.
 * La composición sale de `?composicion=` después de hidratar (el servidor pinta la de por defecto). Desde 1024, la 2 y la 3 ponen la
 * columna a un costado y el hueco al otro; la 1 (y las tres abajo de 1024), la columna centrada arriba y el hueco debajo. El marco mide
 * el hueco (con la intro fija arriba) y se lo da a la escena, que encuadra el logo ahí.
 */

const sinCambios = (): (() => void) => () => undefined
const composicionDeLaUrl = (): IdDeComposicion => composicionDeLaBandera(new URLSearchParams(window.location.search).get('composicion'))
const useComposicion = (): IdDeComposicion => useSyncExternalStore(sinCambios, composicionDeLaUrl, () => COMPOSICION_POR_DEFECTO)

/** El marco: la columna arriba y el hueco debajo (la 1, y todas abajo de 1024); desde 1024, en la 2 y la 3, lado a lado. */
const MARCO: Readonly<Record<IdDeComposicion, string>> = {
  '1': 'grid h-svh grid-rows-[auto_minmax(0,1fr)] justify-items-center gap-[var(--spacing-6)] pt-[calc(var(--zona-de-la-cabecera)+var(--spacing-8))] pb-[var(--spacing-8)] text-center',
  '2': 'grid h-svh grid-rows-[auto_minmax(0,1fr)] justify-items-center gap-[var(--spacing-6)] pt-[calc(var(--zona-de-la-cabecera)+var(--spacing-8))] pb-[var(--spacing-8)] text-center escritorio:grid-cols-2 escritorio:grid-rows-1 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:text-left',
  '3': 'grid h-svh grid-rows-[auto_minmax(0,1fr)] justify-items-center gap-[var(--spacing-6)] pt-[calc(var(--zona-de-la-cabecera)+var(--spacing-8))] pb-[var(--spacing-8)] text-center escritorio:grid-cols-2 escritorio:grid-rows-1 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:text-left',
}

/**
 * La columna del texto, a lo ancho de su lugar: centrada (la 1, y las tres abajo de 1024); desde 1024, en la mitad derecha (la 2) o en la
 * izquierda (la 3, como el hero), al medio del alto. Es la misma en los dos tramos: el borde (o el centro) del texto es el mismo eje.
 * [B12a.8] T1 · Es el contenedor del título (`@container`): le da la parte de su ancho (`--ancho-del-titulo`, en `cqw`): el 74 % en la 1
 * desde 1024 y el 97 % de una columna de costado y del ancho útil abajo de 1024 (pedido: de 60 a 75 % del cuadro y al menos 85; la tinta
 * del título en volumen mide un poco menos que el avance de sus letras).
 * [B12a.8] T4 · De costado, 8 vw de aire del lado de afuera: el título va fijo en el mundo y con el mouse en ese extremo la perspectiva lo
 * agranda hacia el borde (sin el aire se salía del cuadro hasta 100 px a 1280; con él, 42 px adentro en el peor, medido).
 */
const COLUMNA: Readonly<Record<IdDeComposicion, string>> = {
  '1': '@container flex w-full flex-col items-center gap-[var(--spacing-4)] [--ancho-del-titulo:97cqw] escritorio:[--ancho-del-titulo:74cqw] escritorio:data-[legibilidad=tamano]:[--ancho-del-titulo:80cqw]',
  '2': '@container flex w-full flex-col items-center gap-[var(--spacing-4)] [--ancho-del-titulo:97cqw] escritorio:col-start-2 escritorio:row-start-1 escritorio:items-start escritorio:self-center escritorio:pr-[8vw]',
  '3': '@container flex w-full flex-col items-center gap-[var(--spacing-4)] [--ancho-del-titulo:97cqw] escritorio:col-start-1 escritorio:row-start-1 escritorio:items-start escritorio:self-center escritorio:pl-[8vw]',
}

/** El hueco del logo: debajo de la columna (la 1); al otro costado desde 1024 (la 2 a la izquierda, la 3 a la derecha). */
const HUECO: Readonly<Record<IdDeComposicion, string>> = {
  '1': 'h-full min-h-0 w-full',
  '2': 'h-full min-h-0 w-full escritorio:col-start-1 escritorio:row-start-1',
  '3': 'h-full min-h-0 w-full escritorio:col-start-2 escritorio:row-start-1',
}

/** La fila de «de qué se trata»: la misma grilla sin el alto ni el hueco (la columna en el mismo lugar que en el marco). */
const FILA: Readonly<Record<IdDeComposicion, string>> = {
  '1': 'grid justify-items-center text-center',
  '2': 'grid justify-items-center text-center escritorio:grid-cols-2 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:text-left',
  '3': 'grid justify-items-center text-center escritorio:grid-cols-2 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:text-left',
}

export const PARTES_DE_LA_COMPOSICION = { marco: 'marco-de-la-intro', columna: 'columna-de-la-intro', hueco: 'hueco-del-logo' } as const

/** El marco de la intro: la columna (el título y la bajada) y el hueco del logo, que mide para la escena. */
export function MarcoDeLaIntro({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const id = useComposicion()
  // [B12a.8] T5 · `?legibilidad=tamano`: el título más grande en la 1 desde 1024 (el 80 % en vez del 74: la variante de `COLUMNA['1']`).
  // [T0] Sin la bandera, `peso` (la elegida): el servidor la pinta igual.
  const legibilidad = useSyncExternalStore(sinCambios, legibilidadDeLaUrl, () => LEGIBILIDAD_POR_DEFECTO)
  const marco = useRef<HTMLDivElement>(null)
  const hueco = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const m = marco.current
    const h = hueco.current
    if (m === null || h === null) return undefined
    // El hueco con la intro fija arriba: en y, relativo al marco (pegado al tope del cuadro), sin depender del scroll de ahora; en x, el suyo.
    const medir = (): void => {
      const rm = m.getBoundingClientRect()
      const rh = h.getBoundingClientRect()
      COMPOSICION_EN_LA_ESCENA.hueco = rh.width > 0 && rh.height > 0 ? huecoEnElCuadro({ izquierda: rh.left, arriba: rh.top - rm.top, ancho: rh.width, alto: rh.height }, window.innerWidth, window.innerHeight) : null
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(m)
    observador.observe(h)
    window.addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medir)
      COMPOSICION_EN_LA_ESCENA.hueco = null
    }
  }, [id])
  return (
    <div ref={marco} data-parte={PARTES_DE_LA_COMPOSICION.marco} data-composicion={id} className={MARCO[id]}>
      <div data-parte={PARTES_DE_LA_COMPOSICION.columna} data-legibilidad={legibilidad} className={COLUMNA[id]}>
        {children}
      </div>
      <div ref={hueco} data-parte={PARTES_DE_LA_COMPOSICION.hueco} aria-hidden="true" className={HUECO[id]} />
    </div>
  )
}

/** La fila de «de qué se trata»: la columna en el mismo lugar que en el marco (el mismo eje). */
export function FilaDeQueSeTrata({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  const id = useComposicion()
  return (
    <div data-composicion={id} className={FILA[id]}>
      <div data-parte={PARTES_DE_LA_COMPOSICION.columna} className={COLUMNA[id]}>
        <div className="flex max-w-[42ch] flex-col gap-[var(--spacing-3)]">{children}</div>
      </div>
    </div>
  )
}
