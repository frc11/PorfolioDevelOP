'use client'

import { motion } from 'framer-motion'
import { Activity, Inbox, TrendingUp, ChevronRight, ImageOff } from 'lucide-react'
import { useState } from 'react'
import type { StoryMoment } from './data'

const EASE_PREMIUM = [0.25, 0.46, 0.45, 0.94] as const
const SPRING_SOFT = { type: 'spring', stiffness: 80, damping: 20 } as const

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

function ScreenshotPlaceholder({ alt }: { alt: string }) {
  return (
    <div className="w-full aspect-[16/10] rounded-xl bg-zinc-800/50 border border-zinc-700/50 flex flex-col items-center justify-center gap-3">
      <ImageOff size={28} strokeWidth={1.5} className="text-zinc-600" />
      <span className="text-xs text-zinc-500 text-center px-4">[Captura: {alt}]</span>
    </div>
  )
}

function ScreenshotImage({ path, alt }: { path: string; alt: string }) {
  const [errored, setErrored] = useState(false)

  if (errored) return <ScreenshotPlaceholder alt={alt} />

  return (
    <img
      src={path}
      alt={alt}
      onError={() => setErrored(true)}
      className="w-full rounded-xl object-cover aspect-[16/10]"
    />
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
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ ...SPRING_SOFT, delay }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
      }}
      className="p-3 shadow-2xl"
    >
      <ScreenshotImage path={moment.screenshotPath} alt={moment.screenshotAlt} />
    </motion.div>
  )
}

function TextColumn({ moment, delay }: { moment: StoryMoment; delay: number }) {
  const Icon = ICON_MAP[moment.iconName as IconName] ?? Activity

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: EASE_PREMIUM, delay }}
      className="flex flex-col gap-5"
    >
      {/* Time badge */}
      <div className="flex items-center gap-2">
        <span
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
        </span>
      </div>

      {/* Question */}
      <h3 className="text-2xl md:text-3xl font-bold text-white leading-snug">
        {moment.question}
      </h3>

      {/* Panel shows */}
      <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
        {moment.panelShows}
      </p>

      {/* Decision */}
      <p className="flex items-start gap-2 text-base text-zinc-400">
        <ChevronRight size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" style={{ color: moment.accentColor }} />
        {moment.decision}
      </p>

      {/* Outcome */}
      <div
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
      </div>
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
