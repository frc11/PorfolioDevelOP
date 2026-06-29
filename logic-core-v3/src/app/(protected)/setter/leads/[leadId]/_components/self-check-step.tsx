'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { CheckCircle2, Eye, Lock, Save, SendHorizonal, ShieldCheck, Wrench } from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Button, Callout, Card, Toggle } from '@/components/ui'
import type { Brief, SelfCheck } from '@/lib/leados/contracts'
import { HARD_CHECKS, SOFT_CHECKS } from '@/lib/leados/flow'
import { GUIA_SELF_CHECK } from '@/lib/leados/guidance-content'
import {
  enviarARevision,
  guardarSelfCheck,
} from '@/app/(protected)/setter/_actions/dossier.actions'
import { SelfCheckEjemplo } from '@/app/(protected)/setter/_components/ejemplo-ideal'
import { LineaRicaText, TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'

type SelfCheckStepProps = {
  leadId: string
  stage: DossierStage | null
  draftUrl: string | null
  selfCheck: SelfCheck | null
  brief: Brief | null
}

/** Estado inicial de los duros: lo guardado, mapeado por nombre vigente. */
function durosIniciales(selfCheck: SelfCheck | null): Record<string, boolean> {
  const duros: Record<string, boolean> = {}
  for (const check of HARD_CHECKS) {
    duros[check.id] =
      selfCheck?.itemsDuros.some((item) => item.nombre === check.nombre && item.ok) ?? false
  }
  return duros
}

function softIniciales(selfCheck: SelfCheck | null): string[] {
  if (!selfCheck) return []
  return SOFT_CHECKS.filter((soft) => selfCheck.softFlags.includes(soft.etiqueta)).map(
    (soft) => soft.id,
  )
}

export function SelfCheckStep({ leadId, stage, draftUrl, selfCheck, brief }: SelfCheckStepProps) {
  const router = useRouter()
  const [duros, setDuros] = useState<Record<string, boolean>>(() => durosIniciales(selfCheck))
  const [softIds, setSoftIds] = useState<string[]>(() => softIniciales(selfCheck))
  const [isPending, startTransition] = useTransition()

  const todosDurosOk = HARD_CHECKS.every((check) => duros[check.id])
  const faltantesDuros = HARD_CHECKS.filter((check) => !duros[check.id]).length
  const payload = () => ({ duros, softIds })

  const guardar = () => {
    startTransition(async () => {
      const result = await guardarSelfCheck(leadId, payload())
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(
        result.data.aprobado
          ? 'Self-check aprobado — podés enviar a revisión.'
          : 'Self-check guardado. Quedan puntos en rojo: arreglalos antes de enviar.',
      )
      router.refresh()
    })
  }

  const enviar = () => {
    startTransition(async () => {
      // Guarda el estado actual primero (soft-flags frescos) y después envía:
      // el server re-valida los hard-blocks contra la DB, no contra la UI.
      const guardado = await guardarSelfCheck(leadId, payload())
      if (!guardado.success) {
        toast.error(guardado.error)
        return
      }
      const result = await enviarARevision(leadId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Demo enviada a revisión — Franco la ve en su cola.')
      router.refresh()
    })
  }

  // ── Apagado: antes de construcción o sin draft publicado ───────────────────
  if (stage !== 'CONSTRUCCION' && stage !== 'EN_REVISION' && stage !== 'APROBADA') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">Self-check</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-600">
          Se habilita con la demo construida y el draft publicado.
        </p>
      </Card>
    )
  }

  // Gate proactivo (1/2): sin draft no hay demo que revisar → el paso se bloquea
  // con el motivo, no es un rebote mudo. El server re-valida igual en el envío.
  if (stage === 'CONSTRUCCION' && !draftUrl) {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-500" />
          <h2 className="text-base font-semibold text-zinc-300">Self-check</h2>
        </div>
        <p className="mt-2 max-w-xl text-xs leading-relaxed text-zinc-400">
          Publicá el draft primero (el paso de arriba): el self-check se hace mirando la demo
          publicada, no el export local. Apenas guardes el link, este paso se abre.
        </p>
      </Card>
    )
  }

  // ── EN_REVISION / APROBADA: resumen read-only de lo enviado ────────────────
  if (stage !== 'CONSTRUCCION') {
    return (
      <Card variant="subtle" padding="lg" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-zinc-300">Self-check</h2>
          <Badge tone="emerald" variant="soft">Enviado a revisión</Badge>
        </div>
        {selfCheck && (
          <p className="text-xs leading-relaxed text-zinc-500">
            {selfCheck.itemsDuros.filter((item) => item.ok).length} puntos obligatorios en verde
            {selfCheck.softFlags.length > 0
              ? ` · ${selfCheck.softFlags.length} flag(s) de diseño marcados para Franco`
              : ' · sin flags de diseño'}
            .
          </p>
        )}
      </Card>
    )
  }

  // ── CONSTRUCCION con draft: el gate de dos niveles ─────────────────────────
  return (
    <Card padding="lg" className="space-y-5">
      <div>
        <h2 className="text-base font-semibold text-zinc-100">Self-check</h2>
        <p className="mt-1 max-w-xl text-xs leading-relaxed text-zinc-500">
          <LineaRicaText linea={GUIA_SELF_CHECK.intro} />
        </p>
      </div>

      <TeachPanel id="selfCheck" />

      {/* Referencia: cómo queda un self-check terminado bien hecho, para comparar. */}
      <SelfCheckEjemplo />

      <div className="space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.01] p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          <ShieldCheck size={13} strokeWidth={1.5} />
          Obligatorios — bloquean el envío
        </p>
        {HARD_CHECKS.map((check) => {
          const ok = duros[check.id]
          return (
            <div
              key={check.id}
              className={`rounded-xl border p-3.5 transition-colors ${
                ok ? 'border-emerald-400/20 bg-emerald-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{check.nombre}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">
                    {check.comoVerificar}
                  </p>
                  {check.id === 'fielAlBrief' && brief && brief.secciones.length > 0 && (
                    <p className="mt-1 text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-400">El brief pedía:</span>{' '}
                      {brief.secciones.join(' · ')}
                      {brief.cta ? ` · CTA: ${brief.cta}` : ''}
                    </p>
                  )}
                  {!ok && (
                    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-rose-300/90">
                      <Wrench size={12} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                      {check.arreglo}
                    </p>
                  )}
                </div>
                <Toggle
                  checked={ok}
                  onChange={(checked) => setDuros((actual) => ({ ...actual, [check.id]: checked }))}
                  label={check.nombre}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="space-y-2 rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-200/80">
          <Eye size={13} strokeWidth={1.5} />
          Ojo de diseño — no bloquean, los ve Franco
        </p>
        <p className="text-xs leading-relaxed text-zinc-500">
          Marcá las que veas en la demo. Ser honesto acá juega a favor: Franco las revisa igual.
        </p>
        {SOFT_CHECKS.map((soft) => (
          <label
            key={soft.id}
            className="flex cursor-pointer items-center justify-between gap-3 py-1"
          >
            <span className="text-xs text-zinc-300">{soft.etiqueta}</span>
            <Toggle
              checked={softIds.includes(soft.id)}
              onChange={(checked) =>
                setSoftIds((actual) =>
                  checked ? [...actual, soft.id] : actual.filter((id) => id !== soft.id),
                )
              }
              label={soft.etiqueta}
            />
          </label>
        ))}
      </div>

      {todosDurosOk ? (
        <Callout tone="success" icon={CheckCircle2}>
          <span className="font-medium">
            Todos los obligatorios en verde — podés enviar a revisión.
          </span>
        </Callout>
      ) : (
        // Gate proactivo (2/2): el botón de envío queda disabled CON el motivo al
        // lado (cuántos faltan + el porqué), no un disabled mudo. El server
        // re-valida selfCheckAprobado en el envío.
        <Callout tone="neutral" title={GUIA_SELF_CHECK.gate.titulo}>
          <span>
            {faltantesDuros === 1
              ? 'Queda 1 obligatorio en rojo'
              : `Quedan ${faltantesDuros} obligatorios en rojo`}{' '}
            — el arreglo concreto está debajo de cada punto.{' '}
            <LineaRicaText linea={GUIA_SELF_CHECK.gate.detalle} />
          </span>
        </Callout>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={guardar}
          loading={isPending}
          icon={<Save size={14} strokeWidth={1.5} />}
        >
          Guardar self-check
        </Button>
        <Button
          onClick={enviar}
          loading={isPending}
          disabled={!todosDurosOk}
          icon={<SendHorizonal size={14} strokeWidth={1.5} />}
        >
          Enviar a revisión
        </Button>
      </div>
    </Card>
  )
}
