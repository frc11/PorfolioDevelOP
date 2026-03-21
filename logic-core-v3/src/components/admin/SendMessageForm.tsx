'use client'

import { useActionState, useEffect, useRef } from 'react'
import { sendMessageAction } from '@/lib/actions/messages'
import { Send } from 'lucide-react'
import { motion } from 'framer-motion'

export function SendMessageForm({ organizationId }: { organizationId: string }) {
  const [error, formAction, isPending] = useActionState(sendMessageAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevPendingRef = useRef(false)

  // Reset form after successful send and refocus textarea
  useEffect(() => {
    if (prevPendingRef.current && !isPending && !error) {
      formRef.current?.reset()
      textareaRef.current?.focus()
    }
    prevPendingRef.current = isPending
  }, [isPending, error])

  return (
    <div
      className="flex-shrink-0 px-4 py-3"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,10,12,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <form ref={formRef} action={formAction}>
        <input type="hidden" name="organizationId" value={organizationId} />

        {error && (
          <p
            className="mb-2 rounded-lg px-3 py-1.5 text-xs text-red-400"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </p>
        )}

        <div className="flex items-end gap-2.5">
          {/* Textarea */}
          <textarea
            ref={textareaRef}
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
            className="flex-1 resize-none rounded-xl px-3 py-2.5 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 transition-all disabled:opacity-50"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.border = '1px solid rgba(6,182,212,0.4)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              e.currentTarget.style.boxShadow = ''
            }}
          />

          {/* Send button */}
          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={!isPending ? { scale: 1.05, filter: 'brightness(1.15)' } : {}}
            whileTap={!isPending ? { scale: 0.95 } : {}}
            className="flex h-[4.5rem] w-10 flex-shrink-0 items-center justify-center rounded-xl text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)' }}
          >
            <Send size={15} />
          </motion.button>
        </div>

        <p className="mt-1.5 text-[10px] text-zinc-700">
          Enter para enviar · Shift+Enter para nueva línea
        </p>
      </form>
    </div>
  )
}
