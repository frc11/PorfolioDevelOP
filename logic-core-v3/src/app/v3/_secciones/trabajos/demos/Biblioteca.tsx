'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Imagen } from '../../../_componentes/medios/Imagen'

import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, TEXTO_DE_DEMOS, type Demo } from './catalogo'
import { MS_DE_INTENCION, precargar } from './precarga'

/**
 * LA BIBLIOTECA — las demos como libros en un estante. **[PORTFOLIO · DEMOS]**
 *
 * Cada pieza es un ANCLA al template, con su portada en la cara. Sin JavaScript,
 * o con un clic con modificador, abre el template en una pestaña nueva, que es
 * lo que hace la cinta de abajo de 1025: el marcado de las dos ramas es el mismo,
 * y `s10-acceso` lo exige. Con JavaScript, un clic o Enter abre la demo acá mismo.
 *
 * ── Qué mueve qué ────────────────────────────────────────────────────────
 *
 * El hover y el foco son CSS (`demos.css`): la cara sube con un resorte crítico,
 * las vecinas se abren y la bajada es de 100 ms. El hueco de cada pieza queda
 * QUIETO —lo que se mueve es la cara—, así el puntero no pierde la pieza cuando
 * ésta se levanta. Acá sólo hay tres cosas: el cartel, las flechas y la precarga.
 *
 * ⚠️ **EL CARTEL VA EN UN PORTAL, afuera de la sección.** Tiene que ser la
 * pastilla del navbar, y el navbar vive afuera de la sala invertida: adentro, sus
 * mismos tokens darían una pastilla oscura. Es UNO solo, que cambia de texto y de
 * lugar: acompaña a la pieza levantada, no al puntero, y por eso el nombre es
 * siempre el de la pieza que está arriba.
 */
export function Biblioteca({
  alAbrir,
  alejada,
}: {
  readonly alAbrir: (demo: Demo, pieza: HTMLAnchorElement) => void
  readonly alejada: boolean
}): React.JSX.Element {
  const cartel = useRef<HTMLSpanElement | null>(null)
  const intencion = useRef(0)
  // Esta rama no se sirve: se monta en el cliente cuando llegan las primitivas.
  const [raiz] = useState<HTMLElement | null>(() => (typeof document === 'undefined' ? null : document.querySelector<HTMLElement>('[data-v3]')))

  useEffect(() => {
    // Si la página se mueve, la pieza ya no está donde el cartel la dejó.
    const esconder = (): void => cartel.current?.removeAttribute('data-visible')
    window.addEventListener('scroll', esconder, { passive: true })
    return () => {
      window.removeEventListener('scroll', esconder)
      window.clearTimeout(intencion.current)
    }
  }, [])

  const mostrarElCartel = (pieza: HTMLAnchorElement, demo: Demo): void => {
    const el = cartel.current
    if (el === null) return
    const r = pieza.getBoundingClientRect()
    el.textContent = TEXTO_DE_DEMOS.cartelDeLaPieza(demo.nombre)
    el.style.setProperty('left', `${(r.left + r.width / 2).toFixed(1)}px`)
    // Arriba de la cara LEVANTADA: el alza del estante (`--spacing-6`) y un paso de aire.
    el.style.setProperty('bottom', `calc(${(window.innerHeight - r.top).toFixed(1)}px + var(--spacing-6) + var(--spacing-3))`)
    el.setAttribute('data-visible', '')
  }
  const esconderElCartel = (): void => {
    cartel.current?.removeAttribute('data-visible')
    window.clearTimeout(intencion.current)
  }

  const alEntrar = (e: React.PointerEvent<HTMLAnchorElement>, demo: Demo): void => {
    if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return
    mostrarElCartel(e.currentTarget, demo)
    window.clearTimeout(intencion.current)
    intencion.current = window.setTimeout(() => precargar(demo.url), MS_DE_INTENCION)
  }

  const alEnfocar = (e: React.FocusEvent<HTMLAnchorElement>, demo: Demo): void => {
    if (e.currentTarget.matches(':focus-visible')) mostrarElCartel(e.currentTarget, demo)
  }

  const alTeclear = (e: React.KeyboardEvent<HTMLAnchorElement>, i: number): void => {
    const paso = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0
    if (paso === 0) return
    e.preventDefault()
    const piezas = e.currentTarget.parentElement?.querySelectorAll<HTMLAnchorElement>('[data-pieza="libro"]')
    piezas?.[Math.min(CATALOGO_DE_DEMOS.length - 1, Math.max(0, i + paso))]?.focus()
  }

  const alHacerClic = (e: React.MouseEvent<HTMLAnchorElement>, demo: Demo): void => {
    // Con un modificador o la rueda, el ancla hace lo suyo: pestaña nueva.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
    e.preventDefault()
    esconderElCartel()
    alAbrir(demo, e.currentTarget)
  }

  return (
    <>
      {/* `--libros`: el estante calcula con él cuánto se pisan para entrar en su columna. */}
      <div data-pieza="estante" style={{ '--libros': CATALOGO_DE_DEMOS.length } as React.CSSProperties} {...(alejada ? { 'data-alejada': '' } : {})}>
        {CATALOGO_DE_DEMOS.map((demo, i) => (
          <a
            key={demo.slug}
            href={demo.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-haspopup="dialog"
            aria-label={`${demo.nombre}, ${demo.rubro}`}
            data-pieza="libro"
            data-demo={demo.slug}
            onPointerEnter={(e) => alEntrar(e, demo)}
            onPointerLeave={esconderElCartel}
            onFocus={(e) => alEnfocar(e, demo)}
            onBlur={esconderElCartel}
            onKeyDown={(e) => alTeclear(e, i)}
            onClick={(e) => alHacerClic(e, demo)}
          >
            <span data-parte="cara">
              <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="160px" />
            </span>
          </a>
        ))}
      </div>
      {raiz === null
        ? null
        : createPortal(
            <span
              ref={cartel}
              aria-hidden="true"
              data-pieza="cartel-de-demos"
              data-parte="del-estante"
              className="text-cuerpo tracking-texto leading-texto font-semi"
            />,
            raiz,
          )}
    </>
  )
}
