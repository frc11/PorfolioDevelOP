/**
 * LeadOS B5 — Paneles read-only de la superficie de revisión (server
 * components puros: reciben los blobs ya parseados con los contratos zod).
 * Cada panel maneja su ausencia sin romperse — selfCheckJson recién lo
 * puebla B4.
 */
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { Callout } from '@/components/ui'
import type { Brief, Evaluacion, Ficha, Rechazo, SelfCheck } from '@/lib/leados/contracts'
import { IG_MANEJADO_POR_VALUES } from '@/lib/leados/contracts'

const IG_MANEJADO_LABELS: Record<(typeof IG_MANEJADO_POR_VALUES)[number], string> = {
  DUENO: 'Lo maneja el dueño',
  CM: 'Lo maneja un CM',
  NO_SABE: 'No se sabe quién lo maneja',
}

function formatFecha(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function Vacio({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-3 text-sm text-zinc-500">
      {children}
    </p>
  )
}

// Disciplina B9: el veredicto es informativo → cyan queda reservado para acción.
const VEREDICTO_TONES: Record<Evaluacion['veredicto'], string> = {
  DESCARTAR: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  AVANZAR: 'border-blue-400/20 bg-blue-500/10 text-blue-200',
  CALIENTE: 'border-amber-400/20 bg-amber-400/10 text-amber-200',
}

export function EvaluacionPanel({ evaluacion }: { evaluacion: Evaluacion | null }) {
  return (
    <Panel title="Evaluación">
      {!evaluacion ? (
        <Vacio>Sin evaluación registrada — no debería pasar en EN_REVISION.</Vacio>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-3 py-1 text-sm font-semibold text-white">
              Score {evaluacion.score}/5
            </span>
            <span
              className={[
                'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                VEREDICTO_TONES[evaluacion.veredicto],
              ].join(' ')}
            >
              {evaluacion.veredicto}
            </span>
            {evaluacion.fecha ? (
              <span className="text-xs text-zinc-500">{formatFecha(evaluacion.fecha)}</span>
            ) : null}
          </div>
          <p className="whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
            {evaluacion.razonamiento}
          </p>
        </div>
      )}
    </Panel>
  )
}

export function BriefPanel({ brief }: { brief: Brief | null }) {
  return (
    <Panel title="Brief de diseño">
      {!brief ? (
        <Vacio>Sin brief guardado para este dossier.</Vacio>
      ) : (
        <div className="space-y-3 text-sm text-zinc-300">
          <p className="font-medium text-zinc-100">{brief.titulo}</p>
          {brief.concepto ? <p className="leading-6">{brief.concepto}</p> : null}
          {brief.secciones.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {brief.secciones.map((seccion) => (
                <span
                  key={seccion}
                  className="inline-flex rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[11px] text-zinc-300"
                >
                  {seccion}
                </span>
              ))}
            </div>
          ) : null}
          {brief.notasMarca ? (
            <p className="text-xs leading-5 text-zinc-400">
              <span className="font-medium text-zinc-300">Marca:</span> {brief.notasMarca}
            </p>
          ) : null}
          {brief.cta ? (
            <p className="text-xs leading-5 text-zinc-400">
              <span className="font-medium text-zinc-300">CTA:</span> {brief.cta}
            </p>
          ) : null}
          {brief.pegadoGem ? (
            <details className="group rounded-2xl border border-white/10 bg-black/20 p-3">
              <summary className="cursor-pointer list-none text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 [&::-webkit-details-marker]:hidden">
                Respuesta completa del Gem ›
              </summary>
              <p className="mt-2 max-h-72 overflow-y-auto whitespace-pre-wrap text-xs leading-5 text-zinc-400">
                {brief.pegadoGem}
              </p>
            </details>
          ) : null}
        </div>
      )}
    </Panel>
  )
}

export function SelfCheckPanel({
  selfCheck,
  exigible = false,
}: {
  selfCheck: SelfCheck | null
  /** B8A/H7: en EN_REVISION/APROBADA el self-check es obligatorio (el gate de
   * envío a revisión lo exige). Si falta, es una anomalía — avisar, no tranquilizar. */
  exigible?: boolean
}) {
  return (
    <Panel title="Self-check del setter">
      {!selfCheck ? (
        exigible ? (
          <Callout
            tone="danger"
            icon={AlertTriangle}
            title="Esta demo llegó a revisión sin self-check registrado."
          >
            El flujo normal no lo permite — revisala con más cuidado antes de aprobar.
          </Callout>
        ) : (
          <Vacio>Sin self-check — lo puebla el paso de construcción (B4).</Vacio>
        )
      ) : (
        <div className="space-y-3">
          <ul className="space-y-1.5">
            {selfCheck.itemsDuros.map((item) => (
              <li key={item.nombre} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.5} />
                )}
                <span className={item.ok ? 'text-zinc-300' : 'text-rose-200'}>
                  {item.nombre}
                </span>
              </li>
            ))}
          </ul>
          {selfCheck.softFlags.length > 0 ? (
            <Callout tone="warning" title="Flags del setter">
              <ul className="space-y-1 text-xs leading-5">
                {selfCheck.softFlags.map((flag) => (
                  <li key={flag}>• {flag}</li>
                ))}
              </ul>
            </Callout>
          ) : null}
        </div>
      )}
    </Panel>
  )
}

export function RechazosPanel({ rechazos }: { rechazos: Rechazo[] }) {
  if (rechazos.length === 0) return null
  const ordenados = [...rechazos].reverse()
  return (
    <Panel title={`Rechazos previos (${rechazos.length})`}>
      <div className="space-y-3">
        {ordenados.map((rechazo) => (
          <div
            key={rechazo.fecha}
            className="rounded-2xl border border-rose-400/15 bg-rose-500/5 p-4 text-sm"
          >
            <p className="text-xs text-zinc-500">{formatFecha(rechazo.fecha)}</p>
            <p className="mt-1.5 text-zinc-200">
              <span className="font-medium text-rose-200">Qué:</span> {rechazo.motivo}
            </p>
            {rechazo.donde ? (
              <p className="mt-1 text-zinc-300">
                <span className="font-medium text-rose-200">Dónde:</span> {rechazo.donde}
              </p>
            ) : null}
            {rechazo.arreglo ? (
              <p className="mt-1 whitespace-pre-wrap leading-6 text-zinc-300">
                <span className="font-medium text-rose-200">Arreglo:</span> {rechazo.arreglo}
              </p>
            ) : null}
            {rechazo.detalle ? (
              <p className="mt-1 text-xs leading-5 text-zinc-400">{rechazo.detalle}</p>
            ) : null}
          </div>
        ))}
      </div>
    </Panel>
  )
}

const FICHA_BLOQUES: Array<{ key: keyof Ficha; label: string }> = [
  { key: 'identidad', label: 'Identidad' },
  { key: 'presenciaDigital', label: 'Presencia digital' },
  { key: 'resenas', label: 'Reseñas' },
  { key: 'contenidoReal', label: 'Contenido real' },
  { key: 'senalesOperativas', label: 'Señales operativas' },
  { key: 'otros', label: 'Otros' },
]

function fichaBloqueTexto(ficha: Ficha, key: keyof Ficha): string | null {
  if (key === 'identidad') {
    const identidad = ficha.identidad
    if (!identidad) return null
    const partes = [
      identidad.igManejadoPor ? IG_MANEJADO_LABELS[identidad.igManejadoPor] : null,
      identidad.notas ?? null,
    ].filter(Boolean)
    return partes.length > 0 ? partes.join('\n') : null
  }
  const valor = ficha[key]
  return typeof valor === 'string' && valor.trim() !== '' ? valor : null
}

export function FichaPanel({ ficha }: { ficha: Ficha | null }) {
  return (
    <Panel title="Ficha de observación">
      {!ficha ? (
        <Vacio>Sin ficha guardada.</Vacio>
      ) : (
        <div className="space-y-2">
          {FICHA_BLOQUES.map(({ key, label }) => {
            const texto = fichaBloqueTexto(ficha, key)
            if (!texto) return null
            return (
              <details key={key} className="group rounded-2xl border border-white/10 bg-black/20 p-3">
                <summary className="cursor-pointer list-none text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200 [&::-webkit-details-marker]:hidden">
                  {label} ›
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-zinc-300">
                  {texto}
                </p>
              </details>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
