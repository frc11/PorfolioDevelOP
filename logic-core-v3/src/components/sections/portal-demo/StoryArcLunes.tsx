'use client'

import { motion } from 'motion/react'
import { STORY_MOMENTS } from './data'
import { StoryMomentCard } from './StoryMomentCard'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

export function StoryArcLunes() {
  return (
    <div className="relative">
      {/* Gradient radial background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(6,182,212,0.04) 0%, transparent 70%)',
        }}
        aria-hidden
      />

      {/* Vertical connector line — desktop only */}
      <div
        className="absolute left-1/2 top-0 bottom-0 hidden w-px -translate-x-1/2 overflow-hidden lg:block pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(6,182,212,0.18), rgba(139,92,246,0.18), rgba(16,185,129,0.18))',
          opacity: 0.58,
        }}
        aria-hidden
      >
        <motion.div
          className="absolute inset-x-0 top-0 h-40"
          animate={{ y: ['-20%', '260%'], opacity: [0, 0.85, 0] }}
          transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1.5 }}
          style={{
            background:
              'linear-gradient(to bottom, transparent, rgba(6,182,212,0.85), rgba(139,92,246,0.65), transparent)',
            boxShadow: '0 0 22px rgba(6,182,212,0.42)',
          }}
        />
      </div>

      <div className="relative flex flex-col gap-32 md:gap-48">
        {STORY_MOMENTS.map((moment, index) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, y: 28, filter: 'blur(6px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.65, ease: EASE_PREMIUM, delay: index * 0.04 }}
          >
            <StoryMomentCard moment={moment} index={index} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
