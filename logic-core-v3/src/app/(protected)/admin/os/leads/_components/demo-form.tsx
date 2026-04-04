'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Eye, Inbox, LoaderCircle, PlayCircle } from 'lucide-react'
import { EmptyState } from '@/app/(protected)/admin/os/_components/empty-state'
import { createDemo, markDemoViewed } from '../_actions/demo.actions'

type DemoServiceType = 'WEB' | 'AI_AGENT' | 'AUTOMATION' | 'CUSTOM_SOFTWARE' | null

type LeadDemo = {
  id: string
  serviceType: DemoServiceType
  demoUrl: string
  loomUrl: string | null
  sentAt: string
  viewedAt: string | null
  notes: string | null
}

type DemoFormProps = {
  leadId: string
}

type LeadDemosPanelProps = DemoFormProps & {
  demos: LeadDemo[]
}

type DemoFormState = {
  demoUrl: string
  loomUrl: string
  serviceType: '' | Exclude<DemoServiceType, null>
  notes: string
}

const SERVICE_OPTIONS: Array<{ label: string; value: Exclude<DemoServiceType, null> }> = [
  { label: 'WEB', value: 'WEB' },
  { label: 'AI Agent', value: 'AI_AGENT' },
  { label: 'Automation', value: 'AUTOMATION' },
  { label: 'Custom Software', value: 'CUSTOM_SOFTWARE' },
]

const inputClassName =
  'w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/35'

function serviceBadgeTone(serviceType: DemoServiceType): string {
  switch (serviceType) {
    case 'WEB':
      return 'border-cyan-400/20 bg-cyan-400/10 text-cyan-200'
    case 'AI_AGENT':
      return 'border-violet-400/20 bg-violet-400/10 text-violet-200'
    case 'AUTOMATION':
      return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
    case 'CUSTOM_SOFTWARE':
      return 'border-amber-400/20 bg-amber-400/10 text-amber-200'
    default:
      return 'border-white/10 bg-white/5 text-zinc-300'
  }
}

function serviceLabel(serviceType: DemoServiceType): string {
  switch (serviceType) {
    case 'WEB':
      return 'Web'
    case 'AI_AGENT':
      return 'AI Agent'
    case 'AUTOMATION':
      return 'Automation'
    case 'CUSTOM_SOFTWARE':
      return 'Custom Software'
    default:
      return 'Sin servicio'
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function DemoForm({ leadId }: DemoFormProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [formState, setFormState] = useState<DemoFormState>({
    demoUrl: '',
    loomUrl: '',
    serviceType: '',
    notes: '',
  })

  const resetForm = () => {
    setFormState({
      demoUrl: '',
      loomUrl: '',
      serviceType: '',
      notes: '',
    })
    setError(null)
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await createDemo({
        leadId,
        demoUrl: formState.demoUrl,
        loomUrl: formState.loomUrl,
        serviceType: formState.serviceType || undefined,
        notes: formState.notes,
      })

      if (!result.success) {
        setError(result.error)
        return
      }

      resetForm()
      setIsOpen(false)
      router.refresh()
    })
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">Nueva demo</p>
          <p className="mt-1 text-xs text-zinc-500">Asocia una demo o Loom al lead actual.</p>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>{isOpen ? 'Cerrar' : 'Agregar demo'}</span>
        </button>
      </div>

      {isOpen ? (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Demo URL</label>
            <input
              required
              value={formState.demoUrl}
              onChange={(event) =>
                setFormState((current) => ({ ...current, demoUrl: event.target.value }))
              }
              className={inputClassName}
              placeholder="https://demo..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Loom URL</label>
            <input
              value={formState.loomUrl}
              onChange={(event) =>
                setFormState((current) => ({ ...current, loomUrl: event.target.value }))
              }
              className={inputClassName}
              placeholder="https://loom.com/..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Servicio</label>
            <select
              value={formState.serviceType}
              onChange={(event) =>
                setFormState((current) => ({
                  ...current,
                  serviceType: event.target.value as DemoFormState['serviceType'],
                }))
              }
              className={inputClassName}
            >
              <option value="">Seleccionar servicio</option>
              {SERVICE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-200">Notas</label>
            <textarea
              value={formState.notes}
              onChange={(event) =>
                setFormState((current) => ({ ...current, notes: event.target.value }))
              }
              className={`${inputClassName} min-h-24`}
              placeholder="Que cubre esta demo, observaciones, proximos pasos..."
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false)
                resetForm()
              }}
              className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-zinc-300 transition-colors hover:bg-white/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:opacity-60"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              <span>{isPending ? 'Guardando...' : 'Crear demo'}</span>
            </button>
          </div>
        </form>
      ) : null}
    </div>
  )
}

export function LeadDemosPanel({ leadId, demos }: LeadDemosPanelProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [demoPendingId, setDemoPendingId] = useState<string | null>(null)

  const handleMarkViewed = (demoId: string) => {
    setError(null)
    setDemoPendingId(demoId)

    void markDemoViewed({ demoId }).then((result) => {
      setDemoPendingId(null)

      if (!result.success) {
        setError(result.error)
        return
      }

      router.refresh()
    })
  }

  return (
    <section className="space-y-4 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div>
        <h3 className="text-lg font-semibold text-white">Demos</h3>
        <p className="mt-2 text-sm text-zinc-400">
          Historial de demos enviadas, Looms y seguimiento de visualizacion.
        </p>
      </div>

      <DemoForm leadId={leadId} />

      {error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="space-y-3">
        {demos.length > 0 ? (
          demos.map((demo) => (
            <article
              key={demo.id}
              className="rounded-[24px] border border-white/10 bg-black/20 p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span
                    className={[
                      'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                      serviceBadgeTone(demo.serviceType),
                    ].join(' ')}
                  >
                    {serviceLabel(demo.serviceType)}
                  </span>
                  <p className="mt-3 text-sm text-zinc-400">Enviada el {formatDate(demo.sentAt)}</p>
                </div>

                {demo.viewedAt ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200">
                    <Eye className="h-3.5 w-3.5" />
                    Visto el {formatDate(demo.viewedAt)}
                  </span>
                ) : (
                  <button
                    type="button"
                    disabled={demoPendingId === demo.id}
                    onClick={() => handleMarkViewed(demo.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/15 disabled:opacity-60"
                  >
                    {demoPendingId === demo.id ? (
                      <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <PlayCircle className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {demoPendingId === demo.id ? 'Guardando...' : 'Marcar como visto'}
                    </span>
                  </button>
                )}
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <a
                  href={demo.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-cyan-200 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir demo
                </a>

                {demo.loomUrl ? (
                  <div>
                    <a
                      href={demo.loomUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-violet-200 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir Loom
                    </a>
                  </div>
                ) : null}

                {demo.notes ? (
                  <p className="pt-2 text-sm leading-6 text-zinc-300">{demo.notes}</p>
                ) : null}
              </div>
            </article>
          ))
        ) : (
          <EmptyState
            icon={Inbox}
            title="Sin demos cargadas"
            description="Agrega la primera demo o Loom para iniciar el seguimiento comercial de este lead."
          />
        )}
      </div>
    </section>
  )
}
