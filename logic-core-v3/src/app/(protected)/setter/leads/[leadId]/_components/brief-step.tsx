'use client'

import { useMemo, useState } from 'react'
import { CheckCircle2, Hourglass, Lock, PencilLine } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Button, Card, Field, Input, TextArea } from '@/components/ui'
import { fail } from '@/lib/action-utils'
import type { Brief, Evaluacion, Ficha } from '@/lib/leados/contracts'
import { buildBriefInputBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { GUIA_BRIEF } from '@/lib/leados/guidance-content'
import { useAutosave } from '@/lib/use-autosave'
import { erroresPorCampo, useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { guardarBrief } from '@/app/(protected)/setter/_actions/dossier.actions'
import { BriefInputSchema, type BriefInput } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { AutosaveStatus } from '@/app/(protected)/setter/_components/autosave-status'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
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

type FormErrors = Partial<Record<'titulo' | 'secciones' | 'pegadoGem', string>>

type BriefFormState = {
  pegadoGem: string
  titulo: string
  concepto: string
  seccionesTexto: string
  notasMarca: string
  cta: string
}

function estadoInicial(brief: Brief | null, businessName: string): BriefFormState {
  return {
    pegadoGem: brief?.pegadoGem ?? '',
    titulo: brief?.titulo ?? businessName,
    concepto: brief?.concepto ?? '',
    seccionesTexto: brief?.secciones.join('\n') ?? '',
    notasMarca: brief?.notasMarca ?? '',
    cta: brief?.cta ?? '',
  }
}

/** Form → input del brief: mismo mapeo para el guardado manual y el autosave. */
function aPayloadBrief(state: BriefFormState): BriefInput {
  return {
    pegadoGem: state.pegadoGem,
    titulo: state.titulo,
    concepto: state.concepto || undefined,
    secciones: state.seccionesTexto
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean),
    notasMarca: state.notasMarca || undefined,
    cta: state.cta || undefined,
  }
}

export function BriefStep({
  leadId,
  lead,
  stage,
  ficha,
  evaluacion,
  brief,
  gateAbierto,
}: BriefStepProps) {
  const [form, setForm] = useState<BriefFormState>(() => estadoInicial(brief, lead.businessName))
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [editando, setEditando] = useState(false)
  const [sanityOk, setSanityOk] = useState(false)
  const { isPending, run } = useStepAction()

  // El form se muestra en la captura inicial (EVALUADA con gate abierto) o al
  // re-pegar desde el sanity-check (BRIEF + editando).
  const formVisible = (stage === 'EVALUADA' && gateAbierto) || editando
  const briefValido = useMemo(() => BriefInputSchema.safeParse(aPayloadBrief(form)).success, [form])

  // Autosave SOLO en el re-pegado (BRIEF + editando): ahí `guardarBrief`
  // re-escribe `briefJson` SIN transición — el bloque EVALUADA→BRIEF de la
  // action queda muerto porque el stage ya es BRIEF. La captura inicial en
  // EVALUADA NO se autoguarda a propósito: ese primer guardado ES la transición
  // deliberada de stage, y la cubre la guardia de salida (no el autosave).
  // Ownership intacto: reusa la misma action (assignedToId server-side).
  const autosave = useAutosave<BriefFormState>({
    value: form,
    enabled: stage === 'BRIEF' && editando && briefValido,
    save: async (estado) => {
      const parsed = BriefInputSchema.safeParse(aPayloadBrief(estado))
      if (!parsed.success) return fail('Borrador incompleto')
      return guardarBrief(leadId, parsed.data)
    },
  })

  // Avisar ante cambios sin guardar siempre que el form esté visible — incluida
  // la captura inicial en EVALUADA, que el autosave no cubre.
  useUnsavedGuard(formVisible && autosave.isDirty)

  const set = <Campo extends keyof BriefFormState>(campo: Campo, valor: string) => {
    setForm((actual) => ({ ...actual, [campo]: valor }))
  }

  const guardar = () => {
    setServerError(null)
    const parsed = BriefInputSchema.safeParse(aPayloadBrief(form))
    if (!parsed.success) {
      setErrors(erroresPorCampo<keyof FormErrors>(parsed.error))
      return
    }
    setErrors({})
    run(() => guardarBrief(leadId, parsed.data), {
      onError: setServerError,
      onSuccess: () => {
        autosave.markSaved()
        setEditando(false)
        setSanityOk(false)
      },
      successToast: 'Brief guardado — dale una leída antes de seguir.',
    })
  }

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

        <Field
          label={GUIA_BRIEF.campos.pegadoGem.label}
          required
          error={errors.pegadoGem}
          hint={GUIA_BRIEF.campos.pegadoGem.hint}
        >
          <TextArea
            value={form.pegadoGem}
            onChange={(event) => set('pegadoGem', event.target.value)}
            invalid={Boolean(errors.pegadoGem)}
            rows={8}
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field
            label={GUIA_BRIEF.campos.titulo.label}
            required
            error={errors.titulo}
            hint={GUIA_BRIEF.campos.titulo.hint}
          >
            <Input
              value={form.titulo}
              onChange={(event) => set('titulo', event.target.value)}
              invalid={Boolean(errors.titulo)}
            />
          </Field>

          <Field label={GUIA_BRIEF.campos.cta.label} hint={GUIA_BRIEF.campos.cta.hint}>
            <Input value={form.cta} onChange={(event) => set('cta', event.target.value)} />
          </Field>
        </div>

        <Field
          label={GUIA_BRIEF.campos.seccionesTexto.label}
          required
          error={errors.secciones}
          hint={GUIA_BRIEF.campos.seccionesTexto.hint}
        >
          <TextArea
            value={form.seccionesTexto}
            onChange={(event) => set('seccionesTexto', event.target.value)}
            invalid={Boolean(errors.secciones)}
            rows={5}
          />
        </Field>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label={GUIA_BRIEF.campos.concepto.label} hint={GUIA_BRIEF.campos.concepto.hint}>
            <TextArea
              value={form.concepto}
              onChange={(event) => set('concepto', event.target.value)}
              rows={3}
            />
          </Field>

          <Field label={GUIA_BRIEF.campos.notasMarca.label} hint={GUIA_BRIEF.campos.notasMarca.hint}>
            <TextArea
              value={form.notasMarca}
              onChange={(event) => set('notasMarca', event.target.value)}
              rows={3}
            />
          </Field>
        </div>

        {serverError && <p className="text-xs text-red-400">{serverError}</p>}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <Button onClick={guardar} loading={isPending}>
            Guardar brief
          </Button>
          {editando && (
            <Button variant="ghost" onClick={() => setEditando(false)} disabled={isPending}>
              Cancelar
            </Button>
          )}
          <AutosaveStatus phase={autosave.phase} isDirty={autosave.isDirty} busy={isPending} />
        </div>
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

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <p className="text-sm font-semibold text-zinc-200">{brief.titulo}</p>
          {brief.concepto && <p className="mt-1 text-xs text-zinc-500">{brief.concepto}</p>}
          {brief.secciones.length > 0 && (
            <p className="mt-2 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">Secciones:</span>{' '}
              {brief.secciones.join(' · ')}
            </p>
          )}
          {brief.cta && (
            <p className="mt-1 text-xs text-zinc-500">
              <span className="font-semibold text-zinc-400">CTA:</span> {brief.cta}
            </p>
          )}
          {brief.pegadoGem && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-zinc-500 hover:text-zinc-300">
                Ver respuesta completa del Gem
              </summary>
              <pre className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-zinc-500">
                {brief.pegadoGem}
              </pre>
            </details>
          )}
        </div>

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
