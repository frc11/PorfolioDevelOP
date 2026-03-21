'use client'

import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { createTaskAction } from '@/lib/actions/projects'
import { TaskStatus } from '@prisma/client'

const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En curso',
  DONE: 'Completada',
}

const inputClass =
  'w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20 [color-scheme:dark]'

const labelClass =
  'text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500'

export default function NewTaskPage() {
  const params = useParams()
  const projectId = params.id as string
  const [error, formAction, isPending] = useActionState(createTaskAction, null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/admin/projects/${projectId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ChevronLeft size={14} />
        Volver al proyecto
      </Link>

      <div className="mb-6">
        <p className="mb-0.5 text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Tareas
        </p>
        <h1 className="text-xl font-bold text-zinc-100">Nueva tarea</h1>
        <p className="mt-0.5 text-sm text-zinc-600">
          La tarea quedará asignada a este proyecto.
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
          <input type="hidden" name="projectId" value={projectId} />

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="title" className={labelClass}>
              Título <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="Ej: Diseñar mockup de homepage"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="description" className={labelClass}>
              Descripción{' '}
              <span className="normal-case text-zinc-600">(opcional)</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Detalles de la tarea..."
              className={`resize-none ${inputClass}`}
            />
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="status" className={labelClass}>
              Estado
            </label>
            <select id="status" name="status" defaultValue="TODO" className={inputClass}>
              {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
                <option key={s} value={s} className="bg-[#0d0f10] text-zinc-100">
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Due date */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dueDate" className={labelClass}>
              Fecha límite{' '}
              <span className="normal-case text-zinc-600">(opcional)</span>
            </label>
            <input
              id="dueDate"
              name="dueDate"
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
              {isPending ? 'Guardando...' : 'Crear tarea'}
            </motion.button>
            <Link
              href={`/admin/projects/${projectId}`}
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
