'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import {
  Bell,
  Bot,
  Cake,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  HeartPulse,
  Mail,
  MessageCircle,
  Monitor,
  Package,
  Pause,
  Pill,
  Play,
  RefreshCw,
  ShoppingCart,
  Star,
  Store,
  Target,
  UtensilsCrossed,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface Rubro {
  id: number
  slug: string
  icon: LucideIcon
  label: string
  color: string
  colorRgb: string
  gradient: string
}

interface Automation {
  icon: LucideIcon
  title: string
  description: string
  metric: string
}

interface N8nNode {
  num: string
  type: string
  name: string
  detail?: string
  icon: LucideIcon
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
  n8nFlow: N8nFlow
}

type GraphPoint = { x: number; y: number }
type ParticleSeed = { x: number; y: number; size: number; duration: number; delay: number }

const AUTO_ROTATION_MS = 8800

const rubros: Rubro[] = [
  {
    id: 0,
    slug: 'comercio',
    icon: Store,
    label: 'Comercio',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
  },
  {
    id: 1,
    slug: 'gastronomia',
    icon: UtensilsCrossed,
    label: 'Gastronomía',
    color: '#f97316',
    colorRgb: '249,115,22',
    gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
  },
  {
    id: 2,
    slug: 'salud',
    icon: HeartPulse,
    label: 'Salud',
    color: '#22c55e',
    colorRgb: '34,197,94',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
  },
  {
    id: 3,
    slug: 'servicios',
    icon: Wrench,
    label: 'Servicios',
    color: '#a855f7',
    colorRgb: '168,85,247',
    gradient: 'linear-gradient(135deg, #a855f7, #7b2fff)',
  },
]

const rubroContent: Record<number, RubroContent> = {
  0: {
    headline: 'Tu comercio vende',
    headlineAccent: 'sin que estés.',
    subhead: 'Consultas de stock, precios y pedidos respondidos solos. A las 3AM si hace falta.',
    automations: [
      {
        icon: ShoppingCart,
        title: 'Consultas de productos',
        description: 'Stock y precios al instante por WhatsApp',
        metric: '-80% consultas manuales',
      },
      {
        icon: Package,
        title: 'Seguimiento de pedidos',
        description: 'El cliente sabe dónde está su compra',
        metric: '-70% llamadas de seguimiento',
      },
      {
        icon: RefreshCw,
        title: 'Recuperación de carritos',
        description: 'Mensaje automático al comprador indeciso',
        metric: '+25% conversión',
      },
    ],
    n8nFlow: {
      title: 'Consulta & Venta - Comercio',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp Webhook', detail: 'mensaje entrante detectado', icon: MessageCircle },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'interpreta intención del cliente', icon: Bot },
        { num: '03', type: 'HTTP', name: 'API de Stock', detail: 'consulta disponibilidad en tiempo real', icon: Package },
        { num: '04', type: 'IF', name: 'Hay stock?', detail: 'bifurcación según disponibilidad', icon: CheckCircle2 },
        { num: '05', type: 'MERCADOPAGO', name: 'Generar Link de Pago', detail: 'pago en 1 clic para el cliente', icon: CreditCard },
        { num: '06', type: 'WHATSAPP', name: 'Enviar Respuesta', detail: 'mensaje + link automático', icon: Mail },
      ],
      claudeNote: 'Claude entiende lenguaje natural y adapta la respuesta al tono del cliente.',
    },
  },
  1: {
    headline: 'Tu restaurante llena mesas',
    headlineAccent: 'solo.',
    subhead: 'Reservas, reseñas y fidelización en automático. Vos cocinás, el sistema gestiona.',
    automations: [
      {
        icon: CalendarDays,
        title: 'Reservas automáticas',
        description: 'Confirma y recuerda por WhatsApp 24/7',
        metric: '+40% ocupación',
      },
      {
        icon: Star,
        title: 'Respuesta a reseñas',
        description: 'Google Reviews respondidas en 2 horas',
        metric: '+0.8 estrellas promedio',
      },
      {
        icon: Cake,
        title: 'Fidelización automática',
        description: 'Descuentos en cumpleaños y fechas especiales',
        metric: 'x2 retorno de clientes',
      },
    ],
    n8nFlow: {
      title: 'Reservas Automáticas - Gastronomía',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp Webhook', detail: 'consulta de reserva entrante', icon: MessageCircle },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'extrae fecha, hora y personas', icon: Bot },
        { num: '03', type: 'GOOGLE SHEETS', name: 'Verificar Disponibilidad', detail: 'consulta agenda del restaurante', icon: ClipboardList },
        { num: '04', type: 'GOOGLE SHEETS', name: 'Registrar Reserva', detail: 'agrega nombre, fecha y contacto', icon: FileText },
        { num: '05', type: 'WAIT', name: '24h antes del turno', detail: 'espera y envía recordatorio', icon: CalendarDays },
        { num: '06', type: 'WHATSAPP', name: 'Confirmación + Recordatorio', detail: 'mensaje automático al cliente', icon: Mail },
      ],
      claudeNote: 'Claude extrae fecha, personas y nombre del texto libre sin formularios.',
    },
  },
  2: {
    headline: 'Tu consultorio sin',
    headlineAccent: 'caos.',
    subhead: 'Turnos, recordatorios y triaje automatizados. Llegás a atender, no a administrar.',
    automations: [
      {
        icon: ClipboardList,
        title: 'Agenda inteligente',
        description: 'Turnos por WhatsApp sin secretaria',
        metric: '-60% ausencias',
      },
      {
        icon: Pill,
        title: 'Recordatorio de medicación',
        description: 'Mensajes automáticos a pacientes crónicos',
        metric: '+ adherencia al tratamiento',
      },
      {
        icon: Bell,
        title: 'Triaje de urgencias',
        description: 'Detecta síntomas urgentes y prioriza',
        metric: '0 urgencias perdidas',
      },
    ],
    n8nFlow: {
      title: 'Agenda Inteligente - Salud',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp Webhook', detail: 'solicitud de turno detectada', icon: MessageCircle },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'clasifica urgencia y consulta', icon: Bot },
        { num: '03', type: 'GOOGLE CALENDAR', name: 'Buscar Disponibilidad', detail: 'horarios libres del profesional', icon: CalendarDays },
        { num: '04', type: 'WHATSAPP', name: 'Ofrecer Opciones', detail: 'envía 2-3 horarios disponibles', icon: Mail },
        { num: '05', type: 'GOOGLE CALENDAR', name: 'Confirmar Turno', detail: 'crea el evento automáticamente', icon: CheckCircle2 },
        { num: '06', type: 'WAIT + WHATSAPP', name: 'Recordatorio 1h antes', detail: 'reduce ausencias', icon: Bell },
      ],
      claudeNote: 'Claude detecta síntomas de urgencia y prioriza la atención automáticamente.',
    },
  },
  3: {
    headline: 'Tus servicios se venden',
    headlineAccent: 'mientras dormís.',
    subhead: 'Leads calificados, propuestas enviadas y seguimientos automáticos. Vos cerrás, el sistema prospecta.',
    automations: [
      {
        icon: Target,
        title: 'Calificación de leads',
        description: 'Filtra intención real antes de llegar a vos',
        metric: 'x3 leads calificados',
      },
      {
        icon: FileText,
        title: 'Envío de propuestas',
        description: 'Propuesta personalizada enviada en minutos',
        metric: '-80% tiempo de cotización',
      },
      {
        icon: Bell,
        title: 'Seguimiento automático',
        description: 'Recordatorios hasta cerrar la venta',
        metric: '+35% tasa de cierre',
      },
    ],
    n8nFlow: {
      title: 'Calificación de Leads - Servicios',
      nodes: [
        { num: '01', type: 'TRIGGER', name: 'WhatsApp / Form Webhook', detail: 'lead entrante de cualquier canal', icon: MessageCircle },
        { num: '02', type: 'AI NODE', name: 'Claude Sonnet 4.6', detail: 'califica intención y presupuesto', icon: Bot },
        { num: '03', type: 'IF', name: 'Lead calificado?', detail: 'filtra antes de llegar al equipo', icon: CheckCircle2 },
        { num: '04', type: 'HTTP', name: 'Generar Propuesta PDF', detail: 'documento personalizado por rubro', icon: FileText },
        { num: '05', type: 'WHATSAPP', name: 'Enviar Propuesta', detail: 'en menos de 5 minutos', icon: Mail },
        { num: '06', type: 'WAIT + WHATSAPP', name: 'Seguimiento automático', detail: '+35% tasa de cierre', icon: Bell },
      ],
      claudeNote: 'Claude redacta propuestas personalizadas según el rubro y tamaño del cliente.',
    },
  },
}

const desktopLayouts: Record<number, GraphPoint[]> = {
  0: [
    { x: 8, y: 34 },
    { x: 27, y: 17 },
    { x: 31, y: 52 },
    { x: 52, y: 31 },
    { x: 74, y: 20 },
    { x: 80, y: 47 },
  ],
  1: [
    { x: 9, y: 36 },
    { x: 24, y: 18 },
    { x: 34, y: 50 },
    { x: 52, y: 33 },
    { x: 72, y: 17 },
    { x: 74, y: 50 },
  ],
  2: [
    { x: 8, y: 34 },
    { x: 30, y: 15 },
    { x: 28, y: 51 },
    { x: 53, y: 34 },
    { x: 70, y: 18 },
    { x: 78, y: 48 },
  ],
  3: [
    { x: 8, y: 37 },
    { x: 25, y: 16 },
    { x: 33, y: 52 },
    { x: 54, y: 31 },
    { x: 72, y: 15 },
    { x: 71, y: 50 },
  ],
}

const mobileLayouts: Record<number, GraphPoint[]> = {
  0: [
    { x: 50, y: 9 },
    { x: 20, y: 30 },
    { x: 80, y: 30 },
    { x: 50, y: 54 },
    { x: 22, y: 80 },
    { x: 78, y: 80 },
  ],
  1: [
    { x: 50, y: 9 },
    { x: 21, y: 31 },
    { x: 79, y: 31 },
    { x: 50, y: 55 },
    { x: 24, y: 81 },
    { x: 76, y: 81 },
  ],
  2: [
    { x: 50, y: 9 },
    { x: 19, y: 31 },
    { x: 81, y: 31 },
    { x: 50, y: 55 },
    { x: 21, y: 82 },
    { x: 79, y: 82 },
  ],
  3: [
    { x: 50, y: 9 },
    { x: 20, y: 32 },
    { x: 80, y: 32 },
    { x: 50, y: 56 },
    { x: 23, y: 82 },
    { x: 77, y: 82 },
  ],
}

const desktopOutputByRubro: Record<number, GraphPoint> = {
  0: { x: 93, y: 35 },
  1: { x: 92, y: 32 },
  2: { x: 93, y: 36 },
  3: { x: 92, y: 31 },
}

const mobileOutputByRubro: Record<number, GraphPoint> = {
  0: { x: 50, y: 110 },
  1: { x: 50, y: 109 },
  2: { x: 50, y: 110 },
  3: { x: 50, y: 109 },
}

const neuralEdges = [
  { from: 0, to: 1, delay: 0.1 },
  { from: 0, to: 2, delay: 0.42 },
  { from: 1, to: 3, delay: 0.84 },
  { from: 2, to: 3, delay: 1.16 },
  { from: 3, to: 4, delay: 1.56 },
  { from: 3, to: 5, delay: 1.9 },
  { from: 4, toOutput: true, delay: 2.32 },
  { from: 5, toOutput: true, delay: 2.66 },
] as const

const graphBends = [-7, 5, -5, 7, -6, 6, -2, 4]

const backgroundParticles: ParticleSeed[] = [
  { x: 10, y: 18, size: 2.4, duration: 6.2, delay: 0.1 },
  { x: 22, y: 74, size: 3.2, duration: 7.1, delay: 0.7 },
  { x: 42, y: 20, size: 2.2, duration: 5.9, delay: 1.1 },
  { x: 64, y: 82, size: 2.8, duration: 8.4, delay: 0.4 },
  { x: 78, y: 28, size: 2.1, duration: 6.8, delay: 1.5 },
  { x: 90, y: 62, size: 3, duration: 7.5, delay: 0.9 },
]

function useViewportFlags() {
  const [flags, setFlags] = useState({
    isMobile: false,
    isTabletOrDown: false,
  })

  useEffect(() => {
    const update = () => {
      setFlags({
        isMobile: window.innerWidth < 640,
        isTabletOrDown: window.innerWidth < 1024,
      })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return flags
}

function getQuadraticPoint(from: GraphPoint, control: GraphPoint, to: GraphPoint, progress: number) {
  const inverse = 1 - progress

  return {
    x: inverse * inverse * from.x + 2 * inverse * progress * control.x + progress * progress * to.x,
    y: inverse * inverse * from.y + 2 * inverse * progress * control.y + progress * progress * to.y,
  }
}

function approximateQuadraticLength(from: GraphPoint, control: GraphPoint, to: GraphPoint) {
  let length = 0
  let previous = from

  for (let step = 1; step <= 24; step++) {
    const point = getQuadraticPoint(from, control, to, step / 24)
    length += Math.hypot(point.x - previous.x, point.y - previous.y)
    previous = point
  }

  return length
}

function IndustryCircuitBackground({
  rubro,
  reducedMotion,
}: {
  rubro: Rubro
  reducedMotion: boolean | null
}) {
  const iconSet = [
    { Icon: Store, x: '6%', y: '15%', size: 64, rotate: -4 },
    { Icon: Package, x: '16%', y: '71%', size: 58, rotate: 3 },
    { Icon: UtensilsCrossed, x: '73%', y: '16%', size: 68, rotate: 4 },
    { Icon: HeartPulse, x: '87%', y: '27%', size: 66, rotate: -3 },
    { Icon: Wrench, x: '82%', y: '74%', size: 62, rotate: 6 },
    { Icon: Monitor, x: '45%', y: '8%', size: 58, rotate: 0 },
    { Icon: ShoppingCart, x: '34%', y: '86%', size: 58, rotate: -5 },
  ]

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#07070f_0%,#05050a_52%,#08070b_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
          backgroundSize: '70px 70px',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 82%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 10%, transparent 82%)',
        }}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={rubro.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
          style={{
            background: `radial-gradient(70% 42% at 50% 52%, rgba(${rubro.colorRgb},0.12), transparent 68%)`,
          }}
        />
      </AnimatePresence>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1440 920" preserveAspectRatio="none">
        <defs>
          <linearGradient id="rubros-circuit-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor={`rgba(${rubro.colorRgb},0)`} />
            <stop offset="45%" stopColor={`rgba(${rubro.colorRgb},0.58)`} />
            <stop offset="100%" stopColor={`rgba(${rubro.colorRgb},0)`} />
          </linearGradient>
          <filter id="rubros-circuit-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M-30 205 H150 L210 260 H330 L392 214 H530 M1456 250 H1278 L1222 310 H1090 L1032 264 H892"
          fill="none"
          stroke={`rgba(${rubro.colorRgb},0.25)`}
          strokeWidth="1"
        />
        <path
          d="M-20 705 H180 L236 650 H382 L438 702 H612 M1470 718 H1264 L1202 650 H1040 L986 700 H820"
          fill="none"
          stroke={`rgba(${rubro.colorRgb},0.22)`}
          strokeWidth="1"
        />
        <motion.path
          d="M20 546 H174 L232 488 H386 L466 542 H652 L728 486 H912 L1006 410 H1230 L1300 350 H1460"
          fill="none"
          stroke="url(#rubros-circuit-line)"
          strokeWidth="1.25"
          strokeLinecap="round"
          filter="url(#rubros-circuit-glow)"
          animate={
            reducedMotion
              ? { opacity: 0.28 }
              : { opacity: [0.14, 0.42, 0.18], pathLength: [0.18, 0.86, 0.18] }
          }
          transition={reducedMotion ? { duration: 0 } : { duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M0 138 C172 178 206 112 342 148 C486 186 524 88 680 126 C832 164 894 226 1030 190 C1162 154 1268 112 1440 170"
          fill="none"
          stroke={`rgba(${rubro.colorRgb},0.2)`}
          strokeWidth="1"
          strokeDasharray="6 18"
          animate={reducedMotion ? undefined : { strokeDashoffset: [0, -110] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.path
          d="M20 806 C190 752 274 838 442 794 C584 758 640 832 790 792 C946 750 1014 822 1160 780 C1268 750 1334 756 1430 732"
          fill="none"
          stroke={`rgba(${rubro.colorRgb},0.18)`}
          strokeWidth="1"
          strokeDasharray="4 16"
          animate={reducedMotion ? undefined : { strokeDashoffset: [0, 96] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 17, repeat: Infinity, ease: 'linear' }}
        />

        {[160, 280, 460, 665, 855, 1064, 1238].map((x, index) => (
          <motion.circle
            key={x}
            cx={x}
            cy={index % 2 === 0 ? 488 : 542}
            r={index % 3 === 0 ? 4 : 2.4}
            fill={rubro.color}
            filter="url(#rubros-circuit-glow)"
            animate={reducedMotion ? { opacity: 0.42 } : { opacity: [0.2, 0.72, 0.24] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 3.8, delay: index * 0.3, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </svg>

      {iconSet.map(({ Icon, x, y, size, rotate }, index) => (
        <motion.div
          key={`${x}-${y}`}
          className="pointer-events-none absolute hidden opacity-[0.13] md:block"
          style={{ left: x, top: y, color: rubro.color, transform: `rotate(${rotate}deg)` }}
          animate={reducedMotion ? { opacity: 0.12 } : { opacity: [0.08, 0.18, 0.1] }}
          transition={reducedMotion ? { duration: 0 } : { duration: 5.5, delay: index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={size} strokeWidth={1.1} />
        </motion.div>
      ))}

      {!reducedMotion &&
        backgroundParticles.map((particle, index) => (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              background: `rgba(${rubro.colorRgb},0.44)`,
              boxShadow: `0 0 ${particle.size * 4}px rgba(${rubro.colorRgb},0.28)`,
              animation: `rubroFloatParticle ${particle.duration}s ${particle.delay}s ease-in-out infinite alternate`,
            }}
          />
        ))}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,10,0.12),rgba(5,5,10,0.74)_72%,#05050a_100%)]" />
    </div>
  )
}

function Header({
  isInView,
  reducedMotion,
}: {
  isInView: boolean
  reducedMotion: boolean | null
}) {
  const startY = reducedMotion ? 0 : -16
  const startOpacity = reducedMotion ? 1 : 0

  return (
    <div className="mb-8 flex flex-col items-center text-center md:mb-10">
      <motion.div
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-5 inline-flex items-center gap-2 overflow-hidden rounded-full border border-amber-500/30 bg-amber-500/[0.05] px-4 py-1.5"
      >
        {!reducedMotion && (
          <motion.span
            aria-hidden="true"
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4.2, ease: 'easeInOut' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"
          />
        )}
        <span className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
        <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500 md:text-[11px]">
          [ Automatizaciones por rubro ]
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.12 }}
        className="text-3xl font-black leading-[1.04] text-white md:text-5xl lg:text-6xl"
      >
        <span className="bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent">
          Tu negocio automatizado.
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.24 }}
        className="mt-4 max-w-xl text-sm leading-7 text-white/45 md:text-base"
      >
        Elegí tu rubro y mirá el flujo que queda trabajando solo, de punta a punta.
      </motion.p>
    </div>
  )
}

function TabSelector({
  active,
  activeProgress,
  isInView,
  isPaused,
  onSelect,
  onTogglePause,
  reducedMotion,
}: {
  active: number
  activeProgress: number
  isInView: boolean
  isPaused: boolean
  onSelect: (id: number) => void
  onTogglePause: () => void
  reducedMotion: boolean | null
}) {
  const activeRubro = rubros[active]
  const startY = reducedMotion ? 0 : 18
  const startOpacity = reducedMotion ? 1 : 0

  return (
    <div className="mx-auto mb-10 flex max-w-5xl flex-col items-center gap-4 md:mb-12">
      <div className="flex w-full flex-wrap justify-center gap-2 md:gap-3">
        {rubros.map((rubro, index) => {
          const isActive = active === rubro.id
          const RubroIcon = rubro.icon

          return (
            <motion.button
              key={rubro.id}
              type="button"
              initial={{ opacity: startOpacity, y: startY }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: 0.18 + index * 0.06,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
                y: { duration: 0 },
                borderColor: { duration: 0 },
                backgroundColor: { duration: 0 },
                boxShadow: { duration: 0 },
              }}
              onClick={() => onSelect(rubro.id)}
              whileHover={
                reducedMotion
                  ? {}
                  : {
                      y: -2,
                      borderColor: `rgba(${rubro.colorRgb},0.46)`,
                      backgroundColor: `rgba(${rubro.colorRgb},0.12)`,
                      boxShadow: `0 0 28px rgba(${rubro.colorRgb},0.16), 0 14px 34px rgba(0,0,0,0.28)`,
                    }
              }
              whileTap={reducedMotion ? {} : { scale: 0.97 }}
              className="group relative min-w-[138px] overflow-hidden rounded-2xl border px-4 py-3 text-left transition-none md:min-w-[150px] md:px-5 md:py-4"
              style={{
                borderColor: isActive ? `rgba(${rubro.colorRgb},0.42)` : 'rgba(255,255,255,0.08)',
                background: isActive
                  ? `linear-gradient(135deg, rgba(${rubro.colorRgb},0.22), rgba(255,255,255,0.035))`
                  : 'rgba(255,255,255,0.025)',
                boxShadow: isActive ? `0 0 26px rgba(${rubro.colorRgb},0.16), 0 14px 34px rgba(0,0,0,0.28)` : 'none',
              }}
            >
              {isActive && (
                <>
                  <motion.div
                    layoutId="active-rubro-bg"
                    className="absolute inset-0"
                    style={{ background: `linear-gradient(90deg, rgba(${rubro.colorRgb},0.2), transparent)` }}
                  />
                  <div
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${activeProgress * 100}%`,
                      background: `linear-gradient(90deg, rgba(${rubro.colorRgb},0.28), rgba(${rubro.colorRgb},0.04))`,
                    }}
                  />
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/8">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${activeProgress * 100}%`,
                        background: rubro.gradient,
                        boxShadow: `0 0 16px rgba(${rubro.colorRgb},0.55)`,
                      }}
                    />
                  </div>
                </>
              )}
              <span className="relative z-10 flex items-center gap-3">
                <span
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
                  style={{
                    borderColor: `rgba(${rubro.colorRgb},0.28)`,
                    background: `rgba(${rubro.colorRgb},0.12)`,
                    color: isActive ? rubro.color : 'rgba(255,255,255,0.48)',
                  }}
                >
                  <RubroIcon size={17} strokeWidth={1.9} />
                </span>
                <span className={`font-bold transition-none ${isActive ? 'text-white' : 'text-white/45 group-hover:text-white/70'}`}>
                  {rubro.label}
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>

      <motion.button
        type="button"
        initial={{ opacity: startOpacity, y: startY }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{
          delay: 0.46,
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
          y: { duration: 0 },
          borderColor: { duration: 0 },
          backgroundColor: { duration: 0 },
          boxShadow: { duration: 0 },
        }}
        onClick={onTogglePause}
        whileHover={
          reducedMotion
            ? {}
            : {
                y: -2,
                borderColor: `rgba(${activeRubro.colorRgb},0.5)`,
                backgroundColor: `rgba(${activeRubro.colorRgb},0.15)`,
                boxShadow: `0 0 30px rgba(${activeRubro.colorRgb},0.2)`,
              }
        }
        whileTap={reducedMotion ? {} : { scale: 0.98 }}
        className="inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-bold"
        style={{
          borderColor: `rgba(${activeRubro.colorRgb},0.32)`,
          background: `rgba(${activeRubro.colorRgb},0.11)`,
          color: activeRubro.color,
          boxShadow: `0 0 24px rgba(${activeRubro.colorRgb},0.12)`,
        }}
        aria-label={isPaused ? 'Reanudar rotación de rubros' : 'Pausar rotación de rubros'}
      >
        {isPaused ? <Play size={16} strokeWidth={2.2} /> : <Pause size={16} strokeWidth={2.2} />}
        {isPaused ? 'Reanudar' : 'Pausar'}
      </motion.button>
    </div>
  )
}

function AutomationFeature({
  item,
  rubro,
  centerActivate,
  index,
  reducedMotion,
}: {
  item: Automation
  rubro: Rubro
  centerActivate: boolean
  index: number
  reducedMotion: boolean | null
}) {
  const itemRef = useRef<HTMLDivElement>(null)
  const isCentered = useInView(itemRef, { margin: '-44% 0px -44% 0px', amount: 0.08 })
  const isActive = centerActivate && isCentered
  const Icon = item.icon

  return (
    <motion.div
      ref={itemRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, x: isActive ? 3 : 0 }}
      whileHover={
        centerActivate || reducedMotion
          ? {}
          : {
              y: -1,
              x: 3,
              backgroundColor: `rgba(${rubro.colorRgb},0.1)`,
              borderColor: `rgba(${rubro.colorRgb},0.34)`,
              boxShadow: `0 0 20px rgba(${rubro.colorRgb},0.16)`,
            }
      }
      transition={{
        duration: 0.45,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
        x: { duration: 0.08, ease: 'linear' },
        backgroundColor: { duration: 0 },
        borderColor: { duration: 0 },
        boxShadow: { duration: 0 },
      }}
      className="group relative flex items-start gap-4 overflow-hidden rounded-2xl border p-4 transition-none sm:p-5"
      style={{
        borderColor: isActive ? `rgba(${rubro.colorRgb},0.34)` : 'rgba(255,255,255,0.08)',
        background: isActive ? `rgba(${rubro.colorRgb},0.1)` : 'rgba(255,255,255,0.025)',
        boxShadow: isActive ? `0 0 24px rgba(${rubro.colorRgb},0.16)` : 'none',
      }}
    >
      <div
        className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border shadow-lg"
        style={{
          background: `rgba(${rubro.colorRgb},0.12)`,
          borderColor: `rgba(${rubro.colorRgb},0.24)`,
          color: rubro.color,
        }}
      >
        <Icon size={19} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h4 className="text-base font-black text-white sm:text-lg">{item.title}</h4>
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
            style={{
              background: `rgba(${rubro.colorRgb},0.12)`,
              color: rubro.color,
              border: `1px solid rgba(${rubro.colorRgb},0.25)`,
            }}
          >
            {item.metric}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-white/43 transition-none group-hover:text-white/58">
          {item.description}
        </p>
      </div>
    </motion.div>
  )
}

function AutomationsPanel({
  active,
  rubro,
  centerActivate,
  reducedMotion,
}: {
  active: number
  rubro: Rubro
  centerActivate: boolean
  reducedMotion: boolean | null
}) {
  const content = rubroContent[active]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={active}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-7 text-center lg:pt-8 lg:text-left"
      >
        <div>
          <h3 className="mx-auto max-w-xl pr-0 text-4xl font-black leading-[1.06] text-white md:text-5xl lg:mx-0 lg:pr-2 xl:text-6xl">
            {content.headline}{' '}
            <span style={{ color: rubro.color }}>{content.headlineAccent}</span>
          </h3>
          <p className="mx-auto mt-5 max-w-xl text-base leading-8 text-white/46 lg:mx-0 md:text-lg">
            {content.subhead}
          </p>
        </div>

        <div className="grid gap-3">
          {content.automations.map((item, index) => (
            <AutomationFeature
              key={item.title}
              item={item}
              rubro={rubro}
              centerActivate={centerActivate}
              index={index}
              reducedMotion={reducedMotion}
            />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

function NeuralFlowMap({
  flow,
  progress,
  rubro,
  reducedMotion,
  vertical,
}: {
  flow: N8nFlow
  progress: number
  rubro: Rubro
  reducedMotion: boolean | null
  vertical: boolean
}) {
  const layout = vertical ? mobileLayouts[rubro.id] ?? mobileLayouts[0] : desktopLayouts[rubro.id] ?? desktopLayouts[0]
  const output = vertical
    ? mobileOutputByRubro[rubro.id] ?? mobileOutputByRubro[0]
    : desktopOutputByRubro[rubro.id] ?? desktopOutputByRubro[0]
  const viewBox = vertical ? '0 0 100 120' : '0 0 100 64'

  const points = flow.nodes.slice(0, 6).map((node, index) => ({
    node,
    point: layout[index] ?? { x: 9 + index * 13, y: 34 },
  }))

  const edgePaths = neuralEdges
    .map((edge, index) => {
      const from = points[edge.from]?.point
      const to = 'toOutput' in edge && edge.toOutput ? output : 'to' in edge ? points[edge.to]?.point : undefined
      if (!from || !to) return null
      const cx = (from.x + to.x) / 2
      const cy = (from.y + to.y) / 2 + (vertical ? graphBends[index % graphBends.length] * 0.6 : graphBends[index % graphBends.length])
      const control = { x: cx, y: cy }

      return {
        key: `${rubro.id}-${vertical ? 'v' : 'h'}-${index}`,
        path: `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`,
        length: approximateQuadraticLength(from, control, to),
        delay: edge.delay,
      }
    })
    .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge))
  const normalizedProgress = Math.min(0.999, Math.max(0, progress))
  const totalEdgeLength = edgePaths.reduce((sum, edgePath) => sum + edgePath.length, 0) || 1
  const traveledLength = normalizedProgress * totalEdgeLength
  const activeNode = Math.min(flow.nodes.length - 1, Math.floor(normalizedProgress * flow.nodes.length))

  const shortLabel = (text: string) => {
    const compact = text.split(' ')[0] ?? text
    return compact.length > 11 ? compact.slice(0, 11) : compact
  }

  return (
    <div
      className="relative overflow-hidden rounded-[26px] border p-3 sm:p-4"
      style={{
        borderColor: `rgba(${rubro.colorRgb},0.26)`,
        background: `radial-gradient(120% 100% at 52% 0%, rgba(${rubro.colorRgb},0.17), rgba(8,8,16,0.96) 58%)`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 0 42px rgba(${rubro.colorRgb},0.12)`,
      }}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-[0.22em]" style={{ color: rubro.color }}>
          Mapa de ejecución n8n
        </span>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/40">
          flujo neuronal en vivo
        </span>
      </div>

      <svg
        viewBox={viewBox}
        className={vertical ? 'h-[clamp(330px,64vh,500px)] w-full' : 'h-[clamp(330px,38vw,430px)] w-full'}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`rubros-flow-line-${rubro.id}-${vertical ? 'v' : 'h'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={`rgba(${rubro.colorRgb},0.08)`} />
            <stop offset="40%" stopColor={`rgba(${rubro.colorRgb},0.38)`} />
            <stop offset="66%" stopColor={`rgba(${rubro.colorRgb},0.94)`} />
            <stop offset="100%" stopColor={`rgba(${rubro.colorRgb},0.12)`} />
          </linearGradient>
          <filter id={`rubros-flow-glow-${rubro.id}-${vertical ? 'v' : 'h'}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="1.55" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id={`rubros-node-glow-${rubro.id}-${vertical ? 'v' : 'h'}`}>
            <stop offset="0%" stopColor={`rgba(${rubro.colorRgb},0.5)`} />
            <stop offset="56%" stopColor={`rgba(${rubro.colorRgb},0.18)`} />
            <stop offset="100%" stopColor={`rgba(${rubro.colorRgb},0)`} />
          </radialGradient>
        </defs>

        {edgePaths.map((edgePath, index) => {
          const previousLength = edgePaths
            .slice(0, index)
            .reduce((sum, previousEdge) => sum + previousEdge.length, 0)
          const fillAmount = reducedMotion
            ? 1
            : Math.min(1, Math.max(0, (traveledLength - previousLength) / edgePath.length))

          return (
            <g key={edgePath.key}>
              <path
                d={edgePath.path}
                stroke={`rgba(${rubro.colorRgb},0.16)`}
                strokeWidth={vertical ? '0.82' : '0.78'}
                fill="none"
              />
              <path
                d={edgePath.path}
                stroke={`url(#rubros-flow-line-${rubro.id}-${vertical ? 'v' : 'h'})`}
                strokeWidth={vertical ? '1.3' : '1.22'}
                fill="none"
                strokeLinecap="round"
                filter={`url(#rubros-flow-glow-${rubro.id}-${vertical ? 'v' : 'h'})`}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - fillAmount}
                opacity={fillAmount > 0 ? 1 : 0}
              />
            </g>
          )
        })}

        {points.map(({ node, point }, index) => {
          const isActive = index === activeNode
          const Icon = node.icon

          return (
            <g key={`${rubro.id}-node-${index}`}>
              <motion.circle
                cx={point.x}
                cy={point.y}
                r={isActive ? (vertical ? '9.8' : '8.9') : vertical ? '8.2' : '7.4'}
                fill={`url(#rubros-node-glow-${rubro.id}-${vertical ? 'v' : 'h'})`}
                animate={reducedMotion ? undefined : { opacity: isActive ? [0.68, 1, 0.72] : [0.32, 0.5, 0.34] }}
                transition={reducedMotion ? { duration: 0 } : { duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={vertical ? '5.2' : '4.8'}
                fill="rgba(8,8,16,0.96)"
                stroke={`rgba(${rubro.colorRgb},${isActive ? 1 : 0.72})`}
                strokeWidth={isActive ? '1.15' : '0.82'}
              />
              <foreignObject x={point.x - 2.2} y={point.y - 2.2} width="4.4" height="4.4">
                <div className="flex h-full w-full items-center justify-center" style={{ color: rubro.color }}>
                  <Icon size={vertical ? 3.8 : 3.5} strokeWidth={2.4} />
                </div>
              </foreignObject>
              <text
                x={point.x}
                y={point.y + (vertical ? 9.4 : 8.5)}
                textAnchor="middle"
                style={{
                  fontSize: vertical ? '2.42px' : '2.05px',
                  fill: isActive ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.78)',
                  letterSpacing: '0.09em',
                  fontWeight: 900,
                  paintOrder: 'stroke fill',
                  stroke: 'rgba(8,8,16,0.95)',
                  strokeWidth: '0.3px',
                }}
              >
                {shortLabel(node.type).toUpperCase()}
              </text>
              <text
                x={point.x}
                y={point.y - (vertical ? 7.8 : 6.8)}
                textAnchor="middle"
                style={{
                  fontSize: vertical ? '2.36px' : '2.12px',
                  fill: rubro.color,
                  fontWeight: 900,
                  paintOrder: 'stroke fill',
                  stroke: 'rgba(8,8,16,0.95)',
                  strokeWidth: '0.3px',
                }}
              >
                {node.num}
              </text>
            </g>
          )
        })}

        <g>
          <motion.circle
            cx={output.x}
            cy={output.y}
            r={vertical ? '10.4' : '9.6'}
            fill={`url(#rubros-node-glow-${rubro.id}-${vertical ? 'v' : 'h'})`}
            animate={reducedMotion ? undefined : { opacity: [0.58, 1, 0.65] }}
            transition={reducedMotion ? { duration: 0 } : { duration: 1.7, repeat: Infinity, ease: 'easeInOut' }}
          />
          <circle
            cx={output.x}
            cy={output.y}
            r={vertical ? '6.1' : '5.6'}
            fill="rgba(8,8,16,0.96)"
            stroke={`rgba(${rubro.colorRgb},1)`}
            strokeWidth="1.16"
          />
          <circle cx={output.x} cy={output.y} r={vertical ? '2.5' : '2.35'} fill={rubro.color} />
          <text
            x={output.x}
            y={output.y + (vertical ? 11.5 : 10.5)}
            textAnchor="middle"
            style={{
              fontSize: vertical ? '2.55px' : '2.24px',
              fill: 'rgba(255,255,255,0.94)',
              letterSpacing: '0.13em',
              fontWeight: 900,
              paintOrder: 'stroke fill',
              stroke: 'rgba(8,8,16,0.95)',
              strokeWidth: '0.3px',
            }}
          >
            RESULTADO
          </text>
        </g>
      </svg>
    </div>
  )
}

function N8nFlowBlock({
  centerActivate,
  progress,
  reducedMotion,
  rubro,
  verticalGraph,
}: {
  centerActivate: boolean
  progress: number
  reducedMotion: boolean | null
  rubro: Rubro
  verticalGraph: boolean
}) {
  const flowRef = useRef<HTMLDivElement>(null)
  const isCentered = useInView(flowRef, { margin: '-42% 0px -42% 0px', amount: 0.12 })
  const isActive = centerActivate && isCentered
  const flow = rubroContent[rubro.id].n8nFlow
  const taskProgress = Math.min(0.999, Math.max(0, progress)) * flow.nodes.length
  const liveTask = Math.min(flow.nodes.length - 1, Math.floor(taskProgress))

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={rubro.id}
        ref={flowRef}
        initial={{ opacity: 0, x: 24, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1, y: isActive ? -2 : 0 }}
        exit={{ opacity: 0, x: -20, scale: 0.99 }}
        whileHover={
          centerActivate || reducedMotion
            ? {}
            : {
                y: -2,
                borderColor: `rgba(${rubro.colorRgb},0.32)`,
                boxShadow: `0 0 86px rgba(${rubro.colorRgb},0.13), 0 26px 76px rgba(0,0,0,0.54)`,
              }
        }
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-[30px] border bg-[#080810]/95 font-mono"
        style={{
          borderColor: isActive ? `rgba(${rubro.colorRgb},0.34)` : `rgba(${rubro.colorRgb},0.16)`,
          boxShadow: isActive
            ? `0 0 86px rgba(${rubro.colorRgb},0.13), 0 26px 76px rgba(0,0,0,0.54)`
            : `0 0 66px rgba(${rubro.colorRgb},0.09), 0 24px 64px rgba(0,0,0,0.5)`,
        }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-4 sm:px-5"
          style={{
            borderColor: `rgba(${rubro.colorRgb},0.12)`,
            background: `linear-gradient(90deg, rgba(${rubro.colorRgb},0.1), rgba(255,255,255,0.025))`,
          }}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border"
              style={{
                borderColor: `rgba(${rubro.colorRgb},0.32)`,
                background: `rgba(${rubro.colorRgb},0.12)`,
                color: rubro.color,
              }}
            >
              <Zap size={16} strokeWidth={2.2} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black uppercase tracking-[0.2em]" style={{ color: rubro.color }}>
                n8n autopilot
              </p>
              <p className="mt-1 truncate text-[10px] font-bold tracking-[0.08em] text-white/38">
                {flow.title}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {['rgba(239,68,68,0.7)', 'rgba(245,158,11,0.7)', 'rgba(34,197,94,0.7)'].map((color) => (
              <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            ))}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <NeuralFlowMap
            flow={flow}
            progress={progress}
            rubro={rubro}
            reducedMotion={reducedMotion}
            vertical={verticalGraph}
          />

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {flow.nodes.map((node, index) => {
              const Icon = node.icon
              const isLive = index === liveTask
              const isComplete = index < liveTask
              const fill = reducedMotion ? 1 : isComplete ? 1 : isLive ? taskProgress - liveTask : 0

              return (
                <motion.div
                  key={`${node.num}-${node.name}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04, duration: 0.28 }}
                  className="relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-3"
                  style={{
                    borderColor: isLive || isComplete ? `rgba(${rubro.colorRgb},0.34)` : 'rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.025)',
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-0"
                    style={{
                      width: `${fill * 100}%`,
                      background: `linear-gradient(90deg, rgba(${rubro.colorRgb},0.16), rgba(${rubro.colorRgb},0.03))`,
                      boxShadow: fill > 0 ? `0 0 26px rgba(${rubro.colorRgb},0.12)` : 'none',
                    }}
                  />
                  <span className="relative z-10 text-[10px] font-black text-white/18">{node.num}</span>
                  <span
                    className="relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-xl border"
                    style={{
                      borderColor: `rgba(${rubro.colorRgb},0.24)`,
                      background: isLive || isComplete ? `rgba(${rubro.colorRgb},0.16)` : `rgba(${rubro.colorRgb},0.1)`,
                      color: rubro.color,
                    }}
                  >
                    <Icon size={14} strokeWidth={2} />
                  </span>
                  <span className="relative z-10 min-w-0">
                    <span className="block truncate text-[11px] font-black uppercase tracking-[0.12em]" style={{ color: rubro.color }}>
                      {node.type}
                    </span>
                    <span className="block truncate text-xs font-bold text-white/72">{node.name}</span>
                  </span>
                </motion.div>
              )
            })}
          </div>

          <div
            className="mt-4 rounded-2xl border p-4"
            style={{
              borderColor: 'rgba(139,92,246,0.22)',
              background: 'linear-gradient(135deg, rgba(139,92,246,0.09), rgba(255,255,255,0.025))',
            }}
          >
            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-violet-300/80">
              <Bot size={14} strokeWidth={2} />
              Claude AI
            </div>
            <p className="text-xs leading-6 text-white/48">{flow.claudeNote}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

export default function RubrosAutomation() {
  const [active, setActive] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [tabProgress, setTabProgress] = useState(0)
  const progressRef = useRef(0)
  const lastTickRef = useRef<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const observerInView = useInView(sectionRef, { once: true, amount: 0.12 })
  const sectionActive = useInView(sectionRef, { amount: 0.2 })
  const reducedMotion = useReducedMotion()
  const { isMobile, isTabletOrDown } = useViewportFlags()
  const [manualInView, setManualInView] = useState(false)
  const rubro = rubros[active]
  const shouldAnimateIn = observerInView || manualInView || Boolean(reducedMotion)
  const shouldRun = (sectionActive || manualInView) && !isPaused && !reducedMotion

  useEffect(() => {
    if (manualInView) return

    const checkVisibility = () => {
      const section = sectionRef.current
      if (!section) return
      const rect = section.getBoundingClientRect()
      const visible = rect.top < window.innerHeight * 0.88 && rect.bottom > window.innerHeight * 0.12
      if (visible) setManualInView(true)
    }

    checkVisibility()
    window.addEventListener('scroll', checkVisibility, { passive: true })
    window.addEventListener('resize', checkVisibility)
    const interval = window.setInterval(checkVisibility, 300)

    return () => {
      window.removeEventListener('scroll', checkVisibility)
      window.removeEventListener('resize', checkVisibility)
      window.clearInterval(interval)
    }
  }, [manualInView])

  useEffect(() => {
    if (reducedMotion) return

    let rafId = 0

    const tick = (now: number) => {
      if (lastTickRef.current === null) {
        lastTickRef.current = now
      }

      const delta = now - lastTickRef.current
      lastTickRef.current = now

      if (shouldRun) {
        progressRef.current += delta / AUTO_ROTATION_MS

        if (progressRef.current >= 1) {
          progressRef.current = 0
          setActive((prev) => (prev + 1) % rubros.length)
        }

        setTabProgress(progressRef.current)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafId)
      lastTickRef.current = null
    }
  }, [reducedMotion, shouldRun])

  const handleSelect = (id: number) => {
    setActive(id)
    progressRef.current = 0
    setTabProgress(0)
  }

  const centerActivate = isTabletOrDown
  const displayProgress = reducedMotion ? 1 : tabProgress

  return (
    <section
      ref={sectionRef}
      id="automation-rubros"
      className="relative z-[1] w-full overflow-hidden bg-[#05050a] px-5 py-20 sm:px-8 md:py-28 lg:py-36"
    >
      <IndustryCircuitBackground rubro={rubro} reducedMotion={reducedMotion} />

      <div className="relative z-10 mx-auto max-w-[1320px]">
        <Header isInView={shouldAnimateIn} reducedMotion={reducedMotion} />

        <TabSelector
          active={active}
          activeProgress={displayProgress}
          isInView={shouldAnimateIn}
          isPaused={isPaused}
          onSelect={handleSelect}
          onTogglePause={() => {
            if (!reducedMotion) setIsPaused((prev) => !prev)
          }}
          reducedMotion={reducedMotion}
        />

        <div className="grid h-[2060px] grid-cols-1 items-start gap-8 sm:h-[1900px] md:h-[1540px] lg:h-auto lg:grid-cols-[minmax(0,0.78fr)_minmax(560px,1.22fr)] xl:gap-12">
          <AutomationsPanel
            active={active}
            rubro={rubro}
            centerActivate={centerActivate}
            reducedMotion={reducedMotion}
          />

          <div className="relative min-w-0 lg:pt-1">
            <N8nFlowBlock
              centerActivate={centerActivate}
              progress={displayProgress}
              reducedMotion={reducedMotion}
              rubro={rubro}
              verticalGraph={isMobile}
            />
          </div>
        </div>

        <motion.div
          initial={{ scaleX: reducedMotion ? 1 : 0 }}
          animate={shouldAnimateIn ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 h-px w-full origin-left md:mt-24"
          style={{
            background: `linear-gradient(90deg, transparent, rgba(${rubro.colorRgb},0.44), transparent)`,
          }}
        />
      </div>

      <style jsx global>{`
        @keyframes rubroFloatParticle {
          0% { transform: translate3d(0, 0, 0); opacity: 0.32; }
          100% { transform: translate3d(10px, -14px, 0); opacity: 0.72; }
        }
      `}</style>
    </section>
  )
}
