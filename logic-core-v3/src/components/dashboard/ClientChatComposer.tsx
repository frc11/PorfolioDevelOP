'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Loader2, SendHorizontal } from 'lucide-react'
import { EmojiPopover } from './EmojiPopover'

const TEXTAREA_MAX_ROWS = 3

interface ClientChatComposerProps {
  /** Valor controlado del textarea (el caller es dueño del estado). */
  value: string
  onValueChange: (value: string) => void
  /** Form action de useActionState. Recibe FormData con `content`. */
  action: (payload: FormData) => void
  isPending: boolean
  /** Estado del action: éxito limpia el input, error se muestra arriba. */
  state: { success: boolean; error?: string } | null
  placeholder?: string
  /** Slot opcional entre el banner de error y el form (ej. quick-replies). */
  aboveForm?: ReactNode
  /** Texto de ayuda bajo el composer. */
  helperText?: ReactNode
}

/**
 * Composer compartido del chat cliente (Mensajes + Ticket): emoji, textarea
 * autoexpandible (hasta 3 líneas), Enter-para-enviar, botón cyan. El send-path
 * lo inyecta cada superficie vía `action` (useActionState) — el composer no
 * conoce la server action ni la fuente de datos.
 */
export function ClientChatComposer({
  value,
  onValueChange,
  action,
  isPending,
  state,
  placeholder = 'Escribí tu mensaje...',
  aboveForm,
  helperText = 'Enter para enviar · Shift+Enter para nueva línea',
}: ClientChatComposerProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Limpia el input cuando el envío fue exitoso.
  useEffect(() => {
    if (!isPending && state?.success) {
      formRef.current?.reset()
      onValueChange('')
    }
  }, [isPending, state, onValueChange])

  // Auto-expand: crece con el contenido hasta TEXTAREA_MAX_ROWS, luego scrollea
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
  }, [value])

  function insertEmoji(emoji: string) {
    const el = textareaRef.current
    if (!el) {
      onValueChange(value + emoji)
      return
    }
    // Inserta en la posición del cursor y restaura el caret tras el re-render
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    onValueChange(value.slice(0, start) + emoji + value.slice(end))
    requestAnimationFrame(() => {
      el.focus()
      const caret = start + emoji.length
      el.setSelectionRange(caret, caret)
    })
  }

  return (
    <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
      {state?.error && (
        <div className="mb-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm text-rose-200">
          {state.error}
        </div>
      )}

      {aboveForm}

      <form ref={formRef} action={action}>
        <div className="flex items-end gap-2">
          <EmojiPopover onPick={insertEmoji} disabled={isPending} />
          <textarea
            ref={textareaRef}
            name="content"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
            disabled={isPending}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-60"
            onKeyDown={(e) => {
              // isComposing: no enviar mientras se confirma la composición IME (acentos, dead-keys)
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <button
            type="submit"
            disabled={isPending || !value.trim()}
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

      {helperText && <p className="mt-1.5 text-[10px] text-zinc-600">{helperText}</p>}
    </div>
  )
}
