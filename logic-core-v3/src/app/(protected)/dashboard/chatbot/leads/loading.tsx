export default function Loading() {
  return (
    <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
      <div className="h-10 bg-zinc-900/40 rounded w-1/3" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-zinc-900/40 rounded-lg" />
        ))}
      </div>
    </div>
  )
}
