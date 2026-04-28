'use client'

import { regenerateBriefAction } from '@/app/(protected)/dashboard/_actions/regenerate-brief'
import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Lock, RefreshCw, Sparkles } from 'lucide-react'
import { useState, useTransition } from 'react'

interface AIExecutiveBriefV2Props {
  initialText: string
  initialGeneratedAt: Date
  initialIsFresh: boolean
  initialRegenerationsLeft: number
  initialCanRegenerate: boolean
}

export function AIExecutiveBriefV2({
  initialText,
  initialGeneratedAt,
  initialIsFresh,
  initialRegenerationsLeft,
  initialCanRegenerate,
}: AIExecutiveBriefV2Props) {
  const [text, setText] = useState(initialText)
  const [generatedAt, setGeneratedAt] = useState(initialGeneratedAt)
  const [isFresh, setIsFresh] = useState(initialIsFresh)
  const [regenerationsLeft, setRegenerationsLeft] = useState(initialRegenerationsLeft)
  const [canRegenerate, setCanRegenerate] = useState(initialCanRegenerate)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleRegenerate = () => {
    setError(null)
    startTransition(async () => {
      const result = await regenerateBriefAction()
      if (!result.ok) {
        setError(result.error)
        return
      }

      setText(result.brief.text)
      setGeneratedAt(new Date(result.brief.generatedAt))
      setIsFresh(result.brief.isFresh)
      setRegenerationsLeft(result.brief.regenerationsLeft)
      setCanRegenerate(result.brief.canRegenerate)
    })
  }

  return (
    <Card variant="highlighted" padding="lg" glow>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <Badge tone="violet" size="sm" icon={<Sparkles size={10} />}>
            Resumen Ejecutivo - IA
          </Badge>

          <button
            type="button"
            onClick={handleRegenerate}
            disabled={!canRegenerate || isPending}
            className={cn(
              'flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition',
              canRegenerate && !isPending
                ? 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
                : 'cursor-not-allowed border-zinc-500/10 bg-zinc-500/5 text-zinc-600',
            )}
            title={
              canRegenerate
                ? `${regenerationsLeft} regeneraciones disponibles`
                : 'Llegaste al limite semanal'
            }
          >
            {isPending ? (
              <>
                <RefreshCw size={11} className="animate-spin" />
                Generando...
              </>
            ) : canRegenerate ? (
              <>
                <RefreshCw size={11} />
                Regenerar
              </>
            ) : (
              <>
                <Lock size={11} />
                Sin regeneraciones
              </>
            )}
          </button>
        </div>

        <motion.div
          key={text}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-base font-medium leading-relaxed text-zinc-100 sm:text-lg"
        >
          {text}
        </motion.div>

        <div className="flex flex-col gap-2 border-t border-white/[0.04] pt-2 text-[10px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <span>
            {isFresh ? 'Generado' : 'Cache semanal'} {formatRelativeDate(generatedAt)}
          </span>
          <span>
            {canRegenerate
              ? `${regenerationsLeft} regeneraciones disponibles esta semana`
              : 'Proxima actualizacion automatica: lunes'}
          </span>
        </div>

        {error && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-300">
            {error}
          </div>
        )}
      </div>
    </Card>
  )
}

function formatRelativeDate(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'recien'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24) return `hace ${hours}h`
  if (days < 7) return `hace ${days}d`
  return new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
