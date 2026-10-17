'use client'

import { useEffect, useRef } from 'react'

import { sonar } from '../../../_lib/sonido/bus'

import { CONTENIDO } from '../contenido'
import { PROYECTOS } from '../proyectos'

import { CONSULTA_DEL_PUNTERO_FINO, INTENCION_DEL_HOVER_MS, TIRA_DE_LA_TUYA, esTeclaDelSelector, saltoDeLaTecla, vistaDelPaso } from './estado'
import { LaTuya } from './LaTuya'
import { pasoDeLaPortada } from './pasos'
import { Tira, idsDeLaTira } from './Tira'
import type { PortfolioVivo } from './usePortfolio'


/** La tira de un botón de cabecera (`data-tira-indice`), o `null`. */
function tiraDe(el: EventTarget | null): number | null {
  if (!(el instanceof HTMLElement)) return null
  const v = el.closest<HTMLElement>('[data-tira-indice]')?.getAttribute('data-tira-indice')
  return v === undefined || v === null ? null : Number(v)
}

const SLUGS = [...PROYECTOS.map((p) => p.slug), 'la-tuya']

/**
 * [B1] EL ACORDEÓN — una tira por proyecto y la de «la tuya», en el orden fijo de la spec (plan §5.8 y §5.9).
 *
 * El patrón es el del acordeón de la WAI (cada tira lleva su cabecera —un botón con `aria-expanded` en un `h3`— y su contenido en el
 * mismo lugar; los contenidos NO son `region`: cuatro regiones más llenarían de puntos de referencia el documento). La activa es
 * ancha y las otras son lomos con el nombre girado. Todo cambio de tira es un SALTO de la página al paso (`saltarAlPaso`) y el
 * estado lo sigue: el clic, el hover con intención (150 ms quieto sobre un lomo, sólo con puntero fino), el teclado (←/→ y ↑/↓
 * cambian de tira, Enter abre y cierra la ficha, Esc vuelve a la portada) y un foco que entra al panel con el panel afuera.
 * Suena `tic` al cambiar de proyecto y `pestillo` al abrir la ficha (el bus respeta el mute).
 */
export function Acordeon({ vivo }: { readonly vivo: PortfolioVivo }): React.JSX.Element {
  const { fase, tira, vista } = vistaDelPaso(vivo.paso)
  const hover = useRef<number>(0)
  const antes = useRef({ fase, tira, vista })

  // Los sonidos: sólo con el panel adentro, y no al cargar (el primer estado no suena).
  useEffect(() => {
    const a = antes.current
    if (fase === 'adentro' && a.fase === 'adentro') {
      if (tira !== a.tira) sonar('tic')
      else if (vista === 'ficha' && a.vista !== 'ficha') sonar('pestillo')
    }
    antes.current = { fase, tira, vista }
  }, [fase, tira, vista])

  useEffect(() => () => window.clearTimeout(hover.current), [])

  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    const indice = tiraDe(e.target)
    if (indice === null || !esTeclaDelSelector(e.key)) return
    const destino = saltoDeLaTecla(e.key, indice, vivo.paso)
    if (destino === null) return
    e.preventDefault()
    vivo.saltarAlPaso(destino)
    const siguiente = Math.floor(destino / 2)
    if (siguiente !== indice) document.getElementById(idsDeLaTira(SLUGS[siguiente]).cabecera)?.focus({ preventScroll: true })
  }

  const alEntrarElFoco = (e: React.FocusEvent<HTMLDivElement>): void => {
    const indice = tiraDe(e.target)
    if (indice === null || fase === 'adentro' || !(e.target instanceof HTMLElement) || !e.target.matches(':focus-visible')) return
    vivo.saltarAlPaso(pasoDeLaPortada(indice))
  }

  const alPasar = (e: React.PointerEvent<HTMLDivElement>): void => {
    const indice = tiraDe(e.target)
    window.clearTimeout(hover.current)
    if (indice === null || indice === tira || !window.matchMedia(CONSULTA_DEL_PUNTERO_FINO).matches) return
    hover.current = window.setTimeout(() => vivo.saltarAlPaso(pasoDeLaPortada(indice)), INTENCION_DEL_HOVER_MS)
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
      onPointerLeave={() => window.clearTimeout(hover.current)}
    >
      {PROYECTOS.map((proyecto, i) => (
        <Tira key={proyecto.slug} proyecto={proyecto} indice={i} activa={tira === i} vista={tira === i ? vista : 'portada'} vivo={vivo} />
      ))}
      <LaTuya activa={tira === TIRA_DE_LA_TUYA} vivo={vivo} />
    </div>
  )
}
