'use client'

import { motion } from 'motion/react'
import { PortalDemoHeader } from './PortalDemoHeader'
import { StoryArcLunes } from './StoryArcLunes'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

function PortalDashboardCta() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.65, ease: EASE_PREMIUM }}
      className="mt-20 flex justify-center md:mt-28"
    >
      <motion.a
        href="/contact"
        whileHover={{
          y: -3,
          borderColor: 'rgba(6,182,212,0.55)',
          boxShadow: '0 18px 54px rgba(0,0,0,0.38), 0 0 42px rgba(6,182,212,0.20)',
          backgroundColor: 'rgba(6,182,212,0.12)',
        }}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.35, ease: EASE_PREMIUM }}
        className="group inline-flex items-center gap-3 rounded-xl border border-cyan-400/25 bg-cyan-400/[0.07] px-5 py-3 text-sm font-bold text-cyan-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-300/50 md:px-6 md:py-3.5"
      >
        Quiero saber más sobre el dashboard
        <span className="text-cyan-300 transition-transform duration-300 ease-out group-hover:translate-x-1" aria-hidden>
          -&gt;
        </span>
      </motion.a>
    </motion.div>
  )
}

export function PortalDemo() {
  return (
    <section className="relative w-full overflow-hidden bg-[#030303] py-24 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 36% at 50% 0%, rgba(6,182,212,0.10), transparent 68%), linear-gradient(180deg, #030303 0%, #050608 42%, #030303 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-35"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.045) 1px, transparent 1px)',
          backgroundSize: '44px 44px',
          maskImage: 'radial-gradient(ellipse 80% 70% at 50% 48%, black 20%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 70% at 50% 48%, black 20%, transparent 100%)',
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-[-15%] top-[18%] hidden h-px w-[42%] md:block"
        animate={{ x: ['0%', '120%'], opacity: [0, 0.34, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.7), transparent)',
          boxShadow: '0 0 26px rgba(6,182,212,0.22)',
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-10 lg:px-16">
        <div className="mb-20 md:mb-28">
          <PortalDemoHeader />
        </div>

        <StoryArcLunes />
        <PortalDashboardCta />
      </div>
    </section>
  )
}
