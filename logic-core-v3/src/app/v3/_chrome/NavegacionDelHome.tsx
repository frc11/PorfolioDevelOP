'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Navegacion } from '../_componentes/chrome/Navegacion'
import { ENLACES_DE_MUESTRA } from '../_lib/navegacion'

/**
 * EL NAVBAR DEL HOME — la barra de siempre con su estado activo. **[CONTACTO]**
 *
 * El activo es la sección que cruza el medio del cuadro; si esa sección no está en la barra
 * (el hero, Números, Tu panel), no hay activo. El subrayado es UNA raya que se desliza hasta
 * el rótulo activo: se mide acá, una vez por cambio, contra la barra. Los clicks siguen
 * haciendo lo que hacían; «Contacto» abre el formulario (lo intercepta el contacto).
 */

/** Los ids de la barra que son secciones del home. */
const EN_LA_BARRA = new Set(ENLACES_DE_MUESTRA.map((e) => e.id))

/** La sección que cruza la línea del medio del cuadro. */
export function activoDe(idDeLaSeccion: string | null): string | null {
  return idDeLaSeccion !== null && EN_LA_BARRA.has(idDeLaSeccion) ? idDeLaSeccion : null
}

export function NavegacionDelHome({ className }: { readonly className?: string }): React.JSX.Element {
  const [activo, setActivo] = useState<string | null>(null)
  const raya = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const paneles = [...document.querySelectorAll<HTMLElement>('[data-panel]')]
    const cruzando = new Set<string>()
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          const id = e.target.getAttribute('data-panel')
          if (id === null) continue
          if (e.isIntersecting) cruzando.add(id)
          else cruzando.delete(id)
        }
        // La línea es de un píxel: a lo sumo una sección la cruza.
        const [id] = [...cruzando]
        setActivo(activoDe(id ?? null))
      },
      { rootMargin: '-50% 0px -49% 0px' },
    )
    paneles.forEach((p) => observador.observe(p))
    return () => observador.disconnect()
  }, [])

  useLayoutEffect(() => {
    const el = raya.current
    const barra = el?.parentElement
    if (el === null || barra === null || barra === undefined) return
    const ubicar = (): void => {
      const rotulo = activo === null ? null : barra.querySelector<HTMLElement>(`[data-nav-id="${activo}"] [data-parte="rotulo"]`)
      if (rotulo === null) {
        el.style.setProperty('--subrayado-visible', '0')
        return
      }
      const r = rotulo.getBoundingClientRect()
      const b = barra.getBoundingClientRect()
      el.style.setProperty('--subrayado-x', `${String(r.left - b.left + barra.scrollLeft)}px`)
      el.style.setProperty('--subrayado-ancho', `${String(r.width)}px`)
      el.style.setProperty('--subrayado-visible', '1')
    }
    ubicar()
    window.addEventListener('resize', ubicar)
    return () => window.removeEventListener('resize', ubicar)
  }, [activo])

  return (
    <Navegacion como="header" className={className} activo={activo}>
      <span ref={raya} data-parte="subrayado-activo" aria-hidden="true" />
    </Navegacion>
  )
}
