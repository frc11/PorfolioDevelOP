'use client'

import type { DossierStage, LeadStatus } from '@prisma/client'
import { Hammer, OctagonAlert } from 'lucide-react'
import { Callout, Card } from '@/components/ui'
import type {
  Agenda,
  Brief,
  Evaluacion,
  Ficha,
  Progreso,
  Rechazo,
  SelfCheck,
} from '@/lib/leados/contracts'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { gateBriefAbierto } from '@/lib/leados/flow'
import { GUIA_REVISION } from '@/lib/leados/guidance-content'
import { derivarPasoDelLead } from '@/lib/leados/paso'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { AgendaStep } from './agenda-step'
import { BriefStep } from './brief-step'
import { ConstruccionStep } from './construccion-step'
import { DossierStepper } from './dossier-stepper'
import { DraftStep } from './draft-step'
import { EvaluacionStep } from './evaluacion-step'
import { FichaStep } from './ficha-step'
import { OpenerStep } from './opener-step'
import { PasoActualBanner } from './paso-actual-banner'
import { SeguimientoStep } from './seguimiento-step'
import { SelfCheckStep } from './self-check-step'
import { StepAnchor } from './step-anchor'

export type WizardLead = CopyBlockLead & {
  id: string
  status: LeadStatus
  contactName: string | null
  /** A-14: re-servido en el header y en seguimiento/agenda — el setter nunca
   * tiene que volver a Ficha para encontrar el número. */
  phone: string | null
  /** B7: prefill del attendee del booking (Cal.com exige email). */
  email: string | null
  notes: string | null
  /** admin-1b: campo persistido que marca Franco — gobierna el gate y los badges. */
  caliente: boolean
}

export type WizardData = {
  lead: WizardLead
  stage: DossierStage | null
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  brief: Brief | null
  /** B4: draft publicado y self-check guardado (acciones de la construcción). */
  draftUrl: string | null
  selfCheck: SelfCheck | null
  /** E.2: progreso del checklist de construcción (fases marcadas). Auto-reporte,
   * no gate — persistido en `progresoJson`. Fresco = `{ completadas: [] }`. */
  progreso: Progreso
  /** B4: ISO de la última movida comercial si el lead respondió; null si no. */
  respondioDesde: string | null
  /** B-beta: ISO del escalamiento "me trabé" vigente; null si no escaló. */
  escaladoAt: string | null
  /** A-23: la nota del escalamiento vigente — re-servida a su autor y prefill del
   * re-escalar (antes solo la veía el admin). null si no escaló. */
  escaladoNota: string | null
  /** B5: último rechazo del admin — guía de retrabajo cuando stage=RECHAZADA. */
  ultimoRechazo: Rechazo | null
  /** B7: reunión agendada vía Cal.com (uid + traspaso) — acción «Agendar la reunión». */
  agenda: Agenda | null
  /** B6: la conversación de outreach (opener + seguimiento). */
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
    escaladoAt,
    escaladoNota,
    ultimoRechazo,
    agenda,
    outreach,
    progreso,
  } = data
  const gateAbierto = gateBriefAbierto(lead.status, lead.caliente)
  const fichaEditable = stage === null || stage === 'FICHA'
  const descartado = stage === 'DESCARTADA'
  // Pie «lo que sigue» para los dos stages donde el setter espera/redirige tras
  // la construcción. La DIRECCIÓN la pone el banner de arriba (`describirFoco`);
  // esto espeja ese mensaje, no lo contradice. [3.5]
  const notaPostBrief =
    stage === 'EN_REVISION'
      ? GUIA_REVISION.enRevision
      : stage === 'APROBADA'
        ? GUIA_REVISION.aprobada
        : undefined
  // B6.1: EVALUADA + gate cerrado + sin primer contacto → el paso REAL es mandar el
  // opener, no el Brief (bloqueado). Reencauza scroll + cartel + marco al opener. Fuera
  // de ese caso (gate abierto, u opener ya mandado) rige la dirección por stage de siempre.
  const openerPendiente = stage === 'EVALUADA' && !gateAbierto && outreach.contactos === 0
  // A-29: la ÚNICA derivación del paso, llamada UNA vez — reparte rail (stepper),
  // cartel (banner) y aterrizaje (anchor) desde el mismo hecho, sin re-derivar.
  const paso = derivarPasoDelLead(stage, gateAbierto, openerPendiente)
  // Al abrir, caer en el paso activo (no arriba de todo) — ver `StepAnchor`.
  const anchor = paso.anchor
  // El marco del paso activo comparte tono con el cartel de dirección (misma fuente).
  // cyan solo si hay trabajo del setter AHORA; neutral en revisión/descartado o si
  // falta que responda.
  const frameTono: 'foco' | 'neutral' = paso.foco.tono === 'foco' ? 'foco' : 'neutral'

  return (
    // `data-lead-wizard`: raíz de ESTA copia del wizard. Los `StepLink` resuelven su
    // destino dentro de ella, así la duplicación responsive del shell no ambigua a
    // qué copia saltar. Solo presentación.
    <div data-lead-wizard className="space-y-5">
      <DossierStepper stage={stage} actual={paso.indice} />

      <PasoActualBanner foco={paso.foco} />

      {stage === 'RECHAZADA' && ultimoRechazo && (
        <Callout
          tone="danger"
          accent
          icon={OctagonAlert}
          title={<span className="text-base">Franco pidió correcciones</span>}
          // Momento de máximo golpe del setter: recupera la jerarquía que tenía
          // como Card (título text-base + más aire) y SE ELEVA con sombra —
          // sigue siendo el Callout danger de B9, sin re-saturar el rojo.
          className="p-5 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.4)]"
        >
          <div className="space-y-1.5 leading-relaxed text-zinc-200">
            <p>
              <span className="font-semibold text-rose-200">Qué está mal:</span>{' '}
              {ultimoRechazo.motivo}
            </p>
            {ultimoRechazo.donde && (
              <p>
                <span className="font-semibold text-rose-200">Dónde:</span>{' '}
                {ultimoRechazo.donde}
              </p>
            )}
            {ultimoRechazo.arreglo && (
              <p className="whitespace-pre-wrap">
                <span className="font-semibold text-rose-200">Arreglo concreto:</span>{' '}
                {ultimoRechazo.arreglo}
              </p>
            )}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-zinc-400">
            Usalo como guía de retrabajo — reabrí la construcción en el Paso 4 de abajo,
            rehacé lo marcado y volvé a pasar por draft y self-check.
          </p>
        </Callout>
      )}

      {/* Destino del `StepLink` del gate de la evaluación (ficha sin señal mínima).
          `active={false}` → solo marca, sin enfocar al abrir ni enmarcar. */}
      <StepAnchor active={false} leadId={lead.id} frameTone="none" anchorId="ficha">
        <FichaStep leadId={lead.id} lead={lead} ficha={ficha} editable={fichaEditable} />
      </StepAnchor>

      <StepAnchor active={anchor === 'evaluacion'} leadId={lead.id} frameTone={frameTono}>
        <EvaluacionStep
          leadId={lead.id}
          leadStatus={lead.status}
          caliente={lead.caliente}
          ficha={ficha}
          evaluacion={evaluacion}
          habilitado={fichaEditable}
          descartado={descartado}
        />
      </StepAnchor>

      {/* B6: la conversación (opener + seguimiento) va pegada a la
          evaluación — el opener sale apenas hay veredicto, y la producción
          (brief → construcción → draft → self-check) se abre recién cuando la
          conversación lo habilita. */}
      {/* Destino del `StepLink` del gate del brief + (B6.1) paso activo cuando el opener
          está pendiente: ahí aterriza el scroll y se enmarca, en vez del Brief bloqueado. */}
      {!descartado && (
        <StepAnchor
          active={anchor === 'opener'}
          leadId={lead.id}
          frameTone={anchor === 'opener' ? frameTono : 'none'}
          anchorId="opener"
        >
          <OpenerStep
            leadId={lead.id}
            lead={lead}
            stage={stage}
            status={lead.status}
            caliente={lead.caliente}
            ficha={ficha}
            evaluacion={evaluacion}
            contactos={outreach.contactos}
            ultimoContacto={outreach.ultimoContacto}
            proximoToque={outreach.proximoToque}
            dmsHoy={outreach.dmsHoy}
          />
        </StepAnchor>
      )}

      {!descartado && (
        <StepAnchor
          active={anchor === 'seguimiento'}
          leadId={lead.id}
          frameTone={frameTono}
          anchorId="seguimiento"
        >
          <SeguimientoStep
            leadId={lead.id}
            lead={lead}
            leadPhone={lead.phone}
            stage={stage}
            status={lead.status}
            caliente={lead.caliente}
            contactos={outreach.contactos}
            followUpCount={outreach.followUpCount}
            proximoToque={outreach.proximoToque}
            reactivateAt={outreach.reactivateAt}
            finalUrl={outreach.finalUrl}
            demoEnviadaAt={outreach.demoEnviadaAt}
            dmsHoy={outreach.dmsHoy}
          />
        </StepAnchor>
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
          leadPhone={lead.phone}
        />
      )}

      {!descartado && (
        <StepAnchor active={anchor === 'brief'} leadId={lead.id} frameTone={frameTono}>
          <BriefStep
            leadId={lead.id}
            lead={lead}
            stage={stage}
            ficha={ficha}
            evaluacion={evaluacion}
            brief={brief}
            gateAbierto={gateAbierto}
          />
        </StepAnchor>
      )}

      {!descartado && (
        <StepAnchor active={anchor === 'construccion'} leadId={lead.id} frameTone={frameTono}>
          <ConstruccionStep
            leadId={lead.id}
            lead={lead}
            stage={stage}
            brief={brief}
            ficha={ficha}
            ultimoRechazo={ultimoRechazo}
            respondioDesde={respondioDesde}
            escaladoAt={escaladoAt}
            escaladoNota={escaladoNota}
            progreso={progreso}
          />
        </StepAnchor>
      )}

      {/* Destino del `StepLink` del self-check (gate "publicá el draft primero"). */}
      {!descartado && (
        <StepAnchor active={false} leadId={lead.id} frameTone="none" anchorId="draft">
          <DraftStep leadId={lead.id} stage={stage} draftUrl={draftUrl} />
        </StepAnchor>
      )}

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
          <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
            <LineaRicaText linea={notaPostBrief} />
          </p>
        </Card>
      )}
    </div>
  )
}
