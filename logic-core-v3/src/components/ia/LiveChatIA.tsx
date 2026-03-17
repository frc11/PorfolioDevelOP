'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

// ─── CONSTANTS & TYPES ───────────────────────────────────────────────────────

const MAX_MESSAGES = 10

const suggestions = [
  '¿Cómo puede la IA ayudar a mi restaurante?',
  '¿Cuánto cuesta implementar IA?',
  '¿En cuánto tiempo está listo?',
  '¿Qué es un agente IA?',
  '¿Pueden automatizar mi WhatsApp?',
  '¿Funciona para una clínica médica?',
]

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  timestamp: Date
  streaming?: boolean
}

// ─── COMPONENTS ──────────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        gap: '8px',
        alignItems: 'flex-end',
      }}
    >
      {!isUser && (
        <div style={{
          width: '28px', height: '28px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', flexShrink: 0, marginBottom: '2px',
        }}>
          🤖
        </div>
      )}

      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        fontSize: '14px',
        lineHeight: 1.6,
        background: isUser
          ? 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,255,136,0.1))'
          : 'rgba(255,255,255,0.06)',
        border: isUser ? '1px solid rgba(0,255,136,0.3)' : '1px solid rgba(255,255,255,0.08)',
        color: isUser ? 'white' : 'rgba(255,255,255,0.85)',
        position: 'relative',
      }}>
        {message.content}
        {message.streaming && (
          <span style={{
            display: 'inline-block',
            width: '2px', height: '14px',
            background: '#00ff88',
            marginLeft: '4px',
            verticalAlign: 'middle',
            animation: 'cursorBlink 0.7s ease-in-out infinite',
          }} />
        )}
      </div>
    </motion.div>
  )
}

function InfoPanel({ shouldReduceMotion }: { shouldReduceMotion: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Principal Card */}
      <div style={{
        background: 'rgba(0,255,136,0.04)',
        border: '1px solid rgba(0,255,136,0.12)',
        borderRadius: '16px',
        padding: '24px',
      }}>
        <p style={{
          fontSize: '11px', letterSpacing: '0.2em', color: 'rgba(0,255,136,0.6)',
          margin: '0 0 12px', fontWeight: 600,
        }}>¿QUÉ ESTÁS USANDO?</p>
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: '0 0 10px', lineHeight: 1.2 }}>
          La misma IA que instalamos en negocios.
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, margin: 0 }}>
          No es una demo. Es un agente real entrenado sobre DevelOP y sus servicios.
          Exactamente así funciona en un restaurante, médico o comercio.
        </p>
      </div>

      {/* Tech Stats */}
      {[
        { icon: '⚡', label: 'Atención inmediata', value: ' < 1 segundo' },
        { icon: '🔒', label: 'Conversación privada', value: 'Encriptada' },
        { icon: '🧠', label: 'Cerebro Digital', value: 'Entrenado por DevelOP' },
        { icon: '🌎', label: 'Sin horarios', value: '24 / 7 / 365' },
      ].map((stat, i) => (
        <motion.div
          key={i}
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{stat.icon}</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', margin: '0 0 2px' }}>{stat.label}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0 }}>{stat.value}</p>
          </div>
        </motion.div>
      ))}

      {/* CTA WhatsApp */}
      <motion.a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola DevelOP, probé la IA en vivo y quiero implementarla en mi empresa')}`}
        target="_blank" rel="noopener noreferrer"
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
          background: 'linear-gradient(135deg, #25d366, #128c7e)', color: 'white',
          fontWeight: 700, fontSize: '14px', padding: '16px 24px', borderRadius: '100px',
          textDecoration: 'none', boxShadow: '0 0 30px rgba(37,211,102,0.25)', marginTop: '4px',
        }}
      >
        💬 Quiero esto en mi negocio →
      </motion.a>
    </div>
  )
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function LiveChatIA() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion() ?? false

  const messageCount = messages.filter(m => m.role === 'user').length

  // Auto-scroll logic
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textOverride?: string) => {
    const trimmed = (textOverride ?? input).trim()
    if (!trimmed || isLoading || messageCount >= MAX_MESSAGES) return

    setHasStarted(true)
    setIsLoading(true)
    if (!textOverride) setInput('')

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, userMsg])

    const assistantId = Date.now() + 1
    const assistantMsg: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true,
    }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const history = messages
        .concat(userMsg)
        .map(m => ({ role: m.role, content: m.content }))
        .filter(m => m.content.trim() !== '')

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      })

      if (!response.ok) throw new Error('API error')
      if (!response.body) throw new Error('No body')

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter(l => l.trim())

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line)
            if (parsed.type === 'delta') {
              accumulated += parsed.text
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, content: accumulated } : m
              ))
            }
            if (parsed.type === 'done') {
              setMessages(prev => prev.map(m =>
                m.id === assistantId ? { ...m, streaming: false } : m
              ))
            }
          } catch (e) {}
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Hubo un error al procesar tu mensaje. Por favor intentá de nuevo.', streaming: false }
          : m
      ))
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <section ref={sectionRef} id="live-chat" style={{
      padding: 'clamp(80px,12vh,140px) clamp(20px,5vw,80px)',
      background: '#080810',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* ATMOSPHERE GLOWS */}
      <div aria-hidden="true" style={{
        position: 'absolute', top: '10%', left: '5%', width: '600px', height: '500px',
        background: 'radial-gradient(ellipse, rgba(0, 255, 136, 0.07) 0%, transparent 60%)',
        filter: 'blur(100px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', top: '20%', right: '0%', width: '400px', height: '400px',
        background: 'radial-gradient(ellipse, rgba(123, 47, 255, 0.06) 0%, transparent 60%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />
      <div aria-hidden="true" style={{
        position: 'absolute', bottom: '-50px', left: '50%', transform: 'translateX(-50%)', width: '800px', height: '200px',
        background: 'radial-gradient(ellipse, rgba(0, 255, 136, 0.04) 0%, transparent 65%)',
        filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0
      }} />

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* Header */}
        <motion.div
           initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
           animate={isInView ? { opacity: 1, y: 0 } : {}}
           transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
           style={{ textAlign: 'center', marginBottom: 'clamp(40px,6vh,64px)' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid rgba(0,255,136,0.3)', color: '#00ff88',
            padding: '6px 16px', borderRadius: '100px', fontSize: '11px',
            letterSpacing: '0.25em', fontWeight: 600, marginBottom: '24px',
            background: 'rgba(0,255,136,0.06)',
          }}>
            <div style={{
              width: '6px', height: '6px', borderRadius: '50%',
              background: '#00ff88',
              boxShadow: '0 0 8px rgba(0,255,136,0.8)',
              animation: 'pulse 1.5s ease-in-out infinite',
            }} />
            [ EN VIVO · PROBALO AHORA ]
          </div>
          <h2 style={{ fontSize: 'clamp(30px,4.5vw,58px)', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>
            <span style={{ color: 'white' }}>
              No te lo contamos.
            </span>
            <br />
            <span style={{ color: '#00ff88' }}>
              Te lo demostramos.
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
            Hablá con nuestra IA ahora mismo.<br />
            La misma que instalamos en tu negocio.<br />
            Preguntá lo que quieras.
          </p>
        </motion.div>

        {/* Chat Layout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-[clamp(24px,3vw,48px)] items-start">
          
          {/* Chat Column */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.98 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Real-time Activity Line */}
            <div style={{
              height: '2px', borderRadius: '100px', marginBottom: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.04)',
            }}>
              {isLoading && (
                <motion.div
                  initial={{ x: '-100%' }} animate={{ x: '100%' }}
                  transition={{ duration: 1.2, ease: 'easeInOut', repeat: Infinity }}
                  style={{
                    height: '100%', width: '40%', background: 'linear-gradient(90deg, transparent, #00ff88, transparent)', borderRadius: '100px',
                  }}
                />
              )}
            </div>

            {/* Chat Container */}
            <div style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px',
              overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px',
              boxShadow: '0 0 80px rgba(0,255,136,0.06), 0 32px 64px rgba(0,0,0,0.5)',
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', flexShrink: 0
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px'
                  }}>🤖</div>
                  <div style={{
                    position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px',
                    borderRadius: '50%', background: '#00ff88', border: '2px solid #080810',
                    boxShadow: '0 0 6px rgba(0,255,136,0.8)', animation: 'pulse 2s infinite'
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0 }}>Asistente IA · DevelOP</p>
                  <p style={{ fontSize: '11px', color: '#00ff88', margin: 0 }}>
                    {isLoading ? 'Escribiendo...' : '● En línea'}
                  </p>
                </div>
                <span className="hidden sm:inline-block" style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                  background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)',
                  color: 'rgba(0,255,136,0.7)', borderRadius: '100px', padding: '4px 10px'
                }}>
                  ia-vendedor-pro
                </span>
              </div>

              {/* Messages Area */}
              <div style={{
                flex: 1, overflowY: 'auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '12px',
                scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,255,136,0.2) rgba(255,255,255,0.03)'
              }}>
                <AnimatePresence>
                  {!hasStarted && messages.length === 0 && (
                    <motion.div
                      exit={{ opacity: 0, scale: 0.95 }}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '100%', gap: '24px', padding: '24px', textAlign: 'center'
                      }}
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                          width: '64px', height: '64px', borderRadius: '20px',
                          background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(123,47,255,0.15))',
                          border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '32px'
                        }}
                      >🧠</motion.div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', margin: '0 0 6px' }}>¿Qué querés automatizar?</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', margin: 0 }}>Preguntame lo que quieras sobre IA</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', maxWidth: '380px' }}>
                        {suggestions.map((s, i) => (
                          <motion.button
                            key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                            onClick={() => handleSend(s)}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,136,0.35)', background: 'rgba(0,255,136,0.06)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.55)',
                              cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'all 200ms'
                            }}
                          >
                            {s}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                  {messages.map(msg => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                       <div style={{
                         width: '28px', height: '28px', borderRadius: '50%',
                         background: 'linear-gradient(135deg, #00ff88, #7b2fff)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px'
                       }}>🤖</div>
                       <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                         {[0, 1, 2].map(i => (
                           <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,255,136,0.6)', animation: `pulse 1s infinite ${i * 0.2}s` }} />
                         ))}
                       </div>
                     </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.01)' }}>
                {messageCount >= MAX_MESSAGES ? (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
                    Para continuar la conversación,{' '}
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola DevelOP, probé la IA en vivo y quiero implementarla en mi empresa')}`} style={{ color: '#00ff88', fontWeight: 600, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      escribinos por WhatsApp →
                    </a>
                  </div>
                ) : (
                  <>
                    <input
                      ref={inputRef} value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Preguntá sobre automatización..."
                      disabled={isLoading}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '100px', padding: '12px 20px', fontSize: '14px', color: 'white', outline: 'none', transition: 'border-color 200ms'
                      }}
                    />
                    <button
                      onClick={() => handleSend()} disabled={isLoading || !input.trim()}
                      style={{
                        width: '42px', height: '42px', borderRadius: '50%', background: '#00ff88', color: '#080810',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: 'none',
                        cursor: 'pointer', transition: 'transform 200ms, opacity 200ms', opacity: (isLoading || !input.trim()) ? 0.5 : 1
                      }}
                    >↑</button>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Info Panel Column */}
          <InfoPanel shouldReduceMotion={shouldReduceMotion} />

        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.9); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </section>
  )
}
