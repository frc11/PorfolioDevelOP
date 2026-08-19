'use client'

import { useCallback, useEffect, useId, useRef, type FormEvent } from 'react'

import type { NumericStore, ProbeRange, SliderSpec } from './probeStore'

/**
 * Un slider atado a un `NumericStore`, sin pasar por `setState`.
 *
 * Es la pieza que hacen los dos paneles del probe (parámetros de escena y rig
 * de coreografía), así que vive afuera de los dos. El input es NO CONTROLADO y
 * se suscribe al store: cuando el `useFrame` mueve un valor —la órbita
 * automática moviendo el ángulo, o la coreografía moviendo los siete canales—,
 * el frame escribe `input.value` y `textContent` directo. React no se entera, y
 * esa es la condición para que el FPS que el instrumento reporta no esté medido
 * sobre un instrumento que se sabotea a sí mismo.
 *
 * El genérico está atado a `Record<K, number>` y no a un `T` libre a propósito:
 * con `T extends Record<string, number>` el tipo de una propiedad podría ser más
 * angosto que `number` (un `1 | 2`, por ejemplo) y escribir un `number`
 * cualquiera dejaría de ser seguro. Atado así, `T[K]` ES `number` y la escritura
 * al store no necesita ningún cast.
 */

export function formatSliderValue(spec: SliderSpec, value: number): string {
  return `${value.toFixed(spec.decimals)}${spec.unit}`
}

type StoreSliderProps<K extends string> = {
  store: NumericStore<Record<K, number>>
  paramKey: K
  range: ProbeRange
  spec: SliderSpec
  /**
   * En modo coreografía los sliders de escena quedan deshabilitados pero SIGUEN
   * escribiéndose: son telemetría del track, no entrada. Escribir `value` sobre
   * un input deshabilitado funciona igual.
   */
  disabled?: boolean
  /** Ancla estable para manejar el probe desde un script, sin depender del DOM. */
  dataAttr?: string
  /** Se avisa cuando el HUMANO mueve este slider (no cuando lo mueve el loop). */
  onManualChange?: () => void
}

export function StoreSlider<K extends string>({
  store,
  paramKey,
  range,
  spec,
  disabled,
  dataAttr,
  onManualChange,
}: StoreSliderProps<K>) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const outputRef = useRef<HTMLOutputElement>(null)

  useEffect(() => {
    const write = (values: Readonly<Record<K, number>>) => {
      const value = values[paramKey]

      const output = outputRef.current
      const text = formatSliderValue(spec, value)
      if (output && output.textContent !== text) output.textContent = text

      // El input se pisa solo si el valor de veras se movió: un `range` cuantiza
      // al `step`, así que comparar exacto escribiría en cada frame para nada.
      // La media unidad de step es la tolerancia natural.
      const input = inputRef.current
      if (input && Math.abs(input.valueAsNumber - value) > range.step / 2) {
        input.value = String(value)
      }
    }

    write(store.current)
    return store.subscribe(write)
  }, [store, paramKey, range.step, spec])

  const handleInput = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      store.set(paramKey, event.currentTarget.valueAsNumber)
      onManualChange?.()
    },
    [store, paramKey, onManualChange]
  )

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-3">
        <label
          htmlFor={inputId}
          className={disabled ? 'text-[0.7rem] text-neutral-400' : 'text-[0.7rem] text-neutral-600'}
        >
          {spec.label}
        </label>
        <output
          ref={outputRef}
          htmlFor={inputId}
          className="font-ds-mono text-[0.72rem] tabular-nums text-neutral-900"
        />
      </div>
      <input
        ref={inputRef}
        id={inputId}
        data-probe-param={dataAttr ?? paramKey}
        type="range"
        min={range.min}
        max={range.max}
        step={range.step}
        defaultValue={store.current[paramKey]}
        onInput={handleInput}
        disabled={disabled}
        className="h-1 w-full cursor-pointer appearance-none rounded-full bg-neutral-300 accent-neutral-900 disabled:cursor-default disabled:opacity-50"
      />
    </div>
  )
}
