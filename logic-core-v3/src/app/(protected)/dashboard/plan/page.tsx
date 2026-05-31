import { Gauge } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { LoadingState, PageHeader } from '@/components/ui'
import { FadeIn } from '@/components/dashboard/FadeIn'
import { UsageMeter } from '@/components/dashboard/plan/UsageMeter'
import { PlansShowcase } from '@/components/dashboard/plan/PlansShowcase'
import { getOrgUsageSnapshot } from '@/lib/plan/get-org-usage'
import { resolveOrgId } from '@/lib/preview'

export const dynamic = 'force-dynamic'

export default async function DashboardPlanPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-20 sm:gap-10">
      <FadeIn>
        <PageHeader
          eyebrow="Mi plan"
          title="Tu plan y consumo"
          icon={Gauge}
          variant="gradient"
        />
      </FadeIn>

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
  return (
    <FadeIn>
      <UsageMeter snapshot={snapshot} hideUpgradeHint />
    </FadeIn>
  )
}

async function PlansShowcaseServerWrapper({ organizationId }: { organizationId: string }) {
  const snapshot = await getOrgUsageSnapshot(organizationId)
  return (
    <FadeIn delay={0.08}>
      <PlansShowcase currentPlanKey={snapshot.plan.key} isFallback={snapshot.plan.isFallback} />
    </FadeIn>
  )
}

function UsageMeterSkeleton() {
  return <LoadingState variant="skeleton-card" />
}

function PlansShowcaseSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {[0, 1, 2].map((idx) => (
        <LoadingState key={idx} variant="skeleton-card" />
      ))}
    </div>
  )
}
