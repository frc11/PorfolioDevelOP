'use client'

import { motion } from 'motion/react'
import { PortalDemoHeader } from './PortalDemoHeader'
import { StoryArcLunes } from './StoryArcLunes'

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

function DashboardStoryBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #020407 0%, #031018 34%, #030609 68%, #020304 100%)',
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
        className="absolute -left-[18%] -top-[14%] h-[44rem] w-[44rem] rounded-full opacity-70 blur-3xl"
        animate={{ opacity: [0.48, 0.72, 0.48], scale: [0.98, 1.04, 0.98] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.16), rgba(14,116,144,0.07) 38%, transparent 70%)',
        }}
      />
      <div
        className="absolute -right-[16%] top-[6%] h-[36rem] w-[36rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.13), rgba(6,182,212,0.045) 42%, transparent 72%)',
        }}
      />
      <div
        className="absolute bottom-[-18%] right-[4%] h-[34rem] w-[42rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.10), rgba(59,130,246,0.045) 42%, transparent 72%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.085]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 86% 74% at 50% 46%, black 24%, transparent 88%)',
          WebkitMaskImage: 'radial-gradient(ellipse 86% 74% at 50% 46%, black 24%, transparent 88%)',
        }}
      />

      <svg
        className="absolute right-[-4%] top-0 hidden h-[36rem] w-[44rem] opacity-55 md:block"
        viewBox="0 0 720 560"
        fill="none"
        preserveAspectRatio="xMidYMin slice"
      >
        <path d="M720 44H558L522 80H394L360 114H250" stroke="rgba(56,189,248,0.28)" strokeWidth="1" />
        <path d="M720 86H610L574 122H462L426 158H330" stroke="rgba(37,99,235,0.24)" strokeWidth="1" />
        <path d="M720 134H640L606 168H486L448 206H300" stroke="rgba(6,182,212,0.22)" strokeWidth="1" />
        <path d="M720 204H626L596 234H512L482 264H360" stroke="rgba(56,189,248,0.16)" strokeWidth="1" />
        <path d="M720 286H660V360H600V430" stroke="rgba(59,130,246,0.18)" strokeWidth="1" />
        <path d="M642 42V164H594V250" stroke="rgba(6,182,212,0.16)" strokeWidth="1" />
        {[250, 300, 330, 360, 394, 426, 448, 462, 482, 512, 522, 558, 574, 596, 606, 610, 626, 640, 660].map((x, index) => (
          <circle
            key={index}
            cx={x}
            cy={[114, 206, 158, 264, 80, 158, 206, 122, 264, 234, 80, 44, 122, 234, 168, 86, 204, 134, 286][index]}
            r="3"
            fill="rgba(56,189,248,0.55)"
          />
        ))}
        <circle cx="594" cy="250" r="4" fill="rgba(6,182,212,0.7)" />
        <circle cx="642" cy="42" r="3" fill="rgba(255,255,255,0.72)" />
      </svg>

      <svg
        className="absolute bottom-[-3%] left-[-7%] hidden h-[34rem] w-[52rem] opacity-50 lg:block"
        viewBox="0 0 860 520"
        fill="none"
        preserveAspectRatio="xMinYMax slice"
      >
        <path d="M0 364C150 292 240 482 394 388C512 316 628 190 860 238" stroke="rgba(6,182,212,0.35)" strokeWidth="1.2" />
        <path d="M0 394C158 322 252 488 398 420C548 350 644 242 860 274" stroke="rgba(37,99,235,0.24)" strokeWidth="1" />
        <path d="M0 426C182 356 274 502 430 452C570 406 692 320 860 344" stroke="rgba(56,189,248,0.18)" strokeWidth="1" />
        {Array.from({ length: 46 }).map((_, index) => {
          const cx = 24 + index * 18
          const cy = 366 + Math.sin(index * 0.62) * 42 + (index % 5) * 3

          return (
            <circle
              key={index}
              cx={cx}
              cy={cy}
              r={index % 7 === 0 ? 2.8 : 1.4}
              fill={index % 7 === 0 ? 'rgba(6,182,212,0.75)' : 'rgba(56,189,248,0.28)'}
            />
          )
        })}
        {[90, 160, 230, 306, 380].map((x, index) => (
          <path
            key={x}
            d={`M${x} ${350 - index * 12}V${250 - index * 22}`}
            stroke="rgba(56,189,248,0.22)"
            strokeWidth="1"
          />
        ))}
      </svg>

      <svg
        className="absolute bottom-[3%] right-[-5%] hidden h-[27rem] w-[43rem] opacity-45 md:block"
        viewBox="0 0 700 420"
        fill="none"
        preserveAspectRatio="xMaxYMax slice"
      >
        <path d="M120 310L236 246L334 288L450 214L590 264L680 198" stroke="rgba(56,189,248,0.26)" strokeWidth="1" />
        <path d="M236 246L292 158L450 214L516 116L590 264" stroke="rgba(37,99,235,0.20)" strokeWidth="1" />
        <path d="M334 288L392 354L590 264L650 346" stroke="rgba(6,182,212,0.16)" strokeWidth="1" />
        {[
          [120, 310],
          [236, 246],
          [292, 158],
          [334, 288],
          [392, 354],
          [450, 214],
          [516, 116],
          [590, 264],
          [650, 346],
          [680, 198],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 3 === 0 ? 4 : 2.6}
            fill="rgba(6,182,212,0.72)"
          />
        ))}
        <path d="M482 318H528V220H548V164H568" stroke="rgba(249,115,22,0.18)" strokeWidth="1" />
        <circle cx="568" cy="164" r="3.4" fill="rgba(251,146,60,0.62)" />
      </svg>

      <div className="absolute left-0 top-[14%] hidden h-[22rem] w-[18rem] opacity-30 md:block">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(56,189,248,0.52) 1px, transparent 1.8px)',
            backgroundSize: '22px 22px',
            maskImage: 'linear-gradient(90deg, black, transparent 86%)',
            WebkitMaskImage: 'linear-gradient(90deg, black, transparent 86%)',
          }}
        />
      </div>

      <motion.div
        className="absolute bottom-[20%] left-[-18%] hidden h-px w-[48%] md:block"
        animate={{ x: ['0%', '125%'], opacity: [0, 0.42, 0] }}
        transition={{ duration: 13, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3.5 }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.76), transparent)',
          boxShadow: '0 0 28px rgba(6,182,212,0.26)',
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-80"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(2,7,12,0.44) 42%, #020407 100%)',
        }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/2 h-80 w-[70rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.09), rgba(37,99,235,0.04) 42%, transparent 72%)',
        }}
      />
      <svg
        className="absolute bottom-[-4rem] left-[-8%] hidden h-52 w-[64rem] opacity-20 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 150C150 96 240 188 380 132C530 72 630 64 760 112C866 152 930 126 1020 78"
          stroke="rgba(56,189,248,0.40)"
          strokeWidth="1"
        />
        <path
          d="M0 184C160 138 270 202 410 158C560 110 670 98 814 146C910 178 970 154 1020 128"
          stroke="rgba(37,99,235,0.26)"
          strokeWidth="1"
        />
      </svg>

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 62% 46% at 50% 36%, rgba(2,4,7,0.78) 0%, rgba(2,4,7,0.58) 42%, transparent 72%), radial-gradient(ellipse 85% 52% at 50% 50%, transparent 28%, rgba(0,0,0,0.34) 100%)',
        }}
      />
    </div>
  )
}

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
    <section className="relative isolate w-full overflow-hidden bg-[#030303] py-24 md:py-36">
      <DashboardStoryBackground />

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
