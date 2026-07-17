import Link from 'next/link'
import { Archive, ArrowRight } from 'lucide-react'
import type { ArchivoCausa } from '@/lib/leados/flow'
import { ManualHeader, type CabeceraLead } from './manual-nav'

type ArchivoManualProps = {
  cabecera: CabeceraLead
  /** Por qué el lead cayó al archivo — misma causa que el home (`archivoCausaDe`). */
  causa: ArchivoCausa
  /** Motivo del cierre si quedó persistido (nota post-reunión de Franco). null si no. */
  motivo: string | null
}

const CAUSA_LABEL: Record<ArchivoCausa, string> = {
  perdido: 'Perdido',
  descartado: 'Descartado',
}

/**
 * 2.3 (B-02) — La vista de ARCHIVO del manual: un lead terminal por status
 * (PERDIDO) ya no deriva a trabajo. Espejo de las pantallas de estado
 * (espera/revisión) pero de cierre: tono zinc, cero forms, cero acciones de
 * toque. Muestra qué pasó (causa + motivo persistido si lo hay) y una única
 * salida — seguir con el próximo. Solo presenta: el cierre lo escribió el motor
 * (lo decide Franco), acá no se transiciona nada.
 */
export function ArchivoManual({ cabecera, causa, motivo }: ArchivoManualProps) {
  return (
    <div className="space-y-5">
      <ManualHeader cabecera={cabecera} />

      <section
        aria-label="Negocio cerrado"
        className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5"
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-zinc-500/60" />
        <p className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-400">
          <Archive size={13} strokeWidth={1.5} aria-hidden className="shrink-0" />
          Archivo — {CAUSA_LABEL[causa]}
        </p>
        {/* h2: con el corte 5.6 el h1 de la página es el negocio (cabecera). */}
        <h2 className="mt-2 text-xl font-black leading-tight tracking-tight text-zinc-100 sm:text-2xl">
          Este negocio quedó cerrado
        </h2>
        <p className="mt-1.5 max-w-xl text-xs leading-relaxed text-zinc-400">
          Se cerró sin avanzar — no hay nada que hacer acá. El cierre lo decide Franco.
        </p>

        {motivo && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              Qué pasó
            </p>
            <p className="mt-1 max-w-xl whitespace-pre-line text-xs leading-relaxed text-zinc-300">
              {motivo}
            </p>
          </div>
        )}

        <Link
          href="/setter"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:bg-white/[0.08] hover:text-zinc-100"
        >
          Seguí con el próximo
          <ArrowRight size={12} strokeWidth={1.5} aria-hidden />
        </Link>
      </section>
    </div>
  )
}
