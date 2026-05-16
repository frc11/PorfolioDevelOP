export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-zinc-900/40 rounded w-1/4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-zinc-900/40 rounded w-1/5" />
          <div className="h-32 bg-zinc-900/40 rounded" />
        </div>
      ))}
    </div>
  )
}
