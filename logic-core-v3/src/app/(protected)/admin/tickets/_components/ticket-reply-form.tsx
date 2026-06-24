'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, SendHorizontal } from 'lucide-react'
import { replyToTicketAction } from '@/lib/tickets/actions'
import { EmojiPickerButton } from './emoji-picker-button'

type TicketReplyFormProps = {
  ticketId: string
}

// ~2 lineas: leading-6 (24px) x2 + py-3 (24px). Pasado esto el textarea scrollea adentro.
const MAX_TEXTAREA_HEIGHT = 76

export function TicketReplyForm({ ticketId }: TicketReplyFormProps) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const autoGrow = useCallback(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }, [])

  // Auto-grow: arranca en 1 renglon, crece hasta 2 (MAX_TEXTAREA_HEIGHT) y de ahi scrollea
  // adentro. Corre tras cada cambio de content (incluye el reset al enviar y el insert de emoji).
  useEffect(() => {
    autoGrow()
  }, [content, autoGrow])

  const insertEmoji = useCallback((emoji: string) => {
    const textarea = textareaRef.current
    if (!textarea) {
      setContent((current) => current + emoji)
      return
    }
    const start = textarea.selectionStart ?? textarea.value.length
    const end = textarea.selectionEnd ?? textarea.value.length
    setContent((current) => current.slice(0, start) + emoji + current.slice(end))
    // Restaurar foco + cursor justo despues del emoji (tras el re-render controlado).
    requestAnimationFrame(() => {
      const caret = start + emoji.length
      textarea.focus()
      textarea.setSelectionRange(caret, caret)
    })
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await replyToTicketAction({ ticketId, content })

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
      className="shrink-0 rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-sm font-medium text-white">Responder ticket</p>
          <p className="mt-1 text-sm text-zinc-400">
            La respuesta se enviará como mensaje del admin y quedará visible para el cliente.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <EmojiPickerButton onPick={insertEmoji} disabled={isPending} />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={1}
            disabled={isPending}
            className="min-w-0 flex-1 resize-none overflow-y-auto rounded-[24px] border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder="Escribí una respuesta clara, concreta y accionable para el cliente..."
          />
        </div>

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
            <span>{isPending ? 'Enviando...' : 'Enviar respuesta'}</span>
          </button>
        </div>
      </div>
    </form>
  )
}
