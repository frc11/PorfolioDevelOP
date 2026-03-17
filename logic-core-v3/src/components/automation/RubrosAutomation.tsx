'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { motion, AnimatePresence, useInView, useReducedMotion } from 'motion/react'

/**
 * RUBROS AUTOMATION: "Soluciones por Rubro."
 * Permite al usuario elegir su sector y ver las automatizaciones específicas.
 * Finalizado con animaciones cinemáticas y partículas de fondo.
 */

// ─── TYPES ──────────────────────────────────────────────────────────────────

interface Rubro {
  id: number
  slug: string
  icon: string
  label: string
  color: string
  colorRgb: string
  gradient: string
}

interface Automation {
  icon: string
  title: string
  description: string
  metric: string
}

interface MockupMessage {
  from: 'client' | 'ai'
  text: string
  delay: number
}

interface RubroContent {
  headline: string
  headlineAccent: string
  subhead: string
  automations: Automation[]
  mockupMessages: MockupMessage[]
}

// ─── DATA ───────────────────────────────────────────────────────────────────

const rubros: Rubro[] = [
  { 
    id: 0, slug: 'comercio', icon: '🏪',
    label: 'Comercio',
    color: '#f59e0b', colorRgb: '245,158,11',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' 
  },
  { 
    id: 1, slug: 'gastronomia', icon: '🍽',
    label: 'Gastronomía',
    color: '#f97316', colorRgb: '249,115,22',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)' 
  },
  { 
    id: 2, slug: 'salud', icon: '🏥',
    label: 'Salud',
    color: '#22c55e', colorRgb: '34,197,94',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)' 
  },
  { 
    id: 3, slug: 'servicios', icon: '⚙️',
    label: 'Servicios',
    color: '#a855f7', colorRgb: '168,85,247',
    gradient: 'linear-gradient(135deg, #a855f7, #7b2fff)' 
  },
]

const rubroContent: Record<number, RubroContent> = {
  0: {
    headline: 'Tu comercio vende',
    headlineAccent: 'sin que estés.',
    subhead: 'Consultas de stock, precios y pedidos respondidos solos. A las 3AM si hace falta.',
    automations: [
      { 
        icon: '🛒',
        title: 'Consultas de productos',
        description: 'Stock y precios al instante por WhatsApp',
        metric: '−80% consultas manuales' 
      },
      { 
        icon: '📦',
        title: 'Seguimiento de pedidos',
        description: 'El cliente sabe dónde está su compra',
        metric: '−70% llamadas de seguimiento' 
      },
      { 
        icon: '🔄',
        title: 'Recuperación de carritos',
        description: 'Mensaje automático al comprador indeciso',
        metric: '↑ 25% conversión' 
      },
    ],
    mockupMessages: [
      { from: 'client', text: '¿Tienen la campera negra en M?', delay: 0 },
      { from: 'ai', text: '¡Sí! Stock disponible. $45.000 ¿La reservo?', delay: 800 },
      { from: 'client', text: 'Sí', delay: 1500 },
      { from: 'ai', text: 'Reservada ✓ Te mando el link de pago 📦', delay: 2300 },
    ],
  },
  1: {
    headline: 'Tu restaurante llena mesas',
    headlineAccent: 'solo.',
    subhead: 'Reservas, reseñas y fidelización en automático. Vos cocinás, el sistema gestiona.',
    automations: [
      { 
        icon: '📅',
        title: 'Reservas automáticas',
        description: 'Confirma y recuerda por WhatsApp 24/7',
        metric: '↑ 40% ocupación' 
      },
      { 
        icon: '⭐',
        title: 'Respuesta a reseñas',
        description: 'Google Reviews respondidas en 2 horas',
        metric: '↑ 0.8 estrellas promedio' 
      },
      { 
        icon: '🎂',
        title: 'Fidelización automática',
        description: 'Descuentos en cumpleaños y fechas especiales',
        metric: '×2 retorno de clientes' 
      },
    ],
    mockupMessages: [
      { from: 'client', text: '¿Tienen mesa para 4 el sábado a las 21?', delay: 0 },
      { from: 'ai', text: '¡Claro! Tenemos disponibilidad. ¿A qué nombre reservo?', delay: 800 },
      { from: 'client', text: 'García', delay: 1500 },
      { from: 'ai', text: 'Confirmado ✓ García · 4 personas · Sáb 21hs 🍽', delay: 2300 },
    ],
  },
  2: {
    headline: 'Tu consultorio sin',
    headlineAccent: 'caos.',
    subhead: 'Turnos, recordatorios y triaje automatizados. Llegás a atender, no a administrar.',
    automations: [
      { 
        icon: '📋',
        title: 'Agenda inteligente',
        description: 'Turnos por WhatsApp sin secretaria',
        metric: '−60% ausencias' 
      },
      { 
        icon: '💊',
        title: 'Recordatorio de medicación',
        description: 'Mensajes automáticos a pacientes crónicos',
        metric: '↑ adherencia al tratamiento' 
      },
      { 
        icon: '🚨',
        title: 'Triaje de urgencias',
        description: 'Detecta síntomas urgentes y prioriza',
        metric: '0 urgencias perdidas' 
      },
    ],
    mockupMessages: [
      { from: 'client', text: 'Necesito turno con el Dr. López', delay: 0 },
      { from: 'ai', text: '¿Es primera consulta o seguimiento?', delay: 800 },
      { from: 'client', text: 'Seguimiento', delay: 1500 },
      { from: 'ai', text: 'Perfecto. Miércoles 10hs o jueves 17hs ¿cuál te viene? 📋', delay: 2300 },
    ],
  },
  3: {
    headline: 'Tus servicios se venden',
    headlineAccent: 'mientras dormís.',
    subhead: 'Leads calificados, propuestas enviadas y seguimientos automáticos. Vos cerrás, el sistema prospecta.',
    automations: [
      { 
        icon: '🎯',
        title: 'Calificación de leads',
        description: 'Filtra intención real antes de llegar a vos',
        metric: '×3 leads calificados' 
      },
      { 
        icon: '📄',
        title: 'Envío de propuestas',
        description: 'Propuesta personalizada enviada en minutos',
        metric: '−80% tiempo de cotización' 
      },
      { 
        icon: '🔔',
        title: 'Seguimiento automático',
        description: 'Recordatorios hasta cerrar la venta',
        metric: '↑ 35% tasa de cierre' 
      },
    ],
    mockupMessages: [
      { from: 'client', text: '¿Cuánto cuesta un logo?', delay: 0 },
      { from: 'ai', text: 'Depende del proyecto. ¿Qué tipo de empresa tenés?', delay: 800 },
      { from: 'client', text: 'Una distribuidora', delay: 1500 },
      { from: 'ai', text: 'Perfecto, te mando 3 opciones adaptadas a tu rubro 📄', delay: 2300 },
    ],
  },
}

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function Header({ isInView, reducedMotion }: { isInView: boolean, reducedMotion: boolean | null }) {
  const startY = reducedMotion ? 0 : -16
  const startOpacity = reducedMotion ? 1 : 0

  return (
    <div className="flex flex-col items-center text-center mb-10 md:mb-12">
      <motion.div 
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 bg-amber-500/5"
      >
        <span className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] text-amber-500 font-bold uppercase">
          [ AUTOMATIZACIONES POR RUBRO ]
        </span>
      </motion.div>
      
      <motion.h2 
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4"
      >
        Tu negocio automatizado.
      </motion.h2>

      <motion.p 
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
        className="text-white/40 text-sm md:text-base max-w-xl mx-auto"
      >
        Elegí tu rubro y mirá qué hace el sistema por vos.
      </motion.p>

      {/* Social Proof Badge */}
      <motion.div
        initial={{ opacity: startOpacity, scale: reducedMotion ? 1 : 0.9 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-2 mt-8 backdrop-blur-sm"
      >
        <div className="flex">
          {[rubros[0].color, rubros[2].color, '#fff'].map((c, i) => (
            <div 
              key={i} 
              className="w-5 h-5 rounded-full border-2 border-[#080810] -ml-1.5 first:ml-0" 
              style={{ background: c }}
            />
          ))}
        </div>
        <span className="text-[11px] text-white/50 font-medium">
          <strong className="text-white font-bold tracking-tight">+89 empresas automatizadas</strong> en NOA
        </span>
      </motion.div>
    </div>
  )
}

function TabSelector({
  rubros,
  active,
  setActive,
  isInView,
  reducedMotion,
}: {
  rubros: Rubro[]
  active: number
  setActive: (id: number) => void
  isInView: boolean
  reducedMotion: boolean | null
}) {
  const startY = reducedMotion ? 0 : 20
  const startOpacity = reducedMotion ? 1 : 0

  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-20">
      {rubros.map((r, index) => {
        const isActive = active === r.id
        return (
          <motion.button
            key={r.id}
            initial={{ opacity: startOpacity, y: startY }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 + index * 0.07, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setActive(r.id)}
            whileHover={reducedMotion ? {} : { y: -2 }}
            whileTap={reducedMotion ? {} : { scale: 0.97 }}
            className={`
              group relative flex items-center gap-3 px-6 py-4 rounded-xl 
              transition-all duration-300 overflow-hidden
              ${isActive 
                ? 'bg-white/[0.08] border-white/20' 
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}
              border
            `}
            style={{ 
              boxShadow: isActive ? `0 0 20px rgba(${r.colorRgb}, 0.15)` : 'none'
            }}
          >
            {/* Background pill animation for active state */}
            {isActive && (
              <motion.div
                layoutId="activeTabRubro"
                className="absolute inset-0 z-0 bg-gradient-to-r opacity-10"
                style={{ background: r.gradient }}
              />
            )}
            
            <span className={`relative z-10 text-2xl transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              {r.icon}
            </span>
            <span className={`
              relative z-10 font-bold tracking-wide transition-colors duration-300
              ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'}
            `}>
              {r.label}
            </span>

            {/* Underline & Shimmer for active state */}
            {isActive && (
              <>
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmerTab 2s ease-in-out infinite'
                  }}
                />
                <motion.div
                  layoutId="activeTabUnderlineRubro"
                  className="absolute bottom-0 left-0 right-0 h-[2px] rounded-full"
                  style={{ background: r.gradient }}
                />
              </>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

function AutomationsPanel({ active, rubro }: { active: number, rubro: Rubro }) {
  const content = rubroContent[active]
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-8"
      >
        <div>
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 pr-4">
            {content.headline}{' '}
            <span style={{ color: rubro.color }}>{content.headlineAccent}</span>
          </h3>
          <p className="text-white/45 text-base md:text-lg max-w-lg leading-relaxed">
            {content.subhead}
          </p>
        </div>

        <div className="flex flex-col gap-1 mt-4">
          {content.automations.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.09, duration: 0.5, ease: 'easeOut' }}
              className="group relative flex items-start gap-5 p-5 rounded-2xl hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] last:border-0"
            >
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-xl shadow-lg"
                style={{ 
                   background: `rgba(${rubro.colorRgb}, 0.12)`,
                   border: `1px solid rgba(${rubro.colorRgb}, 0.22)`,
                   color: rubro.color
                }}
              >
                {item.icon}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                  <h4 className="text-white font-bold text-lg">{item.title}</h4>
                  <span 
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono tracking-wider"
                    style={{ 
                      background: `rgba(${rubro.colorRgb}, 0.12)`, 
                      color: rubro.color,
                      border: `1px solid rgba(${rubro.colorRgb}, 0.25)`
                    }}
                  >
                    {item.metric.toUpperCase()}
                  </span>
                </div>
                <p className="text-white/40 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function VisibleMessages({
    messages,
    rubro,
}: {
    messages: MockupMessage[]
    rubro: Rubro
}) {
    const [visible, setVisible] = useState<number[]>([])
    const [typing, setTyping] = useState(false)

    useEffect(() => {
        setVisible([])
        setTyping(false)

        const timers: ReturnType<typeof setTimeout>[] = []

        messages.forEach((msg, i) => {
            if (msg.from === 'ai') {
                timers.push(setTimeout(() => {
                    setTyping(true)
                }, msg.delay - 400))
            }

            timers.push(setTimeout(() => {
                setTyping(false)
                setVisible(prev => [...prev, i])
            }, msg.delay + 300))
        })

        return () => timers.forEach(clearTimeout)
    }, [messages, rubro.id])

    return (
        <>
            {messages.map((msg, i) => {
                if (!visible.includes(i)) return null
                const isAI = msg.from === 'ai'

                return (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
                    >
                        <div 
                          className={`
                            max-w-[78%] px-4 py-2.5 text-xs md:text-sm leading-relaxed
                            ${isAI 
                              ? 'rounded-tl-none rounded-2xl' 
                              : 'rounded-tr-none rounded-2xl bg-amber-500 text-[#070709] font-bold shadow-lg'}
                          `}
                          style={{
                            background: isAI ? `rgba(${rubro.colorRgb}, 0.12)` : undefined,
                            border: isAI ? `1px solid rgba(${rubro.colorRgb}, 0.2)` : undefined,
                            color: isAI ? 'white' : undefined,
                          }}
                        >
                            {msg.text}
                        </div>
                    </motion.div>
                )
            })}

            {/* Indicator typing... */}
            {typing && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                >
                    <div 
                      className="px-4 py-2.5 rounded-tl-none rounded-2xl flex gap-1.5 items-center"
                      style={{
                        background: `rgba(${rubro.colorRgb}, 0.08)`,
                        border: `1px solid rgba(${rubro.colorRgb}, 0.15)`,
                      }}
                    >
                        {[0, 1, 2].map(i => (
                            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{
                                background: rubro.color,
                                animation: `typingDotAmber 1.2s ${i * 0.2}s ease-in-out infinite`,
                            }} />
                        ))}
                    </div>
                </motion.div>
            )}
        </>
    )
}

function ChatMockup({ rubro }: { rubro: Rubro }) {
  const content = rubroContent[rubro.id]

  return (
    <AnimatePresence mode="wait">
        <motion.div 
          key={rubro.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] h-[540px] mx-auto rounded-[24px] bg-white/[0.03] border border-white/[0.08] relative overflow-hidden flex flex-col backdrop-blur-md transition-shadow duration-500"
          style={{ boxShadow: `0 0 60px rgba(${rubro.colorRgb}, 0.08), 0 24px 64px rgba(0,0,0,0.5)` }}
        >
          {/* Header del Chat */}
          <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.04] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-inner shrink-0"
                style={{ background: `linear-gradient(135deg, rgba(${rubro.colorRgb},0.8), rgba(${rubro.colorRgb},0.4))` }}
              >
                🤖
              </div>
              <div>
                <h4 className="text-white text-sm font-bold leading-none mb-1.5">
                  Asistente IA · DevelOP
                </h4>
                <div className="flex items-center gap-1.5">
                  <span 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: rubro.color }}
                  />
                  <span className="text-[11px]" style={{ color: rubro.color }}>En línea ahora</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
               <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
            </div>
          </div>

          {/* Cuerpo del Chat */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[260px]">
            <VisibleMessages
              messages={content.mockupMessages}
              rubro={rubro}
            />
          </div>

          {/* Input fake */}
          <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] flex gap-2.5 items-center">
            <div className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-full px-4 py-2.5 text-xs text-white/20">
              Escribí tu mensaje...
            </div>
            <div 
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0 cursor-pointer"
              style={{ background: `linear-gradient(135deg, ${rubro.color}, rgba(${rubro.colorRgb},0.6))` }}
            >
              ↑
            </div>
          </div>

          <style jsx global>{`
            @keyframes typingDotAmber {
              0%, 100% { transform: translateY(0); opacity: 0.3; }
              50% { transform: translateY(-3px); opacity: 1; }
            }
          `}</style>
        </motion.div>
    </AnimatePresence>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function RubrosAutomation() {
  const [active, setActive] = useState(0)
  const rubro = rubros[active]

  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const reducedMotion = useReducedMotion()

  // 8 Partículas de fondo usando el color del rubro activo
  const particles = useMemo(() => Array.from({ length: 8 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 4 + Math.random() * 4,
    delay: Math.random() * 3,
  })), [])

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#080810] overflow-hidden z-[1]"
    >
      {/* Background Particles */}
      {!reducedMotion && particles.map((p, i) => (
        <div 
          key={i} 
          className="absolute rounded-full pointer-events-none z-0"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: `${p.size}px`, height: `${p.size}px`,
            background: `rgba(${rubro.colorRgb}, 0.25)`,
            boxShadow: `0 0 ${p.size * 3}px rgba(${rubro.colorRgb}, 0.2)`,
            animation: `floatParticle ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
            transition: 'background 600ms, box-shadow 600ms'
          }} 
        />
      ))}

      {/* Glow ambiental — color del rubro activo */}
      <motion.div 
        key={rubro.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none z-0"
        style={{
          background: `radial-gradient(ellipse, rgba(${rubro.colorRgb}, 0.08) 0%, transparent 65%)`,
          filter: 'blur(80px)',
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header isInView={isInView} reducedMotion={reducedMotion} />
        
        <TabSelector
          rubros={rubros}
          active={active}
          setActive={setActive}
          isInView={isInView}
          reducedMotion={reducedMotion}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mt-12 md:mt-16 items-start">
          <AutomationsPanel active={active} rubro={rubro} />
          <ChatMockup rubro={rubro} />
        </div>

        {/* Separador Final Cinemático */}
        <motion.div
           initial={{ scaleX: reducedMotion ? 1 : 0 }}
           animate={(isInView || reducedMotion) ? { scaleX: 1 } : {}}
           transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
           className="h-[1px] w-full mt-20 md:mt-32"
           style={{
             background: `linear-gradient(90deg, transparent, rgba(${rubro.colorRgb}, 0.4), transparent)`,
             transformOrigin: 'left center',
             transition: 'background 600ms ease'
           }}
        />
      </div>

      <style jsx global>{`
        @keyframes shimmerTab {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes floatParticle {
          0% { transform: translate(0, 0); }
          100% { transform: translate(8px, -12px); }
        }
      `}</style>
    </section>
  )
}
