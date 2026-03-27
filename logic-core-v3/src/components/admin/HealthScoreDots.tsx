export function HealthScoreDots({
  score,
  size = 'md',
}: {
  score: number
  size?: 'sm' | 'md'
}) {
  const dotSize = size === 'sm' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: 5 }, (_, index) => {
        const active = index < score
        return (
          <span
            key={index}
            className={`${dotSize} rounded-full border transition-colors`}
            style={{
              background: active ? 'rgba(34,211,238,0.9)' : 'rgba(255,255,255,0.06)',
              borderColor: active ? 'rgba(34,211,238,0.4)' : 'rgba(255,255,255,0.08)',
              boxShadow: active ? '0 0 10px rgba(34,211,238,0.25)' : 'none',
            }}
          />
        )
      })}
    </div>
  )
}
