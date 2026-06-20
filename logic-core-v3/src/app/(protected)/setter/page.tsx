import type { Metadata } from 'next'
import { Radar } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { buildHomeLeads } from '@/lib/leados/home'
import { listOwnedLeads } from '@/lib/leados/ownership'
import { CarteraView } from './_components/cartera-view'
import { HomeEmpty } from './_components/home-empty'
import { OnboardingHint } from './_components/onboarding-hint'

export const metadata: Metadata = {
  title: 'LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

export default async function SetterHomePage() {
  const userId = await requireSetter()
  const leads = await listOwnedLeads(userId)
  const homeLeads = buildHomeLeads(leads)

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LeadOS"
        title="Tu cartera"
        description="Laburá de arriba para abajo: cada lead te dice su próximo paso."
        icon={Radar}
      />

      <OnboardingHint />

      {homeLeads.length === 0 ? <HomeEmpty /> : <CarteraView leads={homeLeads} />}
    </div>
  )
}
