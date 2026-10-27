'use client'

import { useEffect, type RefObject } from 'react'

import { anotarTramo } from '../../_lib/escena/tramoEstirado'
import { ALTO_DE_VIEWPORT_DE_LA_REFERENCIA } from '../../_lib/navegacion'

/**
 * [C2-30f] REGLA DE ALTURAS · EL TRAMO DE «EL EQUIPO» ABAJO DE 1024. El nombre grande de afuera se fue (va en la etiqueta de la foto) y
 * la descripción creció (15 → 17 px): abajo de 1024 cada persona apila su texto sobre su foto, así que la pantalla del equipo se
 * acorta (medido con el modelo: ~10 px a 390 y ~86 a 768). Desde 1024 no cambia (la fila la manda la foto, más alta que el texto de
 * antes y el de ahora: s78-c30f) y no se anota.
 *
 * Lo que mide es lo que se fue, con el navegador: un fantasma de la columna de texto de ANTES (el nombre en su escalón, la juntura y
 * la descripción en el cuerpo de siempre), del mismo ancho, invisible y fuera del flujo, en la misma tarea (no se pinta); la
 * diferencia con la de ahora es lo que cada fila se acortó. Con eso, el alto viejo de la pantalla (con su `min-h-svh`) y la `k`
 * (nuevo / viejo): la escena mide el scroll como si la pantalla midiera lo de antes (`tramoEstirado.ts`).
 */

/** Las clases del nombre y de la descripción de ANTES de C2-30f, abajo de 1024 (el `Titular` `titulo-m` con su escalón de la banda y el `Cuerpo`). */
export const COLUMNA_DE_ANTES = {
  columna: 'invisible absolute left-0 top-0 flex flex-col gap-[var(--spacing-3)]',
  nombre: 'font-titulo text-fluido-titulo-l leading-titulo tracking-texto font-normal',
  descripcion: 'font-cuerpo text-cuerpo leading-texto tracking-texto max-w-[var(--medida-movil)]',
} as const

/** El alto de la pantalla antes del cambio: su piso (`min-h-svh`) o su contenido más lo que se fue. */
export function altoDeAntes(minimo: number, contenido: number, acortado: number): number {
  return Math.max(minimo, contenido + acortado)
}

/** Lo que una fila se acortó: su columna de texto de antes (el fantasma) menos la de ahora. */
function acortadoDe(columna: HTMLElement, nombre: string, descripcion: string): number {
  const padre = columna.parentElement
  if (padre === null) return 0
  const fantasma = document.createElement('div')
  fantasma.className = COLUMNA_DE_ANTES.columna
  fantasma.style.width = `${String(columna.clientWidth)}px`
  fantasma.setAttribute('aria-hidden', 'true')
  const delNombre = document.createElement('p')
  delNombre.className = COLUMNA_DE_ANTES.nombre
  delNombre.textContent = nombre
  const deLaDescripcion = document.createElement('p')
  deLaDescripcion.className = COLUMNA_DE_ANTES.descripcion
  deLaDescripcion.textContent = descripcion
  fantasma.append(delNombre, deLaDescripcion)
  padre.append(fantasma)
  const antes = fantasma.offsetHeight
  fantasma.remove()
  return antes - columna.offsetHeight
}

/** Abajo de 1024 (`escritorio` en falso), anota el tramo de la pantalla del equipo; lo vuelve a medir con cada cambio de tamaño. */
export function useTramoDelEquipo(pantalla: RefObject<HTMLElement | null>, escritorio: boolean, personas: readonly { readonly nombre: string; readonly descripcion: string }[]): void {
  useEffect(() => {
    const el = pantalla.current
    const panel = el?.closest('[data-panel]') ?? null
    if (escritorio || el === null || panel === null) return undefined
    let soltar: (() => void) | null = null
    const anotar = (): void => {
      soltar?.()
      soltar = null
      const escala = window.innerHeight / ALTO_DE_VIEWPORT_DE_LA_REFERENCIA
      const alto = el.offsetHeight
      const columnas = [...el.querySelectorAll<HTMLElement>('[data-pieza-a="persona"] > [data-velo-de-noche]')]
      if (!(escala > 0) || alto <= 0 || columnas.length !== personas.length) return
      const acortado = columnas.reduce((s, c, i) => s + acortadoDe(c, personas[i].nombre, personas[i].descripcion), 0)
      const estilo = getComputedStyle(el)
      // El contenido sin el `grow` de la calle (que llena el piso): la composición del equipo y el relleno de la pantalla.
      const composicion = el.querySelector<HTMLElement>('[data-composicion="equipo"]')
      const contenido = (composicion?.offsetHeight ?? alto) + parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom)
      const viejo = altoDeAntes(parseFloat(estilo.minHeight) || 0, contenido, acortado)
      if (!(viejo > 0) || Math.abs(alto - viejo) < 0.5) return
      const arranque = (el.getBoundingClientRect().top - panel.getBoundingClientRect().top) / escala
      soltar = anotarTramo({ panel, k: alto / viejo, arranque, largo: viejo / escala })
    }
    anotar()
    const observador = new ResizeObserver(anotar)
    observador.observe(el)
    return () => {
      observador.disconnect()
      soltar?.()
    }
  }, [pantalla, escritorio, personas])
}
