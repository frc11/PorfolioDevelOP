'use client'

import { useLayoutEffect, useRef } from 'react'

import { COMPOSICION_EN_LA_ESCENA, huecoEnElCuadro } from '../../_lib/escena/ruta/composicion'

/**
 * [B12a.8] LA COMPOSICIÓN DE LA INTRO, EN EL DOM (`_lib/escena/ruta/composicion.ts`) — el marco de la intro (una pantalla, fijo arriba
 * mientras dura el tramo del título) con la columna del texto y el HUECO del logo, y la fila de «de qué se trata» con la misma columna.
 * [L6] La composición quedó fija (la 3 de las tres que Valentino comparó; sin `?composicion=`): desde 1024, la columna a la izquierda y el
 * hueco a la derecha (como el hero del home); abajo de 1024, la columna centrada arriba y el hueco debajo. El marco mide el hueco (con la
 * intro fija arriba) y se lo da a la escena, que encuadra el logo ahí.
 */

/** El marco: la columna arriba y el hueco debajo (abajo de 1024); desde 1024, lado a lado.
 * [T0] Abajo de 1024 el aire de arriba es más alto (`--spacing-12` en vez de `--spacing-8`): el cartel del sonido, que aparece debajo del
 * parlante al tocarlo, pisaba el título de 360 a 1023 (`scripts-carga/chrome-en-los-anchos.ts`).
 */
const MARCO =
  'grid h-svh grid-rows-[auto_minmax(0,1fr)] justify-items-center gap-[var(--spacing-6)] pt-[calc(var(--zona-de-la-cabecera)+var(--spacing-12))] escritorio:pt-[calc(var(--zona-de-la-cabecera)+var(--spacing-8))] pb-[var(--spacing-8)] text-center escritorio:grid-cols-2 escritorio:grid-rows-1 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:text-left'

/**
 * La columna del texto, a lo ancho de su lugar: centrada abajo de 1024; desde 1024, en la mitad izquierda (como el hero), al medio del alto.
 * Es la misma en los dos tramos: el borde (o el centro) del texto es el mismo eje.
 * [B12a.8] T1 · Es el contenedor del título (`@container`): le da la parte de su ancho (`--ancho-del-titulo`, en `cqw`): el 97 % del ancho
 * de la columna (pedido: de 60 a 75 % del cuadro y al menos 85; la tinta del título en volumen mide un poco menos que el avance de sus letras).
 * [B12a.8] T4 · De costado, 8 vw de aire del lado de afuera: el título va fijo en el mundo y con el mouse en ese extremo la perspectiva lo
 * agranda hacia el borde (sin el aire se salía del cuadro hasta 100 px a 1280; con él, 42 px adentro en el peor, medido).
 */
const COLUMNA = '@container flex w-full flex-col items-center gap-[var(--spacing-4)] [--ancho-del-titulo:97cqw] escritorio:col-start-1 escritorio:row-start-1 escritorio:items-start escritorio:self-center escritorio:pl-[8vw]'

/** El hueco del logo: debajo de la columna abajo de 1024; a la derecha desde 1024. */
const HUECO = 'h-full min-h-0 w-full escritorio:col-start-2 escritorio:row-start-1'

/** La fila de «de qué se trata»: la misma grilla sin el alto ni el hueco (la columna en el mismo lugar que en el marco). */
const FILA = 'grid justify-items-center text-center escritorio:grid-cols-2 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:text-left'

export const PARTES_DE_LA_COMPOSICION = { marco: 'marco-de-la-intro', columna: 'columna-de-la-intro', hueco: 'hueco-del-logo' } as const

/** El marco de la intro: la columna (el título y la bajada) y el hueco del logo, que mide para la escena. */
export function MarcoDeLaIntro({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
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
  }, [])
  return (
    <div ref={marco} data-parte={PARTES_DE_LA_COMPOSICION.marco} className={MARCO}>
      <div data-parte={PARTES_DE_LA_COMPOSICION.columna} className={COLUMNA}>
        {children}
      </div>
      <div ref={hueco} data-parte={PARTES_DE_LA_COMPOSICION.hueco} aria-hidden="true" className={HUECO} />
    </div>
  )
}

/**
 * [M1] EL MARCO DEL GIRO (la intro de día) — una pantalla fija arriba mientras la cámara hace el giro del home hacia Quiénes somos: el bloque
 * de la página del lado contrario al logo, en el lugar que el home le da a esa sección. Desde 1024, el hueco a la izquierda y el bloque a
 * la derecha (el espejo del marco del título); abajo de 1024, el hueco arriba y el bloque debajo. Mide su hueco igual que el del título.
 */
const MARCO_DEL_GIRO =
  'grid h-svh grid-rows-[minmax(0,1fr)_auto] justify-items-center gap-[var(--spacing-6)] pt-[var(--zona-de-la-cabecera)] pb-[var(--spacing-12)] text-center escritorio:grid-cols-2 escritorio:grid-rows-1 escritorio:justify-items-start escritorio:gap-x-[var(--spacing-12)] escritorio:py-[var(--spacing-8)] escritorio:text-left'
const COLUMNA_DEL_GIRO = 'flex w-full flex-col items-center escritorio:col-start-2 escritorio:row-start-1 escritorio:items-start escritorio:self-center escritorio:pr-[8vw]'
const HUECO_DEL_GIRO = 'h-full min-h-0 w-full row-start-1 escritorio:col-start-1'

export function MarcoDelGiro({ children }: { readonly children?: React.ReactNode }): React.JSX.Element {
  const marco = useRef<HTMLDivElement>(null)
  const hueco = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const m = marco.current
    const h = hueco.current
    if (m === null || h === null) return undefined
    const medir = (): void => {
      const rm = m.getBoundingClientRect()
      const rh = h.getBoundingClientRect()
      COMPOSICION_EN_LA_ESCENA.giro = rh.width > 0 && rh.height > 0 ? huecoEnElCuadro({ izquierda: rh.left, arriba: rh.top - rm.top, ancho: rh.width, alto: rh.height }, window.innerWidth, window.innerHeight) : null
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(m)
    observador.observe(h)
    window.addEventListener('resize', medir)
    return () => {
      observador.disconnect()
      window.removeEventListener('resize', medir)
      COMPOSICION_EN_LA_ESCENA.giro = null
    }
  }, [])
  return (
    <div ref={marco} data-parte="marco-del-giro" className={MARCO_DEL_GIRO}>
      <div ref={hueco} data-parte="hueco-del-giro" aria-hidden="true" className={HUECO_DEL_GIRO} />
      <div data-parte={PARTES_DE_LA_COMPOSICION.columna} className={COLUMNA_DEL_GIRO}>
        <div className="flex max-w-[46ch] flex-col gap-[var(--spacing-3)]">{children}</div>
      </div>
    </div>
  )
}

/** La fila de «de qué se trata»: la columna en el mismo lugar que en el marco (el mismo eje). */
export function FilaDeQueSeTrata({ children }: { readonly children: React.ReactNode }): React.JSX.Element {
  return (
    <div className={FILA}>
      <div data-parte={PARTES_DE_LA_COMPOSICION.columna} className={COLUMNA}>
        <div className="flex max-w-[42ch] flex-col gap-[var(--spacing-3)]">{children}</div>
      </div>
    </div>
  )
}
