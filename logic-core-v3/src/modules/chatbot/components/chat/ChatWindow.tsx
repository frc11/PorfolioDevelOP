'use client'

import { motion, AnimatePresence } from 'motion/react'
import { useRef, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Sparkles } from 'lucide-react'
import type { UIChatMessage, ToolCallInUIMessage } from './types'
import type { PublicBotConfig } from '../../shared/publicConfig'
import type { NeuroAvatarState } from '../avatar'
import type { DegradedInfo } from '../../hooks/useChatbot'
import { CHATBOT_Z_INDEX } from '../../shared/zIndex'
import { ChatHeader } from './ChatHeader'
import { DegradedBanner } from './DegradedBanner'

export interface ChatWindowProps {
  config: PublicBotConfig
  messages: UIChatMessage[]
  isStreaming: boolean
  avatarState: NeuroAvatarState
  onSendMessage: (text: string) => void
  onClose: () => void
  onQuickReply: (text: string) => void
  /** Full payload for B8.3 — rendered as DegradedBanner with WhatsApp CTA. */
  degradedInfo?: DegradedInfo | null
  renderToolCall?: (toolCall: ToolCallInUIMessage) => React.ReactNode
  muted?: boolean
  onToggleMute?: () => void
}

export function ChatWindow({
  config,
  messages,
  isStreaming,
  avatarState,
  onSendMessage,
  onClose,
  onQuickReply,
  degradedInfo,
  renderToolCall,
  muted,
  onToggleMute,
}: ChatWindowProps) {
  const degraded = !!degradedInfo
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [showCursor, setShowCursor] = useState(true)

  // Focus input when chat opens
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming])

  // Blinking cursor effect for AI responses
  useEffect(() => {
    if (!isStreaming) return

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 530)

    return () => clearInterval(interval)
  }, [isStreaming])

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (input.trim() && !isStreaming) {
      onSendMessage(input)
      setInput('')
    }
  }

  const isThinking = isStreaming

  return (
    <>
      <AnimatePresence>
        {true && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-md"
              style={{ pointerEvents: 'auto', cursor: 'auto', zIndex: CHATBOT_Z_INDEX.backdrop }}
              aria-hidden="true"
            />

            {/* Chat Window - Glassmorphism 3.0 Boutique */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 10 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              data-chatbot-window
              className="fixed bottom-4 left-4 right-4 flex flex-col md:bottom-[6.5rem] md:left-auto md:right-6 md:w-[420px]"
              style={{
                pointerEvents: 'auto',
                cursor: 'auto',
                zIndex: CHATBOT_Z_INDEX.panel,
                background: 'linear-gradient(180deg, rgba(11, 14, 28, 0.92) 0%, rgba(6, 8, 18, 0.9) 100%)',
                backdropFilter: 'blur(32px)',
                WebkitBackdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.09)',
                boxShadow: `
                    0 0 0 1px rgba(255,255,255,0.04),
                    0 32px 80px rgba(0,0,0,0.7),
                    0 0 120px rgba(68,100,255,0.08),
                    inset 0 1px 0 rgba(255,255,255,0.08),
                    inset 0 -1px 0 rgba(0,0,0,0.4)
                `,
                borderRadius: '24px',
                overflow: 'hidden',
                // 72dvh: dynamic viewport — the sheet shrinks when the virtual
                // keyboard opens so the textarea + send button stay visible.
                maxHeight: '72dvh',
              }}
              role="dialog"
              aria-label={`Consultor ${config.botName}`}
            >
              {/* Header — uses ChatHeader so the configured avatar shows here too */}
              <ChatHeader
                config={config}
                avatarState={avatarState}
                isStreaming={isStreaming}
                onClose={onClose}
                muted={muted}
                onToggleMute={onToggleMute}
              />

              {/* Messages Area */}
              <div className="chat-messages-area flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 md:p-6"
                data-lenis-prevent
                onWheel={(e) => e.stopPropagation()}
                style={{ 
                  overscrollBehavior: 'contain', 
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'rgba(255,255,255,0.12) transparent'
                }}
                role="log"
                aria-live="polite"
              >
                {degradedInfo && <DegradedBanner info={degradedInfo} />}
                <AnimatePresence initial={false}>
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center space-y-4 py-6 text-center opacity-75">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.35rem] border border-white/6 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                        <Sparkles className="w-6 h-6 text-cyan-400/80" />
                      </div>
                      <div>
                        <p style={{
                          fontSize: '11px',
                          color: 'rgba(255,255,255,0.3)',
                          fontFamily: 'monospace',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          marginBottom: '4px'
                        }}>
                          Sistema Listo
                        </p>
                        <p style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.5)',
                          maxWidth: '240px',
                          lineHeight: 1.55,
                          margin: '0 auto',
                          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        }}>
                          Protocolo de consultoría iniciado. ¿Cómo puedo asistirle hoy?
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <motion.div
                        key={m.id}
                        data-chatbot-message={m.role}
                        initial={{ opacity: 0, y: 15, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex flex-col gap-3 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        {m.content && (
                          <div style={{
                            maxWidth: '86%',
                            padding: m.role === 'user' ? '11px 15px' : '12px 15px',
                            fontSize: '13px',
                            lineHeight: 1.68,
                            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            boxShadow: m.role === 'user'
                              ? '0 4px 16px rgba(6,182,212,0.12), 0 2px 8px rgba(0,0,0,0.25)'
                              : '0 2px 12px rgba(0,0,0,0.2)',
                            ...(m.role === 'user' ? {
                              background: 'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(124,58,237,0.12) 100%)',
                              border: '1px solid rgba(6,182,212,0.28)',
                              borderRadius: '18px 6px 18px 18px',
                              color: 'rgba(255,255,255,0.94)',
                            } : {
                              background: 'rgba(255,255,255,0.038)',
                              borderTop: '1px solid rgba(255,255,255,0.08)',
                              borderRight: '1px solid rgba(255,255,255,0.08)',
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                              borderLeft: '2px solid rgba(6,182,212,0.38)',
                              borderTopLeftRadius: '6px',
                              borderTopRightRadius: '18px',
                              borderBottomRightRadius: '18px',
                              borderBottomLeftRadius: '18px',
                              color: 'rgba(255,255,255,0.88)',
                            })
                          }}>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                                  code: ({ children }) => (
                                    <code style={{ 
                                      background: 'rgba(255,255,255,0.08)', 
                                      color: '#4488ff', 
                                      padding: '2px 4px', 
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      fontFamily: 'monospace' 
                                    }}>
                                      {children}
                                    </code>
                                  ),
                                  strong: ({ children }) => (
                                    <strong style={{ color: '#fff', fontWeight: 600 }}>{children}</strong>
                                  ),
                                }}
                              >
                                {m.content}
                              </ReactMarkdown>
                              {m.role === 'assistant' && idx === messages.length - 1 && isThinking && showCursor && (
                                <span style={{ 
                                  display: 'inline-block', 
                                  width: '6px', 
                                  height: '14px', 
                                  background: '#4488ff', 
                                  marginLeft: '4px',
                                  verticalAlign: 'middle',
                                  opacity: 0.8
                                }} />
                              )}
                            </div>
                          </div>
                        )}
                        {/* Tool Calls Rendering */}
                        {m.toolCalls && m.toolCalls.length > 0 && renderToolCall && (
                          <div className="flex flex-col gap-2 w-full max-w-[90%]">
                            {m.toolCalls.map((tc) => (
                              <div key={tc.toolCallId}>
                                {renderToolCall(tc)}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}

                  {/* Redesigned Thinking Indicator */}
                  {isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '8px 14px',
                      }}
                    >
                      {/* Mini blob pulsante pensando */}
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'radial-gradient(circle at 38% 35%, rgba(6,182,212,0.9) 0%, rgba(6,182,212,0.4) 60%, rgba(6,182,212,0.1) 100%)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 0 10px rgba(6,182,212,0.2)',
                        animation: 'thinkPulse 1.8s ease-in-out infinite',
                      }}>
                        {/* Ojos cerrados del blob pensando */}
                        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                          <motion.line
                            x1="2" y1="4" x2="5" y2="4"
                            stroke="white" strokeOpacity="0.9"
                            strokeWidth="1.2" strokeLinecap="round"
                            animate={{ y1: [4, 3.5, 4], y2: [4, 3.5, 4] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                          />
                          <motion.line
                            x1="9" y1="4" x2="12" y2="4"
                            stroke="white" strokeOpacity="0.9"
                            strokeWidth="1.2" strokeLinecap="round"
                            animate={{ y1: [4, 3.5, 4], y2: [4, 3.5, 4] }}
                            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                          />
                        </svg>
                      </div>

                      {/* Dots orgánicos */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              style={{
                                width: '5px',
                                height: '5px',
                                borderRadius: '50%',
                                background: `rgba(6,182,212,${0.5 + i * 0.15})`,
                                boxShadow: '0 0 4px rgba(6,182,212,0.4)',
                              }}
                              animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.4, 1, 0.4],
                              }}
                              transition={{
                                duration: 1.1,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: i * 0.18,
                              }}
                            />
                          ))}
                        </div>
                        <span style={{
                          fontSize: '10px',
                          color: 'rgba(6,182,212,0.55)',
                          fontFamily: 'ui-monospace, monospace',
                          letterSpacing: '0.1em',
                        }}>
                          pensando
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                {/* Quick replies */}
                {config.quickReplies && config.quickReplies.length > 0 && messages.length === 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {config.quickReplies.map((qr) => (
                      <button
                        key={qr.label}
                        onClick={() => onQuickReply(qr.promptToSend)}
                        className="bg-cyan-900/20 border border-cyan-800/40 text-cyan-100 hover:bg-cyan-800/30 text-xs px-3 py-1.5 rounded-full transition-colors text-left"
                      >
                        {qr.emoji && <span className="mr-2">{qr.emoji}</span>}{qr.label}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input Area */}
              <form
                onSubmit={handleFormSubmit}
                style={{ 
                  padding: '14px', 
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  background: 'rgba(255,255,255,0.018)',
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-end',
                  position: 'relative',
                }}
              >
                {/* Wrapper con glow on focus */}
                <div
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '14px',
                    padding: '10px 14px',
                    position: 'relative',
                    transition: 'border-color 200ms, box-shadow 200ms',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)'
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08), inset 0 1px 0 rgba(255,255,255,0.03)'
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                    e.currentTarget.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.03)'
                  }}
                >
                  <textarea
                    data-chatbot-input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value)
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                    }}
                    onInput={(e) => {
                      e.currentTarget.style.height = 'auto'
                      e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        if (input.trim() && !isThinking && !degraded) {
                          const form = e.currentTarget.closest('form')
                          if (form) form.requestSubmit()
                        }
                      }
                    }}
                    placeholder={degraded ? 'Continuá la conversación por WhatsApp' : 'Escribí tu consulta...'}
                    disabled={isThinking || degraded}
                    rows={1}
                    inputMode="text"
                    autoCapitalize="sentences"
                    autoCorrect="on"
                    spellCheck={true}
                    enterKeyHint="send"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'rgba(255,255,255,0.88)',
                      fontSize: '13px',
                      width: '100%',
                      resize: 'none',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      lineHeight: 1.55,
                      minHeight: '20px',
                      maxHeight: '80px',
                      overflow: 'auto',
                    }}
                  />
                </div>

                {/* Hint Enter debajo del input — aparece solo si hay texto */}
                <AnimatePresence>
                  {input.trim().length > 0 && !isThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '58px',
                        fontSize: '9px',
                        color: 'rgba(255,255,255,0.2)',
                        fontFamily: 'ui-monospace, monospace',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        pointerEvents: 'none',
                      }}
                    >
                      <span style={{
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '3px',
                        padding: '1px 4px',
                        fontSize: '8px',
                      }}>
                        Enter
                      </span>
                      para enviar
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Botón enviar */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                  disabled={isThinking || degraded || !input.trim()}
                  style={{
                    width: '40px', height: '40px',
                    borderRadius: '50%',
                    border: '1px solid rgba(6,182,212,0.2)',
                    cursor: isThinking || degraded || !input.trim() ? 'not-allowed' : 'pointer',
                    background: isThinking || degraded || !input.trim()
                      ? 'rgba(255,255,255,0.05)'
                      : 'linear-gradient(135deg, rgba(6,182,212,0.85), rgba(6,182,212,0.65))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isThinking || degraded || !input.trim() ? 'none' : '0 0 16px rgba(6,182,212,0.3), 0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'all 200ms',
                    color: isThinking || degraded || !input.trim() ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.95)',
                  }}
                  aria-label="Send message"
                >
                  <Send size={15} strokeWidth={2.25} />
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style jsx global>{`
        @keyframes thinkPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 10px rgba(6,182,212,0.2); }
          50% { transform: scale(1.08); box-shadow: 0 0 18px rgba(6,182,212,0.45); }
        }
      `}</style>
    </>
  )
}
