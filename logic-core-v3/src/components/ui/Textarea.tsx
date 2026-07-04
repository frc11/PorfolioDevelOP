'use client'

import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
import { useFieldControl } from './field-context'

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean
}

/** Espejo del Input del kit UI en versión textarea. */
export function TextArea({
  invalid,
  className,
  id,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  ...props
}: TextAreaProps) {
  // Asociación con el Field contenedor; el caller siempre gana sobre el contexto.
  const field = useFieldControl()
  return (
    <textarea
      id={id ?? field.controlId}
      aria-describedby={ariaDescribedby ?? field.describedBy}
      aria-invalid={ariaInvalid ?? (field.invalid ? true : undefined)}
      className={cn(
        'min-h-[88px] w-full resize-y rounded-xl border bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50',
        invalid
          ? 'border-red-400/40 focus:border-red-400/60'
          : 'border-white/10 focus:border-cyan-400/30',
        className,
      )}
      {...props}
    />
  )
}
