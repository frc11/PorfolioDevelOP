'use client'

import { useState, useTransition } from 'react'
import { createClientAssetAction } from '@/actions/agency-actions'
import { UploadCloud, Loader2 } from 'lucide-react'
import { AssetType } from '@prisma/client'

export function VaultManager({ organizationId }: { organizationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState<AssetType>('DOCUMENT')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !url) return

    startTransition(async () => {
      try {
        await createClientAssetAction(organizationId, { name, url, type, description })
        setName('')
        setUrl('')
        setDescription('')
        setType('DOCUMENT')
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black/40 border border-white/5 p-5 rounded-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Nombre del archivo/link</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Brandbook 2026"
            disabled={isPending}
            required
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-zinc-400">Tipo de Asset</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as AssetType)}
            disabled={isPending}
            className="bg-[#12141a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {Object.values(AssetType).map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400">URL del Enlace</label>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://figma.com/..."
          disabled={isPending}
          required
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400">Descripción (Opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contraseña o instrucciones..."
          disabled={isPending}
          rows={2}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !name || !url}
        className="mt-2 flex items-center justify-center gap-2 w-full bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
        Subir a Bóveda
      </button>
    </form>
  )
}
