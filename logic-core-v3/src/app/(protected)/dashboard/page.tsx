import { AIExecutiveBriefV2 } from '@/components/dashboard/home/AIExecutiveBriefV2'
import { AttentionStack } from '@/components/dashboard/home/AttentionStack'
import { HealthScore } from '@/components/dashboard/home/HealthScore'
import { OnboardingStatusCard } from '@/components/dashboard/OnboardingStatusCard'
import { WeekResultsGrid } from '@/components/dashboard/home/WeekResultsGrid'
import { LoadingState, PageHeader } from '@/components/ui'
import { getExecutiveBrief } from '@/lib/ai/executive-brief'
import { getAttentionItems } from '@/lib/dashboard/attention'
import { getWeekResults } from '@/lib/dashboard/week-results'
import { getHealthScore } from '@/lib/health-score'
import { resolveOrgId } from '@/lib/preview'
import { prisma } from '@/lib/prisma'
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

  const org = await prisma.organization.findUnique({
    where: { id: organizationId },
    select: { companyName: true },
  })

  if (!org) redirect('/login')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 pb-20 sm:gap-10">
      <PageHeader
        eyebrow={formatDateES()}
        title={`${getGreeting()}, ${org.companyName}`}
        icon={Calendar}
        variant="gradient"
      />

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

      <Suspense fallback={<BriefSkeleton />}>
        <BriefServerWrapper organizationId={organizationId} />
      </Suspense>
    </div>
  )
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
      console.log(`[AIBrief] No content for org ${organizationId}, skipping render`)
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
