'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Copy, Gift, Link2, Loader2 } from 'lucide-react'
import { buildReferralLink } from '@/lib/referrals/code'
import { generateMyReferralCodeAction } from '@/lib/actions/referrals'

function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard bloqueado (permiso/https): no rompemos, el valor sigue visible para copiar a mano.
    }
  }
  return { copied, copy }
}

export function ReferralPanel({
  initialCode,
  baseUrl,
}: {
  initialCode: string | null
  baseUrl: string
}) {
  const router = useRouter()
  const [code, setCode] = useState<string | null>(initialCode)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const linkCopy = useCopy()
  const codeCopy = useCopy()

  const origin = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '')
  const link = code && origin ? buildReferralLink(origin, code) : null

  const handleGenerate = () => {
    setError(null)
    startTransition(async () => {
      const result = await generateMyReferralCodeAction()
      if (!result.success || !result.data) {
        setError(result.error ?? 'No se pudo generar tu código.')
        return
      }
      setCode(result.data.code)
      router.refresh()
    })
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/10 text-violet-300">
          <Gift size={18} strokeWidth={1.5} />
        </span>
        <div>
          <h2 className="text-base font-semibold text-white">Recomendá develOP y ganá</h2>
          <p className="text-sm text-zinc-500">
            Por cada negocio que recomiendes y contrate un plan, te bonificamos un mes.
          </p>
        </div>
      </div>

      {code ? (
        <div className="mt-5 space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Tu código</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-lg font-semibold tracking-widest text-white">
                {code}
              </code>
              <button
                type="button"
                onClick={() => codeCopy.copy(code)}
                aria-label="Copiar código"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                {codeCopy.copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {link ? (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-zinc-500">Tu link para compartir</p>
              <div className="flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <Link2 size={14} strokeWidth={1.5} className="flex-shrink-0 text-zinc-500" />
                  <span className="truncate text-sm text-zinc-300">{link}</span>
                </div>
                <button
                  type="button"
                  onClick={() => linkCopy.copy(link)}
                  className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-3 text-sm font-medium text-violet-100 transition-colors hover:bg-violet-400/15"
                >
                  {linkCopy.copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} strokeWidth={1.5} />}
                  {linkCopy.copied ? 'Copiado' : 'Copiar link'}
                </button>
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs leading-6 text-zinc-500">
            Compartí tu link o código. Cuando el negocio referido nos contacta y contrata un plan, develOP
            confirma la conversión y te acredita el mes bonificado.
          </div>
        </div>
      ) : (
        <div className="mt-5">
          {error ? (
            <p className="mb-3 text-sm text-rose-300">{error}</p>
          ) : null}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-400/20 bg-violet-400/10 px-4 py-2.5 text-sm font-medium text-violet-100 transition-colors hover:bg-violet-400/15 disabled:opacity-50"
          >
            {isPending ? <Loader2 size={15} className="animate-spin" /> : <Gift size={15} strokeWidth={1.5} />}
            {isPending ? 'Generando...' : 'Generá tu código'}
          </button>
        </div>
      )}
    </section>
  )
}
