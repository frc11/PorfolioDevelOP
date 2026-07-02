'use client'

// P2.B.2 — dos <Select> (frecuencia, cantidad de leads destacados) que
// aplican al instante. useTransition + toast sonner, mismo patrón cliente que
// MoneyEstimate.tsx (objeto tipado + feedback optimista). NO
// useActionState/FormData — ver executive-report-prefs.actions.ts.

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Select } from '@/components/ui'
import { saveExecutiveReportPrefs } from '@/app/(protected)/dashboard/_actions/executive-report-prefs.actions'
import type { ExecutiveReportPrefsInput } from '@/app/(protected)/dashboard/_actions/executive-report-prefs.schemas'

type Frequency = ExecutiveReportPrefsInput['frequency']
type LeadCount = ExecutiveReportPrefsInput['leadCount']

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: 'WEEKLY', label: 'Cada semana' },
  { value: 'BIWEEKLY', label: 'Cada 15 días' },
  { value: 'DISABLED', label: 'No recibir' },
]

const LEAD_COUNT_OPTIONS: { value: LeadCount; label: string }[] = [
  { value: 3, label: '3 leads destacados' },
  { value: 5, label: '5 leads destacados' },
  { value: 10, label: '10 leads destacados' },
]

interface ExecutiveReportPrefsFormProps {
  initialFrequency: Frequency
  initialLeadCount: LeadCount
  /** Solo BUSINESS ve este selector — Pro no recibe la sección de leads destacados. */
  showLeadCount: boolean
}

export function ExecutiveReportPrefsForm({
  initialFrequency,
  initialLeadCount,
  showLeadCount,
}: ExecutiveReportPrefsFormProps) {
  const [frequency, setFrequency] = useState<Frequency>(initialFrequency)
  const [leadCount, setLeadCount] = useState<LeadCount>(initialLeadCount)
  const [isPending, startTransition] = useTransition()

  function save(next: { frequency: Frequency; leadCount: LeadCount }) {
    startTransition(async () => {
      const res = await saveExecutiveReportPrefs(next)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      setFrequency(next.frequency)
      setLeadCount(next.leadCount)
      toast.success('Preferencias del reporte guardadas')
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="report-frequency" className="text-xs font-medium text-zinc-400">
          ¿Cada cuánto querés recibir tu reporte?
        </label>
        <Select
          id="report-frequency"
          aria-label="Frecuencia del reporte"
          disabled={isPending}
          value={frequency}
          onChange={(e) => {
            const value = e.target.value as Frequency
            save({ frequency: value, leadCount })
          }}
          options={FREQUENCY_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
        />
      </div>

      {showLeadCount && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="report-lead-count" className="text-xs font-medium text-zinc-400">
            ¿Cuántos leads destacados querés ver por reporte?
          </label>
          <Select
            id="report-lead-count"
            aria-label="Cantidad de leads destacados"
            disabled={isPending || frequency === 'DISABLED'}
            value={String(leadCount)}
            onChange={(e) => {
              const value = Number(e.target.value) as LeadCount
              save({ frequency, leadCount: value })
            }}
            options={LEAD_COUNT_OPTIONS.map((opt) => ({
              value: String(opt.value),
              label: opt.label,
            }))}
          />
        </div>
      )}
    </div>
  )
}
