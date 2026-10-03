'use client'

import { Loader2, SendHorizontal } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'

/**
 * [NOCTURNO] B · EL CAMPO DEL CHAT — COPIA de `components/dashboard/ClientChatComposer.tsx` (el textarea que crece hasta
 * tres líneas, Enter para enviar, Shift+Enter para nueva línea, el botón cian con «Enviando...», el lugar para las
 * respuestas rápidas y la ayuda). Lo único que no está es el botón de emojis (`EmojiPopover`): abre su selector en un
 * portal al `body` (por debajo de la ampliación, no se vería) y descarga la librería de emojis. El envío es local: el
 * mensaje se agrega a la conversación de la demo, no se manda nada.
 */
const TEXTAREA_MAX_ROWS = 3

export function ComposerDelChat({ value, onValueChange, alEnviar, isPending, aboveForm, interactivo }: { readonly value: string; readonly onValueChange: (v: string) => void; readonly alEnviar: (texto: string) => void; readonly isPending: boolean; readonly aboveForm?: ReactNode; readonly interactivo: boolean }): React.JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const campo = useId()
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const styles = window.getComputedStyle(el)
    const lineHeight = parseFloat(styles.lineHeight) || 24
    const paddingY = parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom)
    const maxHeight = lineHeight * TEXTAREA_MAX_ROWS + paddingY
    el.style.height = `${String(Math.min(el.scrollHeight, maxHeight))}px`
    el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [value])

  return (
    <div className="shrink-0 rounded-[24px] border border-white/10 bg-white/5 p-3">
      {aboveForm}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (value.trim() !== '' && !isPending) alEnviar(value.trim())
        }}
      >
        <div className="flex items-end gap-2">
          <label className="sr-only" htmlFor={campo}>
            Tu mensaje para el equipo (ejemplo)
          </label>
          <textarea
            ref={textareaRef}
            id={campo}
            name="content"
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder="Escribí tu mensaje..."
            rows={1}
            disabled={isPending || !interactivo}
            tabIndex={interactivo ? undefined : -1}
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm leading-6 text-white outline-none transition-colors placeholder:text-zinc-500 focus:border-cyan-400/35 focus-visible:ring-2 focus-visible:ring-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                e.currentTarget.form?.requestSubmit()
              }
            }}
          />
          <button type="submit" disabled={isPending || !value.trim() || !interactivo} aria-label="Enviar mensaje" className="inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/15 focus-visible:outline-2 focus-visible:outline-cyan-400 disabled:cursor-not-allowed disabled:opacity-60">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} aria-hidden /> : <SendHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden />}
            <span className="hidden sm:inline">{isPending ? 'Enviando...' : 'Enviar'}</span>
          </button>
        </div>
      </form>
      <p className="mt-1.5 text-[10px] text-zinc-600">Enter para enviar · Shift+Enter para nueva línea</p>
    </div>
  )
}
