'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Building2, Check, Gift } from 'lucide-react'
import {
  markReferralConvertedAction,
  markReferralRewardedAction,
} from '../_actions/referrals.admin.actions'

export interface AdminReferralRow {
  id: string
  referrerName: string
  referredEmail: string | null
  status: 'PENDING' | 'CONVERTED' | 'REWARDED'
  createdAt: string
  rewardedAt: string | null
}

const STATUS_CONFIG: Record<AdminReferralRow['status'], { label: string; cls: string }> = {
  PENDING: { label: 'Pendiente', cls: 'border-amber-400/25 bg-amber-500/10 text-amber-200' },
  CONVERTED: { label: 'Convertido', cls: 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200' },
  REWARDED: { label: 'Bonificado', cls: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300' },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ReferralsAdminTable({ referrals }: { referrals: AdminReferralRow[] }) {
  const router = useRouter()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const run = (id: string, action: (id: string) => Promise<unknown>) => {
    setPendingId(id)
    startTransition(async () => {
      await action(id)
      setPendingId(null)
      router.refresh()
    })
  }

  if (referrals.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm font-medium text-zinc-300">Todavía no hay referidos</p>
        <p className="mt-1 text-xs text-zinc-500">
          Cuando un negocio use el link/código de un cliente para contactar, aparece acá.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {referrals.map((referral) => {
        const status = STATUS_CONFIG[referral.status]
        const rowPending = isPending && pendingId === referral.id
        return (
          <div
            key={referral.id}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate text-sm text-zinc-100">{referral.referredEmail ?? 'Contacto referido'}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
                <Building2 size={12} strokeWidth={1.5} />
                Referido por {referral.referrerName} · {formatDate(referral.createdAt)}
                {referral.rewardedAt ? ` · bonificado ${formatDate(referral.rewardedAt)}` : ''}
              </p>
            </div>

            <div className="flex flex-shrink-0 items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${status.cls}`}>
                {status.label}
              </span>

              {referral.status === 'PENDING' ? (
                <button
                  type="button"
                  onClick={() => run(referral.id, markReferralConvertedAction)}
                  disabled={rowPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/25 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-100 transition-colors hover:bg-cyan-500/15 disabled:opacity-50"
                >
                  <Check size={13} strokeWidth={1.5} />
                  {rowPending ? '...' : 'Marcar convertido'}
                </button>
              ) : null}

              {referral.status === 'CONVERTED' ? (
                <button
                  type="button"
                  onClick={() => run(referral.id, markReferralRewardedAction)}
                  disabled={rowPending}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-100 transition-colors hover:bg-emerald-500/15 disabled:opacity-50"
                >
                  <Gift size={13} strokeWidth={1.5} />
                  {rowPending ? '...' : 'Marcar bonificado'}
                </button>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
