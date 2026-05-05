'use client'

import { useState, useTransition } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  Bot,
  Calendar,
  CheckCircle2,
  DollarSign,
  Loader2,
  Lock,
  Mail,
  MessageCircle,
  Receipt,
  ShoppingBag,
  Star,
  TrendingUp,
  Unlock,
  Users,
} from 'lucide-react'
import type { PremiumModuleStatus, PremiumModuleTier } from '@prisma/client'
import type { LucideIcon } from 'lucide-react'
import { requestUpsellAction } from '@/lib/actions/upsell'
import { useTransitionContext } from '@/context/TransitionContext'

const ICON_MAP: Record<string, LucideIcon> = {
  Bot,
  Calendar,
  DollarSign,
  Mail,
  MessageCircle,
  Receipt,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
}

const TIER_LABELS: Record<PremiumModuleTier, string> = {
  TIER_1_OPERATION: 'Operación',
  TIER_2_GROWTH: 'Crecimiento',
  TIER_3_VERTICAL: 'Vertical',
}

export interface PremiumModuleCardProps {
  slug: string
  name: string
  shortDescription: string
  tier: PremiumModuleTier
  priceMonthlyUsd: number
  iconName: string
  accentColor: string
  status: PremiumModuleStatus
}

type ReqStatus = 'idle' | 'success' | 'error'

export function PremiumModuleCard({
  slug,
  name,
  shortDescription,
  tier,
  priceMonthlyUsd,
  iconName,
  accentColor,
  status,
}: PremiumModuleCardProps) {
  const [reqStatus, setReqStatus] = useState<ReqStatus>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { triggerTransition } = useTransitionContext()

  const Icon = ICON_MAP[iconName] ?? Bot
  const isComingSoon = status === 'COMING_SOON'
  const isSuccess = reqStatus === 'success'

  const handleUnlock = () => {
    if (isPending || isSuccess || isComingSoon) return

    setErrorMsg(null)
    startTransition(async () => {
      const result = await requestUpsellAction(slug, name)

      if (result.success) {
        setReqStatus('success')
        const params = new URLSearchParams({ context: 'modulo', moduleName: name })
        triggerTransition(`/dashboard/messages?${params.toString()}`)
        return
      }

      setReqStatus('error')
      setErrorMsg(result.error ?? 'No se pudo enviar la solicitud.')
      setTimeout(() => {
        setReqStatus('idle')
        setErrorMsg(null)
      }, 3500)
    })
  }

  return (
    <>
      <motion.div
        whileHover={
          !isComingSoon && !isSuccess
            ? {
                boxShadow: `0 0 36px ${accentColor}2E, 0 0 0 1px ${accentColor}2E`,
              }
            : undefined
        }
        transition={{ duration: 0.25 }}
        className={[
          'relative flex h-full min-h-[260px] flex-col gap-4 overflow-hidden rounded-2xl border p-5 backdrop-blur-xl transition-colors duration-300',
          isSuccess
            ? 'border-emerald-500/25 bg-emerald-500/[0.03]'
            : isComingSoon
              ? 'border-white/[0.04] bg-white/[0.015] opacity-90'
              : 'border-white/5 bg-white/[0.025] hover:border-white/[0.08]',
        ].join(' ')}
      >
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-[50px] opacity-20"
          style={{ background: accentColor }}
        />

        <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl"
              style={{
                background: `${accentColor}1A`,
                border: `1px solid ${accentColor}33`,
                boxShadow: `0 0 16px ${accentColor}26`,
                color: accentColor,
              }}
            >
              <Icon size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-600">
                {TIER_LABELS[tier]}
              </p>
              <h3 className="text-[13px] font-black leading-tight tracking-tight text-zinc-100">
                {name}
              </h3>
            </div>
          </div>

          <span
            className={[
              'flex w-fit flex-shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[9px] font-black uppercase tracking-widest',
              isComingSoon
                ? 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                : 'border-red-500/25 bg-red-500/10 text-red-400',
            ].join(' ')}
          >
            {isComingSoon ? null : <Lock size={8} />}
            {isComingSoon ? 'Próximamente Q3 2026' : 'Premium'}
          </span>
        </div>

        <p className="relative z-10 text-[11px] leading-relaxed text-zinc-500">
          {shortDescription}
        </p>

        {isComingSoon ? (
          <div className="relative z-10 mt-auto rounded-xl border border-amber-500/15 bg-amber-500/[0.05] px-3.5 py-3 text-[11px] font-semibold text-amber-200">
            Estamos preparando este módulo para el catálogo comercial.
          </div>
        ) : (
          <>
            <div className="relative z-10 mt-auto flex items-end justify-between gap-3">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-700">
                  Desde
                </p>
                <p className="text-lg font-black leading-none text-white">
                  ${priceMonthlyUsd}{' '}
                  <span className="text-xs font-medium text-zinc-500">USD/mes</span>
                </p>
              </div>
              <div
                className="rounded-lg px-2.5 py-1.5 text-[9px] font-black uppercase tracking-wider"
                style={{
                  background: `${accentColor}1A`,
                  border: `1px solid ${accentColor}26`,
                  color: accentColor,
                }}
              >
                Disponible
              </div>
            </div>

            {reqStatus === 'error' && errorMsg && (
              <p className="relative z-10 flex items-center gap-1.5 text-[10px] font-medium text-red-400">
                <AlertCircle size={11} />
                {errorMsg}
              </p>
            )}

            <motion.button
              onClick={handleUnlock}
              disabled={isPending || isSuccess}
              whileTap={!isPending && !isSuccess ? { scale: 0.97 } : undefined}
              className={[
                'relative z-10 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border py-2.5 text-[10px] font-black uppercase tracking-widest transition-all duration-300',
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
          </>
        )}
      </motion.div>

    </>
  )
}
