'use client'

import React, { useState, useMemo, useRef } from 'react'
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

interface N8nNode {
  num: string
  type: string
  name: string
  detail?: string
}

interface N8nFlow {
  title: string
  nodes: N8nNode[]
  claudeNote: string
}

interface RubroContent {
  headline: string
  headlineAccent: string
  subhead: string
  automations: Automation[]
  mockupMessages: MockupMessage[]
  n8nFlow: N8nFlow
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
    n8nFlow: {
      title: 'Consulta & Venta — Comercio',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp Webhook', detail: 'mensaje entrante detectado' },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'interpreta intención del cliente' },
        { num: '03', type: 'HTTP', name: 'API de Stock', detail: 'consulta disponibilidad en tiempo real' },
        { num: '04', type: 'IF', name: 'Hay stock?', detail: 'bifurcación según disponibilidad' },
        { num: '05', type: 'MERCADOPAGO', name: 'Generar Link de Pago', detail: 'pago en 1 clic para el cliente' },
        { num: '06', type: 'WHATSAPP', name: 'Enviar Respuesta', detail: 'mensaje + link automático' },
      ],
      claudeNote: 'Claude entiende lenguaje natural y adapta la respuesta al tono del cliente',
    },
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
    n8nFlow: {
      title: 'Reservas Automáticas — Gastronomía',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp Webhook', detail: 'consulta de reserva entrante' },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'extrae fecha, hora y cantidad de personas' },
        { num: '03', type: 'GOOGLE SHEETS', name: 'Verificar Disponibilidad', detail: 'consulta agenda del restaurante' },
        { num: '04', type: 'GOOGLE SHEETS', name: 'Registrar Reserva', detail: 'agrega nombre, fecha y contacto' },
        { num: '05', type: 'WAIT', name: '24h antes del turno', detail: 'espera y envía recordatorio' },
        { num: '06', type: 'WHATSAPP', name: 'Confirmación + Recordatorio', detail: 'mensaje automático al cliente' },
      ],
      claudeNote: 'Claude extrae fecha, personas y nombre del texto libre sin formularios',
    },
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
    n8nFlow: {
      title: 'Agenda Inteligente — Salud',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp Webhook', detail: 'solicitud de turno detectada' },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'clasifica urgencia y tipo de consulta' },
        { num: '03', type: 'GOOGLE CALENDAR', name: 'Buscar Disponibilidad', detail: 'horarios libres del profesional' },
        { num: '04', type: 'WHATSAPP', name: 'Ofrecer Opciones', detail: 'envía 2-3 horarios disponibles' },
        { num: '05', type: 'GOOGLE CALENDAR', name: 'Confirmar Turno', detail: 'crea el evento automáticamente' },
        { num: '06', type: 'WAIT + WHATSAPP', name: 'Recordatorio 1h antes', detail: 'reduce el 60% de ausencias' },
      ],
      claudeNote: 'Claude detecta síntomas de urgencia y prioriza la atención automáticamente',
    },
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
    n8nFlow: {
      title: 'Calificación de Leads — Servicios',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp / Form Webhook', detail: 'lead entrante de cualquier canal' },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'califica intención y presupuesto estimado' },
        { num: '03', type: 'IF', name: 'Lead calificado?', detail: 'filtra antes de que llegue al equipo' },
        { num: '04', type: 'HTTP', name: 'Generar Propuesta PDF', detail: 'documento personalizado por rubro' },
        { num: '05', type: 'WHATSAPP', name: 'Enviar Propuesta', detail: 'en menos de 5 minutos automático' },
        { num: '06', type: 'WAIT + WHATSAPP', name: 'Seguimiento automático', detail: '+35% tasa de cierre con recordatorios' },
      ],
      claudeNote: 'Claude redacta propuestas personalizadas según el rubro y tamaño del cliente',
    },
  },
}

type GraphPoint = { x: number; y: number }

const neuralLayouts: Record<number, GraphPoint[]> = {
  0: [
    { x: 8, y: 33 },
    { x: 27, y: 16 },
    { x: 32, y: 50 },
    { x: 52, y: 30 },
    { x: 74, y: 20 },
    { x: 79, y: 46 },
  ],
  1: [
    { x: 10, y: 35 },
    { x: 24, y: 19 },
    { x: 33, y: 49 },
    { x: 50, y: 33 },
    { x: 71, y: 15 },
    { x: 72, y: 49 },
  ],
  2: [
    { x: 9, y: 33 },
    { x: 30, y: 15 },
    { x: 27, y: 50 },
    { x: 53, y: 33 },
    { x: 69, y: 18 },
    { x: 77, y: 47 },
  ],
  3: [
    { x: 8, y: 36 },
    { x: 25, y: 15 },
    { x: 33, y: 51 },
    { x: 54, y: 30 },
    { x: 72, y: 14 },
    { x: 70, y: 49 },
  ],
}

const neuralOutputByRubro: Record<number, GraphPoint> = {
  0: { x: 92, y: 34 },
  1: { x: 91, y: 31 },
  2: { x: 92, y: 36 },
  3: { x: 91, y: 30 },
}

const neuralEdgeBendsByRubro: Record<number, number[]> = {
  0: [-7, 5, -5, 7, -6, 6, -2, 4],
  1: [-4, 9, -7, 5, -2, 7, -5, 3],
  2: [-8, 4, -4, 8, -6, 5, -3, 6],
  3: [-3, 8, -8, 4, -5, 7, -4, 3],
}

const neuralEdges = [
  { from: 0, to: 1, delay: 0.1 },
  { from: 0, to: 2, delay: 0.45 },
  { from: 1, to: 3, delay: 0.9 },
  { from: 2, to: 3, delay: 1.25 },
  { from: 3, to: 4, delay: 1.7 },
  { from: 3, to: 5, delay: 2.05 },
  { from: 4, toOutput: true, delay: 2.4 },
  { from: 5, toOutput: true, delay: 2.75 },
] as const

const seededUnit = (seed: number) => {
  const raw = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return raw - Math.floor(raw)
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
        className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-4"
        style={{ letterSpacing: '-0.03em' }}
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
              boxShadow: isActive
                ? `0 0 20px rgba(${r.colorRgb}, 0.18), 0 8px 24px rgba(${r.colorRgb}, 0.1), 0 2px 8px rgba(0,0,0,0.2)`
                : '0 2px 6px rgba(0,0,0,0.1)',
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
                {/* Ambient glow below tab */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    bottom: '-12px',
                    left: '10%', right: '10%',
                    height: '20px',
                    background: `radial-gradient(ellipse, rgba(${r.colorRgb},0.35) 0%, transparent 70%)`,
                    filter: 'blur(6px)',
                  }}
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
          <h3 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-[1.05] mb-5 pr-4"
            style={{ letterSpacing: '-0.03em' }}
          >
            {content.headline}{' '}
            <span style={{ color: rubro.color }}>{content.headlineAccent}</span>
          </h3>
          <p className="text-white/45 text-base md:text-lg max-w-lg leading-[1.75]">
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
              className="group relative flex items-start gap-5 p-5 rounded-2xl transition-all duration-200 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.025]"
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

function NeuralFlowMini({
  flow,
  rubro,
  reducedMotion,
}: {
  flow: N8nFlow
  rubro: Rubro
  reducedMotion: boolean | null
}) {
  const layout = neuralLayouts[rubro.id] ?? neuralLayouts[0]
  const output = neuralOutputByRubro[rubro.id] ?? neuralOutputByRubro[0]
  const points = flow.nodes.slice(0, 6).map((node, index) => ({
    node,
    point: layout[index] ?? { x: 8 + index * 13, y: 34 },
  }))

  const edgeBends = neuralEdgeBendsByRubro[rubro.id] ?? neuralEdgeBendsByRubro[0]
  const edgePaths = neuralEdges.map((edge, index) => {
    const from = points[edge.from]?.point
    const to = edge.toOutput ? output : points[edge.to]?.point
    if (!from || !to) return null
    const cx = (from.x + to.x) / 2
    const cy = (from.y + to.y) / 2 + edgeBends[index % edgeBends.length]
    return {
      key: `${rubro.id}-edge-${index}`,
      from,
      to,
      delay: edge.delay,
      path: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
    }
  }).filter((edge): edge is NonNullable<typeof edge> => Boolean(edge))

  const shortLabel = (text: string) => {
    const compact = text.split(' ')[0] ?? text
    return compact.length > 10 ? compact.slice(0, 10) : compact
  }

  return (
    <div
      style={{
        margin: '6px 20px 12px',
        borderRadius: '16px',
        background: `radial-gradient(130% 120% at 10% 0%, rgba(${rubro.colorRgb},0.16), rgba(255,255,255,0.01) 45%, rgba(0,0,0,0.15) 100%)`,
        border: `1px solid rgba(${rubro.colorRgb},0.24)`,
        padding: '12px 10px 12px',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 30px rgba(${rubro.colorRgb},0.12)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
        <span style={{ fontSize: '8.8px', letterSpacing: '0.14em', color: `rgba(${rubro.colorRgb},0.96)`, fontWeight: 800 }}>
          MAPA DE EJECUCION N8N
        </span>
        <span style={{ fontSize: '8.3px', letterSpacing: '0.09em', color: 'rgba(255,255,255,0.52)', fontWeight: 700 }}>
          flujo neuronal en vivo
        </span>
      </div>

      <svg viewBox="0 0 100 62" style={{ width: '100%', height: '170px', display: 'block' }} aria-hidden="true">
        <defs>
          <linearGradient id={`line-${rubro.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${rubro.colorRgb},0.08)`} />
            <stop offset="35%" stopColor={`rgba(${rubro.colorRgb},0.36)`} />
            <stop offset="60%" stopColor={`rgba(${rubro.colorRgb},0.8)`} />
            <stop offset="100%" stopColor={`rgba(${rubro.colorRgb},0.1)`} />
          </linearGradient>
          <filter id={`glow-${rubro.id}`}>
            <feGaussianBlur stdDeviation="1.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {edgePaths.map((edgePath) => (
          <g key={edgePath.key}>
            <path
              d={edgePath.path}
              stroke={`rgba(${rubro.colorRgb},0.18)`}
              strokeWidth="0.9"
              fill="none"
            />
            <motion.path
              d={edgePath.path}
              stroke={`url(#line-${rubro.id})`}
              strokeWidth="1.25"
              fill="none"
              strokeLinecap="round"
              filter={`url(#glow-${rubro.id})`}
              animate={reducedMotion ? { opacity: 0.7 } : { opacity: [0.35, 0.95, 0.5] }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.6, ease: 'easeInOut', repeat: Infinity, delay: edgePath.delay * 0.5 }}
            />
            {!reducedMotion && (
              <>
                <circle r="1.15" fill={`rgba(${rubro.colorRgb},0.98)`} filter={`url(#glow-${rubro.id})`}>
                  <animateMotion
                    dur="2.4s"
                    begin={`${edgePath.delay}s`}
                    repeatCount="indefinite"
                    path={edgePath.path}
                  />
                </circle>
                <circle r="0.8" fill="rgba(255,255,255,0.9)">
                  <animateMotion
                    dur="2.4s"
                    begin={`${edgePath.delay}s`}
                    repeatCount="indefinite"
                    path={edgePath.path}
                  />
                </circle>
              </>
            )}
          </g>
        ))}

        {points.map(({ node, point }, index) => (
          <g key={`${rubro.id}-node-${index}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6.3"
              fill={`rgba(${rubro.colorRgb},0.08)`}
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="4.6"
              fill="rgba(8,8,16,0.96)"
              stroke={`rgba(${rubro.colorRgb},0.75)`}
              strokeWidth="0.9"
            />
            <motion.circle
              cx={point.x}
              cy={point.y}
              r="1.8"
              fill={`rgba(${rubro.colorRgb},0.98)`}
              filter={`url(#glow-${rubro.id})`}
              animate={reducedMotion ? { opacity: 0.85 } : { opacity: [0.6, 1, 0.65] }}
              transition={reducedMotion ? { duration: 0 } : { duration: 1.8, ease: 'easeInOut', repeat: Infinity, delay: index * 0.14 }}
            />
            <text
              x={point.x}
              y={point.y + 0.6}
              textAnchor="middle"
              style={{ fontSize: '2.45px', fill: 'rgba(255,255,255,0.97)', fontWeight: 900, letterSpacing: '0.04em', paintOrder: 'stroke fill', stroke: 'rgba(8,8,16,0.95)', strokeWidth: '0.3px' }}
            >
              {node.num}
            </text>
            <rect
              x={point.x - 6.8}
              y={point.y + 6.2}
              width="13.6"
              height="4.1"
              rx="1.8"
              fill="rgba(8,8,16,0.86)"
              stroke={`rgba(${rubro.colorRgb},0.4)`}
              strokeWidth="0.36"
            />
            <text
              x={point.x}
              y={point.y + 9.02}
              textAnchor="middle"
              style={{ fontSize: '1.78px', fill: 'rgba(255,255,255,0.82)', letterSpacing: '0.09em', fontWeight: 800, paintOrder: 'stroke fill', stroke: 'rgba(8,8,16,0.9)', strokeWidth: '0.22px' }}
            >
              {shortLabel(node.type).toUpperCase()}
            </text>
          </g>
        ))}

        <g>
          <circle
            cx={output.x}
            cy={output.y}
            r="7.2"
            fill={`rgba(${rubro.colorRgb},0.18)`}
          />
          <circle
            cx={output.x}
            cy={output.y}
            r="5.4"
            fill="rgba(8,8,16,0.95)"
            stroke={`rgba(${rubro.colorRgb},0.96)`}
            strokeWidth="1.1"
          />
          <motion.circle
            cx={output.x}
            cy={output.y}
            r="2.3"
            fill={`rgba(${rubro.colorRgb},1)`}
            filter={`url(#glow-${rubro.id})`}
            animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.65, 1, 0.72], scale: [1, 1.08, 1] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.9, ease: 'easeInOut', repeat: Infinity }}
          />
          <text
            x={output.x}
            y={output.y + 10.2}
            textAnchor="middle"
            style={{ fontSize: '2.38px', fill: 'rgba(255,255,255,0.92)', letterSpacing: '0.12em', fontWeight: 900, paintOrder: 'stroke fill', stroke: 'rgba(8,8,16,0.95)', strokeWidth: '0.26px' }}
          >
            RESULTADO
          </text>
        </g>
      </svg>
    </div>
  )
}

function N8nFlowBlock({
  rubro,
  reducedMotion,
}: {
  rubro: Rubro
  reducedMotion: boolean | null
}) {
  const content = rubroContent[rubro.id]
  const flow = content.n8nFlow

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rubro.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[400px] mx-auto"
        style={{
          borderRadius: '24px',
          background: 'rgba(8,8,16,0.95)',
          border: `1px solid rgba(${rubro.colorRgb}, 0.15)`,
          boxShadow: `0 0 60px rgba(${rubro.colorRgb}, 0.08), 0 24px 64px rgba(0,0,0,0.5)`,
          overflow: 'hidden',
          fontFamily: 'ui-monospace, monospace',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: `1px solid rgba(${rubro.colorRgb}, 0.1)`,
            background: `rgba(${rubro.colorRgb}, 0.05)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', color: `rgba(${rubro.colorRgb},0.9)`, fontWeight: 700, letterSpacing: '0.1em' }}>
              ⚡ n8n
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>
              {flow.title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '5px' }}>
            {['rgba(239,68,68,0.6)', 'rgba(245,158,11,0.6)', 'rgba(34,197,94,0.6)'].map((c, i) => (
              <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: c }} />
            ))}
          </div>
        </div>

        <NeuralFlowMini flow={flow} rubro={rubro} reducedMotion={reducedMotion} />

        {/* Nodes */}
        <div style={{ padding: '8px 20px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {flow.nodes.map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.15)', minWidth: '20px' }}>{node.num}</span>
              <span
                style={{
                  fontSize: '8px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: `rgba(${rubro.colorRgb}, 0.12)`,
                  color: `rgba(${rubro.colorRgb}, 0.9)`,
                  border: `1px solid rgba(${rubro.colorRgb}, 0.2)`,
                  whiteSpace: 'nowrap',
                  minWidth: '70px',
                  textAlign: 'center',
                }}
              >
                {node.type}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 600, lineHeight: 1.2 }}>{node.name}</div>
                {node.detail && (
                  <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.25)', marginTop: '2px', lineHeight: 1.2 }}>{node.detail}</div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Connector line visual */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px' }}>
            <div style={{ width: '1px', height: '20px', background: `linear-gradient(to bottom, rgba(${rubro.colorRgb},0.3), transparent)`, marginLeft: '19px' }} />
          </div>

          {/* Claude note */}
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(100,60,255,0.06)',
              border: '1px solid rgba(100,60,255,0.15)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span style={{ fontSize: '12px', flexShrink: 0 }}>🤖</span>
            <div>
              <span style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(139,92,246,0.8)', letterSpacing: '0.1em', display: 'block', marginBottom: '2px' }}>CLAUDE AI</span>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{flow.claudeNote}</span>
            </div>
          </div>
        </div>
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
  const particles = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => {
        const s1 = seededUnit(i + 1.17)
        const s2 = seededUnit(i + 2.31)
        const s3 = seededUnit(i + 3.49)
        const s4 = seededUnit(i + 4.87)
        const s5 = seededUnit(i + 6.11)
        return {
          x: 8 + s1 * 84,
          y: 6 + s2 * 88,
          size: 2 + s3 * 3,
          duration: 4 + s4 * 4,
          delay: s5 * 3,
        }
      }),
    []
  )

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

          {/* Right column: flujo n8n */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-center lg:justify-start">
              <div
                className="relative px-4 py-2 rounded-xl text-xs font-bold tracking-wider"
                style={{
                  background: `rgba(${rubro.colorRgb}, 0.1)`,
                  border: `1px solid rgba(${rubro.colorRgb}, 0.25)`,
                  color: rubro.color,
                }}
              >
                Flujo n8n
              </div>
            </div>

            <N8nFlowBlock rubro={rubro} reducedMotion={reducedMotion} />
          </div>
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

