'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Send, Sparkles, Volume2, VolumeX } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { useChatbot } from '../../hooks/useChatbot'
import { useChatbotSounds } from '../../hooks/useChatbotSounds'
import { renderToolCall } from '../tool-cards'
import { DegradedBanner } from '../chat/DegradedBanner'

interface ChatbotEmbedProps {
  slug: string
  theme: 'light' | 'dark'
}

export function ChatbotEmbed({ slug }: ChatbotEmbedProps) {
  const chatbot = useChatbot({ slug, currentPath: '/' })
  const sounds = useChatbotSounds()
  const parentOriginRef = useRef<string>('*')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const seenToolCallIds = useRef<Set<string>>(new Set())
  const openCalledRef = useRef(false)
  const wasStreamingRef = useRef<boolean>(false)

  // Fire the message chime on the streaming→ready transition. No-op until
  // the user has interacted (the embed mounts already-open, but autoplay
  // policy still applies inside the iframe — `markInteraction` is wired into
  // the first send below).
  useEffect(() => {
    if (wasStreamingRef.current && !chatbot.isStreaming) {
      sounds.playMessage()
    }
    wasStreamingRef.current = chatbot.isStreaming
  }, [chatbot.isStreaming, sounds])

  // Start chat open immediately on mount
  useEffect(() => {
    if (!openCalledRef.current) {
      openCalledRef.current = true
      chatbot.open()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const notifyParent = useCallback((type: string, payload?: unknown) => {
    window.parent.postMessage(
      { type: `develop:${type}`, payload },
      parentOriginRef.current,
    )
  }, [])

  // postMessage handshake with parent widget
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'develop:init') {
        parentOriginRef.current = event.origin
        window.parent.postMessage(
          { type: 'develop:ready', botSlug: slug },
          event.origin,
        )
      }
    }
    window.addEventListener('message', handleMessage)
    window.parent.postMessage({ type: 'develop:init-request' }, '*')
    return () => window.removeEventListener('message', handleMessage)
  }, [slug])

  // Detect lead captures in tool calls
  useEffect(() => {
    for (const msg of chatbot.messages) {
      if (!msg.toolCalls) continue
      for (const tc of msg.toolCalls) {
        if (
          tc.toolName === 'capture_lead' &&
          !seenToolCallIds.current.has(tc.toolCallId)
        ) {
          seenToolCallIds.current.add(tc.toolCallId)
          notifyParent('lead-captured', tc.input)
        }
      }
    }
  }, [chatbot.messages, notifyParent])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatbot.messages, chatbot.isStreaming])

  const handleNavigate = useCallback(
    (path: string) => notifyParent('navigate', { path }),
    [notifyParent],
  )

  const send = useCallback(() => {
    const text = input.trim()
    if (!text || chatbot.isStreaming || chatbot.degradedInfo) return
    // First real user gesture inside the iframe — unlocks the message chime.
    sounds.markInteraction()
    chatbot.sendMessage(text)
    notifyParent('message-sent')
    setInput('')
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }
  }, [input, chatbot, notifyParent, sounds])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const isThinking = chatbot.isStreaming
  const isDegraded = chatbot.degradedInfo !== null
  const inputDisabled = isThinking || isDegraded

  if (chatbot.isLoading || !chatbot.config) {
    return (
      <div
        style={{
          width: '100%',
          height: '100dvh',
          background: 'linear-gradient(180deg, #0b0e1c 0%, #060812 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.div
          style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(6,182,212,0.6)',
          }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
    )
  }

  const config = chatbot.config

  return (
    <div
      style={{
        width: '100%',
        // 100dvh ajusta al viewport dinámico (teclado virtual abierto/cerrado).
        // Sin esto, el input quedaba detrás del teclado en iOS/Android.
        height: '100dvh',
        background: 'linear-gradient(180deg, rgba(11,14,28,1) 0%, rgba(6,8,18,1) 100%)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
          flexShrink: 0,
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '1px',
            background:
              'linear-gradient(90deg, transparent, rgba(6,182,212,0.65) 35%, rgba(124,58,237,0.5) 65%, transparent)',
          }}
        />

        {/* Bot avatar mini */}
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            flexShrink: 0,
            background:
              'radial-gradient(circle at 38% 35%, rgba(6,182,212,0.95) 0%, rgba(6,182,212,0.55) 45%, rgba(6,182,212,0.18) 100%)',
            border: '1px solid rgba(6,182,212,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(6,182,212,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
          }}
        >
          <svg width="22" height="20" viewBox="0 0 22 20" fill="none">
            <ellipse
              cx="7" cy="9" rx="2" ry={isThinking ? 0.4 : 2}
              fill="white" fillOpacity="0.95"
              style={{ filter: 'drop-shadow(0 0 3px rgba(6,182,212,0.8))' }}
            />
            <ellipse
              cx="15" cy="9" rx="2" ry={isThinking ? 0.4 : 2}
              fill="white" fillOpacity="0.95"
              style={{ filter: 'drop-shadow(0 0 3px rgba(6,182,212,0.8))' }}
            />
            <path
              d={isThinking ? 'M 7 15 Q 11 14 15 15' : 'M 7 15 Q 11 18 15 15'}
              stroke="white" strokeOpacity="0.85" strokeWidth="1.5"
              strokeLinecap="round" fill="none"
              style={{ filter: 'drop-shadow(0 0 2px rgba(6,182,212,0.6))' }}
            />
          </svg>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              letterSpacing: '0.01em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {config.botName}
          </p>
          <p style={{ fontSize: '11px', margin: 0, color: isThinking ? 'rgba(120,160,255,0.7)' : 'rgba(80,220,130,0.6)' }}>
            {isThinking ? 'Pensando...' : '🟢 Disponible ahora'}
          </p>
        </div>

        <button
          onClick={sounds.toggleMute}
          aria-label={sounds.muted ? 'Activar sonido' : 'Silenciar'}
          aria-pressed={sounds.muted}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
        >
          {sounds.muted ? (
            <VolumeX size={14} strokeWidth={1.5} />
          ) : (
            <Volume2 size={14} strokeWidth={1.5} />
          )}
        </button>

        <button
          onClick={() => notifyParent('close')}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 200ms',
            flexShrink: 0,
          }}
          aria-label="Cerrar chat"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.1) transparent',
          overscrollBehavior: 'contain',
        }}
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        role="log"
        aria-live="polite"
      >
        <AnimatePresence initial={false}>
          {chatbot.messages.length === 0 ? (
            <div
              key="empty-state"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                gap: '14px',
                textAlign: 'center',
                paddingTop: '24px',
                opacity: 0.75,
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background:
                    'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(124,58,237,0.1))',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(6,182,212,0.08)',
                }}
              >
                <Sparkles size={20} strokeWidth={1.5} style={{ color: 'rgba(6,182,212,0.8)' }} />
              </div>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  maxWidth: '220px',
                  margin: 0,
                  lineHeight: 1.6,
                }}
              >
                {config.welcomeMessage}
              </p>

              {config.quickReplies && config.quickReplies.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    justifyContent: 'center',
                    marginTop: '4px',
                  }}
                >
                  {config.quickReplies.map((qr) => (
                    <button
                      key={qr.label}
                      onClick={() => chatbot.sendMessage(qr.promptToSend)}
                      style={{
                        background: 'rgba(6,182,212,0.08)',
                        border: '1px solid rgba(6,182,212,0.22)',
                        color: 'rgba(200,240,255,0.85)',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        lineHeight: 1.35,
                        transition: 'all 150ms',
                      }}
                    >
                      {qr.emoji && <span style={{ marginRight: '5px' }}>{qr.emoji}</span>}
                      {qr.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            chatbot.messages.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                {m.content && (
                  <div
                    style={{
                      maxWidth: '86%',
                      padding: '10px 14px',
                      fontSize: '13px',
                      lineHeight: 1.65,
                      ...(m.role === 'user'
                        ? {
                            background:
                              'linear-gradient(135deg, rgba(6,182,212,0.18) 0%, rgba(124,58,237,0.12) 100%)',
                            border: '1px solid rgba(6,182,212,0.28)',
                            borderRadius: '18px 6px 18px 18px',
                            color: 'rgba(255,255,255,0.94)',
                            boxShadow: '0 4px 16px rgba(6,182,212,0.1)',
                          }
                        : {
                            background: 'rgba(255,255,255,0.038)',
                            borderTop: '1px solid rgba(255,255,255,0.08)',
                            borderRight: '1px solid rgba(255,255,255,0.08)',
                            borderBottom: '1px solid rgba(255,255,255,0.08)',
                            borderLeft: '2px solid rgba(6,182,212,0.38)',
                            borderRadius: '6px 18px 18px 18px',
                            color: 'rgba(255,255,255,0.88)',
                          }),
                    }}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p style={{ margin: 0 }}>{children}</p>,
                          code: ({ children }) => (
                            <code
                              style={{
                                background: 'rgba(255,255,255,0.08)',
                                color: '#4488ff',
                                padding: '2px 4px',
                                borderRadius: '4px',
                                fontSize: '11px',
                                fontFamily: 'monospace',
                              }}
                            >
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
                    </div>
                  </div>
                )}

                {m.toolCalls && m.toolCalls.length > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      width: '100%',
                      maxWidth: '90%',
                    }}
                  >
                    {m.toolCalls.map((tc) => (
                      <div key={tc.toolCallId}>
                        {renderToolCall(tc, config, {
                          onSelectWhatsapp: chatbot.triggerWhatsappHandoff,
                          onSelectCallback: chatbot.triggerCallbackHandoff,
                          onNavigate: handleNavigate,
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))
          )}

          {chatbot.degradedInfo && (
            <DegradedBanner key="degraded-banner" info={chatbot.degradedInfo} />
          )}
        </AnimatePresence>

        {/* MS-2: thinking dots FUERA del AnimatePresence — los inner dots tienen
            `animate` infinito que sobreescribe el opacity de exit del padre,
            dejando un residuo fantasma cuando el unmount es instantáneo (caso
            degradado: SDK termina al instante con stream vacío). Sin
            AnimatePresence el unmount es inmediato y limpio. */}
        {isThinking && !chatbot.degradedInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 2px' }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: `rgba(6,182,212,${0.5 + i * 0.15})`,
                  boxShadow: '0 0 4px rgba(6,182,212,0.4)',
                }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.18,
                }}
              />
            ))}
          </div>
        )}

        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>

      {/* Input */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.018)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            flex: 1,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            padding: '10px 14px',
            transition: 'border-color 200ms, box-shadow 200ms',
          }}
          onFocusCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(6,182,212,0.35)'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(6,182,212,0.08)'
          }}
          onBlurCapture={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              e.currentTarget.style.height = 'auto'
              e.currentTarget.style.height = e.currentTarget.scrollHeight + 'px'
            }}
            onKeyDown={handleKeyDown}
            placeholder={isDegraded ? 'Continuá la conversación por WhatsApp' : 'Escribí tu consulta...'}
            disabled={inputDisabled}
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
              fontFamily: 'inherit',
              lineHeight: 1.55,
              minHeight: '20px',
              maxHeight: '80px',
              overflow: 'auto',
            }}
          />
        </div>

        <motion.button
          onClick={send}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.94 }}
          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          disabled={inputDisabled || !input.trim()}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid rgba(6,182,212,0.2)',
            cursor: inputDisabled || !input.trim() ? 'not-allowed' : 'pointer',
            background:
              inputDisabled || !input.trim()
                ? 'rgba(255,255,255,0.05)'
                : 'linear-gradient(135deg, rgba(6,182,212,0.85), rgba(6,182,212,0.65))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow:
              inputDisabled || !input.trim()
                ? 'none'
                : '0 0 16px rgba(6,182,212,0.28), 0 2px 8px rgba(0,0,0,0.3)',
            transition: 'all 200ms',
            color:
              inputDisabled || !input.trim()
                ? 'rgba(255,255,255,0.2)'
                : 'rgba(255,255,255,0.95)',
          }}
          aria-label="Enviar mensaje"
        >
          <Send size={15} strokeWidth={2.25} />
        </motion.button>
      </div>
    </div>
  )
}
