'use client'

import { useState } from 'react'
import { replyTicketAction } from '@/actions/ticket-actions'
import { Send, Loader2, AlertCircle } from 'lucide-react'

export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() || content.length < 5) {
      setErrorMsg('El mensaje es muy corto.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg('')

    const res = await replyTicketAction({ ticketId, content })
    setIsSubmitting(false)

    if (res.success) {
      setContent('')
    } else {
      setErrorMsg(res.error || 'Ocurrió un error al enviar el mensaje.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      {errorMsg && (
        <div className="mb-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-3 py-2 rounded-lg flex items-center gap-1.5">
          <AlertCircle size={14} />
          <p>{errorMsg}</p>
        </div>
      )}
      <div className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Escribe tu respuesta aquí..."
          className="w-full h-24 resize-none bg-[#080a0c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all shadow-inner"
        />
        <div className="absolute bottom-3 right-3">
          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="flex items-center gap-2 bg-white hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-black px-4 py-2 rounded-lg text-sm font-bold shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all"
          >
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </div>
      <p className="text-[10px] text-zinc-500 mt-2 text-center">
        El equipo de develOP será notificado de inmediato. Respuesta asíncrona estándar en menos de 24hs.
      </p>
    </form>
  )
}
