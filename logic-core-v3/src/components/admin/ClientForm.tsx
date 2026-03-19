'use client'

import { useActionState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

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

export function ClientForm({ action, mode, initialValues, cancelHref }: ClientFormProps) {
  const [error, formAction, isPending] = useActionState(action, null)

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-lg">
      {/* Hidden clientId for edit mode */}
      {mode === 'edit' && initialValues?.clientId && (
        <input type="hidden" name="clientId" value={initialValues.clientId} />
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/[0.08] px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Company name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="companyName" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Nombre de empresa <span className="text-red-400">*</span>
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          defaultValue={initialValues?.companyName ?? ''}
          placeholder="Ej: Empresa S.A."
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>

      {/* Contact name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          Nombre del contacto <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialValues?.name ?? ''}
          placeholder="Ej: Juan García"
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>

      {/* Email — only in create mode */}
      {mode === 'create' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="contacto@empresa.com"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      )}

      {/* Read-only email indicator in edit mode */}
      {mode === 'edit' && initialValues?.email && (
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Email
          </label>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-sm text-zinc-600">
            {initialValues.email}
            <span className="ml-2 text-xs text-zinc-700">(no editable)</span>
          </div>
        </div>
      )}

      {/* Temporary password — only in create mode */}
      {mode === 'create' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Contraseña temporal <span className="text-red-400">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>
      )}

      {/* Logo URL — optional */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="logoUrl" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
          URL del logo{' '}
          <span className="normal-case text-zinc-600">(opcional)</span>
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={initialValues?.logoUrl ?? ''}
          placeholder="https://..."
          className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
        />
      </div>

      {/* Analytics Property ID — optional, edit mode only */}
      {mode === 'edit' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="analyticsPropertyId" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Google Analytics Property ID{' '}
            <span className="normal-case text-zinc-600">(opcional)</span>
          </label>
          <input
            id="analyticsPropertyId"
            name="analyticsPropertyId"
            type="text"
            defaultValue={initialValues?.analyticsPropertyId ?? ''}
            placeholder="Ej: 123456789 (ID numérico de la propiedad GA4)"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
          />
          <p className="text-xs text-zinc-700">
            El Property ID numérico se encuentra en Google Analytics → Configuración → Información de la propiedad.
          </p>
        </div>
      )}

      {/* Search Console site URL — optional, edit mode only */}
      {mode === 'edit' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="siteUrl" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            URL del sitio (Search Console){' '}
            <span className="normal-case text-zinc-600">(opcional)</span>
          </label>
          <input
            id="siteUrl"
            name="siteUrl"
            type="url"
            defaultValue={initialValues?.siteUrl ?? ''}
            placeholder="https://tusitio.com"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
          />
          <p className="text-xs text-zinc-700">
            Debe coincidir exactamente con la URL verificada en Google Search Console (incluyendo https:// y sin barra final).
          </p>
        </div>
      )}

      {/* n8n Workflow IDs — optional, edit mode only */}
      {mode === 'edit' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="n8nWorkflowIds" className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-500">
            Workflow IDs de n8n{' '}
            <span className="normal-case text-zinc-600">(opcional)</span>
          </label>
          <input
            id="n8nWorkflowIds"
            name="n8nWorkflowIds"
            type="text"
            defaultValue={(initialValues?.n8nWorkflowIds ?? []).join(', ')}
            placeholder="abc123, def456"
            className="w-full rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20"
          />
          <p className="text-xs text-zinc-700">
            IDs separados por coma. Se encuentran en la URL de cada workflow en n8n.
          </p>
        </div>
      )}

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
      </div>
    </form>
  )
}
