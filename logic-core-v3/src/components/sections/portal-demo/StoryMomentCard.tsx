'use client'

import { motion } from 'motion/react'
import { Activity, Inbox, TrendingUp, ChevronRight } from 'lucide-react'
import type { StoryMoment } from './data'

const EASE_PREMIUM = [0.25, 0.46, 0.45, 0.94] as const
const EASE_REVEAL = [0.22, 1, 0.36, 1] as const
const SPRING_SOFT = { type: 'spring', stiffness: 80, damping: 20 } as const
const SECTION_ITEM = {
  hidden: { opacity: 0, y: 22, filter: 'blur(6px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
} as const

const ICON_MAP = {
  Activity,
  Inbox,
  TrendingUp,
} as const

type IconName = keyof typeof ICON_MAP

interface Props {
  moment: StoryMoment
  index: number
}

function HealthScoreMockup({ color }: { color: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">Health Score</p>
        <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] uppercase tracking-[0.16em] text-white/35">
          78/100
        </span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-[0.92fr_1.08fr] sm:gap-4">
        <div className="flex min-h-0 flex-col justify-between rounded-lg border border-white/[0.07] bg-white/[0.035] p-3 sm:p-4">
          <div className="grid min-h-0 flex-1 place-items-center py-2 sm:py-3">
            <motion.div
              initial={{ opacity: 0, rotate: -8, scale: 0.92 }}
              whileInView={{ opacity: 1, rotate: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: EASE_REVEAL }}
              className="grid h-[7.5rem] w-[7.5rem] place-items-center rounded-full sm:h-[8.5rem] sm:w-[8.5rem]"
              style={{
                background: `conic-gradient(${color} 0 78%, rgba(255,255,255,0.08) 78% 100%)`,
                boxShadow: `0 0 32px ${color}24`,
              }}
            >
              <div className="grid h-[5.5rem] w-[5.5rem] place-items-center rounded-full bg-[#07090d] sm:h-[6.25rem] sm:w-[6.25rem]">
                <span className="text-[2rem] font-black leading-none text-white sm:text-[2.15rem]">78</span>
              </div>
            </motion.div>
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.025] px-3 py-2">
            <span className="text-[9px] uppercase tracking-[0.18em] text-white/32">Estado</span>
            <span className="text-[10px] font-semibold" style={{ color }}>
              Normal
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-col justify-between gap-2 sm:gap-3">
          {[
            ['Salud digital', 82],
            ['Comercial', 74],
            ['Operaciones', 79],
          ].map(([label, value]) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.45, ease: EASE_REVEAL }}
              className="flex min-h-0 flex-1 flex-col justify-center rounded-lg border border-white/[0.07] bg-white/[0.035] px-3 py-3 sm:px-3.5 sm:py-3.5"
            >
              <div className="mb-2.5 flex items-center justify-between text-[10px] text-white/50">
                <span>{label}</span>
                <span style={{ color }}>{value}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.65, ease: EASE_REVEAL }}
                  className="h-full origin-left rounded-full"
                  style={{ width: `${value}%`, background: color }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] px-3 py-2.5 text-[10px] leading-snug text-cyan-100 sm:text-[11px]">
        Semana normal. Sin alertas criticas.
      </div>
    </div>
  )
}

function AttentionMockup({ color }: { color: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Tu Atención Hoy</p>
        <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-white/35">Ahora</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {['14 mails', '8 mensajes', '3 alertas'].map((item) => (
          <div key={item} className="rounded-lg border border-white/[0.07] bg-white/[0.035] px-2 py-2 text-center text-[10px] leading-tight text-white/55 sm:px-3">
            {item}
          </div>
        ))}
      </div>
      <div className="grid min-h-0 flex-1 gap-2.5 sm:gap-3">
        {[
          ['Critico', 'Entrega del proyecto espera aprobacion', color],
          ['Responder', '2 resenas de Google en 48h', '#f59e0b'],
          ['Puede esperar', 'Resumen semanal listo para revisar', '#64748b'],
        ].map(([tag, title, tagColor]) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.5, ease: EASE_REVEAL }}
            className="relative overflow-hidden rounded-lg border border-white/[0.07] bg-white/[0.035] p-3 sm:p-4"
          >
            <div
              className="absolute inset-y-0 left-0 w-1"
              style={{ background: tagColor }}
              aria-hidden
            />
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: tagColor }}>
                {tag}
              </span>
              <span className="rounded-full border border-white/[0.08] px-2 py-0.5 text-[9px] text-white/35">Hoy</span>
            </div>
            <p className="text-[13px] font-semibold leading-snug text-white/82 sm:text-sm">{title}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function WeekResultsMockup({ color }: { color: string }) {
  const bars = [46, 68, 58, 84, 76, 92, 72]

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">Resultados de la Semana</p>
        <span className="shrink-0 text-[9px] text-white/32">vs anterior</span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          ['Leads', '47', '+12%'],
          ['Ventas', '8', '+3'],
          ['Facturado', '$340K', '+18%'],
        ].map(([label, value, trend]) => (
          <div key={label} className="min-w-0 rounded-lg border border-white/[0.07] bg-white/[0.035] p-2.5 sm:p-3">
            <p className="truncate text-[8px] uppercase tracking-[0.14em] text-white/35 sm:text-[9px] sm:tracking-[0.18em]">{label}</p>
            <div className="mt-2 flex min-w-0 items-end justify-between gap-1.5">
              <span className="min-w-0 text-lg font-black leading-none text-white sm:text-xl">{value}</span>
              <span className="shrink-0 text-[9px] sm:text-[10px]" style={{ color }}>{trend}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex min-h-[120px] flex-1 items-end gap-2 rounded-lg border border-white/[0.07] bg-white/[0.035] px-4 pb-4 pt-5">
        {bars.map((height, index) => (
          <div key={index} className="flex flex-1 flex-col justify-end">
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.62, ease: EASE_REVEAL, delay: index * 0.04 }}
              className="rounded-t-md"
              style={{
                height: `${height}%`,
                minHeight: 22,
                transformOrigin: 'bottom',
                background: `linear-gradient(180deg, ${color}, ${color}55)`,
                boxShadow: height > 80 ? `0 0 18px ${color}38` : 'none',
              }}
            />
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3 text-[11px] leading-relaxed text-white/55 sm:text-xs">
        La IA detecto una mejora de conversion y recomienda reforzar el canal que mas cierres genero.
      </div>
    </div>
  )
}

function DashboardMockup({ moment }: { moment: StoryMoment }) {
  return (
    <div className="relative min-h-[430px] w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#07090d] p-3 sm:min-h-[380px] sm:p-4 lg:min-h-[400px]">
      <motion.div
        className="pointer-events-none absolute inset-0"
        whileHover={{ opacity: 0.95 }}
        transition={{ duration: 0.35, ease: EASE_PREMIUM }}
        style={{
          background: `radial-gradient(circle at 18% 12%, ${moment.accentColor}1F, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.055), transparent 42%)`,
          opacity: 0.72,
        }}
        aria-hidden
      />
      <div className="relative mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-300/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-300/70" />
        </div>
        <span className="rounded-full border border-white/[0.08] px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-white/35">
          develOP live
        </span>
      </div>
      <div className="relative h-[calc(100%-2.35rem)] min-h-0">
        {moment.id === 'health-score' && <HealthScoreMockup color={moment.accentColor} />}
        {moment.id === 'attention-stack' && <AttentionMockup color={moment.accentColor} />}
        {moment.id === 'week-results' && <WeekResultsMockup color={moment.accentColor} />}
      </div>
    </div>
  )
}

function ScreenshotCard({
  moment,
  delay,
}: {
  moment: StoryMoment
  delay: number
}) {
  return (
    <motion.div
      data-scroll-hover-target
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      whileHover={{
        y: -4,
        scale: 1.01,
        borderColor: `${moment.accentColor}52`,
        boxShadow: `0 18px 50px ${moment.accentColor}1A, 0 24px 80px rgba(0,0,0,0.42)`,
      }}
      transition={{
        ...SPRING_SOFT,
        delay,
        y: { duration: 0.35, ease: EASE_REVEAL },
        scale: { duration: 0.35, ease: EASE_REVEAL },
        borderColor: { duration: 0.35, ease: EASE_REVEAL },
        boxShadow: { duration: 0.35, ease: EASE_REVEAL },
      }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        '--scroll-hover-y': '-4px',
        '--scroll-hover-scale': '1.01',
        '--scroll-hover-border': `${moment.accentColor}52`,
        '--scroll-hover-shadow': `0 18px 50px ${moment.accentColor}1A, 0 24px 80px rgba(0,0,0,0.42)`,
      }}
      className="p-3 shadow-2xl"
    >
      <DashboardMockup moment={moment} />
    </motion.div>
  )
}

function TextColumn({ moment, delay }: { moment: StoryMoment; delay: number }) {
  const Icon = ICON_MAP[moment.iconName as IconName] ?? Activity

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.08, delayChildren: delay } },
      }}
      className="flex flex-col gap-5"
    >
      {/* Time badge */}
      <motion.div variants={SECTION_ITEM} transition={{ duration: 0.58, ease: EASE_REVEAL }} className="flex items-center gap-2">
        <motion.span
          whileInView={{
            boxShadow: [
              `0 0 12px ${moment.accentColor}20`,
              `0 0 24px ${moment.accentColor}34`,
              `0 0 12px ${moment.accentColor}20`,
            ],
          }}
          viewport={{ once: true }}
          transition={{ duration: 1.4, ease: 'easeInOut', delay: delay + 0.25 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border"
          style={{
            color: moment.accentColor,
            borderColor: `${moment.accentColor}40`,
            background: `${moment.accentColor}10`,
            boxShadow: `0 0 12px ${moment.accentColor}20`,
          }}
        >
          <Icon size={12} strokeWidth={1.5} />
          {moment.time} — {moment.timeBadge}
        </motion.span>
      </motion.div>

      {/* Question */}
      <motion.h3 variants={SECTION_ITEM} transition={{ duration: 0.6, ease: EASE_REVEAL }} className="text-2xl md:text-3xl font-bold text-white leading-snug">
        {moment.question}
      </motion.h3>

      {/* Panel shows */}
      <motion.p variants={SECTION_ITEM} transition={{ duration: 0.6, ease: EASE_REVEAL }} className="text-base md:text-lg text-zinc-300 leading-relaxed">
        {moment.panelShows}
      </motion.p>

      {/* Decision */}
      <motion.p variants={SECTION_ITEM} transition={{ duration: 0.6, ease: EASE_REVEAL }} className="flex items-start gap-2 text-base text-zinc-400">
        <ChevronRight size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: moment.accentColor }} />
        {moment.decision}
      </motion.p>

      {/* Outcome */}
      <motion.div
        variants={SECTION_ITEM}
        transition={{ duration: 0.6, ease: EASE_REVEAL }}
        whileHover={{
          x: 3,
          backgroundColor: `${moment.accentColor}0F`,
          boxShadow: `0 0 26px ${moment.accentColor}12`,
        }}
        className="pl-4 py-3 pr-3 rounded-lg"
        style={{
          borderLeft: `3px solid ${moment.accentColor}`,
          background: `${moment.accentColor}08`,
        }}
      >
        <p
          className="text-xs font-semibold tracking-wide uppercase mb-1"
          style={{ color: moment.accentColor }}
        >
          Resultado
        </p>
        <p className="text-sm text-zinc-200 italic">{moment.outcome}</p>
      </motion.div>
    </motion.div>
  )
}

export function StoryMomentCard({ moment, index }: Props) {
  const isEven = index % 2 === 0
  const textDelay = 0.05 * index
  const imageDelay = textDelay + 0.2

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      {/* Mobile: always text first, then image */}
      {/* Desktop: alternate sides */}
      <div className={isEven ? 'lg:order-1' : 'lg:order-2'}>
        <TextColumn moment={moment} delay={textDelay} />
      </div>

      {/* Screenshot on mobile always renders after TextColumn (order-2 default) */}
      <div className={`order-last ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
        <ScreenshotCard moment={moment} delay={imageDelay} />
      </div>
    </div>
  )
}
