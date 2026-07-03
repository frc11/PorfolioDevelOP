'use client'

import { Hammer, LifeBuoy, Lock, Save } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Button, Card } from '@/components/ui'
import type { Brief, Ficha, Progreso, Rechazo } from '@/lib/leados/contracts'
import { buildConstruccionBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_CONSTRUCCION } from '@/lib/leados/guidance-content'
import { formatEspera } from '@/lib/leados/revision'
import { useStepAction } from '@/lib/use-step-action'
import {
  iniciarConstruccion,
  reabrirConstruccion,
} from '@/app/(protected)/setter/_actions/dossier.actions'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { BadgeProvisorio } from './badge-provisorio'
import { ChecklistConstruccion } from './checklist-construccion'
import { EscalarModal } from './escalar-modal'
import { GuiaRetrabajo } from './guia-retrabajo'
import { MaterialesNegocio } from './materiales-negocio'
import { PromptsDisenio } from './prompts-disenio'
import { UrgenciaBanner } from './urgencia-banner'
import { useHidratado } from './use-hidratado'

type ConstruccionStepProps = {
  leadId: string
  lead: CopyBlockLead
  stage: DossierStage | null
  brief: Brief | null
  /** B8A-II: la ficha del Paso 1 — la materia prima real (reseñas, tono, links
   * de assets) que el shell pide usar para que la demo no salga genérica. */
  ficha: Ficha | null
  ultimoRechazo: Rechazo | null
  /** ISO de la última movida comercial del lead; null si todavía no respondió. */
  respondioDesde: string | null
  /** B-beta: ISO del escalamiento "me trabé" vigente; null si no escaló. */
  escaladoAt: string | null
  /** E.2: progreso del checklist de construcción (qué fases marcó el setter).
   * Viene de `progresoJson` → sobrevive refresh. Fresco = `{ completadas: [] }`. */
  progreso: Progreso
}

export function ConstruccionStep({
  leadId,
  lead,
  stage,
  brief,
  ficha,
  ultimoRechazo,
  respondioDesde,
  escaladoAt,
  progreso,
}: ConstruccionStepProps) {
  const { isPending, run } = useStepAction()
  const hidratado = useHidratado()

  const transicionar = (action: typeof iniciarConstruccion, mensajeOk: string) => {
    run(() => action(leadId), { successToast: mensajeOk })
  }

  // ── Antes del brief: paso apagado ──────────────────────────────────────────
  if (stage === null || stage === 'FICHA' || stage === 'EVALUADA') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">{GUIA_CONSTRUCCION.titulo}</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se habilita cuando el brief queda guardado y verificado.
        </p>
      </Card>
    )
  }

  // ── BRIEF: listo para arrancar ─────────────────────────────────────────────
  if (stage === 'BRIEF') {
    return (
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_CONSTRUCCION.titulo}</h2>
          <BadgeProvisorio />
        </div>
        <UrgenciaBanner respondioDesde={respondioDesde} />
        <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
          <LineaRicaText linea={GUIA_CONSTRUCCION.intro} />
        </p>
        <ToolGuide id="claudeDesign" />
        <Button
          onClick={() => transicionar(iniciarConstruccion, 'Construcción arrancada — seguí la guía.')}
          loading={isPending}
          icon={<Hammer size={14} strokeWidth={1.5} />}
        >
          Arrancar construcción
        </Button>
      </Card>
    )
  }

  // ── RECHAZADA: reabrir para retrabajo ──────────────────────────────────────
  if (stage === 'RECHAZADA') {
    return (
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_CONSTRUCCION.titulo}</h2>
          <Badge tone="rose" variant="soft">Correcciones pendientes</Badge>
        </div>
        {/* B6.1: la nota de Franco, acá donde el auto-scroll aterriza al reabrir el lead
            (el paso activo es Construcción). Antes solo vivía en el Callout del tope del
            wizard, a 2+ pantallas del aterrizaje — el setter caía sin verla. Es el MISMO
            GuiaRetrabajo que ya muestra la rama CONSTRUCCION tras reabrir. */}
        {ultimoRechazo && <GuiaRetrabajo rechazo={ultimoRechazo} />}
        <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
          Reabrí la construcción para rehacer lo que Franco marcó (lo tenés arriba). Después volvés
          a publicar el draft y a pasar el self-check antes de reenviar — el historial de rechazos
          se conserva.
        </p>
        <Button
          onClick={() =>
            transicionar(reabrirConstruccion, 'Construcción reabierta — guiate por el rechazo.')
          }
          loading={isPending}
          icon={<Hammer size={14} strokeWidth={1.5} />}
        >
          Reabrir construcción
        </Button>
      </Card>
    )
  }

  // ── CONSTRUCCION: el shell guiado ──────────────────────────────────────────
  if (stage === 'CONSTRUCCION') {
    const esperaEscalado =
      escaladoAt && hidratado ? formatEspera(new Date(escaladoAt), new Date()) : null
    return (
      <Card padding="lg" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_CONSTRUCCION.titulo}</h2>
          <BadgeProvisorio />
        </div>

        <UrgenciaBanner respondioDesde={respondioDesde} />

        {ultimoRechazo && <GuiaRetrabajo rechazo={ultimoRechazo} />}

        <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
          Construí en Claude Design fase por fase. En el checklist de abajo, la fase en curso
          queda destacada con sus sub-pasos a la vista; tildá cada una al terminarla (podés
          destildar si volvés atrás — el orden no es rígido). La secuencia es preliminar: se va
          a refinar cuando se validen las primeras demos reales.
        </p>

        <TeachPanel id="construccion" />

        <ToolGuide id="claudeDesign" />

        {brief && (
          <CopyBlock
            titulo="Bloque para Claude Design"
            instruccion="El brief + los materiales reales, listos para pegar como primer mensaje."
            texto={buildConstruccionBlock(lead, brief, ficha)}
          />
        )}

        <MaterialesNegocio lead={lead} ficha={ficha} />

        <ChecklistConstruccion leadId={leadId} completadas={progreso.completadas} />

        <PromptsDisenio />

        <p className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs text-zinc-500">
          <Save size={13} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
          Claude Design no guarda solo: antes de cambiar de pestaña o cerrar, guardá (o exportá) lo
          que llevás hecho.
        </p>

        {escaladoAt ? (
          <div className="flex flex-col gap-3 rounded-xl border border-rose-400/20 bg-rose-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-start gap-2 text-xs leading-relaxed text-rose-100">
              <LifeBuoy size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-rose-300" />
              <span>
                <span className="font-semibold">Ya avisaste a Franco</span>
                {esperaEscalado ? ` (hace ${esperaEscalado})` : ''}. Está al tanto — seguí con
                otro lead mientras te responde.
              </span>
            </p>
            <EscalarModal leadId={leadId} reescalar />
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.06] pt-4">
            <p className="text-xs text-zinc-600">¿Algo no sale como la guía dice?</p>
            <EscalarModal leadId={leadId} />
          </div>
        )}
      </Card>
    )
  }

  // ── EN_REVISION / APROBADA / DESCARTADA: resumen mínimo ───────────────────
  return (
    <Card variant="subtle" padding="lg">
      <h2 className="text-base font-semibold text-zinc-300">{GUIA_CONSTRUCCION.titulo}</h2>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Demo construida. El dossier ya avanzó a la etapa siguiente.
      </p>
    </Card>
  )
}
