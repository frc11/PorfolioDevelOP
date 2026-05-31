'use client'

import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { ExternalLink, AlertCircle } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/motion-variants'
import { Card } from '@/components/ui/Card'
import {
  INSTALL_PLATFORMS,
  buildEmbedSnippet,
  SnippetCopyBlock,
  PlatformInstructions,
  type InstallPlatformId,
} from '@/modules/chatbot/components/installation'

interface Props {
  bot: {
    slug: string
    botName: string
    isActive: boolean
    allowedDomains: string[]
  }
}

export function ClientInstallView({ bot }: Props) {
  const [platform, setPlatform] = useState<InstallPlatformId>('html')
  const snippet = buildEmbedSnippet(bot.slug)
  const reduce = useReducedMotion()

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="visible"
    >
      {!bot.isActive && (
        <motion.div variants={staggerItem}>
          <Card padding="md" className="border-amber-500/30 bg-amber-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-amber-300">El bot está pausado</p>
                <p className="text-xs text-amber-300/70 mt-1">
                  El chatbot no va a responder hasta que tu equipo lo active.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {bot.allowedDomains.length === 0 && (
        <motion.div variants={staggerItem}>
          <Card padding="md" className="border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-red-300">Falta configurar dominios</p>
                <p className="text-xs text-red-300/70 mt-1">
                  Cargá los dominios de tu sitio en Configuración → Dominios permitidos. Sin esto, el widget no va a cargar en tu web aunque pegues el snippet.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Paso 1 — Snippet */}
      <motion.div variants={staggerItem}>
        <Card padding="lg">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 1</p>
          <h3 className="text-base font-medium text-zinc-200 mb-1">Snippet a copiar</h3>
          <p className="text-sm text-zinc-400 mb-4">
            Pegá este código en tu sitio y el chatbot va a aparecer automáticamente.
          </p>

          <SnippetCopyBlock snippet={snippet} />

          <p className="text-xs text-zinc-500 mt-3">
            Va antes del cierre de <code className="text-cyan-400">&lt;/body&gt;</code> en tu sitio
          </p>
        </Card>
      </motion.div>

      {/* Paso 2 — Instrucciones por plataforma */}
      <motion.div variants={staggerItem}>
        <Card padding="lg">
          <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 2</p>
          <h3 className="text-base font-medium text-zinc-200 mb-4">Instrucciones por plataforma</h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {INSTALL_PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatform(p.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                  platform === p.id
                    ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300'
                    : 'border-white/10 bg-white/[0.02] text-zinc-300 hover:bg-white/[0.04]'
                }`}
              >
                <span>{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <PlatformInstructions platform={platform} />
          </div>
        </Card>
      </motion.div>

      {/* Paso 3 — Verificar */}
      {bot.allowedDomains.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card padding="lg">
            <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 3</p>
            <h3 className="text-base font-medium text-zinc-200 mb-3">Verificar instalación</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Una vez instalado, abrí tu sitio y buscá la burbuja de chat flotante en la esquina.
            </p>
            <div className="flex flex-wrap gap-2">
              {bot.allowedDomains.map((domain) => (
                <a
                  key={domain}
                  href={`https://${domain.replace(/^https?:\/\//, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-sm text-zinc-300 hover:bg-white/[0.04]"
                >
                  <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
                  {domain}
                </a>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
