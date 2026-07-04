'use client'

import { useId, useMemo, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { FieldControlProvider } from './field-context'

interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function Field({ label, hint, error, required, className, children }: FieldProps) {
  // useId genera un id estable server/client. El control del kit lo toma por
  // contexto y el label lo apunta con htmlFor — asociación sin tocar el call site.
  const fieldId = useId()
  const errorId = `${fieldId}-error`
  const hintId = `${fieldId}-hint`
  const describedBy = error ? errorId : hint ? hintId : undefined

  const controlContext = useMemo(
    () => ({ controlId: fieldId, describedBy, invalid: error ? true : undefined }),
    [fieldId, describedBy, error],
  )

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={fieldId}
        className="flex items-center gap-1 text-sm font-medium text-zinc-200"
      >
        {label}
        {required && (
          <>
            <span className="text-red-400" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(obligatorio)</span>
          </>
        )}
      </label>
      <FieldControlProvider value={controlContext}>{children}</FieldControlProvider>
      {error ? (
        // role="alert" → el lector anuncia el error cuando aparece; el id lo
        // vincula con el control vía aria-describedby. Mismo texto de siempre.
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-zinc-500">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
