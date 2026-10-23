'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import { Imagen } from '../../../_componentes/medios/Imagen'
import { giroDeLaPieza, suscribirALaMirada } from '../../../_lib/escena/miradaDeLaCamara'
import { sonar } from '../../../_lib/sonido/bus'

import { PRESENCIA_DEL_CURSOR } from '../../../_chrome/cursor/presencia'

import { CATALOGO_DE_DEMOS, MEDIDA_DE_LA_PORTADA, TEXTO_DE_DEMOS, type Demo } from './catalogo'
import { conElDefectoDeDemos } from './defectos'
import { MS_DE_INTENCION, precargar } from './precarga'

/** [NOCTURNO B5] Los cantos de cada placa (el dorso y los cuatro costados: `demos.css`). */
export const LADOS_DE_LA_PLACA = ['atras', 'izquierda', 'derecha', 'arriba', 'abajo'] as const

/**
 * LA BIBLIOTECA — las demos en abanico, debajo del título. **[PORTFOLIO · DEMOS]**
 *
 * Cada pieza es un ANCLA al template, con su portada en la cara. Sin JavaScript,
 * o con un clic con modificador, abre el template en una pestaña nueva, que es
 * lo que hace el carrusel de abajo de 1024: el marcado de las dos ramas es el mismo,
 * y `s10-acceso` lo exige. Con JavaScript, un clic o Enter abre la demo acá mismo (el Genie de siempre).
 *
 * [NOCTURNO B5] **Placas 3D, fijas en el mundo.** Cada pieza es una placa con espesor (la portada y sus cantos) en el abanico de
 * siempre, vista por su propia cámara (`[data-parte="cara"]`), que gira con la MIRADA de la escena: lo que el mouse le suma a la
 * cámara (`miradaDeLaCamara.ts`, la de los títulos y los valores: los mismos topes, el mismo suavizado y la misma exageración del
 * CSS), al revés, así la placa queda quieta en el mundo y se le ven la perspectiva y los costados. Más grandes: el abanico llena su
 * columna (`demos.css`).
 *
 * ── Qué mueve qué ────────────────────────────────────────────────────────
 *
 * El hover y el foco son CSS (`demos.css`): la placa sube con un resorte crítico,
 * las vecinas se abren y la bajada es de 100 ms. El hueco de cada pieza queda
 * QUIETO —lo que se mueve es la placa—, así el puntero no pierde la pieza cuando
 * ésta se levanta. [C2-41e] Y lo ÚNICO que recibe el puntero es el ÁREA de cada pieza (`[data-parte="area"]`): su franja a la
 * vista, del borde izquierdo de su hueco al de la siguiente (la última, entera). Las áreas no se pisan y no se mueven con nada:
 *   · la cara (su cámara, la placa y los cantos) va sin puntero: antes la placa lo recibía y con su perspectiva asomaba unos
 *     píxeles fuera del hueco; con el mouse quieto ahí se levantaba, dejaba de estar bajo el puntero, bajaba y volvía a tocarlo
 *     (el hover que vibraba, `lote1/14`);
 *   · el ancla tampoco: el hueco entero de la levantada (más arriba que las otras) tapaba casi toda la franja de la siguiente, y un
 *     clic ahí abría la de antes (la verificación del orquestador: «la portada de la demo anterior»). Acá: el cartel (su nombre), el tic de la barra, las flechas, la precarga y la mirada.
 *
 * ⚠️ **EL CARTEL VA EN UN PORTAL, afuera de la sección.** Tiene que ser la
 * pastilla del navbar, y el navbar vive afuera de la sala invertida: adentro, sus
 * mismos tokens darían una pastilla oscura. Es UNO solo, que cambia de texto y de
 * lugar: acompaña a la pieza levantada, no al puntero, y por eso el nombre es
 * siempre el de la pieza que está arriba.
 *
 * [Cierre de INTERFAZ 2] Con el cursor de la sala (puntero fino, desde 1024, sin
 * movimiento reducido) el cartel del mouse es el del cursor, pegado a él; éste
 * queda para el foco del teclado y para cuando no hay cursor.
 */
export function Biblioteca({
  alAbrir,
  alejada,
}: {
  readonly alAbrir: (demo: Demo, pieza: HTMLAnchorElement) => void
  readonly alejada: boolean
}): React.JSX.Element {
  const estante = useRef<HTMLDivElement | null>(null)
  const cartel = useRef<HTMLSpanElement | null>(null)
  const intencion = useRef(0)
  // [C2-41e] El control del banco (`CONTROL=area-movil`): la placa vuelve a recibir el puntero, como antes.
  const [areaMovil] = useState(() => conElDefectoDeDemos('area-movil'))
  // [C2-41e] Y `CONTROL=area-solapada`: el ancla entera vuelve a recibir el puntero, como antes.
  const [areaSolapada] = useState(() => conElDefectoDeDemos('area-solapada'))
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

  // [NOCTURNO B5] La mirada de la escena, en el estante (una variable que leen las cinco cámaras): sólo cuando cambia.
  useEffect(() => {
    const el = estante.current
    if (el === null) return undefined
    const soltar = suscribirALaMirada((m) => el.style.setProperty('--mirada', giroDeLaPieza(m)))
    return () => {
      soltar()
      el.style.removeProperty('--mirada')
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
    // [NOCTURNO B5] El hover de la barra: una placa nueva bajo el puntero, un tic (con el sonido apagado, nada).
    sonar('tic')
    // [Cierre de INTERFAZ 2] Con el cursor de la sala, el cartel va pegado al cursor (`CursorDeLaSala.tsx`): uno solo.
    if (!PRESENCIA_DEL_CURSOR.montado) mostrarElCartel(e.currentTarget, demo)
    window.clearTimeout(intencion.current)
    intencion.current = window.setTimeout(() => precargar(demo.url), MS_DE_INTENCION)
  }

  const alEnfocar = (e: React.FocusEvent<HTMLAnchorElement>, demo: Demo): void => {
    if (!e.currentTarget.matches(':focus-visible')) return
    sonar('tic')
    mostrarElCartel(e.currentTarget, demo)
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
      <div ref={estante} data-pieza="estante" style={{ '--libros': CATALOGO_DE_DEMOS.length } as React.CSSProperties} {...(alejada ? { 'data-alejada': '' } : {})}>
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
            style={areaSolapada ? { pointerEvents: 'auto' } : undefined}
          >
            {/* La cámara de la placa (la mirada), la placa (el abanico y el hover), su portada y sus cantos. */}
            <span data-parte="cara" style={areaMovil ? { pointerEvents: 'auto' } : undefined}>
              <span data-parte="placa">
                <span data-parte="portada">
                  <Imagen src={demo.portada} alt="" ancho={MEDIDA_DE_LA_PORTADA.ancho} alto={MEDIDA_DE_LA_PORTADA.alto} sizes="(min-width: 1024px) 17vw, 160px" />
                </span>
                {LADOS_DE_LA_PLACA.map((lado) => (
                  <span key={lado} aria-hidden="true" data-parte="canto" data-lado={lado} />
                ))}
              </span>
            </span>
            {/* [C2-41e] El área que recibe el puntero: la franja a la vista de la pieza, quieta (`demos.css`). */}
            <span aria-hidden="true" data-parte="area" />
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
