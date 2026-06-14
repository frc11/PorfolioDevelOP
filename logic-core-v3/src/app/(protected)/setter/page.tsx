import type { Metadata } from 'next'
import {
  CalendarCheck2,
  Clock3,
  Eye,
  ListTodo,
  Radar,
  Trophy,
} from 'lucide-react'
import { PageHeader, StatCard } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import {
  agruparParaHome,
  parseEvaluacion,
  parseFicha,
  ultimoRechazo,
  type HomeLeadInput,
} from '@/lib/leados/flow'
import { listOwnedLeads } from '@/lib/leados/ownership'
import { HomeEmpty } from './_components/home-empty'
import { ArchiveSection, GroupSection } from './_components/home-sections'
import { OnboardingHint } from './_components/onboarding-hint'

export const metadata: Metadata = {
  title: 'LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

export default async function SetterHomePage() {
  const userId = await requireSetter()
  const leads = await listOwnedLeads(userId)

  const ahora = Date.now()
  const inputs: HomeLeadInput[] = leads.map((lead) => ({
    id: lead.id,
    businessName: lead.businessName,
    industry: lead.industry,
    zone: lead.zone,
    status: lead.status,
    createdAt: lead.createdAt,
    stage: lead.dossier?.stage ?? null,
    ficha: parseFicha(lead.dossier?.fichaJson ?? null),
    evaluacion: parseEvaluacion(lead.dossier?.evaluacionJson ?? null),
    ultimoRechazo: ultimoRechazo(lead.dossier?.rechazos ?? null),
    // B6: estado de la conversación de outreach (derivado, cero campos nuevos).
    contactos: lead._count.activities,
    followUpVencido:
      lead.nextFollowUpAt !== null && lead.nextFollowUpAt.getTime() <= ahora,
    demoEnviada: Boolean(lead.dossier?.enviadaAt),
  }))

  const grupos = agruparParaHome(inputs)
  const demosAprobadas = inputs.filter((lead) => lead.stage === 'APROBADA').length

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="LeadOS"
        title="Tu cartera"
        description="Laburá de arriba para abajo: cada lead te dice su próximo paso."
        icon={Radar}
      />

      <OnboardingHint />

      {inputs.length === 0 ? (
        <HomeEmpty />
      ) : (
        <>
          {/* Cuatro colas de trabajo + un marcador de resultado, separados por un divisor sutil. */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Para trabajar" value={grupos.trabajar.length} accent="cyan" icon={ListTodo} />
            <StatCard label="En seguimiento" value={grupos.seguimiento.length} accent="zinc" icon={Clock3} />
            <StatCard label="Esperando revisión" value={grupos.revision.length} accent="violet" icon={Eye} />
            <StatCard label="Agendadas" value={grupos.agendadas.length} accent="amber" icon={CalendarCheck2} />
            <div className="relative flex">
              <span
                aria-hidden
                className="absolute inset-y-2 -left-1.5 hidden w-px bg-white/10 lg:block"
              />
              <StatCard
                className="w-full"
                label="Demos aprobadas"
                value={demosAprobadas}
                subtitle="tu marcador"
                accent="emerald"
                icon={Trophy}
              />
            </div>
          </div>

          <GroupSection
            icon={ListTodo}
            titulo="Para trabajar ahora"
            descripcion="Primero los que respondieron, después los calientes, después el resto."
            vacio="Nada para trabajar ahora mismo. Si esperás leads nuevos, avisale a Franco."
            leads={grupos.trabajar}
            destacado
          />

          <GroupSection
            icon={Eye}
            titulo="Esperando revisión"
            descripcion="Demos enviadas a revisión de Franco — no requieren acción tuya."
            vacio="Nada esperando revisión."
            leads={grupos.revision}
          />

          <GroupSection
            icon={Clock3}
            titulo="En seguimiento"
            descripcion="Evaluados sin respuesta del negocio todavía, y postergados."
            vacio="Nadie en seguimiento."
            leads={grupos.seguimiento}
          />

          <GroupSection
            icon={CalendarCheck2}
            titulo="Agendadas"
            descripcion="Reuniones agendadas — las cierra Franco."
            vacio="Sin reuniones agendadas todavía. Ya van a caer."
            leads={grupos.agendadas}
          />

          <ArchiveSection leads={grupos.archivo} />
        </>
      )}
    </div>
  )
}
