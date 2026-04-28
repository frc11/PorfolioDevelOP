'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, AnimatePresence } from 'motion/react'
import {
  Activity,
  Building2,
  CalendarDays,
  Car,
  DollarSign,
  FileText,
  HeartPulse,
  Pause,
  Play,
  Store,
  UtensilsCrossed,
  Users,
  type LucideIcon,
} from 'lucide-react'

type ValueFormatter = (value: number) => string

interface WidgetData {
  label: string
  value: number
  change: string
  positive: boolean
  color: string
  colorRgb: string
  icon: LucideIcon
  formatDisplay: ValueFormatter
}

interface ActivityItem {
  text: string
  time: string
  dot: string
}

interface RubroSnapshot {
  id: number
  slug: string
  label: string
  icon: LucideIcon
  color: string
  colorRgb: string
  gradient: string
  url: string
  month: string
  focusTitle: string
  focusSub: string
  widgets: WidgetData[]
  bars: number[]
  activity: ActivityItem[]
}

const AUTO_ROTATION_MS = 5200
const BAR_LABELS = ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

const formatCurrencyCompact = (value: number) => {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  return `$${Math.round(value / 1000).toLocaleString('es-AR')}K`
}

const formatCurrency = (value: number) => `$${Math.round(value).toLocaleString('es-AR')}`
const formatInteger = (value: number) => Math.round(value).toLocaleString('es-AR')
const formatPercent = (value: number) => `${value.toFixed(1)}%`

const rubroSnapshots: RubroSnapshot[] = [
  {
    id: 0,
    slug: 'concesionaria',
    label: 'Concesionaria',
    icon: Car,
    color: '#7b61ff',
    colorRgb: '123,97,255',
    gradient: 'linear-gradient(135deg, #6366f1, #7b2fff)',
    url: 'autonorte.com.ar/panel',
    month: 'Dic 2025',
    focusTitle: 'Embudo de test drive activo',
    focusSub: 'Stock, financiacion y cierre alineados',
    widgets: [
      {
        label: 'Ventas del mes',
        value: 14_280_000,
        change: '+9.4%',
        positive: true,
        color: '#6366f1',
        colorRgb: '99,102,241',
        icon: DollarSign,
        formatDisplay: formatCurrencyCompact,
      },
      {
        label: 'Leads activos',
        value: 412,
        change: '+11.8%',
        positive: true,
        color: '#7b2fff',
        colorRgb: '123,47,255',
        icon: Users,
        formatDisplay: formatInteger,
      },
      {
        label: 'Test drives agendados',
        value: 126,
        change: '+17.2%',
        positive: true,
        color: '#818cf8',
        colorRgb: '129,140,248',
        icon: CalendarDays,
        formatDisplay: formatInteger,
      },
      {
        label: 'Cierre comercial',
        value: 37.4,
        change: '+2.1pp',
        positive: true,
        color: '#34d399',
        colorRgb: '52,211,153',
        icon: Activity,
        formatDisplay: formatPercent,
      },
    ],
    bars: [54, 58, 56, 63, 66, 64, 70, 74, 78, 84, 80, 82],
    activity: [
      { text: 'Lead #1987 confirmo test drive', time: 'hace 2 min', dot: '#6366f1' },
      { text: 'Cotizacion enviada - SUV Touring', time: 'hace 5 min', dot: '#7b2fff' },
      { text: 'Unidad reservada - Cliente Molina', time: 'hace 9 min', dot: '#818cf8' },
      { text: 'Credito preaprobado por banco aliado', time: 'hace 13 min', dot: '#34d399' },
      { text: 'Entrega programada para este viernes', time: 'hace 19 min', dot: '#6366f1' },
      { text: 'Firma digital completada en portal', time: 'hace 24 min', dot: '#818cf8' },
      { text: 'Recordatorio automatico de visita', time: 'hace 31 min', dot: '#7b2fff' },
      { text: 'Seguimiento postventa activado', time: 'hace 40 min', dot: '#34d399' },
    ],
  },
  {
    id: 1,
    slug: 'salud',
    label: 'Salud',
    icon: HeartPulse,
    color: '#22c55e',
    colorRgb: '34,197,94',
    gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    url: 'clinicacentro.com.ar/control',
    month: 'Ene 2026',
    focusTitle: 'Agenda medica sin huecos',
    focusSub: 'Turnos, seguimiento y caja sincronizados',
    widgets: [
      {
        label: 'Turnos del mes',
        value: 3670,
        change: '+12.6%',
        positive: true,
        color: '#16a34a',
        colorRgb: '22,163,74',
        icon: CalendarDays,
        formatDisplay: formatInteger,
      },
      {
        label: 'Pacientes activos',
        value: 1984,
        change: '+7.1%',
        positive: true,
        color: '#22c55e',
        colorRgb: '34,197,94',
        icon: Users,
        formatDisplay: formatInteger,
      },
      {
        label: 'Facturacion neta',
        value: 8_920_000,
        change: '+18.3%',
        positive: true,
        color: '#34d399',
        colorRgb: '52,211,153',
        icon: FileText,
        formatDisplay: formatCurrencyCompact,
      },
      {
        label: 'Asistencia confirmada',
        value: 93.9,
        change: '+1.8pp',
        positive: true,
        color: '#86efac',
        colorRgb: '134,239,172',
        icon: Activity,
        formatDisplay: formatPercent,
      },
    ],
    bars: [61, 64, 67, 69, 72, 74, 70, 76, 79, 82, 84, 86],
    activity: [
      { text: 'Turno confirmado - Pediatria 16:30', time: 'hace 1 min', dot: '#22c55e' },
      { text: 'Recordatorio enviado a 32 pacientes', time: 'hace 4 min', dot: '#16a34a' },
      { text: 'Receta digital emitida - Dra Suarez', time: 'hace 8 min', dot: '#34d399' },
      { text: 'Consulta de guardia clasificada como urgente', time: 'hace 12 min', dot: '#86efac' },
      { text: 'Historia clinica actualizada automaticamente', time: 'hace 17 min', dot: '#22c55e' },
      { text: 'Cobertura validada con obra social', time: 'hace 23 min', dot: '#34d399' },
      { text: 'Reprogramacion inteligente completada', time: 'hace 29 min', dot: '#16a34a' },
      { text: 'Panel de ausencias actualizado', time: 'hace 37 min', dot: '#86efac' },
    ],
  },
  {
    id: 2,
    slug: 'gastronomia',
    label: 'Gastronomia',
    icon: UtensilsCrossed,
    color: '#f59e0b',
    colorRgb: '245,158,11',
    gradient: 'linear-gradient(135deg, #f59e0b, #f97316)',
    url: 'barranorte.com.ar/dashboard',
    month: 'Feb 2026',
    focusTitle: 'Servicio en hora pico bajo control',
    focusSub: 'Reservas, delivery y sala en tiempo real',
    widgets: [
      {
        label: 'Ventas del mes',
        value: 9_870_000,
        change: '+14.2%',
        positive: true,
        color: '#f59e0b',
        colorRgb: '245,158,11',
        icon: DollarSign,
        formatDisplay: formatCurrencyCompact,
      },
      {
        label: 'Reservas activas',
        value: 286,
        change: '+9.7%',
        positive: true,
        color: '#f97316',
        colorRgb: '249,115,22',
        icon: CalendarDays,
        formatDisplay: formatInteger,
      },
      {
        label: 'Ticket promedio',
        value: 42_600,
        change: '+5.4%',
        positive: true,
        color: '#fbbf24',
        colorRgb: '251,191,36',
        icon: FileText,
        formatDisplay: formatCurrency,
      },
      {
        label: 'Ocupacion de mesas',
        value: 87.2,
        change: '+3.2pp',
        positive: true,
        color: '#fcd34d',
        colorRgb: '252,211,77',
        icon: Activity,
        formatDisplay: formatPercent,
      },
    ],
    bars: [48, 52, 57, 62, 66, 71, 76, 81, 79, 84, 88, 92],
    activity: [
      { text: 'Mesa 12 confirmada para las 21:00', time: 'hace 2 min', dot: '#f59e0b' },
      { text: 'Pedido delivery #842 despachado', time: 'hace 6 min', dot: '#f97316' },
      { text: 'Menu sugerido enviado por WhatsApp', time: 'hace 10 min', dot: '#fbbf24' },
      { text: 'Recordatorio de reserva enviado', time: 'hace 14 min', dot: '#fcd34d' },
      { text: 'Stock de barra actualizado', time: 'hace 19 min', dot: '#f59e0b' },
      { text: 'Alerta de cocina priorizada por tiempo', time: 'hace 25 min', dot: '#f97316' },
      { text: 'Encuesta post-servicio automatizada', time: 'hace 32 min', dot: '#fbbf24' },
      { text: 'Panel de mesas sincronizado con POS', time: 'hace 41 min', dot: '#fcd34d' },
    ],
  },
  {
    id: 3,
    slug: 'comercio',
    label: 'Comercio',
    icon: Store,
    color: '#34d399',
    colorRgb: '52,211,153',
    gradient: 'linear-gradient(135deg, #34d399, #0ea5a2)',
    url: 'tiendauno.com.ar/operaciones',
    month: 'Mar 2026',
    focusTitle: 'Operacion omnicanal unificada',
    focusSub: 'Inventario, consultas y cobros conectados',
    widgets: [
      {
        label: 'Ventas omnicanal',
        value: 11_420_000,
        change: '+10.1%',
        positive: true,
        color: '#34d399',
        colorRgb: '52,211,153',
        icon: DollarSign,
        formatDisplay: formatCurrencyCompact,
      },
      {
        label: 'Pedidos activos',
        value: 631,
        change: '+13.8%',
        positive: true,
        color: '#0ea5a2',
        colorRgb: '14,165,164',
        icon: Users,
        formatDisplay: formatInteger,
      },
      {
        label: 'Carritos recuperados',
        value: 184,
        change: '+22.9%',
        positive: true,
        color: '#2dd4bf',
        colorRgb: '45,212,191',
        icon: FileText,
        formatDisplay: formatInteger,
      },
      {
        label: 'SLA de respuesta',
        value: 96.4,
        change: '+2.6pp',
        positive: true,
        color: '#6ee7b7',
        colorRgb: '110,231,183',
        icon: Activity,
        formatDisplay: formatPercent,
      },
    ],
    bars: [57, 60, 64, 66, 72, 74, 76, 81, 84, 86, 89, 93],
    activity: [
      { text: 'Consulta de producto respondida en 12s', time: 'hace 1 min', dot: '#34d399' },
      { text: 'Pago aprobado - Orden #6724', time: 'hace 5 min', dot: '#0ea5a2' },
      { text: 'Reposicion sugerida para categoria A', time: 'hace 9 min', dot: '#2dd4bf' },
      { text: 'Carrito abandonado recuperado', time: 'hace 13 min', dot: '#6ee7b7' },
      { text: 'Envio coordinado con operador logistico', time: 'hace 18 min', dot: '#34d399' },
      { text: 'Promocion segmentada disparada automaticamente', time: 'hace 24 min', dot: '#2dd4bf' },
      { text: 'Stock de sucursal sincronizado', time: 'hace 30 min', dot: '#0ea5a2' },
      { text: 'Alerta de margen bajo priorizada', time: 'hace 38 min', dot: '#6ee7b7' },
    ],
  },
  {
    id: 4,
    slug: 'inmobiliaria',
    label: 'Inmobiliaria',
    icon: Building2,
    color: '#8b5cf6',
    colorRgb: '139,92,246',
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
    url: 'nuevabroker.com.ar/crm',
    month: 'Abr 2026',
    focusTitle: 'Pipeline de propiedades ordenado',
    focusSub: 'Leads calificados y visitas sin friccion',
    widgets: [
      {
        label: 'Facturacion neta',
        value: 12_640_000,
        change: '+15.8%',
        positive: true,
        color: '#8b5cf6',
        colorRgb: '139,92,246',
        icon: DollarSign,
        formatDisplay: formatCurrencyCompact,
      },
      {
        label: 'Leads calificados',
        value: 294,
        change: '+19.2%',
        positive: true,
        color: '#7c3aed',
        colorRgb: '124,58,237',
        icon: Users,
        formatDisplay: formatInteger,
      },
      {
        label: 'Visitas agendadas',
        value: 172,
        change: '+12.1%',
        positive: true,
        color: '#a78bfa',
        colorRgb: '167,139,250',
        icon: CalendarDays,
        formatDisplay: formatInteger,
      },
      {
        label: 'Conversion de leads',
        value: 29.8,
        change: '+4.1pp',
        positive: true,
        color: '#c4b5fd',
        colorRgb: '196,181,253',
        icon: Activity,
        formatDisplay: formatPercent,
      },
    ],
    bars: [42, 46, 53, 57, 63, 68, 72, 75, 79, 83, 86, 90],
    activity: [
      { text: 'Lead premium etiquetado como comprador real', time: 'hace 2 min', dot: '#8b5cf6' },
      { text: 'Visita confirmada - Torre Catalinas 18:00', time: 'hace 6 min', dot: '#7c3aed' },
      { text: 'Ficha completa enviada por WhatsApp', time: 'hace 11 min', dot: '#a78bfa' },
      { text: 'Prioridad alta para alquiler temporal', time: 'hace 16 min', dot: '#c4b5fd' },
      { text: 'Comparativa de propiedades generada', time: 'hace 21 min', dot: '#8b5cf6' },
      { text: 'Checklist legal actualizado en CRM', time: 'hace 28 min', dot: '#a78bfa' },
      { text: 'Seguimiento automatico a lead frio', time: 'hace 35 min', dot: '#7c3aed' },
      { text: 'Embudo de cierre recalculado por zona', time: 'hace 44 min', dot: '#c4b5fd' },
    ],
  },
]

const LEFT_STAGE_BARS = [18, 26, 34, 42, 30, 50, 66, 54, 40, 62, 74, 58]
const RIGHT_STAGE_BARS = [22, 30, 38, 46, 56, 66, 74, 82, 70, 88, 96, 84]

const SIGNAL_PATHS = [
  'M -80 252 C 72 178, 198 318, 350 238 C 498 160, 640 318, 804 222 C 936 146, 1098 286, 1280 196',
  'M -60 286 C 124 358, 238 188, 430 276 C 566 340, 700 180, 874 264 C 1030 338, 1140 200, 1280 254',
  'M -70 218 C 128 128, 248 314, 422 206 C 586 102, 702 304, 900 178 C 1036 116, 1164 262, 1280 152',
]

const SIGNAL_NODES = [
  { x: 8, y: 71, size: 3.8, delay: 0.1 },
  { x: 16, y: 63, size: 2.6, delay: 0.4 },
  { x: 24, y: 68, size: 3.2, delay: 0.8 },
  { x: 34, y: 58, size: 2.8, delay: 1.1 },
  { x: 44, y: 64, size: 3.4, delay: 1.5 },
  { x: 54, y: 56, size: 2.4, delay: 1.9 },
  { x: 64, y: 61, size: 3.2, delay: 2.1 },
  { x: 74, y: 55, size: 2.8, delay: 2.5 },
  { x: 84, y: 60, size: 3.6, delay: 2.8 },
  { x: 92, y: 52, size: 3.1, delay: 3.2 },
]

function CountUp({
  to,
  formatDisplay,
  delay = 0,
}: {
  to: number
  formatDisplay: ValueFormatter
  delay?: number
}) {
  const [value, setValue] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    let rafId = 0
    const timer = window.setTimeout(() => {
      const duration = 900
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        setValue(to * ease)
        if (t < 1) {
          rafId = window.requestAnimationFrame(tick)
          return
        }
        setValue(to)
      }
      rafId = window.requestAnimationFrame(tick)
    }, delay * 1000)

    return () => {
      window.clearTimeout(timer)
      if (rafId) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [to, delay, reducedMotion])

  return <span>{formatDisplay(reducedMotion ? to : value)}</span>
}

export default function DashboardMockupSoftware() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 })
  const reducedMotion = useReducedMotion()

  const [activeRubro, setActiveRubro] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [rotationProgress, setRotationProgress] = useState(0)
  const [feedOffset, setFeedOffset] = useState(0)
  const [isAutoHoverViewport, setIsAutoHoverViewport] = useState(false)
  const [centerHoverMap, setCenterHoverMap] = useState<Record<string, boolean>>({})
  const rotationProgressRef = useRef(0)

  const effectiveReducedMotion = Boolean(reducedMotion)
  const isAutoPaused = isPaused || effectiveReducedMotion
  const currentRubro = rubroSnapshots[activeRubro] ?? rubroSnapshots[0]
  const cyclePercent = Math.round(rotationProgress * 100)

  useEffect(() => {
    if (!isInView) {
      return
    }
    const id = window.setInterval(() => {
      setFeedOffset((prev) => (prev + 1) % currentRubro.activity.length)
    }, 2800)
    return () => window.clearInterval(id)
  }, [isInView, activeRubro, currentRubro.activity.length])

  useEffect(() => {
    if (!isInView || isAutoPaused) {
      return
    }

    let rafId = 0
    const start = performance.now() - rotationProgressRef.current * AUTO_ROTATION_MS

    const tick = (now: number) => {
      const elapsed = now - start
      const nextProgress = Math.min(elapsed / AUTO_ROTATION_MS, 1)
      rotationProgressRef.current = nextProgress
      setRotationProgress(nextProgress)

      if (nextProgress >= 1) {
        rotationProgressRef.current = 0
        setRotationProgress(0)
        setActiveRubro((prev) => (prev + 1) % rubroSnapshots.length)
        return
      }

      rafId = window.requestAnimationFrame(tick)
    }

    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [activeRubro, isAutoPaused, isInView])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncViewportMode = () => {
      const viewportWidth = Math.max(
        window.innerWidth,
        window.visualViewport?.width ?? 0,
        window.screen.width ?? 0
      )
      const shouldAutoHover = viewportWidth < 1024

      setIsAutoHoverViewport(shouldAutoHover)
      if (!shouldAutoHover) {
        setCenterHoverMap({})
      }
    }

    syncViewportMode()
    window.addEventListener('resize', syncViewportMode)
    window.visualViewport?.addEventListener('resize', syncViewportMode)

    return () => {
      window.removeEventListener('resize', syncViewportMode)
      window.visualViewport?.removeEventListener('resize', syncViewportMode)
    }
  }, [])

  useEffect(() => {
    if (!isAutoHoverViewport) return
    const sectionElement = sectionRef.current
    if (!sectionElement) return

    const observer = new IntersectionObserver(
      (entries) => {
        setCenterHoverMap((previous) => {
          let changed = false
          const next = { ...previous }

          entries.forEach((entry) => {
            const key = (entry.target as HTMLElement).dataset.centerHoverKey
            if (!key) return

            const isActive = entry.isIntersecting
            if (next[key] === isActive) return
            next[key] = isActive
            changed = true
          })

          return changed ? next : previous
        })
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '-45% 0px -45% 0px',
      }
    )

    const centerTargets = sectionElement.querySelectorAll<HTMLElement>('[data-center-hover-key]')
    centerTargets.forEach((target) => observer.observe(target))

    return () => observer.disconnect()
  }, [isAutoHoverViewport, activeRubro, feedOffset])

  const visibleActivityItems = useMemo(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        return currentRubro.activity[(feedOffset + i) % currentRubro.activity.length]
      }),
    [currentRubro, feedOffset]
  )

  const peakBarIndex = useMemo(() => {
    const maxValue = Math.max(...currentRubro.bars)
    return currentRubro.bars.indexOf(maxValue)
  }, [currentRubro])

  const ActiveRubroIcon = currentRubro.icon
  const isCenterHoverActive = (key: string) => isAutoHoverViewport && centerHoverMap[key] === true

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#06060f] px-4 py-16 sm:px-8 sm:py-20 md:px-10 md:py-20 lg:px-12 lg:py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'radial-gradient(120% 74% at 50% -4%, rgba(95,84,215,0.22) 0%, rgba(14,14,32,0) 56%), radial-gradient(90% 76% at 86% 96%, rgba(100,76,204,0.2) 0%, rgba(7,7,18,0) 70%), linear-gradient(180deg, #04040c 0%, #05050f 38%, #04040a 100%)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.34]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(26deg, rgba(125,211,252,0.08) 0 1px, transparent 1px 24px), repeating-linear-gradient(94deg, rgba(167,139,250,0.08) 0 1px, transparent 1px 28px), repeating-linear-gradient(154deg, rgba(129,140,248,0.08) 0 1px, transparent 1px 30px)',
          animation: effectiveReducedMotion ? 'none' : 'dashboardBgDriftA 30s ease-in-out infinite',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.22]"
        style={{
          backgroundImage:
            'repeating-radial-gradient(circle at 28% 42%, rgba(196,181,253,0.24) 0 1px, transparent 1px 12px), repeating-radial-gradient(circle at 72% 58%, rgba(129,140,248,0.2) 0 1px, transparent 1px 11px)',
          animation: effectiveReducedMotion ? 'none' : 'dashboardBgDriftB 34s ease-in-out infinite',
          mixBlendMode: 'screen',
        }}
      />

      <motion.div
        key={`bg-aura-center-${currentRubro.id}`}
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[4%] z-0 h-[620px] w-[980px] -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: `radial-gradient(ellipse, rgba(${currentRubro.colorRgb},0.2) 0%, rgba(${currentRubro.colorRgb},0.06) 42%, transparent 72%)`,
          filter: 'blur(84px)',
        }}
      />

      <motion.div
        key={`bg-aura-left-${currentRubro.id}`}
        aria-hidden="true"
        className="pointer-events-none absolute left-[-12%] top-[18%] z-0 h-[420px] w-[520px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: `radial-gradient(circle, rgba(${currentRubro.colorRgb},0.16) 0%, rgba(129,140,248,0.05) 48%, transparent 76%)`,
          filter: 'blur(54px)',
        }}
      />

      <motion.div
        key={`bg-aura-right-${currentRubro.id}`}
        aria-hidden="true"
        className="pointer-events-none absolute right-[-14%] top-[22%] z-0 h-[460px] w-[560px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: `radial-gradient(circle, rgba(124,58,237,0.24) 0%, rgba(${currentRubro.colorRgb},0.08) 42%, transparent 76%)`,
          filter: 'blur(58px)',
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-18%] bottom-[-34%] z-0 h-[70%]"
        style={{
          transform: 'perspective(1200px) rotateX(73deg)',
          transformOrigin: 'center top',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.96), rgba(0,0,0,0.34) 72%, transparent 100%)',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(rgba(167,139,250,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(129,140,248,0.16) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(70% 90% at 50% 0%, rgba(129,140,248,0.18) 0%, rgba(99,102,241,0.04) 52%, transparent 88%)',
            filter: 'blur(6px)',
          }}
        />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-[7%] z-0 h-[44%]">
        <div className="dashboard-bg-bars absolute inset-0 hidden lg:block">
          <div className="absolute left-[2%] h-full w-[33%]">
            <div className="grid h-full grid-cols-12 items-end gap-1.5">
              {LEFT_STAGE_BARS.map((height, index) => (
                <div
                  key={`bg-left-bar-${index}`}
                  className="rounded-t-sm"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, rgba(49,46,129,0.08), rgba(129,140,248,0.3) 52%, rgba(${currentRubro.colorRgb},0.56))`,
                    boxShadow: `0 0 20px rgba(129,140,248,0.2), 0 0 12px rgba(${currentRubro.colorRgb},0.24)`,
                    opacity: 0.72,
                    animation: effectiveReducedMotion ? 'none' : `dashboardBgBarPulse ${4.6 + index * 0.16}s ease-in-out ${index * 0.1}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="absolute right-[2%] h-full w-[34%]">
            <div className="grid h-full grid-cols-12 items-end gap-1.5">
              {RIGHT_STAGE_BARS.map((height, index) => (
                <div
                  key={`bg-right-bar-${index}`}
                  className="rounded-t-sm"
                  style={{
                    height: `${height}%`,
                    background: `linear-gradient(to top, rgba(49,46,129,0.12), rgba(167,139,250,0.38) 48%, rgba(${currentRubro.colorRgb},0.66))`,
                    boxShadow: `0 0 26px rgba(167,139,250,0.26), 0 0 14px rgba(${currentRubro.colorRgb},0.28)`,
                    opacity: 0.86,
                    animation: effectiveReducedMotion ? 'none' : `dashboardBgBarPulse ${4.9 + index * 0.14}s ease-in-out ${index * 0.08}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Barras de fondo desactivadas en mobile/tablet por artefactos visuales */}
      </div>

      <div aria-hidden="true" className="dashboard-bg-signals pointer-events-none absolute inset-x-0 bottom-[11%] z-0 h-[36%]">
        <svg viewBox="0 0 1200 360" preserveAspectRatio="none" className="h-full w-full">
          {SIGNAL_PATHS.map((path, index) => (
            <g key={`signal-path-${index}`}>
              <path
                d={path}
                fill="none"
                stroke="rgba(196,181,253,0.24)"
                strokeWidth={1.05}
              />
              <path
                d={path}
                fill="none"
                stroke={`rgba(${currentRubro.colorRgb},0.62)`}
                strokeWidth={1.25}
                strokeLinecap="round"
                strokeDasharray="8 14"
                style={{
                  filter: 'drop-shadow(0 0 4px rgba(167,139,250,0.36))',
                  animation: effectiveReducedMotion ? 'none' : `dashboardBgSignalMove ${7.2 + index * 0.8}s linear infinite`,
                }}
              />
            </g>
          ))}
        </svg>

        {SIGNAL_NODES.map((node, index) => (
          <div
            key={`signal-node-${index}`}
            className="absolute rounded-full"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              background: `rgba(${currentRubro.colorRgb},0.88)`,
              boxShadow: `0 0 9px rgba(${currentRubro.colorRgb},0.72), 0 0 16px rgba(196,181,253,0.45)`,
              animation: effectiveReducedMotion ? 'none' : `dashboardBgSparkle 3.8s ease-in-out ${node.delay}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 mx-auto max-w-[90rem]">
        <motion.div
          initial={effectiveReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6 text-center md:mb-7 lg:mb-8"
        >
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{
              background: `rgba(${currentRubro.colorRgb},0.12)`,
              border: `1px solid rgba(${currentRubro.colorRgb},0.28)`,
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: currentRubro.color }}>
              [ TU EMPRESA EN TIEMPO REAL ]
            </span>
          </div>

          <h2 className="mb-3 text-2xl font-black text-white sm:text-3xl md:text-4xl lg:mb-4 lg:text-5xl" style={{ letterSpacing: '-0.03em' }}>
            Todos los datos,{' '}
            <span
              style={{
                color: currentRubro.color,
              }}
            >
              una sola pantalla.
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-white/45 sm:text-base">
            La misma representacion del panel, ahora adaptada por rubro. Cambia sola cada pocos segundos y la podes
            pausar cuando quieras.
          </p>
        </motion.div>

        <div className="mb-5 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          {rubroSnapshots.map((rubro, index) => {
            const isActive = rubro.id === activeRubro
            const RubroIcon = rubro.icon

            return (
              <motion.button
                key={rubro.id}
                initial={effectiveReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.45, delay: 0.16 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.01, ease: 'linear' },
                }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActiveRubro(rubro.id)
                  rotationProgressRef.current = 0
                  setRotationProgress(0)
                }}
                className="relative overflow-hidden rounded-2xl border px-3 py-2.5 text-xs font-semibold backdrop-blur-sm sm:px-4 sm:py-3 sm:text-sm"
                style={{
                  borderColor: isActive ? `rgba(${rubro.colorRgb},0.48)` : 'rgba(255,255,255,0.16)',
                  background: isActive
                    ? `linear-gradient(150deg, rgba(8,12,24,0.95), rgba(${rubro.colorRgb},0.22))`
                    : 'rgba(8,12,24,0.72)',
                  boxShadow: isActive
                    ? `0 0 24px rgba(${rubro.colorRgb},0.2), 0 14px 30px rgba(0,0,0,0.35)`
                    : '0 10px 24px rgba(0,0,0,0.28)',
                  color: isActive ? rubro.color : 'rgba(255,255,255,0.75)',
                }}
              >
                <span className="relative z-[1] flex items-center gap-2">
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg border"
                    style={{
                      borderColor: `rgba(${rubro.colorRgb},0.32)`,
                      background: `rgba(${rubro.colorRgb},0.16)`,
                    }}
                  >
                    <RubroIcon size={15} />
                  </span>
                  <span>{rubro.label}</span>
                </span>

                {isActive && (
                  <>
                    <div
                      className="pointer-events-none absolute inset-y-0 left-0"
                      style={{
                        width: `${rotationProgress * 100}%`,
                        background: `linear-gradient(90deg, rgba(${rubro.colorRgb},0.45), rgba(${rubro.colorRgb},0.12))`,
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.09) 46%, transparent 100%)',
                        backgroundSize: '220% 100%',
                        animation: 'shimmerTab 2.2s ease-in-out infinite',
                      }}
                    />
                  </>
                )}
              </motion.button>
            )
          })}

          <motion.button
            initial={effectiveReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: 0.48, ease: [0.16, 1, 0.3, 1] }}
            whileHover={effectiveReducedMotion
              ? {}
              : {
                  y: -2,
                  transition: { duration: 0.01, ease: 'linear' },
                }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (effectiveReducedMotion) {
                return
              }
              setIsPaused((prev) => !prev)
            }}
            disabled={effectiveReducedMotion}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-2.5 text-xs font-semibold sm:px-4 sm:py-3 sm:text-sm"
            style={{
              borderColor: `rgba(${currentRubro.colorRgb},0.34)`,
              background: `rgba(${currentRubro.colorRgb},0.2)`,
              color: currentRubro.color,
              boxShadow: `0 0 24px rgba(${currentRubro.colorRgb},0.14)`,
              cursor: effectiveReducedMotion ? 'not-allowed' : 'pointer',
              opacity: effectiveReducedMotion ? 0.55 : 1,
            }}
            aria-label={isAutoPaused ? 'Reanudar rotacion de rubros' : 'Pausar rotacion de rubros'}
          >
            {isAutoPaused ? <Play size={16} /> : <Pause size={16} />}
            {effectiveReducedMotion ? 'Auto off' : isAutoPaused ? 'Reanudar' : 'Pausar'}
          </motion.button>
        </div>

        <motion.div
          key={`focus-${currentRubro.id}`}
          initial={effectiveReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] sm:mb-5 sm:px-4 sm:py-2 sm:text-[11px]"
          style={{
            borderColor: `rgba(${currentRubro.colorRgb},0.34)`,
            color: currentRubro.color,
            background: `rgba(${currentRubro.colorRgb},0.14)`,
          }}
        >
          <ActiveRubroIcon size={14} />
          <span>{currentRubro.label}</span>
        </motion.div>

        <motion.div
          initial={effectiveReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                  boxShadow: [
                    '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.5), 0 0 65px rgba(99,102,241,0.08)',
                    `0 0 0 1px rgba(${currentRubro.colorRgb},0.2), 0 32px 84px rgba(0,0,0,0.52), 0 0 82px rgba(${currentRubro.colorRgb},0.16)`,
                    '0 0 0 1px rgba(255,255,255,0.04), 0 32px 80px rgba(0,0,0,0.5), 0 0 65px rgba(99,102,241,0.08)',
                  ],
                }
              : {}
          }
          transition={{
            duration: 0.8,
            delay: 0.2,
            ease: [0.16, 1, 0.3, 1],
            boxShadow: { duration: 4.4, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="dashboard-mockup-shell relative overflow-hidden rounded-xl sm:rounded-2xl"
          style={{
            background: 'rgba(14,16,30,0.94)',
            border: `1px solid rgba(${currentRubro.colorRgb},0.26)`,
          }}
        >
          <div
            className="absolute left-0 right-0 top-0 h-[1px]"
            style={{
              background: `linear-gradient(90deg, transparent, rgba(${currentRubro.colorRgb},0.62) 42%, transparent)`,
            }}
          />

          <div
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 sm:flex-nowrap sm:px-5 sm:py-3"
            style={{
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <div className="flex gap-1.5">
              {(['#ef4444', '#f59e0b', '#22c55e'] as const).map((color) => (
                <div key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color, opacity: 0.75 }} />
              ))}
            </div>

            <div
              className="flex min-w-0 max-w-[68%] items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] text-white/30 sm:max-w-[54%] sm:gap-2 sm:px-3 sm:text-[11px]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span style={{ color: currentRubro.color }}>*</span>
              <span className="truncate">{currentRubro.url}</span>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <div
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  background: isAutoPaused ? '#f59e0b' : '#22c55e',
                  boxShadow: isAutoPaused
                    ? '0 0 6px rgba(245,158,11,0.8)'
                    : '0 0 6px rgba(34,197,94,0.8)',
                }}
              />
              <span className="font-mono text-[10px] text-white/30">{isAutoPaused ? 'PAUSADO' : 'ACTIVO'}</span>
              <div className="ml-2 hidden items-center gap-1.5 sm:flex">
                <div
                  className="relative h-[3px] overflow-hidden rounded-full"
                  style={{ width: '56px', background: 'rgba(255,255,255,0.07)' }}
                >
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ background: currentRubro.gradient }}
                    animate={{ width: `${cyclePercent}%` }}
                    transition={{ duration: 0.12, ease: 'linear' }}
                  />
                </div>
                <span className="font-mono text-[9px] text-white/25">{cyclePercent}%</span>
              </div>
            </div>
          </div>

          <div className="p-3.5 sm:p-5 md:p-5 lg:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentRubro.id}
                initial={effectiveReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={effectiveReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-5">
                  <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div
                      className="text-sm font-black tracking-tight sm:text-[15px]"
                      style={{
                        background: currentRubro.gradient,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      DevelOP Sistema
                    </div>
                    <span className="hidden text-xs text-white/15 sm:inline">|</span>
                    <span className="truncate text-[11px] text-white/34 sm:text-xs">Panel de {currentRubro.label}</span>
                  </div>
                  <div
                    className="dashboard-month-chip rounded px-2 py-1 font-mono text-[9px] text-white/34 sm:text-[10px]"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    {currentRubro.month}
                  </div>
                </div>

                <div className="mb-5 rounded-xl border p-3" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}>
                  <div className="mb-1 text-[10px] uppercase tracking-[0.16em]" style={{ color: currentRubro.color }}>
                    Foco del rubro
                  </div>
                  <div className="text-sm font-semibold text-white">{currentRubro.focusTitle}</div>
                  <div className="text-xs text-white/42">{currentRubro.focusSub}</div>
                </div>

                <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3 md:mb-5 md:grid-cols-4">
                  {currentRubro.widgets.map((widget, idx) => {
                    const IconComponent = widget.icon
                    const widgetCenterKey = `demo-widget-${currentRubro.id}-${idx}`
                    const widgetCentered = isCenterHoverActive(widgetCenterKey)
                    return (
                      <motion.div
                        key={`${currentRubro.id}-${widget.label}`}
                        data-center-hover-key={widgetCenterKey}
                        initial={effectiveReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1, y: widgetCentered ? -2 : 0 }}
                        transition={{ duration: 0.45, delay: 0.16 + idx * 0.07, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{
                          y: -2,
                          borderColor: `rgba(${widget.colorRgb},0.4)`,
                          boxShadow: `0 0 0 1px rgba(${widget.colorRgb},0.2), 0 12px 26px rgba(${widget.colorRgb},0.15)`,
                          transition: { duration: 0.01, ease: 'linear' },
                        }}
                        className="relative overflow-hidden rounded-xl p-3 sm:p-4"
                        style={{
                          background: `linear-gradient(135deg, rgba(${widget.colorRgb},0.11) 0%, rgba(255,255,255,0.02) 100%)`,
                          border: '1px solid',
                          borderColor: widgetCentered
                            ? `rgba(${widget.colorRgb},0.4)`
                            : `rgba(${widget.colorRgb},0.2)`,
                          boxShadow: widgetCentered
                            ? `0 0 0 1px rgba(${widget.colorRgb},0.2), 0 12px 26px rgba(${widget.colorRgb},0.15)`
                            : 'none',
                        }}
                      >
                        <div
                          className="absolute left-0 right-0 top-0 h-[1px]"
                          style={{
                            background: `linear-gradient(90deg, transparent, rgba(${widget.colorRgb},0.55), transparent)`,
                          }}
                        />

                        <div className="mb-2 flex items-start justify-between">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-lg"
                            style={{
                              background: `rgba(${widget.colorRgb},0.16)`,
                              border: `1px solid rgba(${widget.colorRgb},0.26)`,
                              color: widget.color,
                            }}
                          >
                            <IconComponent size={14} strokeWidth={1.7} />
                          </div>
                          <span
                            className="rounded-full px-1.5 py-0.5 font-mono text-[9px]"
                            style={{
                              color: widget.positive ? '#34d399' : '#ef4444',
                              background: widget.positive ? 'rgba(52,211,153,0.12)' : 'rgba(239,68,68,0.12)',
                            }}
                          >
                            {widget.change}
                          </span>
                        </div>

                        <div className="mb-0.5 text-lg font-black text-white sm:text-xl" style={{ letterSpacing: '-0.02em' }}>
                          {isInView ? (
                            <CountUp
                              key={`${currentRubro.id}-${widget.label}-value`}
                              to={widget.value}
                              formatDisplay={widget.formatDisplay}
                              delay={0.22 + idx * 0.06}
                            />
                          ) : (
                            widget.formatDisplay(0)
                          )}
                        </div>
                        <div className="text-[11px] text-white/38">{widget.label}</div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_230px] md:gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                  {(() => {
                    const salesPanelCenterKey = `demo-sales-panel-${currentRubro.id}`
                    const salesPanelCentered = isCenterHoverActive(salesPanelCenterKey)
                    return (
                  <motion.div
                    data-center-hover-key={salesPanelCenterKey}
                    initial={effectiveReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: salesPanelCentered ? -2 : 0 }}
                    transition={{ duration: 0.45, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{
                      y: -2,
                      borderColor: `rgba(${currentRubro.colorRgb},0.3)`,
                      boxShadow: `0 0 0 1px rgba(${currentRubro.colorRgb},0.18), 0 14px 24px rgba(${currentRubro.colorRgb},0.12)`,
                      transition: { duration: 0.01, ease: 'linear' },
                    }}
                    className="dashboard-activity-card dashboard-sales-card rounded-xl p-3.5 sm:p-5"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: salesPanelCentered
                        ? `rgba(${currentRubro.colorRgb},0.3)`
                        : 'rgba(255,255,255,0.05)',
                      boxShadow: salesPanelCentered
                        ? `0 0 0 1px rgba(${currentRubro.colorRgb},0.18), 0 14px 24px rgba(${currentRubro.colorRgb},0.12)`
                        : 'none',
                    }}
                  >
                    <div className="mb-4 flex min-w-0 items-center justify-between gap-2 sm:mb-5">
                      <span className="min-w-0 truncate text-xs font-medium text-white/60">Ventas mensuales</span>
                      <span
                        className="dashboard-sales-chip shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px]"
                        style={{ color: currentRubro.color, background: `rgba(${currentRubro.colorRgb},0.15)` }}
                      >
                        2026
                      </span>
                    </div>

                    <div className="flex h-[68px] items-end gap-1.5 sm:h-[82px]">
                      {currentRubro.bars.map((value, index) => {
                        const isPeak = index === peakBarIndex
                        const barCenterKey = `demo-sales-bar-${currentRubro.id}-${index}`
                        const barCentered = isCenterHoverActive(barCenterKey)
                        return (
                          <motion.div
                            key={`${currentRubro.id}-bar-${index}`}
                            data-center-hover-key={barCenterKey}
                            className="group relative flex-1 rounded-t-sm"
                            initial={effectiveReducedMotion ? { height: `${value}%` } : { height: 0 }}
                            animate={{
                              height: `${value}%`,
                              scaleY: barCentered ? 1.08 : 1,
                              filter: barCentered ? 'brightness(1.14)' : 'brightness(1)',
                            }}
                            transition={{ duration: 0.5, delay: 0.34 + index * 0.03, ease: [0.16, 1, 0.3, 1] }}
                            whileHover={{
                              scaleY: 1.08,
                              filter: 'brightness(1.14)',
                              transition: { duration: 0.01, ease: 'linear' },
                            }}
                            style={{
                              transformOrigin: 'bottom center',
                              background: isPeak
                                ? currentRubro.gradient
                                : `rgba(${currentRubro.colorRgb},0.${Math.min(9, Math.round(value / 14) + 2)})`,
                              boxShadow: isPeak ? `0 0 14px rgba(${currentRubro.colorRgb},0.42)` : 'none',
                            }}
                          />
                        )
                      })}
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {BAR_LABELS.map((label, index) => (
                        <div key={`${currentRubro.id}-${label}-${index}`} className="flex-1 text-center font-mono text-[8px] text-white/24 sm:text-[9px]">
                          {label}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                    )
                  })()}

                  {(() => {
                    const activityPanelCenterKey = `demo-activity-panel-${currentRubro.id}`
                    const activityPanelCentered = isCenterHoverActive(activityPanelCenterKey)
                    return (
                  <motion.div
                    data-center-hover-key={activityPanelCenterKey}
                    initial={effectiveReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: activityPanelCentered ? -2 : 0 }}
                    transition={{ duration: 0.45, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{
                      y: -2,
                      borderColor: `rgba(${currentRubro.colorRgb},0.3)`,
                      boxShadow: `0 0 0 1px rgba(${currentRubro.colorRgb},0.18), 0 14px 24px rgba(${currentRubro.colorRgb},0.1)`,
                      transition: { duration: 0.01, ease: 'linear' },
                    }}
                    className="dashboard-recent-card rounded-xl p-3.5 sm:p-5"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid',
                      borderColor: activityPanelCentered
                        ? `rgba(${currentRubro.colorRgb},0.3)`
                        : 'rgba(255,255,255,0.05)',
                      boxShadow: activityPanelCentered
                        ? `0 0 0 1px rgba(${currentRubro.colorRgb},0.18), 0 14px 24px rgba(${currentRubro.colorRgb},0.1)`
                        : 'none',
                    }}
                  >
                    <div className="mb-4 flex min-w-0 items-center justify-between gap-2">
                      <span className="min-w-0 truncate text-xs font-medium text-white/60">Actividad reciente</span>
                      <div className="dashboard-live-badge flex shrink-0 items-center gap-1.5">
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{
                            background: isAutoPaused ? '#f59e0b' : '#22c55e',
                            boxShadow: isAutoPaused
                              ? '0 0 6px rgba(245,158,11,0.8)'
                              : '0 0 6px rgba(34,197,94,0.8)',
                          }}
                        />
                        <span
                          className="dashboard-live-label font-mono text-[9px]"
                          style={{ color: isAutoPaused ? 'rgba(245,158,11,0.75)' : 'rgba(74,222,128,0.75)' }}
                        >
                          EN VIVO
                        </span>
                      </div>
                    </div>

                    <div className="dashboard-activity-list flex flex-col gap-2.5 sm:gap-3">
                      {visibleActivityItems.map((item, index) => (
                        (() => {
                          const activityItemCenterKey = `demo-activity-item-${currentRubro.id}-${index}`
                          const activityItemCentered = isCenterHoverActive(activityItemCenterKey)
                          return (
                        <motion.div
                          key={`${currentRubro.id}-activity-${index}`}
                          data-center-hover-key={activityItemCenterKey}
                          animate={{ x: activityItemCentered ? 2 : 0 }}
                          whileHover={{
                            x: 2,
                            borderColor: `rgba(${currentRubro.colorRgb},0.3)`,
                            background: `rgba(${currentRubro.colorRgb},0.1)`,
                            transition: { duration: 0.01, ease: 'linear' },
                          }}
                          className="dashboard-activity-item flex items-start gap-3"
                          style={{
                            border: '1px solid',
                            borderColor: activityItemCentered
                              ? `rgba(${currentRubro.colorRgb},0.3)`
                              : 'transparent',
                            background: activityItemCentered
                              ? `rgba(${currentRubro.colorRgb},0.1)`
                              : 'transparent',
                            borderRadius: '10px',
                            padding: '6px 8px',
                            margin: '-2px -4px',
                          }}
                        >
                          <div
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                            style={{ background: item.dot, boxShadow: `0 0 6px ${item.dot}66` }}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-[12px] leading-snug text-white/62">{item.text}</div>
                            <div className="mt-0.5 font-mono text-[10px] text-white/22">{item.time}</div>
                          </div>
                        </motion.div>
                          )
                        })()
                      ))}
                    </div>
                  </motion.div>
                    )
                  })()}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.p
          initial={effectiveReducedMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.45, delay: 0.55 }}
          className="mt-4 hidden text-center font-mono text-xs tracking-wider text-white/24 sm:block sm:mt-5"
        >
          MOCKUP REPRESENTATIVO - PANEL REAL ADAPTADO POR RUBRO
        </motion.p>
      </div>

      <style>{`
        @keyframes shimmerTab {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes dashboardBgDriftA {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(-2.4%, 1.8%, 0) scale(1.03); }
        }
        @keyframes dashboardBgDriftB {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(2.1%, -1.6%, 0) scale(1.02); }
        }
        @keyframes dashboardBgBarPulse {
          0%, 100% { opacity: 0.64; filter: saturate(1); }
          52% { opacity: 0.96; filter: saturate(1.18); }
        }
        @keyframes dashboardBgSignalMove {
          0% { stroke-dashoffset: 0; opacity: 0.64; }
          50% { opacity: 1; }
          100% { stroke-dashoffset: -44; opacity: 0.64; }
        }
        @keyframes dashboardBgSparkle {
          0%, 100% { opacity: 0.45; transform: scale(0.88); }
          50% { opacity: 1; transform: scale(1.14); }
        }
        @media (max-width: 1023px) {
          .dashboard-bg-bars {
            display: none !important;
          }
          .dashboard-bg-signals {
            display: none;
          }
          .dashboard-activity-card {
            min-height: 236px;
          }
          .dashboard-recent-card {
            min-height: 236px;
          }
          .dashboard-activity-list {
            min-height: 162px;
            overflow: hidden;
          }
        }
        @media (max-width: 640px) {
          .dashboard-activity-card {
            min-height: 206px;
          }
          .dashboard-recent-card {
            min-height: 206px;
          }
          .dashboard-activity-list {
            min-height: 132px;
          }
          .dashboard-activity-item:nth-child(n+4) {
            display: none;
          }
        }
        @media (max-width: 375px) {
          .dashboard-sales-card,
          .dashboard-recent-card {
            width: 100%;
            min-width: 0;
            max-width: 100%;
          }
          .dashboard-activity-card {
            min-height: 172px;
            max-height: 172px;
          }
          .dashboard-recent-card {
            min-height: 172px;
            max-height: 172px;
          }
          .dashboard-activity-list {
            height: 100px;
            min-height: 100px;
            max-height: 100px;
            overflow: hidden;
          }
          .dashboard-activity-item:nth-child(n+3) {
            display: none;
          }
          .dashboard-live-badge {
            max-width: 72px;
            justify-content: flex-end;
          }
          .dashboard-live-label {
            letter-spacing: 0.01em;
            white-space: nowrap;
          }
        }
        @media (max-width: 360px) {
          .dashboard-month-chip {
            display: none;
          }
          .dashboard-sales-chip {
            display: none;
          }
        }
      `}</style>
    </section>
  )
}
