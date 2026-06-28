import { Gauge } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoadingState, PageHeader } from '@/components/ui'
import { UsageMeter } from '@/components/dashboard/plan/UsageMeter'
import { PlansShowcase } from '@/components/dashboard/plan/PlansShowcase'
import { getOrgUsageSnapshot } from '@/lib/plan/get-org-usage'
import { resolveOrgId } from '@/lib/preview'

export const dynamic = 'force-dynamic'

export default async function DashboardPlanPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  return (
    <div className="flex w-full flex-col gap-8 pb-6 sm:gap-10">
      <PageHeader
        eyebrow="Mi plan"
        title="Tu plan y consumo"
        icon={Gauge}
        variant="gradient"
      />

      <Suspense fallback={<UsageMeterSkeleton />}>
        <UsageMeterServerWrapper organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={<PlansShowcaseSkeleton />}>
        <PlansShowcaseServerWrapper organizationId={organizationId} />
      </Suspense>
    </div>
  )
}

async function UsageMeterServerWrapper({ organizationId }: { organizationId: string }) {
  const snapshot = await getOrgUsageSnapshot(organizationId)
  return <UsageMeter snapshot={snapshot} hideUpgradeHint />
}

async function PlansShowcaseServerWrapper({ organizationId }: { organizationId: string }) {
  const snapshot = await getOrgUsageSnapshot(organizationId)
  return (
    <PlansShowcase currentPlanKey={snapshot.plan.key} isFallback={snapshot.plan.isFallback} />
  )
}

// Los skeletons espejan las formas finales para no saltar al hidratar:
// la card del meter es rounded-[30px] full-width y los tiers van en grid
// lg:grid-cols-3 (mismo gap que PlansShowcase). LoadingState es frozen → el
// override de radio entra por className (cn = twMerge, gana sobre rounded-2xl).
function UsageMeterSkeleton() {
  return <LoadingState variant="skeleton-card" className="rounded-[30px]" />
}

function PlansShowcaseSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
      {[0, 1, 2].map((idx) => (
        <LoadingState key={idx} variant="skeleton-card" className="h-full rounded-[30px]" />
      ))}
    </div>
  )
}
