'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui'
import {
  setBillingOverride,
  clearBillingOverride,
} from '../../_actions/plan.actions'

interface Props {
  organizationId: string
  currentPriceOverride: number | null
  currentOverrideUntil: string | null
  currentOverrideReason: string | null
}

function defaultDate90DaysFromNow(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() + 90)
  return d.toISOString().slice(0, 10)
}

export function BillingOverrideForm({
  organizationId,
  currentPriceOverride,
  currentOverrideUntil,
  currentOverrideReason,
}: Props) {
  const [price, setPrice] = useState<string>(
    currentPriceOverride !== null ? String(currentPriceOverride) : '0',
  )
  const [untilDate, setUntilDate] = useState<string>(
    currentOverrideUntil
      ? new Date(currentOverrideUntil).toISOString().slice(0, 10)
      : defaultDate90DaysFromNow(),
  )
  const [reason, setReason] = useState(currentOverrideReason ?? '')
  const [pending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<
    | { type: 'success'; message: string }
    | { type: 'error'; message: string }
    | null
  >(null)

  const handleSet = () => {
    setFeedback(null)
    const priceNum = Number(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFeedback({ type: 'error', message: 'Precio inválido (debe ser ≥ 0).' })
      return
    }
    startTransition(async () => {
      const result = await setBillingOverride({
        organizationId,
        priceOverride: priceNum,
        overrideUntil: untilDate,
        reason: reason.trim() === '' ? undefined : reason.trim(),
      })
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      setFeedback({
        type: 'success',
        message: `Override seteado: $${result.data.priceOverride} hasta ${new Date(result.data.overrideUntil).toLocaleDateString('es-AR')}`,
      })
    })
  }

  const handleClear = () => {
    setFeedback(null)
    if (!confirm('¿Quitar el billing override? Vuelve al precio del plan.')) return
    startTransition(async () => {
      const result = await clearBillingOverride({ organizationId })
      if (!result.success) {
        setFeedback({ type: 'error', message: result.error })
        return
      }
      setFeedback({ type: 'success', message: 'Override quitado.' })
      setPrice('0')
      setReason('')
      setUntilDate(defaultDate90DaysFromNow())
    })
  }

  const hasActiveOverride = currentPriceOverride !== null

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Precio override (USD/mes)
          </label>
          <input
            type="number"
            min="0"
            max="100000"
            step="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={pending}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500/40 focus:outline-none disabled:opacity-50"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
            Vigente hasta
          </label>
          <input
            type="date"
            value={untilDate}
            onChange={(e) => setUntilDate(e.target.value)}
            disabled={pending}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 focus:border-cyan-500/40 focus:outline-none disabled:opacity-50"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
          Motivo (opcional, queda visible y en audit)
        </label>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={pending}
          placeholder="Ej: cortesía 90 días, beta tester, descuento comercial…"
          maxLength={500}
          className="w-full rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:border-cyan-500/40 focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSet} loading={pending} disabled={pending} variant="primary" size="md">
          {hasActiveOverride ? 'Actualizar override' : 'Aplicar override'}
        </Button>
        {hasActiveOverride && (
          <Button onClick={handleClear} disabled={pending} variant="ghost" size="md">
            Quitar override
          </Button>
        )}
      </div>

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
