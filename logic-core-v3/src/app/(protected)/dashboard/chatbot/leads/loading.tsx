export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-12 w-1/3 rounded bg-zinc-900/40" />
      {/* Barra de filtros (contenedor glass) */}
      <div className="h-24 rounded-[28px] bg-zinc-900/40" />
      {/* Pipeline: 3 columnas por clasificación */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-[480px] rounded-[26px] bg-zinc-900/40" />
        ))}
      </div>
    </div>
  )
}
