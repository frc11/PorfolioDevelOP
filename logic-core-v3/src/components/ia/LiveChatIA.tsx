'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'
import { Bolt, Clock3, FileCheck2, MessageSquareText, ShieldCheck } from 'lucide-react'

// â”€â”€â”€ CONSTANTS & TYPES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MAX_MESSAGES = 10

const suggestions = [
  'Como puede la IA ayudar a mi restaurante?',
  'Cuanto cuesta implementar IA?',
  'En cuanto tiempo esta listo?',
  'Que es un agente IA?',
  'Pueden automatizar mi WhatsApp?',
  'Funciona para una clinica medica?',
]

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  id: number
  role: MessageRole
  content: string
  timestamp: Date
  streaming?: boolean
}

function AssistantAvatar({ size = 28, fontSize = 11 }: { size?: number; fontSize?: number }) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00ff88, #0fbf73)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: `${fontSize}px`,
        fontWeight: 800,
        letterSpacing: '0.04em',
        color: '#052e1d',
        flexShrink: 0,
      }}
    >
      DP
    </div>
  )
}

// â”€â”€â”€ COMPONENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
        <div style={{ marginBottom: '2px' }}>
          <AssistantAvatar size={28} fontSize={11} />
        </div>
      )}

      <div style={{
        maxWidth: '75%',
        padding: '12px 16px',
        borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        fontSize: '14px',
        lineHeight: 1.6,
        background: isUser
          ? 'linear-gradient(135deg, rgba(0,255,136,0.28), rgba(0,255,136,0.16))'
          : 'rgba(8,14,22,0.78)',
        border: isUser ? '1px solid rgba(0,255,136,0.42)' : '1px solid rgba(255,255,255,0.14)',
        color: isUser ? 'white' : 'rgba(255,255,255,0.94)',
        position: 'relative',
        backdropFilter: 'blur(12px) saturate(130%)',
        WebkitBackdropFilter: 'blur(12px) saturate(130%)',
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
  const stats = [
    { icon: Bolt, label: 'Atencion inmediata', value: '< 1 segundo' },
    { icon: ShieldCheck, label: 'Conversacion privada', value: 'Encriptada' },
    { icon: FileCheck2, label: 'Base operativa', value: 'Validada por DevelOP' },
    { icon: Clock3, label: 'Sin horarios', value: '24 / 7 / 365' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Principal Card */}
      <motion.div
        whileHover={shouldReduceMotion ? {} : {
          y: -4,
          scale: 1.012,
          borderColor: 'rgba(0,255,136,0.26)',
          boxShadow: '0 18px 34px rgba(0,0,0,0.38), 0 0 32px rgba(0,255,136,0.12)',
        }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        style={{
          background: 'linear-gradient(145deg, rgba(8,18,22,0.82), rgba(6,14,20,0.74))',
          border: '1px solid rgba(0,255,136,0.24)',
          borderRadius: '16px',
          padding: '24px',
          position: 'relative',
          overflow: 'hidden',
          cursor: 'inherit',
          backdropFilter: 'blur(16px) saturate(140%)',
          WebkitBackdropFilter: 'blur(16px) saturate(140%)',
        }}
      >
        <motion.div
          aria-hidden="true"
          initial={{ x: '-120%' }}
          whileHover={shouldReduceMotion ? {} : { x: '140%' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(110deg, transparent 35%, rgba(255,255,255,0.11) 50%, transparent 65%)',
            pointerEvents: 'none',
          }}
        />
        <p style={{
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'rgba(0,255,136,0.82)',
          margin: '0 0 12px',
          fontWeight: 600,
        }}>
          QUE ESTAS USANDO?
        </p>
        <h3 style={{ fontSize: '20px', fontWeight: 900, color: 'white', margin: '0 0 10px', lineHeight: 1.2, textShadow: '0 0 18px rgba(255,255,255,0.14)' }}>
          La misma IA que instalamos en negocios.
        </h3>
        <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.65, margin: 0 }}>
          No es una demo. Es un agente real entrenado sobre DevelOP y sus servicios.
          Exactamente asi funciona en un restaurante, medico o comercio.
        </p>
      </motion.div>

      {/* Tech Stats */}
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={shouldReduceMotion ? {} : {
            y: -3,
            scale: 1.01,
            borderColor: 'rgba(0,255,136,0.34)',
            boxShadow: '0 14px 28px rgba(0,0,0,0.32), 0 0 22px rgba(0,255,136,0.1)',
            background: 'rgba(0,255,136,0.1)',
          }}
          transition={{
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
            opacity: { delay: 0.3 + i * 0.08, duration: 0.5 },
            x: { delay: 0.3 + i * 0.08, duration: 0.5 },
            y: { type: 'spring', stiffness: 380, damping: 26 },
            scale: { type: 'spring', stiffness: 380, damping: 26 },
            borderColor: { duration: 0.18 },
            boxShadow: { duration: 0.18 },
            background: { duration: 0.18 },
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            background: 'linear-gradient(145deg, rgba(8,14,22,0.82), rgba(7,12,20,0.7))',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'inherit',
            backdropFilter: 'blur(12px) saturate(130%)',
            WebkitBackdropFilter: 'blur(12px) saturate(130%)',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: '2px',
              background: 'linear-gradient(180deg, rgba(0,255,136,0.7), rgba(15,191,115,0.2))',
            }}
          />
          <div
            style={{
              width: '22px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              flexShrink: 0,
            }}
          >
            <stat.icon size={17} strokeWidth={2.2} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', margin: '0 0 2px' }}>{stat.label}</p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0, textShadow: '0 0 14px rgba(255,255,255,0.12)' }}>{stat.value}</p>
          </div>
        </motion.div>
      ))}

      {/* CTA WhatsApp */}
      <motion.a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola DevelOP, probe la IA en vivo y quiero implementarla en mi empresa')}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={shouldReduceMotion ? {} : {
          scale: 1.025,
          y: -2,
          boxShadow: '0 14px 34px rgba(37,211,102,0.34), 0 0 42px rgba(0,255,136,0.22)',
          filter: 'brightness(1.05)',
        }}
        whileTap={{ scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #25d366, #128c7e)',
          color: 'white',
          fontWeight: 700,
          fontSize: '14px',
          padding: '16px 24px',
          borderRadius: '100px',
          textDecoration: 'none',
          boxShadow: '0 0 30px rgba(37,211,102,0.25)',
          marginTop: '4px',
          border: '1px solid rgba(255,255,255,0.16)',
          cursor: 'default',
        }}
      >
        Quiero esto en mi negocio {'\u2192'}
      </motion.a>
    </div>
  )
}
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
          } catch {}
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => prev.map(m =>
        m.id === assistantId
          ? { ...m, content: 'Hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', streaming: false }
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
      background: 'transparent',
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
        background: 'radial-gradient(ellipse, rgba(15, 191, 115, 0.06) 0%, transparent 60%)',
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
            [ EN VIVO - PROBALO AHORA ]
          </div>
          <h2 style={{ fontSize: 'clamp(30px,4.5vw,58px)', fontWeight: 900, marginBottom: '16px', lineHeight: 1.1 }}>
            <span style={{ color: 'white', textShadow: '0 0 24px rgba(255,255,255,0.2)' }}>
              No te lo contamos.
            </span>
            <br />
            <span style={{ color: '#00ff88', textShadow: '0 0 26px rgba(0,255,136,0.45)' }}>
              Te lo demostramos.
            </span>
          </h2>
          <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.62)', margin: 0 }}>
            Habla con nuestra IA ahora mismo.<br />
            La misma que instalamos en tu negocio.<br />
            Pregunta lo que quieras.
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
              height: '2px', borderRadius: '100px', marginBottom: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.12)',
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
              background: 'linear-gradient(155deg, rgba(7,13,22,0.9), rgba(5,10,18,0.84))', border: '1px solid rgba(255,255,255,0.16)', borderRadius: '24px',
              overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '600px',
              boxShadow: '0 0 90px rgba(0,255,136,0.14), 0 32px 64px rgba(0,0,0,0.54)',
              backdropFilter: 'blur(18px) saturate(145%)',
              WebkitBackdropFilter: 'blur(18px) saturate(145%)',
            }}>
              {/* Chat Header */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)',
                display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(10,16,24,0.66)', flexShrink: 0
              }}>
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <AssistantAvatar size={40} fontSize={14} />
                  <div style={{
                    position: 'absolute', bottom: '1px', right: '1px', width: '10px', height: '10px',
                    borderRadius: '50%', background: '#00ff88', border: '2px solid #080810',
                    boxShadow: '0 0 6px rgba(0,255,136,0.8)', animation: 'pulse 2s infinite'
                  }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'white', margin: 0, textShadow: '0 0 14px rgba(255,255,255,0.14)' }}>Asistente IA - DevelOP</p>
                  <p style={{ fontSize: '11px', color: '#00ff88', margin: 0 }}>
                    {isLoading ? 'Escribiendo...' : '\u25CF En linea'}
                  </p>
                </div>
                <span className="hidden sm:inline-block" style={{
                  fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
                  background: 'rgba(0,255,136,0.18)', border: '1px solid rgba(0,255,136,0.34)',
                  color: 'rgba(167,243,208,0.95)', borderRadius: '100px', padding: '4px 10px'
                }}>
                  canal-atencion-pro
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
                          background: 'linear-gradient(135deg, rgba(0,255,136,0.15), rgba(15,191,115,0.15))',
                          border: '1px solid rgba(0,255,136,0.2)', display: 'flex', alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <MessageSquareText size={30} color='rgba(167,243,208,0.94)' strokeWidth={2.2} />
                      </motion.div>
                      <div>
                        <p style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(255,255,255,0.86)', margin: '0 0 6px' }}>Que queres automatizar?</p>
                        <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Preguntame sobre ventas, soporte y procesos</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', maxWidth: '380px' }}>
                        {suggestions.map((s, i) => (
                          <motion.button
                            key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                            onClick={() => handleSend(s)}
                            whileHover={{ scale: 1.02, borderColor: 'rgba(0,255,136,0.44)', background: 'rgba(0,255,136,0.12)' }}
                            whileTap={{ scale: 0.97 }}
                            style={{
                              background: 'rgba(8,14,22,0.74)', border: '1px solid rgba(255,255,255,0.16)',
                              borderRadius: '10px', padding: '10px 12px', fontSize: '12px', color: 'rgba(255,255,255,0.82)',
                              cursor: 'default', textAlign: 'left', lineHeight: 1.4, transition: 'all 200ms'
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
                       <AssistantAvatar size={28} fontSize={11} />
                       <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 4px', background: 'rgba(8,14,22,0.78)', border: '1px solid rgba(255,255,255,0.14)', display: 'flex', gap: '4px', alignItems: 'center' }}>
                         {[0, 1, 2].map(i => (
                           <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(0,255,136,0.85)', animation: `pulse 1s infinite ${i * 0.2}s` }} />
                         ))}
                       </div>
                     </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', gap: '10px', alignItems: 'center', flexShrink: 0, background: 'rgba(8,14,22,0.72)' }}>
                {messageCount >= MAX_MESSAGES ? (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: '13px', color: 'rgba(255,255,255,0.62)' }}>
                    Para continuar la conversacion,{' '}
                    <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Hola DevelOP, probe la IA en vivo y quiero implementarla en mi empresa')}`} style={{ color: '#00ff88', fontWeight: 600, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                      escribinos por WhatsApp {'\u2192'}
                    </a>
                  </div>
                ) : (
                  <>
                    <input
                      ref={inputRef} value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                      placeholder="Pregunta sobre automatizacion..."
                      disabled={isLoading}
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)',
                        borderRadius: '100px', padding: '12px 20px', fontSize: '14px', color: 'white', outline: 'none', transition: 'border-color 200ms'
                      }}
                    />
                    <button
                      onClick={() => handleSend()} disabled={isLoading || !input.trim()}
                      style={{
                        width: '42px', height: '42px', borderRadius: '50%', background: '#00ff88', color: '#080810',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', border: 'none',
                        cursor: 'default', transition: 'transform 200ms, opacity 200ms', opacity: (isLoading || !input.trim()) ? 0.5 : 1
                      }}
                    >{'\u2191'}</button>
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

