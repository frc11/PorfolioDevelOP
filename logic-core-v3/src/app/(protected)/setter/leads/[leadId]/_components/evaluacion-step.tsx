'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Flame, GraduationCap, Lock } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { Badge, Button, Card, Field, Modal, Select, TextArea } from '@/components/ui'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { fichaFaltantes, gateBriefAbierto } from '@/lib/leados/flow'
import { GUIA_EVALUACION } from '@/lib/leados/guidance-content'
import { useUnsavedGuard } from '@/lib/use-unsaved-guard'
import { registrarEvaluacion } from '@/app/(protected)/setter/_actions/dossier.actions'
import { EvaluacionInputSchema } from '@/app/(protected)/setter/_actions/dossier.schemas'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { cn } from '@/lib/utils'
import { StepLink } from './step-nav'

const VEREDICTO_LABELS = {
  DESCARTAR: 'Descartar',
  AVANZAR: 'Avanzar',
  CALIENTE: 'Caliente',
} as const

type EvaluacionStepProps = {
  leadId: string
  leadStatus: LeadStatus
  /** admin-1b: campo persistido que marca Franco — abre el gate del brief. */
  caliente: boolean
  ficha: Ficha | null
  evaluacion: Evaluacion | null
  /** true solo mientras el dossier está en FICHA (la evaluación no se re-registra). */
  habilitado: boolean
  descartado: boolean
}

type FormErrors = Partial<Record<'score' | 'veredicto' | 'razonamiento' | 'motivoDescarte', string>>

export function EvaluacionStep({
  leadId,
  leadStatus,
  caliente,
  ficha,
  evaluacion,
  habilitado,
  descartado,
}: EvaluacionStepProps) {
  const router = useRouter()
  const [score, setScore] = useState<number | null>(evaluacion?.score ?? null)
  const [veredicto, setVeredicto] = useState<string>(evaluacion?.veredicto ?? '')
  const [razonamiento, setRazonamiento] = useState(evaluacion?.razonamiento ?? '')
  const [motivoDescarte, setMotivoDescarte] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // A-24: a diferencia de Ficha/Brief (autosave), la Evaluación es un
  // formulario de una sola pasada sin borrador — cerrar la pestaña a mitad
  // del razonamiento lo pierde entero. `formVisible` espeja las mismas dos
  // condiciones que gobiernan los early-return de abajo (ya evaluado / ficha
  // sin señal mínima): la guardia solo debe correr en el tramo editable real.
  const faltantesFicha = fichaFaltantes(ficha)
  const formVisible = !evaluacion && habilitado && faltantesFicha.length === 0
  const hayCambiosSinGuardar =
    formVisible &&
    (score !== null || veredicto !== '' || razonamiento.trim() !== '' || motivoDescarte.trim() !== '')
  useUnsavedGuard(hayCambiosSinGuardar)

  // ── Resumen: evaluación ya registrada ──────────────────────────────────────
  if (evaluacion) {
    return (
      <Card padding="lg" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-100">{GUIA_EVALUACION.titulo}</h2>
          <div className="flex items-center gap-2">
            <Badge tone={evaluacion.score >= 4 ? 'amber' : evaluacion.score === 3 ? 'blue' : 'zinc'} variant="soft" size="md">
              Score {evaluacion.score}/5
            </Badge>
            <Badge
              tone={evaluacion.veredicto === 'CALIENTE' ? 'amber' : evaluacion.veredicto === 'AVANZAR' ? 'emerald' : 'zinc'}
              variant="soft"
              size="md"
              icon={evaluacion.veredicto === 'CALIENTE' ? <Flame size={11} strokeWidth={1.5} /> : undefined}
            >
              {VEREDICTO_LABELS[evaluacion.veredicto]}
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

  // ── Bloqueado: la ficha todavía no tiene señal mínima ──────────────────────
  if (!habilitado || faltantesFicha.length > 0) {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">{GUIA_EVALUACION.titulo}</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se habilita cuando la ficha tiene la señal mínima y la guardás.
        </p>
        {/* El detalle concreto sube ACÁ (antes era un puntero ciego «mirá el paso 1»):
            las mismas líneas que valida la ficha, con un salto directo para completarlas. */}
        {faltantesFicha.length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-400/20 bg-amber-500/[0.06] p-3">
            <p className="text-xs font-semibold text-amber-300">Falta señal en la ficha:</p>
            <ul className="mt-1.5 space-y-1">
              {faltantesFicha.map((faltante) => (
                <li key={faltante} className="text-xs leading-relaxed text-amber-200/80">
                  · {faltante}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-3">
          <StepLink to="ficha">Ir a la ficha (Paso 1)</StepLink>
        </div>
      </Card>
    )
  }

  // ── Formulario de transcripción ────────────────────────────────────────────
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
      const nuevos: FormErrors = {}
      for (const issue of parsed.error.issues) {
        const campo = issue.path[0] as keyof FormErrors | undefined
        if (campo && !nuevos[campo]) nuevos[campo] = issue.message
      }
      setErrors(nuevos)
      // Si lo único que falta es el motivo del descarte, lo pide el modal
      if (nuevos.motivoDescarte && !nuevos.score && !nuevos.veredicto && !nuevos.razonamiento) {
        setConfirmOpen(true)
      }
      return
    }

    setErrors({})
    startTransition(async () => {
      const result = await registrarEvaluacion(leadId, parsed.data)
      if (!result.success) {
        setServerError(result.error)
        toast.error(result.error)
        return
      }
      setConfirmOpen(false)
      if (result.data.descartado) {
        toast.success('Lead descartado. Bien filtrado: a otra cosa.')
      } else if (result.data.gateAbierto) {
        toast.success('Evaluación registrada — el brief quedó habilitado.')
      } else {
        toast.success('Evaluación registrada. El brief arranca cuando el negocio responda.')
      }
      router.refresh()
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
        const nuevos: FormErrors = {}
        for (const issue of base.error.issues) {
          const campo = issue.path[0] as keyof FormErrors | undefined
          if (campo && !nuevos[campo]) nuevos[campo] = issue.message
        }
        setErrors(nuevos)
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
    <Card padding="lg" className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">{GUIA_EVALUACION.titulo}</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
          <LineaRicaText linea={GUIA_EVALUACION.intro} />
        </p>
      </div>

      <ToolGuide id="evaluador" />

      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
        <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          <GraduationCap size={12} strokeWidth={1.5} />
          Qué mira el Evaluador (y por qué importa)
        </p>
        <ul className="mt-2 grid gap-1 sm:grid-cols-2">
          {GUIA_EVALUACION.criterios.map((criterio) => (
            <li key={criterio.nombre} className="text-[11px] leading-relaxed text-zinc-500">
              <span className="font-semibold text-zinc-400">{criterio.nombre}:</span>{' '}
              {criterio.porQue}
            </li>
          ))}
        </ul>
      </div>

      <TeachPanel id="evaluacion" />

      <Field
        label={GUIA_EVALUACION.campos.score.label}
        required
        error={errors.score}
        hint={GUIA_EVALUACION.campos.score.hint}
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
        hint={GUIA_EVALUACION.campos.veredicto.hint}
      >
        <Select
          value={veredicto}
          onChange={(event) => setVeredicto(event.target.value)}
          invalid={Boolean(errors.veredicto)}
          aria-label="Veredicto del Evaluador"
          options={[
            { value: '', label: 'Elegí el veredicto que dio el Evaluador' },
            { value: 'DESCARTAR', label: 'Descartar' },
            { value: 'AVANZAR', label: 'Avanzar' },
            { value: 'CALIENTE', label: 'Caliente' },
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

      {serverError && <p className="text-xs text-red-400">{serverError}</p>}

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
    </Card>
  )
}
