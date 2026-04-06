'use client'

import { useActionState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'
import { ProjectStatus } from '@prisma/client'

// ─── Shared field styles ──────────────────────────────────────────────────────

const INPUT_CLASS =
  'w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20'

const LABEL_CLASS =
  'text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500'

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: 'Planificación',
  IN_PROGRESS: 'En curso',
  REVIEW: 'Revisión',
  COMPLETED: 'Completado',
}

// ─── Props ────────────────────────────────────────────────────────────────────

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
    organizationId: string | null
  }
  cancelHref: string
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-1.5">
      {children}
    </motion.div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProjectForm({
  action,
  mode,
  clients,
  initialValues,
  cancelHref,
}: ProjectFormProps) {
  const [error, formAction, isPending] = useActionState(action, null)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-lg rounded-2xl p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <form action={formAction} className="flex flex-col gap-5">
        {mode === 'edit' && initialValues?.projectId && (
          <input type="hidden" name="projectId" value={initialValues.projectId} />
        )}

        {/* Error */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="rounded-xl px-4 py-3 text-sm text-red-400"
            style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)' }}
          >
            {error}
          </motion.div>
        )}

        {/* Name */}
        <Field>
          <label htmlFor="name" className={LABEL_CLASS}>
            Nombre del proyecto <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialValues?.name ?? ''}
            placeholder="Ej: Sitio web corporativo"
            className={INPUT_CLASS}
          />
        </Field>

        {/* Description */}
        <Field>
          <label htmlFor="description" className={LABEL_CLASS}>
            Descripción{' '}
            <span className="normal-case text-zinc-600">(opcional)</span>
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={initialValues?.description ?? ''}
            placeholder="Descripción breve del proyecto..."
            className={`resize-none ${INPUT_CLASS}`}
          />
        </Field>

        {/* Client */}
        <Field>
          <label htmlFor="organizationId" className={LABEL_CLASS}>
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
              id="organizationId"
              name="organizationId"
              required
              defaultValue={initialValues?.organizationId ?? ''}
              className={INPUT_CLASS}
            >
              <option value="" disabled className="bg-[#0d0f10] text-zinc-500">
                Seleccioná un cliente...
              </option>
              {clients.map((c) => (
                <option key={c.id} value={c.id} className="bg-[#0d0f10] text-zinc-100">
                  {c.companyName}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Status */}
        <Field>
          <label htmlFor="status" className={LABEL_CLASS}>
            Estado
          </label>
          <select
            id="status"
            name="status"
            defaultValue={initialValues?.status ?? 'PLANNING'}
            className={INPUT_CLASS}
          >
            {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
              <option key={s} value={s} className="bg-[#0d0f10] text-zinc-100">
                {PROJECT_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </Field>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
          <motion.button
            type="submit"
            disabled={isPending || clients.length === 0}
            whileHover={!isPending ? { scale: 1.015, filter: 'brightness(1.1)' } : {}}
            whileTap={!isPending ? { scale: 0.985 } : {}}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
          >
            {isPending
              ? 'Guardando...'
              : mode === 'create'
              ? 'Crear proyecto'
              : 'Guardar cambios'}
          </motion.button>
          <Link
            href={cancelHref}
            className="rounded-xl px-5 py-2.5 text-sm text-zinc-500 transition-all hover:text-zinc-200"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
          >
            Cancelar
          </Link>
        </motion.div>
      </form>
    </motion.div>
  )
}
