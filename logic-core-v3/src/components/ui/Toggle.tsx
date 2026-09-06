'use client'

import { motion } from 'motion/react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  /** El interruptor es obligatorio para poder enviar → `aria-required`. */
  required?: boolean
  /** El interruptor es el control que falla → `aria-invalid` + borde rojo. */
  invalid?: boolean
  /** Id del texto de error/ayuda que lo describe → `aria-describedby`. */
  describedBy?: string
}

/**
 * Tres props aditivas (`required`, `invalid`, `describedBy`) para que un
 * interruptor pueda ser el control que falla de un formulario: sin ellas el
 * error tiene que colgarse de otro campo, y un lector de pantalla manda a
 * corregir donde no está el problema. Ningún call site existente cambia.
 */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  required,
  invalid,
  describedBy,
}: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-cyan-400' : 'bg-zinc-700'
      } ${invalid ? 'ring-2 ring-red-400/70 ring-offset-2 ring-offset-zinc-950' : ''} ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-required={required || undefined}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 700, damping: 30 }}
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ${
          checked ? 'translate-x-5' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
