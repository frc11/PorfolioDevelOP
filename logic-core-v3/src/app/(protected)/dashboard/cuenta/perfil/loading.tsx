import { Skeleton } from '@/components/ui/Skeleton'

export default function PerfilLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* Header banner */}
      <Skeleton className="h-28 w-full rounded-3xl" />

      {/* 2 columnas: comparten altura (items-stretch) → mismo borde inferior */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-72 w-full rounded-3xl" />
          <Skeleton className="h-72 w-full rounded-3xl lg:flex-1" />
        </div>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-36 w-full rounded-3xl" />
          <Skeleton className="h-56 w-full rounded-3xl" />
          <Skeleton className="h-32 w-full rounded-3xl lg:flex-1" />
        </div>
      </div>

      {/* Zona de peligro — full-width */}
      <Skeleton className="h-32 w-full rounded-3xl" />
    </div>
  )
}
