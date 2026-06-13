/**
 * LeadOS B5 — Paneles read-only de la superficie de revisión (server
 * components puros: reciben los blobs ya parseados con los contratos zod).
 * Cada panel maneja su ausencia sin romperse — selfCheckJson recién lo
 * puebla B4.
 */
import type { ReactNode } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
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
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
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

const VEREDICTO_TONES: Record<Evaluacion['veredicto'], string> = {
  DESCARTAR: 'border-rose-400/20 bg-rose-500/10 text-rose-200',
  AVANZAR: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200',
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
          <div className="rounded-2xl border border-rose-400/25 bg-rose-500/[0.06] p-3">
            <p className="text-sm font-medium text-rose-200">
              ⚠ Esta demo llegó a revisión sin self-check registrado.
            </p>
            <p className="mt-1 text-xs leading-5 text-rose-100/70">
              El flujo normal no lo permite — revisala con más cuidado antes de aprobar.
            </p>
          </div>
        ) : (
          <Vacio>Sin self-check — lo puebla el paso de construcción (B4).</Vacio>
        )
      ) : (
        (() => {
          // B8A-III/NIII-6: la lista de duros llega 100% verde por construcción
          // del gate (selfCheckAprobado), así que aporta poco al escaneo de
          // Franco; los softFlags son la señal discriminante. Se lideran los
          // softFlags y se condensan los duros a un resumen expandible. La rama
          // roja no es código muerto: si HARD_CHECKS cambió tras guardar, un
          // self-check viejo deja de aprobar → se abre el detalle y se marca.
          const durosTotal = selfCheck.itemsDuros.length
          const durosOk = selfCheck.itemsDuros.filter((item) => item.ok).length
          const todosOk = durosOk === durosTotal
          return (
            <div className="space-y-3">
              {selfCheck.softFlags.length > 0 ? (
                <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-3">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-amber-200/80">
                    Reparos que levantó el setter — miralos
                  </p>
                  <ul className="mt-1.5 space-y-1 text-sm leading-6 text-amber-100/90">
                    {selfCheck.softFlags.map((flag) => (
                      <li key={flag}>• {flag}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-white/10 bg-black/10 px-4 py-3 text-sm text-zinc-400">
                  El setter no levantó reparos de diseño.
                </p>
              )}

              <details
                open={!todosOk}
                className="group rounded-2xl border border-white/10 bg-black/20 p-3"
              >
                <summary className="flex cursor-pointer list-none items-center gap-2 text-xs font-medium transition-colors [&::-webkit-details-marker]:hidden">
                  {todosOk ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" strokeWidth={1.5} />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.5} />
                  )}
                  <span className={todosOk ? 'text-zinc-400 hover:text-zinc-200' : 'text-rose-200'}>
                    {durosOk}/{durosTotal} obligatorios verificados
                    {todosOk ? '' : ' — ⚠ revisá los que faltan'} ›
                  </span>
                </summary>
                <ul className="mt-2 space-y-1.5">
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
              </details>
            </div>
          )
        })()
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
