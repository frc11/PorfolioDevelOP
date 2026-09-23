'use client'

import type { CSSProperties } from 'react'

import { Bloque } from '../_contrato/coreografia'
import { CanalDeUnaPieza } from '../_contrato/canales'
import { PALABRAS_DEL_FONDO } from './contenido'

/**
 * EL FONDO DECORATIVO — palabras enormes y fragmentos de interfaz en línea fina,
 * casi del color del papel, POR DETRÁS de las features (SPRINT PANEL 2).
 *
 * ── El contraste es el del «What's new» de nk, medido ─────────────────────
 *
 * nk.studio (1440 × 900, asentado, cuatro posiciones): `rgb(186,186,186)` a
 * opacidad efectiva 0,1 sobre `rgb(253,253,249)` → **1,0595:1**. Acá la tinta
 * (`--color-tinta`) sobre el papel (`--color-fondo`) da ese mismo 1,0595:1 con
 * alfa 0,0285; `s6-tu-panel` lo recalcula desde el tema y lo afirma.
 *
 * El tamaño también es el de nk: 216 px a 1440, o sea `--text-fluido-display-xl`
 * (104 px a ese ancho) por 216 / 104.
 *
 * Decorativo entero: `aria-hidden` en la raíz, sin foco y fuera del árbol de
 * lectura. Sólo desde `escritorio`: en la columna de móvil no hay aire donde se
 * lea como fondo, y quedaría tapado por las features.
 */

/** Alfa de `--color-tinta` sobre `--color-fondo` que reproduce el 1,0595:1 de nk. */
export const ALFA_DEL_FONDO = 0.0285

/** Profundidad del fondo: más lejos que las features, así que más lento que el scroll. */
export const VELOCIDAD_DEL_FONDO = -0.18

type Objeto = 'curva' | 'interruptor' | 'burbuja' | 'cursor' | 'fila'

interface Lugar {
  readonly x: number
  readonly y: number
}

/** Dónde va cada palabra: x en % del ancho útil, y en svh desde el tope del caos. */
const LUGARES_DE_PALABRAS: readonly Lugar[] = [
  { x: 34, y: 2 },
  { x: 1, y: 58 },
  { x: 38, y: 118 },
  { x: 8, y: 176 },
  { x: 52, y: 236 },
  { x: 2, y: 292 },
  { x: 40, y: 352 },
]

/** Los objetos, con su ancho en % del ancho útil. */
const OBJETOS: readonly (Lugar & { readonly objeto: Objeto; readonly ancho: number })[] = [
  { objeto: 'curva', x: 36, y: 64, ancho: 20 },
  { objeto: 'interruptor', x: 88, y: 150, ancho: 6 },
  { objeto: 'burbuja', x: 6, y: 214, ancho: 14 },
  { objeto: 'cursor', x: 44, y: 300, ancho: 3 },
  { objeto: 'fila', x: 58, y: 336, ancho: 30 },
]

function Trazo({ objeto }: { readonly objeto: Objeto }): React.JSX.Element {
  const comun = { fill: 'none', stroke: 'currentColor', strokeWidth: 1, vectorEffect: 'non-scaling-stroke' } as const
  switch (objeto) {
    case 'curva':
      return (
        <svg viewBox="0 0 200 80" className="block w-full">
          <path {...comun} d="M0 79 H200 M0 70 C 30 70 40 30 70 38 S 110 60 130 30 S 170 8 200 12" />
        </svg>
      )
    case 'interruptor':
      return (
        <svg viewBox="0 0 48 24" className="block w-full">
          <rect {...comun} x="0.5" y="0.5" width="47" height="23" rx="11.5" />
          <circle {...comun} cx="35" cy="12" r="8" />
        </svg>
      )
    case 'burbuja':
      return (
        <svg viewBox="0 0 120 80" className="block w-full">
          <path {...comun} d="M12 1 H108 A11 11 0 0 1 119 12 V50 A11 11 0 0 1 108 61 H34 L18 78 V61 H12 A11 11 0 0 1 1 50 V12 A11 11 0 0 1 12 1 Z" />
        </svg>
      )
    case 'cursor':
      return (
        <svg viewBox="0 0 20 30" className="block w-full">
          <path {...comun} d="M1 1 V25 L7 19 L11 29 L15 27 L11 17 H19 Z" />
        </svg>
      )
    case 'fila':
      return (
        <svg viewBox="0 0 300 40" className="block w-full">
          <path {...comun} d="M0 0.5 H300 M0 39.5 H300 M12 20 H70 M110 20 H150 M190 20 H230 M262 14 H288 V26 H262 Z" />
        </svg>
      )
  }
}

function Pieza({ lugar, ancho, children }: { readonly lugar: Lugar; readonly ancho?: number; readonly children: React.ReactNode }): React.JSX.Element {
  const estilo = { '--x': `${lugar.x}%`, '--y': `${lugar.y}svh`, '--w': ancho === undefined ? 'auto' : `${ancho}%`, opacity: ALFA_DEL_FONDO } as CSSProperties
  return (
    <div data-profundidad={VELOCIDAD_DEL_FONDO} style={estilo} className="text-tinta absolute top-[var(--y)] left-[var(--x)] w-[var(--w)]">
      <Bloque patron="P2" rango="ventana-visible">
        {(progreso) => (
          <CanalDeUnaPieza progreso={progreso} patron="P2">
            {children}
          </CanalDeUnaPieza>
        )}
      </Bloque>
    </div>
  )
}

export function Fondo(): React.JSX.Element {
  return (
    <div aria-hidden="true" data-pieza="fondo-del-panel" className="pointer-events-none absolute inset-0 hidden overflow-x-clip select-none escritorio:block">
      {PALABRAS_DEL_FONDO.map((palabra, i) => (
        <Pieza key={palabra} lugar={LUGARES_DE_PALABRAS[i]}>
          <span className="font-display block text-[length:calc(var(--text-fluido-display-xl)*216/104)] leading-none whitespace-nowrap">{palabra}</span>
        </Pieza>
      ))}
      {OBJETOS.map((o) => (
        <Pieza key={o.objeto} lugar={o} ancho={o.ancho}>
          <Trazo objeto={o.objeto} />
        </Pieza>
      ))}
    </div>
  )
}
