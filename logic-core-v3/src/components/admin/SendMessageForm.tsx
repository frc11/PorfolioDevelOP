'use client'

import { useActionState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import { sendMessageAction } from '@/lib/actions/messages'
import type { ActionResult } from '@/lib/actions/schemas'

export function SendMessageForm({ organizationId }: { organizationId: string }) {
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(sendMessageAction, null)
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const prevPendingRef = useRef(false)

  useEffect(() => {
    if (prevPendingRef.current && !isPending && state?.success) {
      formRef.current?.reset()
      textareaRef.current?.focus()
    }
    prevPendingRef.current = isPending
  }, [isPending, state])

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

        {state?.error ? (
          <p className="mb-2 rounded-xl border border-red-400/20 bg-red-400/8 px-3 py-2 text-xs text-red-300">
            {state.error}
          </p>
        ) : null}

        <div className="flex items-end gap-3">
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
            className="admin-input flex-1 resize-none disabled:opacity-50"
          />

          <motion.button
            type="submit"
            disabled={isPending}
            whileHover={!isPending ? { scale: 1.05, filter: 'brightness(1.08)' } : {}}
            whileTap={!isPending ? { scale: 0.95 } : {}}
            className="admin-btn-primary flex h-[4.5rem] w-12 flex-shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} />
          </motion.button>
        </div>

        <p className="mt-1.5 text-[10px] text-zinc-600">Enter para enviar · Shift+Enter para nueva línea</p>
      </form>
    </div>
  )
}
