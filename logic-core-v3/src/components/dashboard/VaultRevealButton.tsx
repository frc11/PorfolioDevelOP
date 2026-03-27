'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Copy, Check, Timer, ShieldAlert } from 'lucide-react'

const HIDE_AFTER_SECONDS = 30

export function VaultRevealButton({ url }: { url: string }) {
  const [revealed, setRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [remaining, setRemaining] = useState(HIDE_AFTER_SECONDS)

  const hide = useCallback(() => {
    setRevealed(false)
    setRemaining(HIDE_AFTER_SECONDS)
  }, [])

  useEffect(() => {
    if (!revealed) return
    setRemaining(HIDE_AFTER_SECONDS)
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          hide()
          return HIDE_AFTER_SECONDS
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [revealed, hide])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: do nothing
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-red-400/80">
          <ShieldAlert size={12} />
          Información sensible — Solo visible para vos
        </div>
        {revealed && (
          <span className="flex items-center gap-1 text-[10px] font-black tabular-nums text-red-400/60">
            <Timer size={10} />
            {remaining}s
          </span>
        )}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-3"
          >
            <p
              className="flex-1 min-w-0 text-sm font-mono tracking-[0.3em] text-red-400/30 select-none truncate"
              aria-hidden
            >
              {'•'.repeat(Math.min(url.length, 28))}
            </p>
            <button
              onClick={() => setRevealed(true)}
              className="flex flex-shrink-0 items-center gap-1.5 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
            >
              <Eye size={12} />
              Revelar
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="revealed"
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex items-center gap-2"
          >
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 min-w-0 truncate text-sm font-mono text-red-300 underline underline-offset-2 hover:text-red-200 transition-colors"
            >
              {url}
            </a>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={handleCopy}
                title="Copiar"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/5 bg-white/5 text-zinc-500 transition-all hover:text-zinc-200 active:scale-95"
              >
                {copied ? (
                  <Check size={12} className="text-emerald-400" />
                ) : (
                  <Copy size={12} />
                )}
              </button>
              <button
                onClick={hide}
                title="Ocultar"
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 active:scale-95"
              >
                <EyeOff size={12} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning */}
      <p className="text-[9px] italic text-red-400/40">
        Nunca compartas estas credenciales con terceros.
      </p>
    </div>
  )
}
