'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Flame, LoaderCircle, TriangleAlert, UserRound } from 'lucide-react'
import { Select } from '@/components/ui'
import { cn } from '@/lib/utils'
import { assignLeadSetter } from '../_actions/lead.actions'

/** Espejo del `RatioResumen` de `@/lib/leados/setter-carga` (server-side). */
type SetterRatio = {
  evaluadas: number
  pctDescarte: number | null
  alarma: boolean
}

type SetterOption = {
  id: string
  label: string
  /** Leads activos (no terminales) asignados a este setter. */
  activos: number
  /** Ratio descarte/avance; null si todavía no evaluó nada. */
  ratio: SetterRatio | null
}

type AssignSetterControlProps = {
  leadId: string
  setters: SetterOption[]
  assignedToId: string | null
  /** admin-1b: estado actual del campo caliente (lo marca Franco a ojo — D4). */
  caliente: boolean
}

function formatActivos(activos: number): string {
  return `${activos} ${activos === 1 ? 'activo' : 'activos'}`
}

/**
 * B5 (LeadOS) — Control "Asignar a setter" del detalle de lead admin. La
 * asignación define qué leads ve el setter en su panel.
 */
export function AssignSetterControl({
  leadId,
  setters,
  assignedToId,
  caliente,
}: AssignSetterControlProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<string>(assignedToId ?? '')
  // admin-1b: la marca caliente de Franco — editable después de asignar.
  const [marcadoCaliente, setMarcadoCaliente] = useState(caliente)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [isPending, startTransition] = useTransition()

  // "dirty" = cambió la asignación O la marca caliente (para guardar solo el toggle).
  const dirty = selected !== (assignedToId ?? '') || marcadoCaliente !== caliente

  const handleSave = () => {
    setError(null)
    setSaved(false)
    startTransition(async () => {
      const result = await assignLeadSetter({
        leadId,
        setterId: selected === '' ? null : selected,
        caliente: marcadoCaliente,
      })
      if (!result.success) {
        setError(result.error)
        return
      }
      setSaved(true)
      router.refresh()
    })
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <UserRound className="h-4 w-4 text-zinc-500" />
        <h3 className="text-lg font-semibold text-white">Setter asignado</h3>
      </div>
      <p className="mt-2 text-sm leading-6 text-zinc-400">
        El lead aparece en el panel LeadOS del setter elegido.
      </p>

      {setters.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">
          No hay usuarios con rol setter todavía.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          <Select
            value={selected}
            onChange={(event) => {
              setSelected(event.target.value)
              setSaved(false)
              setError(null)
            }}
            disabled={isPending}
            aria-label="Setter asignado"
            options={[
              { value: '', label: 'Sin asignar' },
              ...setters.map((setter) => ({
                value: setter.id,
                label: `${setter.label} · ${formatActivos(setter.activos)}`,
              })),
            ]}
          />

          {/* Carga del equipo: para no asignar a ciegas. Reusa lo que ya se
              calcula en /admin/leados (carga viva + ratio descarte/avance). */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Carga del equipo
            </p>
            {setters.map((setter) => {
              const isAssigned = setter.id === assignedToId
              const tieneRatio = setter.ratio !== null && setter.ratio.evaluadas > 0
              return (
                <div
                  key={setter.id}
                  className={cn(
                    'flex items-center justify-between gap-3 rounded-2xl border px-3 py-2.5',
                    isAssigned
                      ? 'border-cyan-400/25 bg-cyan-400/[0.06]'
                      : 'border-white/10 bg-black/20',
                  )}
                >
                  <span className="truncate text-sm text-zinc-200">{setter.label}</span>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-zinc-300">
                      {formatActivos(setter.activos)}
                    </span>
                    {tieneRatio ? (
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium',
                          setter.ratio!.alarma
                            ? 'border-rose-400/25 bg-rose-500/10 text-rose-200'
                            : 'border-white/10 bg-white/5 text-zinc-400',
                        )}
                        title={
                          setter.ratio!.alarma
                            ? 'Nunca descarta con volumen suficiente — revisar criterio'
                            : `${setter.ratio!.evaluadas} evaluadas`
                        }
                      >
                        {setter.ratio!.alarma ? (
                          <TriangleAlert className="h-3 w-3" strokeWidth={1.5} aria-hidden />
                        ) : null}
                        {setter.ratio!.pctDescarte}% desc
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[11px] text-zinc-600">
                        sin evaluar
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* admin-1b: marca "caliente" — el criterio de Franco (D4), no el score.
              Prioriza el lead (orden) y habilita la demo preventiva. Editable
              después de asignar; NO toca el aislamiento (assignedToId). */}
          <button
            type="button"
            role="switch"
            aria-checked={marcadoCaliente}
            onClick={() => {
              setMarcadoCaliente((value) => !value)
              setSaved(false)
              setError(null)
            }}
            disabled={isPending}
            className={cn(
              'flex w-full items-center justify-between gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50',
              marcadoCaliente
                ? 'border-amber-400/30 bg-amber-500/[0.08]'
                : 'border-white/10 bg-black/20 hover:border-white/20',
            )}
          >
            <span className="flex items-center gap-2.5">
              <Flame
                className={cn('h-4 w-4 shrink-0', marcadoCaliente ? 'text-amber-300' : 'text-zinc-500')}
                strokeWidth={1.5}
                aria-hidden
              />
              <span className="flex flex-col">
                <span
                  className={cn(
                    'text-sm font-medium',
                    marcadoCaliente ? 'text-amber-100' : 'text-zinc-200',
                  )}
                >
                  Marcar como caliente
                </span>
                <span className="text-[11px] leading-tight text-zinc-500">
                  Tu criterio, no el score. Prioriza el lead y habilita la demo preventiva.
                </span>
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                marcadoCaliente ? 'bg-amber-400/80' : 'bg-white/15',
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  marcadoCaliente ? 'translate-x-[18px]' : 'translate-x-0.5',
                )}
              />
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || !dirty}
              className="inline-flex items-center gap-2 rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-100 transition-colors hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
              Guardar asignación
            </button>
            {saved && !dirty ? (
              <span className="text-xs text-emerald-300">Asignación guardada.</span>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </div>
      )}
    </section>
  )
}
