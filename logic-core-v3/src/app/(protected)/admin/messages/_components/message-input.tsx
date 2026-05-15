'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, SendHorizontal } from 'lucide-react'
import { sendMessage } from '../_actions/message.actions'

type MessageInputProps = {
  organizationId: string
}

export function MessageInput({ organizationId }: MessageInputProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await sendMessage(organizationId, content)

      if (!result.success) {
        setError(result.error)
        return
      }

      setContent('')
      router.refresh()
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          disabled={isPending}
          className="min-h-[120px] w-full resize-none rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Escribí un mensaje claro para el cliente..."
        />

        {error ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending || content.trim().length === 0}
            className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SendHorizontal className="h-4 w-4" />
            )}
            <span>{isPending ? 'Enviando...' : 'Enviar mensaje'}</span>
          </button>
        </div>
      </div>
    </form>
  )
}
