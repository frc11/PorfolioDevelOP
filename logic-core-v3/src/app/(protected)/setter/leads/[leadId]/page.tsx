import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Flame } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { Badge } from '@/components/ui'
import { requireSetter } from '@/lib/auth-guards'
import { countFollowUps } from '@/lib/follow-up'
import { getOwnedDossier } from '@/lib/leados/dossier'
import { contarDmsHoy, listOwnedLeadActivities } from '@/lib/leados/outreach'
import { getOwnedLead } from '@/lib/leados/ownership'
import {
  leadRespondio,
  parseAgenda,
  parseBrief,
  parseEvaluacion,
  parseFicha,
  parseSelfCheck,
  ultimoRechazo,
  STAGE_LABELS,
  STATUS_LABELS,
} from '@/lib/leados/flow'
import { LeadWizard, type WizardData } from './_components/lead-wizard'

export const metadata: Metadata = {
  title: 'Lead · LeadOS · develOP',
}

export const dynamic = 'force-dynamic'

const STATUS_TONES: Record<LeadStatus, 'cyan' | 'emerald' | 'amber' | 'rose' | 'violet' | 'zinc' | 'blue'> = {
  PROSPECTO: 'cyan',
  DEMO_ENVIADA: 'violet',
  VIO_VIDEO: 'emerald',
  RESPONDIO: 'blue',
  CALL_AGENDADA: 'amber',
  CERRADO: 'emerald',
  PERDIDO: 'rose',
  POSTERGADO: 'zinc',
}

type SetterLeadPageProps = {
  params: Promise<{ leadId: string }>
}

export default async function SetterLeadPage({ params }: SetterLeadPageProps) {
  const { leadId } = await params
  const userId = await requireSetter()

  // Regla de oro de ownership: lead ajeno o inexistente → 404, sin leakear.
  const lead = await getOwnedLead(leadId, userId)
  if (!lead) {
    notFound()
  }

  const [dossier, actividades, dmsHoy] = await Promise.all([
    getOwnedDossier(leadId, userId),
    listOwnedLeadActivities(leadId, userId),
    contarDmsHoy(userId),
  ])
  const evaluacion = parseEvaluacion(dossier?.evaluacionJson ?? null)
  const caliente =
    evaluacion !== null && evaluacion.score >= 4 && dossier?.stage !== 'DESCARTADA'

  const data: WizardData = {
    lead: {
      id: lead.id,
      businessName: lead.businessName,
      contactName: lead.contactName,
      industry: lead.industry,
      zone: lead.zone,
      instagramUrl: lead.instagramUrl,
      currentWebUrl: lead.currentWebUrl,
      googleMapsUrl: lead.googleMapsUrl,
      status: lead.status,
      email: lead.email,
      notes: lead.notes,
    },
    stage: dossier?.stage ?? null,
    ficha: parseFicha(dossier?.fichaJson ?? null),
    evaluacion,
    brief: parseBrief(dossier?.briefJson ?? null),
    draftUrl: dossier?.draftUrl ?? null,
    selfCheck: parseSelfCheck(dossier?.selfCheckJson ?? null),
    // B4: proxy de "desde cuándo espera" = último write comercial del lead
    // (mismo criterio que B5 usa updatedAt del dossier para la cola).
    respondioDesde: leadRespondio(lead.status) ? lead.updatedAt.toISOString() : null,
    ultimoRechazo: ultimoRechazo(dossier?.rechazos ?? null),
    // B7: la reunión agendada (booking Cal.com + traspaso) — Paso 10.
    agenda: parseAgenda(dossier?.agendaJson ?? null),
    // B6: la conversación de outreach — todo derivado de la maquinaria
    // existente (activities + nextFollowUpAt + enviadaAt), cero campos nuevos.
    outreach: {
      contactos: actividades?.length ?? 0,
      followUpCount: countFollowUps(actividades ?? []),
      ultimoContacto: actividades?.[0]?.createdAt.toISOString() ?? null,
      proximoToque: lead.nextFollowUpAt?.toISOString() ?? null,
      reactivateAt: lead.reactivateAt?.toISOString() ?? null,
      finalUrl: dossier?.finalUrl ?? null,
      demoEnviadaAt: dossier?.enviadaAt?.toISOString() ?? null,
      dmsHoy,
    },
  }

  const links = [
    { label: 'Instagram', href: lead.instagramUrl },
    { label: 'Web actual', href: lead.currentWebUrl },
    { label: 'Google Maps', href: lead.googleMapsUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href))

  const meta = [lead.contactName, lead.industry, lead.zone].filter(Boolean).join(' · ')

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <Link
          href="/setter"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Volver a tu cartera
        </Link>

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">
            {lead.businessName}
          </h1>
          <div className="flex items-center gap-1.5">
            {caliente && (
              <Badge tone="amber" variant="soft" pulse icon={<Flame size={10} strokeWidth={1.5} />}>
                Caliente
              </Badge>
            )}
            <Badge tone={STATUS_TONES[lead.status]} variant="soft">
              {STATUS_LABELS[lead.status]}
            </Badge>
            {dossier?.stage && (
              <Badge tone="zinc" variant="outline">
                {STAGE_LABELS[dossier.stage]}
              </Badge>
            )}
          </div>
        </div>

        {meta && <p className="text-sm text-zinc-500">{meta}</p>}

        {links.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-zinc-200"
              >
                <ExternalLink size={11} strokeWidth={1.5} />
                {link.label}
              </a>
            ))}
          </div>
        )}

        {lead.notes && (
          <p className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-500">
            <span className="font-semibold text-zinc-400">Notas del lead:</span> {lead.notes}
          </p>
        )}
      </header>

      <LeadWizard data={data} />
    </div>
  )
}
