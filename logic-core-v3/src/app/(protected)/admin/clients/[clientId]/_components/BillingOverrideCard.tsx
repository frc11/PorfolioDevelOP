import { prisma } from '@/lib/prisma'
import { Card, CardTitle } from '@/components/ui'
import { BillingOverrideForm } from './BillingOverrideForm'

interface Props {
  clientId: string
}

export async function BillingOverrideCard({ clientId }: Props) {
  const sub = await prisma.subscription.findUnique({
    where: { organizationId: clientId },
    select: {
      priceOverride: true,
      overrideUntil: true,
      overrideReason: true,
      plan: { select: { monthlyPrice: true, name: true } },
    },
  })

  const planPrice = sub?.plan?.monthlyPrice?.toNumber() ?? null
  const overrideValue = sub?.priceOverride?.toNumber() ?? null
  const overrideUntilRaw = sub?.overrideUntil ?? null
  const overrideExpired =
    overrideUntilRaw !== null && overrideUntilRaw.getTime() < Date.now()
  const overrideActive = overrideValue !== null && !overrideExpired

  const effectiveBillingPrice = overrideActive ? overrideValue : planPrice

  return (
    <Card variant="elevated" padding="lg" className="space-y-5">
      <div>
        <CardTitle>Billing override</CardTitle>
        <p className="mt-1 text-[11px] text-zinc-500">
          Precio facturable independiente del plan. <strong>El gating del bot
          NUNCA lo lee</strong> — es solo para facturación / cortesías /
          descuentos comerciales.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          label="Precio del plan"
          value={planPrice !== null ? `$${planPrice.toFixed(2)}` : '—'}
        />
        <Stat
          label="Override vigente"
          value={
            overrideActive
              ? `$${overrideValue!.toFixed(2)}`
              : overrideExpired
                ? `$${overrideValue!.toFixed(2)} (vencido)`
                : '—'
          }
          accent={overrideActive ? 'emerald' : overrideExpired ? 'amber' : 'zinc'}
        />
        <Stat
          label="Se factura"
          value={
            effectiveBillingPrice !== null
              ? `$${effectiveBillingPrice.toFixed(2)}/mes`
              : '—'
          }
          accent="cyan"
        />
      </div>

      {sub?.overrideUntil && (
        <p className="text-xs text-zinc-500">
          {overrideExpired ? 'Venció' : 'Vence'}:{' '}
          <span className="text-zinc-300">
            {new Date(sub.overrideUntil).toLocaleString('es-AR')}
          </span>
          {sub.overrideReason && (
            <>
              {' · '}
              <span className="text-zinc-400">Motivo: {sub.overrideReason}</span>
            </>
          )}
        </p>
      )}

      <BillingOverrideForm
        organizationId={clientId}
        currentPriceOverride={overrideValue}
        currentOverrideUntil={overrideUntilRaw?.toISOString() ?? null}
        currentOverrideReason={sub?.overrideReason ?? null}
        overrideActive={overrideActive}
      />
    </Card>
  )
}

function Stat({
  label,
  value,
  accent = 'zinc',
}: {
  label: string
  value: string
  accent?: 'zinc' | 'cyan' | 'emerald' | 'amber'
}) {
  const accentClass = {
    zinc: 'text-zinc-200',
    cyan: 'text-cyan-300',
    emerald: 'text-emerald-300',
    amber: 'text-amber-300',
  }[accent]
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.015] px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-base font-semibold ${accentClass}`}>{value}</p>
    </div>
  )
}
