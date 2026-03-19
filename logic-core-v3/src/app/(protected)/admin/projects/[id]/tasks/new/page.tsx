'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createTaskAction } from '@/lib/actions/projects'
import { TaskStatus } from '@prisma/client'

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

export default function NewTaskPage() {
  const params = useParams()
  const projectId = params.id as string
  const [error, formAction, isPending] = useActionState(createTaskAction, null)

  return (
    <div>
      <Link
        href={`/admin/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver al proyecto
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Nueva tarea</h1>
        <p className="mt-1 text-sm text-zinc-500">
          La tarea quedará asignada a este proyecto.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="flex flex-col gap-5 max-w-lg">
          <input type="hidden" name="projectId" value={projectId} />

          {/* Error */}
          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="title"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Título <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Ej: Diseñar mockup de homepage"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="description"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Descripción{' '}
              <span className="normal-case text-zinc-600">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detalles de la tarea..."
              className="resize-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="status"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Estado
            </label>
            <select
              id="status"
              name="status"
              defaultValue="TODO"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            >
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="dueDate"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Fecha límite{' '}
              <span className="normal-case text-zinc-600">(opcional)</span>
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 [color-scheme:dark]"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-md bg-cyan-500 px-5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Crear tarea'}
            </button>
            <Link
              href={`/admin/projects/${projectId}`}
              className="rounded-md px-5 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
