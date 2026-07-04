'use client'

/**
 * P3-A.2 — Superficie de VENTA del módulo motor-resenas (cliente sin el módulo).
 *
 * Reusa `requestUpsellAction` (P5.2) tal cual: el CTA llama la action SIN parámetro
 * de org (la deriva de la sesión — anti-IDOR estructural) y el pedido cae solo en
 * la tab Demanda del admin + ContactSubmission + webhook, con dedup 24h server-side.
 *
 * Success INLINE, sin navegación forzada: acá NO se usa `triggerTransition` (no
 * aplica en portales — CLAUDE.md) ni `router.push`; el link a mensajes es un <Link>.
 */
import { useState, useTransition } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Inbox,
  Loader2,
  Lock,
  PenLine,
  QrCode,
  Unlock,
} from 'lucide-react'
import { requestUpsellAction } from '@/lib/actions/upsell'

/**
 * Slug + nombre EXACTOS del catálogo (`premium-modules.ts`): así el pedido cae en
 * la tab Demanda del admin y dedupea con el mismo criterio que la vitrina.
 */
const MODULE_SLUG = 'motor-resenas'
const MODULE_NAME = 'Motor de Reseñas Automático'

const MESSAGES_HREF = `/dashboard/messages?${new URLSearchParams({
  context: 'modulo',
  moduleName: MODULE_NAME,
}).toString()}`

/** Features REALES de la vista operativa — sin números inventados ni promesas de más. */
const FEATURES = [
  { icon: Inbox, text: 'Todas tus reseñas en un solo lugar, con las que faltan responder primero' },
  { icon: PenLine, text: 'Cada reseña con un borrador de respuesta listo para aprobar y publicar' },
  { icon: QrCode, text: 'Un QR y un link listos para pedirle la reseña a tus clientes' },
] as const

interface LockedViewProps {
  /** La org ya pidió el módulo antes (`OrganizationModule.upsellRequestCount > 0`). */
  alreadyRequested: boolean
  /** Tenencia PAUSADA: no se vende lo que ya se tiene — estado honesto aparte. */
  isPaused: boolean
}

export function LockedView({ alreadyRequested, isPaused }: LockedViewProps) {
  const [reqStatus, setReqStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const justRequested = reqStatus === 'success'
  const requested = alreadyRequested || justRequested

  const submitRequest = () => {
    if (isPending || requested) return

    setErrorMsg(null)
    startTransition(async () => {
      const result = await requestUpsellAction(MODULE_SLUG, MODULE_NAME)

      if (result.success) {
        setReqStatus('success')
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

  if (isPaused) {
    return (
      <div className="rounded-[24px] border border-amber-400/[0.14] bg-amber-500/[0.04] p-6 backdrop-blur-[20px] backdrop-saturate-[180%] sm:p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-amber-300/75">
          Módulo pausado
        </p>
        <h2 className="mt-3 text-xl font-semibold leading-snug text-white">
          Tu Motor de Reseñas está pausado
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
          Lo tenés contratado, pero está en pausa. Hablá con develOP para reactivarlo y
          volver a responder tus reseñas desde acá.
        </p>
        <div className="mt-5">
          <Link
            href={MESSAGES_HREF}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-300 transition-all hover:bg-amber-400/15 hover:text-amber-200"
          >
            Hablar con develOP
            <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-[24px] border border-white/10 bg-white/[0.02] p-6 backdrop-blur-[20px] backdrop-saturate-[180%] sm:p-8"
    >
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300">
        <Lock size={11} strokeWidth={1.5} aria-hidden="true" />
        Módulo premium
      </span>

      <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
        Tus reseñas de Google, sin perseguir a nadie
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        El Motor de Reseñas junta todas tus reseñas en un solo lugar, te prepara la
        respuesta de cada una y te ayuda a pedir nuevas. Vos aprobás, él se encarga del
        resto.
      </p>

      <ul className="mt-6 space-y-3">
        {FEATURES.map((feature, index) => (
          <motion.li
            key={feature.text}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-start gap-3"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-amber-300">
              <feature.icon size={15} strokeWidth={1.5} aria-hidden="true" />
            </span>
            <span className="text-sm leading-relaxed text-zinc-300">{feature.text}</span>
          </motion.li>
        ))}
      </ul>

      {/* Pricing no cerrado: [FALTA:precio] queda VISIBLE a propósito (mandato P3-A.2).
          NO reemplazar por priceMonthlyUsd del catálogo hasta que se cierre el precio. */}
      <p className="mt-6 text-sm text-zinc-400">
        Precio: <span className="font-semibold text-amber-300">[FALTA:precio]</span> /mes
      </p>

      <div className="mt-5">
        <AnimatePresence mode="wait">
          {requested ? (
            <motion.div
              key="requested"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4"
            >
              <p className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                <CheckCircle2 size={15} strokeWidth={1.5} aria-hidden="true" />
                {justRequested ? 'Listo — develOP ya lo sabe' : 'Ya pediste este módulo'}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-400">
                develOP te va a contactar para activarlo. Si querés sumar algo, escribinos.
              </p>
              <Link
                href={MESSAGES_HREF}
                className="mt-3 inline-flex min-h-[32px] items-center gap-1.5 text-xs font-medium text-emerald-300 transition hover:text-emerald-200"
              >
                Hablar con develOP
                <ArrowRight size={12} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <motion.button
                onClick={submitRequest}
                disabled={isPending}
                whileTap={!isPending ? { scale: 0.97 } : undefined}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 overflow-hidden rounded-xl border border-amber-400/25 bg-amber-400/10 px-5 py-2.5 text-sm font-semibold text-amber-300 transition-all duration-300 hover:bg-amber-400/15 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
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
                      <Loader2 size={14} strokeWidth={1.5} className="animate-spin" aria-hidden="true" />
                      Enviando solicitud...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="flex items-center gap-2"
                    >
                      <Unlock size={14} strokeWidth={1.5} aria-hidden="true" />
                      Pedir este módulo
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <Link
                href={MESSAGES_HREF}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06]"
              >
                Hablar con develOP
                <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {errorMsg && (
          <p role="alert" className="mt-3 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle size={13} strokeWidth={1.5} aria-hidden="true" />
            {errorMsg}
          </p>
        )}
      </div>
    </motion.div>
  )
}
