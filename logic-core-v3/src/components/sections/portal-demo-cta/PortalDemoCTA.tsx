'use client'

import { motion } from 'motion/react'
import { MessageCircle, LogIn, CheckCircle2 } from 'lucide-react'

const WHATSAPP_PREFILL_TEXT =
  '¡Hola develOP! Vi la web y quiero coordinar una llamada. Mi negocio es'

const TRUST_SIGNALS = ['Sin permanencia', 'Sin setup fee', 'Cancelás cuando quieras']

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

const ctaContainer = {
  hidden: {
    opacity: 0,
    scale: 0.985,
    filter: 'blur(10px)',
    borderColor: 'rgba(255,255,255,0.02)',
    boxShadow: '0 0 0 rgba(0,0,0,0)',
  },
  visible: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    borderColor: 'rgba(255,255,255,0.10)',
    boxShadow: '0 34px 130px rgba(0,0,0,0.54), inset 0 1px 0 rgba(255,255,255,0.06)',
    transition: {
      duration: 0.48,
      ease: EASE_PREMIUM,
      staggerChildren: 0.14,
      delayChildren: 0.22,
    },
  },
}

const ctaItem = {
  hidden: { opacity: 0, y: 14, scale: 0.985, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.62, ease: EASE_PREMIUM },
  },
}

const ctaHeadline = {
  hidden: { opacity: 0, y: 10, scale: 0.975, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.72, ease: EASE_PREMIUM },
  },
}

function FinalCtaBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #020509 0%, #020b12 34%, #030914 62%, #020305 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-72"
        style={{
          background:
            'linear-gradient(180deg, #020509 0%, rgba(2,7,12,0.76) 42%, transparent 100%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[-13rem] h-80 w-[72rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.075), rgba(37,99,235,0.045) 44%, transparent 74%)',
        }}
      />
      <svg
        className="absolute left-[-8%] top-[-5rem] hidden h-52 w-[64rem] opacity-16 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 86C160 124 274 86 416 126C560 168 690 166 828 126C916 100 974 112 1020 136"
          stroke="rgba(56,189,248,0.30)"
          strokeWidth="1"
        />
        <path
          d="M0 126C174 158 308 122 452 154C594 186 728 180 868 152C944 136 990 148 1020 164"
          stroke="rgba(37,99,235,0.22)"
          strokeWidth="1"
        />
      </svg>

      <motion.div
        className="absolute left-1/2 top-1/2 h-[34rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        animate={{ opacity: [0.22, 0.42, 0.22], scale: [0.98, 1.035, 0.98] }}
        transition={{ duration: 9.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.13), rgba(37,99,235,0.07) 38%, transparent 72%)',
        }}
      />
      <div
        className="absolute -left-[12%] bottom-[-28%] h-[32rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(37,99,235,0.10), rgba(6,182,212,0.035) 44%, transparent 74%)',
        }}
      />
      <div
        className="absolute inset-x-0 bottom-[-1px] h-[clamp(11rem,20vw,20rem)]"
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(2,7,12,0.44) 42%, #020407 100%)',
        }}
      />
      <div
        className="absolute bottom-[-12rem] left-1/2 h-80 w-[70rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.085), rgba(37,99,235,0.04) 42%, transparent 72%)',
        }}
      />
      <div
        className="absolute -right-[14%] top-[-26%] h-[30rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(14,165,233,0.09), rgba(37,99,235,0.04) 44%, transparent 74%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)',
          backgroundSize: '68px 68px',
          maskImage: 'radial-gradient(ellipse 78% 66% at 50% 48%, black 14%, transparent 86%)',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 66% at 50% 48%, black 14%, transparent 86%)',
        }}
      />

      <svg
        className="absolute bottom-[-8%] left-[-8%] hidden h-[27rem] w-[43rem] opacity-34 md:block"
        viewBox="0 0 700 420"
        fill="none"
        preserveAspectRatio="xMinYMax slice"
      >
        <path d="M0 326H116L150 292H260L296 256H412" stroke="rgba(56,189,248,0.18)" strokeWidth="1" />
        <path d="M0 374H166L202 338H318L354 302H512" stroke="rgba(37,99,235,0.15)" strokeWidth="1" />
        <path d="M110 420V354H174V292" stroke="rgba(6,182,212,0.14)" strokeWidth="1" />
        {[
          [116, 326],
          [150, 292],
          [174, 292],
          [202, 338],
          [260, 292],
          [296, 256],
          [318, 338],
          [354, 302],
          [412, 256],
          [512, 302],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 4 === 0 ? 3 : 1.8}
            fill="rgba(56,189,248,0.44)"
          />
        ))}
      </svg>

      <svg
        className="absolute right-[-7%] top-[-5%] hidden h-[24rem] w-[38rem] opacity-30 lg:block"
        viewBox="0 0 620 360"
        fill="none"
        preserveAspectRatio="xMaxYMin slice"
      >
        <path d="M620 72H506L474 104H374L342 136H236" stroke="rgba(56,189,248,0.18)" strokeWidth="1" />
        <path d="M620 126H542L510 158H418L386 190H282" stroke="rgba(139,92,246,0.16)" strokeWidth="1" />
        <path d="M560 0V88H520V158" stroke="rgba(56,189,248,0.13)" strokeWidth="1" />
        {[
          [236, 136],
          [282, 190],
          [342, 136],
          [374, 104],
          [386, 190],
          [418, 158],
          [474, 104],
          [510, 158],
          [520, 158],
          [542, 126],
          [560, 88],
        ].map(([cx, cy], index) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={index % 5 === 0 ? 2.8 : 1.7}
            fill="rgba(125,211,252,0.40)"
          />
        ))}
      </svg>

      <motion.div
        className="absolute inset-x-[16%] top-0 h-px"
        animate={{ opacity: [0.14, 0.38, 0.14] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(56,189,248,0.50), rgba(37,99,235,0.30), transparent)',
          boxShadow: '0 0 24px rgba(56,189,248,0.18)',
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 58% 44% at 50% 44%, rgba(2,4,7,0.52) 0%, rgba(2,4,7,0.30) 46%, transparent 72%), radial-gradient(ellipse 86% 62% at 50% 50%, transparent 30%, rgba(0,0,0,0.46) 100%)',
        }}
      />
    </div>
  )
}

export function PortalDemoCTA() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(WHATSAPP_PREFILL_TEXT)}`
    : 'mailto:hola@develop.com.ar'

  return (
    <section className="relative isolate w-full overflow-hidden bg-[#030303] px-6 py-28 md:py-40">
      <FinalCtaBackground />

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.28 }}
        variants={ctaContainer}
        className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#03070c]/78 px-6 py-12 text-center shadow-[0_30px_120px_rgba(0,0,0,0.48)] backdrop-blur-xl sm:px-10 md:px-14 md:py-16 lg:px-20"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 58% 52% at 50% 0%, rgba(125,211,252,0.15), transparent 48%), radial-gradient(ellipse 48% 38% at 50% 62%, rgba(37,99,235,0.08), transparent 70%), linear-gradient(180deg, rgba(255,255,255,0.065), transparent 28%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-0 h-px md:inset-x-16"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(125,211,252,0.72), rgba(59,130,246,0.36), transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-10 left-0 w-px opacity-60 md:inset-y-12"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(125,211,252,0.38), transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-10 right-0 w-px opacity-45 md:inset-y-12"
          style={{
            background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.28), transparent)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-8 top-8 hidden h-16 w-16 border-l border-t border-cyan-100/10 md:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-8 right-8 hidden h-16 w-16 border-b border-r border-cyan-100/10 md:block"
        />

        <div className="relative z-10">
        <motion.p
          variants={ctaItem}
          className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-6"
        >
          VAMOS A CONOCERNOS
        </motion.p>

        <motion.h2
          variants={ctaHeadline}
          className="mx-auto mb-8 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Tu negocio puede operar
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-sky-300 to-blue-400">
            como uno premium hoy mismo.
          </span>
        </motion.h2>

        <motion.p
          variants={ctaItem}
          className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto mb-12"
        >
          Te mostramos el portal en una llamada de 30 minutos sin compromiso. Si lo querés,
          arrancamos esa misma semana.
        </motion.p>

        <motion.div
          variants={ctaItem}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <WhatsAppButton href={whatsappUrl} />

          <a
            href="/login"
            className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl border border-white/[0.13] bg-white/[0.035] px-6 py-4 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_16px_50px_rgba(0,0,0,0.28)] transition-all duration-500 ease-out hover:-translate-y-0.5 hover:border-white/[0.28] hover:bg-white/[0.075] hover:shadow-[0_18px_58px_rgba(125,211,252,0.09),0_22px_82px_rgba(0,0,0,0.42)] sm:w-auto"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100"
              style={{
                background:
                  'linear-gradient(110deg, transparent 0%, rgba(255,255,255,0.08) 42%, transparent 64%)',
              }}
            />
            <LogIn size={16} strokeWidth={1.5} className="relative z-10 text-zinc-200" />
            <span className="relative z-10">Quiero ver el portal solo</span>
          </a>
        </motion.div>

        <motion.div
          variants={ctaItem}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {TRUST_SIGNALS.map((signal) => (
            <span key={signal} className="flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1.5 text-xs text-zinc-500 transition-colors duration-300 hover:text-zinc-300">
              <CheckCircle2 size={13} strokeWidth={1.5} className="text-cyan-200/35" />
              {signal}
            </span>
          ))}
        </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

function WhatsAppButton({ href }: { href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.34, ease: EASE_PREMIUM }}
      className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-cyan-200/24 bg-cyan-100/[0.07] px-7 py-4 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.10),0_18px_58px_rgba(6,182,212,0.11),0_22px_82px_rgba(0,0,0,0.34)] transition-colors duration-500 ease-out hover:border-cyan-100/44 hover:bg-cyan-100/[0.105] sm:w-auto"
      style={{
        willChange: 'transform',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-70 transition-opacity duration-700 ease-out group-hover:opacity-100"
        animate={{ opacity: [0.42, 0.72, 0.42] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle at 20% 0%, rgba(125,211,252,0.24), transparent 42%), radial-gradient(circle at 78% 120%, rgba(59,130,246,0.16), transparent 48%), linear-gradient(135deg, rgba(6,182,212,0.12), rgba(37,99,235,0.075))',
        }}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/70 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100"
      />
      <MessageCircle size={18} strokeWidth={1.5} className="relative z-10" />
      <span className="relative z-10">Coordinemos una llamada por WhatsApp</span>
    </motion.a>
  )
}
