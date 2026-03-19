'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { ProjectStatus } from '@prisma/client'

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

interface ClientOption {
  id: string
  companyName: string
}

interface ProjectFormProps {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>
  mode: 'create' | 'edit'
  clients: ClientOption[]
  initialValues?: {
    projectId: string
    name: string
    description: string | null
    status: ProjectStatus
    clientId: string
  }
  cancelHref: string
}

export function ProjectForm({
  action,
  mode,
  clients,
  initialValues,
  cancelHref,
}: ProjectFormProps) {
  const [error, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-lg">
      {mode === 'edit' && initialValues?.projectId && (
        <input type="hidden" name="projectId" value={initialValues.projectId} />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Nombre del proyecto <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialValues?.name ?? ''}
          placeholder="Ej: Sitio web corporativo"
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Descripción{' '}
          <span className="normal-case text-zinc-600">(opcional)</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={initialValues?.description ?? ''}
          placeholder="Descripción breve del proyecto..."
          className="resize-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Client */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="clientId" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Cliente <span className="text-red-400">*</span>
        </label>
        {clients.length === 0 ? (
          <p className="text-sm text-zinc-600">
            No hay clientes registrados.{' '}
            <Link href="/admin/clients/new" className="text-cyan-400 hover:text-cyan-300">
              Crear uno →
            </Link>
          </p>
        ) : (
          <select
            id="clientId"
            name="clientId"
            required
            defaultValue={initialValues?.clientId ?? ''}
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          >
            <option value="" disabled>
              Seleccioná un cliente...
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.companyName}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Estado
        </label>
        <select
          id="status"
          name="status"
          defaultValue={initialValues?.status ?? 'PLANNING'}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        >
          {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
            <option key={s} value={s}>
              {PROJECT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending || clients.length === 0}
          className="rounded-md bg-cyan-500 px-5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear proyecto'
            : 'Guardar cambios'}
        </button>
        <Link
          href={cancelHref}
          className="rounded-md px-5 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
