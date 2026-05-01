'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Mail,
  MessageCircle,
  SlidersHorizontal,
  Target,
  TimerReset,
  TrendingUp,
  WalletCards,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface ROIResultados {
  tareasMes: number
  horasManuales: number
  horasAhorradas: number
  ahorroUSD: number
  diasLibres: number
  costoAutomation: number
  roiNeto: number
  roiPct: number
}

type TaskExample = {
  label: string
  detail: string
  icon: LucideIcon
}

const TASK_EXAMPLES: TaskExample[] = [
  {
    label: 'Seguimientos',
    detail: 'leads, cobranzas y postventa',
    icon: Mail,
  },
  {
    label: 'Carga administrativa',
    detail: 'facturas, planillas y sistemas',
    icon: FileText,
  },
  {
    label: 'Reportes operativos',
    detail: 'ventas, stock y cierre diario',
    icon: BarChart3,
  },
  {
    label: 'Respuestas repetidas',
    detail: 'consultas, estados y avisos',
    icon: MessageCircle,
  },
]

const ROI_WORDS = [
  { label: 'horas recuperadas', className: 'left-[7%] top-[22%]' },
  { label: 'costo oculto', className: 'right-[8%] top-[18%]' },
  { label: 'margen operativo', className: 'left-[11%] bottom-[22%]' },
  { label: 'ROI mensual', className: 'right-[13%] bottom-[18%]' },
]

function useViewportFlags() {
  const [flags, setFlags] = useState({ isTabletOrDown: false })

  useEffect(() => {
    const update = () => {
      setFlags({ isTabletOrDown: window.innerWidth < 1024 })
    }

    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return flags
}

function useCenterActivation<T extends HTMLElement>(enabled: boolean, marginRatio = 0.16) {
  const ref = useRef<T>(null)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

    let raf = 0

    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const element = ref.current
        if (!element) return

        const rect = element.getBoundingClientRect()
        const viewportCenter = window.innerHeight / 2
        const elementCenter = rect.top + rect.height / 2
        const threshold = Math.max(76, window.innerHeight * marginRatio)

        setActive(Math.abs(elementCenter - viewportCenter) <= threshold)
      })
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [enabled, marginRatio])

  return { ref, active }
}

function AtmosphereCalc() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <>
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,13,0.35),rgba(7,7,9,0.94)_68%,#050506_100%)]" />
        <div className="absolute inset-x-0 top-0 h-[52%] bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.1),transparent_64%)]" />
        <div className="absolute bottom-[-16%] left-[-12%] h-[44rem] w-[44rem] rounded-full bg-orange-500/[0.055] blur-[120px]" />
        <div className="absolute right-[-9%] top-[16%] h-[38rem] w-[38rem] rounded-full bg-amber-500/[0.05] blur-[110px]" />

        <svg
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMin slice"
          className="absolute left-1/2 top-0 h-[940px] -translate-x-1/2 opacity-[0.72] md:h-[1020px] lg:h-[980px] xl:h-[1040px]"
          style={{ width: 'max(100%, 1440px)' }}
          role="presentation"
        >
          <defs>
            <linearGradient id="roiTrace" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0" />
              <stop offset="18%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="54%" stopColor="#f97316" stopOpacity="0.34" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="roiLine" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fb923c" stopOpacity="0.8" />
            </linearGradient>
            <filter id="roiGlow">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M-40 692 C150 640 270 708 430 648 C590 588 685 504 850 536 C1030 572 1140 470 1480 522"
            fill="none"
            stroke="url(#roiTrace)"
            strokeWidth="1.4"
          />
          <path
            d="M-20 734 C135 688 304 760 470 696 C604 644 704 570 868 590 C1038 610 1144 532 1460 568"
            fill="none"
            stroke="url(#roiTrace)"
            strokeWidth="0.8"
            opacity="0.55"
          />
          <path
            d="M920 690 L992 646 L1064 660 L1136 602 L1218 522 L1302 406"
            fill="none"
            stroke="url(#roiLine)"
            strokeWidth="2"
            filter="url(#roiGlow)"
          />
          <path d="M1302 406 L1300 447 M1302 406 L1268 430" fill="none" stroke="#fb923c" strokeWidth="2" filter="url(#roiGlow)" />

          <g opacity="0.26" stroke="#f97316" strokeWidth="1" fill="none">
            <path d="M74 138 H238 L276 176 H392" />
            <path d="M38 222 H172 L214 264 H338" />
            <path d="M118 306 H246 L288 348 H420" />
            <path d="M1210 112 H1320 L1362 154 H1460" />
            <path d="M1132 196 H1252 L1290 236 H1430" />
            <path d="M1048 278 H1182 L1218 316 H1410" />
            <circle cx="238" cy="138" r="4" fill="#f97316" opacity="0.72" />
            <circle cx="172" cy="222" r="3.5" fill="#f59e0b" opacity="0.58" />
            <circle cx="1320" cy="112" r="4" fill="#f59e0b" opacity="0.58" />
            <circle cx="1182" cy="278" r="3" fill="#f97316" opacity="0.7" />
          </g>

          <g transform="translate(1000 556)" opacity="0.34" stroke="#f97316" fill="none">
            {[0, 1, 2, 3, 4].map((index) => (
              <rect
                key={index}
                x={index * 42}
                y={106 - index * 22}
                width="20"
                height={28 + index * 22}
                rx="4"
                strokeWidth="1.2"
              />
            ))}
            <path d="M-18 120 H250" strokeOpacity="0.32" />
          </g>

          <g transform="translate(92 640)" opacity="0.3" stroke="#f59e0b" fill="none">
            <ellipse cx="0" cy="0" rx="42" ry="12" />
            <path d="M-42 0 V64 C-42 71 -24 76 0 76 C24 76 42 71 42 64 V0" />
            <path d="M-42 22 C-42 29 -24 34 0 34 C24 34 42 29 42 22" />
            <path d="M-42 44 C-42 51 -24 56 0 56 C24 56 42 51 42 44" />
          </g>

          {!shouldReduceMotion && (
            <>
              {[238, 640, 992, 1136, 1302].map((cx, index) => (
                <motion.circle
                  key={cx}
                  cx={cx}
                  cy={[138, 608, 646, 602, 406][index]}
                  r="3"
                  fill="#f59e0b"
                  filter="url(#roiGlow)"
                  animate={{ opacity: [0.25, 0.95, 0.25], scale: [0.8, 1.35, 0.8] }}
                  transition={{
                    duration: 3.2,
                    delay: index * 0.42,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
            </>
          )}
        </svg>

        <div
          className="absolute inset-0 opacity-[0.42]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(245,158,11,0.085) 1px, transparent 1px)',
            backgroundSize: '58px 58px',
            maskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 78%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 50% 50%, black 0%, transparent 78%)',
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#070709_0%,rgba(7,7,9,0.18)_20%,rgba(7,7,9,0.18)_80%,#070709_100%)]" />
      </div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden lg:block">
        {ROI_WORDS.map((word, index) => (
          <motion.span
            key={word.label}
            className={`absolute rounded-full border border-amber-500/10 bg-black/18 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber-200/24 ${word.className}`}
            animate={
              shouldReduceMotion
                ? {}
                : {
                    y: index % 2 === 0 ? [0, -8, 0] : [0, 8, 0],
                    opacity: [0.18, 0.32, 0.18],
                  }
            }
            transition={{ duration: 8 + index, repeat: Infinity, ease: 'easeInOut' }}
          >
            {word.label}
          </motion.span>
        ))}
      </div>
    </>
  )
}

function Header({ isInView }: { isInView: boolean }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="mb-10 flex flex-col items-center text-center md:mb-16">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative mb-6 inline-flex max-w-full items-center gap-2 overflow-hidden rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-4 py-1.5"
      >
        {!shouldReduceMotion && (
          <motion.span
            aria-hidden="true"
            animate={{ x: ['-150%', '250%'] }}
            transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 4.2, ease: 'easeInOut' }}
            className="absolute inset-0 rounded-full bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.2),transparent)]"
          />
        )}
        <Calculator size={13} strokeWidth={2} className="relative z-10 text-amber-400" />
        <span
          aria-hidden="true"
          className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500"
          style={{
            animation: shouldReduceMotion ? 'none' : 'pulse 1.8s ease-in-out infinite',
            boxShadow: '0 0 8px rgba(245,158,11,0.9)',
          }}
        />
        <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-500 sm:text-[11px]">
          [ ROI de automatización ]
        </span>
      </motion.div>

      <motion.h2
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-3xl font-black leading-tight text-white md:text-5xl lg:text-6xl"
        style={{ letterSpacing: '-0.03em' }}
      >
        Automatizar no es ahorrar centavos.
        <br />
        <span className="relative mt-1 inline-block bg-gradient-to-r from-[#fde68a] via-[#f59e0b] to-[#fb923c] bg-clip-text text-transparent">
          Es recuperar margen todos los meses.
          {!shouldReduceMotion && (
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={isInView ? { scaleX: 1, opacity: 1 } : {}}
              transition={{ duration: 0.9, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -bottom-1 left-0 right-0 h-px origin-left bg-[linear-gradient(90deg,transparent,#f59e0b_38%,#fb923c_62%,transparent)]"
            />
          )}
        </span>
      </motion.h2>

      <motion.p
        initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: 0.38 }}
        className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-white/45 md:text-lg"
      >
        Ajustá el volumen real de tareas repetitivas y mirá cuánto tiempo, costo operativo y retorno mensual quedan atrapados antes de automatizar.
      </motion.p>
    </div>
  )
}

function SliderMini({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  formatValue,
  icon: Icon,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (val: number) => void
  formatValue?: (val: number) => string
  icon: LucideIcon
}) {
  const pct = ((value - min) / (max - min)) * 100

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-4 text-[12px]">
        <span className="flex min-w-0 items-center gap-2 text-white/52">
          <Icon size={14} strokeWidth={2} className="shrink-0 text-amber-400/70" />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 font-mono font-bold text-amber-400">
          {formatValue ? formatValue(value) : `${value} ${unit}`}
        </span>
      </div>
      <div className="relative flex h-6 items-center">
        <div className="absolute h-1 w-full overflow-hidden rounded-full bg-white/7">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-[width] duration-100"
            style={{ width: `${pct}%`, boxShadow: '0 0 12px rgba(245,158,11,0.38)' }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="absolute inset-x-0 z-10 w-full cursor-none opacity-0"
        />
        <div
          className="pointer-events-none absolute h-3.5 w-3.5 rounded-full border-2 border-[#070709] bg-amber-500 shadow-lg transition-[left] duration-100"
          style={{ left: `calc(${pct}% - 7px)` }}
        />
      </div>
    </div>
  )
}

function SliderSide({
  tareasAlDia,
  setTareasAlDia,
  minutosPorTarea,
  setMinutosPorTarea,
  costoHoraUSD,
  setCostoHoraUSD,
  showAdvanced,
  setShowAdvanced,
  isInView,
  centerActivate,
}: {
  tareasAlDia: number
  setTareasAlDia: (value: number) => void
  minutosPorTarea: number
  setMinutosPorTarea: (value: number) => void
  costoHoraUSD: number
  setCostoHoraUSD: (value: number) => void
  showAdvanced: boolean
  setShowAdvanced: (value: boolean) => void
  isInView: boolean
  centerActivate: boolean
}) {
  const mainPct = ((tareasAlDia - 5) / (200 - 5)) * 100
  const shouldReduceMotion = useReducedMotion()
  const { ref: examplesRef, active: examplesCentered } = useCenterActivation<HTMLDivElement>(centerActivate, 0.15)
  const { ref: paramsRef, active: paramsCentered } = useCenterActivation<HTMLButtonElement>(centerActivate, 0.12)
  const examplesActive = centerActivate && examplesCentered
  const paramsActive = showAdvanced || (centerActivate && paramsCentered)

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.35 }}
      className="flex flex-col gap-8"
    >
      <div className="group rounded-[24px] border border-white/8 bg-black/18 p-5 shadow-[0_18px_44px_rgba(0,0,0,0.24)] sm:p-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <label className="max-w-[270px] text-sm leading-relaxed text-white/62 md:text-base">
            Tareas repetitivas que hoy se hacen a mano por día
          </label>
          <motion.span
            key={tareasAlDia}
            initial={{ scale: 1.08, color: '#f59e0b' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="font-mono text-5xl font-black leading-none tracking-tighter md:text-6xl"
          >
            {tareasAlDia}
          </motion.span>
        </div>

        <div className="relative flex h-10 items-center">
          <div
            className="absolute h-2 w-full overflow-hidden rounded-full"
            style={{
              background: 'rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            <div
              className="h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${mainPct}%`,
                background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                boxShadow: '0 0 18px rgba(245,158,11,0.45)',
              }}
            />
          </div>
          <input
            type="range"
            min={5}
            max={200}
            step={5}
            value={tareasAlDia}
            onChange={(event) => setTareasAlDia(Number(event.target.value))}
            className="absolute inset-x-0 z-10 h-full w-full cursor-none opacity-0"
          />
          <div
            className="pointer-events-none absolute z-20 h-7 w-7 rounded-full border-[3px] border-[#070709] transition-[left] duration-100"
            style={{
              left: `calc(${mainPct}% - 14px)`,
              background: 'linear-gradient(135deg, #fbbf24, #f97316)',
              boxShadow: '0 0 24px rgba(245,158,11,0.62), 0 4px 12px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}
          />
        </div>

        <div className="mt-4 flex justify-between">
          <span className="font-mono text-[10px] tracking-wider text-white/22">5 TAREAS/DÍA</span>
          <span className="font-mono text-[10px] tracking-wider text-white/22">200 TAREAS/DÍA</span>
        </div>
      </div>

      <motion.div
        ref={examplesRef}
        animate={examplesActive ? { y: -2 } : { y: 0 }}
        whileHover={
          centerActivate || shouldReduceMotion
            ? {}
            : {
                y: -2,
                transition: { duration: 0, ease: 'linear' },
              }
        }
        className="relative overflow-hidden rounded-2xl border p-5"
        style={{
          background: examplesActive ? 'rgba(245,158,11,0.075)' : 'rgba(245,158,11,0.035)',
          borderColor: examplesActive ? 'rgba(245,158,11,0.34)' : 'rgba(245,158,11,0.12)',
          boxShadow: examplesActive
            ? '0 0 0 1px rgba(245,158,11,0.14), 0 0 22px rgba(245,158,11,0.14), 0 10px 22px rgba(0,0,0,0.28)'
            : '0 10px 28px rgba(0,0,0,0.18)',
          transition: 'none',
        }}
      >
        <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-500/35 to-transparent" />
        <p className="mb-4 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-amber-400/70">
          <Target size={13} strokeWidth={2} />
          Procesos que conviene medir
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TASK_EXAMPLES.map((task) => {
            const Icon = task.icon

            return (
              <motion.div
                key={task.label}
                whileHover={
                  centerActivate || shouldReduceMotion
                    ? {}
                    : {
                        x: 2,
                        color: 'rgba(255,255,255,0.82)',
                        transition: { duration: 0, ease: 'linear' },
                      }
                }
                className="flex items-start gap-3 rounded-xl border border-white/6 bg-white/[0.025] p-3 text-white/42"
                style={{
                  color: examplesActive ? 'rgba(255,255,255,0.78)' : undefined,
                  textShadow: examplesActive ? '0 0 10px rgba(245,158,11,0.16)' : 'none',
                  transition: 'none',
                }}
              >
                <span
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border"
                  style={{
                    borderColor: 'rgba(245,158,11,0.24)',
                    background: 'rgba(245,158,11,0.08)',
                    color: '#f59e0b',
                  }}
                >
                  <Icon size={15} strokeWidth={2} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-black text-white/78">{task.label}</span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-white/36">{task.detail}</span>
                </span>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      <div>
        <motion.button
          ref={paramsRef}
          onClick={() => setShowAdvanced(!showAdvanced)}
          whileHover={
            centerActivate || shouldReduceMotion
              ? {}
              : {
                  y: -1,
                  transition: { duration: 0, ease: 'linear' },
                }
          }
          className="group flex w-full items-center justify-between gap-4 rounded-2xl border p-4 text-left"
          style={{
            borderColor: paramsActive ? 'rgba(245,158,11,0.34)' : 'rgba(245,158,11,0.16)',
            background: paramsActive ? 'rgba(245,158,11,0.075)' : 'rgba(245,158,11,0.035)',
            boxShadow: paramsActive
              ? '0 0 0 1px rgba(245,158,11,0.12), 0 0 24px rgba(245,158,11,0.12)'
              : '0 10px 26px rgba(0,0,0,0.18)',
            transition: 'none',
          }}
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-amber-500/26 bg-amber-500/10 text-amber-400">
              <SlidersHorizontal size={17} strokeWidth={2} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-black uppercase tracking-[0.08em] text-amber-300">
                Personalizar parámetros
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-white/42">
                Afiná minutos por tarea y costo hora para llevarlo a tu operación.
              </span>
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-amber-500/18 bg-amber-500/[0.08] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-amber-300/72 sm:inline-flex">
              {showAdvanced ? 'visible' : 'abrir'}
            </span>
            <motion.span animate={{ rotate: showAdvanced ? 90 : 0 }} transition={{ duration: 0.16 }} className="text-amber-400">
              <ChevronRight size={18} strokeWidth={2.4} />
            </motion.span>
          </span>
        </motion.button>

        <motion.div
          initial={false}
          animate={{
            height: showAdvanced ? 'auto' : 0,
            opacity: showAdvanced ? 1 : 0,
            marginTop: showAdvanced ? 16 : 0,
          }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="overflow-hidden"
          aria-hidden={!showAdvanced}
        >
          <div className="flex flex-col gap-6 rounded-2xl border border-amber-500/12 bg-black/24 p-4 sm:p-5">
            <SliderMini
              icon={Clock3}
              label="Tiempo promedio por tarea"
              value={minutosPorTarea}
              min={2}
              max={45}
              step={1}
              unit="min"
              onChange={setMinutosPorTarea}
            />
            <SliderMini
              icon={DollarSign}
              label="Costo hora del equipo"
              value={costoHoraUSD}
              min={5}
              max={100}
              step={5}
              unit="USD"
              formatValue={(value) => `$${value} USD/hs`}
              onChange={setCostoHoraUSD}
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

function OdometerDigit({
  value,
  fontSize = '64px',
  color = '#f59e0b',
}: {
  value: number
  fontSize?: string
  color?: string
}) {
  const [displayValue, setDisplayValue] = useState(value)
  const [isRolling, setIsRolling] = useState(false)
  const previousValue = useRef(value)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (value === previousValue.current) return

    if (shouldReduceMotion) {
      const immediate = setTimeout(() => {
        setDisplayValue(value)
        previousValue.current = value
      }, 0)
      return () => clearTimeout(immediate)
    }

    const startRolling = setTimeout(() => setIsRolling(true), 0)
    const timer = setTimeout(() => {
      setDisplayValue(value)
      setIsRolling(false)
      previousValue.current = value
    }, 120)

    return () => {
      clearTimeout(startRolling)
      clearTimeout(timer)
    }
  }, [value, shouldReduceMotion])

  return (
    <div className="relative overflow-hidden leading-none" style={{ height: `calc(${fontSize} * 1.1)` }}>
      <motion.span
        animate={isRolling ? { y: '-110%', opacity: 0 } : { y: '0%', opacity: 1 }}
        transition={{ duration: 0.12, ease: 'easeIn' }}
        className="block font-mono font-black"
        style={{ fontSize, color, lineHeight: 1.1 }}
      >
        {displayValue.toLocaleString('es-AR')}
      </motion.span>

      {isRolling && (
        <motion.span
          initial={{ y: '110%', opacity: 0 }}
          animate={{ y: '0%', opacity: 1 }}
          transition={{ duration: 0.12, ease: 'easeOut', delay: 0.1 }}
          className="absolute left-0 top-0 block font-mono font-black"
          style={{ fontSize, color, lineHeight: 1.1 }}
        >
          {value.toLocaleString('es-AR')}
        </motion.span>
      )}
    </div>
  )
}

function ResultMiniCard({
  title,
  note,
  icon: Icon,
  color,
  colorRgb,
  centerActivate,
  children,
}: {
  title: string
  note: string
  icon: LucideIcon
  color: string
  colorRgb: string
  centerActivate: boolean
  children: React.ReactNode
}) {
  const shouldReduceMotion = useReducedMotion()
  const { ref, active: centerActive } = useCenterActivation<HTMLDivElement>(centerActivate, 0.13)
  const [hovered, setHovered] = useState(false)
  const isActive = hovered || (centerActivate && centerActive)

  return (
    <motion.div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={
        centerActivate || shouldReduceMotion
          ? {}
          : {
              y: -3,
              scale: 1.01,
              transition: { duration: 0, ease: 'linear' },
            }
      }
      className="relative overflow-hidden rounded-2xl border p-4 md:p-6"
      style={{
        background: isActive ? `rgba(${colorRgb},0.085)` : 'rgba(255,255,255,0.026)',
        borderColor: isActive ? `rgba(${colorRgb},0.36)` : `rgba(${colorRgb},0.16)`,
        boxShadow: isActive
          ? `0 0 0 1px rgba(${colorRgb},0.16), 0 0 22px rgba(${colorRgb},0.14), 0 10px 24px rgba(0,0,0,0.3)`
          : '0 4px 24px rgba(0,0,0,0.25), 0 0 0 1px rgba(245,158,11,0.04)',
        transition: 'none',
      }}
    >
      <div className="absolute left-0 right-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, rgba(${colorRgb},0.48), transparent)` }} />
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: `rgba(${colorRgb},0.62)` }}>
          {title}
        </p>
        <span className="grid h-8 w-8 place-items-center rounded-lg border" style={{ borderColor: `rgba(${colorRgb},0.24)`, background: `rgba(${colorRgb},0.08)`, color }}>
          <Icon size={15} strokeWidth={2} />
        </span>
      </div>
      {children}
      <p className="mt-2 text-[11px] leading-relaxed text-white/30">{note}</p>
    </motion.div>
  )
}

function OdometerSide({
  resultados,
  isInView,
  centerActivate,
}: {
  resultados: ROIResultados
  isInView: boolean
  centerActivate: boolean
}) {
  const shouldReduceMotion = useReducedMotion()
  const { ref: hoursRef, active: hoursCentered } = useCenterActivation<HTMLDivElement>(centerActivate, 0.16)
  const [isHoursCardHovered, setIsHoursCardHovered] = useState(false)
  const isHoursActive = isHoursCardHovered || (centerActivate && hoursCentered)

  return (
    <motion.div
      initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 24 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.45 }}
      className="flex flex-col gap-4"
    >
      <div
        ref={hoursRef}
        onMouseEnter={() => setIsHoursCardHovered(true)}
        onMouseLeave={() => setIsHoursCardHovered(false)}
        className="relative overflow-hidden rounded-[22px] border p-7 md:p-10"
        style={{
          background: isHoursActive
            ? 'linear-gradient(135deg, rgba(245,158,11,0.14), rgba(249,115,22,0.07))'
            : 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(249,115,22,0.045))',
          borderColor: isHoursActive ? 'rgba(245,158,11,0.45)' : 'rgba(245,158,11,0.24)',
          boxShadow: isHoursActive
            ? '0 0 0 1px rgba(245,158,11,0.22), 0 0 34px rgba(245,158,11,0.18), 0 18px 36px rgba(0,0,0,0.34)'
            : '0 0 0 1px rgba(245,158,11,0.08), 0 24px 56px rgba(0,0,0,0.4), 0 8px 20px rgba(245,158,11,0.08)',
          transition: 'none',
        }}
      >
        <div className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-70" />
        <div className="mb-3 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-amber-500/24 bg-amber-500/10 text-amber-400">
            <TimerReset size={16} strokeWidth={2} />
          </span>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.28em] text-amber-400/62 md:text-[10px]">
            Capacidad recuperada
          </p>
        </div>

        <div className="mb-1 flex items-end gap-3">
          <OdometerDigit value={resultados.horasAhorradas} fontSize="clamp(50px, 16vw, 96px)" color="#f59e0b" />
          <div className="mb-2 flex flex-col gap-0.5">
            <span className="font-mono text-base font-black leading-none text-amber-500/80">hs</span>
            <span className="font-mono text-[10px] font-bold leading-none tracking-wider text-amber-500/40">/MES</span>
          </div>
        </div>

        <p className="mt-1 text-[12px] text-white/40" style={{ fontVariantNumeric: 'tabular-nums' }}>
          ~ <strong className="font-bold text-white/78">{resultados.diasLibres} días laborales</strong> devueltos al equipo.
        </p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/42">
          Estimación práctica: no elimina todo el trabajo, reduce el 82% de la ejecución manual y deja el resto para control humano.
        </p>

        <div className="my-5 h-px w-full bg-[linear-gradient(90deg,rgba(245,158,11,0.22),rgba(249,115,22,0.1),transparent)]" />

        <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3">
          <div className="rounded-xl border border-white/7 bg-black/18 px-3 py-2">
            <span className="block font-mono text-white/28">tareas/mes</span>
            <strong className="mt-1 block font-mono text-white/78">{resultados.tareasMes.toLocaleString('es-AR')}</strong>
          </div>
          <div className="rounded-xl border border-white/7 bg-black/18 px-3 py-2">
            <span className="block font-mono text-white/28">manual hoy</span>
            <strong className="mt-1 block font-mono text-white/78">{resultados.horasManuales.toLocaleString('es-AR')} hs</strong>
          </div>
          <div className="rounded-xl border border-white/7 bg-black/18 px-3 py-2 max-sm:col-span-2">
            <span className="block font-mono text-white/28">inversión base</span>
            <strong className="mt-1 block font-mono text-white/78">USD {resultados.costoAutomation}/mes</strong>
          </div>
        </div>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <motion.div
            animate={{ width: `${Math.min((resultados.horasAhorradas / 200) * 100, 100)}%` }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500"
            style={{ boxShadow: '0 0 14px rgba(245,158,11,0.58)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[390px]:grid-cols-2">
        <ResultMiniCard
          title="Costo oculto/mes"
          note="Horas manuales convertidas a costo hora."
          icon={WalletCards}
          color="#f59e0b"
          colorRgb="245,158,11"
          centerActivate={centerActivate}
        >
          <div className="flex items-end gap-0.5">
            <span className="mb-1 font-mono text-sm text-amber-500/60">$</span>
            <OdometerDigit value={resultados.ahorroUSD} fontSize="26px" color="#f59e0b" />
            <span className="mb-1 ml-1.5 font-mono text-[10px] font-bold text-white/25">USD</span>
          </div>
        </ResultMiniCard>

        <ResultMiniCard
          title="ROI neto"
          note="Retorno estimado tras descontar la automatización."
          icon={TrendingUp}
          color={resultados.roiPct > 0 ? '#10b981' : '#ef4444'}
          colorRgb={resultados.roiPct > 0 ? '16,185,129' : '239,68,68'}
          centerActivate={centerActivate}
        >
          <div className="flex items-end gap-0.5">
            <OdometerDigit value={resultados.roiPct} fontSize="26px" color={resultados.roiPct > 0 ? '#10b981' : '#ef4444'} />
            <span className={`mb-1 font-mono text-sm font-bold ${resultados.roiPct > 0 ? 'text-emerald-500/60' : 'text-red-500/60'}`}>%</span>
          </div>
        </ResultMiniCard>
      </div>

      <motion.a
        href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}?text=Hola%20DevelOP%2C%20quiero%20calcular%20el%20ROI%20real%20de%20automatizar%20procesos.%20Estimé%20${resultados.horasAhorradas}%20horas%20recuperables%20al%20mes.`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={shouldReduceMotion ? {} : { scale: 1.025, y: -2 }}
        whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 420, damping: 18 }}
        className="flex items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-4 text-center text-[12px] font-black uppercase tracking-[0.04em] text-[#070709] sm:px-8 sm:text-sm"
        style={{ boxShadow: '0 0 32px rgba(245,158,11,0.32), 0 8px 24px rgba(0,0,0,0.3)' }}
      >
        Calcular mi ROI real
        <ArrowUpRight size={16} strokeWidth={2.4} />
      </motion.a>

      <p className="px-4 text-center font-mono text-[10px] leading-relaxed text-white/18">
        Base: 22 días hábiles, 82% de reducción manual y automatización desde $240 USD/mes.
      </p>
    </motion.div>
  )
}

export default function CalculadoraAutomation() {
  const sectionRef = useRef<HTMLElement>(null)
  const isInView = useInView(sectionRef, { once: true, amount: 0.15 })
  const shouldReduceMotion = useReducedMotion()
  const { isTabletOrDown } = useViewportFlags()

  const [tareasAlDia, setTareasAlDia] = useState(25)
  const [minutosPorTarea, setMinutosPorTarea] = useState(12)
  const [costoHoraUSD, setCostoHoraUSD] = useState(20)
  const [showAdvanced, setShowAdvanced] = useState(true)

  const resultados = useMemo<ROIResultados>(() => {
    const tareasMes = tareasAlDia * 22
    const horasManuales = Math.round((tareasMes * minutosPorTarea) / 60)
    const horasAhorradas = Math.round(horasManuales * 0.82)
    const ahorroUSD = Math.round(horasAhorradas * costoHoraUSD)
    const diasLibres = Math.round(horasAhorradas / 8)
    const costoAutomation = 240
    const roiNeto = ahorroUSD - costoAutomation
    const roiPct = Math.round((roiNeto / costoAutomation) * 100)

    return {
      tareasMes,
      horasManuales,
      horasAhorradas,
      ahorroUSD,
      diasLibres,
      costoAutomation,
      roiNeto,
      roiPct,
    }
  }, [tareasAlDia, minutosPorTarea, costoHoraUSD])

  return (
    <section
      id="calculadora"
      ref={sectionRef}
      className="relative z-[1] w-full overflow-hidden bg-[#070709] px-4 py-20 sm:px-8 md:px-12 md:py-32 lg:py-40"
    >
      <AtmosphereCalc />

      <div className="relative z-10 mx-auto max-w-6xl">
        <Header isInView={isInView} />

        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.08fr_1fr] lg:gap-20">
          <SliderSide
            tareasAlDia={tareasAlDia}
            setTareasAlDia={setTareasAlDia}
            minutosPorTarea={minutosPorTarea}
            setMinutosPorTarea={setMinutosPorTarea}
            costoHoraUSD={costoHoraUSD}
            setCostoHoraUSD={setCostoHoraUSD}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            isInView={isInView}
            centerActivate={isTabletOrDown}
          />

          <OdometerSide resultados={resultados} isInView={isInView} centerActivate={isTabletOrDown} />
        </div>

        <motion.div
          initial={shouldReduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 1.2, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-[clamp(48px,7vh,80px)] h-px origin-left bg-[linear-gradient(90deg,transparent,rgba(245,158,11,0.35)_30%,rgba(249,115,22,0.4)_50%,rgba(245,158,11,0.35)_70%,transparent)]"
        />
      </div>
    </section>
  )
}
