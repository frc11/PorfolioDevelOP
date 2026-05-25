'use client'

import { motion } from 'motion/react'
import { TodoIncluidoFeatureCard } from './TodoIncluidoFeatureCard'
import { INCLUDED_FEATURES } from './data'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

const cardsContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
      delayChildren: 0.08,
    },
  },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.66, ease: EASE_PREMIUM },
  },
}

function PremiumToolsBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #020407 0%, #03101a 38%, #02060a 72%, #020304 100%)',
        }}
      />

      <div
        className="absolute inset-x-0 top-0 h-72"
        style={{
          background:
            'linear-gradient(180deg, #020407 0%, rgba(2,7,12,0.72) 34%, transparent 100%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[-13rem] h-80 w-[68rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.08), rgba(37,99,235,0.035) 44%, transparent 74%)',
        }}
      />
      <svg
        className="absolute left-[-9%] top-[-5rem] hidden h-52 w-[64rem] opacity-18 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 84C152 126 252 80 392 120C544 164 646 170 792 126C892 96 954 104 1020 132"
          stroke="rgba(56,189,248,0.34)"
          strokeWidth="1"
        />
        <path
          d="M0 126C164 154 280 114 430 146C574 176 690 178 838 148C926 130 984 142 1020 154"
          stroke="rgba(37,99,235,0.22)"
          strokeWidth="1"
        />
      </svg>

      <motion.div
        className="absolute -right-[18%] -top-[20%] h-[34rem] w-[34rem] rounded-full blur-3xl"
        animate={{ opacity: [0.34, 0.58, 0.34], scale: [0.98, 1.04, 0.98] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.15), rgba(37,99,235,0.06) 42%, transparent 72%)',
        }}
      />
      <div
        className="absolute -left-[16%] bottom-[-18%] h-[36rem] w-[40rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(14,165,233,0.11), rgba(6,182,212,0.045) 44%, transparent 74%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.075]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(ellipse 84% 72% at 50% 44%, black 18%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(ellipse 84% 72% at 50% 44%, black 18%, transparent 88%)',
        }}
      />

      <svg
        className="absolute right-[-7%] top-[-8%] hidden h-[34rem] w-[48rem] opacity-55 md:block"
        viewBox="0 0 760 520"
        fill="none"
        preserveAspectRatio="xMaxYMin slice"
      >
        <path d="M760 58H604L568 94H462L426 130H294" stroke="rgba(56,189,248,0.30)" strokeWidth="1" />
        <path d="M760 108H648L612 144H510L474 180H342" stroke="rgba(37,99,235,0.24)" strokeWidth="1" />
        <path d="M760 162H684L654 192H548L510 230H398" stroke="rgba(6,182,212,0.20)" strokeWidth="1" />
        <path d="M760 228H668L632 264H538V330H470" stroke="rgba(56,189,248,0.17)" strokeWidth="1" />
        <path d="M710 0V78H672V156H634V246" stroke="rgba(56,189,248,0.18)" strokeWidth="1" />
        <path d="M594 0V64H552V118H496" stroke="rgba(37,99,235,0.18)" strokeWidth="1" />
        {[
          [294, 130],
          [342, 180],
          [398, 230],
          [426, 130],
          [470, 330],
          [474, 180],
          [496, 118],
          [510, 230],
          [538, 330],
          [548, 230],
          [568, 94],
          [604, 58],
          [612, 144],
          [632, 264],
          [654, 192],
          [672, 78],
          [684, 162],
          [710, 78],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 5 === 0 ? 3.4 : 2.2}
            fill={index % 5 === 0 ? 'rgba(125,211,252,0.76)' : 'rgba(56,189,248,0.45)'}
          />
        ))}
        <rect x="606" y="302" width="92" height="92" rx="10" stroke="rgba(56,189,248,0.16)" />
        <rect x="634" y="330" width="36" height="36" rx="4" stroke="rgba(56,189,248,0.26)" />
        <path d="M652 302V260M652 394V438M606 348H560M698 348H738" stroke="rgba(56,189,248,0.16)" />
      </svg>

      <svg
        className="absolute bottom-[-7%] left-[-8%] hidden h-[32rem] w-[48rem] opacity-48 lg:block"
        viewBox="0 0 760 500"
        fill="none"
        preserveAspectRatio="xMinYMax slice"
      >
        <path d="M0 420H124L158 386H280L316 350H456L494 312H760" stroke="rgba(6,182,212,0.27)" strokeWidth="1" />
        <path d="M0 366H92L130 328H232L270 290H404L438 256H760" stroke="rgba(37,99,235,0.21)" strokeWidth="1" />
        <path d="M0 300H150V246H246L286 206H398" stroke="rgba(56,189,248,0.17)" strokeWidth="1" />
        <path d="M84 500V432H142V368H198" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
        <path d="M186 500V454H244V402H316" stroke="rgba(37,99,235,0.16)" strokeWidth="1" />
        {[
          [84, 432],
          [124, 420],
          [142, 368],
          [158, 386],
          [198, 368],
          [232, 328],
          [244, 402],
          [270, 290],
          [280, 386],
          [316, 350],
          [398, 206],
          [404, 290],
          [438, 256],
          [456, 350],
          [494, 312],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 4 === 0 ? 3 : 1.9}
            fill="rgba(56,189,248,0.50)"
          />
        ))}
        {Array.from({ length: 34 }).map((_, index) => (
          <rect
            key={index}
            x={44 + (index % 17) * 13}
            y={170 + Math.floor(index / 17) * 18}
            width="6"
            height="6"
            rx="1"
            fill="rgba(56,189,248,0.17)"
          />
        ))}
      </svg>

      <div className="absolute left-[3%] top-[10%] hidden h-52 w-44 opacity-25 md:block">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(56,189,248,0.60) 1px, transparent 1.8px)',
            backgroundSize: '18px 18px',
            maskImage: 'linear-gradient(90deg, black, transparent 88%)',
            WebkitMaskImage: 'linear-gradient(90deg, black, transparent 88%)',
          }}
        />
      </div>

      <motion.div
        className="absolute left-[8%] top-[18%] hidden h-2 w-2 rounded-full bg-cyan-300 md:block"
        animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.9, 1.35, 0.9] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ boxShadow: '0 0 28px rgba(103,232,249,0.45)' }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-72"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(2,7,12,0.42) 46%, #020304 100%)',
        }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/2 h-80 w-[72rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.08), rgba(37,99,235,0.04) 42%, transparent 74%)',
        }}
      />
      <svg
        className="absolute bottom-[-4.5rem] left-[-8%] hidden h-52 w-[64rem] opacity-16 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 136C150 94 260 168 408 124C552 82 670 96 806 146C902 182 964 150 1020 122"
          stroke="rgba(56,189,248,0.32)"
          strokeWidth="1"
        />
        <path
          d="M0 174C166 136 292 196 438 160C582 124 714 138 856 176C936 198 984 174 1020 154"
          stroke="rgba(37,99,235,0.22)"
          strokeWidth="1"
        />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 50% at 50% 42%, rgba(2,4,7,0.84) 0%, rgba(2,4,7,0.64) 46%, transparent 74%), radial-gradient(ellipse 86% 58% at 50% 50%, transparent 34%, rgba(0,0,0,0.38) 100%)',
        }}
      />
    </div>
  )
}

export function TodoIncluido() {
  const firstRow = INCLUDED_FEATURES.slice(0, 3)
  const secondRow = INCLUDED_FEATURES.slice(3)

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#030303] px-6 py-24 md:px-10 md:py-36 lg:px-16">
      <PremiumToolsBackground />

      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.35 }}
          variants={fadeUp}
          className="mb-16 md:mb-20"
        >
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-4">
            TODO ESTO VIENE INCLUIDO EN TU PLAN
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6">
            5 herramientas premium,{' '}
            <span className="text-zinc-400">sin extras.</span>
          </h2>
          <p className="text-base md:text-lg text-zinc-400 leading-relaxed max-w-2xl">
            Cuando contratás develOP, te llevás todo el portal. No es un upsell. No es &quot;plan
            básico vs pro&quot;. Es lo que viene cuando trabajás con nosotros.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.22 }}
          variants={cardsContainer}
          transition={{ ease: EASE_PREMIUM }}
          className="flex flex-col gap-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstRow.map((feature, i) => (
              <TodoIncluidoFeatureCard key={feature.id} feature={feature} index={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:w-2/3 lg:mx-auto">
            {secondRow.map((feature, i) => (
              <TodoIncluidoFeatureCard key={feature.id} feature={feature} index={i + 3} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
