'use client'

import { useActionState, useEffect, useRef } from 'react'
import { sendMessageAction } from '@/lib/actions/messages'
import { Send } from 'lucide-react'

export function SendMessageForm({ clientId }: { clientId: string }) {
  const [error, formAction, isPending] = useActionState(sendMessageAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const prevPendingRef = useRef(false)

  // Reset form after successful send
  useEffect(() => {
    if (prevPendingRef.current && !isPending && !error) {
      formRef.current?.reset()
    }
    prevPendingRef.current = isPending
  }, [isPending, error])

  return (
    <form
      ref={formRef}
      action={formAction}
      className="p-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(8,10,12,0.8)' }}
    >
      <input type="hidden" name="clientId" value={clientId} />

      {error && (
        <p className="mb-2 text-xs text-red-400">{error}</p>
      )}

      <div className="flex items-end gap-3">
        <textarea
          name="content"
          rows={2}
          placeholder="Escribí un mensaje al cliente..."
          required
          disabled={isPending}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              formRef.current?.requestSubmit()
            }
          }}
          className="flex-1 resize-none rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all focus:border-cyan-500/60 focus:bg-white/[0.06] focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex h-[4.5rem] w-10 flex-shrink-0 items-center justify-center rounded-xl text-zinc-950 transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
        >
          <Send size={15} />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-zinc-700">Enter para enviar · Shift+Enter para nueva línea</p>
    </form>
  )
}
