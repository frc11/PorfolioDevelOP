import type { Metadata } from 'next'
import { Radar } from 'lucide-react'
import { PageHeader } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { buildHomeLeads } from '@/lib/leados/home'
import { derivarMisNumeros } from '@/lib/leados/mis-numeros'
import { getNovedadesSetter } from '@/lib/leados/novedades'
import { listOwnedLeads } from '@/lib/leados/ownership'
import { getProgresoSemana } from '@/lib/leados/progreso'
import { CarteraView } from './_components/cartera-view'
import { HomeEmpty } from './_components/home-empty'
import { MisNumeros } from './_components/mis-numeros'
import { NovedadesPanel } from './_components/novedades-panel'
import { OnboardingHint } from './_components/onboarding-hint'
import { ProgresoSemana } from './_components/progreso-semana'

export const metadata: Metadata = {
  title: 'LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

export default async function SetterHomePage() {
  const userId = await requireSetter()
  const leads = await listOwnedLeads(userId)
  const homeLeads = buildHomeLeads(leads)
  // Números propios del setter: derivados de los MISMOS leads ya cargados (cero
  // queries nuevas), aislados por construcción (la cartera ya filtra por dueño).
  const misNumeros = derivarMisNumeros(leads, userId)
  // Ambas lecturas reusan los leads ya cargados (no se le pega de nuevo a la
  // cartera): las novedades dirigidas y la señal de avance. En paralelo — son
  // independientes entre sí.
  const [novedades, progreso] = await Promise.all([
    getNovedadesSetter(userId, leads),
    getProgresoSemana(userId, leads),
  ])

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LeadOS"
        title="Tu cartera"
        description="Laburá de arriba para abajo: cada lead te dice su próximo paso."
        icon={Radar}
      />

      <NovedadesPanel novedades={novedades} />

      {/* Acuse sobrio del laburo reciente — del propio setter, no comparativo. */}
      <ProgresoSemana progreso={progreso} />

      <OnboardingHint />

      {homeLeads.length === 0 ? (
        <HomeEmpty />
      ) : (
        <>
          <CarteraView leads={homeLeads} />
          {/* Reflexivo y secundario: los números propios van al pie, no compiten
              con el trabajo ("de arriba para abajo, cada lead te dice su paso"). */}
          <MisNumeros numeros={misNumeros} />
        </>
      )}
    </div>
  )
}
