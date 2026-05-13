'use client'

import { useRef, useState, type KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import type { PublicBotConfig } from '../../shared/publicConfig'

interface ChatInputProps {
  config: PublicBotConfig
  onSubmit: (text: string) => void
  disabled?: boolean
}

export function ChatInput({ config, onSubmit, disabled }: ChatInputProps) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSubmit(text)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const handleInput = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`
  }

  return (
    <div
      className="px-3 py-3 border-t flex items-end gap-2"
      style={{ borderColor: 'rgba(255,255,255,0.08)' }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKey}
        onInput={handleInput}
        rows={1}
        disabled={disabled}
        placeholder="Escribí tu mensaje…"
        className="flex-1 bg-transparent text-sm text-white placeholder-white/40 resize-none outline-none py-1.5 px-2 max-h-[120px]"
      />
      <button
        onClick={submit}
        disabled={!value.trim() || disabled}
        aria-label="Enviar"
        className="p-2 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: value.trim() ? config.accentColor : 'rgba(255,255,255,0.1)',
          color: value.trim() ? '#000' : 'white',
        }}
      >
        <Send size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
