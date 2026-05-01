'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Network,
  Route,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TimerReset,
  Zap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

type ProcesoVisual = 'diagnostic' | 'map' | 'activation' | 'support'

interface ProcesoStep {
  id: number
  phase: string
  title: string
  summary: string
  duration: string
  color: string
  colorRgb: string
  icon: LucideIcon
  visual: ProcesoVisual
  badge: string
  metric: string
  develop: string[]
  cliente: string[]
  deliverable: string
}

const ease = [0.16, 1, 0.3, 1] as const
const CLOCK_RADIUS = 62
const CLOCK_CIRCUMFERENCE = 2 * Math.PI * CLOCK_RADIUS
const centerBand = '-42% 0px -42% 0px'

const pasos: ProcesoStep[] = [
  {
    id: 0,
    phase: 'FASE 01',
    title: 'Relevamiento de procesos',
    summary: 'Detectamos cuellos de botella, tareas repetidas y costo operativo oculto antes de tocar una integración.',
    duration: '1 a 2 días',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    icon: Search,
    visual: 'diagnostic',
    badge: 'DIAGNÓSTICO DEL CAOS',
    metric: '3 procesos priorizados',
    develop: [
      'Mapa de tareas manuales y responsables',
      'Cálculo de horas perdidas por flujo',
      'Priorización por retorno y riesgo operativo',
      'Plan de automatización por impacto',
    ],
    cliente: ['1 reunión de 60 minutos', 'Acceso al recorrido real del proceso'],
    deliverable: 'Mapa de automatizaciones con ROI estimado por flujo',
  },
  {
    id: 1,
    phase: 'FASE 02',
    title: 'Arquitectura de flujos',
    summary: 'Convertimos el proceso en reglas, ramas y conexiones para que cada herramienta sepa qué hacer.',
    duration: '3 a 5 días',
    color: '#f97316',
    colorRgb: '249,115,22',
    icon: Route,
    visual: 'map',
    badge: 'MAPA DEL PILOTO AUTOMÁTICO',
    metric: 'lógica lista para pruebas',
    develop: [
      'Diseño del flujo n8n por eventos',
      'Conexión con las apps que ya usás',
      'Reglas de validación y excepciones',
      'Ambiente de prueba antes de salir en vivo',
    ],
    cliente: ['Credenciales o permisos necesarios', 'Validación rápida de reglas críticas'],
    deliverable: 'Flujos armados, conectados y listos para aprobación final',
  },
  {
    id: 2,
    phase: 'FASE 03',
    title: 'Activación y testing',
    summary: 'Encendemos el sistema con datos reales, medimos respuestas y ajustamos hasta que corra estable.',
    duration: '2 a 3 días',
    color: '#f59e0b',
    colorRgb: '245,158,11',
    icon: Zap,
    visual: 'activation',
    badge: 'SISTEMA EN VIVO',
    metric: 'monitoreo 48 hs',
    develop: [
      'Lanzamiento progresivo del flujo',
      'Pruebas con casos reales y bordes',
      'Corrección de fallos y duplicados',
      'Alertas para intervención humana',
    ],
    cliente: ['Validar salidas del sistema', 'Reportar casos raros del primer uso'],
    deliverable: 'Sistema operando con monitoreo activo y trazabilidad',
  },
  {
    id: 3,
    phase: 'FASE 04',
    title: 'Capacitación y soporte',
    summary: 'Tu equipo aprende a delegar, leer alertas y operar con el nuevo piloto automático sin depender de nosotros.',
    duration: '1 día + soporte',
    color: '#fb923c',
    colorRgb: '251,146,60',
    icon: GraduationCap,
    visual: 'support',
    badge: 'OPERACIÓN LIBERADA',
    metric: '30 días acompañados',
    develop: [
      'Capacitación breve del equipo',
      'Dashboard de control y bitácora',
      'Documentación del flujo operativo',
      'Soporte incluido durante el arranque',
    ],
    cliente: ['Equipo clave en la capacitación', 'Feedback de las primeras semanas'],
    deliverable: 'Equipo liberado de tareas repetitivas, con soporte activo',
  },
]

function useViewportFlags() {
  const [flags, setFlags] = useState({ isMobile: false, isTabletOrDown: false })

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth
      setFlags({
        isMobile: width < 640,
        isTabletOrDown: width < 1024,
      })
    }

    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return flags
}

function AtmosphereProceso() {
  const reduced = useReducedMotion()
  const timeNodes = [
    { x: 160, y: 154, r: 5 },
    { x: 410, y: 730, r: 4 },
    { x: 822, y: 664, r: 4 },
    { x: 1226, y: 352, r: 4 },
    { x: 1318, y: 790, r: 4 },
  ]

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(9,9,13,0.38),rgba(7,7,9,0.94)_68%,#050506_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[44%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.08),transparent_68%)]" />
      <div className="absolute left-[-18%] top-[10%] h-[44rem] w-[44rem] rounded-full bg-orange-500/[0.05] blur-[120px]" />
      <div className="absolute bottom-[-18%] right-[-16%] h-[52rem] w-[52rem] rounded-full bg-amber-500/[0.045] blur-[130px]" />

      <svg viewBox="0 0 1440 980" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full opacity-[0.72]">
        <defs>
          <radialGradient id="timeNode" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fff7ed" stopOpacity="0.95" />
            <stop offset="38%" stopColor="#f59e0b" stopOpacity="0.82" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="timeWire" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
            <stop offset="46%" stopColor="#f97316" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g opacity="0.28" fill="none" stroke="#f97316">
          <circle cx="160" cy="154" r="112" strokeWidth="1.1" />
          <circle cx="160" cy="154" r="78" strokeWidth="0.8" strokeDasharray="4 12" />
          <circle cx="160" cy="154" r="42" strokeWidth="0.8" />
          <path d="M160 154 L160 86 M160 154 L214 178" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="1276" cy="198" r="132" strokeWidth="1.1" />
          <circle cx="1276" cy="198" r="92" strokeWidth="0.8" strokeDasharray="3 10" />
          <path d="M1276 198 C1202 226 1180 300 1226 352 C1280 412 1370 342 1328 286" strokeWidth="1" opacity="0.65" />
          <circle cx="1226" cy="352" r="6" fill="#f97316" opacity="0.8" />
        </g>

        <path
          d="M-40 780 C160 662 254 816 416 730 C560 653 662 610 820 664 C1010 730 1118 612 1480 660"
          fill="none"
          stroke="url(#timeWire)"
          strokeWidth="1.3"
        />
        <path
          d="M-30 858 C150 805 322 878 492 818 C650 762 760 736 916 782 C1086 832 1204 760 1468 790"
          fill="none"
          stroke="url(#timeWire)"
          strokeWidth="0.9"
          opacity="0.65"
        />

        {timeNodes.map((node, index) => (
          <g key={`${node.x}-${node.y}`}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r * 4.5}
              fill="url(#timeNode)"
              animate={reduced ? {} : { opacity: [0.08, 0.28, 0.08], r: [node.r * 3.1, node.r * 5.2, node.r * 3.1] }}
              transition={{ duration: 3.4, delay: index * 0.42, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.circle
              cx={node.x}
              cy={node.y}
              r={node.r}
              fill="#fbbf24"
              animate={reduced ? {} : { opacity: [0.32, 0.92, 0.32] }}
              transition={{ duration: 3.4, delay: index * 0.42, repeat: Infinity, ease: 'easeInOut' }}
            />
          </g>
        ))}
      </svg>

      <div
        className="absolute inset-0 opacity-[0.38]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.07) 1px, transparent 1px)',
          backgroundSize: '54px 54px',
          maskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 76%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 76%)',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#070709_0%,rgba(7,7,9,0.14)_18%,rgba(7,7,9,0.14)_82%,#070709_100%)]" />
    </div>
  )
}

function IntroClock({ active }: { active: boolean }) {
  const reduced = useReducedMotion()
  const ticks = Array.from({ length: 48 }, (_, index) => {
    const angle = (index / 48) * Math.PI * 2 - Math.PI / 2
    const major = index % 4 === 0
    const inner = major ? 51 : 56
    const outer = 62

    return {
      id: index,
      major,
      x1: 80 + Math.cos(angle) * inner,
      y1: 80 + Math.sin(angle) * inner,
      x2: 80 + Math.cos(angle) * outer,
      y2: 80 + Math.sin(angle) * outer,
    }
  })

  return (
    <motion.div
      aria-hidden="true"
      initial={{ opacity: 0, scale: 0.92, filter: 'blur(8px)' }}
      animate={active ? { opacity: 1, scale: 1, filter: 'blur(0px)' } : {}}
      transition={{ duration: reduced ? 0 : 0.55, ease }}
      className="relative mx-auto mb-7 h-[154px] w-[154px] rounded-full border border-amber-500/24 bg-amber-500/[0.035] shadow-[0_0_54px_rgba(245,158,11,0.12)]"
    >
      <svg viewBox="0 0 160 160" className="h-full w-full">
        <defs>
          <linearGradient id="automationClockGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="54%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={CLOCK_RADIUS} stroke="rgba(245,158,11,0.13)" strokeWidth="8" fill="none" />
        <motion.circle
          cx="80"
          cy="80"
          r={CLOCK_RADIUS}
          stroke="url(#automationClockGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={CLOCK_CIRCUMFERENCE}
          initial={{ strokeDashoffset: CLOCK_CIRCUMFERENCE }}
          animate={active ? { strokeDashoffset: 0 } : {}}
          transition={{ duration: reduced ? 0 : 1.15, ease: 'easeInOut' }}
          transform="rotate(-90 80 80)"
        />
        {ticks.map((tick) => (
          <line
            key={tick.id}
            x1={Number(tick.x1.toFixed(4))}
            y1={Number(tick.y1.toFixed(4))}
            x2={Number(tick.x2.toFixed(4))}
            y2={Number(tick.y2.toFixed(4))}
            stroke={tick.major ? 'rgba(254,243,199,0.48)' : 'rgba(254,243,199,0.18)'}
            strokeWidth={tick.major ? 1.6 : 0.9}
            strokeLinecap="round"
          />
        ))}
        <motion.line
          x1="80"
          y1="80"
          x2="80"
          y2="32"
          stroke="rgba(254,243,199,0.96)"
          strokeWidth="4"
          strokeLinecap="round"
          animate={active && !reduced ? { rotate: [0, 315, 360] } : {}}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{ transformOrigin: '80px 80px' }}
        />
        <line x1="80" y1="80" x2="112" y2="80" stroke="rgba(251,146,60,0.45)" strokeWidth="2.2" strokeLinecap="round" />
        <circle cx="80" cy="80" r="5.5" fill="#fff7ed" />
      </svg>
    </motion.div>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const reduced = useReducedMotion()

  return (
    <div className="mx-auto mb-14 flex max-w-4xl flex-col items-center text-center md:mb-20">
      <IntroClock active={isInView} />
      <motion.div
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative mb-5 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-amber-500/30 bg-amber-500/[0.05] px-4 py-1.5"
      >
        {!reduced && (
          <motion.span
            aria-hidden="true"
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4.2, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.2),transparent)]"
          />
        )}
        <Clock3 size={13} strokeWidth={2} className="relative z-10 text-amber-400" />
        <span className="relative z-10 h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
        <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-500">
          [ El camino al piloto automático ]
        </span>
      </motion.div>

      <motion.h2
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-[clamp(2.2rem,5vw,4.9rem)] font-black leading-[0.96] tracking-[-0.05em] text-white"
      >
        Del caos al orden
        <br />
        <span className="relative mt-2 inline-block bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#fb923c] bg-clip-text text-transparent">
          en 15 días.
          {!reduced && (
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.86, ease }}
              className="absolute -bottom-1 left-0 right-0 h-px origin-left bg-[linear-gradient(90deg,transparent,#f59e0b_38%,#fb923c_62%,transparent)]"
            />
          )}
        </span>
      </motion.h2>

      <motion.p
        initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.42 }}
        className="mt-6 max-w-2xl text-base leading-8 text-white/48 md:text-lg"
      >
        Una implementación corta, visible y medible: primero entendemos dónde se pierde tiempo, después conectamos, probamos y dejamos al equipo operando con menos trabajo manual.
      </motion.p>
    </div>
  )
}

function DiagnosticVisual({ active, colorRgb, reduced }: { active: boolean; colorRgb: string; reduced: boolean }) {
  return (
    <div className="relative h-full min-h-[13rem] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(20,12,8,0.86),rgba(8,8,14,0.94))] [perspective:900px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(245,158,11,0.24),transparent_42%),radial-gradient(circle_at_82%_78%,rgba(249,115,22,0.15),transparent_44%)]" />
      <motion.div
        className="absolute left-6 top-6 h-24 w-[48%] rounded-2xl border border-amber-300/25 bg-amber-300/[0.06] p-4"
        style={{ transformStyle: 'preserve-3d', transform: 'rotateX(58deg) rotateZ(-17deg)' }}
        animate={reduced ? {} : { y: active ? [0, -4, 0] : [0, -2, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {[0, 1, 2].map((line) => (
          <div
            key={line}
            className="mb-3 h-2 rounded-full bg-amber-100/65"
            style={{ width: `${86 - line * 18}%`, boxShadow: active ? `0 0 14px rgba(${colorRgb},0.22)` : 'none' }}
          />
        ))}
      </motion.div>
      <div className="absolute bottom-6 right-6 flex h-28 w-[44%] items-end gap-3 rounded-2xl border border-orange-300/18 bg-black/22 px-4 pb-4">
        {[42, 70, 54, 92].map((height, index) => (
          <motion.span
            key={height}
            className="w-full rounded-t-lg bg-[linear-gradient(180deg,rgba(251,146,60,0.95),rgba(245,158,11,0.24))]"
            style={{
              height: `${height}%`,
              transform: 'translateZ(24px)',
              boxShadow: active ? `0 0 18px rgba(${colorRgb},0.26), 0 14px 18px rgba(0,0,0,0.28)` : '0 10px 18px rgba(0,0,0,0.22)',
            }}
            animate={reduced ? {} : { scaleY: [0.84, 1, 0.9] }}
            transition={{ duration: 2.4, delay: index * 0.14, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>
      <motion.div
        className="absolute left-1/2 top-1/2 h-4 w-4 rounded-full bg-amber-100 shadow-[0_0_22px_rgba(245,158,11,0.8)]"
        animate={reduced ? {} : { x: [-82, 78, -82], y: [34, -22, 34], opacity: [0.35, 1, 0.35] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  )
}

function MapVisual({ active, colorRgb, reduced }: { active: boolean; colorRgb: string; reduced: boolean }) {
  const steps = [
    { label: 'Evento', value: 'Lead o pago' },
    { label: 'Regla', value: 'Validar datos' },
    { label: 'n8n', value: 'Orquestar flujo' },
    { label: 'Salida', value: 'Mail + sheet' },
  ]

  return (
    <div className="relative h-full min-h-[13rem] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(18,10,7,0.88),rgba(7,8,14,0.95))]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_50%,rgba(249,115,22,0.18),transparent_42%)]" />
      {/* Línea vertical animada - posicionada en el borde izquierdo */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M10 10V90" fill="none" stroke={`rgba(${colorRgb},0.16)`} strokeWidth="1.2" strokeLinecap="round" />
        <motion.path
          d="M10 10V90"
          fill="none"
          stroke={`rgba(${colorRgb},0.72)`}
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: reduced ? 1 : 0 }}
          animate={active ? { pathLength: reduced ? 1 : [0, 1, 1] } : { pathLength: reduced ? 1 : 0.18 }}
          transition={{ duration: reduced ? 0 : 2.8, repeat: active && !reduced ? Infinity : 0, repeatDelay: 0.45, ease: 'easeInOut' }}
        />
        {!reduced && (
          <motion.circle
            cx="10"
            cy="10"
            r="2.2"
            fill="#fff7ed"
            style={{ filter: `drop-shadow(0 0 8px rgba(${colorRgb},0.95))` }}
            animate={active ? { cy: [10, 90], opacity: [0, 1, 1, 0] } : { cy: 10, opacity: 0.28 }}
            transition={{ duration: 2.8, repeat: active ? Infinity : 0, repeatDelay: 0.45, ease: 'easeInOut' }}
          />
        )}
      </svg>
      {/* Cards centradas con margen izquierdo mínimo para dejar espacio a la línea */}
      <div className="relative z-10 grid h-full min-h-[13rem] content-center gap-2.5 px-4 py-5 pl-[14%] sm:pl-[12%]">
      {steps.map((step, index) => (
        <motion.div
          key={step.label}
          className="flex min-h-11 items-center gap-2.5 rounded-xl border px-3 py-2"
          style={{
            borderColor: `rgba(${colorRgb},${active ? 0.52 : 0.28})`,
            background: `rgba(${colorRgb},${active ? 0.105 : 0.045})`,
            boxShadow: active ? `0 12px 24px rgba(0,0,0,0.3), 0 0 18px rgba(${colorRgb},0.13)` : '0 10px 18px rgba(0,0,0,0.22)',
          }}
          animate={reduced ? {} : { opacity: active ? [0.72, 1, 0.72] : 0.72 }}
          transition={{ duration: 2.8, delay: index * 0.18, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
        >
          <span
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg font-mono text-[10px] font-black"
            style={{ background: `rgba(${colorRgb},0.18)`, color: '#fff7ed' }}
          >
            {index + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-mono text-[9px] font-black uppercase text-amber-200/52">{step.label}</span>
            <span className="mt-0.5 block break-words text-sm font-bold leading-tight text-white/82">{step.value}</span>
          </span>
        </motion.div>
      ))}
      </div>
    </div>
  )
}

function ActivationVisual({ active, colorRgb, reduced }: { active: boolean; colorRgb: string; reduced: boolean }) {
  return (
    <div className="relative h-full min-h-[13rem] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(20,12,6,0.9),rgba(8,8,14,0.94))] [perspective:900px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.2),transparent_48%)]" />
      <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-300/25" />
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[1.7rem] border bg-amber-500/[0.11]"
        style={{
          borderColor: `rgba(${colorRgb},0.38)`,
          boxShadow: active ? `0 0 36px rgba(${colorRgb},0.28), inset 0 0 22px rgba(${colorRgb},0.12)` : `0 0 16px rgba(${colorRgb},0.1)`,
          transformStyle: 'preserve-3d',
        }}
        animate={reduced ? {} : { rotateY: [0, 10, -8, 0], rotateX: [0, -6, 4, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Zap size={34} strokeWidth={2.4} className="text-amber-300" />
      </motion.div>
      {[0, 1, 2, 3].map((index) => (
        <motion.span
          key={index}
          className="absolute h-2.5 w-2.5 rounded-full bg-amber-100"
          style={{
            left: `${24 + index * 17}%`,
            top: `${34 + (index % 2) * 32}%`,
            boxShadow: `0 0 18px rgba(${colorRgb},0.88)`,
          }}
          animate={reduced ? {} : { scale: [0.7, 1.35, 0.7], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2.1, delay: index * 0.28, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

function SupportVisual({ active, colorRgb, reduced }: { active: boolean; colorRgb: string; reduced: boolean }) {
  return (
    <div className="relative h-full min-h-[13rem] overflow-hidden rounded-[1.25rem] border border-white/10 bg-[linear-gradient(145deg,rgba(20,13,7,0.88),rgba(7,8,14,0.95))] [perspective:900px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_24%,rgba(251,146,60,0.2),transparent_48%)]" />
      <div className="absolute left-6 top-6 right-6 grid grid-cols-3 gap-3">
        {[ShieldCheck, Bot, SlidersHorizontal].map((Icon, index) => (
          <motion.div
            key={index}
            className="grid h-20 place-items-center rounded-2xl border bg-white/[0.035]"
            style={{
              borderColor: `rgba(${colorRgb},${active ? 0.36 : 0.16})`,
              transform: `rotateX(24deg) translateZ(${12 + index * 6}px)`,
              boxShadow: active ? `0 14px 24px rgba(0,0,0,0.32), 0 0 18px rgba(${colorRgb},0.16)` : '0 10px 18px rgba(0,0,0,0.22)',
            }}
            animate={reduced ? {} : { y: [0, index % 2 ? 4 : -4, 0] }}
            transition={{ duration: 3 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={24} strokeWidth={2} className="text-orange-200" />
          </motion.div>
        ))}
      </div>
      <div className="absolute bottom-6 left-6 right-6 rounded-2xl border border-orange-300/16 bg-black/22 p-4">
        <div className="mb-3 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.18em] text-orange-200/70">
          <span>handoff</span>
          <span>30 días</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-400"
            animate={reduced ? { width: '82%' } : { width: ['28%', '82%', '28%'] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ boxShadow: `0 0 14px rgba(${colorRgb},0.54)` }}
          />
        </div>
      </div>
    </div>
  )
}

function StageVisual({ step, active, reduced }: { step: ProcesoStep; active: boolean; reduced: boolean }) {
  if (step.visual === 'diagnostic') return <DiagnosticVisual active={active} colorRgb={step.colorRgb} reduced={reduced} />
  if (step.visual === 'map') return <MapVisual active={active} colorRgb={step.colorRgb} reduced={reduced} />
  if (step.visual === 'activation') return <ActivationVisual active={active} colorRgb={step.colorRgb} reduced={reduced} />
  return <SupportVisual active={active} colorRgb={step.colorRgb} reduced={reduced} />
}

function TimelineCard({
  step,
  index,
  isTabletOrDown,
}: {
  step: ProcesoStep
  index: number
  isTabletOrDown: boolean
}) {
  const cardRef = useRef<HTMLElement>(null)
  const visible = useInView(cardRef, { amount: isTabletOrDown ? 0.24 : 0.44, margin: isTabletOrDown ? centerBand : '-28% 0px -28% 0px' })
  const reduced = !!useReducedMotion()
  const [hovered, setHovered] = useState(false)
  const active = visible || hovered
  const Icon = step.icon
  const alignRight = index % 2 === 1

  return (
    <article
      ref={cardRef}
      className={`relative z-10 mb-16 w-full lg:mb-28 lg:flex ${alignRight ? 'lg:justify-end' : 'lg:justify-start'}`}
    >
      <motion.div
        initial={reduced ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y: 26, filter: 'blur(10px)' }}
        animate={
          active
            ? { opacity: 1, y: 0, filter: 'blur(0px)' }
            : isTabletOrDown
              ? { opacity: 0.82, y: 0, filter: 'blur(0px)' }
              : { opacity: 0.28, y: 14, filter: 'blur(5px)' }
        }
        transition={{ duration: reduced ? 0 : active ? 0.34 : 0.12, ease }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        whileHover={reduced || isTabletOrDown ? {} : { y: -8, scale: 1.006, transition: { duration: 0, ease: 'linear' } }}
        className="group w-full lg:w-[min(47rem,48%)]"
      >
        <div
          className="relative overflow-hidden rounded-[2rem] border p-4 backdrop-blur-md sm:p-5 md:p-6"
          style={{
            borderColor: active ? `rgba(${step.colorRgb},0.44)` : 'rgba(255,255,255,0.09)',
            background: active
              ? `linear-gradient(150deg, rgba(${step.colorRgb},0.12), rgba(9,9,14,0.92) 54%, rgba(${step.colorRgb},0.06))`
              : 'rgba(255,255,255,0.02)',
            boxShadow: active
              ? `0 0 0 1px rgba(${step.colorRgb},0.2), 0 24px 80px rgba(0,0,0,0.4), 0 0 42px rgba(${step.colorRgb},0.14)`
              : '0 18px 70px rgba(0,0,0,0.28)',
            transition: 'none',
          }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),transparent_30%,transparent_76%,rgba(245,158,11,0.08))]" />
          <div className="pointer-events-none absolute -right-5 -top-8 text-[7rem] font-black leading-none text-transparent opacity-80 md:text-[9rem]" style={{ WebkitTextStroke: active ? `2px rgba(${step.colorRgb},0.22)` : '2px rgba(255,255,255,0.1)' }}>
            {step.phase.slice(-2)}
          </div>

          <div className="relative z-10 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span
                  className="grid h-12 w-12 place-items-center rounded-2xl border"
                  style={{
                    borderColor: `rgba(${step.colorRgb},0.34)`,
                    background: `rgba(${step.colorRgb},${active ? 0.15 : 0.08})`,
                    color: step.color,
                    boxShadow: active ? `0 0 22px rgba(${step.colorRgb},0.22)` : 'none',
                  }}
                >
                  <Icon size={22} strokeWidth={2.2} />
                </span>
                <span className="min-w-0">
                  <span className="block font-mono text-[10px] font-black uppercase tracking-[0.26em]" style={{ color: `rgba(${step.colorRgb},0.72)` }}>
                    {step.phase}
                  </span>
                  <span className="mt-1 inline-flex max-w-full rounded-full border px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.13em]" style={{ borderColor: `rgba(${step.colorRgb},0.26)`, color: step.color, background: `rgba(${step.colorRgb},0.08)` }}>
                    {step.badge}
                  </span>
                </span>
              </div>

              <h3 className="text-[clamp(1.55rem,3vw,2.35rem)] font-black leading-[0.98] tracking-[-0.04em] text-white">
                {step.title}
              </h3>
              <p className="mt-4 text-sm leading-7 text-white/52 md:text-base">{step.summary}</p>

              <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/28">duración</span>
                  <strong className="mt-1 block text-sm text-white">{step.duration}</strong>
                </div>
                <div className="rounded-2xl border border-white/8 bg-black/22 p-3">
                  <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-white/28">resultado</span>
                  <strong className="mt-1 block text-sm" style={{ color: step.color }}>{step.metric}</strong>
                </div>
              </div>
            </div>

            <StageVisual step={step} active={active} reduced={reduced} />
          </div>

          <motion.div
            initial={false}
            animate={{
              opacity: active ? 1 : isTabletOrDown ? 0.56 : 0.18,
              filter: active ? 'blur(0px)' : isTabletOrDown ? 'blur(0px)' : 'blur(1.5px)',
            }}
            transition={{ duration: reduced ? 0 : 0.12, ease: 'linear' }}
            className="relative z-10"
          >
            <div className="mt-6 grid gap-4 border-t pt-5 md:grid-cols-2" style={{ borderColor: `rgba(${step.colorRgb},0.14)` }}>
              <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-4">
                <h4 className="mb-3 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: `rgba(${step.colorRgb},0.72)` }}>
                  <Sparkles size={13} strokeWidth={2} />
                  DevelOP ejecuta
                </h4>
                <div className="flex flex-col gap-2.5">
                  {step.develop.map((item) => (
                    <span key={item} className="flex items-start gap-2 text-sm leading-6 text-white/56">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: step.color, boxShadow: `0 0 8px rgba(${step.colorRgb},0.5)` }} />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/7 bg-white/[0.025] p-4">
                <h4 className="mb-3 flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/42">
                  <Network size={13} strokeWidth={2} />
                  Tu equipo aporta
                </h4>
                <div className="flex flex-col gap-2.5">
                  {step.cliente.map((item) => (
                    <span key={item} className="flex items-start gap-2 text-sm leading-6 text-white/46">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/25" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="mt-4 flex items-start gap-3 rounded-2xl border p-4"
              style={{
                borderColor: `rgba(${step.colorRgb},0.28)`,
                background: `rgba(${step.colorRgb},0.065)`,
                boxShadow: `0 0 20px rgba(${step.colorRgb},0.08)`,
              }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border" style={{ borderColor: `rgba(${step.colorRgb},0.28)`, color: step.color, background: `rgba(${step.colorRgb},0.1)` }}>
                <CheckCircle2 size={17} strokeWidth={2.2} />
              </span>
              <span>
                <span className="block font-mono text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: `rgba(${step.colorRgb},0.68)` }}>
                  Entregable
                </span>
                <span className="mt-1 block text-sm font-semibold leading-6 text-white/86">{step.deliverable}</span>
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </article>
  )
}

function LightningTimeline({
  sectionRef,
  reduced,
}: {
  sectionRef: React.RefObject<HTMLElement | null>
  reduced: boolean
}) {
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 42%', 'end 70%'],
  })
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1])
  const pathOpacity = useTransform(scrollYProgress, [0, 0.08, 1], [0.16, 0.92, 0.92])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-y-[18rem] left-0 right-0 z-[1] hidden overflow-visible lg:block">
      <svg viewBox="0 0 1200 1680" preserveAspectRatio="none" className="h-full w-full overflow-visible">
        <defs>
          <linearGradient id="boltTimelineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>
        </defs>
        <path
          d="M610 0 C520 150 720 232 590 374 C470 502 702 590 585 742 C482 876 742 948 596 1094 C458 1232 700 1326 604 1680"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="2"
          strokeDasharray="10 18"
        />
        <motion.path
          d="M610 0 C520 150 720 232 590 374 C470 502 702 590 585 742 C482 876 742 948 596 1094 C458 1232 700 1326 604 1680"
          fill="none"
          stroke="url(#boltTimelineGradient)"
          strokeWidth="26"
          strokeOpacity="0.12"
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : pathLength, opacity: reduced ? 0.28 : pathOpacity }}
        />
        <motion.path
          d="M610 0 C520 150 720 232 590 374 C470 502 702 590 585 742 C482 876 742 948 596 1094 C458 1232 700 1326 604 1680"
          fill="none"
          stroke="url(#boltTimelineGradient)"
          strokeWidth="12"
          strokeOpacity="0.22"
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : pathLength, opacity: reduced ? 0.34 : pathOpacity }}
        />
        <motion.path
          d="M610 0 C520 150 720 232 590 374 C470 502 702 590 585 742 C482 876 742 948 596 1094 C458 1232 700 1326 604 1680"
          fill="none"
          stroke="url(#boltTimelineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          style={{ pathLength: reduced ? 1 : pathLength, opacity: reduced ? 0.82 : pathOpacity }}
        />
      </svg>
    </div>
  )
}

function TabletRail() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-7 top-0 z-[1] hidden w-px bg-white/8 md:block lg:hidden">
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-amber-500/70 to-transparent shadow-[0_0_16px_rgba(245,158,11,0.45)]" />
    </div>
  )
}

function MobileRail() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-4 top-0 z-[1] w-px bg-white/8 md:hidden">
      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-amber-500/70 to-transparent shadow-[0_0_16px_rgba(245,158,11,0.45)]" />
    </div>
  )
}

export default function ProcesoAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.1 })
  const reduced = !!useReducedMotion()
  const { isMobile, isTabletOrDown } = useViewportFlags()

  return (
    <section
      id="proceso"
      ref={sectionRef}
      className="relative z-[1] w-full overflow-hidden bg-[#070709] px-5 py-24 sm:px-8 md:px-10 md:py-32 lg:px-12 lg:py-40"
    >
      <AtmosphereProceso />

      <div className="relative z-10 mx-auto max-w-7xl">
        <Header isInView={isInView} />

        <div className="relative mx-auto max-w-6xl">
          <LightningTimeline sectionRef={sectionRef} reduced={reduced} />
          <TabletRail />
          <MobileRail />

          <div className={`relative z-10 ${isMobile ? 'pl-7' : isTabletOrDown ? 'pl-12' : ''}`}>
            {pasos.map((step, index) => (
              <TimelineCard key={step.id} step={step} index={index} isTabletOrDown={isTabletOrDown} />
            ))}
          </div>
        </div>

        <motion.div
          initial={reduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: reduced ? 0 : 0.65, delay: 0.2, ease }}
          className="mx-auto mt-4 flex max-w-4xl flex-col gap-4 rounded-[2rem] border border-amber-500/18 bg-amber-500/[0.045] p-5 shadow-[0_20px_70px_rgba(0,0,0,0.3)] md:flex-row md:items-center md:justify-between md:p-6"
        >
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-amber-500/28 bg-amber-500/10 text-amber-400">
              <TimerReset size={22} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block font-mono text-[10px] font-black uppercase tracking-[0.22em] text-amber-300/72">
                Tiempo total según complejidad
              </span>
              <strong className="mt-1 block text-2xl font-black tracking-[-0.03em] text-white md:text-3xl">1 a 2 semanas</strong>
              <span className="mt-1 block text-sm leading-6 text-white/42">De mapa operativo a piloto automático funcionando con soporte.</span>
            </span>
          </div>
          <a
            href="#contacto"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-amber-500/24 bg-amber-500/10 px-5 py-3 text-sm font-black uppercase tracking-[0.08em] text-amber-200"
            style={{ transition: 'none' }}
          >
            Planificar flujo
            <ArrowRight size={16} strokeWidth={2.2} className="transition-none group-hover:translate-x-0.5" />
          </a>
        </motion.div>

        <motion.div
          initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: reduced ? 0 : 1.2, delay: 0.5, ease }}
          className="mt-16 h-px origin-left bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.3)_30%,rgba(249,115,22,0.42)_50%,rgba(245,158,11,0.3)_70%,transparent)]"
        />
      </div>
    </section>
  )
}
