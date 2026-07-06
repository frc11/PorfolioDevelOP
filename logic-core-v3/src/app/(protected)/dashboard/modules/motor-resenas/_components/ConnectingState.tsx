/**
 * P3-A.2 — Estado "conectando" del módulo motor-resenas: el cliente YA tiene el
 * módulo pero la conexión GBP todavía no está operativa (la hace develOP a mano;
 * cubre NOT_CONNECTED y CONNECTED_NO_LOCATION sin distinción — para el dueño es
 * la misma verdad y NO es un error suyo ni algo que tenga que resolver).
 *
 * Server-safe (sin 'use client', sin hooks) — molde: OnboardingStatusCard.
 * Reemplaza la card bespoke "GBP no conectado" que vivía dentro de ReviewsList.
 */
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function ConnectingState() {
  return (
    <div className="rounded-[24px] border border-cyan-500/[0.12] bg-cyan-500/[0.04] p-6 backdrop-blur-[20px] backdrop-saturate-[180%] sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-400/75">
          Conexión en curso
        </p>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          En curso
        </span>
      </div>

      <h2 className="mt-3 text-xl font-semibold leading-snug text-white">
        develOP está terminando de conectar tu Google
      </h2>

      <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
        Estamos dejando lista la conexión con tu perfil de Google Business. No tenés que
        hacer nada — te avisamos apenas esté funcionando y tus reseñas van a aparecer acá.
      </p>

      <div className="mt-6">
        <Link
          href="/dashboard/messages?context=gbp"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-300 transition-all hover:bg-cyan-400/15 hover:text-cyan-200"
        >
          Hablar con develOP
          <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}
