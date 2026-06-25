export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      {/* Summary Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex h-[150px] flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-5"
          >
            <div className="flex items-start justify-between">
              <div className="h-3 w-20 rounded bg-white/5" />
              <div className="h-7 w-7 rounded-md border border-white/10 bg-white/[0.04]" />
            </div>
            <div className="space-y-3">
              <div className="h-8 w-28 rounded bg-white/10" />
              <div className="h-3 w-16 rounded bg-white/5" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Chart Skeleton */}
      <div className="relative h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-10 flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-white/5" />
            <div className="h-5 w-48 rounded bg-white/10" />
          </div>
        </div>

        {/* Mocking the chart lines with blurred bars.
            Alturas DETERMINÍSTICAS (no Math.random): un patrón estable evita el
            hydration mismatch entre el HTML del server y el primer render del cliente. */}
        <div className="absolute inset-x-6 bottom-6 top-28 flex items-end gap-2">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-t-sm bg-white/[0.03]"
              style={{ height: `${28 + ((i * 41) % 53)}%` }}
            />
          ))}
        </div>
      </div>

      {/* List Skeleton (for Top Pages) */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <div className="mb-8 h-5 w-48 rounded bg-white/10" />
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                  <div className="h-3 w-4 rounded bg-white/5" />
                  <div className="h-4 w-40 rounded bg-white/10" />
                </div>
                <div className="h-4 w-12 rounded bg-white/10" />
              </div>
              <div className="h-2 w-full rounded-full bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
