'use client'

import { useActionState } from 'react'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ClientFormProps {
  action: (prevState: string | null, formData: FormData) => Promise<string | null>
  mode: 'create' | 'edit'
  initialValues?: {
    clientId: string
    companyName: string
    name: string
    logoUrl?: string | null
    email: string
    analyticsPropertyId?: string | null
    siteUrl?: string | null
    n8nWorkflowIds?: string[]
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

export function ClientForm({ action, mode, initialValues, cancelHref }: ClientFormProps) {
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
        {/* Hidden clientId for edit mode */}
        {mode === 'edit' && initialValues?.clientId && (
          <input type="hidden" name="clientId" value={initialValues.clientId} />
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

        {/* Company name */}
        <Field>
          <label htmlFor="companyName" className={LABEL_CLASS}>
            Nombre de empresa <span className="text-red-400">*</span>
          </label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            defaultValue={initialValues?.companyName ?? ''}
            placeholder="Ej: Empresa S.A."
            className={INPUT_CLASS}
          />
        </Field>

        {/* Contact name */}
        <Field>
          <label htmlFor="name" className={LABEL_CLASS}>
            Nombre del contacto <span className="text-red-400">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={initialValues?.name ?? ''}
            placeholder="Ej: Juan García"
            className={INPUT_CLASS}
          />
        </Field>

        {/* Email — only in create mode */}
        {mode === 'create' && (
          <Field>
            <label htmlFor="email" className={LABEL_CLASS}>
              Email <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="contacto@empresa.com"
              className={INPUT_CLASS}
            />
          </Field>
        )}

        {/* Read-only email in edit mode */}
        {mode === 'edit' && initialValues?.email && (
          <Field>
            <label className={LABEL_CLASS}>Email</label>
            <div
              className="rounded-xl px-3 py-2.5 text-sm text-zinc-600"
              style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
            >
              {initialValues.email}
              <span className="ml-2 text-xs text-zinc-700">(no editable)</span>
            </div>
          </Field>
        )}

        {/* Temporary password — only in create mode */}
        {mode === 'create' && (
          <Field>
            <label htmlFor="password" className={LABEL_CLASS}>
              Contraseña temporal <span className="text-red-400">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className={INPUT_CLASS}
            />
          </Field>
        )}

        {/* Logo URL — optional */}
        <Field>
          <label htmlFor="logoUrl" className={LABEL_CLASS}>
            URL del logo{' '}
            <span className="normal-case text-zinc-600">(opcional)</span>
          </label>
          <input
            id="logoUrl"
            name="logoUrl"
            type="url"
            defaultValue={initialValues?.logoUrl ?? ''}
            placeholder="https://..."
            className={INPUT_CLASS}
          />
        </Field>

        {/* ── Edit-only integrations ───────────────────────────── */}
        {mode === 'edit' && (
          <>
            {/* Divider */}
            <motion.div variants={itemVariants} className="pt-1">
              <div
                className="mb-4 flex items-center gap-3"
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}
              >
                <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-600">
                  Integraciones
                </span>
              </div>
            </motion.div>

            {/* Analytics Property ID */}
            <Field>
              <label htmlFor="analyticsPropertyId" className={LABEL_CLASS}>
                Google Analytics Property ID{' '}
                <span className="normal-case text-zinc-600">(opcional)</span>
              </label>
              <input
                id="analyticsPropertyId"
                name="analyticsPropertyId"
                type="text"
                defaultValue={initialValues?.analyticsPropertyId ?? ''}
                placeholder="Ej: 123456789"
                className={INPUT_CLASS}
              />
              <p className="text-xs text-zinc-700">
                Encontralo en Google Analytics → Configuración → Información de la propiedad.
              </p>
            </Field>

            {/* Search Console site URL */}
            <Field>
              <label htmlFor="siteUrl" className={LABEL_CLASS}>
                URL del sitio (Search Console){' '}
                <span className="normal-case text-zinc-600">(opcional)</span>
              </label>
              <input
                id="siteUrl"
                name="siteUrl"
                type="url"
                defaultValue={initialValues?.siteUrl ?? ''}
                placeholder="https://tusitio.com"
                className={INPUT_CLASS}
              />
              <p className="text-xs text-zinc-700">
                Debe coincidir exactamente con la URL verificada en Search Console.
              </p>
            </Field>

            {/* n8n Workflow IDs */}
            <Field>
              <label htmlFor="n8nWorkflowIds" className={LABEL_CLASS}>
                Workflow IDs de n8n{' '}
                <span className="normal-case text-zinc-600">(opcional)</span>
              </label>
              <input
                id="n8nWorkflowIds"
                name="n8nWorkflowIds"
                type="text"
                defaultValue={(initialValues?.n8nWorkflowIds ?? []).join(', ')}
                placeholder="abc123, def456"
                className={INPUT_CLASS}
              />
              <p className="text-xs text-zinc-700">
                IDs separados por coma. Se encuentran en la URL de cada workflow en n8n.
              </p>
            </Field>
          </>
        )}

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 pt-2">
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={!isPending ? { scale: 1.015, filter: 'brightness(1.1)' } : {}}
            whileTap={!isPending ? { scale: 0.985 } : {}}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-zinc-950 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
          >
            {isPending
              ? 'Guardando...'
              : mode === 'create'
              ? 'Crear cliente'
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
