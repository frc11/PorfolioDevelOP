'use client'

import type { ChangeEvent } from 'react'
import { Select } from '@/components/ui'

export const PERIOD_OPTIONS = [
  { value: '1w', label: 'Última semana' },
  { value: '1m', label: 'Último mes' },
  { value: '6m', label: 'Últimos 6 meses' },
  { value: '1y', label: 'Último año' },
  { value: 'custom', label: 'Personalizado' },
] as const

export type PeriodFilter = (typeof PERIOD_OPTIONS)[number]['value']

const controlClassName =
  'rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none'

type ProjectsPeriodFilterProps = {
  period: PeriodFilter
  from: string
  to: string
}

/**
 * Lane-local period filter applied on change (no submit button). The period
 * select + the custom from/to date inputs all live inside the page's GET form
 * and call `form.requestSubmit()` on change, so the server re-filters by URL
 * params. The date inputs only render for the `custom` period.
 */
export function ProjectsPeriodFilter({ period, from, to }: ProjectsPeriodFilterProps) {
  const submitForm = (
    event: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLInputElement>
  ) => {
    event.currentTarget.form?.requestSubmit()
  }

  return (
    <>
      <Select
        name="period"
        defaultValue={period}
        aria-label="Filtrar por período de última actividad"
        className={controlClassName}
        onChange={submitForm}
      >
        {PERIOD_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {period === 'custom' ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            name="from"
            defaultValue={from}
            aria-label="Desde"
            onChange={submitForm}
            className={controlClassName}
          />
          <span className="text-sm text-zinc-500">→</span>
          <input
            type="date"
            name="to"
            defaultValue={to}
            aria-label="Hasta"
            onChange={submitForm}
            className={controlClassName}
          />
        </div>
      ) : null}
    </>
  )
}
