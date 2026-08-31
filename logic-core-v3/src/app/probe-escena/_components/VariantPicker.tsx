'use client'

import { useCallback, useSyncExternalStore } from 'react'

import type { ChoreoEditor } from './choreographyEditor'
import { CHOREO_VARIANTS } from './choreographyVariants'
import type { ChoreoVariantId } from '@/app/v3/_lib/escena/choreographyTypes'

/**
 * EL SELECTOR DE RECORRIDO (S7 · cinco desde S9).
 *
 * Cinco botones y una línea de texto. Cambia la coreografía **en vivo**: el
 * `useFrame` lee `editor.track`, que ya devuelve el de la variante activa, así
 * que apretar un botón cambia lo que la cámara reproduce sin recargar y sin
 * tocar el progreso.
 *
 * ── Las tres cosas que este panel tiene que dejar claras ───────────────────
 *
 * 1. **Cuál es la que corre.** Va primera y con su tesis escrita: la definitiva
 *    es la que el sitio va a reproducir; las otras cuatro son material de
 *    referencia. Perder de vista esa diferencia es perder de vista qué número
 *    está medido y cuál no.
 * 2. **Cuál tiene cambios sin exportar.** El punto al lado del nombre. Como cada
 *    variante tiene su propia sesión, se puede volver a una que quedó editada
 *    hace diez minutos sin acordarse.
 * 3. **Que cambiar NO descarta nada.** Lo dice el pie, porque es lo primero que
 *    alguien va a dudar antes de apretar.
 *
 * ⚠️ **La luz NO cambia con el botón.** `LIGHT_ARC` es una sola tabla y está
 * compuesta para el recorrido definitivo; las otras cuatro se reproducen con
 * esa luz, que no es la que se midió para ellas. Sirven para comparar
 * movimiento, no iluminación.
 *
 * Se re-renderiza solo cuando el editor sube su versión, igual que la lista de
 * keyframes: nunca por frame.
 */

// Grilla de tres y no una fila: con cinco recorridos —y "arquitectónica" entre
// ellos— una fila sola parte los nombres a la mitad.
const BUTTON_BASE =
  'rounded-sm border px-1 py-1.5 text-[0.64rem] leading-none transition-colors'
const BUTTON_ON = 'border-neutral-900 bg-neutral-900 text-white'
const BUTTON_OFF = 'border-neutral-300 text-neutral-600 hover:bg-neutral-100'

type VariantPickerProps = {
  editor: ChoreoEditor
}

export function VariantPicker({ editor }: VariantPickerProps) {
  const version = useSyncExternalStore(
    editor.subscribe,
    () => editor.version,
    () => 0
  )

  const handleSelect = useCallback(
    (id: ChoreoVariantId) => {
      editor.setVariant(id)
    },
    [editor]
  )

  // `version` entra en la lectura a propósito: es lo que hace que el activo y
  // los puntos de "sin exportar" se vuelvan a leer después de cada cambio.
  void version
  const activeId = editor.variantId
  const active = editor.variant

  return (
    <div className="flex flex-col gap-1.5">
      <div className="grid grid-cols-3 gap-1" role="group" aria-label="recorrido">
        {CHOREO_VARIANTS.map((variant) => (
          <button
            key={variant.id}
            type="button"
            onClick={() => handleSelect(variant.id)}
            aria-pressed={variant.id === activeId}
            data-probe={`variant-${variant.id}`}
            className={`${BUTTON_BASE} ${variant.id === activeId ? BUTTON_ON : BUTTON_OFF}`}
          >
            {variant.label}
            {editor.isDirty(variant.id) ? (
              <span aria-label="con cambios sin exportar"> ·</span>
            ) : null}
          </button>
        ))}
      </div>

      <p className="text-[0.64rem] leading-snug text-neutral-500">{active.thesis}</p>

      <p className="text-[0.62rem] leading-snug text-neutral-400">
        Cambiar de recorrido <strong className="font-semibold">no descarta nada</strong>: cada uno
        tiene su propia sesión de edición. El punto marca las que tienen cambios sin exportar.
      </p>
    </div>
  )
}
