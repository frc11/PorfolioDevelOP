'use client'

import type { ReactNode } from 'react'
import { Select } from '@/components/ui'

type ProjectsFilterSelectProps = {
  name: string
  defaultValue: string
  ariaLabel: string
  className?: string
  children: ReactNode
}

/**
 * Lane-local filter select that applies on change: submitting its enclosing GET
 * form (no "Aplicar filtro" button). Consumes the shared `<Select>`, whose hidden
 * native `<select>` carries the value into FormData and dispatches a real change
 * event, so `currentTarget.form?.requestSubmit()` navigates with the new params.
 */
export function ProjectsFilterSelect({
  name,
  defaultValue,
  ariaLabel,
  className,
  children,
}: ProjectsFilterSelectProps) {
  return (
    <Select
      name={name}
      defaultValue={defaultValue}
      aria-label={ariaLabel}
      className={className}
      onChange={(event) => event.currentTarget.form?.requestSubmit()}
    >
      {children}
    </Select>
  )
}
