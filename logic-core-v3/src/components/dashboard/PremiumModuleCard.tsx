'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock,
  Unlock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Bot,
  Calendar,
  Users,
  RefreshCw,
  Mail,
  MapPin,
  Star,
  Share2,
  ShoppingCart,
} from 'lucide-react'
import { requestUpsellAction } from '@/lib/actions/upsell'
import type { LucideIcon } from 'lucide-react'

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  Calendar,
  Users,
  RefreshCw,
  Mail,
  MapPin,
  Star,
  Share2,
  ShoppingCart,
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PremiumModuleCardProps {
  moduleKey: string
  name: string
  category: string
  description: string
  priceFrom: number
  billingLabel?: string
  roiBadge: string
  iconKey: string
  glowRgb: string
}

type ReqStatus = 'idle' | 'success' | 'error'

// ─── Component ────────────────────────────────────────────────────────────────

export function PremiumModuleCard({
  moduleKey,
  name,
  category,
  description,
  priceFrom,
  billingLabel = 'USD/mes',
  roiBadge,
  iconKey,
  glowRgb,
}: PremiumModuleCardProps) {
  const [reqStatus, setReqStatus] = useState<ReqStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [isPending, startTransition] = useTransition()

  const Icon = ICON_MAP[iconKey] ?? Bot
  const isSuccess = reqStatus === 'success'

  const handleUnlock = () => {
    if (isPending || isSuccess) return
    setErrorMsg(null)
    startTransition(async () => {
      const result = await requestUpsellAction(moduleKey, name)
      if (result.success) {
        setReqStatus('success')
        setShowToast(true)
        setTimeout(() => setShowToast(false), 4500)
      } else {
        setReqStatus('error')
        setErrorMsg(result.error ?? 'No se pudo enviar la solicitud.')
        setTimeout(() => {
          setReqStatus('idle')
          setErrorMsg(null)
        }, 3500)
      }
    })
  }

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <motion.div
        whileHover={
          !isSuccess
            ? {
                boxShadow: `0 0 36px rgba(${glowRgb}, 0.18), 0 0 0 1px rgba(${glowRgb}, 0.18)`,
              }
            : undefined
        }
        transition={{ duration: 0.25 }}
        className={[
          'relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-300',
          isSuccess
            ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
            : 'border-white/5 bg-white/[0.025] hover:border-white/[0.08]',
        ].join(' ')}
      >
        {/* Ambient glow blob */}
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[50px] opacity-20"
          style={{ background: `rgb(${glowRgb})` }}
        />

        {/* LOCKED badge */}
        <div className="absolute right-4 top-4 z-10">
          <span className="flex items-center gap-1 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-red-400">
            <Lock size={8} />
            Premium
          </span>
        </div>

        {/* Icon + title */}
        <div className="relative z-10 flex items-center gap-3 pr-24">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
            style={{
              background: `rgba(${glowRgb}, 0.1)`,
              border: `1px solid rgba(${glowRgb}, 0.2)`,
              color: `rgb(${glowRgb})`,
              boxShadow: `0 0 16px rgba(${glowRgb}, 0.15)`,
            }}
          >
            <Icon size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
              {category}
            </p>
            <h3 className="text-[13px] font-black leading-tight tracking-tight text-zinc-100">
              {name}
            </h3>
          </div>
        </div>

        {/* Description */}
        <p className="relative z-10 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">
          {description}
        </p>

        {/* Price + ROI */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">Desde</p>
            <p className="text-lg font-black leading-none text-white">
              ${priceFrom}{' '}
              <span className="text-xs font-medium text-zinc-500">{billingLabel}</span>
            </p>
          </div>
          <div
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider"
            style={{
              background: `rgba(${glowRgb}, 0.1)`,
              border: `1px solid rgba(${glowRgb}, 0.15)`,
              color: `rgb(${glowRgb})`,
            }}
          >
            {roiBadge}
          </div>
        </div>

        {/* Error */}
        {reqStatus === 'error' && errorMsg && (
          <p className="relative z-10 flex items-center gap-1.5 text-[10px] font-medium text-red-400">
            <AlertCircle size={11} />
            {errorMsg}
          </p>
        )}

        {/* CTA button */}
        <motion.button
          onClick={handleUnlock}
          disabled={isPending || isSuccess}
          whileTap={!isPending && !isSuccess ? { scale: 0.97 } : undefined}
          className={[
            'relative z-10 mt-auto flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300',
            isSuccess
              ? 'cursor-default border-emerald-500/25 bg-emerald-500/10 text-emerald-400'
              : 'border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:border-white/15 hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' ')}
        >
          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.span
                key="loading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2"
              >
                <Loader2 size={11} className="animate-spin" />
                Enviando solicitud...
              </motion.span>
            ) : isSuccess ? (
              <motion.span
                key="success"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2"
              >
                <CheckCircle2 size={11} />
                Solicitud enviada
              </motion.span>
            ) : (
              <motion.span
                key="idle"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="flex items-center gap-2"
              >
                <Unlock size={11} />
                Desbloquear Módulo
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      {/* ── Floating Toast ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className="fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-cyan-500/20 bg-[#0d0f13] px-5 py-3.5 shadow-[0_16px_60px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
              <CheckCircle2 size={15} className="text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-white">{'\u00a1Solicitud enviada!'}</p>
              <p className="text-[11px] text-zinc-400">{'Te contactamos en < 24hs \ud83d\ude80'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
