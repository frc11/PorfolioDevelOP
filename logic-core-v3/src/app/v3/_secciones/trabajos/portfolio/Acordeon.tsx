'use client'

import { useEffect, useRef } from 'react'
import { flushSync } from 'react-dom'

import { sonar } from '../../../_lib/sonido/bus'

import { CONTENIDO } from '../contenido'
import { PROYECTOS } from '../proyectos'

import { CONSULTA_DEL_PUNTERO_FINO, TIRA_DE_LA_TUYA, accionDeLaTecla, esTeclaDelSelector, seMovioDeVerdad, suenaElCambio, vistaDelPaso } from './estado'
import { LaTuya } from './LaTuya'
import { Tira, idsDeLaTira } from './Tira'
import { muestraElPoster, muestraSuContenido } from './transicion'
import type { PortfolioVivo } from './usePortfolio'
import { useTransicionDeLasTiras } from './useTransicionDeLasTiras'

/** La tira de un botón de cabecera (`data-tira-indice`), o `null`. */
function tiraDe(el: EventTarget | null): number | null {
  if (!(el instanceof HTMLElement)) return null
  const v = el.closest<HTMLElement>('[data-tira-indice]')?.getAttribute('data-tira-indice')
  return v === undefined || v === null ? null : Number(v)
}

const SLUGS = [...PROYECTOS.map((p) => p.slug), 'la-tuya']

const enfocar = (tira: number): void => document.getElementById(idsDeLaTira(SLUGS[tira]).cabecera)?.focus({ preventScroll: true })

/**
 * [B1.2c] ¿Activa el hover? Sólo con un puntero fino, sobre otro lomo, con el panel adentro, y si el puntero se movió de verdad desde
 * la última activación (los lomos que se reacomodan debajo no cuentan) y desde que la rueda tomó el control (`inerte`, `vivo.inerteDesde`: con el mouse
 * quieto, la rueda nunca reactiva un lomo). Y sólo con un `pointermove` (`mueve`): un lomo que llega debajo del mouse quieto (la carga,
 * el scroll) da `pointerover` sin que el puntero se mueva. [B1.2d] A3 · y nunca durante una transición que pidió la rueda (`deLaRueda`:
 * su vuelo o el cambio de tiras): esa transición termina sí o sí. Puro: s76 lo prueba con los casos de la rueda.
 */
export function activaElHover(
  e: { readonly x: number; readonly y: number; readonly indice: number | null; readonly fino: boolean; readonly mueve: boolean },
  tira: number,
  adentro: boolean,
  activacion: { readonly x: number; readonly y: number } | null,
  inerte: { readonly x: number; readonly y: number } | null,
  deLaRueda = false,
): boolean {
  if (e.indice === null || e.indice === tira || !adentro || !e.fino || !e.mueve || deLaRueda) return false
  return seMovioDeVerdad(activacion, e.x, e.y) && seMovioDeVerdad(inerte, e.x, e.y)
}

/**
 * [B1] EL ACORDEÓN — una tira por proyecto y la de «la tuya», en el orden fijo de la spec (plan §5.8 y §5.9; [B1.2b] §12, puntos
 * 5 y 6; [B1.2c] §13, puntos 4 y 5).
 *
 * El patrón es el del acordeón de la WAI (cada tira lleva su cabecera —un botón con `aria-expanded` en un `h3`— y su contenido en el
 * mismo lugar; los contenidos NO son `region`: cuatro regiones más llenarían de puntos de referencia el documento). La activa es
 * ancha y las otras son lomos con el nombre girado.
 *
 * [B1.2c] EL PROYECTO ACTIVO MANDA. El hover (sólo con puntero fino), el clic o el tap en un lomo y las teclas lo ACTIVAN y el scroll se
 * acomoda en silencio a su tramo (`saltarAlPaso(i, true)`: Lenis inmediato). El cambio se ve en ORDEN (`transicion.ts`): la salida
 * completa de la tira que se va, un respiro y la entrada de la siguiente; cruzando varios, una sola salida y una sola entrada. La rueda
 * avanza de a un proyecto (`useRuedaDelPortfolio`) y mientras tiene el control el hover queda inerte (`activaElHover`). El teclado:
 * ←/→ cambian de proyecto, Enter en un lomo lo activa, Esc devuelve el foco al lomo activo. Suena `tic` al cambiar de proyecto (el
 * bus respeta el mute; no suena al cargar ni en una ráfaga).
 */
export function Acordeon({ vivo }: { readonly vivo: PortfolioVivo }): React.JSX.Element {
  const { fase, tira } = vistaDelPaso(vivo.paso)
  // Con el panel afuera no hay nada que ver salir: la tira pedida queda de una (el panel entra con ella).
  const transicion = useTransicionDeLasTiras(tira, vivo.reducido || !vivo.panel)
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
  // [B1.2d] A3 · y cuando la transición termina, otra vez: el hover vuelve recién con un movimiento nuevo desde ahí.
  useEffect(() => {
    if (transicion.fase === 'quieta') activacion.current = puntero.current
  }, [transicion.fase])

  const alTeclear = (e: React.KeyboardEvent<HTMLDivElement>): void => {
    if (!esTeclaDelSelector(e.key)) return
    const accion = accionDeLaTecla(e.key, tiraDe(e.target), vivo.paso)
    if (accion === null) return
    e.preventDefault()
    if (accion.salto !== null) vivo.saltarAlPaso(accion.salto, true)
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
    const fino = indice !== null && window.matchMedia(CONSULTA_DEL_PUNTERO_FINO).matches
    const mueve = e.type === 'pointermove'
    // [B1.2d] A3 · la transición que pidió la rueda (su vuelo, o el cambio de tiras que todavía no terminó) no se interrumpe.
    const deLaRueda = vivo.deLaRueda() && (vivo.enVuelo() || transicion.fase !== 'quieta')
    if (!activaElHover({ x: e.clientX, y: e.clientY, indice, fino, mueve }, tira, fase === 'adentro', activacion.current, vivo.inerteDesde(e.clientX, e.clientY), deLaRueda) || indice === null) return
    activacion.current = { x: e.clientX, y: e.clientY }
    // En este cuadro: el proyecto se activa ya y el scroll se acomoda en silencio a su tramo.
    flushSync(() => vivo.saltarAlPaso(indice, true))
  }

  const visibleLa = (i: number): boolean => vivo.panel && muestraSuContenido(transicion, i)
  return (
    <div
      data-pieza="acordeon"
      data-transicion={transicion.fase}
      role="group"
      aria-label={CONTENIDO.acordeon}
      className="flex h-full w-full"
      onKeyDown={alTeclear}
      onFocus={alEntrarElFoco}
      onPointerOver={alPasar}
      onPointerMove={alPasar}
    >
      {PROYECTOS.map((proyecto, i) => (
        <Tira key={proyecto.slug} proyecto={proyecto} indice={i} activa={transicion.ancha === i} visible={visibleLa(i)} poster={muestraElPoster(transicion, i)} vivo={vivo} />
      ))}
      <LaTuya activa={transicion.ancha === TIRA_DE_LA_TUYA} visible={visibleLa(TIRA_DE_LA_TUYA)} vivo={vivo} />
    </div>
  )
}
