import Link from 'next/link'
import { CheckCircle2, CalendarClock, Hourglass, Pin } from 'lucide-react'
import { TEXTO_TURNO, type Turno } from '@/lib/leados/turno'

/**
 * LeadOS 2.1b — Estado "todo en espera": el setter TIENE leads pero ninguno está
 * en su cola de trabajo ahora (la cola `trabajar` quedó vacía). Es DISTINTO del
 * `HomeEmpty` (cero leads asignados): acá hay trabajo, solo que no en el foco —
 * está en vuelo, o el setter lo guardó él mismo (pausado/fijado). Server component
 * puro (sin interacción): presenta los conteos que ya calculó la page desde la
 * partición de la cartera.
 *
 * Los conteos en vuelo vienen desglosados POR TURNO (`turno.ts`). Es la única
 * pantalla que existe para decirle al setter a quién está esperando, y hasta P11
 * lo decía al revés: un solo contador «esperando respuesta» que incluía las
 * demos paradas en la cola de Franco (H-03 del manual). Un negocio, dos rótulos,
 * y el más grande era el equivocado.
 *
 * Las tres cuentas de abajo son disjuntas (partición). `fijados` acá son fijados
 * que NO son accionables (en vuelo o fijado+pausado): desde A-05 el fijado
 * ACCIONABLE ya es el foco (el pin ordena la cola, no la excluye), así que si esta
 * pantalla se muestra, ninguno de los fijados tenía nada para hacer ahora — pero
 * siguen contando para no afirmar "no hay leads activos" cuando sí los hay.
 *
 * Paleta NEUTRA a propósito (disciplina B9): el cyan queda para lo accionable, y
 * acá no hay nada que accionar.
 */
type HomeEnEsperaProps = {
  /** En vuelo, no accionables (seguimiento + revisión + agendadas), por turno. */
  enVueloPorTurno: Record<Turno, number>
  /** Pausados por el propio setter (snooze personal vigente). */
  pausados: number
  /** Fijados por el setter que NO son accionables (en vuelo) — A-05: el fijado
   * accionable ya es el foco, no llega a esta pantalla. */
  fijados: number
}

function plural(n: number, singular: string, plural: string): string {
  return n === 1 ? singular : plural
}

/** El turno propio primero: si algo quedó trabado de su lado, es lo que urge. */
const ORDEN_TURNOS: readonly Turno[] = ['setter', 'franco', 'negocio']

export function HomeEnEspera({ enVueloPorTurno, pausados, fijados }: HomeEnEsperaProps) {
  const enEspera = ORDEN_TURNOS.reduce((total, turno) => total + enVueloPorTurno[turno], 0)
  // Sin NADA activo solo si las tres cuentas son cero (todo lo demás es archivo).
  const sinNada = enEspera === 0 && pausados === 0 && fijados === 0
  const enVuelo = enEspera > 0

  return (
    <section aria-label="Nada para trabajar ahora" aria-live="polite">
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-6 py-10 text-center">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/10">
          <CheckCircle2 size={22} strokeWidth={1.5} aria-hidden className="text-emerald-400/80" />
        </span>

        <p className="text-sm font-semibold text-zinc-100">
          No hay nada para trabajar ahora mismo.
        </p>

        <p className="max-w-sm text-xs leading-relaxed text-zinc-500">
          {sinNada
            ? 'No tenés leads activos en este momento.'
            : enVueloPorTurno.setter > 0
              ? TEXTO_TURNO.setter.detalle
              : enVuelo
                ? 'Tu trabajo está en vuelo: el lead vuelve a tu foco cuando el negocio conteste, Franco resuelva lo suyo o se venza una postergación.'
                : 'Lo que tenés está guardado por vos — fijado o pausado; nada quedó en la cola para trabajar ahora.'}
        </p>

        {!sinNada && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {/* Un chip POR TURNO: a quién le toca es el dato, no cuántos hay. */}
            {ORDEN_TURNOS.filter((turno) => enVueloPorTurno[turno] > 0).map((turno) => (
              <span
                key={turno}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300"
              >
                <Hourglass size={12} strokeWidth={1.5} aria-hidden className="shrink-0 text-zinc-500" />
                <span className="tabular-nums">{enVueloPorTurno[turno]}</span>
                {TEXTO_TURNO[turno].chip}
              </span>
            ))}
            {fijados > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                <Pin size={12} strokeWidth={1.5} aria-hidden className="shrink-0 text-zinc-500" />
                <span className="tabular-nums">{fijados}</span>
                {plural(fijados, 'fijado por vos', 'fijados por vos')}
              </span>
            )}
            {pausados > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-zinc-300">
                <CalendarClock size={12} strokeWidth={1.5} aria-hidden className="shrink-0 text-zinc-500" />
                <span className="tabular-nums">{pausados}</span>
                {plural(pausados, 'pausado por vos', 'pausados por vos')}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-zinc-600">Tu cartera completa sigue disponible.</p>

        {/* Mientras no hay nada en la cola, adelantar trabajo propio SÍ tiene
            sentido. Link sobrio (no cyan): respeta la disciplina B9 — el acento
            queda para el foco accionable, no para una salida secundaria. */}
        <Link
          href="/setter/nuevo"
          className="mt-1 text-xs font-medium text-zinc-400 underline-offset-4 transition-colors hover:text-zinc-200 hover:underline"
        >
          ¿Querés adelantar? Cargá un prospecto nuevo
        </Link>
      </div>
    </section>
  )
}
