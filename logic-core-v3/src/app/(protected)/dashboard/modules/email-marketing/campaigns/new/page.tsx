'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Save, Send } from 'lucide-react'
import { createCampaignAction, sendCampaignAction } from '../../_actions'

type State = { error?: string; ok?: boolean; campaignId?: string } | null

const glassBorder: React.CSSProperties = {
  background: 'rgba(255,255,255,0.025)',
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '12px',
}

const inputStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#f4f4f5',
  outline: 'none',
  width: '100%',
  padding: '10px 14px',
  fontSize: '14px',
}

export default function NewCampaignPage() {
  const router = useRouter()
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev: State, fd: FormData) => {
      const result = await createCampaignAction(fd)
      if (result.ok && result.campaignId) {
        router.push('/dashboard/modules/email-marketing/campaigns')
      }
      return result as State
    },
    null,
  )

  async function handleSendNow(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSendError(null)
    setSending(true)

    const fd = new FormData(e.currentTarget)
    const createResult = await createCampaignAction(fd)

    if (!createResult.ok || !createResult.campaignId) {
      setSendError(createResult.error ?? 'Error al guardar la campaña.')
      setSending(false)
      return
    }

    const sendResult = await sendCampaignAction(createResult.campaignId)
    setSending(false)

    if (!sendResult.ok) {
      setSendError(sendResult.error ?? 'Error al enviar la campaña.')
      return
    }

    router.push('/dashboard/modules/email-marketing/campaigns')
  }

  return (
    <div style={glassBorder} className="p-6 flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <Mail size={15} strokeWidth={1.5} className="text-cyan-400" />
        </div>
        <h2 className="text-sm font-black tracking-tight text-zinc-100">Nueva campaña</h2>
      </div>

      <form id="campaign-form" onSubmit={handleSendNow} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Nombre interno</label>
          <input name="name" required style={inputStyle} placeholder="Ej: Newsletter Mayo 2026" />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Asunto del email</label>
          <input name="subject" required style={inputStyle} placeholder="Ej: Novedades de este mes" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Nombre del remitente</label>
            <input name="fromName" required style={inputStyle} placeholder="Ej: Tu empresa" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Email remitente</label>
            <input name="fromEmail" type="email" required style={inputStyle} placeholder="Ej: hola@tuempresa.com" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Contenido HTML</label>
          <textarea
            name="htmlContent"
            required
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }}
            placeholder={'<h1>Hola {{contact.firstName}}</h1>\n<p>Tu mensaje acá...</p>'}
          />
          <p className="text-[11px] text-zinc-600">
            Podés usar HTML básico. El footer de opt-out se agrega automáticamente.
          </p>
        </div>

        {(state?.error || sendError) && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {state?.error ?? sendError}
          </p>
        )}
      </form>

      {/* Buttons */}
      <div className="flex items-center gap-3 pt-2 border-t border-white/[0.05]">
        <button
          form="campaign-form"
          type="submit"
          disabled={pending || sending}
          className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-black uppercase tracking-widest text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-40"
        >
          <Send size={13} strokeWidth={1.5} />
          {sending ? 'Enviando…' : 'Enviar ahora'}
        </button>

        <button
          type="button"
          disabled={pending || sending}
          onClick={async () => {
            const form = document.getElementById('campaign-form') as HTMLFormElement
            if (!form.reportValidity()) return
            const fd = new FormData(form)
            await createCampaignAction(fd)
            router.push('/dashboard/modules/email-marketing/campaigns')
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-zinc-400 transition hover:text-zinc-200 hover:border-white/20 disabled:opacity-40"
        >
          <Save size={13} strokeWidth={1.5} />
          {pending ? 'Guardando…' : 'Guardar borrador'}
        </button>
      </div>
    </div>
  )
}
