'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { Badge, Button, Card, Field, Modal, Select, TextArea } from '@/components/ui'
import type { Evaluacion } from '@/lib/leados/contracts'
import { VEREDICTO_VALUES } from '@/lib/leados/contracts'
import { gateBriefAbierto } from '@/lib/leados/flow'
import { GUIA_EVALUACION } from '@/lib/leados/guidance-content'
import { erroresPorCampo, useStepAction } from '@/lib/use-step-action'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { registrarEvaluacion } from '@/app/(protected)/setter/_actions/dossier.actions'
import { EvaluacionInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { cn } from '@/lib/utils'

/**
 * El REGISTRO de la evaluación (5.1, patrón 4.2): transcripción score +
 * veredicto + razonamiento con su gate triple (Zod), el descarte encadenado
 * por score 1–2 (modal + motivo) y la guardia de salida — extraído SIN cambio
 * de comportamiento del `EvaluacionStep` para que el wizard y el manual (M3)
 * sean dos presentaciones del MISMO camino de escritura: misma action
 * (`registrarEvaluacion`, ownership y stage=FICHA adentro), mismo schema
 * (`EvaluacionInputSchema`), misma guardia (`useUnsavedGuard`; A-24: la
 * evaluación es formulario de una sola pasada, SIN autosave a propósito — no
 * hay borrador que guardar a medias). El chrome (Card/intro/ToolGuide/criterios
 * en el wizard; layout-tipo en el manual) vive afuera.
 *
 * Los TEXTOS del veredicto son parámetro de presentación: el default
 * (`VEREDICTO_LABELS`) ya usa lenguaje de prioridad post-3.1 (el veredicto
 * CALIENTE solo SUGIERE prioridad a Franco, no marca el caliente operativo —
 * ese es campo de Franco). Los VALORES que viajan a la action no cambian
 * nunca (`VEREDICTO_VALUES`, contrato del dossier).
 */

/** Default de presentación (post-3.1, vocabulario canónico) — red de seguridad si algo renderiza sin `textos`. */
export const VEREDICTO_LABELS: Record<Evaluacion['veredicto'], string> = {
  DESCARTAR: 'Descartar',
  AVANZAR: 'Avanzar',
  CALIENTE: 'Avanzar con prioridad',
} as const

/** Textos de presentación del registro — la presentación elige, el motor no. */
export type EvaluacionTextos = {
  scoreHint: string
  veredictoHint: string
  veredictoLabels: Record<Evaluacion['veredicto'], string>
}

const TEXTOS_WIZARD: EvaluacionTextos = {
  scoreHint: GUIA_EVALUACION.campos.score.hint,
  veredictoHint: GUIA_EVALUACION.campos.veredicto.hint,
  veredictoLabels: VEREDICTO_LABELS,
}

type FormErrors = Partial<Record<'score' | 'veredicto' | 'razonamiento' | 'motivoDescarte', string>>

type EvaluacionFormProps = {
  leadId: string
  leadStatus: LeadStatus
  /** admin-1b: campo persistido que marca Franco — abre el gate del brief. */
  caliente: boolean
  textos?: EvaluacionTextos
}

/**
 * Formulario vivo de transcripción. Solo se monta en el tramo editable real
 * (sin evaluación registrada y con la ficha en señal mínima): en el wizard lo
 * garantizan los early-return del step; en el manual, la guardia del server
 * (m3 no habilitada sin señal) + el branch por `evaluacion` de `M3Registro`.
 * Por eso la guardia de salida corre con cualquier campo tocado, sin espejar
 * condiciones de visibilidad acá adentro.
 */
export function EvaluacionForm({
  leadId,
  leadStatus,
  caliente,
  textos = TEXTOS_WIZARD,
}: EvaluacionFormProps) {
  const [score, setScore] = useState<number | null>(null)
  const [veredicto, setVeredicto] = useState<string>('')
  const [razonamiento, setRazonamiento] = useState('')
  const [motivoDescarte, setMotivoDescarte] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const { isPending, run } = useStepAction()

  // A-24: a diferencia de Ficha/Brief (autosave), la Evaluación es un
  // formulario de una sola pasada sin borrador — cerrar la pestaña a mitad
  // del razonamiento lo pierde entero.
  const hayCambiosSinGuardar =
    score !== null || veredicto !== '' || razonamiento.trim() !== '' || motivoDescarte.trim() !== ''
  useUnsavedGuard(hayCambiosSinGuardar)

  const enviar = (motivo?: string) => {
    setServerError(null)
    const payload = {
      score: score ?? Number.NaN,
      veredicto,
      razonamiento,
      motivoDescarte: motivo ?? '',
    }
    const parsed = EvaluacionInputSchema.safeParse(payload)
    if (!parsed.success) {
      const nuevos = erroresPorCampo<keyof FormErrors>(parsed.error)
      setErrors(nuevos)
      // Si lo único que falta es el motivo del descarte, lo pide el modal
      if (nuevos.motivoDescarte && !nuevos.score && !nuevos.veredicto && !nuevos.razonamiento) {
        setConfirmOpen(true)
      }
      return
    }

    setErrors({})
    run(() => registrarEvaluacion(leadId, parsed.data), {
      onError: setServerError,
      onSuccess: () => setConfirmOpen(false),
      successToast: (data) =>
        data.descartado
          ? 'Lead descartado. Bien filtrado: a otra cosa.'
          : data.gateAbierto
            ? 'Evaluación registrada — el brief quedó habilitado.'
            : 'Evaluación registrada. El brief arranca cuando el negocio responda.',
    })
  }

  const intentarEnviar = () => {
    if (score !== null && score <= 2) {
      // Score 1–2 descarta sí o sí: primero validar los campos base, después
      // pedir confirmación + motivo en el modal (el motivo se chequea ahí).
      const base = EvaluacionInputSchema.safeParse({
        score,
        veredicto,
        razonamiento,
        motivoDescarte: 'pendiente',
      })
      if (!base.success) {
        setErrors(erroresPorCampo<keyof FormErrors>(base.error))
        return
      }
      setErrors({})
      setConfirmOpen(true)
      return
    }
    enviar()
  }

  const esDescarte = score !== null && score <= 2

  return (
    <div className="space-y-5">
      <Field
        label={GUIA_EVALUACION.campos.score.label}
        required
        error={errors.score}
        hint={textos.scoreHint}
      >
        <div role="radiogroup" aria-label="Score de la evaluación" className="flex gap-2">
          {[1, 2, 3, 4, 5].map((valor) => (
            <button
              key={valor}
              type="button"
              role="radio"
              aria-checked={score === valor}
              onClick={() => setScore(valor)}
              className={cn(
                'h-11 w-11 rounded-xl border text-sm font-semibold transition-colors',
                score === valor
                  ? valor <= 2
                    ? 'border-zinc-400 bg-zinc-300 text-zinc-950'
                    : valor === 3
                      ? 'border-cyan-400 bg-cyan-400 text-zinc-950'
                      : 'border-amber-400 bg-amber-400 text-zinc-950'
                  : 'border-white/10 bg-white/[0.02] text-zinc-400 hover:bg-white/[0.06]',
              )}
            >
              {valor}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label={GUIA_EVALUACION.campos.veredicto.label}
        required
        error={errors.veredicto}
        hint={textos.veredictoHint}
      >
        <Select
          value={veredicto}
          onChange={(event) => setVeredicto(event.target.value)}
          invalid={Boolean(errors.veredicto)}
          aria-label="Veredicto del Evaluador"
          options={[
            { value: '', label: 'Elegí el veredicto que dio el Evaluador' },
            ...VEREDICTO_VALUES.map((valor) => ({
              value: valor,
              label: textos.veredictoLabels[valor],
            })),
          ]}
        />
      </Field>

      <Field
        label={GUIA_EVALUACION.campos.razonamiento.label}
        required
        error={errors.razonamiento}
        hint={GUIA_EVALUACION.campos.razonamiento.hint}
      >
        <TextArea
          value={razonamiento}
          onChange={(event) => setRazonamiento(event.target.value)}
          invalid={Boolean(errors.razonamiento)}
          rows={5}
        />
      </Field>

      {esDescarte && (
        <div className="rounded-xl border border-zinc-400/20 bg-zinc-500/[0.06] p-3">
          <p className="text-xs font-semibold text-zinc-300">{GUIA_EVALUACION.gate.titulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">
            <LineaRicaText linea={GUIA_EVALUACION.gate.detalle} />
          </p>
        </div>
      )}

      {serverError && (
        <p role="alert" className="text-xs text-red-400">
          {serverError}
        </p>
      )}

      <Button onClick={intentarEnviar} loading={isPending && !confirmOpen}>
        {esDescarte ? 'Registrar evaluación y descartar' : 'Registrar evaluación'}
      </Button>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Descartar este lead"
        description="Score 1–2 descarta el lead en el mismo paso — vos no elegís, y está bien que sea así."
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={() => enviar(motivoDescarte)} loading={isPending}>
              Registrar y descartar
            </Button>
          </>
        }
      >
        <Field
          label="Motivo del descarte"
          required
          error={errors.motivoDescarte}
          hint="Una línea honesta alcanza. Ej: 'negocio inactivo hace meses, sin dolor visible'."
        >
          <TextArea
            value={motivoDescarte}
            onChange={(event) => setMotivoDescarte(event.target.value)}
            invalid={Boolean(errors.motivoDescarte)}
            rows={3}
          />
        </Field>
        <p className="mt-3 text-xs leading-relaxed text-emerald-300/80">
          El descarte honesto es trabajo bien hecho: te ahorrás horas de demo para un negocio que
          no iba a cerrar.
        </p>
      </Modal>

      {/* Nota para score 3 con gate cerrado: se muestra tras registrar (paso 3).
          admin-1b: el gate ya no mira el score sino el campo caliente (si Franco
          lo marcó, el brief está abierto y esta nota no aplica). */}
      {score === 3 && !gateBriefAbierto(leadStatus, caliente) && (
        <p className="text-[11px] leading-relaxed text-zinc-600">
          Ojo: con score 3 este lead avanza, pero el brief recién se habilita cuando el negocio
          responda el primer contacto.
        </p>
      )}
    </div>
  )
}

/**
 * Vista de la evaluación ya registrada (badges + razonamiento + cierre del
 * descarte) — la MISMA pieza para el wizard (defaults históricos) y para M3
 * (título propio + labels de prioridad). Solo lectura: la evaluación no se
 * re-registra jamás (stage=FICHA es condición de la action).
 */
export function EvaluacionResumen({
  evaluacion,
  descartado,
  titulo = GUIA_EVALUACION.titulo,
  veredictoLabels = VEREDICTO_LABELS,
}: {
  evaluacion: Evaluacion
  descartado: boolean
  titulo?: string
  veredictoLabels?: Record<Evaluacion['veredicto'], string>
}) {
  return (
    <Card padding="lg" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-100">{titulo}</h2>
        <div className="flex items-center gap-2">
          <Badge tone={evaluacion.score >= 4 ? 'amber' : evaluacion.score === 3 ? 'blue' : 'zinc'} variant="soft" size="md">
            Score {evaluacion.score}/5
          </Badge>
          <Badge
            tone={evaluacion.veredicto === 'CALIENTE' ? 'violet' : evaluacion.veredicto === 'AVANZAR' ? 'emerald' : 'zinc'}
            variant="soft"
            size="md"
            icon={evaluacion.veredicto === 'CALIENTE' ? <Star size={11} strokeWidth={1.5} /> : undefined}
          >
            {veredictoLabels[evaluacion.veredicto]}
          </Badge>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Razonamiento del Evaluador
        </p>
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-400">
          {evaluacion.razonamiento}
        </p>
      </div>

      {descartado && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <p className="text-sm font-medium text-zinc-300">Lead descartado</p>
          {evaluacion.motivoDescarte && (
            <p className="mt-1 text-xs text-zinc-500">Motivo: {evaluacion.motivoDescarte}</p>
          )}
          <p className="mt-2 text-xs leading-relaxed text-emerald-300/80">
            El descarte honesto es trabajo bien hecho: te ahorraste horas de demo para un
            negocio que no iba a cerrar. Seguí con el próximo.
          </p>
        </div>
      )}
    </Card>
  )
}
