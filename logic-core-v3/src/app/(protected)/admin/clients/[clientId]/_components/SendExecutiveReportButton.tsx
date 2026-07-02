'use client'

import { useState } from 'react'
import { Send, Check, AlertTriangle, Info, Loader2 } from 'lucide-react'

interface SendExecutiveReportButtonProps {
  organizationId: string
}

type SendResponse =
  | { ok: true; periodKey: string; recipientEmail: string }
  | {
      ok: false
      reason?: 'NOT_FOUND' | 'ALREADY_SENT' | 'BUILD_SKIPPED' | 'SEND_FAILED' | 'UNEXPECTED_ERROR'
      sentAt?: string | null
      buildReason?: string
      error?: string
      retryAfterSeconds?: number
    }

const SKIP_REASON_LABEL: Record<string, string> = {
  PLAN: 'el plan de esta organización no incluye este reporte (solo Pro/Business).',
  OPTOUT: 'esta organización se dio de baja del reporte ejecutivo.',
  NO_RECIPIENT: 'no hay un email de destinatario configurado (sin miembro ADMIN).',
  NO_DATA: 'todavía no hay datos suficientes para armar el reporte.',
}

export function SendExecutiveReportButton({ organizationId }: SendExecutiveReportButtonProps) {
  const [state, setState] = useState<
    'idle' | 'confirming' | 'loading' | 'success' | 'already_sent' | 'skipped' | 'error'
  >('idle')
  const [detail, setDetail] = useState<string | null>(null)

  async function handleConfirm() {
    setState('loading')
    try {
      const res = await fetch(`/api/admin/clients/${organizationId}/send-executive-report`, {
        method: 'POST',
      })
      const data = (await res.json()) as SendResponse

      if (data.ok) {
        setDetail(data.recipientEmail)
        setState('success')
        return
      }

      if (data.reason === 'ALREADY_SENT') {
        setDetail(data.sentAt ? new Date(data.sentAt).toLocaleString('es-AR') : null)
        setState('already_sent')
        return
      }

      if (data.reason === 'BUILD_SKIPPED') {
        const buildReason = data.buildReason ?? ''
        setDetail(SKIP_REASON_LABEL[buildReason] ?? buildReason)
        setState('skipped')
        return
      }

      setState('error')
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
        <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>Reporte enviado a {detail}</span>
      </div>
    )
  }

  if (state === 'already_sent') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-sky-400/20 bg-sky-500/10 px-4 py-2.5 text-sm text-sky-200">
        <Info className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>Ya se envió esta semana{detail ? ` (${detail})` : ''} — no se reenvía.</span>
      </div>
    )
  }

  if (state === 'skipped') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>No se envió: {detail}</span>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
        <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>Error al enviar — intentá de nuevo</span>
      </div>
    )
  }

  if (state === 'confirming') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
        <span>¿Enviar el reporte ejecutivo semanal ahora para esta organización?</span>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-amber-500/20 px-3 py-1 font-medium hover:bg-amber-500/30 transition-colors"
          >
            Confirmar
          </button>
          <button
            onClick={() => setState('idle')}
            className="rounded-lg px-3 py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirming')}
      disabled={state === 'loading'}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      {state === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      ) : (
        <Send className="h-4 w-4" strokeWidth={1.5} />
      )}
      Enviar reporte ahora
    </button>
  )
}
