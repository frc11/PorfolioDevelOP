import { redirect } from 'next/navigation'
import { Gift, Users } from 'lucide-react'
import type { ReferralStatus } from '@prisma/client'
import { PageHeader } from '@/components/ui'
import { EmptyStateMuted } from '@/components/ui/EmptyStateMuted'
import { ReferralPanel } from '@/components/dashboard/ReferralPanel'
import { resolveOrgId } from '@/lib/preview'
import {
  getReferralCodeForOrg,
  getReferralsForOrg,
  summarizeReferrals,
} from '@/lib/referrals/referrals.service'

export const dynamic = 'force-dynamic'

const STATUS_CONFIG: Record<ReferralStatus, { label: string; cls: string }> = {
  PENDING: { label: 'Pendiente', cls: 'border-amber-400/25 bg-amber-500/10 text-amber-200' },
  CONVERTED: { label: 'Convertido', cls: 'border-cyan-400/25 bg-cyan-500/10 text-cyan-200' },
  REWARDED: { label: 'Bonificado', cls: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300' },
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ReferidosPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  const [code, referrals] = await Promise.all([
    getReferralCodeForOrg(organizationId),
    getReferralsForOrg(organizationId),
  ])
  const counts = summarizeReferrals(referrals)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''

  return (
    <div className="flex w-full flex-col gap-6">
      <PageHeader
        eyebrow="Recomendá y ganá"
        title="Programa de referidos"
        description="Recomendá develOP a otro negocio y ganá un mes bonificado cuando contrate."
        icon={Gift}
      />

      <ReferralPanel initialCode={code} baseUrl={baseUrl} />

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Tus referidos</h2>
          {referrals.length > 0 ? (
            <div className="flex items-center gap-3 text-[11px] text-zinc-500">
              <span>{counts.PENDING} pendientes</span>
              <span>{counts.CONVERTED} convertidos</span>
              <span className="text-emerald-400">{counts.REWARDED} bonificados</span>
            </div>
          ) : null}
        </div>

        {referrals.length === 0 ? (
          <EmptyStateMuted
            icon={Users}
            title="Todavía no referiste a nadie"
            description="Compartí tu link o código. Cuando un negocio lo use para contactarnos, lo vas a ver acá."
          />
        ) : (
          <div className="space-y-2">
            {referrals.map((referral) => {
              const status = STATUS_CONFIG[referral.status]
              return (
                <div
                  key={referral.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-zinc-200">{referral.referredEmail ?? 'Contacto referido'}</p>
                    <p className="text-[11px] text-zinc-600">Referido el {formatDate(referral.createdAt)}</p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full border px-2.5 py-1 text-[11px] uppercase tracking-[0.16em] ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
