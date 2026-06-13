'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui'

type CopyBlockProps = {
  titulo: string
  instruccion: string
  texto: string
}

/**
 * Bloque copiable para los Gems externos: preview legible + botón copiar.
 * El texto lo arman los builders puros de lib/leados/copy-blocks.
 */
export function CopyBlock({ titulo, instruccion, texto }: CopyBlockProps) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
    } catch {
      // Fallback para contextos sin Clipboard API (http local, browsers viejos)
      const area = document.createElement('textarea')
      area.value = texto
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      document.body.removeChild(area)
    }
    setCopiado(true)
    window.setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-cyan-300">{titulo}</p>
          <p className="mt-0.5 text-xs text-zinc-500">{instruccion}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={copiar}
          icon={
            copiado ? (
              <Check size={14} strokeWidth={1.5} className="text-emerald-400" />
            ) : (
              <Copy size={14} strokeWidth={1.5} />
            )
          }
        >
          {copiado ? 'Copiado' : 'Copiar bloque'}
        </Button>
      </div>
      <pre className="mt-3 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/[0.06] bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
        {texto}
      </pre>
    </div>
  )
}
