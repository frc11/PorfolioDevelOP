'use client'

import type { DossierStage, LeadStatus } from '@prisma/client'
import { Hammer, OctagonAlert } from 'lucide-react'
import { Card } from '@/components/ui'
import type { Agenda, Brief, Evaluacion, Ficha, Rechazo, SelfCheck } from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { gateBriefAbierto } from '@/lib/leados/flow'
import { AgendaStep } from './agenda-step'
import { BriefStep } from './brief-step'
import { ConstruccionStep } from './construccion-step'
import { DossierStepper } from './dossier-stepper'
import { DraftStep } from './draft-step'
import { EvaluacionStep } from './evaluacion-step'
import { FichaStep } from './ficha-step'
import { OpenerStep } from './opener-step'
import { SeguimientoStep } from './seguimiento-step'
import { SelfCheckStep } from './self-check-step'

export type WizardLead = CopyBlockLead & {
  id: string
  status: LeadStatus
  contactName: string | null
  /** B7: prefill del attendee del booking (Cal.com exige email). */
  email: string | null
  notes: string | null
}

export type WizardData = {
  lead: WizardLead
  stage: DossierStage | null
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  brief: Brief | null
  /** B4: draft publicado y self-check guardado (pasos 5–6). */
  draftUrl: string | null
  selfCheck: SelfCheck | null
  /** B4: ISO de la última movida comercial si el lead respondió; null si no. */
  respondioDesde: string | null
  /** B5: último rechazo del admin — guía de retrabajo cuando stage=RECHAZADA. */
  ultimoRechazo: Rechazo | null
  /** B7: reunión agendada vía Cal.com (uid + traspaso) — Paso 10. */
  agenda: Agenda | null
  /** B6: la conversación de outreach (pasos 7 y 9). */
  outreach: {
    contactos: number
    followUpCount: number
    ultimoContacto: string | null
    proximoToque: string | null
    reactivateAt: string | null
    finalUrl: string | null
    demoEnviadaAt: string | null
    dmsHoy: number
  }
}

const POST_BRIEF_NOTAS: Partial<Record<DossierStage, string>> = {
  EN_REVISION:
    'La demo está en revisión de Franco. Cuando la apruebe o pida correcciones, lo ves acá y en tu cartera.',
  APROBADA:
    'Demo aprobada 🎉 — el envío del link vive en el Paso 9: el panel arma el mensaje cuando el flujo lo habilita.',
}

export function LeadWizard({ data }: { data: WizardData }) {
  const {
    lead,
    stage,
    ficha,
    evaluacion,
    brief,
    draftUrl,
    selfCheck,
    respondioDesde,
    ultimoRechazo,
    agenda,
    outreach,
  } = data
  const gateAbierto = gateBriefAbierto(lead.status, evaluacion?.score ?? null)
  const fichaEditable = stage === null || stage === 'FICHA'
  const descartado = stage === 'DESCARTADA'
  const notaPostBrief = stage ? POST_BRIEF_NOTAS[stage] : undefined

  return (
    <div className="space-y-5">
      <DossierStepper stage={stage} />

      {stage === 'RECHAZADA' && ultimoRechazo && (
        <Card variant="subtle" padding="lg" className="border-rose-400/20 bg-rose-500/[0.04]">
          <div className="flex items-center gap-2.5">
            <OctagonAlert size={15} strokeWidth={1.5} className="text-rose-400" />
            <h2 className="text-base font-semibold text-rose-200">
              Franco pidió correcciones
            </h2>
          </div>
          <div className="mt-3 space-y-1.5 text-sm leading-relaxed">
            <p className="text-zinc-200">
              <span className="font-semibold text-rose-300">Qué está mal:</span>{' '}
              {ultimoRechazo.motivo}
            </p>
            {ultimoRechazo.donde && (
              <p className="text-zinc-200">
                <span className="font-semibold text-rose-300">Dónde:</span>{' '}
                {ultimoRechazo.donde}
              </p>
            )}
            {ultimoRechazo.arreglo && (
              <p className="whitespace-pre-wrap text-zinc-200">
                <span className="font-semibold text-rose-300">Arreglo concreto:</span>{' '}
                {ultimoRechazo.arreglo}
              </p>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-500">
            Usalo como guía de retrabajo — reabrí la construcción en el Paso 4 de abajo,
            rehacé lo marcado y volvé a pasar por draft y self-check.
          </p>
        </Card>
      )}

      <FichaStep leadId={lead.id} lead={lead} ficha={ficha} editable={fichaEditable} />

      <EvaluacionStep
        leadId={lead.id}
        leadStatus={lead.status}
        ficha={ficha}
        evaluacion={evaluacion}
        habilitado={fichaEditable}
        descartado={descartado}
      />

      {/* B6: la conversación (pasos 7 y 9 de la metodología) va pegada a la
          evaluación — el opener sale apenas hay veredicto, y la producción
          (pasos 3–6) se abre recién cuando la conversación lo habilita. */}
      {!descartado && (
        <OpenerStep
          leadId={lead.id}
          lead={lead}
          stage={stage}
          status={lead.status}
          ficha={ficha}
          evaluacion={evaluacion}
          contactos={outreach.contactos}
          ultimoContacto={outreach.ultimoContacto}
          proximoToque={outreach.proximoToque}
          dmsHoy={outreach.dmsHoy}
        />
      )}

      {!descartado && (
        <SeguimientoStep
          leadId={lead.id}
          lead={lead}
          stage={stage}
          status={lead.status}
          evaluacion={evaluacion}
          contactos={outreach.contactos}
          followUpCount={outreach.followUpCount}
          proximoToque={outreach.proximoToque}
          reactivateAt={outreach.reactivateAt}
          finalUrl={outreach.finalUrl}
          demoEnviadaAt={outreach.demoEnviadaAt}
          dmsHoy={outreach.dmsHoy}
        />
      )}

      {/* B7: el cierre del ciclo del setter — cuando la conversación llega a
          "sí, reunámonos", acá se ofrecen horarios reales y se agenda. */}
      {!descartado && (
        <AgendaStep
          leadId={lead.id}
          status={lead.status}
          ficha={ficha}
          agenda={agenda}
          contactName={lead.contactName}
          leadEmail={lead.email}
        />
      )}

      {!descartado && (
        <BriefStep
          leadId={lead.id}
          lead={lead}
          stage={stage}
          ficha={ficha}
          evaluacion={evaluacion}
          brief={brief}
          gateAbierto={gateAbierto}
        />
      )}

      {!descartado && (
        <ConstruccionStep
          leadId={lead.id}
          lead={lead}
          stage={stage}
          brief={brief}
          ficha={ficha}
          ultimoRechazo={ultimoRechazo}
          respondioDesde={respondioDesde}
        />
      )}

      {!descartado && <DraftStep leadId={lead.id} stage={stage} draftUrl={draftUrl} />}

      {!descartado && (
        <SelfCheckStep
          leadId={lead.id}
          stage={stage}
          draftUrl={draftUrl}
          selfCheck={selfCheck}
          brief={brief}
        />
      )}

      {notaPostBrief && (
        <Card variant="subtle" padding="lg">
          <div className="flex items-center gap-2.5">
            <Hammer size={15} strokeWidth={1.5} className="text-zinc-500" />
            <h2 className="text-base font-semibold text-zinc-300">Lo que sigue</h2>
          </div>
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-500">{notaPostBrief}</p>
        </Card>
      )}
    </div>
  )
}
