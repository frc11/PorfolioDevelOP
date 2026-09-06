import Link from 'next/link'
import { Archive, ArrowRight } from 'lucide-react'
import type { ArchivoCausa } from '@/lib/leados/flow'
import type { PosicionManual } from '@/lib/leados/manual'
import { EnlacePantalla } from './enlace-pantalla'
import { FranjaRecorrido } from './franja-recorrido'
import { ManualHeader, type CabeceraLead } from './manual-nav'

type ArchivoManualProps = {
  leadId: string
  cabecera: CabeceraLead
  /** Por qué el lead cayó al archivo — misma causa que el home (`archivoCausaDe`). */
  causa: ArchivoCausa
  /** Motivo del cierre si quedó persistido (nota post-reunión de Franco). null si no. */
  motivo: string | null
  /**
   * D15-bis — ¿la pantalla del veredicto está alcanzable? La calcula la página
   * con la MISMA posición derivada que su guardia; sin eso el salto rebotaría
   * en silencio (contrato de `EnlacePantalla`).
   */
  veredictoAccesible: boolean
  /** La posición derivada — de acá sale la franja del recorrido (P20). */
  posicion: PosicionManual
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
export function ArchivoManual({
  leadId,
  cabecera,
  causa,
  motivo,
  veredictoAccesible,
  posicion,
}: ArchivoManualProps) {
  return (
    <div className="space-y-5">
      <ManualHeader cabecera={cabecera} />

      {/* P20 — la franja también acá, en el mismo lugar. En un negocio cerrado
          ningún paso es el actual y sólo lo hecho queda alcanzable, así que la
          franja muestra HASTA DÓNDE llegó este lead antes de cerrarse — que es
          la única pregunta que el archivo puede contestar. */}
      <FranjaRecorrido leadId={leadId} posicion={posicion} pantalla="archivo" />

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
          {/* D15-bis — el archivo pasó a recibir también los DESCARTADOS (antes
              aterrizaban en m2, la pantalla que pedía registrar el veredicto que
              ya estaba registrado). Los dos cierres no son el mismo: el descarte
              lo decidió el setter con su propio veredicto, y decirle que «lo
              decide Franco» sería mentirle sobre su propio trabajo. */}
          {causa === 'descartado'
            ? 'Lo descartaste en la evaluación — no hay nada que hacer acá.'
            : 'Se cerró sin avanzar — no hay nada que hacer acá. El cierre lo decide Franco.'}
        </p>

        {motivo && (
          <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
              {causa === 'descartado' ? 'Por qué lo descartaste' : 'Qué pasó'}
            </p>
            <p className="mt-1 max-w-xl whitespace-pre-line text-xs leading-relaxed text-zinc-300">
              {motivo}
            </p>
          </div>
        )}

        {/* D15-bis — el descartado aterrizaba en m2, que además de pedirle
            trabajo inexistente le mostraba el veredicto entero (score y
            razonamiento, no solo el motivo de una línea). El aterrizaje pasó al
            archivo; el veredicto sigue donde ahora vive —la ficha fusionada, que
            queda completada y navegable— y se nombra con `EnlacePantalla`, así
            el nombre sale del registro y el salto se declara en el invariante de
            enlaces en vez de descubrirse rebotando. */}
        {causa === 'descartado' && (
          <p className="mt-4 text-xs leading-relaxed text-zinc-500">
            El veredicto completo quedó en{' '}
            <EnlacePantalla
              leadId={leadId}
              destino="m1"
              accesible={veredictoAccesible}
            />
            .
          </p>
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
