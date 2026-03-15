'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

/**
 * RUBROS AUTOMATION: "Soluciones por Rubro."
 * Permite al usuario elegir su sector y ver las automatizaciones específicas.
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
      { from: 'ai', text: '¡Sí! Stock disponible. $45.000 ¿La reservo?', delay: 900 },
      { from: 'client', text: 'Sí', delay: 1700 },
      { from: 'ai', text: 'Reservada ✓ Te mando el link de pago 📦', delay: 2500 },
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
      { from: 'ai', text: '¡Claro! ¿A qué nombre reservo?', delay: 800 },
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
      { from: 'ai', text: '¿Primera consulta o seguimiento?', delay: 800 },
      { from: 'client', text: 'Seguimiento', delay: 1500 },
      { from: 'ai', text: 'Miércoles 10hs o jueves 17hs ¿cuál te viene? 📋', delay: 2300 },
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

function Header() {
  return (
    <div className="text-center mb-10 md:mb-12">
      <div className="inline-flex items-center gap-2 border border-amber-500/30 rounded-full px-4 py-1.5 mb-6 bg-amber-500/5">
        <span className="text-[10px] md:text-[11px] font-mono tracking-[0.2em] text-amber-500 font-bold uppercase">
          [ AUTOMATIZACIONES POR RUBRO ]
        </span>
      </div>
      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
        Tu negocio automatizado.
      </h2>
      <p className="text-white/40 text-sm md:text-base max-w-xl mx-auto">
        Elegí tu rubro y mirá qué hace el sistema por vos. Diseñado para adaptarse
        a las necesidades específicas de tu industria.
      </p>
    </div>
  )
}

function TabSelector({
  rubros,
  active,
  setActive,
}: {
  rubros: Rubro[]
  active: number
  setActive: (id: number) => void
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-12 md:mb-20">
      {rubros.map((r) => {
        const isActive = active === r.id
        return (
          <button
            key={r.id}
            onClick={() => setActive(r.id)}
            className={`
              group relative flex items-center gap-3 px-6 py-3 rounded-full 
              transition-all duration-300 overflow-hidden
              ${isActive 
                ? 'bg-white/[0.05] border-white/20' 
                : 'bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04]'}
              border
            `}
          >
            {/* Background pill animation for active state */}
            {isActive && (
              <motion.div
                layoutId="activeTabRubro"
                className="absolute inset-0 z-0 bg-gradient-to-r opacity-10"
                style={{ background: r.gradient }}
              />
            )}
            
            <span className={`relative z-10 text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              {r.icon}
            </span>
            <span className={`
              relative z-10 font-bold tracking-wide transition-colors duration-300
              ${isActive ? 'text-white' : 'text-white/40 group-hover:text-white/60'}
            `}>
              {r.label}
            </span>

            {/* Underline for active state */}
            {isActive && (
              <motion.div
                layoutId="activeTabUnderlineRubro"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] rounded-full"
                style={{ background: r.color }}
              />
            )}
          </button>
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
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col gap-8"
      >
        <div>
          <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight mb-4 pr-4">
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
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.09 }}
              className="group relative flex items-start gap-5 p-5 rounded-2xl hover:bg-white/[0.02] transition-colors border-b border-white/[0.05] last:border-0"
            >
              <div 
                className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 text-xl shadow-lg"
                style={{ 
                   background: `rgba(${rubro.colorRgb}, 0.1)`,
                   border: `1px solid rgba(${rubro.colorRgb}, 0.2)`,
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
                      background: `rgba(${rubro.colorRgb}, 0.1)`, 
                      color: rubro.color,
                      border: `1px solid rgba(${rubro.colorRgb}, 0.2)`
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

function ChatMockup({ rubro }: { rubro: Rubro }) {
  const [messages, setMessages] = useState<MockupMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const content = rubroContent[rubro.id]

  useEffect(() => {
    setMessages([])
    setIsTyping(false)
    const timers: ReturnType<typeof setTimeout>[] = []

    content.mockupMessages.forEach((msg, idx) => {
      // Delay to show messages with a gap
      const t = setTimeout(() => {
        if (msg.from === 'ai') {
          setIsTyping(true)
          const t2 = setTimeout(() => {
            setIsTyping(false)
            setMessages((prev) => [...prev, msg])
          }, 800)
          timers.push(t2)
        } else {
          setMessages((prev) => [...prev, msg])
        }
      }, msg.delay)
      timers.push(t)
    })

    return () => timers.forEach(clearTimeout)
  }, [rubro.id, content.mockupMessages])

  return (
    <div 
      className="w-full h-[540px] rounded-[32px] bg-white/[0.03] border border-white/[0.08] relative overflow-hidden flex flex-col backdrop-blur-md transition-shadow duration-500"
      style={{ boxShadow: `0 0 60px rgba(${rubro.colorRgb}, 0.08)` }}
    >
      {/* Header del Chat */}
      <div className="px-6 py-4 border-b border-white/[0.08] bg-white/[0.03] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center text-sm shadow-inner"
            style={{ background: rubro.gradient }}
          >
            {rubro.icon}
          </div>
          <div>
            <h4 className="text-white text-xs font-bold font-mono tracking-wider uppercase leading-none mb-1.5">
              Chat con Cliente
            </h4>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: rubro.color }}
              />
              <span className="text-[10px] text-white/30 font-mono font-medium tracking-wide">AI ACTIVA</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
           <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
      </div>

      {/* Cuerpo del Chat */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {messages.map((m, idx) => (
             <motion.div
               key={`${rubro.id}-${idx}`}
               initial={{ opacity: 0, y: 10, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs md:text-sm leading-relaxed ${
                 m.from === 'client' 
                   ? 'ml-auto bg-amber-500 text-[#070709] font-bold rounded-tr-none' 
                   : 'mr-auto bg-white/[0.06] text-white border border-white/[0.1] rounded-tl-none font-medium'
               }`}
             >
               {m.text}
             </motion.div>
          ))}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mr-auto bg-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-none border border-white/[0.1] flex gap-1.5 items-center"
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-white/30"
                  style={{ animation: `typingDotAmber 1s infinite ${i * 0.2}s` }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer fake */}
      <div className="p-4 bg-white/[0.03] border-t border-white/[0.08]">
        <div className="bg-[#ffffff]/[0.02] border border-white/[0.08] rounded-full px-4 py-2.5 flex items-center justify-between text-white/10">
          <span className="text-[10px] font-mono tracking-widest uppercase">Escribiendo solución...</span>
          <div className="w-1.5 h-1.5 rounded-full bg-white/5" />
        </div>
      </div>

      <style jsx global>{`
        @keyframes typingDotAmber {
          0%, 100% { transform: translateY(0); opacity: 0.3; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function RubrosAutomation() {
  const [active, setActive] = useState(0)
  const rubro = rubros[active]

  return (
    <section className="relative w-full py-20 md:py-32 lg:py-40 px-6 sm:px-12 bg-[#080810] overflow-hidden z-[1]">
      {/* Glow ambiental del rubro activo */}
      <motion.div 
        key={rubro.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6 }}
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-80px', left: '50%',
          transform: 'translateX(-50%)',
          width: '700px', height: '450px',
          background: `radial-gradient(ellipse, rgba(${rubro.colorRgb}, 0.07) 0%, transparent 60%)`,
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="relative max-w-6xl mx-auto z-10">
        <Header />
        
        <TabSelector
          rubros={rubros}
          active={active}
          setActive={setActive}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mt-12 md:mt-16 items-start">
          <AutomationsPanel active={active} rubro={rubro} />
          <ChatMockup rubro={rubro} />
        </div>
      </div>
    </section>
  )
}
