'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createServiceAction } from '@/lib/actions/services'
import { ServiceType, ServiceStatus } from '@prisma/client'

const TYPE_LABELS: Record<ServiceType, string> = {
  WEB_DEV: 'Desarrollo Web',
  AI: 'Inteligencia Artificial',
  AUTOMATION: 'Automatización',
  SOFTWARE: 'Software a medida',
}

const STATUS_LABELS: Record<ServiceStatus, string> = {
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  CANCELLED: 'Cancelado',
}

export default function NewServicePage() {
  const params = useParams()
  const clientId = params.id as string
  const [error, formAction, isPending] = useActionState(createServiceAction, null)

  return (
    <div>
      <Link
        href={`/admin/clients/${clientId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver al cliente
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-100">Nuevo servicio</h1>
        <p className="mt-1 text-sm text-zinc-500">
          El servicio quedará asociado a este cliente.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <form action={formAction} className="flex flex-col gap-5 max-w-lg">
          <input type="hidden" name="clientId" value={clientId} />

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="type"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Tipo de servicio <span className="text-red-400">*</span>
            </label>
            <select
              id="type"
              name="type"
              defaultValue="WEB_DEV"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            >
              {(Object.keys(TYPE_LABELS) as ServiceType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="status"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Estado inicial
            </label>
            <select
              id="status"
              name="status"
              defaultValue="ACTIVE"
              className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
            >
              {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="startDate"
              className="text-xs font-medium uppercase tracking-wide text-zinc-400"
            >
              Fecha de inicio{' '}
              <span className="normal-case text-zinc-600">(opcional, por defecto hoy)</span>
            </label>
            <input
              id="startDate"
              name="startDate"
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
              {isPending ? 'Guardando...' : 'Crear servicio'}
            </button>
            <Link
              href={`/admin/clients/${clientId}`}
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
