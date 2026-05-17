'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bot, FlaskConical, Send, User, X } from 'lucide-react'

interface TestPromptSandboxProps {
  kb: Record<string, string>
  botName: string
  tone: string
  companyName?: string
  open: boolean
  onClose: () => void
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function TestPromptSandbox({
  kb,
  botName,
  tone,
  companyName,
  open,
  onClose,
}: TestPromptSandboxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)

  async function handleSend() {
    if (!input.trim() || streaming) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    try {
      const response = await fetch('/api/admin/chatbot/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          kbDraft: kb,
          botName,
          tone,
          companyName,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: `Error: ${error.error}` },
        ])
        setStreaming(false)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No stream')

      let assistantContent = ''
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      const decoder = new TextDecoder()
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: assistantContent,
          }
          return updated
        })
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${String(error)}` },
      ])
    } finally {
      setStreaming(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-violet-400/15 p-2">
                  <FlaskConical className="h-5 w-5 text-violet-300" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    Test prompt sandbox
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Probas con la KB actual sin guardar nada
                  </p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="rounded-xl p-2 hover:bg-white/[0.05]">
                <X className="h-4 w-4 text-zinc-400" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {messages.length === 0 ? (
                <p className="py-12 text-center text-sm italic text-zinc-500">
                  Escribi un mensaje para probar el bot con la KB que estas editando.
                </p>
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        message.role === 'user' ? 'bg-zinc-700' : 'bg-cyan-400/15'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-zinc-300" strokeWidth={1.5} />
                      ) : (
                        <Bot className="h-4 w-4 text-cyan-300" strokeWidth={1.5} />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        message.role === 'user'
                          ? 'bg-zinc-800 text-zinc-200'
                          : 'bg-white/[0.04] text-zinc-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">
                        {message.content || (streaming && index === messages.length - 1 ? '...' : '')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex gap-2 border-t border-white/10 p-4">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder="Proba algo como: cuanto cuesta?, que hacen?, donde estan..."
                disabled={streaming}
                className="flex-1 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-cyan-400/30 focus:outline-none disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => void handleSend()}
                disabled={streaming || !input.trim()}
                className="rounded-2xl bg-cyan-400 px-4 py-2.5 text-zinc-950 hover:bg-cyan-300 disabled:opacity-50"
              >
                <Send className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
