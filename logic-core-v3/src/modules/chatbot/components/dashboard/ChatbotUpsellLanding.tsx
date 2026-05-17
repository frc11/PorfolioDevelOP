'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import {
  Bot,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  Shield,
} from 'lucide-react'

const WHATSAPP_URL = 'https://wa.me/5493815555555?text=Hola%2C+quiero+saber+m%C3%A1s+sobre+el+chatbot'

export function ChatbotUpsellLanding() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-zinc-900 to-zinc-950 p-10"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="rounded-2xl bg-cyan-400/15 p-2.5">
              <Bot className="h-6 w-6 text-cyan-300" strokeWidth={1.5} />
            </div>
            <span className="text-[10px] uppercase tracking-[0.24em] text-cyan-400">
              Servicio develOP
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100 max-w-2xl mb-4 leading-tight">
            Un empleado virtual que atiende tu negocio 24/7
          </h1>

          <p className="text-base text-zinc-400 max-w-2xl mb-8 leading-relaxed">
            Mientras dormís, tu chatbot atiende consultas, captura leads, agenda turnos
            y deriva los casos importantes a vos por WhatsApp.
            <span className="text-zinc-200"> Sin perder ninguna oportunidad.</span>
          </p>

          <div className="flex flex-wrap gap-3">
            <Link
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-6 py-3 text-sm font-medium text-zinc-950 hover:bg-cyan-300 transition-colors"
            >
              <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              Quiero activarlo
            </Link>
            <Link
              href="https://develop.com.ar"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-white/[0.08] transition-colors"
            >
              Ver demo en vivo
            </Link>
          </div>
        </div>

        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      </motion.section>

      {/* Beneficios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <BenefitCard
          icon={MessageSquare}
          title="Responde por vos"
          description="Atiende consultas básicas mientras vos trabajás. Tu cliente nunca queda sin respuesta."
          delay={0.1}
        />
        <BenefitCard
          icon={Users}
          title="Captura leads automático"
          description="Si alguien quiere comprar o cotizar, el bot le pide los datos. Aparece en tu panel al instante."
          delay={0.15}
        />
        <BenefitCard
          icon={Clock}
          title="Trabajá menos, vendé más"
          description="Te ahorra horas respondiendo lo mismo 100 veces. Te dedicás a lo que importa."
          delay={0.2}
        />
        <BenefitCard
          icon={TrendingUp}
          title="Sin perder oportunidades"
          description="Los leads que llegan a las 11 de la noche, los captura el bot. Vos los ves a la mañana."
          delay={0.25}
        />
        <BenefitCard
          icon={Bot}
          title="Habla como vos"
          description="No es un bot robótico. Lo configuramos con tu información, tu tono y tu estilo."
          delay={0.3}
        />
        <BenefitCard
          icon={Sparkles}
          title="Insights semanales"
          description="Te llega un email todos los lunes con qué pasó y qué hacer en tu negocio."
          delay={0.35}
        />
      </div>

      {/* Trust section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-white/10 bg-white/[0.02] p-8"
      >
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-emerald-400/10 p-3">
            <Shield className="h-5 w-5 text-emerald-300" strokeWidth={1.5} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Hecho a medida por develOP
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              No es un bot genérico de catálogo. Lo armamos específicamente para tu rubro,
              con tu información, tu tono, y lo integramos directo a tu sitio. Soporte
              por WhatsApp con humanos argentinos.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Pricing teaser */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/[0.06] via-zinc-900 to-zinc-950 p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-emerald-400 mb-2">
              Desde
            </p>
            <p className="text-4xl font-semibold text-zinc-100">
              $150 USD
              <span className="text-base font-normal text-zinc-500"> /mes</span>
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              Incluye 1.000 conversaciones · reportes semanales · soporte directo
            </p>
          </div>
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-2xl bg-emerald-400/20 border border-emerald-400/30 px-6 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-400/30 transition-colors text-center whitespace-nowrap"
          >
            Hablar con un asesor
          </Link>
        </div>
      </motion.section>
    </div>
  )
}

function BenefitCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: typeof Bot
  title: string
  description: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 hover:bg-white/[0.04] transition-colors"
    >
      <Icon className="h-5 w-5 text-cyan-400 mb-3" strokeWidth={1.5} />
      <h3 className="text-base font-medium text-zinc-100 mb-1.5">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{description}</p>
    </motion.div>
  )
}
