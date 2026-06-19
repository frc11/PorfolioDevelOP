'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, SendHorizontal } from 'lucide-react'
import { sendMessage } from '../_actions/message.actions'
import { EmojiPopover } from './emoji-popover'

type MessageInputProps = {
  organizationId: string
}

const TEXTAREA_MAX_ROWS = 2

export function MessageInput({ organizationId }: MessageInputProps) {
  const router = useRouter()
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [content, setContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Auto-expand: arranca en 1 renglón, crece hasta TEXTAREA_MAX_ROWS y después
  // scrollea interno (sin empujar el layout). Re-corre en cada cambio de
  // `content` — tipeo, limpiar al enviar, o inserción de emoji.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const styles = window.getComputedStyle(el)
    const lineHeight = parseFloat(styles.lineHeight) || 24
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const maxHeight = lineHeight * TEXTAREA_MAX_ROWS + paddingY
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [content])

  function submit() {
    if (isPending || content.trim().length === 0) return
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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    // Enter envía; Shift+Enter inserta salto de línea. No enviar mientras se
    // compone con IME / dead-keys (acentos del teclado español): isComposing
    // evita el envío prematuro al confirmar la composición con Enter.
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      setContent((current) => current + emoji)
      return
    }
    // Inserta en la posición del cursor (no solo al final) y restaura el caret
    // después del re-render. El useEffect de auto-expand recalcula la altura.
    const start = el.selectionStart ?? content.length
    const end = el.selectionEnd ?? content.length
    setContent(content.slice(0, start) + emoji + content.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const caret = start + emoji.length
      el.setSelectionRange(caret, caret)
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur-xl"
    >
      {error ? (
        <div className="mb-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <EmojiPopover onPick={insertEmoji} disabled={isPending} />

        <textarea
          ref={textareaRef}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isPending}
          className="max-h-[4.25rem] min-h-[2.75rem] flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-60"
          placeholder="Escribí un mensaje..."
        />

        <button
          type="submit"
          disabled={isPending || content.trim().length === 0}
          aria-label="Enviar mensaje"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
          ) : (
            <SendHorizontal className="h-4 w-4" strokeWidth={1.5} />
          )}
          <span className="hidden sm:inline">{isPending ? 'Enviando...' : 'Enviar'}</span>
        </button>
      </div>
    </form>
  )
}
