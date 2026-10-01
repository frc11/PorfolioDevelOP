'use client'

import { Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'

import { Caption, Micro } from '../tipografia/Textos'
import { PEDIDOS_DE_EJEMPLO, QUIEN_DE_EJEMPLO, ROTULO_DE_EJEMPLO, ROTULO_DE_LA_ACTIVIDAD } from './ejemplos'
import { useLatido } from './useLatido'

/**
 * [INTERFAZ 2] T3 · TU PANEL, FUNCIONANDO — una tarjeta con el panel andando solo, con datos de ejemplo.
 *
 * Cada latido (2,6 s) entra un pedido de ejemplo arriba de la lista y la barra de actividad corre un lugar. [Cierre de
 * INTERFAZ 2] En el producto, y sin el contador: la barra sola (ningún número en la tarjeta). Es la voz de la sección (las
 * capturas reales del panel están en la galería): lo mismo, pero vivo. Oscura como las capturas (el panel es oscuro),
 * con la tinta y el papel dados vuelta A MANO: la sección no se da vuelta (`s7-integracion`).
 *
 * Sin estilos en línea ni transformadas en el marcado (las reglas de la sección, `s6-tu-panel`): las filas entran con
 * `@starting-style` y bajan de lugar por clase (una transición), la barra es un SVG con el alto en sus atributos.
 *
 * Para el lector: la tarjeta se nombra («ejemplo del panel funcionando») y lo que se mueve no se anuncia (cambiaría
 * cada dos segundos). Se pausa con su botón (WCAG 2.2.2: se mueve solo más de cinco segundos), y sola fuera de cuadro o
 * con movimiento reducido (`useLatido.ts`).
 */
export const MS_DEL_LATIDO_DEL_PANEL = 2600
const FILAS_A_LA_VISTA = 3
const BARRAS = 24

/** Una altura de barra que parece actividad y es siempre la misma para el mismo latido (sin azar). */
export function alturaDeLaBarra(i: number): number {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return 0.3 + 0.7 * (s - Math.floor(s))
}

/** El lugar de cada fila: arriba la que acaba de entrar; la cuarta se va por abajo, desvaneciéndose. */
const LUGAR_DE_LA_FILA = [
  'translate-y-0 opacity-100',
  'translate-y-[var(--spacing-12)] opacity-60',
  'translate-y-[calc(var(--spacing-12)*2)] opacity-60',
  'translate-y-[calc(var(--spacing-12)*3)] opacity-0',
] as const

export function PanelEnVivo(): React.JSX.Element {
  const caja = useRef<HTMLElement>(null)
  const [pausado, setPausado] = useState(false)
  // Arranca con la lista llena (tres pedidos): quieta, con movimiento reducido, se ve así.
  const latido = useLatido(caja, MS_DEL_LATIDO_DEL_PANEL, pausado) + FILAS_A_LA_VISTA - 1
  const filas: { readonly id: number; readonly que: string; readonly desde: string }[] = []
  for (let k = 0; k < LUGAR_DE_LA_FILA.length && latido - k >= 0; k += 1) filas.push({ id: latido - k, ...PEDIDOS_DE_EJEMPLO[(latido - k) % PEDIDOS_DE_EJEMPLO.length] })

  return (
    <figure
      ref={caja}
      data-pieza="panel-en-vivo"
      aria-label="Ejemplo del panel funcionando, con datos de ejemplo"
      className="bg-tinta text-fondo border-fondo/10 flex flex-col gap-[var(--spacing-4)] rounded-[var(--radius-medio)] border p-[var(--spacing-4)] shadow-[var(--shadow-flotante)]"
    >
      <div className="flex items-center justify-between gap-[var(--spacing-3)]">
        <Micro como="span" peso="medio" className="flex items-center gap-[var(--spacing-2)] uppercase">
          <span aria-hidden="true" className="bg-acento size-[var(--spacing-2)] rounded-full motion-safe:animate-pulse" />
          {ROTULO_DE_EJEMPLO}
        </Micro>
        <button
          type="button"
          onClick={() => setPausado((p) => !p)}
          aria-label={pausado ? 'Reanudar el ejemplo' : 'Pausar el ejemplo'}
          className="text-fondo/70 hover:text-fondo focus-visible:text-fondo grid size-[var(--spacing-8)] place-items-center rounded-full"
        >
          {pausado ? <Play aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" /> : <Pause aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" />}
        </button>
      </div>

      {/* La actividad: una barra que corre un lugar con cada pedido (sin número: decisión del cierre). */}
      <div aria-hidden="true" className="flex flex-col gap-[var(--spacing-2)]">
        <Micro como="span" className="text-fondo/70 uppercase">
          {ROTULO_DE_LA_ACTIVIDAD}
        </Micro>
        <svg viewBox={`0 0 ${String(BARRAS * 3)} 30`} preserveAspectRatio="none" className="block h-[var(--spacing-12)] w-full">
          {Array.from({ length: BARRAS }, (_, k) => {
            const alto = Math.round(alturaDeLaBarra(latido + k) * 300) / 10
            return <rect key={k} x={k * 3} y={(30 - alto).toFixed(1)} width={2} height={alto.toFixed(1)} rx={0.5} className={k === BARRAS - 1 ? 'fill-acento' : 'fill-fondo/40'} />
          })}
        </svg>
      </div>

      <div aria-hidden="true" className="relative h-[calc(var(--spacing-12)*3)] overflow-hidden">
        {filas.map((f, i) => (
          <div
            key={f.id}
            className={`border-fondo/10 absolute inset-x-0 top-0 flex h-[var(--spacing-12)] items-center justify-between gap-[var(--spacing-3)] border-b transition-[translate,opacity] duration-[var(--duracion-lenta)] ease-out starting:-translate-y-[var(--spacing-3)] starting:opacity-0 ${LUGAR_DE_LA_FILA[i]}`}
          >
            <span className="flex flex-col">
              <Caption como="span" peso="medio">
                {f.que}
              </Caption>
              <Micro como="span" className="text-fondo/70">
                {QUIEN_DE_EJEMPLO} · {f.desde}
              </Micro>
            </span>
            {i === 0 && (
              <Micro como="span" className="text-fondo/70 shrink-0">
                ahora
              </Micro>
            )}
          </div>
        ))}
      </div>
    </figure>
  )
}
