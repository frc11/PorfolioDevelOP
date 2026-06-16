'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Inbox, LoaderCircle } from 'lucide-react'
import { EmptyState, Select } from '@/components/ui'
import { createActivity } from '../_actions/activity.actions'
import { useScrollFades } from './use-scroll-fades'
import {
  CHANNEL_OPTIONS,
  RESULT_OPTIONS,
  activityInputClass,
  channelIcon,
  formatFollowUp,
  relativeTime,
  resultLabel,
  resultTone,
  type ActivityChannel,
  type ActivityResult,
} from './lead-activity.helpers'

type FeedActivity = {
  id: string
  channel: ActivityChannel
  result: ActivityResult | null
  notes: string | null
  createdAt: string
  performedBy: {
    id: string
    name: string | null
    email: string | null
  } | null
}

type LeadActivityFeedProps = {
  leadId: string
  nextFollowUpAt: string | null
  /** Calculado en el server (evita Date.now en render). */
  followUpPending: boolean
  activities: FeedActivity[]
}

// === TUNABLES (calibrá por ojo) ===
const ACTIVITY_FADE_HEIGHT = 48 // alto del fade superior/inferior del timeline (px)

export function LeadActivityFeed({
  leadId,
  nextFollowUpAt,
  followUpPending,
  activities,
}: LeadActivityFeedProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [channel, setChannel] = useState<ActivityChannel>('WHATSAPP')
  const [result, setResult] = useState<ActivityResult | ''>('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Fades scroll-aware del timeline (hook reutilizable).
  const {
    scrollRef: timelineRef,
    onScroll: onTimelineScroll,
    maskImage: timelineFadeMask,
  } = useScrollFades(activities.length, ACTIVITY_FADE_HEIGHT)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const response = await createActivity({
        leadId,
        channel,
        result: result || undefined,
        notes,
      })

      if (!response.success) {
        setError(response.error)
        return
      }

      setShowForm(false)
      setResult('')
      setNotes('')
      router.refresh()
    })
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl xl:flex xl:h-full xl:flex-col">
      <div className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Actividad comercial</h3>
          <p className="mt-2 text-sm text-zinc-400">
            Historial de contactos, respuestas y proximos pasos del lead.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15"
        >
          {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          <span>+ Registrar actividad</span>
        </button>
      </div>

      {nextFollowUpAt ? (
        <div
          className={[
            'mt-5 shrink-0 rounded-2xl border px-4 py-3 text-sm',
            followUpPending
              ? 'border-rose-400/20 bg-rose-500/10 text-rose-200'
              : 'border-amber-400/20 bg-amber-500/10 text-amber-200',
          ].join(' ')}
        >
          {followUpPending
            ? 'Follow-up pendiente!'
            : `Proximo follow-up: ${formatFollowUp(nextFollowUpAt)}`}
        </div>
      ) : null}

      {showForm ? (
        <form
          onSubmit={handleSubmit}
          className="mt-5 shrink-0 rounded-[24px] border border-white/10 bg-black/20 p-4"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Canal</label>
              <Select
                value={channel}
                onChange={(event) => setChannel(event.target.value as ActivityChannel)}
                className={activityInputClass}
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Resultado</label>
              <Select
                value={result}
                onChange={(event) => setResult(event.target.value as ActivityResult | '')}
                className={activityInputClass}
              >
                <option value="">Sin resultado</option>
                {RESULT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-zinc-200">Notas</label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className={`${activityInputClass} min-h-28`}
                placeholder="Resumen de la conversacion, objeciones, proximos pasos..."
              />
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </div>
          ) : null}

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
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
              <span>{isPending ? 'Guardando...' : 'Registrar'}</span>
            </button>
          </div>
        </form>
      ) : null}

      <div
        ref={timelineRef}
        onScroll={onTimelineScroll}
        className="mt-6 xl:min-h-0 xl:flex-1 xl:overflow-y-auto"
        style={{ maskImage: timelineFadeMask, WebkitMaskImage: timelineFadeMask }}
      >
        <div className="relative pl-6">
          <div className="absolute bottom-0 left-[11px] top-0 w-px bg-white/10" />

          <div className="space-y-5">
            {activities.length > 0 ? (
            activities.map((activity) => {
              const Icon = channelIcon(activity.channel)

              return (
                <article
                  key={activity.id}
                  className="relative rounded-[24px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="absolute -left-[19px] top-5 flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-[#0f141b] text-zinc-300">
                    <Icon className="h-3 w-3" />
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">
                        {CHANNEL_OPTIONS.find((option) => option.value === activity.channel)?.label ??
                          activity.channel}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500">{relativeTime(activity.createdAt)}</p>
                    </div>

                    <span
                      className={[
                        'inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium',
                        resultTone(activity.result),
                      ].join(' ')}
                    >
                      {resultLabel(activity.result)}
                    </span>
                  </div>

                  {activity.notes ? (
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                      {activity.notes}
                    </p>
                  ) : null}

                  <p className="mt-3 text-xs text-zinc-500">
                    {activity.performedBy?.name ?? activity.performedBy?.email ?? 'Super Admin'}
                  </p>
                </article>
              )
            })
          ) : (
            <EmptyState
              icon={Inbox}
              title="Sin actividad registrada"
              description="Cuando registres mensajes, llamadas o seguimientos, el timeline va a aparecer aca."
              cta={
                showForm
                  ? undefined
                  : {
                      label: 'Registrar actividad',
                      onClick: () => setShowForm(true),
                    }
              }
            />
          )}
          </div>
        </div>
      </div>
    </section>
  )
}
