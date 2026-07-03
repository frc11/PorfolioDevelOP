'use client'

import { GraduationCap, Lock } from 'lucide-react'
import type { LeadStatus } from '@prisma/client'
import { Card } from '@/components/ui'
import type { Evaluacion, Ficha } from '@/lib/leados/contracts'
import { fichaFaltantes } from '@/lib/leados/flow'
import { GUIA_EVALUACION } from '@/lib/leados/guidance-content'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { EvaluacionForm, EvaluacionResumen } from './evaluacion-form'
import { StepLink } from './step-nav'

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

/**
 * Presentación del wizard para la evaluación (5.1, patrón 4.2): chrome (Card +
 * encabezado + ToolGuide + criterios + TeachPanel) alrededor del registro
 * compartido (`EvaluacionForm`, donde viven el gate triple, el descarte
 * encadenado y la guardia), y las dos ramas de solo-lectura: el resumen
 * registrado (`EvaluacionResumen`, defaults históricos) y el candado con los
 * faltantes de la ficha. El manual (M3) monta las MISMAS piezas compartidas
 * con su propio chrome y labels de prioridad — dos presentaciones, un solo
 * camino de escritura, hasta el corte del Bloque 5.
 */
export function EvaluacionStep({
  leadId,
  leadStatus,
  caliente,
  ficha,
  evaluacion,
  habilitado,
  descartado,
}: EvaluacionStepProps) {
  const faltantesFicha = fichaFaltantes(ficha)

  // ── Resumen: evaluación ya registrada ──────────────────────────────────────
  if (evaluacion) {
    return <EvaluacionResumen evaluacion={evaluacion} descartado={descartado} />
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

  // ── Transcripción: chrome del wizard + registro compartido ─────────────────
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

      <EvaluacionForm leadId={leadId} leadStatus={leadStatus} caliente={caliente} />
    </Card>
  )
}
