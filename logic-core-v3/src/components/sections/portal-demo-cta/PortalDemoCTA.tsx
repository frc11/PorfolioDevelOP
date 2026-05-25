'use client'

import { motion } from 'motion/react'
import { MessageCircle, LogIn, CheckCircle2 } from 'lucide-react'

const WHATSAPP_PREFILL_TEXT =
  '¡Hola, develOP! Vi su landing y me interesa el portal develOP para mi negocio. ¿Podemos coordinar una llamada de 30 minutos?'

const TRUST_SIGNALS = ['Sin permanencia', 'Sin setup fee', 'Cancelás cuando quieras']

const EASE_PREMIUM = [0.22, 1, 0.36, 1] as const

function FinalCtaBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #020509 0%, #031018 44%, #020407 100%)',
        }}
      />
      <div
        className="absolute inset-x-0 top-0 h-72"
        style={{
          background:
            'linear-gradient(180deg, #020509 0%, rgba(2,7,12,0.70) 36%, transparent 100%)',
        }}
      />
      <div
        className="absolute left-1/2 top-[-13rem] h-80 w-[72rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(ellipse, rgba(6,182,212,0.07), rgba(139,92,246,0.04) 44%, transparent 74%)',
        }}
      />
      <svg
        className="absolute left-[-7%] top-[-5rem] hidden h-52 w-[64rem] opacity-12 lg:block"
        viewBox="0 0 1020 220"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M0 86C160 124 274 86 416 126C560 168 690 166 828 126C916 100 974 112 1020 136"
          stroke="rgba(56,189,248,0.28)"
          strokeWidth="1"
        />
        <path
          d="M0 126C174 158 308 122 452 154C594 186 728 180 868 152C944 136 990 148 1020 164"
          stroke="rgba(139,92,246,0.18)"
          strokeWidth="1"
        />
      </svg>

      <motion.div
        className="absolute left-1/2 top-1/2 h-[34rem] w-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        animate={{ opacity: [0.34, 0.56, 0.34], scale: [0.98, 1.04, 0.98] }}
        transition={{ duration: 8.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(6,182,212,0.14), rgba(139,92,246,0.09) 38%, transparent 72%)',
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
        className="absolute -right-[14%] top-[-26%] h-[30rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle, rgba(139,92,246,0.10), rgba(14,165,233,0.035) 44%, transparent 74%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(56,189,248,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.18) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse 78% 66% at 50% 50%, black 16%, transparent 86%)',
          WebkitMaskImage: 'radial-gradient(ellipse 78% 66% at 50% 50%, black 16%, transparent 86%)',
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
        animate={{ opacity: [0.18, 0.46, 0.18] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(56,189,248,0.52), rgba(139,92,246,0.38), transparent)',
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
    <section className="relative isolate w-full overflow-hidden bg-[#030303] px-6 py-32 md:py-44">
      <FinalCtaBackground />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_PREMIUM }}
          className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-6"
        >
          VAMOS A CONOCERNOS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.06 }}
          className="text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95] mb-8"
        >
          Tu negocio puede operar
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-violet-500">
            como uno premium hoy mismo.
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.12 }}
          className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto mb-12"
        >
          Te mostramos el portal en una llamada de 30 minutos sin compromiso. Si lo querés,
          arrancamos esa misma semana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_PREMIUM, delay: 0.18 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
        >
          <WhatsAppButton href={whatsappUrl} />

          <a
            href="/login"
            className="flex items-center gap-2.5 px-6 py-4 rounded-xl border border-white/[0.12] bg-white/[0.04] text-white font-semibold text-sm hover:bg-white/[0.08] hover:border-white/[0.20] transition-all duration-200 w-full sm:w-auto justify-center"
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            <LogIn size={16} strokeWidth={1.5} />
            Quiero ver el portal solo
          </a>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
        >
          {TRUST_SIGNALS.map((signal) => (
            <span key={signal} className="flex items-center gap-1.5 text-xs text-zinc-500">
              <CheckCircle2 size={13} strokeWidth={1.5} className="text-zinc-600" />
              {signal}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

function WhatsAppButton({ href }: { href: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative flex items-center gap-3 px-7 py-4 rounded-xl font-bold text-sm text-white overflow-hidden w-full sm:w-auto justify-center"
      style={{
        background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
        willChange: 'transform',
      }}
    >
      <motion.div
        className="absolute inset-0 rounded-xl pointer-events-none"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          filter: 'blur(12px)',
          transform: 'scale(1.1)',
        }}
      />
      <MessageCircle size={18} strokeWidth={1.5} className="relative z-10" />
      <span className="relative z-10">Coordinemos una llamada por WhatsApp</span>
    </motion.a>
  )
}
