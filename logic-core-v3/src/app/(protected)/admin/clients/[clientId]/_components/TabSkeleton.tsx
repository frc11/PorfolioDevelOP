export function TabSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-20 rounded-2xl bg-white/[0.02]" />
        ))}
      </div>
      <div className="h-64 rounded-3xl bg-white/[0.02]" />
    </div>
  )
}
