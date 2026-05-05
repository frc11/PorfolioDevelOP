'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
import type { OnboardingTask, OnboardingTaskStatus } from '@prisma/client'
import { updateTaskStatus, updateTaskNotes } from '@/actions/admin/onboarding-tasks'

interface TaskRowProps {
  task: OnboardingTask
}

const STATUS_OPTIONS: { value: OnboardingTaskStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'IN_PROGRESS', label: 'En progreso' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'SKIPPED', label: 'Saltado' },
]

export function TaskRow({ task }: TaskRowProps) {
  const [status, setStatus] = useState<OnboardingTaskStatus>(task.status)
  const [notes, setNotes] = useState(task.internalNotes ?? '')
  const [isPending, startTransition] = useTransition()

  function handleStatusChange(newStatus: OnboardingTaskStatus) {
    const prev = status
    setStatus(newStatus)
    startTransition(async () => {
      try {
        await updateTaskStatus(task.id, newStatus)
      } catch {
        setStatus(prev)
      }
    })
  }

  function handleNotesBlur() {
    if (notes === (task.internalNotes ?? '')) return
    startTransition(async () => {
      await updateTaskNotes(task.id, notes)
    })
  }

  const isCompleted = status === 'COMPLETED'
  const isSkipped = status === 'SKIPPED'
  const isDimmed = isCompleted || isSkipped

  return (
    <div
      className={`rounded-2xl border p-4 transition-all duration-300 ${
        isDimmed
          ? 'border-white/[0.04] opacity-50'
          : 'border-white/[0.08] bg-white/[0.02]'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="shrink-0 text-emerald-400 text-sm">✓</span>
            )}
            <h4
              className={`text-sm font-medium leading-snug ${
                isDimmed ? 'line-through text-zinc-500' : 'text-zinc-100'
              }`}
            >
              {task.title}
            </h4>
            {isPending && (
              <Loader2 size={12} className="shrink-0 animate-spin text-zinc-500" />
            )}
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-zinc-500">{task.description}</p>
          {task.completedAt && (
            <p className="mt-1 text-xs text-zinc-600">
              Completada el{' '}
              {new Date(task.completedAt).toLocaleDateString('es-AR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
        <div className="shrink-0">
          <select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value as OnboardingTaskStatus)}
            disabled={isPending}
            className="h-8 rounded-lg border border-white/[0.08] bg-zinc-900 px-2 text-xs text-zinc-300 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Notas internas (solo vos las ves)..."
          rows={2}
          className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 placeholder-zinc-600 transition-colors focus:border-white/[0.12] focus:outline-none focus:ring-1 focus:ring-white/10"
        />
      </div>
    </div>
  )
}
