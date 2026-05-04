'use client'

import { motion } from 'framer-motion'
import { Eye, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface PreviewBannerProps {
  context?: 'analytics' | 'seo' | 'general'
}

export function PreviewBanner({ context = 'general' }: PreviewBannerProps) {
  const messages = {
    analytics:
      'Esto es una vista previa de cómo se verá tu panel cuando esté conectado a Google Analytics. develOP se encarga de la activación en tu primera semana.',
    seo:
      'Esto es una vista previa de cómo se verá tu panel cuando esté conectado a Google Search Console. develOP se encarga de la activación.',
    general:
      'Esto es una vista previa con datos de ejemplo. Tu panel real se llena automáticamente cuando develOP termina la conexión inicial.',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/[0.06] to-transparent p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/15 border border-cyan-500/20 text-cyan-400">
          <Eye size={18} strokeWidth={1.75} />
        </div>

        <div className="flex-1">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400 mb-1">
            Vista previa · Tu panel se está armando
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {messages[context]}
          </p>
        </div>

        <Link
          href="/dashboard/messages?context=activacion"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition min-h-[40px]"
        >
          <MessageCircle size={13} />
          Hablar con mi equipo
        </Link>
      </div>

      <Link
        href="/dashboard/messages?context=activacion"
        className="sm:hidden mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300"
      >
        <MessageCircle size={13} />
        Hablar con mi equipo →
      </Link>
    </motion.div>
  )
}
