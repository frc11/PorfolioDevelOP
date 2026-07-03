import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  PANTALLAS,
  PANTALLAS_CONSTRUCCION,
  rutaManual,
  type PantallaId,
  type PosicionManual,
} from '@/lib/leados/manual'

/**
 * Cabecera común de toda pantalla del manual: volver al lead + contexto de
 * dónde estoy (manual · negocio). El link vuelve al wizard clásico — el manual
 * es una ruta PARALELA, no lo reemplaza hasta el corte del Bloque 5.
 */
export function ManualHeader({
  leadId,
  businessName,
}: {
  leadId: string
  businessName: string
}) {
  return (
    <header className="space-y-2">
      <Link
        href={`/setter/leads/${leadId}`}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-300"
      >
        <ArrowLeft size={13} strokeWidth={1.5} aria-hidden />
        Volver al lead
      </Link>
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Manual paso a paso
        </p>
        <span aria-hidden className="text-zinc-700">
          ·
        </span>
        <p className="text-sm font-semibold text-zinc-300">{businessName}</p>
      </div>
    </header>
  )
}

/**
 * Navegación hacia atrás — SIEMPRE libre a pantallas completadas (contrato del
 * mapa): entrar a una completada no resetea nada, solo se mira/ajusta lo que
 * su pantalla permita. Sin completadas no se renderiza (lead recién arrancado).
 */
export function NavAtras({
  leadId,
  pasoActivo,
  posicion,
}: {
  leadId: string
  pasoActivo: PantallaId
  posicion: PosicionManual
}) {
  if (posicion.completadas.length === 0) return null

  return (
    <nav
      aria-label="Pantallas completadas — navegación libre hacia atrás"
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Completadas — podés volver cuando quieras
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-2">
        {posicion.completadas.map((id) => {
          const activo = id === pasoActivo
          return (
            <li key={id}>
              <Link
                href={rutaManual(leadId, id)}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                  activo
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200',
                )}
              >
                <Check size={11} strokeWidth={1.5} aria-hidden className="text-emerald-400/80" />
                {PANTALLAS[id].corto}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * El rail de las 6 fases de Construcción — navegación LIBRE entre todas, en
 * cualquier orden (auto-reporte, jamás gate: §6-3 del brief). Se muestra en
 * m7–m12 y en la reentrada M-R.
 */
export function NavConstruccion({
  leadId,
  pasoActivo,
  posicion,
}: {
  leadId: string
  pasoActivo: PantallaId
  posicion: PosicionManual
}) {
  return (
    <nav
      aria-label="Fases de la construcción — navegación libre"
      className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
        Construcción — navegación libre
      </p>
      <p className="mt-1 text-xs leading-relaxed text-zinc-600">
        Las seis fases son auto-reporte: entrá y salí en el orden que te sirva — ninguna
        bloquea a otra.
      </p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {PANTALLAS_CONSTRUCCION.map((id, index) => {
          const completada = posicion.completadas.includes(id)
          const activo = id === pasoActivo
          return (
            <li key={id}>
              <Link
                href={rutaManual(leadId, id)}
                aria-current={activo ? 'page' : undefined}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium transition-colors',
                  activo
                    ? 'border-cyan-400/50 bg-cyan-500/10 text-cyan-200'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-zinc-200',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'text-[10px] font-semibold',
                    activo ? 'text-cyan-300' : 'text-zinc-600',
                  )}
                >
                  {index + 1}
                </span>
                {PANTALLAS[id].corto}
                {completada && (
                  <Check
                    size={11}
                    strokeWidth={1.5}
                    aria-label="Fase marcada como hecha"
                    className="text-emerald-400/80"
                  />
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
