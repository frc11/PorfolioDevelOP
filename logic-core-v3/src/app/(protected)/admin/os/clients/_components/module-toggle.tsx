'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { toggleModulePremium } from '../_actions/client.actions'

type ModuleToggleProps = {
  organizationId: string
  moduleKey: string
  label: string
  description: string
  enabled: boolean
  statusLabel: string
  startDateLabel?: string | null
}

export function ModuleToggle({
  organizationId,
  moduleKey,
  label,
  description,
  enabled,
  statusLabel,
  startDateLabel,
}: ModuleToggleProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isEnabled, setIsEnabled] = useState(enabled)

  useEffect(() => {
    setIsEnabled(enabled)
  }, [enabled])

  function handleToggle() {
    const nextValue = !isEnabled
    const previousValue = isEnabled

    setIsEnabled(nextValue)

    startTransition(async () => {
      const result = await toggleModulePremium(
        organizationId,
        moduleKey,
        nextValue
      )

      if (!result.success) {
        setIsEnabled(previousValue)
        toast.error(result.error)
        return
      }

      toast.success(
        nextValue
          ? `${label} activado para este cliente.`
          : `${label} desactivado para este cliente.`
      )
      router.refresh()
    })
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{label}</p>
          <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-zinc-300">
              {statusLabel}
            </span>
            {startDateLabel ? (
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-zinc-500">
                Desde {startDateLabel}
              </span>
            ) : (
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-zinc-500">
                Sin alta registrada
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={isEnabled}
          aria-label={`Alternar modulo ${label}`}
          disabled={isPending}
          onClick={handleToggle}
          className={[
            'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border transition-colors',
            isEnabled
              ? 'border-emerald-400/30 bg-emerald-400/20'
              : 'border-white/10 bg-white/5',
            isPending ? 'cursor-wait opacity-80' : 'cursor-pointer',
          ].join(' ')}
        >
          <span
            className={[
              'absolute left-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-[#090c12] text-zinc-400 transition-transform',
              isEnabled ? 'translate-x-6' : 'translate-x-0',
            ].join(' ')}
          >
            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          </span>
        </button>
      </div>
    </div>
  )
}
