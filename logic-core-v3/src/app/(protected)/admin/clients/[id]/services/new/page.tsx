'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
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

const inputClass =
  'w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20 [color-scheme:dark]'

const labelClass =
  'text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500'

export default function NewServicePage() {
  const params = useParams()
  const organizationId = params.id as string
  const [error, formAction, isPending] = useActionState(createServiceAction, null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/admin/clients/${organizationId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver al cliente
      </Link>

      <div className="mb-6">
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Servicios
        </p>
        <h1 className="text-xl font-bold text-zinc-100">Nuevo servicio</h1>
        <p className="mt-0.5 text-sm text-zinc-600">
          El servicio quedará asociado a este cliente.
        </p>
      </div>

      <div
        className="max-w-lg rounded-xl p-6"
        style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(6,182,212,0.2)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <form action={formAction} className="flex flex-col gap-5">
          <input type="hidden" name="organizationId" value={organizationId} />

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="type" className={labelClass}>
              Tipo de servicio <span className="text-red-400">*</span>
            </label>
            <select id="type" name="type" defaultValue="WEB_DEV" className={inputClass}>
              {(Object.keys(TYPE_LABELS) as ServiceType[]).map((t) => (
                <option key={t} value={t} className="bg-[#0d0f10] text-zinc-100">
                  {TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className={labelClass}>
              Estado inicial
            </label>
            <select id="status" name="status" defaultValue="ACTIVE" className={inputClass}>
              {(Object.keys(STATUS_LABELS) as ServiceStatus[]).map((s) => (
                <option key={s} value={s} className="bg-[#0d0f10] text-zinc-100">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Start date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="startDate" className={labelClass}>
              Fecha de inicio{' '}
              <span className="normal-case text-zinc-600">(opcional, por defecto hoy)</span>
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              className={inputClass}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <motion.button
              type="submit"
              disabled={isPending}
              whileHover={!isPending ? { scale: 1.015, filter: 'brightness(1.1)' } : {}}
              whileTap={!isPending ? { scale: 0.985 } : {}}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
            >
              {isPending ? 'Guardando...' : 'Crear servicio'}
            </motion.button>
            <Link
              href={`/admin/clients/${organizationId}`}
              className="rounded-xl px-5 py-2.5 text-sm text-zinc-500 transition-all hover:text-zinc-200"
              style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </motion.div>
  )
}
