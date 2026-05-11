'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Send, AlertCircle } from 'lucide-react'
import { sendCampaignAction } from '../../../_actions'

export default function SendCampaignPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    setLoading(true)
    setError(null)
    const result = await sendCampaignAction(params.id)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? 'Error al enviar.')
      return
    }
    router.push('/dashboard/modules/email-marketing/campaigns')
  }

  return (
    <div
      className="px-6 py-8 flex flex-col items-center gap-6 text-center max-w-sm mx-auto"
      style={{
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
      }}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)' }}
      >
        <Send size={24} strokeWidth={1.5} className="text-cyan-400" />
      </div>

      <div>
        <p className="text-sm font-black text-zinc-100">¿Confirmás el envío?</p>
        <p className="mt-2 text-xs leading-relaxed text-zinc-500">
          Esta acción enviará la campaña a todos tus contactos activos. No se puede deshacer.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 w-full">
          <AlertCircle size={13} strokeWidth={1.5} className="text-red-400 flex-shrink-0" />
          <span className="text-xs text-red-400 text-left">{error}</span>
        </div>
      )}

      <div className="flex items-center gap-3 w-full">
        <button
          onClick={() => router.back()}
          disabled={loading}
          className="flex-1 rounded-xl border border-white/10 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:border-white/20 transition-all disabled:opacity-40"
        >
          Cancelar
        </button>
        <button
          onClick={handleSend}
          disabled={loading}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 hover:bg-cyan-500/20 transition-all disabled:opacity-40"
        >
          <Send size={13} strokeWidth={1.5} />
          {loading ? 'Enviando…' : 'Enviar ahora'}
        </button>
      </div>
    </div>
  )
}
