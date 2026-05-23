import { AIExecutiveBriefV2 } from '@/components/dashboard/home/AIExecutiveBriefV2'
import { AttentionStack } from '@/components/dashboard/home/AttentionStack'
import { HealthScore } from '@/components/dashboard/home/HealthScore'
import { OnboardingStatusCard } from '@/components/dashboard/OnboardingStatusCard'
import { UsageMeter } from '@/components/dashboard/plan/UsageMeter'
import { WeekResultsGrid } from '@/components/dashboard/home/WeekResultsGrid'
import { LoadingState, PageHeader } from '@/components/ui'
import { getExecutiveBrief } from '@/lib/ai/executive-brief'
import { getAttentionItems } from '@/lib/dashboard/attention'
import { getWeekResults } from '@/lib/dashboard/week-results'
import { getHealthScore } from '@/lib/health-score'
import { getOrgUsageSnapshot } from '@/lib/plan/get-org-usage'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
import { unstable_cache } from 'next/cache'
import { Calendar } from 'lucide-react'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'Buenos dias'
  if (hour >= 12 && hour < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function formatDateES(): string {
  return new Date()
    .toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .toUpperCase()
}

export default async function DashboardPage() {
  const organizationId = await resolveOrgId()
  if (!organizationId) redirect('/login')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-20 sm:gap-10">
      <Suspense fallback={<PageHeaderSkeleton />}>
        <DashboardGreetingWrapper organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={null}>
        <OnboardingStatusCard organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={<HealthScoreSkeleton />}>
        <HealthScoreServerWrapper organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={null}>
        <AttentionStackServerWrapper organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={<WeekResultsSkeleton />}>
        <WeekResultsServerWrapper organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={<UsageMeterSkeleton />}>
        <UsageMeterServerWrapper organizationId={organizationId} />
      </Suspense>

      <Suspense fallback={<BriefSkeleton />}>
        <BriefServerWrapper organizationId={organizationId} />
      </Suspense>
    </div>
  )
}

async function UsageMeterServerWrapper({ organizationId }: { organizationId: string }) {
  const snapshot = await getOrgUsageSnapshot(organizationId)
  return <UsageMeter snapshot={snapshot} />
}

function UsageMeterSkeleton() {
  return <LoadingState variant="skeleton-card" />
}

async function HealthScoreServerWrapper({ organizationId }: { organizationId: string }) {
  const data = await getHealthScore(organizationId)
  return <HealthScore data={data} />
}

async function AttentionStackServerWrapper({ organizationId }: { organizationId: string }) {
  const items = await getAttentionItems(organizationId)
  return <AttentionStack items={items} />
}

async function WeekResultsServerWrapper({ organizationId }: { organizationId: string }) {
  const data = await getWeekResults(organizationId)
  return <WeekResultsGrid data={data} />
}

async function BriefServerWrapper({ organizationId }: { organizationId: string }) {
  try {
    const brief = await getExecutiveBrief(organizationId)

    // Si el brief vino vacío o sin texto, no renderizar
    if (!brief?.text?.trim()) {
      return null
    }

    return (
      <AIExecutiveBriefV2
        initialText={brief.text}
        initialGeneratedAt={brief.generatedAt}
        initialIsFresh={brief.isFresh}
        initialRegenerationsLeft={brief.regenerationsLeft}
        initialCanRegenerate={brief.canRegenerate}
      />
    )
  } catch (err) {
    console.error('[AIBrief] Server wrapper failed:', err)
    return null
  }
}

function HealthScoreSkeleton() {
  return (
    <div className="h-[360px] rounded-3xl border border-white/[0.06] bg-white/[0.015] p-10 animate-pulse" />
  )
}

function WeekResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[0, 1, 2, 3].map((item) => (
        <LoadingState key={item} variant="skeleton-stat" />
      ))}
    </div>
  )
}

function BriefSkeleton() {
  return <LoadingState variant="skeleton-card" />
}

async function DashboardGreetingWrapper({ organizationId }: { organizationId: string }) {
  const org = await unstable_cache(
    async () =>
      prisma.organization.findUnique({
        where: { id: organizationId },
        select: { companyName: true },
      }),
    ['dashboard-greeting', organizationId],
    { revalidate: 15, tags: [`org-meta:${organizationId}`] }
  )()

  if (!org) redirect('/login')

  return (
    <PageHeader
      eyebrow={formatDateES()}
      title={`${getGreeting()}, ${org.companyName}`}
      icon={Calendar}
      variant="gradient"
    />
  )
}

function PageHeaderSkeleton() {
  return (
    <header className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between sm:pt-4">
      <div className="flex items-center gap-3 w-full">
        <div className="h-11 w-11 rounded-xl bg-white/[0.05] animate-pulse shrink-0" />
        <div className="flex flex-col gap-2 w-full max-w-md">
          <div className="h-3 w-32 bg-white/[0.05] rounded animate-pulse" />
          <div className="h-8 w-64 bg-white/[0.08] rounded-md animate-pulse" />
        </div>
      </div>
    </header>
  )
}
