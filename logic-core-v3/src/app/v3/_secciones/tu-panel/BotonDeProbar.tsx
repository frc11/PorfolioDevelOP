'use client'

import { ArrowRight } from 'lucide-react'
import { animate, useInView } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import { Reluciente } from '../../_componentes/efectos/Reluciente'
import { useMovimientoEnTodoAncho } from '../_contrato/coreografia'
import { CTA } from './contenido'

/**
 * [C2 · 60c] «PROBAR AHORA», EL BOTÓN GRANDE DEL CTA DEL PANEL — no es el botón de siempre del sitio: una píldora grande, en la
 * tinta, con un círculo claro y la flecha a la derecha, que dan ganas de tocar («a ver qué pasa si lo toco»).
 *
 *   · en reposo, cada `cicloMs` un MEDIO-APRETÓN: se hunde un poco y rebota (la escala del envoltorio, con la API de animaciones del
 *     navegador: corre en el compositor) y, por encima, el reflejo de `Reluciente` que lo barre cada tanto;
 *   · con el mouse encima se levanta (y `Reluciente` se intensifica solo: es hijo directo del botón); al presionarlo se aplasta y, al
 *     soltarlo, rebota con un resorte. Mientras está bajo el mouse, con el foco o apretado, el reposo se calla;
 *   · fuera de la pantalla, con movimiento reducido o sin la coreografía instalada (el HTML servido), quieto: ni reposo ni gestos.
 *
 * Por ahora NO HACE NADA (decisión de Valentino: para el lanzamiento el panel de prueba va a estar). Lo que hace se conecta en UN
 * lugar: `AL_PROBAR`, abajo.
 *
 * Tres capas, cada una con su transformada, para que no se pisen: el envoltorio (el reposo), el botón (el hover y el apretón, de
 * Motion) y el reflejo (su propia capa).
 */

/** Los números del botón. Las escalas, sin unidad; `levanta`, en píxeles de la `y` de Motion (hacia arriba). */
export const BOTON_DE_PROBAR = {
  /** Un medio-apretón cada tanto (ms): «cada ~3 s». */
  cicloMs: 3000,
  /** Lo que dura el medio-apretón (ms): hundirse y rebotar. El resto del ciclo, quieto. */
  apretonMs: 560,
  /** La escala en el fondo del medio-apretón: «se hunde un poco». */
  hundido: 0.94,
  /** El rebote, apenas más grande que el tamaño de siempre. */
  rebote: 1.035,
  /** Con el mouse encima, cuánto sube (px). */
  levanta: -4,
  /** Presionado: se aplasta. */
  aplastado: 0.9,
  /** El resorte del hover y del apretón: poco amortiguado, así al soltar rebota. */
  resorte: { type: 'spring', stiffness: 520, damping: 13, mass: 0.8 },
} as const

/** Lo que necesita el reposo (números sueltos: las pruebas lo corren con otros). */
export interface NumerosDelReposo {
  readonly cicloMs: number
  readonly apretonMs: number
  readonly hundido: number
  readonly rebote: number
}

/**
 * Los fotogramas de UN ciclo del reposo (para `Element.animate`, con la duración del ciclo): el medio-apretón ocupa el principio
 * (`apretonMs` sobre `cicloMs`) y el resto queda en el tamaño de siempre. Se hunde hasta `hundido`, rebota a `rebote` y vuelve a 1.
 */
export function fotogramasDelReposo(b: NumerosDelReposo = BOTON_DE_PROBAR): Keyframe[] {
  const fin = b.apretonMs / b.cicloMs
  return [
    { scale: '1', offset: 0, easing: 'ease-in' },
    { scale: String(b.hundido), offset: fin * 0.4, easing: 'ease-out' },
    { scale: String(b.rebote), offset: fin * 0.75, easing: 'ease-in-out' },
    { scale: '1', offset: fin },
    { scale: '1', offset: 1 },
  ]
}

/**
 * LO QUE HACE «PROBAR AHORA» — por ahora nada. Cuando exista el panel de prueba se conecta ACÁ (y en ningún otro lado): el
 * manejador que la abre.
 */
export const AL_PROBAR: (() => void) | undefined = undefined

export function BotonDeProbar(): React.JSX.Element {
  const anima = useMovimientoEnTodoAncho()
  const envoltorio = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const aLaVista = useInView(envoltorio)
  const [bajoElMouse, setBajoElMouse] = useState(false)
  const [conFoco, setConFoco] = useState(false)
  const late = anima && aLaVista && !bajoElMouse && !conFoco

  // El reposo: un ciclo infinito en el compositor, que se cancela (y vuelve al tamaño de siempre) cuando deja de tocar.
  useEffect(() => {
    const el = envoltorio.current
    if (!late || el === null || typeof el.animate !== 'function') return undefined
    const reposo = el.animate(fotogramasDelReposo(), { duration: BOTON_DE_PROBAR.cicloMs, iterations: Infinity })
    return () => reposo.cancel()
  }, [late])

  // El hover y el apretón, con el resorte (a mano y no con `whileTap`: Motion le sumaría al botón un `tabindex` que ya tiene).
  const mover = (destino: { readonly y?: number; readonly scale?: number }): void => {
    const el = boton.current
    if (!anima || el === null) return
    void animate(el, destino, BOTON_DE_PROBAR.resorte)
  }
  const esTecla = (e: React.KeyboardEvent): boolean => e.key === 'Enter' || e.key === ' '

  return (
    <div ref={envoltorio} data-pieza="probar-el-panel" data-reposo={late ? '' : undefined} className="inline-flex">
      <button
        ref={boton}
        type="button"
        data-pieza="probar-ahora"
        onClick={AL_PROBAR}
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          setBajoElMouse(true)
          mover({ y: BOTON_DE_PROBAR.levanta })
        }}
        onPointerLeave={() => {
          setBajoElMouse(false)
          mover({ y: 0, scale: 1 })
        }}
        onPointerDown={() => mover({ scale: BOTON_DE_PROBAR.aplastado, y: 0 })}
        onPointerUp={(e) => mover({ scale: 1, y: e.pointerType === 'mouse' ? BOTON_DE_PROBAR.levanta : 0 })}
        onPointerCancel={() => mover({ scale: 1, y: 0 })}
        onKeyDown={(e) => {
          if (esTecla(e) && !e.repeat) mover({ scale: BOTON_DE_PROBAR.aplastado })
        }}
        onKeyUp={(e) => {
          if (esTecla(e)) mover({ scale: 1 })
        }}
        // Sólo el foco del teclado calla el reposo: el del clic (el botón queda enfocado) no lo deja callado para siempre.
        onFocus={(e) => setConFoco(e.currentTarget.matches(':focus-visible'))}
        onBlur={() => setConFoco(false)}
        className="font-titulo font-fuerte text-fluido-titulo-s leading-titulo tracking-titulo bg-tinta text-fondo relative inline-flex cursor-pointer items-center gap-[var(--spacing-4)] overflow-hidden rounded-full py-[var(--spacing-3)] pr-[var(--spacing-3)] pl-[var(--spacing-8)] shadow-[var(--shadow-flotante)]"
      >
        <span>{CTA.boton}</span>
        <span aria-hidden="true" data-parte="circulo" className="bg-fondo text-tinta grid size-[var(--spacing-12)] place-items-center rounded-full">
          <ArrowRight className="size-[var(--spacing-6)]" strokeWidth={1.5} />
        </span>
        <Reluciente />
      </button>
    </div>
  )
}
