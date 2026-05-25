'use client'

import { useState } from 'react'
import { ExternalLink, AlertCircle } from 'lucide-react'
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

export function InstallTab({ bot }: Props) {
  const [platform, setPlatform] = useState<InstallPlatformId>('html')
  const snippet = buildEmbedSnippet(bot.slug)

  return (
    <div className="space-y-6">
      {!bot.isActive && (
        <Card padding="md" className="border-amber-500/30 bg-amber-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-amber-300">El bot está pausado</p>
              <p className="text-xs text-amber-300/70 mt-1">
                Aunque el cliente instale el script, el chatbot no va a responder hasta que lo actives.
              </p>
            </div>
          </div>
        </Card>
      )}

      {bot.allowedDomains.length === 0 && (
        <Card padding="md" className="border-red-500/30 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-red-300">Sin dominios autorizados</p>
              <p className="text-xs text-red-300/70 mt-1">
                Configurá los dominios del cliente en Config → Dominios permitidos. Sin esto, el widget no va a cargar.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Paso 1 — Snippet */}
      <Card padding="lg">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 1</p>
        <h3 className="text-base font-medium text-zinc-200 mb-3">Snippet a copiar</h3>

        <SnippetCopyBlock snippet={snippet} />

        <p className="text-xs text-zinc-500 mt-3">
          Va antes del cierre de <code className="text-cyan-400">&lt;/body&gt;</code>
        </p>
      </Card>

      {/* Paso 2 — Instrucciones por plataforma */}
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

      {/* Paso 3 — Verificar */}
      <Card padding="lg">
        <p className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 mb-2">Paso 3</p>
        <h3 className="text-base font-medium text-zinc-200 mb-3">Verificar instalación</h3>
        <p className="text-sm text-zinc-400 mb-4">
          Una vez que el cliente pegó el snippet, podés abrir su sitio para confirmar que el widget carga.
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
          {bot.allowedDomains.length === 0 && (
            <p className="text-xs text-zinc-500 italic">Configurá dominios primero</p>
          )}
        </div>
      </Card>
    </div>
  )
}
