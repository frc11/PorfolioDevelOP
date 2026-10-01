'use client'

import { Pause, Play } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState } from 'react'

import { Caption, Micro } from '../tipografia/Textos'
import { CONTADOR_DE_EJEMPLO, PEDIDOS_DE_EJEMPLO, QUIEN_DE_EJEMPLO, ROTULO_DE_EJEMPLO, TOPE_DEL_CONTADOR } from './ejemplos'
import { useLatido } from './useLatido'

/**
 * [INTERFAZ 2] T3 · TU PANEL, FUNCIONANDO — una tarjeta con el panel andando solo, con datos de ejemplo (`vida=si`).
 *
 * Cada latido (2,6 s) entra un pedido de ejemplo arriba de la lista, el contador sube uno y la barra de actividad corre
 * un lugar. Es la voz de la sección (las capturas reales del panel están en la galería): lo mismo, pero vivo. Va con la
 * tinta dada vuelta, como las capturas (el panel es oscuro).
 *
 * Para el lector: la tarjeta se nombra («ejemplo del panel funcionando») y lo que se mueve no se anuncia (cambiaría
 * cada dos segundos). Se pausa con su botón, y sola fuera de cuadro o con movimiento reducido (`useLatido.ts`).
 */
export const MS_DEL_LATIDO_DEL_PANEL = 2600
const FILAS_A_LA_VISTA = 3
const BARRAS = 12

/** Una altura de barra que parece actividad y es siempre la misma para el mismo latido (sin azar). */
export function alturaDeLaBarra(i: number): number {
  const s = Math.sin(i * 12.9898) * 43758.5453
  return 0.3 + 0.7 * (s - Math.floor(s))
}

export function PanelEnVivo(): React.JSX.Element {
  const caja = useRef<HTMLElement>(null)
  const [pausado, setPausado] = useState(false)
  // Arranca con la lista llena (tres pedidos): quieta, con movimiento reducido, se ve así.
  const latido = useLatido(caja, MS_DEL_LATIDO_DEL_PANEL, pausado) + FILAS_A_LA_VISTA - 1
  const cuenta = (latido % TOPE_DEL_CONTADOR) + 1
  const filas: { readonly id: number; readonly que: string; readonly desde: string }[] = []
  for (let k = 0; k < FILAS_A_LA_VISTA && latido - k >= 0; k += 1) filas.push({ id: latido - k, ...PEDIDOS_DE_EJEMPLO[(latido - k) % PEDIDOS_DE_EJEMPLO.length] })

  return (
    <figure
      ref={caja}
      data-pieza="panel-en-vivo"
      data-seccion="invertida"
      aria-label="Ejemplo del panel funcionando, con datos de ejemplo"
      className="bg-fondo text-tinta border-borde flex flex-col gap-[var(--spacing-4)] rounded-[var(--radius-medio)] border p-[var(--spacing-4)] shadow-[var(--shadow-flotante)]"
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
          className="text-tinta-media hover:text-tinta focus-visible:text-tinta grid size-[var(--spacing-8)] place-items-center rounded-full"
        >
          {pausado ? <Play aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" /> : <Pause aria-hidden="true" strokeWidth={1.5} className="size-[var(--spacing-4)]" />}
        </button>
      </div>

      <div aria-hidden="true" className="flex items-end justify-between gap-[var(--spacing-4)]">
        <span className="flex flex-col">
          <Micro como="span" className="text-tinta-tenue uppercase">
            {CONTADOR_DE_EJEMPLO}
          </Micro>
          <span className="relative block h-lh overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={cuenta}
                className="font-titulo text-titulo-m leading-titulo tracking-titulo block tabular-nums"
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-100%', opacity: 0 }}
                transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                {cuenta}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
        <span className="flex h-[var(--spacing-10)] items-end gap-[var(--spacing-1)]">
          {Array.from({ length: BARRAS }, (_, k) => (
            <span
              key={k}
              className="bg-tinta-media w-[var(--spacing-1)] rounded-[var(--radius-sutil)] transition-[height] duration-[var(--duracion-media)] ease-out last:bg-acento"
              style={{ height: `${(alturaDeLaBarra(latido + k) * 100).toFixed(1)}%` }}
            />
          ))}
        </span>
      </div>

      <ul aria-hidden="true" className="flex h-[calc(var(--spacing-12)*3)] flex-col gap-[var(--spacing-2)] overflow-hidden">
        <AnimatePresence initial={false}>
          {filas.map((f, i) => (
            <motion.li
              key={f.id}
              layout
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: i === 0 ? 1 : 0.62, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="border-borde flex items-center justify-between gap-[var(--spacing-3)] border-b pb-[var(--spacing-2)]"
            >
              <span className="flex flex-col">
                <Caption como="span" peso="medio">
                  {f.que}
                </Caption>
                <Micro como="span" className="text-tinta-tenue">
                  {QUIEN_DE_EJEMPLO} · {f.desde}
                </Micro>
              </span>
              {i === 0 && (
                <Micro como="span" className="text-tinta-tenue shrink-0">
                  ahora
                </Micro>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </figure>
  )
}
