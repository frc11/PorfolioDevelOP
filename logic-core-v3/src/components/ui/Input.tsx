'use client'

import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { useFieldControl } from './field-context'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      invalid,
      className,
      id,
      'aria-describedby': ariaDescribedby,
      'aria-invalid': ariaInvalid,
      ...props
    },
    ref,
  ) => {
    // Asociación con el Field contenedor (label + error/hint). El caller siempre
    // gana: solo cae al contexto cuando no pasó la prop.
    const field = useFieldControl()
    return (
      <input
        ref={ref}
        id={id ?? field.controlId}
        aria-describedby={ariaDescribedby ?? field.describedBy}
        aria-invalid={ariaInvalid ?? (field.invalid ? true : undefined)}
        className={cn(
          'w-full rounded-xl border bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
          invalid
            ? 'border-red-400/40 focus:border-red-400/60'
            : 'border-white/10 focus:border-cyan-400/30',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
