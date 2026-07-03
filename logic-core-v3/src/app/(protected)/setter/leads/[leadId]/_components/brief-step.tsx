'use client'

import { useState } from 'react'
import { CheckCircle2, Hourglass, Lock, PencilLine } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Button, Card } from '@/components/ui'
import type { Brief, Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildBriefInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_BRIEF } from '@/lib/leados/guidance-content'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { BriefForm, BriefResumen } from './brief-form'
import { StepLink } from './step-nav'

type BriefStepProps = {
  leadId: string
  lead: CopyBlockLead
  stage: DossierStage | null
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  brief: Brief | null
  gateAbierto: boolean
}

/**
 * Orquesta las ramas por stage del Brief; el núcleo de escritura vive en el
 * `BriefForm` compartido (5.3) y el brief guardado en `BriefResumen` — las
 * MISMAS piezas que consume el manual (M6). Acá quedan solo el chrome del paso
 * (intro, ToolGuide, el bloque del Gem) y el estado de edición del sanity-check.
 */
export function BriefStep({
  leadId,
  lead,
  stage,
  ficha,
  evaluacion,
  brief,
  gateAbierto,
}: BriefStepProps) {
  const [editando, setEditando] = useState(false)
  const [sanityOk, setSanityOk] = useState(false)

  // ── Antes de la evaluación: paso apagado ───────────────────────────────────
  if (stage === null || stage === 'FICHA') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">{GUIA_BRIEF.titulo}</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se habilita después de registrar la evaluación.
        </p>
      </Card>
    )
  }

  // ── EVALUADA con gate cerrado: explicar la espera, no frustrar ─────────────
  // El gate (gateBriefAbierto) lo decide el server y llega como prop: acá solo
  // lo EXPLICAMOS. Tono zinc (espera, no bloqueo), coherente con el cartel del
  // wizard (describirFoco → «En espera · Brief»).
  if (stage === 'EVALUADA' && !gateAbierto) {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Hourglass size={15} strokeWidth={1.5} className="text-zinc-500" />
          <h2 className="text-base font-semibold text-zinc-300">{GUIA_BRIEF.titulo}</h2>
        </div>
        <p className="mt-2 text-xs font-semibold text-zinc-300">{GUIA_BRIEF.gate.titulo}</p>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-400">
          <LineaRicaText linea={GUIA_BRIEF.gate.detalle} />
        </p>
        {/* La salida del gate: mientras se espera la respuesta, lo accionable es el
            opener (antes solo lo nombraba la prosa). */}
        <div className="mt-3">
          <StepLink to="opener">Ir al opener</StepLink>
        </div>
      </Card>
    )
  }

  const mostrarFormulario = stage === 'EVALUADA' || editando

  // ── Captura (EVALUADA con gate abierto) o re-pegado (BRIEF + editar) ───────
  if (mostrarFormulario) {
    return (
      <Card padding="lg" className="space-y-5">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_BRIEF.titulo}</h2>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
            <LineaRicaText linea={GUIA_BRIEF.intro} />
          </p>
        </div>

        <ToolGuide id="gemDiseno" />

        <TeachPanel id="brief" />

        {ficha && evaluacion && (
          <CopyBlock
            titulo="Bloque para el Gem de diseño"
            instruccion="Ficha + evaluación juntas: el input completo del Gem."
            texto={buildBriefInputBlock(lead, ficha, evaluacion)}
          />
        )}

        <BriefForm
          leadId={leadId}
          businessName={lead.businessName}
          brief={brief}
          autosaveEnabled={stage === 'BRIEF' && editando}
          onCancel={editando ? () => setEditando(false) : undefined}
          onSaved={() => {
            setEditando(false)
            setSanityOk(false)
          }}
        />
      </Card>
    )
  }

  // ── BRIEF guardado: sanity-check visual ────────────────────────────────────
  if (stage === 'BRIEF' && brief) {
    return (
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_BRIEF.titulo}</h2>
          <Badge tone="violet" variant="soft" size="md">
            Brief guardado
          </Badge>
        </div>

        <BriefResumen brief={brief} />

        {sanityOk ? (
          <p className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs font-medium text-emerald-300">
            <CheckCircle2 size={14} strokeWidth={1.5} />
            Brief verificado. Seguí con el Paso 4 — Construcción de la demo.
          </p>
        ) : (
          <div className="rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-4">
            <p className="text-xs font-semibold text-amber-300">Chequeo rápido antes de seguir</p>
            <p className="mt-1 text-xs leading-relaxed text-amber-200/80">
              ¿El brief menciona el negocio real y sus dolores concretos (los de las reseñas que
              copiaste), o quedó genérico? Un brief genérico produce una demo genérica.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSanityOk(true)}>
                Menciona lo concreto — está bien
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<PencilLine size={13} strokeWidth={1.5} />}
                onClick={() => setEditando(true)}
              >
                Quedó genérico — re-pegar
              </Button>
            </div>
          </div>
        )}
      </Card>
    )
  }

  // ── Stages posteriores (CONSTRUCCION+): resumen mínimo ─────────────────────
  return (
    <Card variant="subtle" padding="lg">
      <h2 className="text-base font-semibold text-zinc-300">{GUIA_BRIEF.titulo}</h2>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        {brief ? `Brief "${brief.titulo}" guardado.` : 'Brief guardado.'} El dossier ya avanzó a
        la etapa siguiente.
      </p>
    </Card>
  )
}
