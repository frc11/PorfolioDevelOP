'use client'

import { useState, useTransition } from 'react'
import { createTaskForClientAction } from '@/actions/agency-actions'
import { Send, Loader2 } from 'lucide-react'

export function ProjectManager({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    startTransition(async () => {
      try {
        await createTaskForClientAction(projectId, organizationId, { title, description })
        setTitle('')
        setDescription('')
        // Optionally show a toast here
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-black/40 border border-white/5 p-5 rounded-2xl">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400">Título del Entregable</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Logo Final V2"
          disabled={isPending}
          required
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-zinc-400">Descripción (Opcional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Breve detalle sobre lo que se entrega..."
          disabled={isPending}
          rows={3}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || !title}
        className="mt-2 flex items-center justify-center gap-2 w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm py-2.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        Crear y Notificar al Cliente
      </button>
    </form>
  )
}
