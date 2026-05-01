'use client'

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react'
import {
  Activity,
  ArrowDown,
  ArrowRight,
  BarChart2,
  Bell,
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Keyboard,
  Mail,
  Megaphone,
  MessageCircle,
  Monitor,
  Package,
  PenLine,
  Phone,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Timer,
  TrendingUp,
  Workflow,
  X,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type WorkflowStepIcon =
  | 'megaphone'
  | 'clock'
  | 'pencil'
  | 'x'
  | 'message'
  | 'chart'
  | 'dollar'
  | 'credit'
  | 'monitor'
  | 'keyboard'
  | 'mail'
  | 'package'
  | 'bell'
  | 'clipboard'
  | 'bot'
  | 'trending'
  | 'check'
  | 'file'
  | 'timer'
  | 'phone'
  | 'refresh'

interface WorkflowStep {
  icon: WorkflowStepIcon
  label: string
}

interface BentoWorkflow {
  id: number
  category: string
  signal: string
  metric: string
  antes: {
    title: string
    description: string
    steps: WorkflowStep[]
    pain: string
  }
  despues: {
    title: string
    description: string
    steps: WorkflowStep[]
    gain: string
  }
  color: string
  colorRgb: string
}

const STEP_ICONS: Record<WorkflowStepIcon, LucideIcon> = {
  megaphone: Megaphone,
  clock: Clock,
  pencil: PenLine,
  x: X,
  message: MessageCircle,
  chart: BarChart2,
  dollar: DollarSign,
  credit: CreditCard,
  monitor: Monitor,
  keyboard: Keyboard,
  mail: Mail,
  package: Package,
  bell: Bell,
  clipboard: ClipboardList,
  bot: Bot,
  trending: TrendingUp,
  check: CheckCircle2,
  file: FileText,
  timer: Timer,
  phone: Phone,
  refresh: RefreshCw,
}

function useViewportFlags() {
  const [flags, setFlags] = useState({ isTouchLayout: false, isMobile: false })

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      setFlags({
        isTouchLayout: width < 1024,
        isMobile: width < 640,
      })
    }

    update()
    window.addEventListener('resize', update)

    return () => window.removeEventListener('resize', update)
  }, [])

  return flags
}

function useCenterActivation<T extends HTMLElement>(enabled: boolean, marginRatio = 0.18) {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return
    }

    let frame = 0

    const check = () => {
      frame = 0
      const element = ref.current
      if (!element) return

      const rect = element.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const elementCenter = rect.top + rect.height / 2
      const threshold = Math.max(84, window.innerHeight * marginRatio)

      setActive(Math.abs(elementCenter - viewportCenter) <= threshold)
    }

    const schedule = () => {
      if (frame) return
      frame = window.requestAnimationFrame(check)
    }

    check()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)

    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [enabled, marginRatio])

  return { ref, active: enabled && active }
}

const workflows: BentoWorkflow[] = [
  {
    id: 0,
    category: 'Ventas',
    signal: 'lead caliente',
    metric: '3/10',
    antes: {
      title: 'El lead se enfría en WhatsApp',
      description:
        'Un cliente escribe interesado. Pasan 2 horas hasta que alguien lo ve. Para ese entonces, ya le compró a tu competencia.',
      steps: [
        { icon: 'megaphone', label: 'Lead llega' },
        { icon: 'clock', label: 'Espera horas' },
        { icon: 'pencil', label: 'Carga manual' },
        { icon: 'x', label: 'Venta perdida' },
      ],
      pain: '3 de cada 10 leads se pierden por demora',
    },
    despues: {
      title: 'Respuesta en segundos, 24/7',
      description:
        'El sistema detecta el interés, lo registra y le responde al cliente al instante. El vendedor solo entra a cerrar.',
      steps: [
        { icon: 'megaphone', label: 'Lead entra' },
        { icon: 'message', label: 'Respuesta auto' },
        { icon: 'chart', label: 'CRM al día' },
        { icon: 'dollar', label: 'Cierre rápido' },
      ],
      gain: 'Ventas que antes se perdían por demora',
    },
    color: '#f59e0b',
    colorRgb: '245,158,11',
  },
  {
    id: 1,
    category: 'Facturación',
    signal: 'cobro detectado',
    metric: '0 errores',
    antes: {
      title: 'Cargar facturas a mano en AFIP',
      description:
        'Recibís un pago y alguien tiene que entrar a la web de AFIP, cargar los datos uno a uno y después mandar el PDF.',
      steps: [
        { icon: 'credit', label: 'Pago recibido' },
        { icon: 'monitor', label: 'Web AFIP' },
        { icon: 'keyboard', label: 'Carga manual' },
        { icon: 'mail', label: 'Mandar mail' },
      ],
      pain: 'Errores de carga y clientes esperando',
    },
    despues: {
      title: 'Cobro recibido, factura enviada',
      description:
        'MercadoPago confirma el cobro. El sistema genera la factura oficial de AFIP y le manda el PDF al cliente solo.',
      steps: [
        { icon: 'credit', label: 'Pago confirmado' },
        { icon: 'file', label: 'AFIP auto' },
        { icon: 'mail', label: 'PDF enviado' },
      ],
      gain: '0 errores de carga y PDF al instante',
    },
    color: '#f97316',
    colorRgb: '249,115,22',
  },
  {
    id: 2,
    category: 'Stock',
    signal: 'inventario vivo',
    metric: 'stock real',
    antes: {
      title: 'Prometer stock que no tenés',
      description:
        'Vendés por WhatsApp pero no descontás de la planilla. Descubrís que no hay stock cuando ya lo cobraste.',
      steps: [
        { icon: 'package', label: 'Stock irreal' },
        { icon: 'x', label: 'Error humano' },
        { icon: 'x', label: 'Falta entrega' },
      ],
      pain: 'Promesas rotas y clientes enojados',
    },
    despues: {
      title: 'Sincronización total e inteligente',
      description:
        'Cada venta en cualquier canal descuenta el stock real. Si baja del mínimo, el sistema te avisa por Slack.',
      steps: [
        { icon: 'trending', label: 'Stock crítico' },
        { icon: 'bell', label: 'Aviso Slack' },
        { icon: 'clipboard', label: 'Orden compra' },
      ],
      gain: 'Nunca más vendés lo que no hay',
    },
    color: '#f59e0b',
    colorRgb: '245,158,11',
  },
  {
    id: 3,
    category: 'Reportes',
    signal: 'lunes 8 AM',
    metric: '1 vista',
    antes: {
      title: 'Perder el domingo armando Excels',
      description:
        'Para saber cuánto vendiste tenés que juntar datos de 3 sistemas distintos y cruzarlos a mano un domingo.',
      steps: [
        { icon: 'chart', label: 'Juntar datos' },
        { icon: 'pencil', label: 'Cruzar manual' },
        { icon: 'mail', label: 'Reporte tarde' },
      ],
      pain: 'Vivir en el caos sin números claros',
    },
    despues: {
      title: 'Tu negocio, en un solo vistazo',
      description:
        'Todos los lunes a las 8 AM recibís un mensaje con lo facturado, lo vendido y el rendimiento de tu equipo.',
      steps: [
        { icon: 'bot', label: 'Cruce auto' },
        { icon: 'trending', label: 'Gráficos solos' },
        { icon: 'mail', label: 'Reporte listo' },
      ],
      gain: 'Reportes consolidados cada mañana',
    },
    color: '#f97316',
    colorRgb: '249,115,22',
  },
  {
    id: 4,
    category: 'Atención',
    signal: 'respuesta inmediata',
    metric: '90%',
    antes: {
      title: 'Tu equipo atrapado en dudas básicas',
      description:
        'Precios, horarios, dónde están. Tus empleados pierden el 80% del tiempo respondiendo lo mismo por milésima vez.',
      steps: [
        { icon: 'message', label: 'Pregunta básica' },
        { icon: 'clock', label: 'Tu gente ocupada' },
        { icon: 'pencil', label: 'Resp. repetida' },
      ],
      pain: 'Empleados robots haciendo tareas simples',
    },
    despues: {
      title: 'Tu gente, solo donde genera valor',
      description:
        'El sistema resuelve lo básico automáticamente. Tu equipo solo interviene en problemas reales o grandes ventas.',
      steps: [
        { icon: 'message', label: 'Pregunta entra' },
        { icon: 'bot', label: 'Resp. instantánea' },
        { icon: 'check', label: 'Equipo libre' },
      ],
      gain: '90% de consultas resueltas por el sistema',
    },
    color: '#f59e0b',
    colorRgb: '245,158,11',
  },
  {
    id: 5,
    category: 'Cobranzas',
    signal: 'vencimiento activo',
    metric: 'caja clara',
    antes: {
      title: 'Cobros vencidos sin seguimiento',
      description:
        'Las facturas se vencen y nadie hace seguimiento constante. Terminás cobrando tarde y con flujo de caja desordenado.',
      steps: [
        { icon: 'file', label: 'Factura emitida' },
        { icon: 'timer', label: 'Vence sin aviso' },
        { icon: 'phone', label: 'Seguimiento manual' },
      ],
      pain: 'Caja inestable por cobranzas tardías',
    },
    despues: {
      title: 'Recordatorios automáticos y cobro ágil',
      description:
        'El sistema detecta vencimientos, envía recordatorios por WhatsApp y email, y notifica al equipo solo si requiere intervención.',
      steps: [
        { icon: 'file', label: 'Factura emitida' },
        { icon: 'bot', label: 'Recordatorio auto' },
        { icon: 'check', label: 'Cobro confirmado' },
      ],
      gain: 'Menos mora y caja más predecible',
    },
    color: '#f97316',
    colorRgb: '249,115,22',
  },
]

function StepIcon({ icon, size = 16 }: { icon: WorkflowStepIcon; size?: number }) {
  const Icon = STEP_ICONS[icon]
  return <Icon size={size} strokeWidth={1.8} />
}

function AtmosphereBento() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(249,115,22,0.11),transparent_34%),radial-gradient(circle_at_12%_54%,rgba(239,68,68,0.1),transparent_26%),radial-gradient(circle_at_86%_64%,rgba(245,158,11,0.12),transparent_30%)]" />
      <div className="absolute inset-0 opacity-[0.22] [background-image:linear-gradient(rgba(245,158,11,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.12)_1px,transparent_1px)] [background-size:78px_78px]" />
      <svg
        className="absolute inset-x-1/2 top-0 h-[1100px] w-[1600px] -translate-x-1/2 sm:w-[1800px] lg:h-[1060px] lg:w-[1920px]"
        viewBox="0 0 1440 920"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          <linearGradient id="bento-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(239,68,68,0)" />
            <stop offset="38%" stopColor="rgba(249,115,22,0.66)" />
            <stop offset="68%" stopColor="rgba(245,158,11,0.54)" />
            <stop offset="100%" stopColor="rgba(245,158,11,0)" />
          </linearGradient>
          <filter id="bento-glow" x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M0 742 C180 710 204 632 372 642 C516 650 578 760 740 710 C904 660 964 524 1122 552 C1266 578 1326 654 1440 602"
          fill="none"
          stroke="rgba(245,158,11,0.18)"
          strokeWidth="1"
        />
        <motion.path
          d="M-40 616 H160 L220 560 H384 L460 612 H642 L720 548 H950 L1010 494 H1220 L1294 428 H1480"
          fill="none"
          stroke="url(#bento-line)"
          strokeWidth="1.3"
          strokeLinecap="round"
          initial={{ pathLength: 0.22, opacity: 0.16 }}
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  pathLength: [0.22, 0.84, 0.22],
                  opacity: [0.12, 0.34, 0.12],
                }
          }
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.path
          d="M-20 214 H210 L270 268 H456 L540 226 H760 L846 284 H1010 L1088 226 H1280 L1348 180 H1460"
          fill="none"
          stroke="rgba(239,68,68,0.26)"
          strokeWidth="1"
          strokeDasharray="7 18"
          animate={shouldReduceMotion ? undefined : { strokeDashoffset: [0, -90] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
        />
        <path
          d="M78 784 V640 H184 L244 696 H376 L438 648 H620 M1362 126 V286 H1248 L1204 342 H1032 L972 396 H830"
          fill="none"
          stroke="rgba(249,115,22,0.3)"
          strokeWidth="1"
        />
        <path
          d="M0 82 H146 L190 126 H324 M1440 808 H1280 L1232 756 H1104 L1052 806 H892"
          fill="none"
          stroke="rgba(249,115,22,0.23)"
          strokeWidth="1"
        />
        <path
          d="M122 126 V210 H246 L302 166 H464 M1318 650 V544 H1200 L1154 592 H1012"
          fill="none"
          stroke="rgba(239,68,68,0.18)"
          strokeWidth="1"
          strokeDasharray="2 10"
        />
        {[126, 190, 302, 464, 892, 1052, 1154, 1232, 1318].map((point, index) => (
          <circle
            key={`node-${point}-${index}`}
            cx={point}
            cy={index < 4 ? (index % 2 === 0 ? 82 : 126) : index % 2 === 0 ? 806 : 756}
            r={index % 3 === 0 ? 3.8 : 2.4}
            fill={index % 2 === 0 ? '#f97316' : '#f59e0b'}
            opacity="0.55"
          />
        ))}

        {[210, 372, 540, 720, 916, 1088, 1248].map((x, index) => (
          <motion.circle
            key={x}
            cx={x}
            cy={index % 2 === 0 ? 560 : 612}
            r={index % 3 === 0 ? 4 : 2.5}
            fill={index % 2 === 0 ? '#f59e0b' : '#f97316'}
            filter="url(#bento-glow)"
            animate={shouldReduceMotion ? undefined : { opacity: [0.18, 0.72, 0.18] }}
            transition={{
              duration: 3.6,
              delay: index * 0.35,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,5,8,0.1),rgba(5,5,8,0.78)_70%,#050508_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />
    </div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="mx-auto mb-12 flex max-w-4xl flex-col items-center text-center md:mb-16">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="relative mb-6 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-amber-500/30 bg-amber-500/[0.05] px-4 py-1.5"
      >
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden="true"
            animate={{ x: ['-140%', '240%'] }}
            transition={{ duration: 2.2, repeat: Infinity, repeatDelay: 4.8, ease: 'easeInOut' }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"
          />
        )}
        <span
          className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
          style={{ boxShadow: '0 0 10px rgba(245,158,11,0.75)' }}
        />
        <span className="relative z-10 text-[10px] font-bold uppercase text-amber-500 sm:text-[11px]">
          [ El fin del trabajo robótico ]
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-3xl font-black leading-[1.05] text-white sm:text-4xl md:text-5xl lg:text-6xl"
      >
        Tus procesos,
        <span className="block bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent md:inline">
          {' '}en piloto automático.
        </span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.55, delay: 0.35 }}
        className="mt-5 max-w-2xl text-sm leading-7 text-white/45 md:text-base"
      >
        Elegí el proceso que hoy te quita el sueño y mirá cómo se convierte en una operación que captura, decide y ejecuta sin perseguir a nadie.
      </motion.p>
    </div>
  )
}

function ProcessRail({
  activeId,
  isInView,
  onSelect,
  className = '',
}: {
  activeId: number
  isInView: boolean
  onSelect: (id: number) => void
  className?: string
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: -22 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-3 shadow-[0_18px_70px_rgba(0,0,0,0.4)] 2xl:min-h-[640px] ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(249,115,22,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent)]" />
      <div className="relative mb-3 flex items-center gap-2 px-2 pt-2 text-xs font-bold uppercase text-white/55">
        <Workflow size={16} strokeWidth={1.8} className="text-amber-400" />
        Procesos listos
      </div>
      <p className="relative mb-3 px-2 text-[11px] font-semibold leading-5 text-white/38 lg:hidden">
        Tocá para cambiar los procesos listos y deslizá para explorar más.
      </p>

      <div className="relative flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
        {workflows.map((workflow) => {
          const isActive = workflow.id === activeId

          return (
            <button
              key={workflow.id}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect(workflow.id)}
              onFocus={() => onSelect(workflow.id)}
              onMouseEnter={() => onSelect(workflow.id)}
              className="group relative min-w-[235px] overflow-hidden rounded-2xl border p-4 text-left transition duration-300 lg:min-w-0 lg:w-full"
              style={{
                borderColor: isActive ? `rgba(${workflow.colorRgb},0.48)` : 'rgba(255,255,255,0.08)',
                background: isActive
                  ? `linear-gradient(135deg, rgba(${workflow.colorRgb},0.16), rgba(255,255,255,0.035))`
                  : 'rgba(255,255,255,0.025)',
                boxShadow: isActive
                  ? `0 0 0 1px rgba(${workflow.colorRgb},0.12), 0 16px 40px rgba(${workflow.colorRgb},0.08)`
                  : 'none',
              }}
            >
              <span
                className="absolute left-0 top-4 h-10 w-1 rounded-r-full transition-opacity"
                style={{
                  background: workflow.color,
                  opacity: isActive ? 1 : 0.18,
                  boxShadow: isActive ? `0 0 20px rgba(${workflow.colorRgb},0.75)` : 'none',
                }}
              />
              <span className="mb-3 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold uppercase text-white/45">{workflow.category}</span>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase"
                  style={{
                    color: isActive ? workflow.color : 'rgba(255,255,255,0.34)',
                    background: isActive ? `rgba(${workflow.colorRgb},0.11)` : 'rgba(255,255,255,0.05)',
                  }}
                >
                  {workflow.signal}
                </span>
              </span>
              <span className="block text-sm font-black leading-tight text-white">{workflow.antes.title}</span>
              <span className="mt-3 flex items-center gap-2 text-xs text-white/38">
                <Activity size={13} strokeWidth={1.8} />
                {workflow.metric}
              </span>
            </button>
          )
        })}
      </div>
    </motion.aside>
  )
}

function StepSequenceNode({
  step,
  tone,
  color,
  colorRgb,
  centerActivate,
}: {
  step: WorkflowStep
  tone: 'manual' | 'auto'
  color: string
  colorRgb: string
  centerActivate: boolean
}) {
  const manual = tone === 'manual'
  const { ref, active: centerActive } = useCenterActivation<HTMLDivElement>(centerActivate, 0.14)
  const isLit = centerActive

  return (
    <motion.div
      ref={ref}
      whileHover={{
        y: -2,
        filter: 'brightness(1.18)',
        boxShadow: manual
          ? '0 0 28px rgba(239,68,68,0.16)'
          : `0 0 30px rgba(${colorRgb},0.22)`,
      }}
      animate={
        isLit
          ? {
              filter: 'brightness(1.22)',
              boxShadow: manual
                ? '0 0 28px rgba(239,68,68,0.18)'
                : `0 0 32px rgba(${colorRgb},0.24)`,
            }
          : {
              filter: 'brightness(1)',
              boxShadow: 'none',
            }
      }
      transition={{ duration: 0.06 }}
      className="flex w-full min-w-0 items-center gap-2 rounded-2xl border px-3 py-3 sm:w-auto sm:min-w-[112px] lg:w-full lg:min-w-0 min-[1440px]:w-auto min-[1440px]:min-w-[112px]"
      style={{
        borderColor: manual ? 'rgba(239,68,68,0.22)' : `rgba(${colorRgb},0.3)`,
        background: manual ? 'rgba(239,68,68,0.06)' : `rgba(${colorRgb},0.09)`,
        color: manual ? 'rgba(248,113,113,0.92)' : color,
      }}
    >
      <span
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border"
        style={{
          borderColor: manual ? 'rgba(239,68,68,0.25)' : `rgba(${colorRgb},0.32)`,
          background: manual ? 'rgba(239,68,68,0.08)' : `rgba(${colorRgb},0.12)`,
        }}
      >
        <StepIcon icon={step.icon} />
      </span>
      <span className="min-w-0 text-[11px] font-bold leading-tight text-white/62">{step.label}</span>
    </motion.div>
  )
}

function StepSequence({
  steps,
  tone,
  color,
  colorRgb,
  centerActivate,
}: {
  steps: WorkflowStep[]
  tone: 'manual' | 'auto'
  color: string
  colorRgb: string
  centerActivate: boolean
}) {
  return (
    <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center lg:flex-col lg:items-stretch min-[1440px]:flex-row min-[1440px]:items-center">
      {steps.map((step, index) => (
        <React.Fragment key={`${step.label}-${index}`}>
          <StepSequenceNode
            step={step}
            tone={tone}
            color={color}
            colorRgb={colorRgb}
            centerActivate={centerActivate}
          />
          {index < steps.length - 1 && (
            <>
              <ArrowRight
                size={15}
                strokeWidth={1.8}
                className="hidden text-white/18 sm:block lg:hidden min-[1440px]:block"
                aria-hidden="true"
              />
              <ArrowDown
                size={15}
                strokeWidth={1.8}
                className="mx-auto text-white/20 sm:hidden lg:block min-[1440px]:hidden"
                aria-hidden="true"
              />
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}

function FocusPanel({
  workflow,
  isInView,
  centerActivate,
  className = '',
}: {
  workflow: BentoWorkflow
  isInView: boolean
  centerActivate: boolean
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-[30px] border border-white/10 bg-[#09090d]/80 p-4 shadow-[0_24px_90px_rgba(0,0,0,0.5)] sm:p-5 2xl:min-h-[640px] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 54% 8%, rgba(${workflow.colorRgb},0.18), transparent 32%), linear-gradient(145deg, rgba(255,255,255,0.045), transparent 50%)`,
        }}
      />
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      <AnimatePresence mode="wait">
        <motion.div
          key={workflow.id}
          initial={{ opacity: 0, y: 16, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -12, filter: 'blur(10px)' }}
          transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex h-full flex-col"
        >
          <div className="mb-5 flex flex-col justify-between gap-4 border-b border-white/8 pb-5 sm:flex-row sm:items-start">
            <div>
              <p className="mb-2 text-xs font-bold uppercase text-white/38">Caso activo: {workflow.category}</p>
              <h3 className="max-w-2xl text-2xl font-black leading-tight text-white md:text-3xl">
                {workflow.despues.title}
              </h3>
            </div>
            <div
              className="inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold uppercase"
              style={{
                borderColor: `rgba(${workflow.colorRgb},0.32)`,
                background: `rgba(${workflow.colorRgb},0.08)`,
                color: workflow.color,
              }}
            >
              <Radio size={14} strokeWidth={2} />
              piloto activo
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] border border-red-500/14 bg-red-500/[0.045] p-5">
              <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase text-red-300/70">
                <X size={14} strokeWidth={2} />
                hoy se rompe acá
              </div>
              <h4 className="text-lg font-black leading-tight text-white">{workflow.antes.title}</h4>
              <p className="mt-3 text-sm leading-6 text-white/46">{workflow.antes.description}</p>
              <div className="mt-5 rounded-2xl border border-red-500/18 bg-black/18 p-3">
                <StepSequence
                  steps={workflow.antes.steps}
                  tone="manual"
                  color="#ef4444"
                  colorRgb="239,68,68"
                  centerActivate={centerActivate}
                />
              </div>
              <p className="mt-4 inline-flex rounded-full border border-red-500/18 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-300">
                {workflow.antes.pain}
              </p>
            </div>

            <div
              className="rounded-[24px] border p-5"
              style={{
                borderColor: `rgba(${workflow.colorRgb},0.2)`,
                background: `linear-gradient(145deg, rgba(${workflow.colorRgb},0.1), rgba(255,255,255,0.035))`,
              }}
            >
              <div
                className="mb-4 flex items-center gap-2 text-xs font-bold uppercase"
                style={{ color: workflow.color }}
              >
                <Sparkles size={14} strokeWidth={2} />
                con automation
              </div>
              <h4 className="text-lg font-black leading-tight text-white">{workflow.despues.title}</h4>
              <p className="mt-3 text-sm leading-6 text-white/55">{workflow.despues.description}</p>
              <div
                className="mt-5 rounded-2xl border bg-black/16 p-3"
                style={{ borderColor: `rgba(${workflow.colorRgb},0.22)` }}
              >
                <StepSequence
                  steps={workflow.despues.steps}
                  tone="auto"
                  color={workflow.color}
                  colorRgb={workflow.colorRgb}
                  centerActivate={centerActivate}
                />
              </div>
              <p
                className="mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold"
                style={{
                  borderColor: `rgba(${workflow.colorRgb},0.28)`,
                  background: `rgba(${workflow.colorRgb},0.11)`,
                  color: workflow.color,
                }}
              >
                <CheckCircle2 size={14} strokeWidth={2} />
                {workflow.despues.gain}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-bold uppercase text-white/34">captura</p>
              <p className="mt-2 text-sm font-bold text-white/75">El dato entra sin depender de una planilla.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-bold uppercase text-white/34">decisión</p>
              <p className="mt-2 text-sm font-bold text-white/75">Reglas claras, validación y acción automática.</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-white/[0.035] p-4">
              <p className="text-xs font-bold uppercase text-white/34">salida</p>
              <p className="mt-2 text-sm font-bold text-white/75">Notifica, registra y deja trazabilidad.</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}

function CommandEventRow({
  step,
  index,
  workflow,
  centerActivate,
}: {
  step: WorkflowStep
  index: number
  workflow: BentoWorkflow
  centerActivate: boolean
}) {
  const { ref, active: centerActive } = useCenterActivation<HTMLDivElement>(centerActivate, 0.14)

  return (
    <motion.div
      ref={ref}
      whileHover={{
        x: 3,
        filter: 'brightness(1.18)',
        borderColor: `rgba(${workflow.colorRgb},0.26)`,
      }}
      animate={
        centerActive
          ? {
              filter: 'brightness(1.2)',
              borderColor: `rgba(${workflow.colorRgb},0.3)`,
              backgroundColor: `rgba(${workflow.colorRgb},0.08)`,
            }
          : {
              filter: 'brightness(1)',
              borderColor: 'rgba(255,255,255,0.08)',
              backgroundColor: 'rgba(255,255,255,0.035)',
            }
      }
      transition={{ duration: 0.06 }}
      className="flex items-center gap-3 rounded-2xl border p-3"
    >
      <span
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{
          color: workflow.color,
          background: `rgba(${workflow.colorRgb},0.1)`,
          boxShadow: index === 1 ? `0 0 24px rgba(${workflow.colorRgb},0.16)` : 'none',
        }}
      >
        <StepIcon icon={step.icon} />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-bold uppercase text-white/35">
          evento {String(index + 1).padStart(2, '0')}
        </span>
        <span className="block truncate text-sm font-bold text-white/72">{step.label}</span>
      </span>
    </motion.div>
  )
}

function CommandPanel({
  workflow,
  isInView,
  centerActivate,
  className = '',
}: {
  workflow: BentoWorkflow
  isInView: boolean
  centerActivate: boolean
  className?: string
}) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 22 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.65, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className={`relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-4 shadow-[0_18px_70px_rgba(0,0,0,0.4)] 2xl:min-h-[640px] ${className}`}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 0%, rgba(${workflow.colorRgb},0.16), transparent 36%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 55%)`,
        }}
      />
      <AnimatePresence mode="wait">
        <motion.div
          key={workflow.id}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 flex h-full flex-col"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-white/55">
              <ShieldCheck size={16} strokeWidth={2} style={{ color: workflow.color }} />
              Autopilot
            </div>
            <span
              className="rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase"
              style={{
                borderColor: `rgba(${workflow.colorRgb},0.28)`,
                color: workflow.color,
                background: `rgba(${workflow.colorRgb},0.08)`,
              }}
            >
              24/7
            </span>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs font-bold uppercase text-white/35">resultado esperado</p>
            <p className="mt-3 text-2xl font-black leading-tight text-white">{workflow.metric}</p>
            <p className="mt-3 text-sm leading-6 text-white/48">{workflow.despues.gain}</p>
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-3 2xl:block 2xl:space-y-2">
            {workflow.despues.steps.map((step, index) => (
              <CommandEventRow
                key={`${workflow.id}-${step.label}`}
                step={step}
                index={index}
                workflow={workflow}
                centerActivate={centerActivate}
              />
            ))}
          </div>

          <div className="mt-auto pt-5">
            <div className="rounded-[24px] border border-amber-500/16 bg-amber-500/[0.045] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase text-amber-300/70">
                <Bot size={15} strokeWidth={2} />
                motor de proceso
              </div>
              <p className="text-sm leading-6 text-white/58">
                El proceso queda conectado de punta a punta: entra el evento, se valida la regla y sale la acción sin trabajo repetitivo.
              </p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.aside>
  )
}

export default function BentoAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.12 })
  const shouldReduceMotion = useReducedMotion()
  const { isTouchLayout } = useViewportFlags()
  const [manualInView, setManualInView] = useState(false)
  const [activeId, setActiveId] = useState(workflows[0].id)
  const activeWorkflow = workflows.find((workflow) => workflow.id === activeId) ?? workflows[0]
  const shouldAnimateIn = isInView || manualInView || Boolean(shouldReduceMotion)

  useEffect(() => {
    if (manualInView) return

    const checkVisibility = () => {
      const section = sectionRef.current
      if (!section) return

      const rect = section.getBoundingClientRect()
      const visible = rect.top < window.innerHeight * 0.88 && rect.bottom > window.innerHeight * 0.12

      if (visible) {
        setManualInView(true)
      }
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

  return (
    <section
      ref={sectionRef}
      id="automation-processes"
      data-cursor="off"
      className="relative z-[1] w-full overflow-hidden bg-[#050508] px-5 py-20 sm:px-8 md:py-28 lg:py-36"
    >
      <AtmosphereBento />

      <div className="relative z-10 mx-auto max-w-[1360px]">
        <Header isInView={shouldAnimateIn} />

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)] 2xl:grid-cols-[310px_minmax(0,1fr)_320px]">
          <ProcessRail
            activeId={activeId}
            isInView={shouldAnimateIn}
            onSelect={setActiveId}
            className="min-w-0"
          />
          <FocusPanel
            workflow={activeWorkflow}
            isInView={shouldAnimateIn}
            centerActivate={isTouchLayout}
            className="min-w-0"
          />
          <CommandPanel
            workflow={activeWorkflow}
            isInView={shouldAnimateIn}
            centerActivate={isTouchLayout}
            className="lg:col-span-2 2xl:col-span-1"
          />
        </div>

        <motion.div
          initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={shouldAnimateIn ? { scaleX: 1 } : {}}
          transition={{ duration: 1.1, delay: 0.75 }}
          className="mt-12 h-px origin-left bg-gradient-to-r from-transparent via-amber-500/40 to-transparent"
        />
      </div>
    </section>
  )
}
