'use client'

import { motion } from 'framer-motion'
import { MessageCircle, LogIn, CheckCircle2 } from 'lucide-react'

const WHATSAPP_PREFILL_TEXT =
  '¡Hola, develOP! Vi su landing y me interesa el portal develOP para mi negocio. ¿Podemos coordinar una llamada de 30 minutos?'

const TRUST_SIGNALS = ['Sin permanencia', 'Sin setup fee', 'Cancelás cuando quieras']

export function PortalDemoCTA() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(WHATSAPP_PREFILL_TEXT)}`
    : 'mailto:hola@develop.com.ar'

  return (
    <section className="relative w-full py-32 md:py-44 px-6 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(6,182,212,0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 50% at 50% 100%, rgba(139,92,246,0.07) 0%, transparent 60%), #09090b',
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-6"
        >
          VAMOS A CONOCERNOS
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.06 }}
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
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.12 }}
          className="text-lg text-zinc-400 leading-relaxed max-w-xl mx-auto mb-12"
        >
          Te mostramos el portal en una llamada de 30 minutos sin compromiso. Si lo querés,
          arrancamos esa misma semana.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.18 }}
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
