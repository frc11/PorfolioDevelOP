'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { fijarModoDelChrome, type ModoDelChrome } from '../contacto/apertura'
import { ENLACES_DEL_HOME } from '../enlaces'

/**
 * [NAVBAR] LA BARRA DEL HOME — la pastilla de escritorio, propia de /v3 (antes `NavegacionDelHome` montaba la pieza
 * compartida `_componentes/chrome/Navegacion.tsx`, que sigue igual para la galería).
 *
 * La misma pastilla visual (`_estilos/barra.css`), con los ítems del home. [NAVBAR] Retoque 4: el hover es TRANQUILO
 * (el rollover tipo botón de INTERFAZ 1 quedó afuera de la barra: el CTA, el mail, WhatsApp, los proyectos): un
 * resaltado suave que se desliza al ítem señalado (al cierre del sprint quedó la variante `b`; la `a` y su bandera se
 * borraron). El teclado es el de siempre: los seis son enlaces en el orden de lectura, con el anillo de foco de dos tonos (`foco.css`)
 * y la misma respuesta que el mouse; Enter viaja (el viaje los escucha por `SELECTOR_DE_LOS_VIAJES`) y «Contacto» abre
 * el formulario.
 *
 * El activo es la sección que cruza el medio del cuadro; si no está en la barra (el hero, Números, el cierre), no hay.
 * El indicador es el resaltado, UNO: descansa en el activo y viaja al ítem que el mouse o el foco señalan. Se mide acá,
 * contra la barra, una vez por cambio.
 *
 * El modo (`data-modo`) lo decide el ancho real: la barra si entra y está encendida, si no el menú del teléfono. Abajo
 * de `medio` la pastilla está apagada (`CLASE_DE_LA_PASTILLA_APAGADA`, en el montaje) y es el menú, aunque la lista
 * entrara: antes quedaba una franja (de 628 a 860) sin barra a la vista y sin menú.
 */

/** Los ids de la barra que son secciones del home. */
const EN_LA_BARRA = new Set(ENLACES_DEL_HOME.map((e) => e.id))

/**
 * ¿Entra la barra entera? La pastilla tiene un ancho máximo y recorta su lista; si la lista se pasa, no entra y el
 * chrome pasa al menú del teléfono. Medio píxel de tolerancia por el redondeo. Apagada, es el menú.
 */
export function modoDelChrome(anchoDeLaLista: number, anchoDeLaPastilla: number, apagada = false): ModoDelChrome {
  return !apagada && anchoDeLaLista <= anchoDeLaPastilla + 0.5 ? 'barra' : 'menu'
}

/** La sección que cruza la línea del medio del cuadro, si está en la barra. */
export function activoDe(idDeLaSeccion: string | null): string | null {
  return idDeLaSeccion !== null && EN_LA_BARRA.has(idDeLaSeccion) ? idDeLaSeccion : null
}

export function BarraDelHome({ className }: { readonly className?: string }): React.JSX.Element {
  const [activo, setActivo] = useState<string | null>(null)
  const pastillaRef = useRef<HTMLElement>(null)
  const resaltado = useRef<HTMLSpanElement>(null)
  /** El ítem que el mouse o el foco señalan (el resaltado va ahí); null: ninguno. */
  const senalado = useRef<HTMLElement | null>(null)
  const ubicarElResaltado = useRef<() => void>(() => undefined)

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

  // El modo se decide por el ancho real, una medición acá: las secciones no preguntan el ancho.
  useLayoutEffect(() => {
    const pastilla = pastillaRef.current
    const cabecera = pastilla?.parentElement
    if (pastilla === null || pastilla === undefined || cabecera === null || cabecera === undefined) return
    const medir = (): void => {
      const modo = modoDelChrome(pastilla.scrollWidth, pastilla.clientWidth, getComputedStyle(cabecera).visibility === 'hidden')
      cabecera.setAttribute('data-modo', modo)
      fijarModoDelChrome(modo)
    }
    medir()
    const observador = new ResizeObserver(medir)
    observador.observe(document.documentElement)
    const lista = pastilla.querySelector('[data-parte="lista"]')
    if (lista !== null) observador.observe(lista)
    return () => observador.disconnect()
  }, [])

  useLayoutEffect(() => {
    const barra = pastillaRef.current
    if (barra === null) return
    /** El resaltado bajo un ítem de la barra (o apagado, si no hay ninguno). */
    const ubicarBajo = (pieza: HTMLElement | null, debajo: HTMLElement | null): void => {
      if (pieza === null) return
      if (debajo === null) {
        pieza.style.setProperty('--resaltado-visible', '0')
        return
      }
      const r = debajo.getBoundingClientRect()
      const b = barra.getBoundingClientRect()
      pieza.style.setProperty('--resaltado-x', `${String(r.left - b.left + barra.scrollLeft)}px`)
      pieza.style.setProperty('--resaltado-ancho', `${String(r.width)}px`)
      pieza.style.setProperty('--resaltado-visible', '1')
    }
    const delActivo = activo === null ? null : barra.querySelector<HTMLElement>(`[data-nav-id="${activo}"]`)
    const ubicar = (): void => ubicarBajo(resaltado.current, senalado.current ?? delActivo)
    ubicarElResaltado.current = ubicar
    ubicar()
    window.addEventListener('resize', ubicar)
    return () => window.removeEventListener('resize', ubicar)
  }, [activo])

  // [NAVBAR] El ítem señalado: el mouse encima o el foco del teclado.
  useEffect(() => {
    const barra = pastillaRef.current
    if (barra === null) return
    const senalar = (el: HTMLElement | null): void => {
      senalado.current = el
      ubicarElResaltado.current()
    }
    const alEntrar = (e: Event): void => senalar(e.target instanceof Element ? e.target.closest<HTMLElement>('[data-pieza="barra-enlace"]') : null)
    const alSalir = (): void => senalar(null)
    const alPerderElFoco = (e: FocusEvent): void => {
      if (!(e.relatedTarget instanceof Node && barra.contains(e.relatedTarget))) senalar(null)
    }
    barra.addEventListener('pointerover', alEntrar)
    barra.addEventListener('pointerleave', alSalir)
    barra.addEventListener('focusin', alEntrar)
    barra.addEventListener('focusout', alPerderElFoco)
    return () => {
      barra.removeEventListener('pointerover', alEntrar)
      barra.removeEventListener('pointerleave', alSalir)
      barra.removeEventListener('focusin', alEntrar)
      barra.removeEventListener('focusout', alPerderElFoco)
    }
  }, [])

  return (
    <header data-pieza="barra" className={className}>
      <nav ref={pastillaRef} data-parte="pastilla" aria-label="Navegación principal">
        <ul data-parte="lista">
          {ENLACES_DEL_HOME.map((enlace) => {
            const esActivo = enlace.id === activo
            return (
              <li key={enlace.id}>
                <a
                  href={enlace.destino}
                  data-pieza="barra-enlace"
                  data-nav-id={enlace.id}
                  data-activo={esActivo ? 'true' : undefined}
                  aria-current={esActivo ? 'true' : undefined}
                  className="text-cuerpo tracking-texto leading-texto font-semi"
                >
                  <span data-parte="rotulo">{enlace.rotulo}</span>
                </a>
              </li>
            )
          })}
        </ul>
        <span ref={resaltado} data-parte="resaltado" aria-hidden="true" />
      </nav>
    </header>
  )
}
