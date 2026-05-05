'use client'

import { motion } from 'framer-motion'

const EASE_PREMIUM = [0.25, 0.46, 0.45, 0.94] as const

export function PortalDemoHeader() {
  return (
    <div className="text-center max-w-3xl mx-auto px-6">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: EASE_PREMIUM }}
        className="text-xs font-semibold tracking-widest uppercase text-cyan-400 mb-4"
      >
        Así funciona tu negocio con develOP
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05] mb-6"
      >
        Un lunes a la mañana,
        <br />
        abrís tu panel develOP.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: EASE_PREMIUM, delay: 0.2 }}
        className="text-lg text-zinc-400 leading-relaxed"
      >
        No es un dashboard más. Es un copiloto que te dice qué pasó,
        qué necesita atención y qué decisión tomar. En segundos.
      </motion.p>
    </div>
  )
}
