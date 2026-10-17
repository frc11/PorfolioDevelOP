'use client'

import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

import { sonar } from '../../../_lib/sonido/bus'

import { CONTENIDO } from '../contenido'
import { PROYECTOS } from '../proyectos'

import { CONSULTA_DEL_PUNTERO_FINO, TIRA_DE_LA_TUYA, accionDeLaTecla, esTeclaDelSelector, seMovioDeVerdad, suenaElCambio, vistaDelPaso } from './estado'
import { LaTuya } from './LaTuya'
import { Tira, idsDeLaTira } from './Tira'
import type { PortfolioVivo } from './usePortfolio'

/** La tira de un botón de cabecera (`data-tira-indice`), o `null`. */
function tiraDe(el: EventTarget | null): number | null {
  if (!(el instanceof HTMLElement)) return null
  const v = el.closest<HTMLElement>('[data-tira-indice]')?.getAttribute('data-tira-indice')
  return v === undefined || v === null ? null : Number(v)
}

const SLUGS = [...PROYECTOS.map((p) => p.slug), 'la-tuya']

const enfocar = (tira: number): void => document.getElementById(idsDeLaTira(SLUGS[tira]).cabecera)?.focus({ preventScroll: true })

/**
 * [B1] EL ACORDEÓN — una tira por proyecto y la de «la tuya», en el orden fijo de la spec (plan §5.8 y §5.9; [B1.2b] §12, puntos
 * 5 y 6).
 *
 * El patrón es el del acordeón de la WAI (cada tira lleva su cabecera —un botón con `aria-expanded` en un `h3`— y su contenido en el
 * mismo lugar; los contenidos NO son `region`: cuatro regiones más llenarían de puntos de referencia el documento). La activa es
 * ancha y las otras son lomos con el nombre girado. Todo cambio de tira es un SALTO de la página al paso (`saltarAlPaso`), que pone
 * la tira de destino en el mismo cuadro: el clic, el teclado (←/→ cambian de proyecto, Enter en un lomo lo activa, Esc devuelve el
 * foco al lomo activo), un foco que entra al panel con el panel afuera y [B1.2b] el hover, INSTANTÁNEO (sólo con puntero fino):
 * cambia en el mismo cuadro del `pointerover` (`flushSync`) y el salto de Lenis va después. Sus guardas: cruzando varios lomos
 * seguidos gana el último y suena un solo `tic`; después de una activación, los lomos que se reacomodan debajo del puntero no
 * activan nada hasta que el puntero se mueva de verdad (`seMovioDeVerdad`). Suena `tic` al cambiar de proyecto (el bus respeta el
 * mute; no suena al cargar ni en una ráfaga).
 */
export function Acordeon({ vivo }: { readonly vivo: PortfolioVivo }): React.JSX.Element {
  const { fase, tira } = vistaDelPaso(vivo.paso)
  const antes = useRef({ fase, tira, cuando: Number.NEGATIVE_INFINITY })
  /** Dónde está el puntero (el último evento) y dónde estaba en la última activación: los lomos que se corren debajo no cuentan. */
  const puntero = useRef<{ readonly x: number; readonly y: number } | null>(null)
  const activacion = useRef<{ readonly x: number; readonly y: number } | null>(null)

  // Con cada cambio de tira (por el hover, el clic, el teclado o el scroll) las tiras se reacomodan: el puntero de ese momento es
  // la activación. El sonido: con el panel adentro, al cambiar de proyecto, y uno por ráfaga (el primero).
  useEffect(() => {
    const a = antes.current
    const ahora = performance.now()
    const cambio = fase === 'adentro' && a.fase === 'adentro' && tira !== a.tira
    if (cambio && suenaElCambio(a.cuando, ahora)) sonar('tic')
    activacion.current = puntero.current
    antes.current = { fase, tira, cuando: cambio ? ahora : a.cuando }
  }, [fase, tira])

  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!esTeclaDelSelector(e.key)) return
    const accion = accionDeLaTecla(e.key, tiraDe(e.target), vivo.paso)
    if (accion === null) return
    e.preventDefault()
    if (accion.salto !== null) vivo.saltarAlPaso(accion.salto)
    if (accion.foco !== null) enfocar(accion.foco)
  }

  const alEntrarElFoco = (e: React.FocusEvent<HTMLDivElement>): void => {
    const indice = tiraDe(e.target)
    if (indice === null || fase === 'adentro' || !(e.target instanceof HTMLElement) || !e.target.matches(':focus-visible')) return
    vivo.saltarAlPaso(indice)
  }

  const alPasar = (e: React.PointerEvent<HTMLDivElement>): void => {
    puntero.current = { x: e.clientX, y: e.clientY }
    const indice = tiraDe(e.target)
    if (indice === null || indice === tira || fase !== 'adentro' || !window.matchMedia(CONSULTA_DEL_PUNTERO_FINO).matches) return
    if (!seMovioDeVerdad(activacion.current, e.clientX, e.clientY)) return
    activacion.current = { x: e.clientX, y: e.clientY }
    // En este cuadro: la tira cambia ya y la página la sigue con el salto.
    flushSync(() => vivo.saltarAlPaso(indice))
  }

  return (
    <div
      data-pieza="acordeon"
      role="group"
      aria-label={CONTENIDO.acordeon}
      className="flex h-full w-full"
      onKeyDown={alTeclear}
      onFocus={alEntrarElFoco}
      onPointerOver={alPasar}
      onPointerMove={alPasar}
    >
      {PROYECTOS.map((proyecto, i) => (
        <Tira key={proyecto.slug} proyecto={proyecto} indice={i} activa={tira === i} vivo={vivo} />
      ))}
      <LaTuya activa={tira === TIRA_DE_LA_TUYA} vivo={vivo} />
    </div>
  )
}
