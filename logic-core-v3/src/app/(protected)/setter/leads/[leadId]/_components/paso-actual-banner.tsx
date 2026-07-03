import { cn } from '@/lib/utils'
import type { FocoDescriptor, FocoTono } from '@/lib/leados/paso'

const TONO_STYLES: Record<
  FocoTono,
  { container: string; bar: string; eyebrow: string; icon: string; detalle: string }
> = {
  foco: {
    container: 'border-cyan-400/25 bg-cyan-500/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)]',
    bar: 'bg-cyan-400/80',
    eyebrow: 'text-cyan-300/80',
    icon: 'text-cyan-300',
    detalle: 'text-cyan-100/70',
  },
  // espera/cerrado: texto en zinc-400 (≈7.9:1 sobre el fondo) — zinc-500 no llega al
  // 4.5:1 de WCAG AA para texto chico. El cyan queda reservado a lo accionable.
  espera: {
    container: 'border-white/10 bg-white/[0.03]',
    bar: 'bg-zinc-500/60',
    eyebrow: 'text-zinc-400',
    icon: 'text-zinc-400',
    detalle: 'text-zinc-400',
  },
  cerrado: {
    container: 'border-white/10 bg-white/[0.02]',
    bar: 'bg-zinc-600/60',
    eyebrow: 'text-zinc-400',
    icon: 'text-zinc-400',
    detalle: 'text-zinc-400',
  },
}

/**
 * Cartel de dirección del wizard: arriba de todo (bajo el rail), le dice al setter
 * QUÉ está pasando con ESTE lead AHORA, en una línea. Solo presentación — el
 * descriptor viene de `derivarPasoDelLead` (A-29, `@/lib/leados/paso`), la única
 * derivación del paso, llamada una vez por el shell.
 */
export function PasoActualBanner({ foco }: { foco: FocoDescriptor }) {
  const styles = TONO_STYLES[foco.tono]
  const Icon = foco.icon

  return (
    <section
      aria-label="Tu paso ahora en este lead"
      className={cn('relative overflow-hidden rounded-2xl border p-4', styles.container)}
    >
      {/* Acento al borde izquierdo — rima con el marco del step activo (mismo tono). */}
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1', styles.bar)} />

      <p
        className={cn(
          'inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.18em]',
          styles.eyebrow,
        )}
      >
        <Icon size={13} strokeWidth={1.5} aria-hidden className={cn('shrink-0', styles.icon)} />
        {foco.eyebrow}
      </p>

      <p className="mt-1.5 text-base font-bold leading-snug tracking-tight text-zinc-100 sm:text-lg">
        {foco.titulo}
      </p>

      <p className={cn('mt-1 max-w-xl text-xs leading-relaxed', styles.detalle)}>{foco.detalle}</p>
    </section>
  )
}
