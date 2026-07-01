import type { PremiumModuleStatus } from '@prisma/client'
import { Building2, ChevronDown, PackageSearch, Sparkles } from 'lucide-react'
import type { SerializedModuleDemand } from '@/lib/modules/demand'

const STATUS_BADGE: Record<PremiumModuleStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Disponible', cls: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300' },
  COMING_SOON: { label: 'Próximamente', cls: 'border-amber-400/25 bg-amber-500/10 text-amber-200' },
  DEPRECATED: { label: 'Discontinuado', cls: 'border-white/10 bg-white/5 text-zinc-400' },
}

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Ranking de demanda de módulos (P5.2) — presentacional, Server Component.
 *
 * Lee la lista ya rankeada (más orgs distintas primero) y la muestra de forma legible
 * y no efímera: cada módulo con cuántas organizaciones lo pidieron, cuántas solicitudes
 * en total y su última solicitud. Cada fila expande (nativo `<details>`, cero JS) el
 * detalle de qué organizaciones lo pidieron. Los COMING_SOON son la señal clave: qué
 * construir después.
 */
export function ModuleDemandTable({ demand }: { demand: SerializedModuleDemand[] }) {
  if (demand.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[28px] border border-white/10 bg-white/5 p-10 text-center backdrop-blur-xl">
        <PackageSearch size={28} strokeWidth={1.5} className="text-zinc-500" />
        <p className="text-sm font-medium text-zinc-300">Todavía no hay demanda registrada</p>
        <p className="max-w-md text-xs leading-6 text-zinc-500">
          Cuando un cliente pida activar un módulo o toque &ldquo;avisame cuando esté&rdquo; en uno
          próximamente, vas a ver acá qué se pide y quién lo pide.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
        <Sparkles size={13} strokeWidth={1.5} className="text-cyan-400" />
        Demanda medida · {demand.length} {demand.length === 1 ? 'módulo pedido' : 'módulos pedidos'}
      </div>

      {demand.map((module, index) => {
        const badge = STATUS_BADGE[module.status]
        return (
          <details
            key={module.moduleId}
            className="group overflow-hidden rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl"
          >
            <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-sm font-semibold tabular-nums text-zinc-300">
                {index + 1}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-white">{module.name}</h3>
                  <span
                    className={`inline-flex flex-shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${badge.cls}`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  Última solicitud: {formatDate(module.lastRequestedAt)}
                </p>
              </div>

              <div className="flex flex-shrink-0 items-center gap-5">
                <div className="text-right">
                  <p className="text-lg font-semibold tabular-nums text-white">{module.distinctOrgs}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">
                    {module.distinctOrgs === 1 ? 'cliente' : 'clientes'}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-lg font-semibold tabular-nums text-zinc-300">{module.totalRequests}</p>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-zinc-500">solicitudes</p>
                </div>
                <ChevronDown
                  size={18}
                  strokeWidth={1.5}
                  className="text-zinc-500 transition-transform duration-200 group-open:rotate-180"
                />
              </div>
            </summary>

            <div className="border-t border-white/10 bg-black/20 px-5 py-4">
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Quién lo pidió
              </p>
              <ul className="space-y-2">
                {module.organizations.map((org) => (
                  <li
                    key={org.organizationId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <Building2 size={14} strokeWidth={1.5} className="flex-shrink-0 text-zinc-500" />
                      <span className="truncate text-sm text-zinc-200">{org.organizationName}</span>
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-4 text-xs text-zinc-500">
                      <span className="tabular-nums">
                        {org.requestCount} {org.requestCount === 1 ? 'solicitud' : 'solicitudes'}
                      </span>
                      <span className="tabular-nums">{formatDate(org.lastRequestedAt)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </details>
        )
      })}
    </div>
  )
}
