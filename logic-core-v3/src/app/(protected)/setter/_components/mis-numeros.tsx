import { Scale } from 'lucide-react'
import type { MisNumeros as MisNumerosData } from '@/lib/leados/mis-numeros'

/**
 * "Mis números" — la cara propia de lo que el admin ya mide del setter: su ratio
 * descarte/avance. Solo lectura, no navega ni filtra. Mismo criterio sobrio que
 * "Tu semana": SIN ranking, SIN comparación, SIN la alarma "nunca descarta" (esa
 * es una lectura de gestión del admin — al setter se le muestra su número, no un
 * juicio). Reflexivo y secundario: vive al pie del panel.
 *
 * P21 — se fue la tarjeta "Leads activos" ("82 de 84 en tu cartera"). El panel
 * escribía CUATRO números de volumen de cartera —49 para trabajar, 84 en
 * cartera, 82 activos, y 84 de nuevo— y alcanzan dos. Esa tarjeta era los dos
 * que sobraban: repetía el total que el plegable de la cartera ya lleva al lado
 * del título, y su número propio ("activos") no habilita ninguna acción — no se
 * filtra por él, no lleva a ningún lado, y lo que lo separa del total son los
 * cerrados y perdidos, que el setter no trabaja. Los dos que quedan sí dicen
 * algo: cuántos hay PARA TRABAJAR (encabezado de la cola) y cuántos hay EN
 * CARTERA (plegable). El criterio de abajo no es un número de volumen: es la
 * proporción del propio filtro, y se explica en su tarjeta.
 */
export function MisNumeros({ numeros }: { numeros: MisNumerosData }) {
  // Sin evaluaciones no hay criterio que mostrar (el setter nuevo ve el empty
  // del panel, no un muro de ceros que culpe).
  if (numeros.criterio === null) return null

  const { criterio } = numeros

  return (
    <section aria-label="Mis números" className="space-y-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-600">
        Mis números
      </p>

      <div className="grid gap-3">
        {/* Mi criterio: descarte vs avance */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <Scale className="h-4 w-4 text-cyan-300/70" strokeWidth={1.5} aria-hidden />
            <span className="text-xs">Mi criterio · descarte vs avance</span>
          </div>

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
        </div>
      </div>
    </section>
  )
}
