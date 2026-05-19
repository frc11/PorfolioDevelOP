export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-zinc-900/40 rounded w-1/4" />
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-zinc-900/40 rounded w-1/3" />
            <div className="h-10 bg-zinc-900/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
