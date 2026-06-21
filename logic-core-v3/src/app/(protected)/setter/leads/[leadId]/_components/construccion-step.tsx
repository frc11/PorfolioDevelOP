'use client'

import { useSyncExternalStore, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlarmClock,
  ExternalLink,
  Hammer,
  Images,
  LifeBuoy,
  Lock,
  OctagonAlert,
  Save,
} from 'lucide-react'
import type { DossierStage } from '@prisma/client'
import { Badge, Button, Callout, Card } from '@/components/ui'
import type { Brief, Ficha, Rechazo } from '@/lib/leados/contracts'
import { buildConstruccionBlock, type CopyBlockLead } from '@/lib/leados/copy-blocks'
import { SHELL_CONSTRUCCION } from '@/lib/leados/flow'
import { formatEspera } from '@/lib/leados/revision'
import {
  iniciarConstruccion,
  reabrirConstruccion,
} from '@/app/(protected)/setter/_actions/dossier.actions'
import { CopyBlock } from '@/app/(protected)/setter/_components/copy-block'
import { TeachPanel } from '@/app/(protected)/setter/_components/teach-panel'
import { ToolGuide } from '@/app/(protected)/setter/_components/tool-guide'
import { EscalarModal } from './escalar-modal'

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
}

/** Badge fijo del paso: la secuencia del shell es provisoria por diseño. */
function BadgeProvisorio() {
  return (
    <Badge tone="amber" variant="outline">
      Guía preliminar — en validación
    </Badge>
  )
}

/**
 * "Ya montó" hidratación-safe vía `useSyncExternalStore` con snapshots estables
 * (true en cliente, false en server). Es la forma correcta de diferir un cálculo
 * dependiente del reloj del cliente SIN setState-dentro-de-effect (que dispara
 * cascading renders — regla `react-hooks/set-state-in-effect`). Server y primer
 * render de cliente coinciden en `false` (sin hydration mismatch); recién después
 * de hidratar pasa a `true` y se calcula el "hace X".
 */
const subscribeNoop = () => () => {}
function useHidratado(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  )
}

/**
 * Turnaround visible: el lead respondió y está esperando la demo. La condición
 * de diseño del tramo es resolverse en horas, no días. El "hace X" depende del
 * reloj del cliente → se difiere a post-hidratación con `useHidratado`.
 */
function UrgenciaBanner({ respondioDesde }: { respondioDesde: string | null }) {
  const hidratado = useHidratado()
  if (!respondioDesde) return null
  const espera = hidratado ? formatEspera(new Date(respondioDesde), new Date()) : null
  return (
    <Callout tone="warning" icon={AlarmClock}>
      <span className="font-medium">
        El negocio respondió y está esperando{espera ? ` (última movida ${espera})` : ''}. Este
        tramo se resuelve en horas, no días.
      </span>
    </Callout>
  )
}

/** Último rechazo completo como guía de retrabajo dentro del paso. */
function GuiaRetrabajo({ rechazo }: { rechazo: Rechazo }) {
  return (
    <Callout
      tone="danger"
      accent
      icon={OctagonAlert}
      title="Guía de retrabajo — lo que Franco pidió corregir"
    >
      <div className="space-y-1.5 text-zinc-300">
        <p>
          <span className="font-semibold text-rose-200">Qué:</span> {rechazo.motivo}
        </p>
        {rechazo.donde && (
          <p>
            <span className="font-semibold text-rose-200">Dónde:</span> {rechazo.donde}
          </p>
        )}
        {rechazo.arreglo && (
          <p className="whitespace-pre-wrap">
            <span className="font-semibold text-rose-200">Arreglo:</span> {rechazo.arreglo}
          </p>
        )}
      </div>
    </Callout>
  )
}

/**
 * B8A-II: los materiales reales del negocio, a mano en el paso donde se
 * construye (antes vivían sólo en el header del lead y en la ficha colapsada,
 * a un scroll largo). Los links abren el origen para bajar logo y fotos; las
 * reseñas y el tono se leen acá y además viajan en el bloque pegable.
 */
function MaterialesNegocio({ lead, ficha }: { lead: CopyBlockLead; ficha: Ficha | null }) {
  const assets = [
    { label: 'Instagram', href: lead.instagramUrl },
    { label: 'Google Maps', href: lead.googleMapsUrl },
    { label: 'Web actual', href: lead.currentWebUrl },
  ].filter((a): a is { label: string; href: string } => Boolean(a.href))

  if (assets.length === 0 && !ficha?.resenas && !ficha?.contenidoReal) return null

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-zinc-100">
        <Images size={14} strokeWidth={1.5} className="shrink-0 text-zinc-400" />
        Materiales reales del negocio — usalos, nada de placeholders
      </p>

      {assets.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] text-zinc-500">Bajá el logo y 3–5 fotos del feed de:</p>
          <div className="flex flex-wrap gap-2">
            {assets.map((asset) => (
              <a
                key={asset.label}
                href={asset.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.07] hover:text-white"
              >
                <ExternalLink size={11} strokeWidth={1.5} />
                {asset.label}
              </a>
            ))}
          </div>
        </div>
      )}

      {ficha?.resenas && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-400">Reseñas reales (prueba social)</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
            {ficha.resenas}
          </p>
        </div>
      )}

      {ficha?.contenidoReal && (
        <div className="space-y-1">
          <p className="text-[11px] font-semibold text-zinc-400">Contenido y tono</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-400">
            {ficha.contenidoReal}
          </p>
        </div>
      )}
    </div>
  )
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
}: ConstruccionStepProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const hidratado = useHidratado()

  const transicionar = (action: typeof iniciarConstruccion, mensajeOk: string) => {
    startTransition(async () => {
      const result = await action(leadId)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success(mensajeOk)
      router.refresh()
    })
  }

  // ── Antes del brief: paso apagado ──────────────────────────────────────────
  if (stage === null || stage === 'FICHA' || stage === 'EVALUADA') {
    return (
      <Card variant="subtle" padding="lg">
        <div className="flex items-center gap-2.5">
          <Lock size={15} strokeWidth={1.5} className="text-zinc-600" />
          <h2 className="text-base font-semibold text-zinc-400">Paso 4 — Construcción de la demo</h2>
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
          <h2 className="text-base font-semibold text-zinc-100">Paso 4 — Construcción de la demo</h2>
          <BadgeProvisorio />
        </div>
        <UrgenciaBanner respondioDesde={respondioDesde} />
        <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
          La demo se construye en <span className="font-semibold text-zinc-300">Claude Design</span>{' '}
          (herramienta externa) — el panel te guía fase por fase, no la construye por vos. Cuando
          arranques, el dossier pasa a &quot;Construcción&quot; y se abren los pasos de draft y
          self-check.
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
          <h2 className="text-base font-semibold text-zinc-100">Paso 4 — Construcción de la demo</h2>
          <Badge tone="rose" variant="soft">Correcciones pendientes</Badge>
        </div>
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
          <h2 className="text-base font-semibold text-zinc-100">Paso 4 — Construcción de la demo</h2>
          <BadgeProvisorio />
        </div>

        <UrgenciaBanner respondioDesde={respondioDesde} />

        {ultimoRechazo && <GuiaRetrabajo rechazo={ultimoRechazo} />}

        <p className="max-w-xl text-xs leading-relaxed text-zinc-500">
          Construí en Claude Design siguiendo estas fases en orden. La secuencia es preliminar:
          se va a refinar cuando se validen las primeras demos reales.
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

        <ol className="space-y-3">
          {SHELL_CONSTRUCCION.map((fase, index) => (
            <li
              key={fase.titulo}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="text-sm font-semibold text-zinc-200">
                <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/15 text-[11px] font-bold text-cyan-300">
                  {index + 1}
                </span>
                {fase.titulo}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{fase.detalle}</p>
              <ul className="mt-2 space-y-1 text-xs leading-relaxed text-zinc-400">
                {fase.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-zinc-600">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

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
      <h2 className="text-base font-semibold text-zinc-300">Paso 4 — Construcción de la demo</h2>
      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
        Demo construida. El dossier ya avanzó a la etapa siguiente.
      </p>
    </Card>
  )
}
