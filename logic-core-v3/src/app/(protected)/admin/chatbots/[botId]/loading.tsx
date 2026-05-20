export default function BotDetailLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-3 w-28 bg-white/[0.04] rounded mb-3" />
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-2xl bg-white/[0.04]" />
          <div className="space-y-2">
            <div className="h-3 w-24 bg-white/[0.04] rounded" />
            <div className="h-6 w-48 bg-white/[0.06] rounded" />
            <div className="h-3 w-32 bg-white/[0.04] rounded" />
          </div>
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="border-b border-white/10 flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-4 py-3">
            <div className="h-4 w-20 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <div className="h-3 w-24 bg-white/[0.04] rounded" />
            <div className="h-7 w-16 bg-white/[0.06] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
