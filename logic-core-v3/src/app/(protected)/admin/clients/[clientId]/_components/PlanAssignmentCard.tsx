import { prisma } from '@/lib/prisma'
import { Card, CardTitle } from '@/components/ui'
import { PlanAssignmentForm } from './PlanAssignmentForm'
import type { PlanKey, SupportTier } from '@prisma/client'

interface Props {
  clientId: string
}

const SUPPORT_LABEL: Record<SupportTier, string> = {
  STANDARD: 'Estándar',
  PRIORITY: 'Prioritario',
  PRIORITY_24H: 'Prioritario 24h',
}

export async function PlanAssignmentCard({ clientId }: Props) {
  const [plans, subscription] = await Promise.all([
    prisma.plan.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.subscription.findUnique({
      where: { organizationId: clientId },
      select: {
        plan: { select: { key: true, name: true, sortOrder: true } },
        pendingPlan: { select: { key: true, name: true } },
        pendingPlanEffectiveAt: true,
        lastPlanChangedAt: true,
      },
    }),
  ])

  const currentPlanKey: PlanKey | null = subscription?.plan?.key ?? null

  const planOptions = plans.map((p) => ({
    key: p.key,
    name: p.name,
    monthlyPrice: p.monthlyPrice.toNumber(),
    sortOrder: p.sortOrder,
  }))

  return (
    <Card variant="elevated" padding="lg" className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Plan asignado</CardTitle>
          <p className="mt-2 text-2xl font-semibold text-zinc-100">
            {subscription?.plan?.name ?? (
              <span className="text-zinc-500">
                Sin plan asignado{' '}
                <span className="text-xs text-zinc-600">
                  (fallback Starter en runtime)
                </span>
              </span>
            )}
          </p>
          {subscription?.lastPlanChangedAt && (
            <p className="mt-1 text-xs text-zinc-500">
              Último cambio:{' '}
              {new Date(subscription.lastPlanChangedAt).toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {subscription?.pendingPlan && subscription.pendingPlanEffectiveAt && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs">
            <p className="font-semibold text-amber-200">⏳ Downgrade pendiente</p>
            <p className="mt-1 text-amber-100/80">
              → {subscription.pendingPlan.name} ({subscription.pendingPlan.key})
            </p>
            <p className="mt-1 text-amber-100/60">
              Efectivo desde{' '}
              {new Date(subscription.pendingPlanEffectiveAt).toLocaleDateString(
                'es-AR',
              )}
            </p>
          </div>
        )}
      </div>

      <PlanAssignmentForm
        organizationId={clientId}
        currentPlanKey={currentPlanKey}
        planOptions={planOptions}
      />

      <details className="overflow-hidden rounded-xl border border-white/5 bg-zinc-950/30">
        <summary className="cursor-pointer select-none px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/[0.02]">
          Comparación de las 7 dimensiones de gating
        </summary>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-zinc-500">
                <th className="py-2 pl-4 text-left font-normal">Dimensión</th>
                {plans.map((p) => (
                  <th key={p.key} className="py-2 text-left font-normal">
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-white/[0.02] text-zinc-300">
              <Row label="Precio/mes" values={plans.map((p) => `$${p.monthlyPrice.toNumber()}`)} />
              <Row label="Setup (piso)" values={plans.map((p) => `$${p.setupFloorPrice.toNumber()}`)} />
              <Row label="Cuota conv/mes" values={plans.map((p) => p.quota.toLocaleString('es-AR'))} />
              <Row label="LLM" values={plans.map((p) => p.llmModel)} />
              <Row
                label="Tools"
                values={plans.map((p) => p.tools.join(', ') || '—')}
              />
              <Row
                label="Dominios"
                values={plans.map((p) =>
                  p.maxDomains === null ? 'uso justo' : String(p.maxDomains),
                )}
              />
              <Row label="Reportes" values={plans.map((p) => (p.reportsEnabled ? '✓' : '—'))} />
              <Row label="Insight IA" values={plans.map((p) => (p.insightEnabled ? '✓' : '—'))} />
              <Row label="CRM (n8n)" values={plans.map((p) => (p.crmEnabled ? '✓' : '—'))} />
              <Row
                label="Soporte"
                values={plans.map((p) => SUPPORT_LABEL[p.supportTier])}
              />
            </tbody>
          </table>
        </div>
      </details>

      <p className="text-[11px] text-zinc-500">
        Reglas: upgrade aplica inmediato y resetea la cuota del mes. Downgrade
        se difiere al primer día del próximo mes. El bot ve el cambio en ≤60s
        (TTL de cache invalidada al guardar).
      </p>
    </Card>
  )
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr className="transition-colors duration-200 hover:bg-white/10">
      <td className="py-2 pl-4 pr-4 text-zinc-500">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="py-2 pr-4">
          {v}
        </td>
      ))}
    </tr>
  )
}
