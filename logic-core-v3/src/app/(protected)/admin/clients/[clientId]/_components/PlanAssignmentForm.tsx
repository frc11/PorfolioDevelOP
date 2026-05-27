'use client'

import { useState, useTransition } from 'react'
import { PlanKey } from '@/lib/prisma-enums'
import { Button, Select } from '@/components/ui'
import { assignPlanToOrg } from '../../_actions/plan.actions'

interface PlanOption {
  key: PlanKey
  name: string
  monthlyPrice: number
  sortOrder: number
}

interface Props {
  organizationId: string
  currentPlanKey: PlanKey | null
  planOptions: PlanOption[]
}

export function PlanAssignmentForm({
  organizationId,
  currentPlanKey,
  planOptions,
}: Props) {
  const [selectedKey, setSelectedKey] = useState<PlanKey>(
    currentPlanKey ?? PlanKey.STARTER,
  )
  const [reason, setReason] = useState('')
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<
    | { type: 'success'; message: string }
    | { type: 'error'; message: string }
    | null
  >(null)

  const noChange = selectedKey === currentPlanKey

  const handleSubmit = () => {
    setFeedback(null)
    startTransition(async () => {
      const result = await assignPlanToOrg({
        organizationId,
        planKey: selectedKey,
        reason: reason.trim() === '' ? undefined : reason.trim(),
      })
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      const data = result.data
      if (data.kind === 'upgraded') {
        setFeedback({
          type: 'success',
          message: `Upgrade a ${data.effectivePlanKey} aplicado. Cuota del mes reseteada.`,
        })
      } else if (data.kind === 'downgraded' && data.pending) {
        const date = new Date(data.pending.effectiveAt).toLocaleDateString('es-AR')
        setFeedback({
          type: 'success',
          message: `Downgrade a ${data.pending.planKey} programado para el ${date}. El cliente sigue en ${data.effectivePlanKey} hasta ese día.`,
        })
      } else if (data.kind === 'first_assignment') {
        setFeedback({
          type: 'success',
          message: `Plan ${data.effectivePlanKey} asignado.`,
        })
      } else {
        setFeedback({ type: 'success', message: 'Sin cambios — ya estaba en ese plan.' })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Seleccionar plan
        </label>
        <Select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value as PlanKey)}
          disabled={pending}
          options={planOptions.map((opt) => ({
            value: opt.key,
            label: `${opt.name} — $${opt.monthlyPrice}/mes`,
          }))}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Motivo (opcional, queda en audit log)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          placeholder="Ej: upgrade comercial, prueba interna…"
          maxLength={500}
          className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none disabled:opacity-50"
        />
      </div>

      <Button
        onClick={handleSubmit}
        loading={pending}
        disabled={pending || noChange}
        variant="primary"
        size="md"
      >
        {noChange ? 'Sin cambios' : 'Aplicar plan'}
      </Button>

      {feedback && (
        <div
          className={
            feedback.type === 'success'
              ? 'rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200'
              : 'rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200'
          }
        >
          {feedback.message}
        </div>
      )}
    </div>
  )
}
