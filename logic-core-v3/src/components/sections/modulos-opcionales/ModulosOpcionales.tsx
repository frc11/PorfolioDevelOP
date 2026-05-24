'use client'

import { motion } from 'motion/react'
import { getActiveModules, getComingSoonModules } from '@/lib/data/premium-modules'
import { ModuloActiveCard } from './ModuloActiveCard'
import { ModuloComingSoonCard } from './ModuloComingSoonCard'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: EASE_PREMIUM },
  },
}

const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
}

const compactCardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.05,
    },
  },
}

const PLUS_SYMBOLS = [
  {
    id: 1,
    left: '7%',
    top: '16%',
    size: 86,
    opacity: 0.12,
    delay: 0.12,
    revealDuration: 2.4,
    floatDuration: 7.2,
    className: 'hidden md:block',
  },
  {
    id: 2,
    left: '84%',
    top: '12%',
    size: 118,
    opacity: 0.10,
    delay: 0.34,
    revealDuration: 2.7,
    floatDuration: 8.4,
    className: 'hidden lg:block',
  },
  {
    id: 3,
    left: '12%',
    top: '67%',
    size: 136,
    opacity: 0.08,
    delay: 0.52,
    revealDuration: 2.9,
    floatDuration: 9,
    className: 'hidden lg:block',
  },
  {
    id: 4,
    left: '88%',
    top: '66%',
    size: 92,
    opacity: 0.12,
    delay: 0.72,
    revealDuration: 2.5,
    floatDuration: 7.6,
    className: 'hidden md:block',
  },
  {
    id: 5,
    left: '50%',
    top: '8%',
    size: 64,
    opacity: 0.07,
    delay: 0.95,
    revealDuration: 2.8,
    floatDuration: 8.8,
    className: 'hidden xl:block',
  },
  {
    id: 6,
    left: '22%',
    top: '24%',
    size: 44,
    opacity: 0.055,
    delay: 1.1,
    revealDuration: 2.6,
    floatDuration: 8.2,
    className: 'hidden xl:block',
  },
  {
    id: 7,
    left: '94%',
    top: '42%',
    size: 70,
    opacity: 0.07,
    delay: 0.64,
    revealDuration: 2.5,
    floatDuration: 7.8,
    className: 'hidden lg:block',
  },
  {
    id: 8,
    left: '28%',
    top: '88%',
    size: 76,
    opacity: 0.065,
    delay: 0.86,
    revealDuration: 2.8,
    floatDuration: 9.4,
    className: 'hidden lg:block',
  },
  {
    id: 9,
    left: '70%',
    top: '84%',
    size: 52,
    opacity: 0.075,
    delay: 1.22,
    revealDuration: 2.4,
    floatDuration: 7.1,
    className: 'hidden md:block',
  },
  {
    id: 10,
    left: '6%',
    top: '84%',
    size: 58,
    opacity: 0.10,
    delay: 0.24,
    revealDuration: 2.2,
    floatDuration: 6.8,
    className: 'block md:hidden',
  },
  {
    id: 11,
    left: '78%',
    top: '28%',
    size: 72,
    opacity: 0.08,
    delay: 0.48,
    revealDuration: 2.4,
    floatDuration: 7.4,
    className: 'block md:hidden',
  },
] as const

function ModulesPlusBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #020304 0%, #020a11 28%, #031018 54%, #020509 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-72"
        style={{
          background:
            'linear-gradient(180deg, #020304 0%, rgba(2,7,12,0.72) 36%, transparent 100%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[-13rem] h-80 w-[72rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.075), rgba(37,99,235,0.04) 44%, transparent 74%)',
        }}
      />
      <svg
        className="absolute left-[-8%] top-[-5rem] hidden h-52 w-[64rem] opacity-14 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 92C154 130 270 92 414 132C560 174 686 168 820 126C910 98 970 110 1020 134"
          stroke="rgba(56,189,248,0.30)"
          strokeWidth="1"
        />
        <path
          d="M0 132C172 164 296 126 442 158C588 188 720 180 866 150C944 134 990 146 1020 162"
          stroke="rgba(37,99,235,0.20)"
          strokeWidth="1"
        />
      </svg>

      <div
        className="absolute -left-[14%] top-[-12%] h-[32rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.10), rgba(37,99,235,0.045) 42%, transparent 72%)',
        }}
      />
      <div
        className="absolute -right-[18%] bottom-[-22%] h-[38rem] w-[44rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(14,165,233,0.12), rgba(59,130,246,0.045) 45%, transparent 74%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.065]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          maskImage: 'radial-gradient(ellipse 82% 72% at 50% 48%, black 20%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(ellipse 82% 72% at 50% 48%, black 20%, transparent 88%)',
        }}
      />

      <svg
        className="absolute left-[-8%] top-[-6%] hidden h-[30rem] w-[42rem] opacity-36 lg:block"
        viewBox="0 0 700 460"
        fill="none"
        preserveAspectRatio="xMinYMin slice"
      >
        <path d="M0 104H134L168 138H286L322 174H458" stroke="rgba(56,189,248,0.22)" strokeWidth="1" />
        <path d="M0 168H96L132 204H236L272 240H382" stroke="rgba(37,99,235,0.18)" strokeWidth="1" />
        <path d="M0 250H154V306H242L282 346H438" stroke="rgba(6,182,212,0.16)" strokeWidth="1" />
        <path d="M116 0V86H168V138" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
        <path d="M232 0V112H286V174" stroke="rgba(37,99,235,0.15)" strokeWidth="1" />
        {[
          [116, 86],
          [134, 104],
          [168, 138],
          [236, 204],
          [242, 306],
          [272, 240],
          [282, 346],
          [286, 174],
          [322, 174],
          [382, 240],
          [438, 346],
          [458, 174],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 4 === 0 ? 3 : 1.9}
            fill="rgba(56,189,248,0.48)"
          />
        ))}
      </svg>

      <svg
        className="absolute bottom-[-8%] right-[-7%] hidden h-[32rem] w-[48rem] opacity-42 md:block"
        viewBox="0 0 760 500"
        fill="none"
        preserveAspectRatio="xMaxYMax slice"
      >
        <path d="M120 410H252L288 374H416L452 338H760" stroke="rgba(56,189,248,0.24)" strokeWidth="1" />
        <path d="M220 322H338L374 286H510L548 248H760" stroke="rgba(37,99,235,0.19)" strokeWidth="1" />
        <path d="M410 500V434H476V376H548" stroke="rgba(6,182,212,0.17)" strokeWidth="1" />
        <path d="M568 500V448H622V388H688" stroke="rgba(56,189,248,0.14)" strokeWidth="1" />
        {[
          [252, 410],
          [288, 374],
          [338, 322],
          [374, 286],
          [416, 374],
          [452, 338],
          [476, 434],
          [510, 286],
          [548, 248],
          [548, 376],
          [622, 448],
          [688, 388],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 3 === 0 ? 3.2 : 1.9}
            fill="rgba(56,189,248,0.46)"
          />
        ))}
      </svg>

      {PLUS_SYMBOLS.map((symbol) => (
        <motion.div
          key={symbol.id}
          className={`absolute ${symbol.className}`}
          initial={{ opacity: 0, y: 150, scale: 0.92 }}
          whileInView={{ opacity: symbol.opacity, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{
            duration: symbol.revealDuration,
            delay: symbol.delay,
            ease: EASE_PREMIUM,
          }}
          style={{
            left: symbol.left,
            top: symbol.top,
          }}
        >
          {symbol.id <= 4 || symbol.className.includes('md:hidden') ? (
            <motion.span
              className="block select-none font-black leading-none text-cyan-200"
              animate={{
                x: [0, 5, -3, 0],
                y: [0, -8, 4, 0],
                rotate: [0, 2, -1, 0],
              }}
              transition={{
                duration: symbol.floatDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                fontSize: symbol.size,
                textShadow: '0 0 24px rgba(103,232,249,0.24)',
              }}
            >
              +
            </motion.span>
          ) : (
            <span
              className="block select-none font-black leading-none text-cyan-200"
              style={{
                fontSize: symbol.size,
                textShadow: '0 0 18px rgba(103,232,249,0.18)',
              }}
            >
              +
            </span>
          )}
        </motion.div>
      ))}

      <div
        className="absolute inset-x-0 bottom-0 h-80"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(2,7,12,0.46) 44%, #020509 100%)',
        }}
      />
      <div
        className="absolute bottom-[-13rem] left-1/2 h-80 w-[72rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.075), rgba(139,92,246,0.04) 42%, transparent 74%)',
        }}
      />
      <svg
        className="absolute bottom-[-5rem] right-[-7%] hidden h-52 w-[64rem] opacity-14 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 116C152 82 268 142 406 106C548 68 676 92 812 138C914 172 972 142 1020 116"
          stroke="rgba(56,189,248,0.30)"
          strokeWidth="1"
        />
        <path
          d="M0 154C176 124 302 174 450 144C592 116 730 134 874 168C948 186 992 166 1020 150"
          stroke="rgba(139,92,246,0.18)"
          strokeWidth="1"
        />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 64% 54% at 50% 40%, rgba(2,4,7,0.86) 0%, rgba(2,4,7,0.64) 48%, transparent 76%), radial-gradient(ellipse 88% 60% at 50% 50%, transparent 32%, rgba(0,0,0,0.40) 100%)',
        }}
      />
    </div>
  )
}

export function ModulosOpcionales() {
  const activeModules = getActiveModules()
  const comingSoonModules = getComingSoonModules()

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#030303] px-6 py-24 md:px-10 md:py-36 lg:px-16">
      <ModulesPlusBackground />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          className="mb-16 md:mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">
            Y CUANDO ESTÉS LISTO
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            Sumás módulos según lo que{' '}
            <span className="text-zinc-400">necesite tu negocio.</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            No vendemos suites infladas. Empezás con lo esencial y escalás cuando los datos te
            digan que es momento. Cada módulo es opcional, mensual y cancelable.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
          variants={cardsContainer}
          className="mb-16"
        >
          <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-500 uppercase mb-6">
            DISPONIBLES AHORA
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeModules.map((mod, i) => (
              <ModuloActiveCard key={mod.slug} module={mod} index={i} />
            ))}
          </div>
        </motion.div>

        <div className="border-t border-white/[0.06] mb-16" />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={compactCardsContainer}
        >
          <p className="text-[11px] font-bold tracking-[0.18em] text-zinc-500 uppercase mb-6">
            PRÓXIMAMENTE Q3 2026
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {comingSoonModules.map((mod, i) => (
              <ModuloComingSoonCard key={mod.slug} module={mod} index={i} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
