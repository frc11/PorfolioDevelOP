'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { PREMIUM_FEATURE_OPTIONS, type PremiumFeatureKey } from '@/lib/premium-features'
import { toggleClientFeatureAction } from '@/lib/actions/clients'

interface ClientModulesPanelProps {
  clientId: string
  initialFeatures: PremiumFeatureKey[]
}

export function ClientModulesPanel({
  clientId,
  initialFeatures,
}: ClientModulesPanelProps) {
  const [enabledFeatures, setEnabledFeatures] = useState<PremiumFeatureKey[]>(initialFeatures)
  const [isPending, startTransition] = useTransition()

  const isEnabled = (featureKey: PremiumFeatureKey) => enabledFeatures.includes(featureKey)

  const onToggle = (featureKey: PremiumFeatureKey, nextEnabled: boolean) => {
    const previous = enabledFeatures
    const optimistic = nextEnabled
      ? Array.from(new Set([...enabledFeatures, featureKey]))
      : enabledFeatures.filter((feature) => feature !== featureKey)

    setEnabledFeatures(optimistic)

    startTransition(async () => {
      const result = await toggleClientFeatureAction({
        clientId,
        featureKey,
        enabled: nextEnabled,
      })

      if (!result.success) {
        setEnabledFeatures(previous)
        toast.error(result.error ?? 'No se pudo actualizar el módulo.')
        return
      }

      setEnabledFeatures(result.features as PremiumFeatureKey[])
      toast.success(result.message)
    })
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-cyan-500/70">
          Módulos premium
        </p>
        <h2 className="text-xl font-semibold text-zinc-100">God Mode de activaciones</h2>
        <p className="text-sm text-zinc-500">
          Activá o desactivá capacidades del portal sin recargar la página.
        </p>
      </div>

      <div className="mt-6 grid gap-3">
        {PREMIUM_FEATURE_OPTIONS.map((feature) => {
          const enabled = isEnabled(feature.key)

          return (
            <motion.button
              key={feature.key}
              type="button"
              whileHover={{ y: -1 }}
              onClick={() => onToggle(feature.key, !enabled)}
              disabled={isPending}
              className="flex w-full items-center justify-between gap-4 rounded-2xl border px-4 py-4 text-left transition-colors"
              style={{
                borderColor: enabled ? 'rgba(6,182,212,0.24)' : 'rgba(255,255,255,0.08)',
                background: enabled ? 'rgba(6,182,212,0.08)' : 'rgba(255,255,255,0.025)',
              }}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-zinc-100">{feature.label}</p>
                  <span className="rounded-full border border-white/8 bg-white/3 px-2 py-0.5 text-[11px] text-zinc-400">
                    {feature.priceLabel}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-500">{feature.description}</p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                  {feature.key}
                </p>
              </div>

              <span
                className="relative inline-flex h-7 w-13 flex-shrink-0 items-center rounded-full border transition-colors"
                style={{
                  borderColor: enabled ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)',
                  background: enabled ? 'rgba(6,182,212,0.22)' : 'rgba(255,255,255,0.06)',
                }}
                aria-hidden="true"
              >
                <span
                  className="absolute h-5 w-5 rounded-full bg-white shadow-[0_6px_20px_rgba(0,0,0,0.3)] transition-transform"
                  style={{
                    transform: enabled ? 'translateX(1.75rem)' : 'translateX(0.25rem)',
                    background: enabled ? '#22d3ee' : '#d4d4d8',
                  }}
                />
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
