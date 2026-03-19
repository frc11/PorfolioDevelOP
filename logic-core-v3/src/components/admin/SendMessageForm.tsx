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
    <form ref={formRef} action={formAction} className="border-t border-zinc-800 bg-zinc-950 p-4">
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
          className="flex-1 resize-none rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex h-[4.5rem] w-10 flex-shrink-0 items-center justify-center rounded-md bg-cyan-500 text-zinc-950 transition-colors hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={15} />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-zinc-600">Enter para enviar · Shift+Enter para nueva línea</p>
    </form>
  )
}
