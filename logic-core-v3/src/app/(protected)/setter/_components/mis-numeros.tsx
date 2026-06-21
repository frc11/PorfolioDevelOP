import { Layers, Scale } from 'lucide-react'
import type { MisNumeros as MisNumerosData } from '@/lib/leados/mis-numeros'

/**
 * "Mis números" — la cara propia de lo que el admin ya mide del setter: sus leads
 * activos y su ratio descarte/avance. Solo lectura, no navega ni filtra. Mismo
 * criterio sobrio que "Tu semana": SIN ranking, SIN comparación, SIN la alarma
 * "nunca descarta" (esa es una lectura de gestión del admin — al setter se le
 * muestra su número, no un juicio). Reflexivo y secundario: vive al pie del home.
 */
export function MisNumeros({ numeros }: { numeros: MisNumerosData }) {
  // Cartera vacía y sin evaluaciones: nada que mostrar (el setter nuevo ve el
  // empty del home, no un muro de ceros que culpe).
  if (numeros.enCartera === 0 && numeros.criterio === null) return null

  const { activos, enCartera, criterio } = numeros

  return (
    <section aria-label="Mis números" className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
        Mis números
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {/* Leads activos en la cartera */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Layers className="h-4 w-4 text-cyan-300/70" strokeWidth={1.5} aria-hidden />
            <span className="text-xs">Leads activos</span>
          </div>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-semibold tabular-nums text-zinc-100">{activos}</span>
            <span className="text-xs text-zinc-500">
              de {enCartera} en tu cartera
            </span>
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-zinc-600">
            Lo que está vivo ahora — sin los cerrados ni los perdidos.
          </p>
        </div>

        {/* Mi criterio: descarte vs avance */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Scale className="h-4 w-4 text-cyan-300/70" strokeWidth={1.5} aria-hidden />
            <span className="text-xs">Mi criterio · descarte vs avance</span>
          </div>

          {criterio === null ? (
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Todavía no evaluaste leads. Acá vas a ver tu ratio de descarte una vez
              que pases alguno por el Evaluador.
            </p>
          ) : (
            <div className="mt-2 space-y-2.5">
              <p className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold tabular-nums text-zinc-100">
                  {criterio.total.evaluadas}
                </span>
                <span className="text-xs text-zinc-500">
                  {criterio.total.evaluadas === 1 ? 'evaluada' : 'evaluadas'}
                  {criterio.pctTotal !== null ? (
                    <span className="text-zinc-400"> · {criterio.pctTotal}% descarte</span>
                  ) : null}
                </span>
              </p>

              {/* Proporción descarte/avance — barra estática, sin animación. */}
              {criterio.total.evaluadas > 0 ? (
                <div
                  className="flex h-1.5 overflow-hidden rounded-full bg-white/[0.06]"
                  role="img"
                  aria-label={`${criterio.total.descartadas} descartes y ${criterio.total.avanzadas} avances`}
                >
                  <span
                    className="h-full bg-zinc-500/60"
                    style={{
                      width: `${(criterio.total.descartadas / criterio.total.evaluadas) * 100}%`,
                    }}
                  />
                  <span className="h-full flex-1 bg-cyan-400/50" />
                </div>
              ) : null}

              <p className="text-xs text-zinc-400">
                {criterio.total.descartadas} descartes · {criterio.total.avanzadas} avances
              </p>

              <p className="text-[11px] text-zinc-600">
                Últimos 30 días: {criterio.ultimos30d.evaluadas} evaluadas
                {criterio.pct30d !== null ? ` · ${criterio.pct30d}% descarte` : ''}
              </p>

              {criterio.sinFecha > 0 ? (
                <p className="text-[11px] text-zinc-700">
                  {criterio.sinFecha} sin fecha — cuentan en el total, no en los 30 días.
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
