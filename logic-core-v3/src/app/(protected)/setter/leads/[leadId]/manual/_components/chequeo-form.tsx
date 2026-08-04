'use client'

import { useState } from 'react'
import { CheckCircle2, Eye, Save, SendHorizonal, ShieldCheck, Wrench } from 'lucide-react'
import { Button, Callout, Toggle } from '@/components/ui'
import type { Brief, SelfCheck } from '@/lib/leados/contracts'
import { HARD_CHECKS, SOFT_CHECKS } from '@/lib/leados/flow'
import { GUIA_SELF_CHECK } from '@/lib/leados/guidance-content'
import { promptParaHardCheck } from '@/lib/leados/prompts-disenio'
import { useStepAction } from '@/lib/use-step-action'
import { enviarARevision, guardarSelfCheck } from '@/app/(protected)/setter/_actions/dossier.actions'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'

/**
 * M14 — el chequeo final (5.4, tramo Chequeo). Presentación del manual sobre el
 * MISMO gate de Construcción del wizard: mismas listas (`HARD_CHECKS` /
 * `SOFT_CHECKS`), mismo puente check-fallado→prompt (`promptParaHardCheck`,
 * parcial y editable), y las MISMAS actions (`guardarSelfCheck`,
 * `enviarARevision` — que re-valida `selfCheckAprobado` server-side; la UI nunca
 * es el gate). El chrome (cómo chequear, el borrador a la vista, el brief) vive en
 * el módulo `m14-chequeo`; acá solo el núcleo: la grilla de dos niveles y el envío
 * a revisión. Los 6 obligatorios en verde habilitan el botón — es EL gate de
 * Construcción; las fases de Construcción siguen sin gatear.
 */

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

export function ChequeoForm({
  leadId,
  selfCheck,
  brief,
}: {
  leadId: string
  selfCheck: SelfCheck | null
  brief: Brief | null
}) {
  const [duros, setDuros] = useState<Record<string, boolean>>(() => durosIniciales(selfCheck))
  const [softIds, setSoftIds] = useState<string[]>(() => softIniciales(selfCheck))
  // 4.1: el rebote del server queda FIJO junto al form. El toast se va solo y
  // el setter se quedaba sin saber por qué no salió el envío.
  const [serverError, setServerError] = useState<string | null>(null)
  const accion = useStepAction()

  const todosDurosOk = HARD_CHECKS.every((check) => duros[check.id])
  const faltantesDuros = HARD_CHECKS.filter((check) => !duros[check.id]).length
  const payload = () => ({ duros, softIds })

  const guardar = () => {
    setServerError(null)
    accion.run(() => guardarSelfCheck(leadId, payload()), {
      onError: setServerError,
      successToast: (data) =>
        data.aprobado
          ? 'Chequeo aprobado — podés enviar a revisión.'
          : 'Chequeo guardado. Quedan puntos en rojo: arreglalos antes de enviar.',
    })
  }

  const enviar = () => {
    setServerError(null)
    // Guarda el estado actual primero (flags frescos) y después envía: el server
    // re-valida los hard-blocks contra la DB, no contra la UI. Si el guardado
    // rebota, su fallo ES el fallo del envío (mismo camino de error).
    accion.run(
      async () => {
        const guardado = await guardarSelfCheck(leadId, payload())
        if (!guardado.success) return guardado
        return enviarARevision(leadId)
      },
      {
        onError: setServerError,
        successToast: 'Demo enviada a revisión — Franco la ve en su cola.',
      },
    )
  }

  return (
    <div className="space-y-5">
      <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
        <LineaRicaText linea={GUIA_SELF_CHECK.intro} />
      </p>

      <div className="space-y-2 rounded-2xl border border-white/[0.07] bg-white/[0.01] p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-300">
          <ShieldCheck size={13} strokeWidth={1.5} />
          Obligatorios — bloquean el envío
        </p>
        {HARD_CHECKS.map((check) => {
          const ok = duros[check.id]
          // Puente 4·B: el hard-block en rojo que se arregla refinando la demo
          // ofrece, además del arreglo humano, su prompt copiable a Claude Design.
          // Mapeo parcial y editable (`prompts-disenio.ts`); sin prompt mapeado →
          // solo el arreglo. NO toca el gate: es un atajo, no un bypass (el botón
          // sigue disabled hasta 6/6 y el server re-valida igual).
          const promptArreglo = ok ? null : promptParaHardCheck(check.id)
          return (
            <div
              key={check.id}
              className={`rounded-xl border p-3.5 transition-colors ${
                ok
                  ? 'border-emerald-400/20 bg-emerald-500/[0.04]'
                  : 'border-white/[0.06] bg-white/[0.02]'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-200">{check.nombre}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-zinc-500">{check.comoVerificar}</p>
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
              {promptArreglo && (
                <div className="mt-3">
                  <CopyBlock
                    titulo={promptArreglo.titulo}
                    instruccion={promptArreglo.instruccion}
                    texto={promptArreglo.prompt}
                  />
                </div>
              )}
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
          <label key={soft.id} className="flex cursor-pointer items-center justify-between gap-3 py-1">
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
        // Gate proactivo: el botón queda disabled CON el motivo al lado (cuántos
        // faltan + el porqué), no un disabled mudo. El server re-valida igual.
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

      {serverError && (
        <p role="alert" className="text-xs leading-relaxed text-red-400">
          {serverError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          onClick={guardar}
          loading={accion.isPending}
          icon={<Save size={14} strokeWidth={1.5} />}
        >
          Guardar el chequeo
        </Button>
        <Button
          onClick={enviar}
          loading={accion.isPending}
          disabled={!todosDurosOk}
          icon={<SendHorizonal size={14} strokeWidth={1.5} />}
        >
          Enviar a revisión
        </Button>
      </div>
    </div>
  )
}
