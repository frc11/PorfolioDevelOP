'use client'

import { useState } from 'react'
import { Mail, Check, AlertTriangle, Loader2 } from 'lucide-react'

interface ResendCredentialsButtonProps {
  userId: string
  userEmail: string
}

export function ResendCredentialsButton({ userId, userEmail }: ResendCredentialsButtonProps) {
  const [state, setState] = useState<'idle' | 'confirming' | 'loading' | 'success' | 'error' | 'no_email'>('idle')
  const [manualPassword, setManualPassword] = useState<string | null>(null)

  async function handleConfirm() {
    setState('loading')
    try {
      const res = await fetch(`/api/admin/users/${userId}/resend-credentials`, { method: 'POST' })
      const data = await res.json() as { ok: boolean; emailSent: boolean; tempPassword: string | null }

      if (!res.ok) {
        setState('error')
        return
      }

      if (data.emailSent) {
        setState('success')
      } else {
        setManualPassword(data.tempPassword)
        setState('no_email')
      }
    } catch {
      setState('error')
    }
  }

  if (state === 'success') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">
        <Check className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>Credenciales enviadas a {userEmail}</span>
      </div>
    )
  }

  if (state === 'no_email' && manualPassword) {
    return (
      <div className="space-y-2 rounded-xl border border-amber-400/20 bg-amber-500/10 p-3 text-sm text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>Email falló — nueva password temporal:</span>
        </div>
        <code className="block rounded-lg bg-black/30 px-3 py-2 font-mono text-sm tracking-widest text-zinc-100">
          {manualPassword}
        </code>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
        <AlertTriangle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
        <span>Error al re-enviar — intentá de nuevo</span>
      </div>
    )
  }

  if (state === 'confirming') {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-200">
        <span>¿Confirmar re-envío? Esto invalida la password actual de {userEmail}.</span>
        <div className="flex gap-2">
          <button
            onClick={handleConfirm}
            className="rounded-lg bg-amber-500/20 px-3 py-1 font-medium hover:bg-amber-500/30 transition-colors"
          >
            Confirmar
          </button>
          <button
            onClick={() => setState('idle')}
            className="rounded-lg px-3 py-1 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setState('confirming')}
      disabled={state === 'loading'}
      className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 hover:bg-white/10 transition-colors disabled:opacity-50"
    >
      {state === 'loading' ? (
        <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
      ) : (
        <Mail className="h-4 w-4" strokeWidth={1.5} />
      )}
      Re-enviar credenciales
    </button>
  )
}
