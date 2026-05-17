'use client'

import type { ReactNode } from 'react'

interface FieldProps {
  label: string
  hint?: string
  required?: boolean
  children: ReactNode
}

export function Field({ label, hint, required, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-zinc-200">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
