'use client'

import { useActionState } from 'react'
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
        <div className="rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Company name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="companyName" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Nombre de empresa <span className="text-red-400">*</span>
        </label>
        <input
          id="companyName"
          name="companyName"
          type="text"
          required
          defaultValue={initialValues?.companyName ?? ''}
          placeholder="Ej: Empresa S.A."
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Contact name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Nombre del contacto <span className="text-red-400">*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={initialValues?.name ?? ''}
          placeholder="Ej: Juan García"
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Email — only in create mode */}
      {mode === 'create' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="contacto@empresa.com"
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      )}

      {/* Read-only email indicator in edit mode */}
      {mode === 'edit' && initialValues?.email && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Email
          </label>
          <div className="rounded-md border border-zinc-800 bg-zinc-800/50 px-3 py-2 text-sm text-zinc-500">
            {initialValues.email}
            <span className="ml-2 text-xs text-zinc-600">(no editable)</span>
          </div>
        </div>
      )}

      {/* Temporary password — only in create mode */}
      {mode === 'create' && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            Contraseña temporal <span className="text-red-400">*</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Mínimo 8 caracteres"
            className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
          />
        </div>
      )}

      {/* Logo URL — optional */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="logoUrl" className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          URL del logo{' '}
          <span className="normal-case text-zinc-600">(opcional)</span>
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          type="url"
          defaultValue={initialValues?.logoUrl ?? ''}
          placeholder="https://..."
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-cyan-500 px-5 py-2 text-sm font-medium text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? 'Guardando...'
            : mode === 'create'
            ? 'Crear cliente'
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
