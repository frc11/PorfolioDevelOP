'use client'

import { Pause, Play } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * [P-H21] LA PAUSA DE UN VIDEO EN BUCLE — WCAG 2.2.2: lo que se mueve solo más de cinco segundos se tiene que poder pausar.
 *
 * Un `<button>` de verdad (el teclado y el anillo de foco de la casa, `foco.css`), con un nombre accesible fijo («Pausar …») y el
 * estado en `aria-pressed` (apretado = en pausa): el lector anuncia el mismo control en los dos estados. El lenguaje es el del home: el
 * disco de vidrio del botón de sonido (`ControlDelSonido`: la superficie translúcida, el desenfoque, el borde fino y la sombra
 * flotante) y los íconos de lucide con su trazo de 1,5.
 *
 * [B1.2d B] Integrada en el video en bucle de la tira activa del Portfolio, en escritorio (`_secciones/trabajos/portfolio/MedioDeLaTira.tsx`;
 * en las historias la pausa es mantener apretado). Falta el de cada servicio (`_secciones/servicios/VideoDeServicio.tsx`), cuando se
 * toque esa pieza. Las demos vivas de Tu panel ya tienen la suya (`_panel-vivo/DemoDelPanel.tsx`).
 */
export interface PropsDeBotonPausa {
  /** Si el video está en pausa (el botón, apretado). */
  readonly pausado: boolean
  /** Lo que pide el botón: el estado contrario. */
  readonly alCambiar: (pausado: boolean) => void
  /** Lo que se pausa, para el nombre: «el video de El Garage» → «Pausar el video de El Garage». */
  readonly de: string
  readonly className?: string
}

/** El nombre accesible: fijo en los dos estados (el estado lo dice `aria-pressed`). */
export const nombreDeLaPausa = (de: string): string => `Pausar ${de}`

/** El disco: el del botón de sonido de escritorio (48 px: el alto de una línea del cuerpo con su aire). */
export const CLASE_DEL_BOTON_PAUSA =
  'flex size-[calc(var(--spacing-3)*2+var(--text-cuerpo)*var(--leading-texto))] cursor-pointer items-center justify-center rounded-full border-[length:var(--border-hairline)] border-borde bg-[var(--color-superficie-translucida)] text-tinta shadow-[var(--shadow-flotante)] backdrop-blur-[var(--blur-panel)]'

export function BotonPausa({ pausado, alCambiar, de, className }: PropsDeBotonPausa): React.JSX.Element {
  const Icono = pausado ? Play : Pause
  return (
    <button type="button" data-pieza="boton-pausa" aria-pressed={pausado} aria-label={nombreDeLaPausa(de)} onClick={() => alCambiar(!pausado)} className={cn(CLASE_DEL_BOTON_PAUSA, className)}>
      <Icono className="size-4" strokeWidth={1.5} aria-hidden="true" />
    </button>
  )
}
