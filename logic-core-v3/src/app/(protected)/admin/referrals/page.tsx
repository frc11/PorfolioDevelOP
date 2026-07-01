import { prisma } from '@/lib/prisma'
import { ReferralsAdminTable, type AdminReferralRow } from './_components/referrals-admin-table'

export const dynamic = 'force-dynamic'

const ADMIN_REFERRALS_LIMIT = 200

export default async function AdminReferralsPage() {
  const referrals = await prisma.referral.findMany({
    orderBy: { createdAt: 'desc' },
    take: ADMIN_REFERRALS_LIMIT,
    select: {
      id: true,
      referredEmail: true,
      status: true,
      createdAt: true,
      rewardedAt: true,
      referrer: { select: { companyName: true } },
    },
  })

  const rows: AdminReferralRow[] = referrals.map((referral) => ({
    id: referral.id,
    referrerName: referral.referrer.companyName,
    referredEmail: referral.referredEmail,
    status: referral.status,
    createdAt: referral.createdAt.toISOString(),
    rewardedAt: referral.rewardedAt?.toISOString() ?? null,
  }))

  const pendingCount = rows.filter((row) => row.status === 'PENDING').length

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
        <p className="text-xs tracking-tight text-zinc-500">develOP / Referidos</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">Referidos</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
          Cuando un cliente recomienda develOP y el negocio referido contrata un plan, marcá la
          conversión y luego el mes bonificado acreditado. La aplicación en facturación la hacés vos.
        </p>
        {pendingCount > 0 ? (
          <p className="mt-3 inline-flex rounded-full border border-amber-400/25 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-amber-200">
            {pendingCount} pendiente{pendingCount === 1 ? '' : 's'} de confirmar
          </p>
        ) : null}
      </div>

      <ReferralsAdminTable referrals={rows} />
    </section>
  )
}
