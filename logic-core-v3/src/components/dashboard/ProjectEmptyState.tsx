'use client'

import { FolderKanban } from 'lucide-react'
import Link from 'next/link'

/**
 * Empty "proyecto sin tareas" — hand-rolled (A7.6).
 *
 * Antes consumía `EmptyState` (ui/*, FROZEN). Ese primitivo hornea un glow
 * `bg-cyan-500/[0.08]` detrás del contenedor del ícono que, sobre el glow verde
 * ambiente del shell del dashboard, lee teal — y NO es override-able por
 * className (la className llega al wrapper externo, no al cuadradito del ícono).
 * Como ui/* es frozen, en vez de tocarlo se hand-rollea acá (archivo propio) el
 * mismo layout/copy/CTA con el contenedor del ícono en TRANSPARENTE (sin fondo de
 * color, borde neutro). El ícono y el copy quedan igual. El fade de entrada lo
 * aporta el `<FadeIn>` padre en page.tsx, por eso no hace falta motion acá.
 */
export function ProjectEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-12 text-center">
      {/* Contenedor del ícono: forma redondeada + borde neutro, SIN fondo de color
          (transparente). Sin el glow cyan del primitivo → no lee teal. */}
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 text-zinc-500">
        <FolderKanban size={20} strokeWidth={1.5} />
      </div>

      <h3 className="text-base font-semibold text-zinc-300">
        develOP está armando tu hoja de ruta
      </h3>
      <p className="mt-1 max-w-sm text-xs leading-relaxed text-zinc-600">
        Cuando el equipo asigne tareas y entregables a tu proyecto, los vas a ver acá.
        Recibís una notificación al iniciar la actividad.
      </p>

      <div className="mt-5">
        <Link
          href="/dashboard/messages?context=proyecto"
          className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400/15 px-5 py-2.5 text-sm text-cyan-300 transition-colors hover:bg-cyan-400/25"
        >
          Hablar con el equipo
        </Link>
      </div>
    </div>
  )
}
