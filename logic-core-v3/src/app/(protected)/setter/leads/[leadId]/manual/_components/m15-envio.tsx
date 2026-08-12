import Link from 'next/link'
import { ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react'
import type { DossierStage, LeadStatus } from '@prisma/client'
import type { CopyBlockLead } from '@/lib/leados/copy-blocks'
import { formatFechaCorta, gateEnvioDemo, leadRespondio } from '@/lib/leados/flow'
import { GUIA_ENVIO } from '@/lib/leados/guidance-content'
import { rutaManual } from '@/lib/leados/manual'
import { TEXTO_TURNO, turnoDelLead } from '@/lib/leados/turno'
import { LineaRicaText } from '@/app/(protected)/setter/_components/teach-panel'
import { EnvioForm } from './envio-form'

/**
 * M15 — «Mandá el link al negocio» (5.4, tramo Envío). PRESENTACIÓN de un gate que
 * ya existe: el módulo lee `gateEnvioDemo` (flow.ts) para decidir qué mostrar, y la
 * action existente (`enviarDemoAprobada`) re-valida el gate completo server-side
 * (APROBADA ∧ finalUrl ∧ (respondió ∨ caliente)). Nada de esto se toca acá —
 * `outreach.actions`, `gateEnvioDemo` y su invariante quedan idénticos.
 *   - contexto: el link permanente aprobado por Franco (`finalUrl`), a la vista;
 *   - munición: el porqué del momento (`GUIA_ENVIO.intro`) — el link sale acá y
 *     sólo acá, nunca en el opener ni antes de la aprobación;
 *   - registro: los tres estados del gate — enviada / listo para enviar / a la
 *     espera con el motivo real (deshabilitado-con-motivo).
 */

/** Contexto: la demo aprobada por Franco, con su link permanente a la vista. */
export function M15Contexto({ finalUrl }: { finalUrl: string | null }) {
  if (!finalUrl) {
    return (
      <p className="text-xs leading-relaxed text-zinc-500">
        La demo tiene que estar aprobada por Franco (con su link permanente) antes de mandarla al
        negocio.
      </p>
    )
  }
  return (
    <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/[0.05] p-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-emerald-300/80">
        La demo aprobada
      </p>
      <a
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 inline-flex items-center gap-1.5 break-all text-sm font-medium text-emerald-300 hover:text-emerald-200"
      >
        <ExternalLink size={13} strokeWidth={1.5} className="shrink-0" />
        {finalUrl}
      </a>
      <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">
        Es el link permanente que registró Franco al aprobar — ese es el que va al negocio.
      </p>
    </div>
  )
}

/** Munición: el porqué del momento — el link sale acá y sólo acá. */
export function M15Municion() {
  return (
    <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
      <LineaRicaText linea={GUIA_ENVIO.intro} />
    </p>
  )
}

/** Registro: los tres estados del gate de envío. El gate lo decide
 * `gateEnvioDemo` (server-side, misma fuente que la action que re-valida). */
export function M15Registro({
  leadId,
  lead,
  stage,
  status,
  caliente,
  finalUrl,
  demoEnviadaAt,
}: {
  leadId: string
  lead: CopyBlockLead
  stage: DossierStage | null
  status: LeadStatus
  caliente: boolean
  finalUrl: string | null
  demoEnviadaAt: string | null
}) {
  // ── Enviada: el link ya salió ───────────────────────────────────────────────
  if (demoEnviadaAt) {
    return (
      <p className="flex items-start gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/[0.06] p-3 text-xs leading-relaxed text-emerald-300">
        <CheckCircle2 size={14} strokeWidth={1.5} className="mt-0.5 shrink-0" />
        <span>
          Demo enviada{demoEnviadaAt ? ` el ${formatFechaCorta(demoEnviadaAt)}` : ''}.{' '}
          <LineaRicaText linea={GUIA_ENVIO.enviada} />
        </span>
      </p>
    )
  }

  const respondio = leadRespondio(status)
  const puedeEnviar = gateEnvioDemo({ status, caliente, stage, finalUrl })

  // ── Gate abierto: listo para enviar (la action re-valida igual) ─────────────
  if (puedeEnviar && finalUrl) {
    return <EnvioForm leadId={leadId} lead={lead} finalUrl={finalUrl} respondio={respondio} />
  }

  // ── Gate cerrado: nombra el TURNO y después la condición que falta ──────────
  // (mismo criterio que `gateEnvioDemo`; la derivación no aterriza acá con el gate
  // cerrado — esto es la presentación honesta del deshabilitado-con-motivo).
  // El turno sale de `turno.ts`; `accionPendiente: false` no es decisión de este
  // módulo: con el gate cerrado no hay envío que el setter pueda hacer.
  const turno = turnoDelLead({ status, stage, finalUrl, accionPendiente: false })
  // Cuatro «todavía no», no tres: aprobada CON link y sin respuesta es del
  // negocio; aprobada SIN link es de Franco, y decía lo mismo que la anterior.
  const motivo =
    stage === 'APROBADA'
      ? finalUrl
        ? GUIA_ENVIO.espera.aprobadaSinEnganche
        : GUIA_ENVIO.espera.aprobadaSinLink
      : respondio
        ? GUIA_ENVIO.espera.engancheSinAprobar
        : GUIA_ENVIO.espera.niEngancheNiAprobada
  return (
    <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs font-semibold text-zinc-300">{TEXTO_TURNO[turno].titulo}</p>
      <p className="text-xs leading-relaxed text-zinc-400">
        <LineaRicaText linea={motivo} />
      </p>
      <Link
        href={rutaManual(leadId, 'm5')}
        className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-zinc-100"
      >
        Seguí la cadencia — registrá un toque
        <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
      </Link>
    </div>
  )
}
